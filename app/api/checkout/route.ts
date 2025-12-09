import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

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

    // 从数据库获取商品信息
    const productIds = items.map(item => item.productId);
    let products = [];
    let productError = null;

    console.log('Fetching products for IDs:', productIds);

    // 对于每个产品ID，逐个查询
    for (const productId of productIds) {
      try {
        const query = supabase.from('products').select('*').eq('id', productId);
        const result = await query;

        console.log('Query result for productId', productId, ':', result);

        if (result.error) {
          console.error('Error fetching product:', productId, result.error);
          productError = result.error;
        } else if (result.data && result.data.length > 0) {
          products.push(result.data[0]);
          console.log('Successfully fetched product:', result.data[0]);
        } else {
          console.log('No product found for ID:', productId);
        }
      } catch (err) {
        console.error('Exception fetching product:', productId, err);
        productError = err;
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

    // 创建Stripe line items
    const line_items = items.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) {
        throw new Error(`Product ${item.productId} not found`);
      }

      return {
        price_data: {
          currency: product.currency.toLowerCase(),
          product_data: {
            name: product.name,
            description: product.description,
            images: [], // 暂时禁用图片以避免URL编码问题
          },
          unit_amount: product.price,
        },
        quantity: item.quantity,
      };
    });

    // 计算总金额
    const totalAmount = line_items.reduce(
      (total, item) => total + (item.price_data.unit_amount * item.quantity),
      0
    );

    // 创建订单记录
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_email: customerEmail,
        customer_name: customerName,
        total_amount: totalAmount,
        currency: 'USD',
        status: 'pending',
      })
      .select()
      .single();

    if (orderError) {
      console.error('Order creation error:', orderError);
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      );
    }

    // 创建订单项记录
    const orderItems = items.map((item: any) => {
      const product = products.find(p => p.id === item.productId);
      return {
        order_id: order.id,
        product_id: item.productId,
        quantity: item.quantity,
        price_per_unit: product!.price,
        total_price: product!.price * item.quantity,
      };
    });

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      console.error('Order items creation error:', itemsError);
      // 删除已创建的订单
      await supabase.from('orders').delete().eq('id', order.id);
      return NextResponse.json(
        { error: 'Failed to create order items' },
        { status: 500 }
      );
    }

    // 创建Stripe Checkout Session
    console.log('Creating Stripe session with line_items:', JSON.stringify(line_items, null, 2));
    
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items,
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/shop`,
        customer_email: customerEmail,
        metadata: {
          orderId: order.id,
        },
      });
      console.log('Stripe session created successfully:', session.id);
    } catch (stripeError: any) {
      console.error('Stripe session creation failed:', stripeError.message);
      console.error('Stripe error details:', stripeError);
      // 删除已创建的订单
      await supabase.from('orders').delete().eq('id', order.id);
      await supabase.from('order_items').delete().eq('order_id', order.id);
      return NextResponse.json(
        { error: `Stripe error: ${stripeError.message}` },
        { status: 500 }
      );
    }

    // 更新订单，添加Stripe session ID
    await supabase
      .from('orders')
      .update({ stripe_checkout_session_id: session.id })
      .eq('id', order.id);

    return NextResponse.json({
      sessionId: session.id,
      orderId: order.id,
      url: session.url
    });

  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}