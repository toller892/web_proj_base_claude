#!/bin/bash

echo "🚀 Supabase数据库设置助手"
echo "================================"

# Supabase配置
SUPABASE_URL="https://iigygnznpjjnqcqvdmuo.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpZ3lnbnpucGpqbnFjcXZkbXVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM5ODYxMTgsImV4cCI6MjA3OTU2MjExOH0.wg5kAvv1FxT3Uiu2AhP4uRjY2bOsIHzf7RbTxzCN2_Q"

echo "📍 项目URL: $SUPABASE_URL"
echo ""

# 检查是否可以连接到Supabase
echo "🔍 检查Supabase连接..."
curl_response=$(curl -s -w "%{http_code}" "$SUPABASE_URL/rest/v1/" \
  -H "apikey: $ANON_KEY" \
  -H "Authorization: Bearer $ANON_KEY" 2>/dev/null)

http_code="${curl_response: -3}"

if [ "$http_code" = "200" ]; then
    echo "✅ Supabase连接成功"
else
    echo "❌ Supabase连接失败 (HTTP $http_code)"
    echo ""
    echo "💡 请检查以下内容:"
    echo "1. 项目URL是否正确"
    echo "2. API密钥是否有效"
    echo "3. 网络连接是否正常"
    echo ""
    echo "🌐 请手动访问Supabase Dashboard创建表:"
    echo "   https://iigygnznpjjnqcqvdmuo.supabase.co"
    exit 1
fi

echo ""
echo "📋 手动创建表步骤:"
echo "================================"
echo "1. 打开浏览器访问: https://iigygnznpjjnqcqvdmuo.supabase.co"
echo "2. 点击 'Go to Dashboard'"
echo "3. 在左侧菜单点击 'SQL Editor'"
echo "4. 点击 'New query'"
echo "5. 复制并粘贴以下SQL代码:"
echo ""

# 输出SQL脚本
cat << 'EOF'
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

-- 插入三角洲行动大红商品数据
INSERT INTO products (name, description, price, currency, image_url, category) VALUES
('AK-47 烈焰战士皮肤', '限量版AK-47武器皮肤，炫酷烈焰特效，战场辨识度极高', 2999, 'USD', '/images/placeholder-product.svg', 'weapon_skin'),
('特种兵精英套装', '包含完整角色外观、战术装备和专属动作', 4999, 'USD', '/images/placeholder-product.svg', 'character_skin'),
('战斗通行证高级版', '解锁全部100级奖励，包含独家皮肤和武器蓝图', 1999, 'USD', '/images/placeholder-product.svg', 'battle_pass'),
('钻石币大礼包', '10000钻石币 + 2000额外赠送，可购买游戏内任意道具', 999, 'USD', '/images/placeholder-product.svg', 'currency');

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
EOF

echo ""
echo "6. 点击 'Run' 按钮执行SQL"
echo "7. 验证表创建成功后在左侧菜单点击 'Table Editor'"
echo "8. 你应该能看到 products、orders、order_items 三个表"
echo ""
echo "🎯 验证SQL查询:"
cat << 'EOF'
-- 检查表是否存在
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('products', 'orders', 'order_items');

-- 检查商品数据
SELECT name, price, category FROM products;

-- 检查表结构
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
  AND table_schema = 'public';
EOF

echo ""
echo "⚡ 完成后访问:"
echo "   🏪 商店页面: http://localhost:3000/shop"
echo "   ⚙️  管理后台: http://localhost:3000/admin"
echo ""
echo "🔍 如果仍有问题，请检查:"
echo "   1. 是否有足够的权限创建表"
echo "   2. SQL执行结果是否有错误信息"
echo "   3. 是否成功插入了4个商品数据"