#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env.local' });

// Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 缺少Supabase配置:');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '❌');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✓' : '❌');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 完整的SQL脚本
const sqlScript = `
-- 创建商品表
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL, -- 价格，以分为单位
  currency TEXT DEFAULT 'USD',
  image_url TEXT,
  category TEXT,
  stripe_price_id TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_email TEXT,
  customer_name TEXT,
  total_amount INTEGER NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending', -- pending, paid, failed, cancelled
  stripe_payment_intent_id TEXT,
  stripe_checkout_session_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建订单项表
CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price_per_unit INTEGER NOT NULL, -- 单价，以分为单位
  total_price INTEGER NOT NULL, -- 总价，以分为单位
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);

-- 创建更新时间戳的函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

// 商品数据
const productsData = [
  {
    name: 'AK-47 烈焰战士皮肤',
    description: '限量版AK-47武器皮肤，炫酷烈焰特效，战场辨识度极高',
    price: 2999,
    currency: 'USD',
    image_url: '/images/placeholder-product.svg',
    category: 'weapon_skin'
  },
  {
    name: '特种兵精英套装',
    description: '包含完整角色外观、战术装备和专属动作',
    price: 4999,
    currency: 'USD',
    image_url: '/images/placeholder-product.svg',
    category: 'character_skin'
  },
  {
    name: '战斗通行证高级版',
    description: '解锁全部100级奖励，包含独家皮肤和武器蓝图',
    price: 1999,
    currency: 'USD',
    image_url: '/images/placeholder-product.svg',
    category: 'battle_pass'
  },
  {
    name: '钻石币大礼包',
    description: '10000钻石币 + 2000额外赠送，可购买游戏内任意道具',
    price: 999,
    currency: 'USD',
    image_url: '/images/placeholder-product.svg',
    category: 'currency'
  }
];

async function createDatabase() {
  console.log('🚀 开始创建Supabase数据库表...');
  console.log('📍 项目URL:', supabaseUrl);

  try {
    // 1. 执行SQL脚本创建表结构
    console.log('📝 执行SQL脚本创建表结构...');
    const { data: sqlResult, error: sqlError } = await supabase.rpc('exec_sql', {
      sql: sqlScript
    });

    if (sqlError) {
      console.log('⚠️  RPC方法不可用，尝试使用REST API...');

      // 如果RPC不可用，我们需要逐个创建表
      console.log('📋 创建products表...');
      await createTable('products');

      console.log('📋 创建orders表...');
      await createTable('orders');

      console.log('📋 创建order_items表...');
      await createTable('order_items');

      console.log('📋 创建索引...');
      await createIndexes();

      console.log('📋 创建触发器和函数...');
      await createTriggers();
    } else {
      console.log('✅ SQL脚本执行成功');
    }

    // 2. 检查商品是否已存在
    console.log('🔍 检查现有商品数据...');
    const { data: existingProducts, error: checkError } = await supabase
      .from('products')
      .select('id, name');

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingProducts && existingProducts.length > 0) {
      console.log('✅ 商品已存在，跳过插入数据');
      console.log('📦 现有商品:', existingProducts.map(p => p.name).join(', '));
    } else {
      // 3. 插入商品数据
      console.log('📦 插入商品数据...');
      const { data: insertedProducts, error: insertError } = await supabase
        .from('products')
        .insert(productsData)
        .select();

      if (insertError) {
        throw insertError;
      }

      console.log('✅ 成功插入商品:');
      insertedProducts.forEach((product, index) => {
        console.log(`   ${index + 1}. ${product.name} - $${(product.price / 100).toFixed(2)}`);
      });
    }

    // 4. 验证创建结果
    console.log('🔍 验证数据库结构...');
    await verifyDatabase();

    console.log('\n🎉 数据库创建完成！');
    console.log('📍 Supabase Dashboard: https://iigygnznpjjnqcqvdmuo.supabase.co');
    console.log('🏪 商店页面: http://localhost:3000/shop');
    console.log('⚙️  管理后台: http://localhost:3000/admin');

  } catch (error) {
    console.error('❌ 创建数据库时出错:');
    console.error('错误详情:', error);

    if (error.code === 'PGRST301') {
      console.log('\n💡 解决方案:');
      console.log('1. 请检查SUPABASE_SERVICE_ROLE_KEY是否正确');
      console.log('2. 确保你有足够的权限创建表');
      console.log('3. 手动在Supabase Dashboard中执行SQL');
    }

    process.exit(1);
  }
}

// 辅助函数：创建单个表
async function createTable(tableName) {
  const tableSQLs = {
    products: `CREATE TABLE IF NOT EXISTS products (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      currency TEXT DEFAULT 'USD',
      image_url TEXT,
      category TEXT,
      stripe_price_id TEXT,
      in_stock BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    orders: `CREATE TABLE IF NOT EXISTS orders (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      customer_email TEXT,
      customer_name TEXT,
      total_amount INTEGER NOT NULL,
      currency TEXT DEFAULT 'USD',
      status TEXT DEFAULT 'pending',
      stripe_payment_intent_id TEXT,
      stripe_checkout_session_id TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`,
    order_items: `CREATE TABLE IF NOT EXISTS order_items (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
      product_id UUID REFERENCES products(id),
      quantity INTEGER NOT NULL,
      price_per_unit INTEGER NOT NULL,
      total_price INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )`
  };

  const { error } = await supabase
    .from(tableName)
    .select('*')
    .limit(1);

  if (error && error.code === 'PGRST116') {
    console.log(`⚠️  表 ${tableName} 不存在，需要手动创建`);
    console.log(`📝 请在Supabase SQL Editor中执行以下SQL:`);
    console.log(tableSQLs[tableName]);
    console.log('');
  } else {
    console.log(`✅ 表 ${tableName} 已存在`);
  }
}

// 创建索引
async function createIndexes() {
  console.log('📋 创建索引...');
  // 这里可以添加创建索引的逻辑
}

// 创建触发器
async function createTriggers() {
  console.log('📋 创建触发器...');
  // 这里可以添加创建触发器的逻辑
}

// 验证数据库
async function verifyDatabase() {
  const tables = ['products', 'orders', 'order_items'];

  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ 表 ${table} 验证失败:`, error.message);
      } else {
        console.log(`✅ 表 ${table} 验证成功`);
      }
    } catch (err) {
      console.log(`❌ 表 ${table} 验证出错:`, err.message);
    }
  }
}

// 运行脚本
createDatabase();