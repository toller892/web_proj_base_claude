-- Fix price update failures by changing INTEGER to BIGINT for price fields
-- This allows much larger values (up to 9,223,372,036,854,775,807)

-- 1. Update products table price column from INTEGER to BIGINT
ALTER TABLE products
ALTER COLUMN price TYPE BIGINT;

-- 2. Update orders table total_amount column from INTEGER to BIGINT
ALTER TABLE orders
ALTER COLUMN total_amount TYPE BIGINT;

-- 3. Update order_items table price_per_unit and total_price columns from INTEGER to BIGINT
ALTER TABLE order_items
ALTER COLUMN price_per_unit TYPE BIGINT;
ALTER TABLE order_items
ALTER COLUMN total_price TYPE BIGINT;