import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('开始同步Stripe MCP商品到Supabase...');

    const supabase = await createClient();

    // 从Stripe MCP获取的完整商品数据
    const stripeProducts = [
      {
        name: '医疗物资包',
        description: '包含5个医疗包、3个肾上腺素和2个防毒面具，快速恢复战斗状态',
        price: 1999, // ¥19.99 CNY，以分为单位
        currency: 'CNY',
        image_url: '',
        category: 'delta-force',
        in_stock: true,
        stripe_price_id: 'price_1SXMU6HCQbuRdfgNcof7oSef',
        stripe_product_id: 'prod_TULA0gj9QfhxHq',
      },
      {
        name: '精英武器箱',
        description: '包含AK47-火龙、M4A1-雷神、AWP-巨龙传说等稀有皮肤，开启概率获得传说级武器',
        price: 5999, // ¥59.99 CNY，以分为单位
        currency: 'CNY',
        image_url: '',
        category: 'delta-force',
        in_stock: true,
        stripe_price_id: 'price_1SXMU3HCQbuRdfgNJjsssMLK',
        stripe_product_id: 'prod_TULAu1jVLj7MjS',
      },
      {
        name: '战术护甲包',
        description: '三级防弹护甲，提供65%伤害减免，适合高强度战斗场景',
        price: 2999, // ¥29.99 CNY，以分为单位
        currency: 'CNY',
        image_url: '',
        category: 'delta-force',
        in_stock: true,
        stripe_price_id: 'price_1SXMU0HCQbuRdfgNpixEUaHB',
        stripe_product_id: 'prod_TULAiUmidJIcyQ',
      },
      {
        name: '复苏呼吸机',
        description: '医疗道具，专为体征已经极度衰弱，自主呼吸已经消失的病患设计的辅助呼吸设备，生命的最终防线。',
        price: 12457200, // $124,572.00 SGD，以分为单位
        currency: 'SGD',
        image_url: '',
        category: 'medical',
        in_stock: true,
        stripe_price_id: 'price_1SXMM4HCQbuRdfgNhjyyxSCG',
        stripe_product_id: 'prod_TUL2BuvQxUZQhd',
      },
      {
        name: '海洋之泪',
        description: '浑然天成，珠圆玉润的巨大天然珍珠，其通体散发镭射光泽，令人目眩神迷。',
        price: 25451800, // $254,518.00 SGD，以分为单位
        currency: 'SGD',
        image_url: '',
        category: 'luxury',
        in_stock: true,
        stripe_price_id: 'price_1SXMLWHCbuRdfgNgpYfzFDl',
        stripe_product_id: 'prod_TUL1yntaH5CAxe',
      },
      {
        name: '非洲之心',
        description: '世界上最大的钻石，璀璨夺日，象征永恒的爱。',
        price: 10314100, // $103,141.00 SGD，以分为单位
        currency: 'SGD',
        image_url: '',
        category: 'luxury',
        in_stock: true,
        stripe_price_id: 'price_1SXMKrHCQbuRdfgNZo4GNRiX',
        stripe_product_id: 'prod_TUL0obPmMAIVmW',
      },
    ];

    const syncedProducts = [];
    const updatedProducts = [];

    for (const product of stripeProducts) {
      // 检查是否已存在相同名称的商品
      const { data: existingProduct, error: fetchError } = await supabase
        .from('products')
        .select('*')
        .eq('name', product.name)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error(`查询商品 ${product.name} 失败:`, fetchError);
        continue;
      }

      if (existingProduct) {
        // 更新现有商品，添加Stripe信息
        const { data: updatedProduct, error: updateError } = await supabase
          .from('products')
          .update({
            stripe_product_id: product.stripe_product_id,
            stripe_price_id: product.stripe_price_id,
            price: product.price,
            currency: product.currency,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingProduct.id)
          .select()
          .single();

        if (updateError) {
          console.error(`更新商品 ${product.name} 失败:`, updateError);
        } else {
          console.log(`✅ 更新商品成功: ${product.name} - ${(product.price / 100).toFixed(2)} ${product.currency}`);
          syncedProducts.push(updatedProduct);
          updatedProducts.push(product.name);
        }
      } else {
        // 插入新商品
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert({
            ...product,
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();

        if (insertError) {
          console.error(`插入商品 ${product.name} 失败:`, insertError);
        } else {
          console.log(`✅ 插入商品成功: ${product.name} - ${(product.price / 100).toFixed(2)} ${product.currency}`);
          syncedProducts.push(newProduct);
          updatedProducts.push(product.name);
        }
      }
    }

    // 获取数据库中的总商品数量
    const { count, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
      success: true,
      message: `成功同步 ${syncedProducts.length} 个Stripe商品到数据库`,
      synced_products: syncedProducts.length,
      updated_products: updatedProducts,
      total_products: count,
      products: syncedProducts,
    });

  } catch (error) {
    console.error('Stripe MCP商品同步失败:', error);
    return NextResponse.json(
      { error: '同步失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}