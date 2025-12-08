-- 添加总价值字段到products表（这个字段可以用来手动调整单个商品的价值计算权重）
-- 注意：这主要是为了提供更灵活的库存价值管理

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