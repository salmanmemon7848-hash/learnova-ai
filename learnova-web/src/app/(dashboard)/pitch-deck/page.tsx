'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ChevronLeft, ChevronRight, Download } from 'lucide-react'

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

export default function PitchDeckPage() {
  const { user } = useAuth()
  const [step, setStep] = useState<'wizard' | 'preview' | 'generating'>('wizard')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [slides, setSlides] = useState<any[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleGenerate = async () => {
    setLoading(true)
    setStep('generating')
    
    try {
      const response = await fetch('/api/pitch-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setSlides(data.slides || [])
        setStep('preview')
      } else {
        alert(`Error: ${data.error || 'Failed to generate pitch deck'}`)
        setStep('wizard')
      }
    } catch (error) {
      console.error('Pitch deck generation failed:', error)
      alert('Failed to generate pitch deck. Please try again.')
      setStep('wizard')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf')
      const html2canvas = (await import('html2canvas')).default

      const slidesContainer = document.getElementById('slides-container')
      if (!slidesContainer) return

      const canvas = await html2canvas(slidesContainer, {
        scale: 2,
        useCORS: true,
        logging: false,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      })

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height)
      pdf.save('learnova-pitch-deck.pdf')
    } catch (error) {
      console.error('PDF generation failed:', error)
      alert('Failed to download PDF. Please try again.')
    }
  }

  if (step === 'wizard') {
    const q = questions[currentQuestion]
    const progress = ((currentQuestion + 1) / questions.length) * 100

    return (
      <div className="max-w-3xl mx-auto" style={{ color: 'var(--foreground)' }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading mb-2">
            Build your investor pitch deck in 10 minutes
          </h1>
          <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
            Answer 10 questions. Get a complete pitch deck. Download and send.
          </p>
        </div>

        {/* Progress Bar */}
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
          <h2 className="text-2xl font-semibold mb-2">{q.label}</h2>
          
          {q.type === 'textarea' ? (
            <textarea
              value={answers[q.key] || ''}
              onChange={(e) => setAnswers({...answers, [q.key]: e.target.value})}
              placeholder={q.placeholder}
              rows={4}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all resize-none mt-4"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          ) : (
            <input
              type="text"
              value={answers[q.key] || ''}
              onChange={(e) => setAnswers({...answers, [q.key]: e.target.value})}
              placeholder={q.placeholder}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all mt-4"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          )}

          <div className="flex gap-3 mt-8">
            <button
              onClick={handleBack}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-6 py-3 border rounded-lg font-semibold hover:opacity-80 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            
            {currentQuestion < questions.length - 1 ? (
              <button
                onClick={handleNext}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleGenerate}
                disabled={!answers[q.key]?.trim()}
                className="flex-1 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--highlight)' }}
              >
                Generate Pitch Deck
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (step === 'generating') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" style={{ color: 'var(--foreground)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }} />
          <h2 className="text-2xl font-semibold mb-2">Generating Your Pitch Deck...</h2>
          <p style={{ color: 'var(--foreground-muted)' }}>This will take about 30 seconds</p>
        </div>
      </div>
    )
  }

  // Preview mode
  return (
    <div className="max-w-6xl mx-auto" style={{ color: 'var(--foreground)' }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold font-heading">Your Pitch Deck</h1>
        <button
          onClick={handleDownloadPDF}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all"
          style={{ backgroundColor: 'var(--highlight)' }}
        >
          <Download className="w-4 h-4" />
          Download as PDF
        </button>
      </div>

      {/* Slide Navigation */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
          disabled={currentSlide === 0}
          className="px-4 py-2 border rounded-lg hover:opacity-80 transition-all disabled:opacity-50"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          Previous
        </button>
        <span className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
          Slide {currentSlide + 1} of {slides.length}
        </span>
        <button
          onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
          disabled={currentSlide === slides.length - 1}
          className="px-4 py-2 border rounded-lg hover:opacity-80 transition-all disabled:opacity-50"
          style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
        >
          Next
        </button>
      </div>

      {/* Slide Display */}
      <div id="slides-container">
        {slides[currentSlide] && (
          <div className="rounded-xl p-12 min-h-[500px] flex flex-col justify-center" style={{ backgroundColor: 'var(--surface)', border: '2px solid var(--border)' }}>
            <h2 className="text-4xl font-bold mb-6 font-heading" style={{ color: 'var(--accent)' }}>
              {slides[currentSlide].title}
            </h2>
            <div className="space-y-4">
              {slides[currentSlide].content.split('\n').map((line: string, i: number) => (
                <p key={i} className="text-xl" style={{ color: 'var(--foreground-secondary)' }}>
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Slide Thumbnails */}
      <div className="flex gap-3 mt-6 overflow-x-auto pb-2">
        {slides.map((slide, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className="flex-shrink-0 w-32 h-20 rounded-lg border-2 transition-all p-2 text-xs"
            style={{
              backgroundColor: index === currentSlide ? 'var(--accent)' : 'var(--surface)',
              borderColor: index === currentSlide ? 'var(--accent)' : 'var(--border)',
              color: index === currentSlide ? '#ffffff' : 'var(--foreground-muted)'
            }}
          >
            {slide.title}
          </button>
        ))}
      </div>
    </div>
  )
}
