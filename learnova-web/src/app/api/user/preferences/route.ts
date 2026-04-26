import { NextResponse } from 'next/server'
import { auth } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { userType, toneMode, language } = await req.json()

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        userType,
        toneMode,
        language,
      },
    })

    // Create usage tracking
    await prisma.usage.create({
      data: {
        userId: session.user.id,
      },
    })

    // Create subscription (free plan by default)
    await prisma.subscription.create({
      data: {
        userId: session.user.id,
        plan: 'free',
      },
    })

    // Create preferences
    await prisma.userPreferences.create({
      data: {
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to save preferences:', error)
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    )
  }
}
