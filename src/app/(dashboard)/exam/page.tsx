'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { EXAM_SYLLABUS, getSubjects, getTopics } from '@/lib/examSyllabus'
import { buildRateLimitMessage } from '@/lib/rateLimitClient'
import UpgradeNudgeModal from '@/components/UpgradeNudgeModal'

// ── Types ──────────────────────────────────────────────────────────────────────
interface PYQQuestion {
  id: string
  question: string
  options: string[]
  correctAnswer: string
  solution: string
  type: 'MCQ' | 'Numerical'
  difficulty: 'Easy' | 'Medium' | 'Hard'
  tag: string
  numericalAnswer: string | null
}

// ── Constants ──────────────────────────────────────────────────────────────────
const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed'] as const
const QUESTION_COUNTS = [5, 10, 15, 20, 30]

const TAG_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  'Most Repeated': { bg: '#1a0a2e', color: '#c084fc', border: '#7c3aed' },
  'High Weightage': { bg: '#0a1a0a', color: '#4ade80', border: '#16a34a' },
  default:         { bg: '#0a1020', color: '#60a5fa', border: '#2563eb' },
}
function tagStyle(tag: string) {
  if (tag.startsWith('PYQ')) return { bg: '#1a0a0a', color: '#f87171', border: '#dc2626' }
  return TAG_COLORS[tag] ?? TAG_COLORS.default
}

export default function PracticeTestsPage() {
  const router = useRouter()

  // ── Setup state ────────────────────────────────────────────────────────────
  const [step, setStep] = useState<'setup' | 'test' | 'results'>('setup')
  const [exam, setExam] = useState('JEE Main')
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<typeof DIFFICULTIES[number]>('Mixed')
  const [questionCount, setQuestionCount] = useState(10)

  // ── Test state ─────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<PYQQuestion[]>([])
  const [currentIdx, setCurrentIdx] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [numericalInputs, setNumericalInputs] = useState<Record<string, string>>({})
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<Date | null>(null)

  // Derived setup values
  const subjects = exam ? getSubjects(exam) : []
  const topics = exam && subject ? getTopics(exam, subject) : []
  const examList = Object.keys(EXAM_SYLLABUS)

  // Auto-select first subject / topic when exam changes
  useEffect(() => {
    const subs = getSubjects(exam)
    const firstSub = subs[0] ?? ''
    setSubject(firstSub)
    const tops = firstSub ? getTopics(exam, firstSub) : []
    setTopic(tops[0] ?? '')
  }, [exam])

  useEffect(() => {
    if (!subject) return
    const tops = getTopics(exam, subject)
    setTopic(tops[0] ?? '')
  }, [subject, exam])

  // Timer
  useEffect(() => {
    if (step !== 'test') return
    setTimeLeft(questionCount * 2 * 60)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); handleFinish(); return 0 }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [step])

  function formatTime(s: number) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  async function handleStart() {
    if (!exam || !subject || !topic) { setError('Please select exam, subject, and topic'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/student/practice-tests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam, subject, topic, difficulty, numberOfQuestions: questionCount }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 429 || data?.error === 'limit_reached' || data?.error === 'rate_limit_exceeded') {
          setShowUpgradeModal(true)
        } else {
          setError(data.error || 'Failed to generate questions')
        }
        return
      }
      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        setError('Could not generate questions — please try again.'); return
      }
      setQuestions(data.questions)
      setAnswers({}); setNumericalInputs({}); setMarkedForReview(new Set())
      setCurrentIdx(0)
      startTimeRef.current = new Date()
      setStep('test')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally { setLoading(false) }
  }

  function handleFinish() {
    if (timerRef.current) clearInterval(timerRef.current)
    setStep('results')
  }

  function handleRetry() {
    setStep('setup'); setQuestions([]); setAnswers({})
    setNumericalInputs({}); setMarkedForReview(new Set()); setCurrentIdx(0)
  }

  // ── SETUP UI ───────────────────────────────────────────────────────────────
  if (step === 'setup') {
    const card = { background: '#160D2E', border: '1px solid #2D1B69', borderRadius: 14, padding: 20 }
    const label = { color: '#C4B5FD', fontSize: 12, fontWeight: 600, marginBottom: 8, display: 'block' as const }
    const sel = { background: '#0F0A1E', border: '1px solid #2D1B69', color: '#F5F3FF', borderRadius: 10, padding: '10px 14px', width: '100%', fontSize: 14 }

    return (
      <div style={{ background: '#080412', minHeight: '100vh', padding: '32px 20px', maxWidth: 760, margin: '0 auto' }}>
        <button onClick={() => router.push('/chat')} style={{ color: '#A78BFA', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', marginBottom: 16 }}>← Back</button>
        <h1 style={{ color: '#F5F3FF', fontSize: 28, fontWeight: 700, marginBottom: 4 }}>📚 Practice Tests</h1>
        <p style={{ color: '#C4B5FD', fontSize: 14, marginBottom: 28 }}>PYQ-based questions for every major Indian exam</p>

        <UpgradeNudgeModal
          isOpen={showUpgradeModal}
          onClose={() => setShowUpgradeModal(false)}
          featureName="Practice Tests"
          currentLimit={1}
          upgradeLimit={10}
          upgradePlan="Pro"
          upgradePrice="₹299/mo"
        />

        <div style={{ ...card, marginBottom: 16 }}>
          <h2 style={{ color: '#F5F3FF', fontSize: 16, marginBottom: 20 }}>Configure your test</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

            {/* Exam */}
            <div>
              <label style={label}>Exam</label>
              <select value={exam} onChange={e => setExam(e.target.value)} style={sel}>
                {examList.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label style={label}>Subject</label>
              <select value={subject} onChange={e => setSubject(e.target.value)} style={sel}>
                {subjects.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Topic */}
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={label}>Topic</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {topics.map(t => (
                  <button key={t} onClick={() => setTopic(t)} style={{
                    padding: '6px 14px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
                    background: topic === t ? '#7C3AED' : '#1E1040',
                    border: `1px solid ${topic === t ? '#7C3AED' : '#2D1B69'}`,
                    color: topic === t ? 'white' : '#C4B5FD',
                  }}>{t}</button>
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label style={label}>Difficulty</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {DIFFICULTIES.map(d => (
                  <button key={d} onClick={() => setDifficulty(d)} style={{
                    padding: '8px 14px', borderRadius: 10, fontSize: 12, cursor: 'pointer',
                    background: difficulty === d ? '#7C3AED' : '#0F0A1E',
                    border: `1px solid ${difficulty === d ? '#7C3AED' : '#2D1B69'}`,
                    color: difficulty === d ? 'white' : '#A78BFA',
                  }}>{d}</button>
                ))}
              </div>
            </div>

            {/* Count */}
            <div>
              <label style={label}>Questions: <span style={{ color: '#A78BFA' }}>{questionCount}</span></label>
              <div style={{ display: 'flex', gap: 8 }}>
                {QUESTION_COUNTS.map(n => (
                  <button key={n} onClick={() => setQuestionCount(n)} style={{
                    padding: '8px 12px', borderRadius: 10, fontSize: 12, cursor: 'pointer',
                    background: questionCount === n ? '#7C3AED' : '#0F0A1E',
                    border: `1px solid ${questionCount === n ? '#7C3AED' : '#2D1B69'}`,
                    color: questionCount === n ? 'white' : '#A78BFA',
                  }}>{n}</button>
                ))}
              </div>
            </div>
          </div>

          {error && <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 10, background: '#450A0A', color: '#F87171', border: '1px solid #7F1D1D', fontSize: 13 }}>{error}</div>}

          <button onClick={handleStart} disabled={loading} style={{
            marginTop: 20, width: '100%', padding: '14px', borderRadius: 12, fontSize: 16,
            fontWeight: 700, color: 'white', cursor: loading ? 'not-allowed' : 'pointer',
            background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
            boxShadow: '0 8px 32px #7C3AED40', border: 'none', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? '⚡ Generating PYQ Questions...' : '🚀 Start Test'}
          </button>

          <p style={{ textAlign: 'center', color: '#6B7280', fontSize: 12, marginTop: 10 }}>
            Timer: {questionCount * 2} minutes · Topic: {topic || '—'} · Exam: {exam}
          </p>
        </div>
      </div>
    )
  }

  // ── TEST UI ────────────────────────────────────────────────────────────────
  if (step === 'test') {
    const q = questions[currentIdx]
    if (!q) return null
    const answered = answers[q.id] !== undefined || numericalInputs[q.id] !== undefined
    const ts = tagStyle(q.tag)

    return (
      <div style={{ background: '#080412', minHeight: '100vh', padding: '20px', maxWidth: 860, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ color: '#A78BFA', fontSize: 14 }}>{subject} · {exam}</div>
          <div style={{
            padding: '6px 16px', borderRadius: 20, fontSize: 14, fontWeight: 700,
            background: timeLeft < 120 ? '#450A0A' : '#160D2E',
            color: timeLeft < 120 ? '#F87171' : '#4ADE80',
            border: `1px solid ${timeLeft < 120 ? '#7F1D1D' : '#166534'}`,
          }}>⏱ {formatTime(timeLeft)}</div>
        </div>

        {/* Progress */}
        <div style={{ background: '#2D1B69', borderRadius: 4, height: 4, marginBottom: 16 }}>
          <div style={{ height: 4, borderRadius: 4, background: 'linear-gradient(90deg,#7C3AED,#4F46E5)', width: `${((currentIdx + 1) / questions.length) * 100}%`, transition: 'width 0.3s' }} />
        </div>

        {/* Question Nav */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
          {questions.map((qu, i) => {
            const isAnswered = answers[qu.id] !== undefined || numericalInputs[qu.id] !== undefined
            const isMarked = markedForReview.has(qu.id)
            return (
              <button key={qu.id} onClick={() => setCurrentIdx(i)} style={{
                width: 36, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
                background: i === currentIdx ? '#7C3AED' : isMarked ? '#92400E' : isAnswered ? '#052E16' : '#0F0A1E',
                border: `1px solid ${i === currentIdx ? '#7C3AED' : isMarked ? '#D97706' : isAnswered ? '#16A34A' : '#2D1B69'}`,
                color: i === currentIdx ? 'white' : isMarked ? '#FCD34D' : isAnswered ? '#4ADE80' : '#9CA3AF',
              }}>{i + 1}</button>
            )
          })}
        </div>

        {/* Question Card */}
        <div style={{ background: '#160D2E', border: '1px solid #2D1B69', borderRadius: 14, padding: 24, marginBottom: 16 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: ts.bg, color: ts.color, border: `1px solid ${ts.border}` }}>🏷 {q.tag}</span>
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: q.difficulty === 'Easy' ? '#052E16' : q.difficulty === 'Hard' ? '#450A0A' : '#451A03', color: q.difficulty === 'Easy' ? '#4ADE80' : q.difficulty === 'Hard' ? '#F87171' : '#FB923C', border: '1px solid currentColor' }}>{q.difficulty}</span>
            <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, background: '#1E1B4B', color: '#A78BFA', border: '1px solid #4338CA' }}>{q.type}</span>
            <span style={{ marginLeft: 'auto', color: '#9CA3AF', fontSize: 13 }}>Q{currentIdx + 1}/{questions.length}</span>
          </div>

          <p style={{ color: '#F5F3FF', fontSize: 17, lineHeight: 1.7, marginBottom: 20 }}>{q.question}</p>

          {q.type === 'MCQ' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {q.options.map(opt => {
                const label = opt.charAt(0)
                const isSelected = answers[q.id] === label
                return (
                  <button key={opt} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: label }))} style={{
                    padding: '12px 16px', borderRadius: 10, textAlign: 'left', cursor: 'pointer',
                    background: isSelected ? 'linear-gradient(135deg,#7C3AED20,#4F46E515)' : '#0F0A1E',
                    border: `1px solid ${isSelected ? '#7C3AED' : '#2D1B69'}`,
                    color: isSelected ? '#F5F3FF' : '#C4B5FD', fontSize: 14,
                    boxShadow: isSelected ? '0 0 12px #7C3AED30' : 'none',
                  }}>{opt}</button>
                )
              })}
            </div>
          ) : (
            <div>
              <label style={{ color: '#C4B5FD', fontSize: 13, display: 'block', marginBottom: 8 }}>Enter numerical answer:</label>
              <input
                type="number"
                value={numericalInputs[q.id] ?? ''}
                onChange={e => setNumericalInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                placeholder="Enter your answer"
                style={{ background: '#0F0A1E', border: '1px solid #2D1B69', color: '#F5F3FF', borderRadius: 10, padding: '12px 16px', fontSize: 16, width: '200px' }}
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button onClick={() => setMarkedForReview(prev => { const s = new Set(prev); s.has(q.id) ? s.delete(q.id) : s.add(q.id); return s })} style={{
            padding: '10px 18px', borderRadius: 10, fontSize: 13, cursor: 'pointer',
            background: markedForReview.has(q.id) ? '#451A03' : '#1E1040',
            border: `1px solid ${markedForReview.has(q.id) ? '#D97706' : '#2D1B69'}`,
            color: markedForReview.has(q.id) ? '#FCD34D' : '#A78BFA',
          }}>🔖 {markedForReview.has(q.id) ? 'Marked' : 'Mark for Review'}</button>

          {currentIdx > 0 && (
            <button onClick={() => setCurrentIdx(i => i - 1)} style={{ padding: '10px 18px', borderRadius: 10, fontSize: 13, cursor: 'pointer', background: '#1E1040', border: '1px solid #2D1B69', color: '#A78BFA' }}>← Prev</button>
          )}

          {currentIdx < questions.length - 1 ? (
            <button onClick={() => setCurrentIdx(i => i + 1)} style={{ padding: '10px 18px', borderRadius: 10, fontSize: 13, cursor: 'pointer', background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', border: 'none', color: 'white', fontWeight: 600, marginLeft: 'auto' }}>Next →</button>
          ) : (
            <button onClick={handleFinish} style={{ padding: '10px 24px', borderRadius: 10, fontSize: 14, cursor: 'pointer', background: 'linear-gradient(135deg,#059669,#047857)', border: 'none', color: 'white', fontWeight: 700, marginLeft: 'auto' }}>✅ Submit Test</button>
          )}
        </div>
      </div>
    )
  }

  // ── RESULTS UI ─────────────────────────────────────────────────────────────
  const correct = questions.filter(q => {
    if (q.type === 'Numerical') return numericalInputs[q.id] === q.numericalAnswer
    return answers[q.id] === q.correctAnswer
  }).length
  const wrong = questions.filter(q => {
    const a = q.type === 'Numerical' ? numericalInputs[q.id] : answers[q.id]
    return a !== undefined && a !== q.correctAnswer && a !== q.numericalAnswer
  }).length
  const skipped = questions.length - correct - wrong
  const pct = Math.round((correct / questions.length) * 100)

  return (
    <div style={{ background: '#080412', minHeight: '100vh', padding: '32px 20px', maxWidth: 800, margin: '0 auto' }}>
      {/* Score Card */}
      <div style={{ background: 'linear-gradient(135deg,#160D2E,#1E1040)', border: '1px solid #2D1B69', borderRadius: 16, padding: 28, marginBottom: 20, textAlign: 'center' }}>
        <div style={{ fontSize: 64, fontWeight: 800, background: pct >= 70 ? 'linear-gradient(135deg,#4ADE80,#059669)' : pct >= 40 ? 'linear-gradient(135deg,#FCD34D,#D97706)' : 'linear-gradient(135deg,#F87171,#DC2626)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{pct}%</div>
        <div style={{ color: '#F5F3FF', fontSize: 20, fontWeight: 600, marginBottom: 20 }}>Score: {correct}/{questions.length}</div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
          {[['✅ Correct', correct, '#4ADE80'], ['❌ Wrong', wrong, '#F87171'], ['⏭ Skipped', skipped, '#9CA3AF']].map(([label, val, color]) => (
            <div key={label as string} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 28, fontWeight: 700, color: color as string }}>{val as number}</div>
              <div style={{ fontSize: 13, color: '#9CA3AF' }}>{label as string}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Per-question breakdown */}
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ color: '#F5F3FF', fontSize: 16, marginBottom: 12 }}>📋 Question Breakdown</h2>
        {questions.map((q, i) => {
          const userAns = q.type === 'Numerical' ? numericalInputs[q.id] : answers[q.id]
          const isCorrect = userAns === (q.type === 'Numerical' ? q.numericalAnswer : q.correctAnswer)
          const notAttempted = userAns === undefined
          const ts2 = tagStyle(q.tag)
          return (
            <details key={q.id} style={{ marginBottom: 10, background: '#160D2E', border: `1px solid ${isCorrect ? '#16A34A' : notAttempted ? '#2D1B69' : '#7F1D1D'}`, borderRadius: 12 }}>
              <summary style={{ padding: '14px 18px', cursor: 'pointer', color: '#F5F3FF', fontSize: 14, listStyle: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>{isCorrect ? '✅' : notAttempted ? '⏭' : '❌'}</span>
                <span style={{ flex: 1 }}>Q{i + 1}: {q.question.slice(0, 70)}...</span>
                <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, background: ts2.bg, color: ts2.color, border: `1px solid ${ts2.border}` }}>{q.tag}</span>
              </summary>
              <div style={{ padding: '0 18px 16px', borderTop: '1px solid #2D1B69' }}>
                <p style={{ color: '#C4B5FD', marginTop: 12, fontSize: 13 }}>Your answer: <strong style={{ color: notAttempted ? '#9CA3AF' : isCorrect ? '#4ADE80' : '#F87171' }}>{userAns ?? 'Not attempted'}</strong></p>
                <p style={{ color: '#C4B5FD', fontSize: 13 }}>Correct answer: <strong style={{ color: '#4ADE80' }}>{q.correctAnswer}</strong></p>
                <div style={{ marginTop: 10, padding: 12, background: '#0F0A1E', borderRadius: 8, color: '#A78BFA', fontSize: 13, lineHeight: 1.6 }}>💡 {q.solution}</div>
              </div>
            </details>
          )
        })}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={handleRetry} style={{ flex: 1, padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', background: 'linear-gradient(135deg,#7C3AED,#4F46E5)', border: 'none', color: 'white' }}>🔄 New Test</button>
        <button onClick={() => router.push(`/chat?prompt=${encodeURIComponent(`I got ${pct}% on ${exam} ${subject} ${topic}. Give me a revision plan.`)}`)} style={{ flex: 1, padding: 14, borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', background: '#160D2E', border: '1px solid #2D1B69', color: '#A78BFA' }}>📖 Get Revision Plan</button>
      </div>
    </div>
  )
}

