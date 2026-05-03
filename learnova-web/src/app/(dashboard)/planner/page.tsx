'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { validateInput, buildRateLimitMessage } from '@/lib/rateLimitClient'

const examSubjects: Record<string, string[]> = {
  school: ['Mathematics','Science','Social Studies','English','Hindi',
           'History','Geography','Civics','Biology','Chemistry','Physics',
           'Computer Science','Economics','Accountancy','Business Studies'],
  jee_main: ['Physics','Chemistry','Mathematics'],
  jee_advanced: ['Physics','Chemistry','Mathematics'],
  neet: ['Physics','Chemistry','Biology','Botany','Zoology'],
  upsc: ['History','Geography','Polity','Economics','Science & Tech',
         'Environment','Current Affairs','Ethics','Essay'],
  cat: ['Verbal Ability','Reading Comprehension','Data Interpretation',
        'Logical Reasoning','Quantitative Aptitude'],
  class10_board: ['Mathematics','Science','Social Science','English','Hindi'],
  class12_board: ['Physics','Chemistry','Mathematics','Biology',
                  'English','Accountancy','Economics','Business Studies'],
}

const plannerExams = [
  { value: 'school', label: '🏫 School (Class 6–12)' },
  { value: 'jee_main', label: '⚛️ JEE Main' },
  { value: 'jee_advanced', label: '⚛️ JEE Advanced' },
  { value: 'neet', label: '🧬 NEET' },
  { value: 'upsc', label: '🏛️ UPSC' },
  { value: 'cat', label: '📊 CAT' },
  { value: 'class10_board', label: '📋 Class 10 Board' },
  { value: 'class12_board', label: '📋 Class 12 Board' },
  { value: 'other', label: '📚 Other' },
]

export default function PlannerPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [planError, setPlanError] = useState('')
  const [warning, setWarning] = useState('')
  
  const [formData, setFormData] = useState({
    targetExam: '',
    schoolClass: '',
    examDate: '',
    studyHours: '6',
    weakSubjects: [] as string[],
    strongSubjects: [] as string[],
    weakInput: '',
    strongInput: '',
    currentLevel: 'intermediate',
    includeBreaks: true,
    examType: '',
  })

  const handleSubjectToggle = (type: 'weakSubjects' | 'strongSubjects', subject: string) => {
    setFormData(prev => {
      const current = prev[type]
      const updated = current.includes(subject)
        ? current.filter(s => s !== subject)
        : [...current, subject]
      return { ...prev, [type]: updated }
    })
  }

  const addSubject = (
    type: 'weakSubjects' | 'strongSubjects',
    input: string
  ) => {
    const trimmed = input.trim()
    if (trimmed && !formData[type].includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        [type]: [...prev[type], trimmed],
        [type === 'weakSubjects' ? 'weakInput' : 'strongInput']: ''
      }))
    }
  }

  const removeSubject = (
    type: 'weakSubjects' | 'strongSubjects',
    subject: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter(s => s !== subject)
    }))
  }

  const getSubjectSuggestions = (exam: string) => {
    return examSubjects[exam] || []
  }

  const handleGeneratePlan = async () => {
    const packed = `${formData.examType || formData.targetExam} ${formData.weakSubjects.join(' ')} ${formData.strongSubjects.join(' ')}`
    const inputError = validateInput(packed, 'planner')
    if (inputError) {
      setPlanError(inputError)
      return
    }
    setLoading(true)
    setPlanError('')
    setWarning('')
    try {
      const response = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (response.ok) {
        const headerWarning = response.headers.get('X-RateLimit-Warning')
        if (headerWarning) setWarning(headerWarning)
        sessionStorage.setItem('generatedPlan', JSON.stringify(data))
        sessionStorage.setItem('planMeta', JSON.stringify(formData))
        router.push('/planner/results')
      } else {
        const errorMessage = response.status === 429 || data?.error === 'rate_limit_exceeded'
          ? buildRateLimitMessage(data)
          : (data?.error || 'Failed to generate plan. Please check all fields and try again.')
        setPlanError(errorMessage)
        console.error('Planner error:', errorMessage)
      }
    } catch (error) {
      console.error('Plan generation failed:', error)
      setPlanError('Network error — could not reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const availableSubjects = getSubjectSuggestions(formData.targetExam)

  return (
    <div className="max-w-4xl mx-auto" style={{ color: 'var(--foreground)' }}>
      <h1 className="text-3xl font-bold mb-2 font-heading">
        Personalized Study Planner
      </h1>
      <p className="mb-8" style={{ color: 'var(--foreground-muted)' }}>
        Tell us about your exam and we'll create a day-by-day study plan just for you
      </p>

      {/* Progress Steps */}
      <div className="flex items-center gap-4 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold"
              style={{
                backgroundColor: s <= step ? 'var(--accent)' : 'var(--border)',
                color: s <= step ? '#ffffff' : 'var(--foreground-muted)'
              }}
            >
              {s}
            </div>
            <div className="flex-1 h-1 rounded" style={{ backgroundColor: s < step ? 'var(--accent)' : 'var(--border)' }} />
          </div>
        ))}
      </div>

      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-6">Step 1: Exam Details</h2>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-secondary)' }}>
                Target Exam *
              </label>
              <select
                value={formData.targetExam}
                onChange={(e) => setFormData({...formData, targetExam: e.target.value, weakSubjects: [], strongSubjects: [], examType: e.target.value === 'other' ? '' : e.target.options[e.target.selectedIndex]?.text?.replace(/^[^\w]+/, '') || ''})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="">Select your exam...</option>
                {plannerExams.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>

            {/* Custom exam name for "Other" */}
            {formData.targetExam === 'other' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-secondary)' }}>
                  Exam Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. CLAT, CDS, RRB NTPC..."
                  value={formData.examType}
                  onChange={(e) => setFormData({...formData, examType: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
            )}

            {/* Show class selector when School is selected */}
            {formData.targetExam === 'school' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-secondary)' }}>
                  Your Class *
                </label>
                <select
                  value={formData.schoolClass}
                  onChange={(e) => setFormData({...formData, schoolClass: e.target.value})}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  <option value="">Select your class...</option>
                  {['Class 6','Class 7','Class 8','Class 9',
                    'Class 10','Class 11','Class 12'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-secondary)' }}>
                Exam Date *
              </label>
              <input
                type="date"
                value={formData.examDate}
                onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-secondary)' }}>
                Daily Study Hours: {formData.studyHours} hours
              </label>
              <input
                type="range"
                min="1"
                max="12"
                value={formData.studyHours}
                onChange={(e) => setFormData({...formData, studyHours: e.target.value})}
                className="w-full"
              />
              <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--foreground-muted)' }}>
                <span>1 hr</span>
                <span>12 hrs</span>
              </div>
            </div>

            {/* Current Level */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-secondary)' }}>
                Current Preparation Level
              </label>
              <div className="flex gap-3">
                {['beginner', 'intermediate', 'advanced'].map(level => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({...formData, currentLevel: level})}
                    className="flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all capitalize"
                    style={{
                      backgroundColor: formData.currentLevel === level ? 'var(--accent)' : 'var(--background)',
                      borderColor: formData.currentLevel === level ? 'var(--accent)' : 'var(--border)',
                      border: '1px solid',
                      color: formData.currentLevel === level ? '#ffffff' : 'var(--foreground)'
                    }}
                  >
                    {level === 'beginner' ? '🌱' : level === 'intermediate' ? '📈' : '🔥'} {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Include Breaks toggle */}
            <div className="flex items-center gap-3 py-2">
              <button
                type="button"
                onClick={() => setFormData({...formData, includeBreaks: !formData.includeBreaks})}
                className="relative w-12 h-6 rounded-full transition-all flex-shrink-0"
                style={{ backgroundColor: formData.includeBreaks ? 'var(--accent)' : 'var(--border)' }}
              >
                <span
                  className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all"
                  style={{ left: formData.includeBreaks ? '26px' : '4px' }}
                />
              </button>
              <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                Include scheduled breaks in the plan
              </span>
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.targetExam || !formData.examDate || (formData.targetExam === 'other' && !formData.examType)}
              className="w-full py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Next Step →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="planner-step">
            <h2>Step 2: Your Subjects</h2>
            <p className="step-subtitle">
              Tell us where you struggle and where you're strong — we'll build your plan around it.
            </p>

            {/* === WEAK SUBJECTS === */}
            <div className="subject-section">
              <label className="form-label">
                😓 Your Weak Subjects
                <span className="label-hint"> — needs more practice</span>
              </label>

              {availableSubjects.length > 0 && (
                <div className="subject-chips-row">
                  {availableSubjects
                    .filter(s => !formData.weakSubjects.includes(s))
                    .map(s => (
                      <button
                        key={s}
                        className="subject-chip"
                        onClick={() => addSubject('weakSubjects', s)}
                      >
                        + {s}
                      </button>
                    ))}
                </div>
              )}

              <div className="subject-manual-input">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type a subject and press Enter or +"
                  value={formData.weakInput}
                  onChange={(e) => setFormData({...formData, weakInput: e.target.value})}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSubject('weakSubjects', formData.weakInput)
                    }
                  }}
                />
                <button
                  className="subject-add-btn"
                  onClick={() => addSubject('weakSubjects', formData.weakInput)}
                >
                  +
                </button>
              </div>

              {formData.weakSubjects.length > 0 && (
                <div className="selected-subjects">
                  {formData.weakSubjects.map(s => (
                    <span key={s} className="subject-tag subject-tag-weak">
                      {s}
                      <button
                        className="tag-remove"
                        onClick={() => removeSubject('weakSubjects', s)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {formData.weakSubjects.length === 0 && (
                <p className="field-hint">
                  These subjects will get more study time in your plan
                </p>
              )}
            </div>

            {/* === STRONG SUBJECTS === */}
            <div className="subject-section">
              <label className="form-label">
                💪 Your Strong Subjects
                <span className="label-hint"> — just needs revision</span>
              </label>

              {availableSubjects.length > 0 && (
                <div className="subject-chips-row">
                  {availableSubjects
                    .filter(s => !formData.strongSubjects.includes(s) && !formData.weakSubjects.includes(s))
                    .map(s => (
                      <button
                        key={s}
                        className="subject-chip subject-chip-strong"
                        onClick={() => addSubject('strongSubjects', s)}
                      >
                        + {s}
                      </button>
                    ))}
                </div>
              )}

              <div className="subject-manual-input">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Type a subject and press Enter or +"
                  value={formData.strongInput}
                  onChange={(e) => setFormData({...formData, strongInput: e.target.value})}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addSubject('strongSubjects', formData.strongInput)
                    }
                  }}
                />
                <button
                  className="subject-add-btn subject-add-btn-strong"
                  onClick={() => addSubject('strongSubjects', formData.strongInput)}
                >
                  +
                </button>
              </div>

              {formData.strongSubjects.length > 0 && (
                <div className="selected-subjects">
                  {formData.strongSubjects.map(s => (
                    <span key={s} className="subject-tag subject-tag-strong">
                      {s}
                      <button
                        className="tag-remove"
                        onClick={() => removeSubject('strongSubjects', s)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {formData.strongSubjects.length === 0 && (
                <p className="field-hint">
                  These subjects will get lighter revision sessions
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary flex-1"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="btn-primary flex-1"
              >
                Next Step →
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">Step 3: Review & Generate</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
              Confirm your details and generate your personalized AI study plan.
            </p>

            {/* Summary of inputs */}
            <div className="space-y-3">
              {[
                { label: 'Exam', value: formData.examType || formData.targetExam?.toUpperCase().replace('_',' ') },
                { label: 'Exam Date', value: formData.examDate },
                { label: 'Daily Hours', value: `${formData.studyHours} hours/day` },
                { label: 'Level', value: formData.currentLevel },
                { label: 'Weak Subjects', value: formData.weakSubjects.join(', ') || 'None' },
                { label: 'Strong Subjects', value: formData.strongSubjects.join(', ') || 'None' },
                { label: 'Breaks Included', value: formData.includeBreaks ? 'Yes' : 'No' },
              ].map(row => (
                <div key={row.label} className="flex justify-between py-2 border-b text-sm"
                  style={{ borderColor: 'var(--border)' }}>
                  <span style={{ color: 'var(--foreground-muted)' }}>{row.label}</span>
                  <span className="font-medium" style={{ color: 'var(--foreground)' }}>{row.value}</span>
                </div>
              ))}
            </div>

            {/* Error display — shows actual API error instead of generic message */}
            {planError && (
              <div style={{
                background: '#450A0A',
                border: '1px solid #7F1D1D',
                borderRadius: 10,
                padding: '12px 16px',
                color: '#F87171',
                fontSize: 13,
                lineHeight: 1.5,
              }}>
                ⚠️ {planError}
              </div>
            )}
            {warning && (
              <div style={{ background: '#451A03', border: '1px solid #92400E', borderRadius: 10, padding: '12px 16px', color: '#FBBF24', fontSize: 13, lineHeight: 1.5 }}>
                ⚠️ {warning}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border rounded-lg font-semibold hover:opacity-80 transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                ← Back
              </button>
              <button
                onClick={handleGeneratePlan}
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50"
                style={{ backgroundColor: 'var(--highlight)' }}
              >
                {loading ? '⏳ Generating Plan...' : '✨ Generate My Study Plan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
