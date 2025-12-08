#!/usr/bin/env node

/**
 * Supabase数据库初始化脚本
 *
 * 使用方法:
 * 1. 确保在 .env.local 中配置了 Supabase 凭据
 * 2. 运行: node scripts/setup-database.js
 *
 * 或者手动在 Supabase Dashboard 的 SQL 编辑器中执行:
 * - 复制 supabase-schema.sql 的内容
 * - 粘贴到 SQL 编辑器并执行
 */

const fs = require('fs');
const path = require('path');

// 尝试读取环境配置
let supabaseUrl, supabaseKey;
try {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        if (match[1] === 'NEXT_PUBLIC_SUPABASE_URL') {
          supabaseUrl = match[2].replace(/^["']|["']$/g, '');
        } else if (match[1] === 'SUPABASE_SERVICE_ROLE_KEY') {
          supabaseKey = match[2].replace(/^["']|["']$/g, '');
        } else if (match[1] === 'NEXT_PUBLIC_SUPABASE_ANON_KEY' && !supabaseKey) {
          supabaseKey = match[2].replace(/^["']|["']$/g, '');
        }
      }
    });
  }
} catch (error) {
  console.log('读取 .env.local 文件时出错，将使用占位符URL');
}

console.log('=== Supabase 数据库初始化 ===\n');

if (!supabaseUrl) {
  console.log('⚠️  NEXT_PUBLIC_SUPABASE_URL 未在 .env.local 中找到');
  console.log('请确保在 .env.local 中配置了以下变量:');
  console.log('   - NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY=your-service-role-key\n');
  console.log('将使用占位符URL继续生成说明...\n');
  supabaseUrl = 'https://your-project-url.supabase.co';
} else {
  console.log(`✓ Supabase URL: ${supabaseUrl}`);
  console.log(`✓ 使用密钥类型: ${supabaseKey ? (supabaseKey.startsWith('sk_') ? 'Service Role Key' : 'Anon Key') : '未找到'}\n`);
}

// 读取SQL脚本
const sqlPath = path.join(__dirname, '../supabase-schema.sql');
if (!fs.existsSync(sqlPath)) {
  console.error(`❌ 错误: SQL文件未找到: ${sqlPath}`);
  process.exit(1);
}

const sqlScript = fs.readFileSync(sqlPath, 'utf8');
console.log('✓ SQL脚本加载成功\n');

// 生成手动执行说明
console.log('=== 手动执行说明 ===\n');
console.log('由于Supabase MCP当前不可用，请按以下步骤手动创建数据库表:\n');

console.log('1. 打开 Supabase Dashboard');
console.log(`   URL: ${supabaseUrl.replace(/\/rest\/v1$/, '').replace(/\/$/, '')}/project`);
console.log('\n2. 导航到 SQL Editor');
console.log('   在左侧菜单中找到 "SQL Editor" 并点击\n');

console.log('3. 复制以下SQL代码并执行:\n');
console.log('--- SQL 开始 ---');
console.log(sqlScript);
console.log('--- SQL 结束 ---\n');

console.log('4. 验证表创建');
console.log('   执行完成后，在左侧菜单的 "Table Editor" 中应该能看到以下表:');
console.log('   - products (商品表)');
console.log('   - orders (订单表)');
console.log('   - order_items (订单项表)');
console.log('   - products 表应该包含4条示例商品记录\n');

// 创建验证脚本
const verificationScript = `
-- 验证表是否创建成功
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('products', 'orders', 'order_items')
ORDER BY table_name;

-- 验证产品数据
SELECT COUNT(*) as product_count,
       COUNT(CASE WHEN in_stock = true THEN 1 END) as in_stock_count
FROM products;

-- 查看产品示例
SELECT name, price, currency, category, in_stock
FROM products
ORDER BY price DESC
LIMIT 5;
`;

console.log('=== 可选: 验证SQL ===');
console.log('如果需要验证表是否正确创建，可以执行以下SQL:\n');
console.log('--- 验证SQL 开始 ---');
console.log(verificationScript);
console.log('--- 验证SQL 结束 ---\n');

console.log('=== 注意事项 ===');
console.log('• 确保在正确的项目和数据库中执行SQL');
console.log('• 如果出现权限错误，确保使用的是Service Role Key');
console.log('• 执行完成后，可以在Table Editor中查看创建的表和数据');
console.log('• 如果需要修改表结构，可以随时在SQL Editor中执行ALTER语句\n');

console.log('✅ 准备完成! 请按照上述步骤手动执行SQL脚本。');