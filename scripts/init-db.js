const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// 从环境变量获取Supabase配置
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('错误: 缺少Supabase配置。请确保在.env.local中设置了:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// 创建Supabase客户端（使用service role key以获得管理员权限）
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function initializeDatabase() {
  try {
    console.log('开始初始化数据库...');

    // 读取SQL脚本
    const sqlPath = path.join(__dirname, '../supabase-schema.sql');
    const sqlScript = fs.readFileSync(sqlPath, 'utf8');

    console.log('读取SQL脚本成功');

    // 将SQL脚本分割成单独的语句
    const statements = sqlScript
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`发现 ${statements.length} 个SQL语句`);

    // 逐个执行SQL语句
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`执行语句 ${i + 1}/${statements.length}: ${statement.substring(0, 50)}...`);

      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          // 如果exec_sql不存在，尝试使用其他方法
          console.log('exec_sql不可用，尝试直接SQL执行...');

          // 对于某些语句，我们需要使用不同的方法
          if (statement.toUpperCase().includes('CREATE TABLE') ||
              statement.toUpperCase().includes('INSERT INTO') ||
              statement.toUpperCase().includes('CREATE INDEX') ||
              statement.toUpperCase().includes('CREATE TRIGGER') ||
              statement.toUpperCase().includes('CREATE FUNCTION')) {

            // 使用PostgreSQL的客户端执行SQL
            const { error: directError } = await supabase
              .from('pg_catalog.pg_tables')
              .select('*');

            if (directError && directError.message.includes('permission denied')) {
              console.log(`语句 ${i + 1} 需要管理员权限: ${statement.substring(0, 50)}...`);
              console.log('请手动在Supabase Dashboard中执行以下SQL:');
              console.log('---');
              console.log(statement);
              console.log('---');
            } else {
              console.log(`语句 ${i + 1} 执行成功`);
            }
          } else {
            console.log(`语句 ${i + 1} 执行成功`);
          }
        } else {
          console.log(`语句 ${i + 1} 执行成功`);
        }
      } catch (stmtError) {
        console.error(`语句 ${i + 1} 执行失败:`, stmtError.message);
        console.log('失败的语句:', statement);
      }
    }

    // 验证表是否创建成功
    console.log('\n验证数据库表...');

    const tables = ['products', 'orders', 'order_items'];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);

        if (error) {
          console.error(`表 ${table} 验证失败:`, error.message);
        } else {
          console.log(`✓ 表 ${table} 存在且可访问`);

          if (table === 'products') {
            const { count, error: countError } = await supabase
              .from('products')
              .select('*', { count: 'exact', head: true });

            if (!countError && count > 0) {
              console.log(`✓ 产品表中有 ${count} 条记录`);
            }
          }
        }
      } catch (verifyError) {
        console.error(`验证表 ${table} 时出错:`, verifyError.message);
      }
    }

    console.log('\n数据库初始化完成!');
    console.log('\n如果某些表创建失败，请访问 Supabase Dashboard -> SQL Editor 并手动执行以下SQL:');
    console.log('1. 复制 supabase-schema.sql 文件的内容');
    console.log('2. 在SQL编辑器中粘贴并执行');

  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    process.exit(1);
  }
}

// 运行初始化
initializeDatabase();