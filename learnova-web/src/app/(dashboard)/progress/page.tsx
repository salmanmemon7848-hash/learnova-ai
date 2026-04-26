'use client'

import { useEffect, useState } from 'react'

export default function ProgressPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [resetting, setResetting] = useState(false)

  const fetchProgress = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/progress')
      const data = await res.json()
      setStats(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset ALL your progress? This cannot be undone.')) return
    setResetting(true)
    try {
      await fetch('/api/progress', { method: 'DELETE' })
      await fetchProgress()
      alert('Progress reset successfully!')
    } catch (e) {
      alert('Failed to reset progress.')
    } finally {
      setResetting(false)
    }
  }

  useEffect(() => { fetchProgress() }, [])

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0F0F10]">
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Loading your progress...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Progress</h1>
          <p className="text-gray-400 mt-1">Track your learning journey</p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-4 py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
        >
          {resetting ? 'Resetting...' : '🗑️ Reset Progress'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Questions Attempted', value: stats?.totalQuestionsAttempted || 0, icon: '📝', color: 'purple' },
          { label: 'Overall Accuracy', value: `${stats?.overallAccuracy || 0}%`, icon: '🎯', color: 'green' },
          { label: 'Study Time', value: `${stats?.totalStudyTimeMinutes || 0}m`, icon: '⏱️', color: 'blue' },
          { label: 'Day Streak', value: `${stats?.currentStreak || 0} 🔥`, icon: '📅', color: 'orange' },
        ].map((stat, i) => (
          <div key={i} className="bg-[#1A1A1E] rounded-2xl p-5 border border-gray-700/50 text-center">
            <div className="text-3xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <div className="text-gray-400 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Subject Performance */}
      {stats?.subjectPerformance?.length > 0 && (
        <div className="bg-[#1A1A1E] rounded-2xl p-6 mb-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold mb-4">📊 Subject Performance</h2>
          <div className="space-y-4">
            {stats.subjectPerformance.map((subj: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-300">{subj.subject}</span>
                  <span className="text-purple-400 font-medium">{subj.accuracy}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${subj.accuracy}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Exams */}
      {stats?.recentExams?.length > 0 && (
        <div className="bg-[#1A1A1E] rounded-2xl p-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold mb-4">📋 Recent Exams</h2>
          <div className="space-y-3">
            {stats.recentExams.map((exam: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#0F0F10] rounded-xl">
                <div>
                  <p className="font-medium text-white">{exam.subject} — {exam.topic}</p>
                  <p className="text-gray-400 text-xs">{new Date(exam.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-purple-400">{exam.correctAnswers}/{exam.totalQuestions}</p>
                  <p className="text-gray-400 text-xs">{Math.round((exam.correctAnswers / exam.totalQuestions) * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats?.totalQuestionsAttempted === 0 && (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-white mb-2">No activity yet</h3>
          <p className="text-gray-400">Start practicing exams and using AI features to track your progress here.</p>
        </div>
      )}

    </div>
  )
}
