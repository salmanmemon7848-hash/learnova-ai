import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import {
  getAcademicDNA,
  getDailyRecommendation,
  getWeeklyStats,
  getReadinessScore,
  updateUserLevel,
} from '@/lib/analytics/weakAreaEngine'

// Prevent static generation - this route requires runtime database access
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Get analytics data
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')

    // Get different types of analytics
    if (type === 'dna') {
      const dna = await getAcademicDNA(user.id)
      return NextResponse.json({ success: true, data: dna })
    }

    if (type === 'recommendation') {
      const recommendation = await getDailyRecommendation(user.id)
      return NextResponse.json({ success: true, data: recommendation })
    }

    if (type === 'weekly') {
      const stats = await getWeeklyStats(user.id)
      return NextResponse.json({ success: true, data: stats })
    }

    if (type === 'readiness') {
      const readiness = await getReadinessScore(user.id)
      return NextResponse.json({ success: true, data: readiness })
    }

    // Default: return all analytics
    const [dna, recommendation, weeklyStats, readiness] = await Promise.all([
      getAcademicDNA(user.id),
      getDailyRecommendation(user.id),
      getWeeklyStats(user.id),
      getReadinessScore(user.id),
    ])

    // Update user level based on XP
    const newLevel = await updateUserLevel(user.id)

    return NextResponse.json({
      success: true,
      data: {
        dna,
        recommendation,
        weeklyStats,
        readiness,
        userLevel: newLevel,
      },
    })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
