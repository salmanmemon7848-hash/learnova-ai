'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ImageUploader from '@/components/features/DoubtSolver/ImageUploader'
import { Camera, Sparkles, BookOpen, Target, Lightbulb, Save } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export default function DoubtSolverPage() {
  const { user } = useAuth()
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [questionText, setQuestionText] = useState('')
  const [loading, setLoading] = useState(false)
  const [solution, setSolution] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [language, setLanguage] = useState<'en' | 'hi' | 'hinglish'>('en')

  const handleSubmit = async () => {
    if (!selectedImage && !questionText.trim()) {
      setError('Please upload an image or type your question')
      return
    }

    setLoading(true)
    setError('')
    setSolution('')

    try {
      const response = await fetch('/api/doubt-solver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: selectedImage,
          questionText: questionText.trim(),
          language,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to solve doubt')
      }

      const data = await response.json()
      setSolution(data.solution)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    setSelectedImage('')
    setQuestionText('')
    setSolution('')
    setError('')
  }

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
            <label className="language-label">
              Select Language
            </label>
            <div className="language-options">
              {[
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'हिंदी' },
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

          {/* Image Upload */}
          <div className="upload-card">
            <label className="language-label">
              Upload Question Image
            </label>
            <ImageUploader onImageSelect={setSelectedImage} />
          </div>

          {/* Text Input */}
          <div className="upload-card">
            <label className="language-label">
              Or Type Your Question
            </label>
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
            <button
              onClick={handleReset}
              className="btn-outline px-6 py-3.5"
            >
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
          {!solution && !loading && (
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

          {solution && (
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

              <div className="prose prose-base max-w-none" style={{ color: 'var(--text-primary)' }}>
                <ReactMarkdown>{solution}</ReactMarkdown>
              </div>

              <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border-card)' }}>
                <button className="w-full py-3 hover:text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2" style={{ backgroundColor: 'var(--accent-purple-glow)', color: 'var(--accent-purple-light)' }}
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
        </div>
      </div>
    </div>
  )
}
