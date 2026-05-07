'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'

// ── Helpers ───────────────────────────────────────────────────────────────────

const activityIcons: Record<string, string> = {
  doubt: '🤔',
  test: '📝',
  interview: '🎤',
  chat: '💬',
  pitch_deck: '📊',
  edufinder: '🎓',
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  return `${days}d ago`
}

function scoreColor(score: number) {
  if (score >= 70) return { bg: '#065f46', text: '#6ee7b7', border: '#047857' }
  if (score >= 40) return { bg: '#78350f', text: '#fcd34d', border: '#92400e' }
  return { bg: '#7f1d1d', text: '#fca5a5', border: '#991b1b' }
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface DashboardData {
  recentActivity: any[]
  streak: { current_streak: number; longest_streak: number; total_sessions: number }
  practiceTests: any[]
  avgTestScore: number
  interviewSessions: any[]
  doubtHistory: any[]
  savedFiles: any[]
}

// ── Skeleton Components ───────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{
      background: '#13151e',
      border: '1px solid #2a2d3a',
      borderRadius: 12,
      padding: '20px 24px',
      animation: 'pulse 1.5s ease-in-out infinite',
    }}>
      <div style={{ height: 12, width: '50%', background: '#2a2d3a', borderRadius: 6, marginBottom: 16 }} />
      <div style={{ height: 28, width: '35%', background: '#2a2d3a', borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 10, width: '45%', background: '#1e2130', borderRadius: 6 }} />
    </div>
  )
}

function SkeletonLine({ width = '100%' }: { width?: string }) {
  return (
    <div style={{
      height: 14,
      width,
      background: '#2a2d3a',
      borderRadius: 6,
      animation: 'pulse 1.5s ease-in-out infinite',
      marginBottom: 8,
    }} />
  )
}

// ── Stat Card ─────────────────────────────────────────────────────────────────

function StatCard({ emoji, label, value, sub }: { emoji: string; label: string; value: string | number; sub: string }) {
  return (
    <div style={{
      background: '#13151e',
      border: '1px solid #2a2d3a',
      borderRadius: 12,
      padding: '20px 24px',
      transition: 'border-color 0.2s',
    }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = '#5b21b6')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2d3a')}
    >
      <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 8 }}>{emoji} {label}</p>
      <p style={{ fontSize: 28, fontWeight: 700, color: '#a78bfa', marginBottom: 4, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 12, color: '#6b7280' }}>{sub}</p>
    </div>
  )
}

// ── Modal ─────────────────────────────────────────────────────────────────────

function Modal({ title, content, onClose }: { title: string; content: string; onClose: () => void }) {
  return (
    <div
      className="modal-overlay"
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        className="modal-content"
        onClick={e => e.stopPropagation()}
        style={{
          background: '#13151e', border: '1px solid #2a2d3a', borderRadius: 16,
          padding: 28, maxWidth: 700, width: '100%', maxHeight: '80vh',
          overflowY: 'auto', position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <h3 style={{ color: '#e2e8f0', fontSize: 16, fontWeight: 600, margin: 0, flex: 1, paddingRight: 12 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{ background: '#2a2d3a', border: 'none', color: '#9ca3af', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
          >✕</button>
        </div>
        <pre style={{ color: '#c4b5fd', fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, lineHeight: 1.6 }}>{content}</pre>
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)
  const [activeTab, setActiveTab] = useState<'tests' | 'interviews' | 'doubts' | 'files'>('tests')
  const [expandedDoubt, setExpandedDoubt] = useState<string | null>(null)
  const [modalFile, setModalFile] = useState<{ title: string; content: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [, setUsageSummary] = useState<Record<string, any>>({})

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'

  const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(false)
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed')
      const json = await res.json()
      setData(json)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])
  useEffect(() => {
    fetch('/api/usage')
      .then((r) => r.json())
      .then((data) => setUsageSummary(data.usage || {}))
      .catch(() => setUsageSummary({}))
  }, [])

  const handleDeleteFile = async (id: string) => {
    if (!confirm('Delete this saved file? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await fetch(`/api/files/${id}`, { method: 'DELETE' })
      setData(prev => prev ? { ...prev, savedFiles: prev.savedFiles.filter(f => f.id !== id) } : prev)
    } catch {
      alert('Failed to delete. Please try again.')
    } finally {
      setDeletingId(null)
    }
  }

  const tabs = [
    { key: 'tests', label: '📝 Tests' },
    { key: 'interviews', label: '🎤 Interviews' },
    { key: 'doubts', label: '🤔 Doubts' },
    { key: 'files', label: '📄 Saved Files' },
  ] as const

  return (
    <div className="page-container" style={{ maxWidth: 900, margin: '0 auto', padding: '16px' }}>
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (min-width: 768px) {
          .stats-grid { grid-template-columns: repeat(4, 1fr) !important; }
          .dashboard-padding { padding: 24px 32px !important; }
        }
      `}</style>

      {/* ── Section 1: Welcome + Stats ───────────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#e2e8f0', margin: 0 }}>
          Welcome back, {userName} 👋
        </h1>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: 4 }}>
          {todayStr} — Here's your learning summary
        </p>
      </div>

      {loading ? (
        <>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        </>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6b7280' }}>
          <p style={{ fontSize: 32 }}>⚠️</p>
          <p>Could not load dashboard data. Please refresh.</p>
          <button
            onClick={fetchDashboard}
            style={{ marginTop: 12, background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 20px', cursor: 'pointer', fontSize: 13 }}
          >
            Retry
          </button>
        </div>
      ) : data ? (
        <>
          {/* Stat Cards */}
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            <StatCard emoji="🔥" label="Current Streak" value={data.streak.current_streak} sub={`Longest: ${data.streak.longest_streak} days`} />
            <StatCard emoji="📚" label="Total Sessions" value={data.streak.total_sessions} sub="All-time activities" />
            <StatCard emoji="✅" label="Avg Test Score" value={data.avgTestScore > 0 ? `${data.avgTestScore}%` : '—'} sub={`${data.practiceTests.length} tests taken`} />
            <StatCard emoji="🎤" label="Interviews Done" value={data.interviewSessions.length} sub={data.interviewSessions.length > 0 ? `Last: ${timeAgo(data.interviewSessions[0].created_at)}` : 'None yet'} />
          </div>

          {/* ── Section 2: Recent Activity Feed ──────────────────────────────── */}
          <div style={{ background: '#13151e', border: '1px solid #2a2d3a', borderRadius: 12, padding: '20px 24px', marginBottom: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px 0' }}>Recent Activity</h2>

            {data.recentActivity.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
                <p style={{ fontSize: 32, margin: 0 }}>📭</p>
                <p style={{ marginTop: 8, fontSize: 13 }}>No recent activity in the last 24 hours — start a session to see it here!</p>
              </div>
            ) : (
              <div>
                {data.recentActivity.map((item: any, i: number) => (
                  <div key={item.id || i} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '12px 0',
                    borderBottom: i < data.recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  }}>
                    <span style={{
                      fontSize: 18, minWidth: 32, height: 32,
                      background: '#1e2130', borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      {activityIcons[item.activity_type] || '📌'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: '#6b7280', marginTop: 2 }}>
                        {timeAgo(item.created_at)}
                      </p>
                    </div>
                    {item.activity_type === 'test' && item.metadata?.score != null && (() => {
                      const c = scoreColor(item.metadata.score)
                      return (
                        <span style={{
                          background: c.bg, color: c.text, border: `1px solid ${c.border}`,
                          padding: '2px 10px', borderRadius: 20, fontSize: 11, flexShrink: 0,
                        }}>
                          {item.metadata.score}%
                        </span>
                      )
                    })()}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Section 3: Tabs ───────────────────────────────────────────────── */}
          <div style={{ background: '#13151e', border: '1px solid #2a2d3a', borderRadius: 12, padding: '20px 24px' }}>
            {/* Tab Row */}
            <div className="tabs-row" style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', marginBottom: 20 }}>
              {tabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flexShrink: 0,
                    padding: '7px 16px',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: activeTab === tab.key ? 600 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: activeTab === tab.key ? '#7c3aed' : '#1e2130',
                    color: activeTab === tab.key ? '#fff' : '#9ca3af',
                    border: activeTab === tab.key ? '1px solid #7c3aed' : '1px solid #2a2d3a',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab 1 — Practice Tests */}
            {activeTab === 'tests' && (
              <div>
                {data.practiceTests.length === 0 ? (
                  <EmptyState emoji="📝" message="No practice tests yet — take your first test!" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.practiceTests.map((test: any) => {
                      const c = scoreColor(test.score)
                      return (
                        <div key={test.id} style={{
                          background: '#0f1117', border: '1px solid #2a2d3a', borderRadius: 10,
                          padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                          <span style={{ fontSize: 20 }}>📝</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>
                              {test.subject} — {test.exam_type}
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                              {test.total_questions} questions • {timeAgo(test.created_at)}
                            </p>
                          </div>
                          <span style={{
                            background: c.bg, color: c.text, border: `1px solid ${c.border}`,
                            padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, flexShrink: 0,
                          }}>
                            {test.score}%
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 2 — Interview Sessions */}
            {activeTab === 'interviews' && (
              <div>
                {data.interviewSessions.length === 0 ? (
                  <EmptyState emoji="🎤" message="No interview sessions yet — practice your first interview!" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.interviewSessions.map((iv: any) => (
                      <div key={iv.id} style={{
                        background: '#0f1117', border: '1px solid #2a2d3a', borderRadius: 10,
                        padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
                      }}>
                        <span style={{ fontSize: 20 }}>🎤</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>
                            {iv.interview_type || 'Interview'} Session
                          </p>
                          <p style={{ margin: 0, fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                            {iv.language || 'English'} • {timeAgo(iv.created_at)}
                          </p>
                        </div>
                        <span style={{
                          background: '#1e1b4b', color: '#a78bfa', border: '1px solid #4338ca',
                          padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, flexShrink: 0,
                        }}>
                          {iv.overall_score ?? '—'}/10
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 3 — Doubt History */}
            {activeTab === 'doubts' && (
              <div>
                {data.doubtHistory.length === 0 ? (
                  <EmptyState emoji="🤔" message="No doubts solved yet — ask your first question!" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.doubtHistory.map((doubt: any) => (
                      <div key={doubt.id} style={{
                        background: '#0f1117', border: '1px solid #2a2d3a', borderRadius: 10, overflow: 'hidden',
                      }}>
                        <div
                          style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
                          onClick={() => setExpandedDoubt(expandedDoubt === doubt.id ? null : doubt.id)}
                        >
                          <span style={{ fontSize: 20 }}>🤔</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {doubt.question || 'Question'}
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                              {doubt.subject || 'General'} • {timeAgo(doubt.created_at)}
                            </p>
                          </div>
                          <span style={{
                            background: '#1e1b4b', color: '#a78bfa', border: '1px solid #2a2d3a',
                            padding: '3px 10px', borderRadius: 6, fontSize: 11, flexShrink: 0,
                          }}>
                            {expandedDoubt === doubt.id ? '▲ Hide' : '▼ Answer'}
                          </span>
                        </div>
                        {expandedDoubt === doubt.id && (
                          <div style={{
                            borderTop: '1px solid #2a2d3a',
                            padding: '14px 18px',
                            background: '#13151e',
                          }}>
                            <p style={{ margin: 0, fontSize: 13, color: '#c4b5fd', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                              {doubt.answer || 'No answer recorded.'}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4 — Saved Files */}
            {activeTab === 'files' && (
              <div>
                {data.savedFiles.length === 0 ? (
                  <EmptyState emoji="📄" message="No saved files yet — save generated files to see them here!" />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.savedFiles.map((file: any) => {
                      const typeLabels: Record<string, string> = {
                        pitch_deck: 'Pitch Deck',
                        business_idea: 'Business Idea',
                      }
                      return (
                        <div key={file.id} style={{
                          background: '#0f1117', border: '1px solid #2a2d3a', borderRadius: 10,
                          padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12,
                        }}>
                          <span style={{ fontSize: 20 }}>📄</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {file.title}
                            </p>
                            <p style={{ margin: 0, fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                              {typeLabels[file.file_type] || file.file_type} • {timeAgo(file.created_at)}
                            </p>
                          </div>
                          <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                            <button
                              onClick={() => setModalFile({ title: file.title, content: file.content })}
                              style={{
                                background: '#1e1b4b', color: '#a78bfa', border: '1px solid #4338ca',
                                borderRadius: 7, padding: '5px 12px', fontSize: 12, cursor: 'pointer',
                              }}
                            >
                              View
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id)}
                              disabled={deletingId === file.id}
                              style={{
                                background: '#450a0a', color: '#fca5a5', border: '1px solid #7f1d1d',
                                borderRadius: 7, padding: '5px 12px', fontSize: 12, cursor: 'pointer',
                                opacity: deletingId === file.id ? 0.5 : 1,
                              }}
                            >
                              {deletingId === file.id ? '…' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* File content modal */}
      {modalFile && (
        <Modal title={modalFile.title} content={modalFile.content} onClose={() => setModalFile(null)} />
      )}
    </div>
  )
}

function EmptyState({ emoji, message }: { emoji: string; message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '40px 0', color: '#6b7280' }}>
      <p style={{ fontSize: 32, margin: 0 }}>{emoji}</p>
      <p style={{ marginTop: 8, fontSize: 13 }}>{message}</p>
    </div>
  )
}
