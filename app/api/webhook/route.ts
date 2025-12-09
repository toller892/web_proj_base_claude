import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;
  const supabase = await createClient();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object as Stripe.Checkout.Session;

      if (session.metadata?.orderId) {
        // 更新订单状态为已支付
        const { error } = await supabase
          .from('orders')
          .update({
            status: 'paid',
            stripe_payment_intent_id: session.payment_intent as string,
          })
          .eq('id', session.metadata.orderId);

        if (error) {
          console.error('Failed to update order status:', error);
        } else {
          console.log(`Order ${session.metadata.orderId} paid successfully`);
        }
      }
      break;

    case 'checkout.session.expired':
      const expiredSession = event.data.object as Stripe.Checkout.Session;

      if (expiredSession.metadata?.orderId) {
        // 更新订单状态为已取消
        const { error } = await supabase
          .from('orders')
          .update({ status: 'cancelled' })
          .eq('id', expiredSession.metadata.orderId);

        if (error) {
          console.error('Failed to update order status:', error);
        } else {
          console.log(`Order ${expiredSession.metadata.orderId} expired`);
        }
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object as Stripe.PaymentIntent;

      // 查找对应的订单并更新状态
      const { data: orders } = await supabase
        .from('orders')
        .select('id')
        .eq('stripe_payment_intent_id', failedPayment.id);

      if (orders && orders.length > 0) {
        const { error } = await supabase
          .from('orders')
          .update({ status: 'failed' })
          .eq('id', orders[0].id);

        if (error) {
          console.error('Failed to update order status:', error);
        } else {
          console.log(`Order ${orders[0].id} payment failed`);
        }
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}