const { createClient } = require('@supabase/supabase-js');

// 使用配置的值
const supabaseUrl = 'https://iigygnznpjjnqcqvdmuo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZ3lnbnpucGpqbnFjcXZkbXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODYxMTgsImV4cCI6MjA3OTU2MjExOH0.wg5kAvv1FxT3Uiu2AhP4uRjY2bOsIHzf7RbTxzCN2_Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixInventorySettingsTable() {
  try {
    console.log('=== 修复 inventory_settings 表问题 ===');

    // 1. 先测试表是否真的存在
    console.log('\n1. 测试表是否存在...');

    // 使用 service role key 来执行 SQL (这里我们只能用 anon key 做测试)
    console.log('\n请在 Supabase SQL Editor 中执行以下 SQL 来修复问题:');
    console.log('```sql');
    console.log(`
-- 1. 确保表存在并有正确的结构
CREATE TABLE IF NOT EXISTS inventory_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_name TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 授权给 anon 和 authenticated 用户 (非常重要！)
GRANT ALL ON inventory_settings TO anon;
GRANT ALL ON inventory_settings TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE inventory_settings_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE inventory_settings_id_seq TO authenticated;

-- 3. 插入默认设置
INSERT INTO inventory_settings (setting_name, setting_value, description) VALUES
('total_inventory_value', '0', '手动设置的总库存价值（分为单位）'),
('use_manual_total_value', 'false', '是否使用手动设置的总价值而不是自动计算')
ON CONFLICT (setting_name) DO NOTHING;

-- 4. 为 products 表添加价值倍数字段
ALTER TABLE products
ADD COLUMN IF NOT EXISTS value_multiplier DECIMAL(3,2) DEFAULT 1.0;

-- 5. 确保products表也有正确的权限
GRANT ALL ON products TO anon;
GRANT ALL ON products TO authenticated;

-- 6. 刷新 PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- 7. 添加表注释
COMMENT ON TABLE inventory_settings IS '库存设置表，用于存储各种库存相关的配置';
COMMENT ON COLUMN products.value_multiplier IS '价值倍数，用于计算该商品在总库存中的价值权重';
    `);
    console.log('```');

    console.log('\n执行完 SQL 后，等待几秒钟让 schema cache 刷新...');

    // 等待一下让用户执行 SQL
    console.log('\n按 Enter 键继续测试...');
    await new Promise(resolve => process.stdin.once('data', resolve));

    // 2. 测试表是否能正常访问
    console.log('\n2. 测试表访问...');
    const { data, error } = await supabase
      .from('inventory_settings')
      .select('*')
      .limit(1);

    if (error) {
      console.error('   ✗ 表访问失败:', error.message);
      console.error('   错误代码:', error.code);

      if (error.code === 'PGRST205') {
        console.log('\n   这表示 schema cache 中还没有这个表。');
        console.log('   请确保已经执行了上面的 SQL，特别是 "NOTIFY pgrst, \'reload schema\'";');
        console.log('   如果还是不行，可能需要在 Supabase 控制台中重启 PostgREST 服务。');
      }
    } else {
      console.log('   ✓ 表访问成功');
      console.log('   数据:', data);
    }

    // 3. 测试 upsert 操作
    console.log('\n3. 测试 upsert 操作...');
    const { data: upsertData, error: upsertError } = await supabase
      .from('inventory_settings')
      .upsert({
        setting_name: 'test_setting',
        setting_value: 'test_value',
        description: '测试设置'
      })
      .select();

    if (upsertError) {
      console.error('   ✗ Upsert 失败:', upsertError.message);
    } else {
      console.log('   ✓ Upsert 成功');
      console.log('   数据:', upsertData);

      // 清理测试数据
      await supabase
        .from('inventory_settings')
        .delete()
        .eq('setting_name', 'test_setting');
      console.log('   ✓ 测试数据已清理');
    }

    console.log('\n=== 修复完成 ===');

  } catch (error) {
    console.error('修复过程中发生错误:', error);
  }
}

// 启用标准输入
process.stdin.resume();
fixInventorySettingsTable();