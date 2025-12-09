import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // 检查是否有相关的订单项
    const { data: orderItems, error: orderItemsError } = await supabase
      .from('order_items')
      .select('id')
      .eq('product_id', id);

    if (orderItemsError) {
      console.error('Failed to check order items:', orderItemsError);
      return NextResponse.json(
        { error: 'Failed to check existing orders' },
        { status: 500 }
      );
    }

    if (orderItems && orderItems.length > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing orders' },
        { status: 400 }
      );
    }

    // 删除商品
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Failed to delete product:', error);
      return NextResponse.json(
        { error: 'Failed to delete product' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const updates = await request.json();
    const supabase = await createClient();

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // 验证价格更新 - 确保只能手动设置
    if (updates.price !== undefined) {
      if (typeof updates.price !== 'number' || updates.price < 0 || !Number.isSafeInteger(updates.price)) {
        return NextResponse.json(
          { error: 'Price must be a non-negative integer (in cents). Large numbers are supported.' },
          { status: 400 }
        );
      }

      // 记录价格修改日志（手动修改）
      console.log(`Manual price update for product ${id}: ${updates.price} cents`);
    }

    // 验证其他允许的字段（防止意外的自动计算字段）
    const allowedFields = ['name', 'description', 'price', 'currency', 'image_url', 'category', 'in_stock', 'stripe_price_id'];
    const invalidFields = Object.keys(updates).filter(field => !allowedFields.includes(field));

    if (invalidFields.length > 0) {
      return NextResponse.json(
        { error: `Invalid fields: ${invalidFields.join(', ')}. Only manual updates are allowed.` },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Failed to update product:', {
        error: error,
        details: error.message,
        code: error.code,
        hint: error.hint,
        details_key: 'details'
      });

      // 提供更详细的错误信息
      let errorMessage = 'Failed to update product';
      if (error.message) {
        if (error.message.includes('numeric overflow') || error.message.includes('out of range')) {
          errorMessage = 'Price value too large. Please use a smaller value or contact administrator to increase database limits.';
        } else if (error.message.includes('invalid input syntax')) {
          errorMessage = 'Invalid price format. Please enter a valid number.';
        } else {
          errorMessage = `Database error: ${error.message}`;
        }
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: error.message || 'Unknown database error',
          code: error.code || 'UNKNOWN_ERROR'
        },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Update product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Failed to fetch product:', error);
      return NextResponse.json(
        { error: 'Failed to fetch product' },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      product
    });

  } catch (error) {
    console.error('Get product error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}