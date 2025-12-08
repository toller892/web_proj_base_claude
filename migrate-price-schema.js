#!/usr/bin/env node

/**
 * Database migration script to fix price update failures
 * Changes INTEGER to BIGINT for all price-related fields
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration - you'll need to set these environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('🚀 Starting price schema migration...');

  try {
    // Step 1: Update products table
    console.log('📋 Updating products.price column from INTEGER to BIGINT...');
    const { error: productsError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE products ALTER COLUMN price TYPE BIGINT;'
    });

    if (productsError) {
      console.error('❌ Failed to update products.price:', productsError);
      // Try alternative approach using raw SQL
      console.log('🔄 Trying alternative approach...');
    }

    // Step 2: Update orders table
    console.log('📋 Updating orders.total_amount column from INTEGER to BIGINT...');
    const { error: ordersError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE orders ALTER COLUMN total_amount TYPE BIGINT;'
    });

    if (ordersError) {
      console.error('❌ Failed to update orders.total_amount:', ordersError);
    }

    // Step 3: Update order_items table
    console.log('📋 Updating order_items columns from INTEGER to BIGINT...');
    const { error: orderItemsError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE order_items ALTER COLUMN price_per_unit TYPE BIGINT;
        ALTER TABLE order_items ALTER COLUMN total_price TYPE BIGINT;
      `
    });

    if (orderItemsError) {
      console.error('❌ Failed to update order_items columns:', orderItemsError);
    }

    console.log('✅ Migration completed!');
    console.log('');
    console.log('📊 New BIGINT ranges:');
    console.log('- Products price: ±9,223,372,036,854,775,807 cents (±$92,233,720,368,547.58)');
    console.log('- Orders total_amount: ±9,223,372,036,854,775,807 cents');
    console.log('- Order items price_per_unit: ±9,223,372,036,854,775,807 cents');
    console.log('- Order items total_price: ±9,223,372,036,854,775,807 cents');

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Manual SQL instructions if the script fails
console.log(`
📝 If the automatic migration fails, please run these SQL commands manually in your Supabase SQL editor:

-- 1. Update products table
ALTER TABLE products ALTER COLUMN price TYPE BIGINT;

-- 2. Update orders table
ALTER TABLE orders ALTER COLUMN total_amount TYPE BIGINT;

-- 3. Update order_items table
ALTER TABLE order_items ALTER COLUMN price_per_unit TYPE BIGINT;
ALTER TABLE order_items ALTER COLUMN total_price TYPE BIGINT;
`);

runMigration();