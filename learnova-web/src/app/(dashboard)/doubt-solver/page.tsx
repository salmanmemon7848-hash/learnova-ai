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
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0F0F1A] mb-2 flex items-center gap-3">
          <Camera className="w-8 h-8" style={{ color: '#534AB7' }} />
          AI Doubt Solver
        </h1>
        <p className="text-[#5A5A72]">
          Upload a photo of your question or type it below — get step-by-step solutions instantly
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Language Selector */}
          <div className="rounded-[10px] border p-5" style={{ backgroundColor: '#13151e', borderColor: '#2a2d3a' }}>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#e2e8f0' }}>
              Select Language
            </label>
            <div className="flex gap-3">
              {[
                { id: 'en', label: 'English' },
                { id: 'hi', label: 'हिंदी' },
                { id: 'hinglish', label: 'Hinglish' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id as any)}
                  className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                    language === lang.id
                      ? 'bg-[#7c3aed] text-white'
                      : 'hover:bg-[#1e2130]'
                  }`}
                  style={{
                    backgroundColor: language === lang.id ? '#7c3aed' : '#1e2130',
                    color: language === lang.id ? 'white' : '#9ca3af'
                  }}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* Image Upload */}
          <div className="rounded-[10px] border p-5" style={{ backgroundColor: '#13151e', borderColor: '#2a2d3a' }}>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#e2e8f0' }}>
              Upload Question Image
            </label>
            <ImageUploader onImageSelect={setSelectedImage} />
          </div>

          {/* Text Input */}
          <div className="rounded-[10px] border p-5" style={{ backgroundColor: '#13151e', borderColor: '#2a2d3a' }}>
            <label className="block text-sm font-semibold mb-3" style={{ color: '#e2e8f0' }}>
              Or Type Your Question
            </label>
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Type your question here..."
              rows={4}
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 resize-none transition-all"
              style={{
                backgroundColor: '#0f1117',
                borderColor: '#2a2d3a',
                color: '#e2e8f0'
              }}
              onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
              onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading || (!selectedImage && !questionText.trim())}
              className="flex-1 py-3.5 text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
              style={{ backgroundColor: '#534AB7' }}
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
              className="px-6 py-3.5 border-2 rounded-xl font-medium transition-colors"
              style={{ backgroundColor: '#13151e', borderColor: '#2a2d3a', color: '#a78bfa' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e2130'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#13151e'}
            >
              Reset
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>

        {/* Right Column - Solution */}
        <div className="rounded-[10px] border p-6 min-h-[600px]" style={{ backgroundColor: '#13151e', borderColor: '#2a2d3a' }}>
          {!solution && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center py-16">
              <div className="w-20 h-20 rounded-[14px] flex items-center justify-center mb-6" style={{ backgroundColor: '#1e1b4b' }}>
                <BookOpen className="w-10 h-10" style={{ color: '#a78bfa' }} />
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#e2e8f0' }}>
                Your Solution Will Appear Here
              </h3>
              <p className="text-[#5A5A72] text-sm max-w-sm">
                Upload or type your question and click "Solve with AI" to get a detailed step-by-step solution with exam relevance
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center py-16">
              <div className="w-16 h-16 border-4 border-[#534AB7] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-[#5A5A72] font-medium">
                AI is solving your question...
              </p>
            </div>
          )}

          {solution && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#0F0F1A] flex items-center gap-2">
                  <Target className="w-5 h-5" style={{ color: '#534AB7' }} />
                  Solution
                </h3>
                <button className="px-3 py-1.5 bg-[#F8F8FA] hover:bg-[#EEEDFE] text-[#534AB7] rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                  <Save className="w-3.5 h-3.5" />
                  Save as Note
                </button>
              </div>

              <div className="prose prose-base max-w-none">
                <ReactMarkdown>{solution}</ReactMarkdown>
              </div>

              <div className="mt-6 pt-6 border-t border-[rgba(83,74,183,0.12)]">
                <button className="w-full py-3 bg-[#EEEDFE] hover:bg-[#534AB7] hover:text-white text-[#534AB7] rounded-xl font-medium transition-all flex items-center justify-center gap-2">
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
