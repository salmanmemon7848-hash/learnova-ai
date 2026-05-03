'use client'

import { useState, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import { validateInput, buildRateLimitMessage } from '@/lib/rateLimitClient'

const STAGES = ['Idea', 'MVP', 'Early Revenue', 'Scaling']
const INDUSTRIES = [
  'EdTech', 'FinTech', 'HealthTech', 'AgriTech', 'E-commerce',
  'SaaS', 'D2C', 'Logistics', 'Social Media', 'Gaming', 'Climate Tech', 'Other',
]

const questions = [
  { key: 'what', label: 'What does your startup do?', placeholder: 'e.g., A tiffin delivery app for college students', type: 'text' },
  { key: 'problem', label: 'What problem does it solve?', placeholder: 'Describe the pain point...', type: 'textarea' },
  { key: 'customer', label: 'Who is your target customer?', placeholder: 'e.g., College students aged 18-25 in metro cities', type: 'text' },
  { key: 'revenue', label: 'How does it make money?', placeholder: 'e.g., Subscription model, commission per order', type: 'text' },
  { key: 'competitors', label: 'Who are your main competitors?', placeholder: 'List 2-3 main competitors...', type: 'textarea' },
  { key: 'different', label: 'What makes you different?', placeholder: 'Your unique value proposition...', type: 'textarea' },
  { key: 'gomarket', label: 'What is your go-to-market plan?', placeholder: 'How will you acquire your first 1000 users?', type: 'textarea' },
  { key: 'team', label: 'What is your founding team?', placeholder: 'Name + Role (e.g., John - CEO, Jane - CTO)', type: 'textarea' },
  { key: 'raise', label: 'How much money are you looking to raise?', placeholder: 'e.g., ₹50 Lakhs or "Bootstrapped"', type: 'text' },
  { key: 'funds', label: 'What will you use the funds for?', placeholder: 'e.g., 40% product, 30% marketing, 30% operations', type: 'textarea' },
]

type Step = 'setup' | 'wizard' | 'generating' | 'evaluation'



export default function PitchDeckPage() {
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('setup')
  const [stage, setStage] = useState('')
  const [industry, setIndustry] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(questions.map(q => [q.key, '']))
  )
  const [showEmptyWarning, setShowEmptyWarning] = useState(false)
  
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [warning, setWarning] = useState('')

  const resetAll = () => {
    setStep('setup')
    setStage('')
    setIndustry('')
    setCurrentQuestion(0)
    setAnswers(Object.fromEntries(questions.map(q => [q.key, ''])))
    setResult(null)
    setLoading(false)
  }

  const goNext = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(q => q + 1)
    } else {
      handleGenerate()
    }
  }, [currentQuestion])



  const handleGenerate = async () => {
    const packed = Object.values(answers).join(' ')
    const inputError = validateInput(packed, 'pitch-deck')
    if (inputError) {
      setError(inputError)
      return
    }
    setLoading(true)
    setStep('generating')
    setError('')
    setWarning('')
    try {
      const response = await fetch('/api/pitch-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, stage, industry }),
      })
      const data = await response.json()
      if (response.ok && data.result) {
        const headerWarning = response.headers.get('X-RateLimit-Warning')
        if (headerWarning) setWarning(headerWarning)
        setResult(data.result)
        setStep('evaluation')
      } else {
        setError(response.status === 429 || data?.error === 'rate_limit_exceeded' ? buildRateLimitMessage(data) : (data.error || 'Failed to evaluate pitch'))
        setStep('wizard')
      }
    } catch (error) {
      console.error('Pitch evaluation failed:', error)
      setError('Failed to evaluate pitch. Please try again.')
      setStep('wizard')
    } finally {
      setLoading(false)
    }
  }

  // ─── SETUP STEP ──────────────────────────────────────────────────────────────
  if (step === 'setup') {
    return (
      <div className="max-w-3xl mx-auto" style={{ color: 'var(--foreground)' }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading mb-2">
            Get Your Pitch Evaluated by an AI Investor
          </h1>
          <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
            Answer 10 questions and receive a brutally honest investor evaluation with a score, red flags, and rewrite suggestions.
          </p>
        </div>

        <div className="rounded-xl p-8" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          {error && <div className="mb-4 text-sm" style={{ background: '#450A0A', border: '1px solid #7F1D1D', color: '#F87171', borderRadius: 8, padding: '10px 12px' }}>{error}</div>}
          {warning && <div className="mb-4 text-sm" style={{ background: '#451A03', border: '1px solid #92400E', color: '#FBBF24', borderRadius: 8, padding: '10px 12px' }}>{warning}</div>}
          {/* Stage Selection */}
          <div className="mb-7">
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--foreground-secondary)' }}>
              Startup Stage *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {STAGES.map(s => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStage(s)}
                  className="py-3 px-4 rounded-lg border text-left font-medium transition-all"
                  style={{
                    backgroundColor: stage === s ? 'var(--accent)' : 'var(--background)',
                    borderColor: stage === s ? 'var(--accent)' : 'var(--border)',
                    color: stage === s ? '#ffffff' : 'var(--foreground)',
                  }}
                >
                  {s === 'Idea' ? '💡' : s === 'MVP' ? '🔧' : s === 'Early Revenue' ? '📈' : '🚀'} {s}
                </button>
              ))}
            </div>
          </div>

          {/* Industry Selection */}
          <div className="mb-8">
            <label className="block text-sm font-semibold mb-3" style={{ color: 'var(--foreground-secondary)' }}>
              Industry / Sector *
            </label>
            <div className="flex flex-wrap gap-2">
              {INDUSTRIES.map(ind => (
                <button
                  key={ind}
                  type="button"
                  onClick={() => setIndustry(ind)}
                  className="py-1.5 px-4 rounded-full border text-sm font-medium transition-all"
                  style={{
                    backgroundColor: industry === ind ? 'var(--accent)' : 'var(--background)',
                    borderColor: industry === ind ? 'var(--accent)' : 'var(--border)',
                    color: industry === ind ? '#ffffff' : 'var(--foreground)',
                  }}
                >
                  {ind}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setStep('wizard')}
            disabled={!stage || !industry}
            className="w-full py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            Start Pitch Evaluation →
          </button>
        </div>
      </div>
    )
  }

  // ─── WIZARD STEP ─────────────────────────────────────────────────────────────
  if (step === 'wizard') {
    const q = questions[currentQuestion]
    const progress = ((currentQuestion + 1) / questions.length) * 100
    const currentAnswer = answers[q.key]

    return (
      <div className="max-w-3xl mx-auto" style={{ color: 'var(--foreground)' }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading mb-2">
            Tell us about your startup
          </h1>
          <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>
            Stage: <strong>{stage}</strong> · Industry: <strong>{industry}</strong>
          </p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm mb-2" style={{ color: 'var(--foreground-secondary)' }}>
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: 'var(--accent)' }}
            />
          </div>
        </div>

        <div className="rounded-xl p-8" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-2xl font-semibold mb-4">{q.label}</h2>

          <div className="flex flex-col gap-2">
            {q.type === 'textarea' ? (
              <textarea
                rows={4}
                value={answers[q.key] ?? ''}
                onChange={e => {
                  setShowEmptyWarning(false)
                  setAnswers(prev => ({
                    ...prev,
                    [q.key]: e.target.value,
                  }))
                }}
                placeholder={q.placeholder}
                className="w-full rounded-xl border border-current/20 bg-transparent px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            ) : (
              <input
                type="text"
                value={answers[q.key] ?? ''}
                onChange={e => {
                  setShowEmptyWarning(false)
                  setAnswers(prev => ({
                    ...prev,
                    [q.key]: e.target.value,
                  }))
                }}
                placeholder={q.placeholder}
                className="w-full rounded-xl border border-current/20 bg-transparent px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            )}
          </div>

          {showEmptyWarning && (
            <p className="text-xs mt-2 flex items-center gap-1" style={{ color: '#f87171' }}>
              <span className="w-2 h-2 rounded-full inline-block flex-shrink-0" style={{ backgroundColor: '#f87171' }} />
              Please type your answer before continuing
            </p>
          )}

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={() => currentQuestion === 0 ? setStep('setup') : setCurrentQuestion(currentQuestion - 1)}
              className="flex items-center gap-2 px-6 py-3 border rounded-lg font-semibold hover:opacity-80 transition-all"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <ChevronLeft className="w-4 h-4" /> Back
            </button>

            {currentQuestion < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => {
                  if (!answers[q.key]?.trim()) {
                    setShowEmptyWarning(true);
                  } else {
                    goNext();
                  }
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!answers[q.key]?.trim()) {
                    setShowEmptyWarning(true);
                  } else {
                    handleGenerate();
                  }
                }}
                className="flex-1 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--highlight)' }}
              >
                🚀 Evaluate My Pitch
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ─── GENERATING ──────────────────────────────────────────────────────────────
  if (step === 'generating') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ color: 'var(--foreground)' }}>
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4"
            style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
          />
          <h2 className="text-2xl font-semibold mb-2">Evaluating Your Pitch...</h2>
          <p style={{ color: 'var(--foreground-muted)' }}>Our AI investor is reviewing your pitch — about 30 seconds.</p>
        </div>
      </div>
    )
  }

  // ─── EVALUATION RESULT ───────────────────────────────────────────────────────
  if (step === 'evaluation' && result) {
    return (
      <div className="max-w-4xl mx-auto" style={{ color: 'var(--foreground)' }}>
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
          <h1 className="text-3xl font-bold font-heading">Pitch Evaluation Report</h1>
          <button
            type="button"
            onClick={resetAll}
            className="px-6 py-2 border rounded-lg font-semibold hover:opacity-80 transition-all text-sm"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            ← Evaluate Another Pitch
          </button>
        </div>

        {/* Score + Fundability Hero */}
        <div
          className="rounded-xl p-8 mb-6 text-center"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div className="text-6xl font-bold mb-3" style={{ color: 'var(--accent)' }}>
            {result.overall_score}/100
          </div>
          <div
            className={`inline-block px-5 py-2 rounded-full font-bold text-base mb-4 ${
              result.fundability === 'High' ? 'bg-green-500/20 text-green-400' :
              result.fundability === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
              result.fundability === 'Low' ? 'bg-red-500/20 text-red-400' :
              'bg-orange-500/20 text-orange-400'
            }`}
          >
            {result.fundability === 'High' ? '🟢 Fundable' :
             result.fundability === 'Medium' ? '🟡 Needs Work' :
             result.fundability === 'Low' ? '🔴 Not Ready' : '⚠️ Pre-Fundable'}
          </div>
          <p className="text-base italic" style={{ color: 'var(--foreground-secondary)' }}>
            💭 Investor's first thought: &quot;{result.investor_first_impression}&quot;
          </p>
          <div className="flex justify-center gap-8 mt-5 flex-wrap text-sm" style={{ color: 'var(--foreground-muted)' }}>
            <span>💪 Strongest: <strong style={{ color: 'var(--foreground)' }}>{result.strongest_slide}</strong></span>
            <span>⚠️ Weakest: <strong style={{ color: 'var(--foreground)' }}>{result.weakest_slide}</strong></span>
          </div>
        </div>

        {/* 6 Dimension Cards */}
        <h3 className="text-xl font-bold mb-4">📊 Pitch Evaluation by Dimension</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.entries(result.dimensions || {}).map(([key, val]: [string, any]) => (
            <div
              key={key}
              className="rounded-xl p-5"
              style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-sm">
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </h4>
                <span className={`text-xl font-bold ${val.score >= 7 ? 'text-green-400' : val.score >= 5 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {val.score}/10
                </span>
              </div>
              <div className="w-full h-2 rounded-full mb-3" style={{ backgroundColor: 'var(--border)' }}>
                <div
                  className="h-2 rounded-full"
                  style={{
                    width: `${val.score * 10}%`,
                    backgroundColor: val.score >= 7 ? '#10b981' : val.score >= 5 ? '#f59e0b' : '#ef4444',
                  }}
                />
              </div>
              <p className="text-sm mb-2" style={{ color: 'var(--foreground-secondary)' }}>{val.feedback}</p>
              <div
                className="text-sm p-3 rounded-lg"
                style={{ backgroundColor: 'var(--background)', color: 'var(--foreground-muted)' }}
              >
                💡 {val.improvement}
              </div>
            </div>
          ))}
        </div>

        {/* YOUR ANSWERS REVIEW CARDS - ADDED */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-bold text-lg mb-4">🎤 Your Answers</h3>
          <div className="space-y-4">
            {questions.map((q, i) => {
              const ans = answers[q.key]
              return (
                <div key={q.key} className="py-4 border-t first:border-t-0 first:pt-0" style={{ borderColor: 'var(--border)' }}>
                  <p className="text-xs font-semibold mb-1 uppercase tracking-wide" style={{ color: 'var(--foreground-secondary)' }}>
                    Q{i + 1} · {q.label}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--foreground)' }}>
                    {ans || <span className="opacity-30 italic">No answer provided</span>}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        {/* Red & Green Flags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid #ef444440' }}>
            <h3 className="font-bold text-lg mb-4">🚩 Red Flags</h3>
            {(result.red_flags || []).map((f: string, i: number) => (
              <div key={i} className="flex items-start gap-2 mb-3 text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                <span className="text-red-400 flex-shrink-0 mt-0.5">❌</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
          <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid #10b98140' }}>
            <h3 className="font-bold text-lg mb-4">✅ Green Flags</h3>
            {(result.green_flags || []).map((f: string, i: number) => (
              <div key={i} className="flex items-start gap-2 mb-3 text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                <span className="text-green-400 flex-shrink-0 mt-0.5">✅</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Investor Questions */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-bold text-lg mb-4">🤔 Tough Questions Investors Will Ask You</h3>
          <div className="space-y-3">
            {(result.investor_questions || []).map((q: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
                <span
                  className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 text-white"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  Q{i + 1}
                </span>
                <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>{q}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Rewrite Suggestions */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-bold text-lg mb-4">✍️ Rewrite Suggestions</h3>
          <div className="space-y-5">
            {(result.rewrite_suggestions || []).map((r: any, i: number) => (
              <div key={i} className="border-l-4 pl-4" style={{ borderColor: 'var(--accent)' }}>
                <h4 className="font-semibold mb-2">📝 {r.section}</h4>
                <div
                  className="text-sm p-3 rounded-lg mb-2"
                  style={{ backgroundColor: '#ef444415', color: '#ef4444' }}
                >
                  ⚠️ Issue: {r.current_issue}
                </div>
                <div
                  className="text-sm p-3 rounded-lg"
                  style={{ backgroundColor: '#10b98115', color: '#10b981' }}
                >
                  ✅ Better version: {r.suggested_rewrite}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Reality Check + Next Milestone + Verdict */}
        <div
          className="rounded-xl p-6 mb-6"
          style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <h3 className="font-bold text-lg mb-3">📈 Market Reality Check</h3>
          <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>{result.market_reality_check}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div
            className="rounded-xl p-6"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <h3 className="font-bold text-lg mb-3">🎯 Next Milestone</h3>
            <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>{result.next_milestone}</p>
          </div>
          <div
            className="rounded-xl p-6"
            style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--accent)' }}
          >
            <h3 className="font-bold text-lg mb-3">⚖️ Final Verdict</h3>
            <p className="text-sm italic" style={{ color: 'var(--foreground-secondary)' }}>{result.final_verdict}</p>
          </div>
        </div>

        {/* CTA & RETAKE PITCH EVALUATION */}
        <div className="text-center pb-8 flex flex-col sm:flex-row justify-center items-center gap-4">
          <button
            type="button"
            onClick={resetAll}
            className="px-8 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all w-full sm:w-auto"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            🔄 Evaluate Another Pitch
          </button>
          
          <button
            type="button"
            onClick={resetAll}
            className="px-8 py-3 rounded-lg font-semibold border hover:opacity-80 transition-all w-full sm:w-auto"
            style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
          >
            ↺ Retake Pitch Evaluation
          </button>
        </div>
      </div>
    )
  }

  return null
}
