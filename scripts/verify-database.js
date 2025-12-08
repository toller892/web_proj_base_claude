#!/usr/bin/env node

/**
 * 数据库表验证脚本
 * 验证Supabase数据库表是否正确创建并包含预期数据
 */

const fs = require('fs');
const path = require('path');

console.log('=== Supabase 数据库验证 ===\n');

// 验证SQL脚本
const verificationSQL = `
-- 1. 验证表是否创建成功
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
    AND table_name IN ('products', 'orders', 'order_items')
ORDER BY table_name;

-- 2. 检查表结构
SELECT
    t.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default
FROM information_schema.tables t
JOIN information_schema.columns c ON t.table_name = c.table_name
WHERE t.table_schema = 'public'
    AND t.table_name IN ('products', 'orders', 'order_items')
ORDER BY t.table_name, c.ordinal_position;

-- 3. 验证产品数据
SELECT
    COUNT(*) as total_products,
    COUNT(CASE WHEN in_stock = true THEN 1 END) as in_stock_products,
    COUNT(CASE WHEN category = 'weapon_skin' THEN 1 END) as weapon_skins,
    COUNT(CASE WHEN category = 'character_skin' THEN 1 END) as character_skins,
    COUNT(CASE WHEN category = 'battle_pass' THEN 1 END) as battle_passes,
    COUNT(CASE WHEN category = 'currency' THEN 1 END) as currency_packages
FROM products;

-- 4. 查看所有产品
SELECT
    id,
    name,
    price,
    currency,
    category,
    in_stock,
    created_at
FROM products
ORDER BY price DESC;

-- 5. 检查索引是否创建
SELECT
    indexname,
    tablename
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('products', 'orders', 'order_items')
ORDER BY tablename, indexname;

-- 6. 检查触发器和函数
SELECT
    routine_name,
    routine_type
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name LIKE '%updated_at%';

SELECT
    trigger_name,
    event_manipulation,
    event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%updated_at%';
`;

console.log('=== 数据库验证SQL ===\n');
console.log('请在Supabase Dashboard的SQL Editor中执行以下查询来验证数据库:\n');

console.log('--- 验证SQL 开始 ---');
console.log(verificationSQL);
console.log('--- 验证SQL 结束 ---\n');

console.log('=== 预期结果 ===\n');
console.log('如果一切正常，您应该看到:\n');

console.log('1. 表存在验证:');
console.log('   - ✓ products');
console.log('   - ✓ orders');
console.log('   - ✓ order_items\n');

console.log('2. 产品数据验证:');
console.log('   - total_products: 4');
console.log('   - in_stock_products: 4');
console.log('   - weapon_skins: 1 (AK-47 烈焰战士皮肤)');
console.log('   - character_skins: 1 (特种兵精英套装)');
console.log('   - battle_passes: 1 (战斗通行证高级版)');
console.log('   - currency_packages: 1 (钻石币大礼包)\n');

console.log('3. 产品价格验证:');
console.log('   - 特种兵精英套装: $49.99 (4999 cents)');
console.log('   - AK-47 烈焰战士皮肤: $29.99 (2999 cents)');
console.log('   - 战斗通行证高级版: $19.99 (1999 cents)');
console.log('   - 钻石币大礼包: $9.99 (999 cents)\n');

console.log('4. 索引验证:');
console.log('   - idx_orders_status');
console.log('   - idx_orders_customer_email');
console.log('   - idx_order_items_order_id');
console.log('   - idx_products_category\n');

console.log('5. 触发器验证:');
console.log('   - update_products_updated_at');
console.log('   - update_orders_updated_at');
console.log('   - update_updated_at_column 函数\n');

// 创建简单的数据验证JSON
const expectedData = {
  tables: ['products', 'orders', 'order_items'],
  products: {
    total: 4,
    items: [
      {
        name: '特种兵精英套装',
        price: 4999,
        currency: 'USD',
        category: 'character_skin'
      },
      {
        name: 'AK-47 烈焰战士皮肤',
        price: 2999,
        currency: 'USD',
        category: 'weapon_skin'
      },
      {
        name: '战斗通行证高级版',
        price: 1999,
        currency: 'USD',
        category: 'battle_pass'
      },
      {
        name: '钻石币大礼包',
        price: 999,
        currency: 'USD',
        category: 'currency'
      }
    ]
  },
  indexes: [
    'idx_orders_status',
    'idx_orders_customer_email',
    'idx_order_items_order_id',
    'idx_products_category'
  ]
};

// 保存预期数据到文件
const outputPath = path.join(__dirname, '../expected-database-structure.json');
fs.writeFileSync(outputPath, JSON.stringify(expectedData, null, 2));

console.log('=== 自动化验证 ===\n');
console.log('预期数据库结构已保存到:');
console.log(`✓ ${outputPath}\n`);

console.log('您可以使用这个JSON文件来对比实际的数据库结果，确保所有数据都正确创建。\n');

console.log('✅ 验证准备完成! 请在Supabase Dashboard中执行上述验证SQL。');