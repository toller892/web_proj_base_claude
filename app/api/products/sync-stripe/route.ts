import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    console.log('开始同步三角洲行动商品到Supabase...');

    const supabase = await createClient();

    // 三角洲行动商品数据 - 使用通过Stripe MCP创建的商品信息
    const deltaForceProducts = [
      {
        id: 'prod_TULAiUmidJIcyQ',
        name: '战术护甲包',
        description: '三级防弹护甲，提供65%伤害减免，适合高强度战斗场景',
        price: 2999, // 29.99 CNY，以分为单位
        currency: 'CNY',
        image_url: '',
        category: 'delta-force',
        in_stock: true,
        stripe_price_id: 'price_1SXMU0HCQbuRdfgNpixEUaHB',
      },
      {
        id: 'prod_TULAu1jVLj7MjS',
        name: '精英武器箱',
        description: '包含AK47-火龙、M4A1-雷神、AWP-巨龙传说等稀有皮肤，开启概率获得传说级武器',
        price: 5999, // 59.99 CNY，以分为单位
        currency: 'CNY',
        image_url: '',
        category: 'delta-force',
        in_stock: true,
        stripe_price_id: 'price_1SXMU3HCQbuRdfgNJjsssMLK',
      },
      {
        id: 'prod_TULA0gj9QfhxHq',
        name: '医疗物资包',
        description: '包含5个医疗包、3个肾上腺素和2个防毒面具，快速恢复战斗状态',
        price: 1999, // 19.99 CNY，以分为单位
        currency: 'CNY',
        image_url: '',
        category: 'delta-force',
        in_stock: true,
        stripe_price_id: 'price_1SXMU6HCQbuRdfgNcof7oSef',
      },
    ];

    const syncedProducts = [];

    for (const product of deltaForceProducts) {
      // 使用upsert避免重复插入
      const { data: result, error } = await supabase
        .from('products')
        .upsert({
          ...product,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
          ignoreDuplicates: false,
        })
        .select();

      if (error) {
        console.error(`同步商品 ${product.name} 失败:`, error);
      } else {
        console.log(`✅ 同步商品成功: ${product.name} - ${(product.price / 100).toFixed(2)} ${product.currency}`);
        syncedProducts.push(result[0]);
      }
    }

    return NextResponse.json({
      success: true,
      message: `成功同步 ${syncedProducts.length} 个三角洲行动商品`,
      products: syncedProducts,
    });

  } catch (error) {
    console.error('三角洲行动商品同步失败:', error);
    return NextResponse.json(
      { error: '同步失败', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}