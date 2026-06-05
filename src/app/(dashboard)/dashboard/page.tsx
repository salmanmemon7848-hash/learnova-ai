'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRole } from '@/contexts/RoleContext'

const activityIcons: Record<string, string> = {
  doubt: '🤔', test: '📝', interview: '🎤', chat: '💬', pitch_deck: '📊', edufinder: '🎓',
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
  if (score >= 70) return { bg: 'rgba(13,148,136,0.15)', text: '#2DD4BF', border: 'rgba(13,148,136,0.35)' }
  if (score >= 40) return { bg: 'rgba(251,191,36,0.12)', text: '#FBBF24', border: 'rgba(251,191,36,0.3)' }
  return { bg: 'rgba(239,68,68,0.12)', text: '#F87171', border: 'rgba(239,68,68,0.3)' }
}

interface DashboardData {
  userRole?: 'student' | 'founder'
  recentActivity: any[]
  streak: { current_streak: number; longest_streak: number; total_sessions: number }
  practiceTests: any[]
  allTimePracticeTestCount?: number
  avgTestScore: number
  interviewSessions: any[]
  allTimeInterviewCount?: number
  latestInterviewAt?: string | null
  doubtHistory: any[]
  savedFiles: any[]
}

type TabKey = 'tests' | 'interviews' | 'doubts' | 'files'

/* ── Skeleton ── */
function SkeletonCard() {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16, padding: '20px 22px',
      backgroundImage: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 75%)',
      backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite',
    }}>
      <div style={{ height: 10, width: '45%', background: 'rgba(255,255,255,0.06)', borderRadius: 6, marginBottom: 14 }} />
      <div style={{ height: 28, width: '30%', background: 'rgba(255,255,255,0.08)', borderRadius: 6, marginBottom: 8 }} />
      <div style={{ height: 9, width: '55%', background: 'rgba(255,255,255,0.04)', borderRadius: 6 }} />
    </div>
  )
}

/* ── Stat Card ── */
function StatCard({ emoji, label, value, sub, accent = 'purple' }: {
  emoji: string; label: string; value: string | number; sub: string; accent?: 'purple' | 'teal' | 'amber'
}) {
  const colors = {
    purple: { border: 'rgba(124,58,237,0.25)', bg: 'rgba(124,58,237,0.08)', val: '#A78BFA', glow: 'rgba(124,58,237,0.1)' },
    teal:   { border: 'rgba(13,148,136,0.3)',  bg: 'rgba(13,148,136,0.08)',  val: '#2DD4BF', glow: 'rgba(13,148,136,0.12)' },
    amber:  { border: 'rgba(251,191,36,0.25)', bg: 'rgba(251,191,36,0.06)', val: '#FBBF24', glow: 'rgba(251,191,36,0.08)' },
  }[accent]

  return (
    <div
      style={{
        background: `linear-gradient(135deg, rgba(16,13,34,0.8) 0%, ${colors.bg} 100%)`,
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        border: `1px solid ${colors.border}`,
        borderRadius: 16, padding: '18px 20px',
        boxShadow: `0 4px 20px ${colors.glow}`,
        transition: 'all 0.2s ease', cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 12px 32px ${colors.glow}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = `0 4px 20px ${colors.glow}`;
      }}
    >
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 10 }}>{emoji} {label}</p>
      <p style={{ fontSize: 30, fontWeight: 800, color: colors.val, marginBottom: 4, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{sub}</p>
    </div>
  )
}

/* ── Modal ── */
function Modal({ title, content, onClose }: { title: string; content: string; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(6,2,16,0.8)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}
      onClick={onClose}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'rgba(13,9,32,0.95)', backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 20, padding: 28, maxWidth: 700, width: '100%', maxHeight: '80vh',
          overflowY: 'auto', position: 'relative',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <h3 style={{ color: '#F5F3FF', fontSize: 16, fontWeight: 600, margin: 0, flex: 1, paddingRight: 12 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: '#9CA3AF', borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 14, flexShrink: 0,
            }}
          >✕</button>
        </div>
        <pre style={{ color: '#C4B5FD', fontSize: 13, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, lineHeight: 1.7 }}>{content}</pre>
      </div>
    </div>
  )
}

function EmptyState({ emoji, message }: { emoji: string; message: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px', color: 'rgba(255,255,255,0.3)' }}>
      <div style={{ fontSize: 36, marginBottom: 12 }}>{emoji}</div>
      <p style={{ fontSize: 13, lineHeight: 1.5 }}>{message}</p>
    </div>
  )
}

/* ── Row item used in tabs ── */
function ItemRow({ leftEmoji, title, sub, right, onClick }: {
  leftEmoji: string; title: string; sub: string; right?: React.ReactNode; onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 12,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s',
      }}
      onMouseEnter={e => { if (onClick) { e.currentTarget.style.borderColor = 'rgba(124,58,237,0.25)'; e.currentTarget.style.background = 'rgba(124,58,237,0.04)'; } }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}
    >
      <span style={{
        fontSize: 18, width: 36, height: 36, flexShrink: 0,
        background: 'rgba(255,255,255,0.04)', borderRadius: 9,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>{leftEmoji}</span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: '#F5F3FF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</p>
        <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>{sub}</p>
      </div>
      {right}
    </div>
  )
}

function ScorePill({ score }: { score: number }) {
  const c = scoreColor(score)
  return (
    <span style={{
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      padding: '3px 11px', borderRadius: 999, fontSize: 12, fontWeight: 700, flexShrink: 0,
    }}>
      {score}%
    </span>
  )
}

/* ── MAIN ── */
export default function DashboardPage() {
  const { user } = useAuth()
  const { role } = useRole()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [data, setData] = useState<DashboardData | null>(null)
  const [activeTab, setActiveTab] = useState<TabKey>('tests')
  const [expandedDoubt, setExpandedDoubt] = useState<string | null>(null)
  const [modalFile, setModalFile] = useState<{ title: string; content: string } | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const userName = user?.user_metadata?.name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there'
  const todayStr = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })

  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true); setError(false)
      const res = await fetch('/api/dashboard')
      if (!res.ok) throw new Error('Failed')
      setData(await res.json())
    } catch { setError(true) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])
  useEffect(() => {
    fetch('/api/usage').then(r => r.json()).catch(() => ({}))
  }, [])

  const handleDeleteFile = async (id: string) => {
    if (!confirm('Delete this saved file? This cannot be undone.')) return
    setDeletingId(id)
    try {
      await fetch(`/api/files/${id}`, { method: 'DELETE' })
      setData(prev => prev ? { ...prev, savedFiles: prev.savedFiles.filter(f => f.id !== id) } : prev)
    } catch { alert('Failed to delete. Please try again.') }
    finally { setDeletingId(null) }
  }

  const tabs = [
    { key: 'tests',      label: '📝 Tests' },
    { key: 'interviews', label: '🎤 Interviews' },
    { key: 'doubts',     label: '🤔 Doubts' },
    { key: 'files',      label: '📄 Files' },
  ] as const

  const userRole = role || data?.userRole || 'student'
  const activeTabs = useMemo(
    () => userRole === 'founder' ? tabs.filter(t => t.key === 'files') : tabs,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userRole]
  )
  useEffect(() => {
    if (!activeTabs.some(t => t.key === activeTab)) setActiveTab(activeTabs[0].key)
  }, [activeTab, activeTabs])

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <style>{`@keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }`}</style>

      {/* Welcome header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'clamp(20px, 3vw, 26px)', fontWeight: 800, color: '#F5F3FF', margin: 0 }}>
          Welcome back, {userName} 👋
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, marginTop: 4 }}>
          {todayStr} — Here's your learning summary
        </p>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>⚠️</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Could not load dashboard. Please refresh.</p>
          <button
            onClick={fetchDashboard}
            style={{
              marginTop: 16, background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
              color: '#fff', border: 'none', borderRadius: 10, padding: '9px 22px',
              cursor: 'pointer', fontSize: 13, fontWeight: 600,
              boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
            }}
          >
            Retry
          </button>
        </div>
      ) : data ? (
        <>
          {/* Stat cards */}
          <div style={{ display: 'grid', gap: 12, marginBottom: 24 }}
            className="grid grid-cols-2 sm:grid-cols-4">
            <StatCard emoji="🔥" label="Current Streak"  value={data.streak.current_streak}   sub={`Longest: ${data.streak.longest_streak}d`} accent="amber" />
            <StatCard emoji="📚" label="Total Sessions"  value={data.streak.total_sessions}    sub="All-time activities" accent="purple" />
            <StatCard emoji="✅" label="Avg Test Score"  value={data.avgTestScore > 0 ? `${data.avgTestScore}%` : '—'} sub={`${data.allTimePracticeTestCount ?? data.practiceTests.length} tests taken`} accent="teal" />
            <StatCard emoji="🎤" label="Interviews Done" value={data.allTimeInterviewCount ?? data.interviewSessions.length} sub={data.latestInterviewAt ? `Last: ${timeAgo(data.latestInterviewAt)}` : 'None yet'} accent="purple" />
          </div>

          {/* Recent Activity */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: '20px 22px', marginBottom: 20,
          }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: '#F5F3FF', margin: '0 0 16px' }}>Recent Activity</h2>
            {data.recentActivity.length === 0 ? (
              <EmptyState emoji="📭" message="No recent activity — start a session to see it here!" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {data.recentActivity.map((item: any, i: number) => (
                  <div key={item.id || i} style={{
                    display: 'flex', gap: 12, alignItems: 'center',
                    padding: '10px 0',
                    borderBottom: i < data.recentActivity.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  }}>
                    <span style={{
                      fontSize: 16, width: 32, height: 32, flexShrink: 0,
                      background: 'rgba(255,255,255,0.04)', borderRadius: 8,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {activityIcons[item.activity_type] || '📌'}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: 0, fontSize: 13, color: '#F5F3FF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.title}
                      </p>
                      <p style={{ margin: 0, fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                        {timeAgo(item.created_at)}
                      </p>
                    </div>
                    {item.activity_type === 'test' && item.metadata?.score != null && (
                      <ScorePill score={item.metadata.score} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tabs section */}
          <div style={{
            background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: 16, padding: '20px 22px',
          }}>
            {/* Tab row */}
            <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none', marginBottom: 18 }}>
              {activeTabs.map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    flexShrink: 0, padding: '7px 16px', borderRadius: 9, fontSize: 13,
                    fontWeight: activeTab === tab.key ? 600 : 400, cursor: 'pointer',
                    transition: 'all 0.15s',
                    background: activeTab === tab.key
                      ? 'linear-gradient(135deg, rgba(13,148,136,0.2) 0%, rgba(124,58,237,0.15) 100%)'
                      : 'rgba(255,255,255,0.04)',
                    color: activeTab === tab.key ? '#F5F3FF' : 'rgba(255,255,255,0.5)',
                    border: activeTab === tab.key ? '1px solid rgba(13,148,136,0.35)' : '1px solid rgba(255,255,255,0.06)',
                    boxShadow: activeTab === tab.key ? '0 0 12px rgba(13,148,136,0.15)' : 'none',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tests tab */}
            {activeTab === 'tests' && (
              data.practiceTests.length === 0
                ? <EmptyState emoji="📝" message="No practice tests yet — take your first test!" />
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.practiceTests.map((test: any) => (
                      <ItemRow
                        key={test.id}
                        leftEmoji="📝"
                        title={`${test.subject} — ${test.exam_type}`}
                        sub={`${test.total_questions} questions • ${timeAgo(test.created_at)}`}
                        right={<ScorePill score={test.score} />}
                      />
                    ))}
                  </div>
            )}

            {/* Interviews tab */}
            {activeTab === 'interviews' && (
              data.interviewSessions.length === 0
                ? <EmptyState emoji="🎤" message="No interview sessions yet — practice your first interview!" />
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.interviewSessions.map((iv: any) => (
                      <ItemRow
                        key={iv.id}
                        leftEmoji="🎤"
                        title={`${iv.interview_type || 'Interview'} Session`}
                        sub={`${iv.language || 'English'} • ${timeAgo(iv.created_at)}`}
                        right={
                          <span style={{
                            background: 'rgba(124,58,237,0.15)', color: '#A78BFA',
                            border: '1px solid rgba(124,58,237,0.3)',
                            padding: '3px 11px', borderRadius: 999, fontSize: 12, fontWeight: 700, flexShrink: 0,
                          }}>
                            {iv.overall_score ?? '—'}/10
                          </span>
                        }
                      />
                    ))}
                  </div>
            )}

            {/* Doubts tab */}
            {activeTab === 'doubts' && (
              data.doubtHistory.length === 0
                ? <EmptyState emoji="🤔" message="No doubts solved yet — ask your first question!" />
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.doubtHistory.map((doubt: any) => (
                      <div key={doubt.id} style={{
                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: 12, overflow: 'hidden',
                      }}>
                        <ItemRow
                          leftEmoji="🤔"
                          title={doubt.question || 'Question'}
                          sub={`${doubt.subject || 'General'} • ${timeAgo(doubt.created_at)}`}
                          onClick={() => setExpandedDoubt(expandedDoubt === doubt.id ? null : doubt.id)}
                          right={
                            <span style={{
                              background: 'rgba(124,58,237,0.1)', color: '#A78BFA',
                              border: '1px solid rgba(124,58,237,0.2)',
                              padding: '3px 9px', borderRadius: 6, fontSize: 11, flexShrink: 0,
                            }}>
                              {expandedDoubt === doubt.id ? '▲' : '▼'}
                            </span>
                          }
                        />
                        {expandedDoubt === doubt.id && (
                          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '14px 16px', background: 'rgba(124,58,237,0.04)' }}>
                            <p style={{ margin: 0, fontSize: 13, color: '#C4B5FD', whiteSpace: 'pre-wrap', lineHeight: 1.7 }}>
                              {doubt.answer || 'No answer recorded.'}
                            </p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
            )}

            {/* Files tab */}
            {activeTab === 'files' && (
              data.savedFiles.length === 0
                ? <EmptyState emoji="📄" message="No saved files yet — save generated files to see them here!" />
                : <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {data.savedFiles.map((file: any) => {
                      const typeLabels: Record<string, string> = { pitch_deck: 'Pitch Deck', business_idea: 'Business Idea' }
                      return (
                        <ItemRow
                          key={file.id}
                          leftEmoji="📄"
                          title={file.title}
                          sub={`${typeLabels[file.file_type] || file.file_type} • ${timeAgo(file.created_at)}`}
                          right={
                            <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                              <button
                                onClick={() => setModalFile({ title: file.title, content: file.content })}
                                style={{
                                  background: 'rgba(124,58,237,0.12)', color: '#A78BFA',
                                  border: '1px solid rgba(124,58,237,0.3)',
                                  borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer',
                                  transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.22)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.12)'; }}
                              >View</button>
                              <button
                                onClick={() => handleDeleteFile(file.id)}
                                disabled={deletingId === file.id}
                                style={{
                                  background: 'rgba(239,68,68,0.08)', color: '#F87171',
                                  border: '1px solid rgba(239,68,68,0.25)',
                                  borderRadius: 8, padding: '5px 12px', fontSize: 12, cursor: 'pointer',
                                  opacity: deletingId === file.id ? 0.5 : 1,
                                  transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => { if (deletingId !== file.id) e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                              >{deletingId === file.id ? '…' : 'Delete'}</button>
                            </div>
                          }
                        />
                      )
                    })}
                  </div>
            )}
          </div>
        </>
      ) : null}

      {modalFile && <Modal title={modalFile.title} content={modalFile.content} onClose={() => setModalFile(null)} />}
    </div>
  )
}
