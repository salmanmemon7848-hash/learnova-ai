'use client'

import { useState } from 'react'
import { GraduationCap, RotateCcw, Loader2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

type UserType = 'Student' | 'Parent'
type EduLevel = 'School (Class 1–12)' | 'Undergraduate (After 12th)' | 'Postgraduate / MBA' | 'Diploma / Vocational Course'
type BudgetOption = 'Under ₹50,000' | '₹50,000 – ₹2,00,000' | '₹2,00,000 – ₹5,00,000' | '₹5,00,000+'

interface WizardAnswers {
  userType: UserType | null
  eduLevel: EduLevel | null
  fields: string[]
  budget: BudgetOption | null
  userCity: string
  userState: string
  userPincode: string
  entrance: string
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TOTAL_STEPS = 6

const FIELD_OPTIONS = [
  'Engineering', 'Medical', 'Law', 'Commerce & MBA',
  'Arts & Design', 'Science', 'Government & Defence',
  'Computers & IT', 'Agriculture', 'Teaching',
]

const BUDGET_OPTIONS: BudgetOption[] = [
  'Under ₹50,000',
  '₹50,000 – ₹2,00,000',
  '₹2,00,000 – ₹5,00,000',
  '₹5,00,000+',
]

// ─── Design tokens (copied from exam/practice-test pages) ─────────────────────

const CARD_BASE: React.CSSProperties = {
  background: 'linear-gradient(135deg, #160D2E, #1E1040)',
  border: '1px solid #2D1B69',
  borderRadius: '16px',
  boxShadow: '0 0 40px #7C3AED18',
}

const OPTION_CARD_BASE: React.CSSProperties = {
  background: '#0F0A1E',
  border: '1px solid #2D1B69',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
}

const OPTION_CARD_ACTIVE: React.CSSProperties = {
  background: 'linear-gradient(135deg, #7C3AED20, #4F46E515)',
  border: '1px solid #7C3AED',
  boxShadow: '0 0 12px #7C3AED30',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  const pct = (step / TOTAL_STEPS) * 100
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[13px]" style={{ color: '#A78BFA' }}>Step {step} of {TOTAL_STEPS}</span>
        <span className="text-[12px]" style={{ color: '#9CA3AF' }}>{Math.round(pct)}% complete</span>
      </div>
      <div className="w-full rounded-full" style={{ height: '6px', background: '#2D1B69' }}>
        <div
          className="rounded-full transition-all duration-500"
          style={{
            height: '6px',
            width: `${pct}%`,
            background: 'linear-gradient(90deg, #7C3AED, #4F46E5)',
            boxShadow: '0 0 8px #7C3AED80',
          }}
        />
      </div>
    </div>
  )
}

// ─── Continue Button ──────────────────────────────────────────────────────────

function ContinueButton({ onClick, label = 'Continue →', disabled = false }: {
  onClick: () => void
  label?: string
  disabled?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full mt-6 flex items-center justify-center gap-2 text-white text-[16px] font-semibold rounded-[12px] transition-all disabled:opacity-40"
      style={{
        background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
        height: '52px',
        boxShadow: disabled ? 'none' : '0 8px 32px #7C3AED40',
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.filter = 'brightness(1.1)'
          e.currentTarget.style.transform = 'translateY(-1px)'
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.filter = 'brightness(1)'
        e.currentTarget.style.transform = 'translateY(0)'
      }}
    >
      {label}
    </button>
  )
}

// ─── Input field (same style as exam page inputs) ─────────────────────────────

function StyledInput({
  value, onChange, placeholder, type = 'text', maxLength,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  type?: string
  maxLength?: number
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => {
        let v = e.target.value
        if (type === 'number' || type === 'tel') v = v.replace(/\D/g, '')
        if (maxLength) v = v.slice(0, maxLength)
        onChange(v)
      }}
      placeholder={placeholder}
      className="w-full rounded-[10px] px-3.5 py-2.5 text-[14px] transition-all"
      style={{
        background: '#0F0A1E',
        border: '1px solid #2D1B69',
        color: '#F5F3FF',
        outline: 'none',
      }}
      onFocus={(e) => {
        e.target.style.borderColor = '#7C3AED'
        e.target.style.boxShadow = '0 0 0 3px #7C3AED20'
      }}
      onBlur={(e) => {
        e.target.style.borderColor = '#2D1B69'
        e.target.style.boxShadow = 'none'
      }}
    />
  )
}

// ─── Inline error text (same style as exam page error) ───────────────────────

function FieldError({ msg }: { msg: string }) {
  return (
    <p className="mt-1.5 text-[12px]" style={{ color: '#F87171' }}>{msg}</p>
  )
}

// ─── Institution Card ─────────────────────────────────────────────────────────

function InstitutionCard({ block }: { block: string }) {
  const lines = block.trim().split('\n').filter(l => l.trim())
  return (
    <div
      className="p-5 rounded-[14px] mb-4"
      style={{ background: '#0F0A1E', border: '1px solid #2D1B69' }}
    >
      {lines.map((line, i) => (
        <p
          key={i}
          className={`${i === 0 ? 'text-[15px] font-semibold mb-2' : 'text-[13px] mb-1'} leading-relaxed`}
          style={{ color: i === 0 ? '#F5F3FF' : '#C4B5FD' }}
        >
          {line}
        </p>
      ))}
    </div>
  )
}

// ─── Parse results into NEARBY / NATIONAL blocks ──────────────────────────────

function parseResults(raw: string) {
  const nearbyMatch = raw.match(/---SECTION: NEARBY---([\s\S]*?)(?=---SECTION: NATIONAL---|$)/)
  const nationalMatch = raw.match(/---SECTION: NATIONAL---([\s\S]*)$/)

  const splitBlocks = (text: string) =>
    text.split(/\n---\n/).map(b => b.replace(/^---\n/, '').replace(/\n---$/, '').trim()).filter(Boolean)

  return {
    nearby: nearbyMatch ? splitBlocks(nearbyMatch[1]) : [],
    national: nationalMatch ? splitBlocks(nationalMatch[1]) : [],
    noLocalMatch: nearbyMatch
      ? nearbyMatch[1].includes('No strong local matches')
      : false,
  }
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function EduFinderPage() {
  const [step, setStep] = useState(1)
  const [answers, setAnswers] = useState<WizardAnswers>({
    userType: null,
    eduLevel: null,
    fields: [],
    budget: null,
    userCity: '',
    userState: '',
    userPincode: '',
    entrance: '',
  })
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [structured, setStructured] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const resetWizard = () => {
    setStep(1)
    setAnswers({
      userType: null, eduLevel: null, fields: [], budget: null,
      userCity: '', userState: '', userPincode: '', entrance: '',
    })
    setResults(null)
    setStructured(false)
    setError(null)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/edufinder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong.')
      setResults(data.recommendations)
      setStructured(data.structured === true)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch recommendations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px' }}>
        <div className="flex items-center gap-3 mb-6">
          <GraduationCap size={28} style={{ color: '#A78BFA' }} />
          <h1 className="text-[28px] font-semibold" style={{ color: '#F5F3FF' }}>EduFinder</h1>
        </div>
        <div className="rounded-[16px] p-10 flex flex-col items-center gap-4" style={CARD_BASE}>
          <Loader2 size={36} className="animate-spin" style={{ color: '#A78BFA' }} />
          <p className="text-[16px] font-medium animate-pulse" style={{ color: '#C4B5FD' }}>
            Finding the best institutions for you...
          </p>
          <p className="text-[13px]" style={{ color: '#9CA3AF' }}>
            Searching live data and generating personalised recommendations
          </p>
        </div>
      </div>
    )
  }

  // ── Results screen ─────────────────────────────────────────────────────────

  if (results) {
    const priorityColor: Record<string, string> = { high: '#EF4444', medium: '#F59E0B', low: '#10B981' }
    const demandColor: Record<string, string> = { high: '#10B981', medium: '#F59E0B', low: '#EF4444' }
    const readinessColor: Record<string, string> = { 'ready': '#10B981', 'partially-ready': '#F59E0B', 'not-ready-yet': '#EF4444' }

    if (structured && results && typeof results === 'object') {
      const r = results
      const readinessKey = (r.readiness_assessment?.overall_readiness || '').toLowerCase().replace(/ /g, '-')
      return (
        <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px' }}>
          <div className="flex items-center gap-3 mb-8">
            <GraduationCap size={28} style={{ color: '#A78BFA' }} />
            <h1 className="text-[28px] font-semibold" style={{ color: '#F5F3FF' }}>Your EduFinder Results</h1>
          </div>

          {/* Readiness */}
          {r.readiness_assessment && (
            <div className="rounded-[16px] p-6 mb-5" style={{ ...CARD_BASE, borderColor: readinessColor[readinessKey] + '60' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[17px] font-semibold" style={{ color: '#F5F3FF' }}>Your Readiness Assessment</h3>
                <div className="text-[28px] font-bold" style={{ color: readinessColor[readinessKey] }}>{r.readiness_assessment.readiness_score}/100</div>
              </div>
              <div className="inline-block px-3 py-1 rounded-full text-[13px] font-semibold mb-3" style={{ background: readinessColor[readinessKey] + '20', color: readinessColor[readinessKey] }}>
                {r.readiness_assessment.overall_readiness}
              </div>
              <p className="text-[14px] mb-3" style={{ color: '#C4B5FD' }}>{r.readiness_assessment.honest_feedback}</p>
              {r.readiness_assessment.improvement_needed?.length > 0 && (
                <div>
                  <p className="text-[13px] font-semibold mb-2" style={{ color: '#F5F3FF' }}>Improvements needed:</p>
                  {r.readiness_assessment.improvement_needed.map((item: string, i: number) => (
                    <div key={i} className="text-[13px] mb-1" style={{ color: '#C4B5FD' }}>📌 {item}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Institutions */}
          <h3 className="text-[18px] font-semibold mb-4" style={{ color: '#F5F3FF' }}>🏛️ Top Matching Institutions</h3>
          {r.top_institutions?.map((inst: any, i: number) => {
            const matchColor = inst.student_profile_match >= 80 ? '#10B981' : inst.student_profile_match >= 60 ? '#F59E0B' : '#EF4444'
            return (
              <div key={i} className="rounded-[16px] p-5 mb-4" style={{ background: '#0F0A1E', border: '1px solid #2D1B69' }}>
                <div className="flex items-center gap-3 mb-3" style={{ flexWrap: 'wrap' }}>
                  <span className="text-[13px] font-bold" style={{ color: '#A78BFA' }}>#{inst.rank}</span>
                  <h3 className="text-[16px] font-semibold flex-1" style={{ color: '#F5F3FF' }}>{inst.name}</h3>
                  <span className="text-[12px] font-bold px-3 py-1 rounded-full" style={{ background: matchColor + '20', color: matchColor }}>{inst.student_profile_match}% match</span>
                </div>
                <div className="grid grid-cols-2 gap-1 mb-3 text-[12px]" style={{ color: '#C4B5FD' }}>
                  <span>📍 {inst.location}</span>
                  <span>🎓 {inst.type}</span>
                  <span>💰 {inst.fees_per_year}/year</span>
                  <span>⭐ NIRF: {inst.nirf_ranking}</span>
                  <span>🎯 {inst.entrance_required}</span>
                  <span className="font-semibold" style={{ color: inst.admission_difficulty === 'Highly Competitive' ? '#EF4444' : '#F59E0B' }}>📊 {inst.admission_difficulty}</span>
                </div>
                <div className="p-3 rounded-[10px] mb-2" style={{ background: 'rgba(16,185,129,.07)', border: '1px solid rgba(16,185,129,.2)' }}>
                  <p className="text-[12px] font-semibold mb-1" style={{ color: '#10B981' }}>✅ Why it suits you:</p>
                  <p className="text-[13px]" style={{ color: '#C4B5FD' }}>{inst.why_good_match}</p>
                </div>
                <div className="p-3 rounded-[10px] mb-2" style={{ background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.2)' }}>
                  <p className="text-[12px] font-semibold mb-1" style={{ color: '#F59E0B' }}>⚠️ Honest downside:</p>
                  <p className="text-[13px]" style={{ color: '#C4B5FD' }}>{inst.why_might_not_fit}</p>
                </div>
                {inst.scholarship_available && inst.scholarship_available !== 'No' && (
                  <div className="text-[12px] px-3 py-2 rounded-[8px]" style={{ background: 'rgba(124,58,237,.15)', color: '#A78BFA' }}>💡 {inst.scholarship_available}</div>
                )}
              </div>
            )
          })}

          {/* Field Analysis */}
          {r.field_analysis && (
            <div className="rounded-[16px] p-5 mb-4" style={CARD_BASE}>
              <h3 className="text-[17px] font-semibold mb-3" style={{ color: '#F5F3FF' }}>📈 Field Reality — {r.field_analysis.chosen_field}</h3>
              <div className="flex gap-3 mb-3" style={{ flexWrap: 'wrap' }}>
                <span className="text-[12px] px-3 py-1 rounded-full font-semibold" style={{ background: (demandColor[r.field_analysis.market_demand?.toLowerCase()] || '#7C3AED') + '20', color: demandColor[r.field_analysis.market_demand?.toLowerCase()] || '#A78BFA' }}>{r.field_analysis.market_demand} Demand</span>
                <span className="text-[13px]" style={{ color: '#C4B5FD' }}>💰 Avg Starting: {r.field_analysis.avg_starting_salary}</span>
              </div>
              <p className="text-[13px] mb-3" style={{ color: '#C4B5FD' }}>💬 {r.field_analysis.honest_reality}</p>
              <p className="text-[12px] font-semibold mb-2" style={{ color: '#F5F3FF' }}>Top Hiring Companies:</p>
              <div className="flex gap-2" style={{ flexWrap: 'wrap' }}>
                {r.field_analysis.top_companies_hiring?.map((c: string, i: number) => (
                  <span key={i} className="text-[12px] px-3 py-1 rounded-full" style={{ background: '#2D1B69', color: '#C4B5FD' }}>{c}</span>
                ))}
              </div>
            </div>
          )}

          {/* Action Plan */}
          {r.action_plan?.length > 0 && (
            <div className="rounded-[16px] p-5 mb-4" style={CARD_BASE}>
              <h3 className="text-[17px] font-semibold mb-3" style={{ color: '#F5F3FF' }}>✅ Your Action Plan</h3>
              {r.action_plan.map((a: any, i: number) => (
                <div key={i} className="flex gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0" style={{ background: '#7C3AED', color: '#fff' }}>{a.priority}</div>
                  <div>
                    <p className="text-[14px] font-semibold mb-1" style={{ color: '#F5F3FF' }}>{a.action}</p>
                    <p className="text-[12px] mb-1" style={{ color: '#A78BFA' }}>📅 Deadline: {a.deadline}</p>
                    <p className="text-[12px]" style={{ color: '#9CA3AF' }}>{a.why_important}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Budget + Final Advice */}
          <div className="grid grid-cols-1 gap-4 mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {r.budget_reality_check && (
              <div className="rounded-[16px] p-5" style={CARD_BASE}>
                <h3 className="text-[15px] font-semibold mb-2" style={{ color: '#F5F3FF' }}>💰 Budget Reality Check</h3>
                <p className="text-[13px]" style={{ color: '#C4B5FD' }}>{r.budget_reality_check}</p>
              </div>
            )}
            {r.final_advice && (
              <div className="rounded-[16px] p-5" style={{ ...CARD_BASE, borderColor: '#7C3AED60' }}>
                <h3 className="text-[15px] font-semibold mb-2" style={{ color: '#F5F3FF' }}>🎯 Final Guidance</h3>
                <p className="text-[13px]" style={{ color: '#C4B5FD' }}>{r.final_advice}</p>
              </div>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <button onClick={resetWizard} className="flex items-center gap-2 text-[14px] font-medium px-6 py-3 rounded-[10px] transition-all" style={{ border: '1px solid #4338CA', color: '#A78BFA' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#1E1B4B' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
              <RotateCcw size={15} /> 🔄 Start Over
            </button>
          </div>
        </div>
      )
    }

    // Fallback: raw text
    const { nearby, national, noLocalMatch } = parseResults(typeof results === 'string' ? results : JSON.stringify(results))
    return (
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px' }}>
        <div className="flex items-center gap-3 mb-8">
          <GraduationCap size={28} style={{ color: '#A78BFA' }} />
          <h1 className="text-[28px] font-semibold" style={{ color: '#F5F3FF' }}>Your EduFinder Results</h1>
        </div>
        <div className="mb-8">
          <h2 className="text-[20px] font-semibold mb-4" style={{ color: '#F5F3FF' }}>📍 Institutions Near {answers.userCity || 'Your City'}</h2>
          {noLocalMatch || nearby.length === 0 ? (
            <div className="p-4 rounded-[12px] text-[14px]" style={{ background: '#0F0A1E', border: '1px solid #2D1B69', color: '#9CA3AF' }}>No strong local matches found — consider the national picks below.</div>
          ) : (nearby.map((block, i) => <InstitutionCard key={i} block={block} />))}
        </div>
        <div className="mb-6">
          <h2 className="text-[20px] font-semibold mb-4" style={{ color: '#F5F3FF' }}>🇮🇳 Top Picks Across India</h2>
          {national.length === 0 ? (
            <div className="rounded-[16px] p-6" style={CARD_BASE}>
              <pre className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: '#C4B5FD', fontFamily: 'inherit' }}>{typeof results === 'string' ? results : JSON.stringify(results, null, 2)}</pre>
            </div>
          ) : (national.map((block, i) => <InstitutionCard key={i} block={block} />))}
        </div>
        <div className="flex justify-center mt-6">
          <button onClick={resetWizard} className="flex items-center gap-2 text-[14px] font-medium px-6 py-3 rounded-[10px] transition-all" style={{ border: '1px solid #4338CA', color: '#A78BFA' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#1E1B4B' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}>
            <RotateCcw size={15} /> 🔄 Start Over
          </button>
        </div>
      </div>
    )
  }

  // ── Error screen ───────────────────────────────────────────────────────────

  if (error) {
    return (
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px' }}>
        <div
          className="p-4 rounded-[10px] text-[14px]"
          style={{ background: '#450A0A', color: '#F87171', border: '1px solid #7F1D1D' }}
        >
          {error}
          <button className="block mt-2 text-[13px] underline" onClick={resetWizard}>
            Start over
          </button>
        </div>
      </div>
    )
  }

  // ── Wizard screen ──────────────────────────────────────────────────────────

  return (
    <div style={{ maxWidth: '760px', margin: '0 auto', padding: '32px 20px' }}>
      <div className="flex items-center gap-3 mb-2">
        <GraduationCap size={28} style={{ color: '#A78BFA' }} />
        <h1 className="text-[28px] font-semibold" style={{ color: '#F5F3FF' }}>EduFinder</h1>
      </div>
      <p className="text-[14px] mb-8" style={{ color: '#C4B5FD' }}>
        Discover the right school, college, or coaching institute across India
      </p>

      <div className="rounded-[16px] p-7" style={CARD_BASE}>
        <ProgressBar step={step} />
        {step === 1 && <Step1 answers={answers} setAnswers={setAnswers} setStep={setStep} />}
        {step === 2 && <Step2 answers={answers} setAnswers={setAnswers} setStep={setStep} />}
        {step === 3 && <Step3 answers={answers} setAnswers={setAnswers} setStep={setStep} />}
        {step === 4 && <Step4 answers={answers} setAnswers={setAnswers} setStep={setStep} />}
        {step === 5 && <Step5 answers={answers} setAnswers={setAnswers} setStep={setStep} />}
        {step === 6 && <Step6 answers={answers} setAnswers={setAnswers} handleSubmit={handleSubmit} setStep={setStep} />}
      </div>
    </div>
  )
}

// ─── Step 1 — Who Are You? ────────────────────────────────────────────────────

function Step1({ answers, setAnswers, setStep }: {
  answers: WizardAnswers
  setAnswers: React.Dispatch<React.SetStateAction<WizardAnswers>>
  setStep: React.Dispatch<React.SetStateAction<number>>
}) {
  const options: UserType[] = ['Student', 'Parent']
  return (
    <div>
      <h2 className="text-[22px] font-semibold mb-1" style={{ color: '#F5F3FF' }}>
        Hello! 👋 Welcome to EduFinder
      </h2>
      <p className="text-[14px] mb-5" style={{ color: '#C4B5FD' }}>
        I&apos;ll help you find the perfect institution in just a few steps.
      </p>
      <p className="text-[15px] font-medium mb-4" style={{ color: '#E9D5FF' }}>
        Are you a Student or a Parent looking for your child?
      </p>
      <div className="flex gap-4">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => setAnswers(a => ({ ...a, userType: opt }))}
            className="flex-1 py-5 text-[17px] font-semibold rounded-[14px] transition-all"
            style={answers.userType === opt ? OPTION_CARD_ACTIVE : OPTION_CARD_BASE}
          >
            <span style={{ fontSize: '28px', display: 'block', marginBottom: '6px' }}>
              {opt === 'Student' ? '🎓' : '👨‍👩‍👧'}
            </span>
            <span style={{ color: answers.userType === opt ? '#F5F3FF' : '#C4B5FD' }}>{opt}</span>
          </button>
        ))}
      </div>
      <ContinueButton onClick={() => setStep(2)} disabled={!answers.userType} />
    </div>
  )
}

// ─── Step 2 — Education Level ─────────────────────────────────────────────────

function Step2({ answers, setAnswers, setStep }: {
  answers: WizardAnswers
  setAnswers: React.Dispatch<React.SetStateAction<WizardAnswers>>
  setStep: React.Dispatch<React.SetStateAction<number>>
}) {
  const options: EduLevel[] = [
    'School (Class 1–12)',
    'Undergraduate (After 12th)',
    'Postgraduate / MBA',
    'Diploma / Vocational Course',
  ]
  return (
    <div>
      <h2 className="text-[20px] font-semibold mb-5" style={{ color: '#F5F3FF' }}>
        What level of education are you looking for?
      </h2>
      <div className="flex flex-col gap-3">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => setAnswers(a => ({ ...a, eduLevel: opt }))}
            className="w-full text-left px-5 py-4 rounded-[12px] transition-all text-[14px] font-medium"
            style={answers.eduLevel === opt ? OPTION_CARD_ACTIVE : OPTION_CARD_BASE}
          >
            <span style={{ color: answers.eduLevel === opt ? '#F5F3FF' : '#C4B5FD' }}>{opt}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setStep(1)} className="flex-1 mt-6 py-3 rounded-[12px] text-[14px] font-semibold transition-all" style={{ border: '1px solid #2D1B69', color: '#A78BFA' }}>← Back</button>
        <ContinueButton onClick={() => setStep(3)} disabled={!answers.eduLevel} />
      </div>
    </div>
  )
}

// ─── Step 3 — Field of Interest (multi-select) ────────────────────────────────

function Step3({ answers, setAnswers, setStep }: {
  answers: WizardAnswers
  setAnswers: React.Dispatch<React.SetStateAction<WizardAnswers>>
  setStep: React.Dispatch<React.SetStateAction<number>>
}) {
  const toggle = (field: string) => {
    setAnswers(a => ({
      ...a,
      fields: a.fields.includes(field)
        ? a.fields.filter(f => f !== field)
        : [...a.fields, field],
    }))
  }
  return (
    <div>
      <h2 className="text-[20px] font-semibold mb-1" style={{ color: '#F5F3FF' }}>
        What field are you most interested in?
      </h2>
      <p className="text-[13px] mb-5" style={{ color: '#9CA3AF' }}>You can pick more than one.</p>
      <div className="grid grid-cols-2 gap-2.5">
        {FIELD_OPTIONS.map(field => {
          const selected = answers.fields.includes(field)
          return (
            <button
              key={field}
              onClick={() => toggle(field)}
              className="px-4 py-3.5 rounded-[12px] transition-all text-[13px] font-medium text-left"
              style={selected ? OPTION_CARD_ACTIVE : OPTION_CARD_BASE}
            >
              <span style={{ color: selected ? '#F5F3FF' : '#C4B5FD' }}>
                {selected ? '✓ ' : ''}{field}
              </span>
            </button>
          )
        })}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setStep(2)} className="flex-1 mt-6 py-3 rounded-[12px] text-[14px] font-semibold transition-all" style={{ border: '1px solid #2D1B69', color: '#A78BFA' }}>← Back</button>
        <ContinueButton onClick={() => setStep(4)} disabled={answers.fields.length === 0} />
      </div>
    </div>
  )
}

// ─── Step 4 — Annual Budget ───────────────────────────────────────────────────

function Step4({ answers, setAnswers, setStep }: {
  answers: WizardAnswers
  setAnswers: React.Dispatch<React.SetStateAction<WizardAnswers>>
  setStep: React.Dispatch<React.SetStateAction<number>>
}) {
  return (
    <div>
      <h2 className="text-[20px] font-semibold mb-5" style={{ color: '#F5F3FF' }}>
        What is your approximate annual budget for fees?
      </h2>
      <div className="flex flex-col gap-3">
        {BUDGET_OPTIONS.map(opt => (
          <button
            key={opt}
            onClick={() => setAnswers(a => ({ ...a, budget: opt }))}
            className="w-full text-left px-5 py-4 rounded-[12px] transition-all text-[14px] font-medium"
            style={answers.budget === opt ? OPTION_CARD_ACTIVE : OPTION_CARD_BASE}
          >
            <span style={{ color: answers.budget === opt ? '#F5F3FF' : '#C4B5FD' }}>{opt}</span>
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <button onClick={() => setStep(3)} className="flex-1 mt-6 py-3 rounded-[12px] text-[14px] font-semibold transition-all" style={{ border: '1px solid #2D1B69', color: '#A78BFA' }}>← Back</button>
        <ContinueButton onClick={() => setStep(5)} disabled={!answers.budget} />
      </div>
    </div>
  )
}

// ─── Step 5 — Location (text inputs) ─────────────────────────────────────────

function Step5({ answers, setAnswers, setStep }: {
  answers: WizardAnswers
  setAnswers: React.Dispatch<React.SetStateAction<WizardAnswers>>
  setStep: React.Dispatch<React.SetStateAction<number>>
}) {
  const cityOk = answers.userCity.trim().length > 0
  const stateOk = answers.userState.trim().length > 0
  const pincodeOk = answers.userPincode.trim().length === 6
  const allValid = cityOk && stateOk && pincodeOk

  const showPincodeError = answers.userPincode.length > 0 && !pincodeOk

  return (
    <div>
      <h2 className="text-[20px] font-semibold mb-5" style={{ color: '#F5F3FF' }}>
        Where are you located?
      </h2>

      <div className="flex flex-col gap-4">
        {/* City */}
        <div>
          <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#C4B5FD' }}>
            City Name
          </label>
          <StyledInput
            value={answers.userCity}
            onChange={v => setAnswers(a => ({ ...a, userCity: v }))}
            placeholder="e.g. Mumbai"
          />
          {answers.userCity.length > 0 && !cityOk && <FieldError msg="City is required." />}
        </div>

        {/* State */}
        <div>
          <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#C4B5FD' }}>
            State Name
          </label>
          <StyledInput
            value={answers.userState}
            onChange={v => setAnswers(a => ({ ...a, userState: v }))}
            placeholder="e.g. Maharashtra"
          />
          {answers.userState.length > 0 && !stateOk && <FieldError msg="State is required." />}
        </div>

        {/* Pincode */}
        <div>
          <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#C4B5FD' }}>
            Pincode
          </label>
          <StyledInput
            value={answers.userPincode}
            onChange={v => setAnswers(a => ({ ...a, userPincode: v }))}
            placeholder="e.g. 400001"
            type="tel"
            maxLength={6}
          />
          {showPincodeError && <FieldError msg="Pincode must be exactly 6 digits." />}
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={() => setStep(4)} className="flex-1 mt-6 py-3 rounded-[12px] text-[14px] font-semibold transition-all" style={{ border: '1px solid #2D1B69', color: '#A78BFA' }}>← Back</button>
        <ContinueButton onClick={() => setStep(6)} disabled={!allValid} />
      </div>
    </div>
  )
}

// ─── Step 6 — Entrance Exam ───────────────────────────────────────────────────

function Step6({ answers, setAnswers, handleSubmit, setStep }: {
  answers: WizardAnswers
  setAnswers: React.Dispatch<React.SetStateAction<WizardAnswers>>
  handleSubmit: () => void
  setStep: React.Dispatch<React.SetStateAction<number>>
}) {
  return (
    <div>
      <h2 className="text-[20px] font-semibold mb-5" style={{ color: '#F5F3FF' }}>
        Have you appeared or are you preparing for any entrance exam?
      </h2>
      <StyledInput
        value={answers.entrance}
        onChange={v => setAnswers(a => ({ ...a, entrance: v }))}
        placeholder="e.g. JEE, NEET, CUET, CAT, CLAT, or type None"
      />
      <div className="flex gap-3">
        <button onClick={() => setStep(5)} className="flex-1 mt-6 py-3 rounded-[12px] text-[14px] font-semibold transition-all" style={{ border: '1px solid #2D1B69', color: '#A78BFA' }}>← Back</button>
        <ContinueButton
          onClick={handleSubmit}
          label="Get My Recommendations 🎓"
          disabled={!answers.entrance.trim()}
        />
      </div>
    </div>
  )
}
