import { createClient } from '@/lib/supabase/server';
import { PLAN_PRICING } from '@/lib/planConfig';
import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, role, mode = 'test' } = await req.json();

    // Validate plan
    const pricingData = (PLAN_PRICING as any)[role]?.[plan];
    if (!pricingData) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Initialize Razorpay with correct mode keys
    const keyId = mode === 'live'
      ? process.env.RAZORPAY_LIVE_KEY_ID!
      : process.env.RAZORPAY_KEY_ID!;
    const keySecret = mode === 'live'
      ? process.env.RAZORPAY_LIVE_KEY_SECRET!
      : process.env.RAZORPAY_KEY_SECRET!;

    const isPlaceholder = !keyId || keyId.includes('your_key_here') || !keySecret || keySecret.includes('your_secret_here') || keySecret.includes('secret_here');
    if (isPlaceholder) {
      return NextResponse.json({
        error: 'Placeholder Keys Detected: Please replace "rzp_test_your_key_here" and "your_secret_here" in your .env.local with real Test Keys from your Razorpay Dashboard.'
      }, { status: 400 });
    }

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    // Create order
    const order = await razorpay.orders.create({
      amount: pricingData.amount, // in paise
      currency: 'INR',
      receipt: `learnova_${session.user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        user_id: session.user.id,
        plan,
        role,
        email: session.user.email || '',
      },
    });

    // Save order to database
    await supabase.from('payment_orders').insert({
      user_id: session.user.id,
      razorpay_order_id: order.id,
      amount: pricingData.amount,
      currency: 'INR',
      plan,
      role,
      status: 'created',
    });

    return NextResponse.json({
      orderId: order.id,
      amount: pricingData.amount,
      currency: 'INR',
      keyId: mode === 'live'
        ? process.env.NEXT_PUBLIC_RAZORPAY_LIVE_KEY_ID
        : process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      planLabel: pricingData.label,
      isMock: false,
    });

  } catch (err: any) {
    console.error('[Payment] Create order error:', err);
    return NextResponse.json({ error: err.description || err.message || 'Failed to create order' }, { status: 500 });
  }
}
