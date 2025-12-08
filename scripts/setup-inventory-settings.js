const { createClient } = require('@supabase/supabase-js');

// 直接使用配置的值
const supabaseUrl = 'https://iigygnznpjjnqcqvdmuo.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZ3lnbnpucGpqbnFjcXZkbXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODYxMTgsImV4cCI6MjA3OTU2MjExOH0.wg5kAvv1FxT3Uiu2AhP4uRjY2bOsIHzf7RbTxzCN2_Q';

if (!supabaseUrl || !supabaseKey) {
  console.error('缺少Supabase配置，请检查环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupInventorySettings() {
  try {
    console.log('=== 设置库存管理功能 ===');
    console.log('✓ Supabase URL:', supabaseUrl);

    // 1. 创建inventory_settings表
    console.log('\n1. 创建库存设置表...');

    const { data: existingTables, error: checkError } = await supabase
      .from('inventory_settings')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === 'PGRST116') {
      console.log('   表不存在，需要手动创建...');
      console.log('\n请在Supabase SQL Editor中执行以下SQL:');
      console.log('```sql');
      console.log(`
-- 添加总库存价值设置表
CREATE TABLE IF NOT EXISTS inventory_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_name TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 插入默认的总库存价值设置
INSERT INTO inventory_settings (setting_name, setting_value, description) VALUES
('total_inventory_value', '0', '手动设置的总库存价值（分为单位）'),
('use_manual_total_value', 'false', '是否使用手动设置的总价值而不是自动计算')
ON CONFLICT (setting_name) DO NOTHING;

-- 为products表添加价值倍数字段（可选，用于特殊商品的价值调整）
ALTER TABLE products
ADD COLUMN IF NOT EXISTS value_multiplier DECIMAL(3,2) DEFAULT 1.0;

-- 添加注释
COMMENT ON COLUMN products.value_multiplier IS '价值倍数，用于计算该商品在总库存中的价值权重';
COMMENT ON TABLE inventory_settings IS '库存设置表，用于存储各种库存相关的配置';
      `);
      console.log('```');

    } else {
      console.log('   ✓ inventory_settings表已存在');

      // 2. 插入默认设置
      console.log('\n2. 设置默认库存配置...');

      const { data, error } = await supabase
        .from('inventory_settings')
        .upsert([
          {
            setting_name: 'total_inventory_value',
            setting_value: '0',
            description: '手动设置的总库存价值（分为单位）'
          },
          {
            setting_name: 'use_manual_total_value',
            setting_value: 'false',
            description: '是否使用手动设置的总价值而不是自动计算'
          }
        ])
        .select();

      if (error) {
        console.error('   ✗ 插入默认设置失败:', error.message);
      } else {
        console.log('   ✓ 默认库存配置设置成功');
        console.log('   插入的数据:', data);
      }

      // 3. 检查products表是否有value_multiplier字段
      console.log('\n3. 检查products表结构...');

      const { data: products, error: productError } = await supabase
        .from('products')
        .select('id, value_multiplier')
        .limit(1);

      if (productError && productError.message.includes('value_multiplier')) {
        console.log('   需要添加value_multiplier字段');
        console.log('   请在Supabase SQL Editor中执行:');
        console.log('   ```sql');
        console.log('   ALTER TABLE products ADD COLUMN IF NOT EXISTS value_multiplier DECIMAL(3,2) DEFAULT 1.0;');
        console.log('   ```');
      } else {
        console.log('   ✓ products表结构正常');
      }
    }

    // 4. 测试API
    console.log('\n4. 测试库存设置API...');

    try {
      const response = await fetch('http://localhost:3001/api/inventory-settings');
      if (response.ok) {
        const data = await response.json();
        console.log('   ✓ API测试成功');
        console.log('   当前设置:', data.settings);
        console.log('   计算总价值:', data.calculatedTotalValue);
        console.log('   显示总价值:', data.displayTotalValue);
      } else {
        console.log('   ⚠ API测试失败，请确保开发服务器正在运行');
      }
    } catch (fetchError) {
      console.log('   ⚠ 无法连接到API，请确保开发服务器正在运行在 http://localhost:3001');
    }

    console.log('\n=== 设置完成 ===');
    console.log('现在可以在后台管理页面使用库存价值编辑功能了！');

  } catch (error) {
    console.error('设置过程中发生错误:', error);
    process.exit(1);
  }
}

setupInventorySettings();