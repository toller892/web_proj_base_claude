import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { items, customerEmail, customerName } = await request.json();
    const supabase = await createClient();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid items data' },
        { status: 400 }
      );
    }

    if (!customerEmail || !customerName) {
      return NextResponse.json(
        { error: 'Customer email and name are required' },
        { status: 400 }
      );
    }

    // 从数据库获取商品信息
    const productIds = items.map(item => item.productId);
    let products = [];
    let productError = null;

    // 对于每个产品ID，逐个查询
    for (const id of productIds) {
      const result = await supabase
        .from('products')
        .select('*')
        .match({ id: id });

      if (result.error) {
        productError = result.error;
        console.error(`Failed to fetch product ${id}:`, result.error);
      } else if (result.data && result.data.length > 0) {
        products.push(result.data[0]);
      }
    }

    if (productError) {
      console.error('Product fetch error:', productError);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    if (!products || products.length === 0) {
      return NextResponse.json(
        { error: 'Products not found' },
        { status: 404 }
      );
    }

    // 计算总金额
    let totalAmount = 0;
    const orderItems = items.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      return {
        product_id: item.productId,
        quantity: item.quantity,
        price_per_unit: product.price,
        total_price: itemTotal,
      };
    });

    // 创建订单记录
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: customerEmail,
        customer_name: customerName,
        total_amount: totalAmount,
        currency: 'CNY',
        status: 'pending',
        stripe_payment_intent_id: `demo_${Date.now()}`, // 模拟支付ID
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError.message },
        { status: 500 }
      );
    }

    // 创建订单项记录
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      // 删除已创建的订单
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create order items', details: itemsError.message },
        { status: 500 }
      );
    }

    console.log(`✅ 订单创建成功: 订单ID ${order.id}, 客户: ${customerName}, 总额: ¥${(totalAmount / 100).toFixed(2)}`);

    return NextResponse.json({
      success: true,
      orderId: order.id,
      message: '订单创建成功（演示模式）',
      totalAmount: totalAmount,
      currency: 'CNY',
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}