import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/prisma'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  // @ts-ignore - API version mismatch between Stripe package and dashboard
  apiVersion: '2024-12-18.acacia',
})

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const subscription = await stripe.subscriptions.retrieve(
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
