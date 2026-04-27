'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AcademicDNA from '@/components/dashboard/AcademicDNA'
import DailyRecommendation from '@/components/dashboard/DailyRecommendation'
import { useRouter } from 'next/navigation'
import {
  Flame,
  Star,
  Trophy,
  TrendingUp,
  Clock,
  Target,
  BookOpen,
  Zap,
  Award,
  Calendar,
  Camera,
  MessageSquare,
  FileText,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react'

interface AnalyticsData {
  dna: {
    strongTopics: any[]
    averageTopics: any[]
    weakTopics: any[]
    overallAccuracy: number
    totalAttempts: number
    subjectsAnalyzed: string[]
  }
  recommendation: {
    focusArea: string
    subject: string
    topic: string
    reason: string
    suggestedAction: string
    estimatedTime: number
    motivationalMessage: string
  }
  weeklyStats: {
    totalQuestionsAttempted: number
    overallAccuracy: number
    totalStudyTime: number
    daysStudied: number
    currentStreak: number
    xpEarned: number
    improvementTrend: number
  }
  readiness: {
    overall: number
    examTarget: string
    estimatedPreparationDays: number
  }
  userLevel: string
}

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loadingActivity, setLoadingActivity] = useState(true)

  useEffect(() => {
    loadAnalytics()
    loadActivities()
  }, [])

  const loadAnalytics = async () => {
    try {
      const response = await fetch('/api/analytics/weak-areas')
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data.data)
      }
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadActivities = async () => {
    try {
      const response = await fetch('/api/activity')
      const data = await response.json()
      setActivities(data.activities || [])
    } catch (error) {
      console.error('Failed to load activities:', error)
    } finally {
      setLoadingActivity(false)
    }
  }

  const handleResetActivity = async () => {
    if (!confirm('Reset all recent activity?')) return
    await fetch('/api/activity', { method: 'DELETE' })
    setActivities([])
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    const hours = Math.floor(mins / 60)
    const days = Math.floor(hours / 24)
    if (days > 0) return `${days}d ago`
    if (hours > 0) return `${hours}h ago`
    if (mins > 0) return `${mins}m ago`
    return 'Just now'
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Genius':
        return '🧠'
      case 'Legend':
        return '👑'
      case 'Topper':
        return '🏆'
      case 'Scholar':
        return '📚'
      default:
        return '🌱'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p style={{ color: 'var(--foreground-secondary)' }}>Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Morning Greeting with Streak */}
      <div className="rounded-[10px] p-4 sm:p-6 border" style={{ backgroundColor: '#13151e', borderColor: '#2a2d3a' }}>
        <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: '#e2e8f0' }}>
              {getGreeting()}, {userName}!
            </h1>
            {analytics && analytics.weeklyStats.currentStreak > 0 && (
              <p className="text-sm sm:text-base flex items-center gap-2" style={{ color: '#9ca3af' }}>
                <span className="fire-animation inline-block">🔥</span>
                Day {analytics.weeklyStats.currentStreak} streak — keep it up!
              </p>
            )}
          </div>
          {analytics && (
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg" style={{ backgroundColor: '#1e2130' }}>
              <span className="text-2xl">{getLevelIcon(analytics.userLevel)}</span>
              <div>
                <p className="text-sm font-semibold" style={{ color: '#e2e8f0' }}>{analytics.userLevel}</p>
                <p className="text-xs" style={{ color: '#9ca3af' }}>{analytics.weeklyStats.xpEarned} XP this week</p>
              </div>
            </div>
          )}
        </div>

        {/* Today's Focus */}
        {analytics && analytics.recommendation && (
          <div className="mt-4 p-4 rounded-lg border" style={{ backgroundColor: '#1e1b4b', borderColor: '#3730a3' }}>
            <div className="flex items-start gap-3">
              <Target className="w-5 h-5" style={{ color: '#a78bfa' }} />
              <div className="flex-1">
                <p className="text-sm font-semibold mb-1" style={{ color: '#a78bfa' }}>Today's Focus</p>
                <p className="text-sm sm:text-base" style={{ color: '#c4b5fd' }}>
                  Complete <strong>{analytics.recommendation.topic}</strong> ({analytics.recommendation.subject})
                </p>
                <p className="text-xs sm:text-sm mt-1" style={{ color: '#a78bfa' }}>
                  {analytics.recommendation.estimatedTime} min target
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions - 4 Big Buttons */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: Camera, label: 'Solve a Doubt', desc: 'Upload photo or type', path: '/doubt-solver' },
          { icon: Target, label: 'Practice Test', desc: 'Mock exams & PYQs', path: '/exam' },
          { icon: MessageSquare, label: 'Chat with AI', desc: 'Ask anything', path: '/chat' },
          { icon: Calendar, label: 'Study Planner', desc: 'View schedule', path: '/planner' },
        ].map((action, idx) => (
          <button
            key={idx}
            onClick={() => router.push(action.path)}
            className="group p-4 sm:p-5 rounded-[10px] border transition-all text-left hover:shadow-md"
            style={{ 
              backgroundColor: '#13151e',
              borderColor: '#2a2d3a'
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = '#3730a3'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2a2d3a'}
          >
            <action.icon className="w-6 h-6 sm:w-7 sm:h-7 mb-2 sm:mb-3" style={{ color: '#a78bfa' }} />
            <p className="font-semibold text-sm sm:text-base mb-1" style={{ color: '#e2e8f0' }}>{action.label}</p>
            <p className="text-xs" style={{ color: '#9ca3af' }}>{action.desc}</p>
          </button>
        ))}
      </div>

      {/* Streak Card & Progress Ring Row */}
      {analytics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Streak Card */}
          <div className="p-5 rounded-[10px] border" style={{ backgroundColor: '#13151e', borderColor: '#2a2d3a' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold" style={{ color: '#e2e8f0' }}>Study Streak</h3>
              <Flame className="w-5 h-5 fire-animation text-orange-500" />
            </div>
            <div className="text-center py-4">
              <p className="text-4xl font-bold text-orange-500">
                {analytics.weeklyStats.currentStreak}
              </p>
              <p className="text-sm mt-2" style={{ color: '#9ca3af' }}>consecutive days</p>
            </div>
          </div>

          {/* Progress Ring */}
          <div className="p-5 rounded-[10px] border" style={{ backgroundColor: '#13151e', borderColor: '#2a2d3a' }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: '#e2e8f0' }}>Weekly Goal</h3>
            <div className="flex items-center justify-center py-2">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#2a2d3a"
                    strokeWidth="8"
                  />
                  <circle
                    className="progress-ring"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#a78bfa"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray="283"
                    strokeDashoffset={283 - (283 * (analytics.weeklyStats.daysStudied / 7))}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold" style={{ color: '#e2e8f0' }}>
                    {Math.round((analytics.weeklyStats.daysStudied / 7) * 100)}%
                  </p>
                  <p className="text-xs" style={{ color: '#9ca3af' }}>
                    {analytics.weeklyStats.daysStudied}/7 days
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Weak Area Alert */}
          <div className="p-5 rounded-[10px] border" style={{ backgroundColor: '#13151e', borderColor: '#2a2d3a' }}>
            <h3 className="text-base font-semibold mb-4" style={{ color: '#e2e8f0' }}>Focus Area</h3>
            {analytics && analytics.dna.weakTopics.length > 0 ? (
              <div className="space-y-2">
                {analytics.dna.weakTopics.slice(0, 2).map((topic: any, idx: number) => (
                  <div 
                    key={idx} 
                    className="p-3 rounded-lg border" style={{ backgroundColor: '#7F1D1D', borderColor: '#991B1B' }}
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <div>
                        <p className="text-sm font-semibold text-red-300">
                          {topic.topic}
                        </p>
                        <p className="text-xs text-red-400">
                          {topic.subject} • {topic.accuracy.toFixed(0)}% accuracy
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={() => router.push('/doubt-solver')}
                  className="w-full mt-2 py-2 rounded-lg text-sm font-semibold transition-all hover:bg-[#6d28d9]" style={{ backgroundColor: '#7c3aed', color: 'white' }}
                >
                  Practice Now →
                </button>
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-green-500" />
                <p className="text-sm font-semibold text-green-500">All good!</p>
                <p className="text-xs mt-1" style={{ color: '#9ca3af' }}>No weak areas detected</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="p-5 rounded-[10px] border" style={{ backgroundColor: '#13151e', borderColor: '#2a2d3a' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ color: '#e2e8f0' }}>Recent Activity</h3>
          {activities.length > 0 && (
            <button 
              onClick={handleResetActivity}
              className="text-red-400 hover:text-red-300 text-xs border border-red-500/30 px-3 py-1.5 rounded-lg transition-colors"
            >
              Reset
            </button>
          )}
        </div>

        {loadingActivity ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-14 bg-gray-700/30 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">📭</div>
            <p className="text-gray-400 text-sm">No activity yet. Start using Learnova AI features!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activities.map((activity, i) => (
              <div 
                key={i} 
                className="flex items-center gap-4 p-3 bg-[#0F0F10] rounded-xl hover:bg-gray-800/50 transition-colors"
              >
                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-xl flex-shrink-0">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{activity.title}</p>
                  <p className="text-gray-500 text-xs truncate">{activity.detail}</p>
                </div>
                <span className="text-gray-600 text-xs flex-shrink-0">{timeAgo(activity.time)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Content Grid - Academic DNA & Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Recommendation */}
        <div className="lg:col-span-1">
          {analytics && (
            <DailyRecommendation
              focusArea={analytics.recommendation.focusArea}
              subject={analytics.recommendation.subject}
              topic={analytics.recommendation.topic}
              reason={analytics.recommendation.reason}
              suggestedAction={analytics.recommendation.suggestedAction}
              estimatedTime={analytics.recommendation.estimatedTime}
              motivationalMessage={analytics.recommendation.motivationalMessage}
              onActionClick={() => router.push('/doubt-solver')}
            />
          )}
        </div>

        {/* Right Column - Academic DNA */}
        <div className="lg:col-span-2">
          {analytics && (
            <AcademicDNA
              strongTopics={analytics.dna.strongTopics}
              averageTopics={analytics.dna.averageTopics}
              weakTopics={analytics.dna.weakTopics}
              overallAccuracy={analytics.dna.overallAccuracy}
              totalAttempts={analytics.dna.totalAttempts}
            />
          )}
        </div>
      </div>
    </div>
  )
}
