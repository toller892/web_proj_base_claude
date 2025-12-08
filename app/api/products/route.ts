import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const supabase = await createClient();

    let query = supabase
      .from('products')
      .select('*')
      .eq('in_stock', true)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data: products, error } = await query;

    if (error) {
      console.error('Products fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    return NextResponse.json({ products });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const product = await request.json();
    console.log('📝 Product creation request:', JSON.stringify(product, null, 2));

    const supabase = await createClient();

    // 验证价格 - 确保只能手动设置
    if (product.price === undefined) {
      console.log('❌ Missing price field');
      return NextResponse.json(
        { error: 'Price is required and must be set manually', details: 'The price field is missing from the request' },
        { status: 400 }
      );
    }

    console.log(`📊 Price validation - value: ${product.price}, type: ${typeof product.price}, isInteger: ${Number.isInteger(product.price)}`);

    if (typeof product.price !== 'number' || product.price < 0 || !Number.isSafeInteger(product.price)) {
      console.log('❌ Invalid price format');
      return NextResponse.json(
        {
          error: 'Price must be a non-negative integer (in cents) and must be set manually. Large numbers are supported.',
          details: {
            received: product.price,
            type: typeof product.price,
            isInteger: Number.isInteger(product.price),
            isSafeInteger: Number.isSafeInteger(product.price),
            isNonNegative: product.price >= 0
          }
        },
        { status: 400 }
      );
    }

    // 验证其他允许的字段（防止意外的自动计算字段）
    const allowedFields = ['name', 'description', 'price', 'currency', 'image_url', 'category', 'in_stock'];
    const receivedFields = Object.keys(product);
    const invalidFields = receivedFields.filter(field => !allowedFields.includes(field));

    console.log(`🔍 Field validation - received: ${receivedFields.join(', ')}, invalid: ${invalidFields.join(', ')}`);

    if (invalidFields.length > 0) {
      console.log('❌ Invalid fields detected');
      return NextResponse.json(
        {
          error: `Invalid fields: ${invalidFields.join(', ')}. Only manual price setting is allowed.`,
          details: {
            receivedFields,
            invalidFields,
            allowedFields
          }
        },
        { status: 400 }
      );
    }

    // 记录商品创建日志（手动价格设置）
    console.log(`✅ Manual product creation with price: ${product.price} cents`);

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert(product)
      .select()
      .single();

    if (error) {
      console.error('❌ Product creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create product', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Product created successfully:', newProduct);
    return NextResponse.json({ product: newProduct });

  } catch (error) {
    console.error('❌ Product creation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}