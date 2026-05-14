import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ plan: 'free', userType: 'student' })
    }

    const sub = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { userType: true }
    })

    return NextResponse.json({
      plan: sub?.plan || 'free',
      userType: user?.userType || 'student',
      status: sub?.status || 'active'
    })
  } catch (error) {
    return NextResponse.json({ plan: 'free', userType: 'student' })
  }
}
