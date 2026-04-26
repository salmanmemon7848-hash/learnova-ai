import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { getWeeklyStats } from '@/lib/analytics/weakAreaEngine'

// Prevent static generation - this route requires runtime database access
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// GET - Get weekly report
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
    const weekOffset = parseInt(searchParams.get('week') || '0')
    
    // Calculate date range for the requested week
    const now = new Date()
    const startOfWeek = new Date(now.getTime() - (weekOffset * 7 * 24 * 60 * 60 * 1000))
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()) // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0)
    
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    // Get exam attempts for this week
    const examAttempts = await prisma.examAttempt.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
      orderBy: { createdAt: 'asc' },
    })

    // Get streak data for this week
    const streakData = await prisma.studyStreak.findMany({
      where: {
        userId: user.id,
        date: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
      orderBy: { date: 'asc' },
    })

    // Get doubt solves for this week
    const doubtSolves = await prisma.doubtSolver.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
      select: {
        subject: true,
        topic: true,
        createdAt: true,
      },
    })

    // Calculate weekly stats
    const stats = await getWeeklyStats(user.id)

    // Generate insights
    const insights = generateInsights({
      examAttempts,
      streakData,
      doubtSolves,
      stats,
      weekOffset,
    })

    return NextResponse.json({
      success: true,
      data: {
        weekStart: startOfWeek,
        weekEnd: endOfWeek,
        stats,
        examAttempts,
        streakData,
        doubtSolves,
        insights,
      },
    })
  } catch (error) {
    console.error('Weekly report error:', error)
    return NextResponse.json(
      { error: 'Failed to generate weekly report' },
      { status: 500 }
    )
  }
}

// Generate AI-powered insights
function generateInsights(data: any) {
  const { examAttempts, streakData, doubtSolves, stats, weekOffset } = data
  const insights: string[] = []

  // Streak insights
  if (stats.currentStreak >= 30) {
    insights.push(`🔥 Amazing! You're on a ${stats.currentStreak}-day streak! You're unstoppable!`)
  } else if (stats.currentStreak >= 7) {
    insights.push(`🔥 Great consistency! ${stats.currentStreak} days in a row - keep it up!`)
  } else if (stats.currentStreak > 0) {
    insights.push(`🔥 You're building momentum! ${stats.currentStreak} day streak - aim for 7!`)
  }

  // Performance insights
  if (stats.improvementTrend > 10) {
    insights.push(`📈 Excellent improvement! Your accuracy increased by ${stats.improvementTrend.toFixed(0)}% this week!`)
  } else if (stats.improvementTrend > 0) {
    insights.push(`📈 Good progress! ${stats.improvementTrend.toFixed(0)}% improvement this week.`)
  }

  // Study time insights
  if (stats.totalStudyTime >= 600) {
    insights.push(`⏰ Incredible dedication! ${stats.totalStudyTime} minutes of study this week!`)
  } else if (stats.totalStudyTime >= 300) {
    insights.push(`⏰ Solid effort! ${stats.totalStudyTime} minutes of focused study.`)
  } else if (stats.totalStudyTime > 0) {
    insights.push(`⏰ Try to increase study time. Aim for at least 300 minutes per week.`)
  }

  // Subject-specific insights
  if (stats.subjectBreakdown.length > 0) {
    const bestSubject = stats.subjectBreakdown.reduce((prev: any, current: any) => 
      prev.accuracy > current.accuracy ? prev : current
    )
    insights.push(`🏆 Your strongest subject this week: ${bestSubject.subject} (${bestSubject.accuracy.toFixed(0)}% accuracy)`)
  }

  // Doubt solving insights
  if (doubtSolves.length > 0) {
    const subjectCounts = doubtSolves.reduce((acc: any, doubt: any) => {
      acc[doubt.subject] = (acc[doubt.subject] || 0) + 1
      return acc
    }, {})
    const mostDoubtedSubject = Object.entries(subjectCounts).sort((a: any, b: any) => b[1] - a[1])[0]
    insights.push(`❓ You solved ${doubtSolves.length} doubts this week. Most questions from: ${mostDoubtedSubject[0]}`)
  }

  // Motivational close
  if (weekOffset === 0) {
    insights.push('💪 Keep pushing! Every question you solve brings you closer to your goal!')
  }

  return insights
}
