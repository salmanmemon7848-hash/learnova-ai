import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// NOTE: Replace with your actual Razorpay SDK once you add the keys
// npm install razorpay
// For now this creates a simple order structure

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { plan, role } = await request.json()

    // Plan → amount mapping (in paise)
    const planAmounts: Record<string, number> = {
      pro: 29900,       // ₹299
      builder: 29900,   // ₹299
      max: 59900,       // ₹599
      founder_pro: 59900, // ₹599
    }

    const normalizedPlan = (plan || '').toLowerCase().replace(' ', '_')
    const amount = planAmounts[normalizedPlan]

    if (!amount) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    const keyId = process.env.RAZORPAY_KEY_ID
    const keySecret = process.env.RAZORPAY_KEY_SECRET

    if (!keyId || !keySecret || keyId.includes('your_key_here')) {
      return NextResponse.json(
        { error: 'Razorpay keys not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local' },
        { status: 503 }
      )
    }

    // Create Razorpay order via REST API
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64')
    const orderPayload = {
      amount,
      currency: 'INR',
      receipt: `thinkior_${user.id.slice(0, 8)}_${Date.now()}`,
      notes: {
        userId: user.id,
        plan: normalizedPlan,
        role: role || 'student',
      },
    }

    const razorpayRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderPayload),
    })

    if (!razorpayRes.ok) {
      const errorData = await razorpayRes.json()
      console.error('[Razorpay] Order creation failed:', errorData)
      return NextResponse.json(
        { error: errorData.error?.description || 'Failed to create payment order' },
        { status: 500 }
      )
    }

    const order = await razorpayRes.json()

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    console.error('[Razorpay] Create order error:', msg)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
