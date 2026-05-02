'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ImageUploader from '@/components/features/DoubtSolver/ImageUploader'
import { Camera, Sparkles, BookOpen, Target, Lightbulb, Save } from 'lucide-react'

// ── Types ─────────────────────────────────────────────────────────────────────
interface DoubtResult {
  concept_in_one_line: string
  detected_level: string
  step_by_step: { step: number; title: string; explanation: string }[]
  simple_example: { title: string; example: string }
  medium_example: { title: string; example: string }
  advanced_example: { title: string; example: string }
  why_it_works: string
  common_mistakes: string[]
  memory_trick: string
  exam_tip: string
  related_topics: string[]
}

type Level = 'auto' | 'basic' | 'medium' | 'advanced'

const levels: { value: Level; label: string }[] = [
  { value: 'auto',     label: '🤖 Auto Detect' },
  { value: 'basic',    label: '🟢 Basic (Class 6–8)' },
  { value: 'medium',   label: '🟡 Medium (Class 9–12)' },
  { value: 'advanced', label: '🔴 Advanced (JEE/NEET/UPSC)' },
]

// ── Helper: try to parse JSON from raw AI string ──────────────────────────────
function parseDoubtResult(raw: string): DoubtResult | null {
  try {
    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    // Find first { … } block
    const start = cleaned.indexOf('{')
    const end = cleaned.lastIndexOf('}')
    if (start === -1 || end === -1) return null
    return JSON.parse(cleaned.slice(start, end + 1)) as DoubtResult
  } catch {
    return null
  }
}

export default function DoubtSolverPage() {
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [questionText, setQuestionText] = useState('')
  const [loading, setLoading] = useState(false)
  const [rawSolution, setRawSolution] = useState<string>('')
  const [result, setResult] = useState<DoubtResult | null>(null)
  const [error, setError] = useState<string>('')
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('en')
  const [level, setLevel] = useState<Level>('auto')

  const handleSubmit = async () => {
    if (!selectedImage && !questionText.trim()) {
      setError('Please upload an image or type your question')
      return
    }

    setLoading(true)
    setError('')
    setRawSolution('')
    setResult(null)

    try {
      const response = await fetch('/api/doubt-solver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: selectedImage,
          questionText: questionText.trim(),
          language,
          level,
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.error || 'Failed to solve doubt')
      }

      const data = await response.json()
      const parsed = parseDoubtResult(data.solution)
      if (parsed) {
        setResult(parsed)
      } else {
        // Fallback: show raw markdown
        setRawSolution(data.solution)
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedImage('')
    setQuestionText('')
    setRawSolution('')
    setResult(null)
    setError('')
  }

  const hasOutput = !!result || !!rawSolution

  return (
    <div className="doubt-page max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl">
          <Camera className="w-6 h-6 sm:w-8 sm:h-8" />
          AI Doubt Solver
        </h1>
        <p className="subtitle">
          Upload a photo of your question or type it below — get step-by-step solutions instantly
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Column - Input */}
        <div className="space-y-4 sm:space-y-6">
          {/* Language Selector */}
          <div className="language-card">
            <label className="language-label">Select Language</label>
            <div className="language-options">
              {[
                { id: 'en',       label: 'English' },
                { id: 'hi',       label: 'हिंदी' },
                { id: 'hinglish', label: 'Hinglish' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as any)}
                  className={`lang-btn ${language === lang.id ? 'active' : ''}`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Level Selector */}
          <div className="language-card">
            <label className="language-label">Difficulty Level</label>
            <div className="language-options flex-wrap">
              {levels.map((l) => (
                <button
                  key={l.value}
                  onClick={() => setLevel(l.value)}
                  className={`lang-btn ${level === l.value ? 'active' : ''}`}
                  style={{ fontSize: '13px', whiteSpace: 'nowrap' }}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="upload-card">
            <label className="language-label">Upload Question Image</label>
            <ImageUploader onImageSelect={setSelectedImage} />
          </div>

          {/* Text Input */}
          <div className="upload-card">
            <label className="language-label">Or Type Your Question</label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Type your question here..."
              rows={4}
              className="w-full px-3 sm:px-4 py-2 sm:py-3 border rounded-xl focus:ring-2 resize-none transition-all text-sm sm:text-base settings-field"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading || (!selectedImage && !questionText.trim())}
              className="btn-secondary flex-1 py-2.5 sm:py-3.5 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Solving...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Solve with AI
                </>
              )}
            </button>
            <button onClick={handleReset} className="btn-outline px-6 py-3.5">
              Reset
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border-2 border-red-500/30 rounded-xl p-4 text-red-400 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Right Column - Solution */}
        <div className="solution-card min-h-[600px]">
          {!hasOutput && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-20 h-20 rounded-[14px] flex items-center justify-center mb-6" style={{ backgroundColor: 'var(--accent-purple-glow)' }}>
                <BookOpen className="w-10 h-10" style={{ color: 'var(--accent-purple-light)' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Your Solution Will Appear Here
              </h3>
              <p className="text-sm max-w-sm" style={{ color: 'var(--text-secondary)' }}>
                Upload or type your question and click "Solve with AI" to get a detailed step-by-step solution with exam relevance
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 rounded-full animate-spin mb-4" style={{ borderColor: 'var(--accent-purple)', borderTopColor: 'transparent' }} />
              <p style={{ color: 'var(--text-secondary)' }} className="font-medium">
                AI is solving your question...
              </p>
            </div>
          )}

          {/* ── Structured JSON Result Cards ── */}
          {result && (
            <div className="doubt-result space-y-4">

              {/* Header Card */}
              <div className="result-card header-card" style={{
                background: 'linear-gradient(135deg, #160D2E, #1E1040)',
                border: '1px solid #2D1B69',
                borderRadius: '14px',
                padding: '20px',
              }}>
                <span className="level-badge" style={{
                  display: 'inline-block',
                  padding: '4px 14px',
                  borderRadius: '20px',
                  background: 'rgba(124,58,237,0.25)',
                  border: '1px solid rgba(124,58,237,0.5)',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#A78BFA',
                  marginBottom: '10px',
                }}>
                  {result.detected_level}
                </span>
                <p style={{ color: 'var(--text-primary)', fontSize: '16px', fontWeight: 500, margin: 0 }}>
                  {result.concept_in_one_line}
                </p>
              </div>

              {/* Step by Step */}
              <div style={{
                background: 'linear-gradient(135deg, #160D2E, #1E1040)',
                border: '1px solid #2D1B69',
                borderRadius: '14px',
                padding: '20px',
              }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '15px' }}>📚 Step-by-Step Explanation</h3>
                {result.step_by_step.map((s) => (
                  <div key={s.step} style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start',
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                  }}>
                    <div style={{
                      minWidth: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'var(--purple-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: 'white',
                      flexShrink: 0,
                    }}>
                      {s.step}
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>{s.title}</strong>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '4px 0 0' }}>{s.explanation}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Examples Grid */}
              <div className="doubt-examples-grid">
                {[
                  { key: 'simple',   emoji: '🟢', label: 'Simple',   data: result.simple_example,   accent: '#10b981' },
                  { key: 'medium',   emoji: '🟡', label: 'Medium',   data: result.medium_example,   accent: '#f59e0b' },
                  { key: 'advanced', emoji: '🔴', label: 'Advanced', data: result.advanced_example, accent: '#ef4444' },
                ].map(({ key, emoji, label, data, accent }) => (
                  <div key={key} style={{
                    background: 'linear-gradient(135deg, #160D2E, #1E1040)',
                    border: `1px solid ${accent}30`,
                    borderRadius: '14px',
                    padding: '16px',
                  }}>
                    <span style={{
                      display: 'inline-block',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: accent,
                      background: `${accent}18`,
                      border: `1px solid ${accent}40`,
                      borderRadius: '20px',
                      padding: '3px 10px',
                      marginBottom: '8px',
                    }}>
                      {emoji} {label}
                    </span>
                    <h4 style={{ color: 'var(--text-primary)', fontSize: '13px', fontWeight: 600, margin: '0 0 6px' }}>{data.title}</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>{data.example}</p>
                  </div>
                ))}
              </div>

              {/* Why It Works */}
              <div style={{
                background: 'linear-gradient(135deg, #160D2E, #1E1040)',
                border: '1px solid #2D1B69',
                borderRadius: '14px',
                padding: '20px',
              }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px', fontSize: '15px' }}>🧠 Why This Works</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0 }}>{result.why_it_works}</p>
              </div>

              {/* Two Col — Mistakes + Memory Trick */}
              <div className="doubt-two-col">
                <div style={{
                  background: 'linear-gradient(135deg, #160D2E, #1E1040)',
                  border: '1px solid #7F1D1D',
                  borderRadius: '14px',
                  padding: '20px',
                }}>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px', fontSize: '15px' }}>⚠️ Common Mistakes</h3>
                  {result.common_mistakes.map((m, i) => (
                    <div key={i} style={{
                      color: '#F87171',
                      fontSize: '13px',
                      padding: '6px 0',
                      borderBottom: i < result.common_mistakes.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                    }}>
                      ❌ {m}
                    </div>
                  ))}
                </div>
                <div style={{
                  background: 'linear-gradient(135deg, #160D2E, #1E1040)',
                  border: '1px solid #2D1B69',
                  borderRadius: '14px',
                  padding: '20px',
                }}>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '10px', fontSize: '15px' }}>💡 Memory Trick</h3>
                  <p style={{
                    color: '#A78BFA',
                    fontSize: '14px',
                    fontStyle: 'italic',
                    marginBottom: '16px',
                    background: 'rgba(124,58,237,0.1)',
                    borderRadius: '8px',
                    padding: '10px',
                  }}>
                    {result.memory_trick}
                  </p>
                  <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '15px' }}>🎯 Exam Tip</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>{result.exam_tip}</p>
                </div>
              </div>

              {/* Related Topics */}
              <div style={{
                background: 'linear-gradient(135deg, #160D2E, #1E1040)',
                border: '1px solid #2D1B69',
                borderRadius: '14px',
                padding: '20px',
              }}>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '15px' }}>🔗 Related Topics to Study Next</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {result.related_topics.map((t, i) => (
                    <span key={i} style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      background: 'rgba(124,58,237,0.2)',
                      border: '1px solid rgba(124,58,237,0.4)',
                      fontSize: '13px',
                      color: '#A78BFA',
                    }}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Practice Button */}
              <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: '16px' }}>
                <button
                  className="w-full py-3 hover:text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2"
                  style={{ backgroundColor: 'var(--accent-purple-glow)', color: 'var(--accent-purple-light)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--gradient-brand)'
                    e.currentTarget.style.color = 'white'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--accent-purple-glow)'
                    e.currentTarget.style.color = 'var(--accent-purple-light)'
                  }}
                >
                  <Lightbulb className="w-5 h-5" />
                  Practice Similar Questions
                </button>
              </div>
            </div>
          )}

          {/* Fallback: raw text if JSON parse failed */}
          {rawSolution && !result && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                  <Target className="w-5 h-5" style={{ color: 'var(--accent-purple)' }} />
                  Solution
                </h3>
                <button className="px-3 py-1.5 hover:bg-opacity-80 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-purple-light)', border: '1px solid var(--border-card)' }}>
                  <Save className="w-3.5 h-3.5" />
                  Save as Note
                </button>
              </div>
              <div className="prose prose-base max-w-none" style={{ color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                {rawSolution}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
