import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

// Prevent static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const STRIPE_MAX_BODY_BYTES = 512_000

// Lazy initialize Stripe only when needed (not at build time)
function getStripe() {
  // SECURITY: Never hardcode secret keys — load only from environment.
  const key = process.env.STRIPE_SECRET_KEY?.trim()
  if (!key) {
    throw new Error('STRIPE_SECRET_KEY is not configured')
  }
  return new Stripe(key, {
    // @ts-ignore - API version mismatch between Stripe package and dashboard
    apiVersion: '2024-12-18.acacia',
  })
}

export async function POST(req: Request) {
  // SECURITY: Limit raw body size before signature verification (DoS mitigation).
  // OWASP Reference: A05:2021 Security Misconfiguration
  const body = await req.text()
  if (body.length > STRIPE_MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Payload too large' }, { status: 413 })
  }

  // SECURITY: Require Stripe signature header for webhook authenticity.
  // OWASP Reference: A07:2021 Identification and Authentication Failures
  const signature = req.headers.get('stripe-signature')
  if (!signature || typeof signature !== 'string') {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET?.trim()
    if (!webhookSecret) {
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 503 })
    }

    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const subscription = await getStripe().subscriptions.retrieve(
        session.subscription as string
      )

      // Find subscription by stripeCustomerId
      const existingSubscription = await prisma.subscription.findFirst({
        where: { stripeCustomerId: session.customer as string },
      })

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            plan: session.metadata?.plan || 'pro',
            stripeSubscriptionId: subscription.id,
            status: 'active',
            endDate: new Date((subscription as any).current_period_end * 1000),
          },
        })
      }

      break
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription

      // Find subscription by stripeSubscriptionId
      const existingSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      })

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: 'canceled',
            plan: 'free',
          },
        })
      }

      break
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription

      // Find subscription by stripeSubscriptionId
      const existingSubscription = await prisma.subscription.findFirst({
        where: { stripeSubscriptionId: subscription.id },
      })

      if (existingSubscription) {
        await prisma.subscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: subscription.status,
            endDate: new Date((subscription as any).current_period_end * 1000),
          },
        })
      }

      break
    }
  }

  return NextResponse.json({ received: true })
}
