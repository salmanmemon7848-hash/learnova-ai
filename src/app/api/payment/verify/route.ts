import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
      role,
      mode = 'test',
    } = await req.json();

    // Verify signature
    const keySecret = mode === 'live'
      ? process.env.RAZORPAY_LIVE_KEY_SECRET!
      : process.env.RAZORPAY_KEY_SECRET!;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('[Payment] Signature verification failed');
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    // Payment verified — update order status
    await supabase
      .from('payment_orders')
      .update({
        razorpay_payment_id,
        status: 'paid',
        updated_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id);

    // Activate plan — expires in 30 days
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    await supabase
      .from('user_plans')
      .upsert({
        user_id: session.user.id,
        role,
        plan,
        plan_started_at: new Date().toISOString(),
        plan_expires_at: expiresAt,
        razorpay_payment_id,
        razorpay_order_id,
        is_active: true,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });

    console.log(`[Payment] Plan activated: ${plan} for user ${session.user.id.slice(0, 8)}`);

    return NextResponse.json({
      success: true,
      plan,
      role,
      expiresAt,
      message: `${plan} plan activated successfully!`,
    });

  } catch (err: any) {
    console.error('[Payment] Verify error:', err.message);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
