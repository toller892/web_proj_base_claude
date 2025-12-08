const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://iigygnznpjjnqcqvdmuo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZ3lnbnpucGpqbnFjcXZkbXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODYxMTgsImV4cCI6MjA3OTU2MjExOH0.wg5kAvv1FxT3Uiu2AhP4uRjY2bOsIHzf7RbTxzCN2_Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixDatabaseIssues() {
  console.log('=== 修复数据库问题 ===\n');

  console.log('请在 Supabase SQL Editor 中依次执行以下 SQL：');

  console.log('\n📋 第一步：修复 inventory_settings 表');
  console.log('```sql');
  console.log(`
-- 删除可能损坏的表（如果存在）
DROP TABLE IF EXISTS inventory_settings CASCADE;

-- 重新创建 inventory_settings 表
CREATE TABLE inventory_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_name TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 授权给所有用户
GRANT ALL ON inventory_settings TO anon;
GRANT ALL ON inventory_settings TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE inventory_settings_id_seq TO anon;
GRANT USAGE, SELECT ON SEQUENCE inventory_settings_id_seq TO authenticated;

-- 插入默认设置
INSERT INTO inventory_settings (setting_name, setting_value, description) VALUES
('total_inventory_value', '0', '手动设置的总库存价值（分为单位）'),
('use_manual_total_value', 'false', '是否使用手动设置的总价值而不是自动计算');

-- 添加注释
COMMENT ON TABLE inventory_settings IS '库存设置表，用于存储各种库存相关的配置';
  `);
  console.log('```');

  console.log('\n📋 第二步：确保 products 表有正确的结构');
  console.log('```sql');
  console.log(`
-- 添加 value_multiplier 字段（如果不存在）
ALTER TABLE products
ADD COLUMN IF NOT EXISTS value_multiplier DECIMAL(3,2) DEFAULT 1.0;

-- 确保所有必需字段都存在
ALTER TABLE products
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT;

-- 确保正确的权限
GRANT ALL ON products TO anon;
GRANT ALL ON products TO authenticated;

-- 添加注释
COMMENT ON COLUMN products.value_multiplier IS '价值倍数，用于计算该商品在总库存中的价值权重';
  `);
  console.log('```');

  console.log('\n📋 第三步：强制刷新 PostgREST schema cache');
  console.log('```sql');
  console.log(`
-- 强制刷新 schema cache
NOTIFY pgrst, 'reload schema';

-- 等待几秒钟让缓存刷新
SELECT pg_sleep(2);
  `);
  console.log('```');

  console.log('\n📋 第四步：验证表是否正确创建');
  console.log('```sql');
  console.log(`
-- 验证 inventory_settings 表
SELECT table_name, table_type
FROM information_schema.tables
WHERE table_schema = 'public' AND table_name = 'inventory_settings';

-- 验证表权限
SELECT grantee, privilege_type
FROM information_schema.role_table_grants
WHERE table_name = 'inventory_settings' AND table_schema = 'public';
  `);
  console.log('```');

  console.log('\n⚠️  重要提醒：');
  console.log('1. 依次执行以上所有SQL语句');
  console.log('2. 每个步骤完成后等待几秒钟');
  console.log('3. 如果遇到错误，请确保每个步骤都成功执行');
  console.log('4. 执行完所有SQL后，等待1-2分钟让 PostgREST 重新加载');

  console.log('\n现在测试数据库连接...');

  // 测试连接
  try {
    const { data, error } = await supabase
      .from('products')
      .select('count', { count: 'exact' })
      .limit(1);

    if (error) {
      console.log('❌ products 表连接失败:', error.message);
    } else {
      console.log('✅ products 表连接正常');
    }
  } catch (e) {
    console.log('❌ 数据库连接测试失败:', e.message);
  }

  console.log('\n=== SQL修复脚本准备完成 ===');
}

fixDatabaseIssues();