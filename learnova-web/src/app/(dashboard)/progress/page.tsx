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
    <div className="progress-page flex items-center justify-center">
      <div className="text-center">
        <div className="skeleton skeleton-card mx-auto mb-4"></div>
        <div className="skeleton skeleton-title mx-auto mb-2"></div>
        <div className="skeleton skeleton-text mx-auto" style={{ width: '200px' }}></div>
      </div>
    </div>
  )

  return (
    <div className="progress-page max-w-4xl mx-auto">

      {/* Header */}
      <div className="progress-header">
        <div>
          <h1>My Progress</h1>
          <p className="subtitle">Track your learning journey</p>
        </div>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="btn-reset"
        >
          {resetting ? 'Resetting...' : '🗑️ Reset Progress'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {[
          { label: 'Questions Attempted', value: stats?.totalQuestionsAttempted || 0, icon: '📝', color: 'questions' },
          { label: 'Overall Accuracy', value: `${stats?.overallAccuracy || 0}%`, icon: '🎯', color: 'accuracy' },
          { label: 'Study Time', value: `${stats?.totalStudyTimeMinutes || 0}m`, icon: '⏱️', color: 'time' },
          { label: 'Day Streak', value: `${stats?.currentStreak || 0} 🔥`, icon: '📅', color: 'streak' },
        ].map((stat, i) => (
          <div key={i} className={`stat-card ${stat.color}`}>
            <div className="stat-icon">{stat.icon}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Subject Performance */}
      {stats?.subjectPerformance?.length > 0 && (
        <div className="settings-section">
          <h2>📊 Subject Performance</h2>
          <div className="space-y-4">
            {stats.subjectPerformance.map((subj: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: 'var(--text-secondary)' }}>{subj.subject}</span>
                  <span style={{ color: 'var(--accent-purple-light)' }} className="font-medium">{subj.accuracy}%</span>
                </div>
                <div className="w-full rounded-full h-2" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                  <div
                    className="h-2 rounded-full transition-all duration-500"
                    style={{ width: `${subj.accuracy}%`, background: 'var(--gradient-brand)' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Exams */}
      {stats?.recentExams?.length > 0 && (
        <div className="settings-section">
          <h2>📋 Recent Exams</h2>
          <div className="space-y-3">
            {stats.recentExams.map((exam: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
                <div>
                  <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{exam.subject} — {exam.topic}</p>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-xs">{new Date(exam.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: 'var(--accent-purple-light)' }}>{exam.correctAnswers}/{exam.totalQuestions}</p>
                  <p style={{ color: 'var(--text-secondary)' }} className="text-xs">{Math.round((exam.correctAnswers / exam.totalQuestions) * 100)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {stats?.totalQuestionsAttempted === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No activity yet</h3>
          <p>Start practicing exams and using AI features to track your progress here.</p>
          <a href="/exam" className="btn-start">
            Start Practicing →
          </a>
        </div>
      )}

    </div>
  )
}
