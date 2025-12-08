-- 创建商品表
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price BIGINT NOT NULL, -- 价格，以分为单位，使用BIGINT支持大额数值
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
  total_amount BIGINT NOT NULL, -- 订单总金额，以分为单位，使用BIGINT支持大额数值
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
  price_per_unit BIGINT NOT NULL, -- 单价，以分为单位，使用BIGINT支持大额数值
  total_price BIGINT NOT NULL, -- 总价，以分为单位，使用BIGINT支持大额数值
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