'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Zap } from 'lucide-react'
import { getExamWhatsAppLink } from '@/lib/utils/streak'
import { validateInput, buildRateLimitMessage } from '@/lib/rateLimitClient'

interface Question {
  number: number
  text: string
  options: { label: string; text: string }[]
  correctAnswer: string
  explanation: string
  difficulty: 'Easy' | 'Medium' | 'Hard'
  chapter?: string
  topic_tag?: string
  why_wrong?: Record<string, string>
  exam_relevance?: string
}

interface ExamScore {
  date: string
  subject: string
  exam: string
  score: number
  total: number
}

export default function ExamSimulatorPage() {
  const router = useRouter()
  const [step, setStep] = useState<'setup' | 'exam' | 'results'>('setup')
  
  // Setup state
  const [examType, setExamType] = useState('JEE Main')
  const [subject, setSubject] = useState('Physics')
  const [chapter, setChapter] = useState('')
  const [questionCount, setQuestionCount] = useState(10)
  const [studentLevel, setStudentLevel] = useState<'beginner' | 'intermediate' | 'advanced' | 'adaptive'>('adaptive')
  const [timerPerQuestion, setTimerPerQuestion] = useState<number>(60)
  
  // Exam state
  const [questions, setQuestions] = useState<Question[]>([])
  const [userAnswers, setUserAnswers] = useState<{[key: number]: string}>({})
  const [questionStatus, setQuestionStatus] = useState<{[key: number]: 'right' | 'wrong' | 'unanswered'}>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [language, setLanguage] = useState<'english' | 'hindi'>('english')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [noAnswerWarning, setNoAnswerWarning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(60)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  
  // Results & Analysis state
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [rateWarning, setRateWarning] = useState('')
  
  const sliderRef = useRef<HTMLInputElement>(null)

  // Load language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('learnova_language')
    if (savedLanguage === 'hindi' || savedLanguage === 'english') {
      setLanguage(savedLanguage)
    }
  }, [])

  const examTypes = ['JEE Main', 'JEE Advanced', 'NEET UG', 'CBSE Class 10', 'CBSE Class 12', 'Custom']
  
  const subjects: {[key: string]: string[]} = {
    'JEE Main': ['Physics', 'Chemistry', 'Mathematics'],
    'JEE Advanced': ['Physics', 'Chemistry', 'Mathematics'],
    'NEET UG': ['Physics', 'Chemistry', 'Biology'],
    'CBSE Class 10': ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    'CBSE Class 12': ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
    'Custom': ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  }

  // ── Timer effect: reset + countdown on each new question ──────────────────
  useEffect(() => {
    if (step !== 'exam' || timerPerQuestion === 0) return
    setTimeLeft(timerPerQuestion)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!)
          handleAutoNext()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex, step])

  const handleAutoNext = () => {
    setNoAnswerWarning(false)
    if (currentQuestionIndex >= questions.length - 1) {
      handleFinishExam()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handleStartExam = async () => {
    const packed = `${examType} ${subject} ${chapter}`.trim()
    const inputError = validateInput(packed, 'exam')
    if (inputError) {
      setError(inputError)
      return
    }
    setLoading(true)
    setError(null)
    setStartTime(new Date())

    const requestPayload = {
      examType,
      subject,
      chapter: chapter || undefined,
      questionCount,
      language,
      studentLevel,
    }

    // Debug: log exactly what is being sent to the API
    console.log('[EXAM PAGE] Sending request to /api/exam:', requestPayload)

    try {
      const response = await fetch('/api/exam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestPayload),
      })

      const data = await response.json()

      // Debug: log exactly what the API returned
      console.log('[EXAM PAGE] Raw API response:', data)

      if (!response.ok) {
        // Show error in-place — do NOT reset to setup; keep form values intact
        const message = response.status === 429 || data?.error === 'rate_limit_exceeded'
          ? buildRateLimitMessage(data)
          : (data.error || 'Failed to generate questions. Please try again.')
        console.error('[EXAM PAGE] API error response:', message)
        setError(message)
        return
      }
      const warning = response.headers.get('X-RateLimit-Warning')
      if (warning) setRateWarning(warning)

      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        // Validation failed: log what we got and surface a clear message
        console.error('[EXAM PAGE] Received invalid questions array:', data.questions)
        setError('Could not generate questions — please try again.')
        return
      }

      // Validate each question has the required fields
      const allValid = data.questions.every(
        (q: any) =>
          typeof q.question === 'string' ||
          (typeof q.text === 'string' &&
            Array.isArray(q.options) &&
            q.options.length >= 2 &&
            q.correctAnswer)
      )
      if (!allValid) {
        console.error('[EXAM PAGE] Some questions failed field validation:', data.questions)
        setError('Could not generate questions — please try again.')
        return
      }

      setQuestions(data.questions)
      setStep('exam')
    } catch (err: any) {
      // Network / unexpected error — show in-place, do NOT reset the form
      console.error('[EXAM PAGE] Unexpected error during exam generation:', err)
      setError(err.message || 'Something went wrong. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAnswer = (questionNumber: number, answer: string) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionNumber]: answer,
    }))
  }

  const handleFinishExam = () => {
    // Calculate initial status
    const status: {[key: number]: 'right' | 'wrong' | 'unanswered'} = {}
    questions.forEach(q => {
      const userAnswer = userAnswers[q.number]
      if (!userAnswer) {
        status[q.number] = 'unanswered'
      } else if (userAnswer === q.correctAnswer) {
        status[q.number] = 'right'
      } else {
        status[q.number] = 'wrong'
      }
    })
    
    setQuestionStatus(status)
    setStep('results')
    
    // Save score to localStorage
    const correctCount = Object.values(status).filter(s => s === 'right').length
    const scoreData: ExamScore = {
      date: new Date().toISOString(),
      subject,
      exam: examType,
      score: correctCount,
      total: questions.length,
    }
    
    const scores = JSON.parse(localStorage.getItem('learnova_exam_scores') || '[]')
    scores.push(scoreData)
    localStorage.setItem('learnova_exam_scores', JSON.stringify(scores.slice(-20)))

    const scorePercentage = Math.round((correctCount / questions.length) * 100)
    const timeTakenSeconds = startTime
      ? Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
      : 0

    fetch('/api/exam/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        examType,
        subject,
        score: scorePercentage,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        timeTakenSeconds,
      }),
    }).catch(() => {/* non-critical */})

    // Fetch deep analysis
    const testData = questions.map(q => ({
      question: q.text,
      correct_answer: q.correctAnswer,
      student_answer: userAnswers[q.number] || 'unanswered',
      difficulty: q.difficulty,
      topic: q.topic_tag || q.chapter
    }))

    setAnalyzing(true)
    fetch('/api/exam/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testData })
    })
      .then(res => res.json())
      .then(data => {
        if (data.result) setAnalysisResult(data.result)
      })
      .catch(err => console.error('Failed to get analysis:', err))
      .finally(() => setAnalyzing(false))
  }


  const handleUpdateQuestionStatus = (questionNumber: number, status: 'right' | 'wrong' | 'unanswered') => {
    setQuestionStatus(prev => ({
      ...prev,
      [questionNumber]: status,
    }))
  }

  const handleSeeRevisionPlan = async () => {
    const wrongQuestions = questions.filter(q => questionStatus[q.number] === 'wrong')
    const wrongTopics = wrongQuestions.map(q => q.chapter || q.text.slice(0, 50)).join(', ')
    
    const correctCount = Object.values(questionStatus).filter(s => s === 'right').length
    
    const prompt = `I got ${correctCount}/${questions.length} correct. Wrong topics: ${wrongTopics}. Give me a 3-day revision plan.`
    
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`)
  }

  const handleTryAnother = () => {
    setStep('setup')
    setQuestions([])
    setUserAnswers({})
    setQuestionStatus({})
    setStartTime(null)
    setCurrentQuestionIndex(0)
    setNoAnswerWarning(false)
    setAnalysisResult(null)
  }

  const handleNextQuestion = () => {
    const currentQ = questions[currentQuestionIndex]
    if (!userAnswers[currentQ.number]) {
      setNoAnswerWarning(true)
      return
    }
    setNoAnswerWarning(false)
    if (currentQuestionIndex === questions.length - 1) {
      handleFinishExam()
    } else {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const getScore = () => {
    return Object.values(questionStatus).filter(s => s === 'right').length
  }

  const getWrongCount = () => {
    return Object.values(questionStatus).filter(s => s === 'wrong').length
  }

  const getUnansweredCount = () => {
    return Object.values(questionStatus).filter(s => s === 'unanswered').length
  }

  const getTimeTaken = () => {
    if (!startTime) return '0:00'
    const seconds = Math.floor((new Date().getTime() - startTime.getTime()) / 1000)
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  // ===== SETUP STEP =====
  if (step === 'setup') {
    return (
      <div className="min-h-screen px-5 py-8" style={{ background: '#080412', maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Back Link */}
        <button
          onClick={() => router.push('/chat')}
          className="text-[13px] transition-colors hover:underline"
          style={{ color: '#A78BFA' }}
        >
          ← Back to Chat
        </button>

        {/* Page Title */}
        <h1 className="text-[28px] font-semibold mt-4" style={{ color: '#F5F3FF' }}>
          Exam Simulator
        </h1>
        <p className="text-[14px] mt-1" style={{ color: '#C4B5FD' }}>
          Practice with JEE, NEET, and CBSE style questions
        </p>

        {/* Setup Card */}
        <div
          className="rounded-[16px] p-7 mt-6"
          style={{
            background: 'linear-gradient(135deg, #160D2E, #1E1040)',
            border: '1px solid #2D1B69',
            boxShadow: '0 0 40px #7C3AED18',
          }}
        >
          <h2 className="text-[17px] font-semibold mb-6" style={{ color: '#F5F3FF' }}>
            Configure your test
          </h2>

          {/* 2-Column Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exam Type */}
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#C4B5FD' }}>
                Exam Type
              </label>
              <select
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
                className="w-full rounded-[10px] px-3.5 py-2.5 text-[14px] appearance-none cursor-pointer transition-all"
                style={{
                  background: '#0F0A1E',
                  border: '1px solid #2D1B69',
                  color: '#F5F3FF',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A78BFA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7C3AED'
                  e.target.style.boxShadow = '0 0 0 3px #7C3AED20'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2D1B69'
                  e.target.style.boxShadow = 'none'
                }}
              >
                {examTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div>
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#C4B5FD' }}>
                Subject
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-[10px] px-3.5 py-2.5 text-[14px] appearance-none cursor-pointer transition-all"
                style={{
                  background: '#0F0A1E',
                  border: '1px solid #2D1B69',
                  color: '#F5F3FF',
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A78BFA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7C3AED'
                  e.target.style.boxShadow = '0 0 0 3px #7C3AED20'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#2D1B69'
                  e.target.style.boxShadow = 'none'
                }}
              >
                {(subjects[examType] || subjects['Custom']).map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>

            {/* Chapter/Topic */}
            <div className="md:col-span-2">
              <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#C4B5FD' }}>
                Chapter / Topic <span style={{ color: '#9CA3AF' }}>(optional)</span>
              </label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="e.g. Kinematics, Organic Chemistry, Limits"
                className="w-full rounded-[10px] px-3.5 py-2.5 text-[14px] transition-all"
                style={{
                  background: '#0F0A1E',
                  border: '1px solid #2D1B69',
                  color: '#F5F3FF',
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
            </div>

            {/* Number of Questions Slider */}
            <div className="md:col-span-2">
              <div className="flex items-center justify-between mb-2">
                <label className="text-[12px] font-medium" style={{ color: '#C4B5FD' }}>
                  Number of Questions
                </label>
                <span className="text-[14px] font-semibold" style={{ color: '#A78BFA' }}>
                  {questionCount}
                </span>
              </div>
              <div className="relative">
                <input
                  ref={sliderRef}
                  type="range"
                  min="5"
                  max="20"
                  step="5"
                  value={questionCount}
                  onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  className="w-full h-1 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(90deg, #7C3AED ${((questionCount - 5) / 15) * 100}%, #2D1B69 ${((questionCount - 5) / 15) * 100}%)`,
                  }}
                />
              </div>
            </div>

            {/* Student Level */}
            <div className="md:col-span-2">
              <label className="block text-[12px] font-medium mb-2" style={{ color: '#C4B5FD' }}>
                Difficulty Level
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { value: 'adaptive',     label: '🤖 Adaptive (AI decides)' },
                  { value: 'beginner',     label: '🟢 Beginner' },
                  { value: 'intermediate', label: '🟡 Intermediate' },
                  { value: 'advanced',     label: '🔴 Advanced' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setStudentLevel(opt.value as any)}
                    className="py-2 px-3 rounded-[10px] text-[12px] font-medium transition-all"
                    style={{
                      background: studentLevel === opt.value ? 'linear-gradient(135deg,#7C3AED,#4F46E5)' : '#0F0A1E',
                      border: `1px solid ${studentLevel === opt.value ? '#7C3AED' : '#2D1B69'}`,
                      color: studentLevel === opt.value ? 'white' : '#A78BFA',
                      boxShadow: studentLevel === opt.value ? '0 4px 14px #7C3AED40' : 'none',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timer per Question */}
            <div className="md:col-span-2">
              <label className="block text-[12px] font-medium mb-2" style={{ color: '#C4B5FD' }}>
                Time per Question
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { value: 30, label: '30 sec (Fast)' },
                  { value: 60, label: '1 min (Normal)' },
                  { value: 90, label: '90 sec (Relaxed)' },
                  { value: 0,  label: 'No Timer' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTimerPerQuestion(opt.value)}
                    className="py-2 px-3 rounded-[10px] text-[12px] font-medium transition-all"
                    style={{
                      background: timerPerQuestion === opt.value ? 'linear-gradient(135deg,#7C3AED,#4F46E5)' : '#0F0A1E',
                      border: `1px solid ${timerPerQuestion === opt.value ? '#7C3AED' : '#2D1B69'}`,
                      color: timerPerQuestion === opt.value ? 'white' : '#A78BFA',
                      boxShadow: timerPerQuestion === opt.value ? '0 4px 14px #7C3AED40' : 'none',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Error Message */}
          {error && (
            <div 
              className="mt-4 p-3 rounded-[10px] text-[13px] flex items-center gap-2"
              style={{ background: '#450A0A', color: '#F87171', border: '1px solid #7F1D1D' }}
            >
              <div className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-[#F87171]" />
              {error}
            </div>
          )}
          {rateWarning && (
            <div className="mt-2 p-3 rounded-[10px] text-[13px] flex items-center gap-2" style={{ background: '#451a03', color: '#fbbf24', border: '1px solid #92400e' }}>
              {rateWarning}
            </div>
          )}

          {/* Start Button */}
          <button
            onClick={handleStartExam}
            disabled={loading}
            className="w-full mt-6 flex items-center justify-center gap-2 text-white text-[16px] font-semibold rounded-[12px] transition-all disabled:opacity-50"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
              height: '52px',
              boxShadow: '0 8px 32px #7C3AED40',
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.filter = 'brightness(1.1)'
                e.currentTarget.style.boxShadow = '0 12px 40px #7C3AED50'
                e.currentTarget.style.transform = 'translateY(-1px)'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.filter = 'brightness(1)'
                e.currentTarget.style.boxShadow = '0 8px 32px #7C3AED40'
                e.currentTarget.style.transform = 'translateY(0)'
              }
            }}
          >
            <Zap size={18} className={loading ? 'animate-pulse' : ''} />
            {loading ? 'Generating Questions...' : 'Start Test'}
          </button>
        </div>
      </div>
    )
  }

  // ===== EXAM STEP =====
  if (step === 'exam') {
    const currentQ = questions[currentQuestionIndex]
    const isLastQuestion = currentQuestionIndex === questions.length - 1
    const progressPercent = ((currentQuestionIndex + 1) / questions.length) * 100
    const hasAnswered = !!userAnswers[currentQ?.number]

    return (
      <div className="min-h-screen" style={{ background: '#080412', maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>
        {/* Back Link */}
        <button
          onClick={() => setStep('setup')}
          className="text-[13px] transition-colors hover:underline"
          style={{ color: '#A78BFA' }}
        >
          ← Back to Setup
        </button>

        {/* Question Counter + Subject */}
        <div className="flex items-center justify-between mt-4 mb-3">
          <h1 className="text-[18px] font-semibold" style={{ color: '#F5F3FF' }}>
            {subject} · {examType}
          </h1>
          <span className="text-[14px] font-medium" style={{ color: '#A78BFA' }}>
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full rounded-full mb-3" style={{ height: '6px', background: '#2D1B69' }}>
          <div
            className="rounded-full transition-all duration-500"
            style={{
              height: '6px',
              width: `${progressPercent}%`,
              background: 'linear-gradient(90deg, #7C3AED, #4F46E5)',
              boxShadow: '0 0 8px #7C3AED80',
            }}
          />
        </div>

        {/* Per-Question Timer */}
        {timerPerQuestion > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px]" style={{ color: '#9CA3AF' }}>Time remaining</span>
              <span
                className="text-[13px] font-bold tabular-nums"
                style={{
                  color: timeLeft > timerPerQuestion * 0.5 ? '#10b981'
                       : timeLeft > timerPerQuestion * 0.25 ? '#f59e0b' : '#ef4444',
                }}
              >
                {timeLeft}s
              </span>
            </div>
            <div className="w-full rounded-full" style={{ height: '4px', background: '#1E1040' }}>
              <div
                className="rounded-full transition-all duration-1000"
                style={{
                  height: '4px',
                  width: `${(timeLeft / timerPerQuestion) * 100}%`,
                  background: timeLeft > timerPerQuestion * 0.5 ? '#10b981'
                            : timeLeft > timerPerQuestion * 0.25 ? '#f59e0b' : '#ef4444',
                  boxShadow: `0 0 6px ${timeLeft > timerPerQuestion * 0.5 ? '#10b981' : timeLeft > timerPerQuestion * 0.25 ? '#f59e0b' : '#ef4444'}60`,
                }}
              />
            </div>
          </div>
        )}

        {/* Question Card */}

        {currentQ && (
          <div
            className="rounded-[14px] p-6"
            style={{
              background: '#160D2E',
              border: '1px solid #2D1B69',
            }}
          >
            {/* Difficulty Badge */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px]" style={{ color: '#9CA3AF' }}>
                {currentQ.chapter || ''}
              </span>
              <span
                className="text-[11px] px-2.5 py-0.5 rounded-[20px]"
                style={{
                  background: currentQ.difficulty === 'Easy' ? '#052E16' : currentQ.difficulty === 'Medium' ? '#451A03' : '#450A0A',
                  color: currentQ.difficulty === 'Easy' ? '#4ADE80' : currentQ.difficulty === 'Medium' ? '#FB923C' : '#F87171',
                  border: `1px solid ${currentQ.difficulty === 'Easy' ? '#166534' : currentQ.difficulty === 'Medium' ? '#92400E' : '#7F1D1D'}`,
                }}
              >
                {currentQ.difficulty}
              </span>
            </div>

            {/* Question Text */}
            <p className="text-[17px] leading-relaxed mb-5" style={{ color: '#F5F3FF' }}>
              {currentQ.text}
            </p>

            {/* Options */}
            <div className="flex flex-col gap-2.5">
              {currentQ.options.map((option) => {
                const isSelected = userAnswers[currentQ.number] === option.label
                return (
                  <button
                    key={option.label}
                    onClick={() => {
                      handleSelectAnswer(currentQ.number, option.label)
                      setNoAnswerWarning(false)
                    }}
                    className="w-full flex items-center gap-3 rounded-[10px] px-4 py-3.5 text-left transition-all"
                    style={{
                      background: isSelected ? 'linear-gradient(135deg, #7C3AED20, #4F46E515)' : '#0F0A1E',
                      border: `1px solid ${isSelected ? '#7C3AED' : '#2D1B69'}`,
                      boxShadow: isSelected ? '0 0 12px #7C3AED30' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#7C3AED'
                        e.currentTarget.style.background = '#160D2E'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.borderColor = '#2D1B69'
                        e.currentTarget.style.background = '#0F0A1E'
                      }
                    }}
                  >
                    <span
                      className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-[13px] font-bold"
                      style={{
                        background: isSelected ? '#7C3AED' : '#1E1040',
                        color: isSelected ? 'white' : '#A78BFA',
                        border: `1px solid ${isSelected ? '#7C3AED' : '#4338CA'}`,
                      }}
                    >
                      {option.label}
                    </span>
                    <span className="text-[14px]" style={{ color: isSelected ? '#F5F3FF' : '#C4B5FD' }}>
                      {option.text}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* No Answer Warning */}
        {noAnswerWarning && (
          <div
            className="mt-3 px-4 py-2.5 rounded-[10px] text-[13px] flex items-center gap-2"
            style={{ background: '#451A03', color: '#FB923C', border: '1px solid #92400E' }}
          >
            <span>⚠</span>
            Please select an answer to continue.
          </div>
        )}

        {/* Next / Submit Button */}
        <button
          onClick={handleNextQuestion}
          className="w-full mt-5 text-[16px] font-semibold text-white rounded-[12px] py-4 transition-all"
          style={{
            background: hasAnswered
              ? 'linear-gradient(135deg, #7C3AED, #4F46E5)'
              : 'linear-gradient(135deg, #3D2A7D, #2E2880)',
            boxShadow: hasAnswered ? '0 8px 32px #7C3AED40' : 'none',
            cursor: 'pointer',
            opacity: 1,
          }}
          onMouseEnter={(e) => { if (hasAnswered) e.currentTarget.style.filter = 'brightness(1.1)' }}
          onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)' }}
        >
          {isLastQuestion ? 'Submit Test & See Results' : 'Next Question →'}
        </button>
      </div>
    )
  }

  // ===== RESULTS STEP =====
  const score = getScore()
  const wrong = getWrongCount()
  const unanswered = getUnansweredCount()
  const timeTaken = getTimeTaken()

  return (
    <div className="min-h-screen" style={{ background: '#080412', maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>
      {/* Back Link */}
      <button
        onClick={() => router.push('/chat')}
        className="text-[13px] transition-colors hover:underline"
        style={{ color: '#A78BFA', marginBottom: '16px', display: 'inline-block' }}
      >
        ← Back to Chat
      </button>

      {analyzing ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mb-4 mx-auto" style={{ borderColor: 'var(--purple-primary)', borderTopColor: 'transparent' }} />
          <h2 className="text-xl font-semibold text-white mb-2">Analyzing Your Performance...</h2>
          <p className="text-sm" style={{ color: '#A78BFA' }}>Our AI is generating a personalized study plan and finding your weak areas.</p>
        </div>
      ) : analysisResult ? (
        <div className="results-dashboard">
          
          {/* Score Hero Card */}
          <div className="result-card score-hero text-center p-8 rounded-2xl" style={{ background: 'linear-gradient(135deg, #160D2E, #1E1040)', border: '1px solid #2D1B69' }}>
            <div className="text-[64px] font-bold" style={{ background: 'linear-gradient(135deg, #A78BFA, #7C3AED)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {analysisResult.overall_score}%
            </div>
            <div className="inline-block mt-2 px-4 py-1.5 rounded-full text-sm font-semibold" style={{ background: '#7C3AED20', color: '#A78BFA', border: '1px solid #7C3AED50' }}>
              {analysisResult.performance_level}
            </div>
            <div className="text-sm mt-4" style={{ color: '#9CA3AF' }}>
              {analysisResult.correct}/{analysisResult.total_questions} correct · Time: {timeTaken}
            </div>
            <p className="mt-4 text-[15px]" style={{ color: '#C4B5FD' }}>{analysisResult.motivational_message}</p>
          </div>

          {/* Topic-wise Analysis */}
          <div className="result-card p-6 rounded-2xl mt-4" style={{ background: '#160D2E', border: '1px solid #2D1B69' }}>
            <h3 className="text-lg font-semibold text-white mb-4">📊 Topic-wise Performance</h3>
            {analysisResult.topic_analysis.map((t: any, i: number) => (
              <div key={i} className="topic-row">
                <div className="topic-info">
                  <span className={`strength-dot ${t.strength}`} />
                  <strong className="text-white text-[15px]">{t.topic}</strong>
                </div>
                <div className="flex items-center gap-4">
                  <div className="topic-bar-bg">
                    <div
                      className="topic-bar-fill"
                      style={{ width: `${(t.correct/t.questions_asked)*100}%`,
                        background: t.strength === 'strong' ? '#10b981'
                          : t.strength === 'average' ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                  <span className="topic-score">{t.correct}/{t.questions_asked}</span>
                </div>
                <p className="topic-recommendation">{t.recommendation}</p>
              </div>
            ))}
          </div>

          {/* Two col — Strengths and Weaknesses */}
          <div className="doubt-two-col mt-4">
            <div className="result-card p-5 rounded-xl" style={{ background: '#160D2E', border: '1px solid #2D1B69' }}>
              <h3 className="text-base font-semibold text-white mb-2">💪 Strongest Area</h3>
              <p className="text-sm" style={{ color: '#C4B5FD' }}>{analysisResult.strongest_area}</p>
            </div>
            <div className="result-card p-5 rounded-xl" style={{ background: '#160D2E', border: '1px solid #2D1B69' }}>
              <h3 className="text-base font-semibold text-white mb-2">🎯 Needs Most Work</h3>
              <p className="text-sm" style={{ color: '#C4B5FD' }}>{analysisResult.weakest_area}</p>
            </div>
          </div>

          {/* Mistake Patterns */}
          <div className="result-card p-6 rounded-2xl mt-4" style={{ background: '#160D2E', border: '1px solid #2D1B69' }}>
            <h3 className="text-lg font-semibold text-white mb-4">⚠️ Mistake Patterns Detected</h3>
            <div className="space-y-2">
              {analysisResult.mistake_patterns.map((m: string, i: number) => (
                <div key={i} className="text-sm p-3 rounded-lg" style={{ color: '#F87171', background: '#450A0A50', border: '1px solid #7F1D1D50' }}>
                  ⚠️ {m}
                </div>
              ))}
            </div>
          </div>

          {/* Study Priority */}
          <div className="result-card p-6 rounded-2xl mt-4" style={{ background: '#160D2E', border: '1px solid #2D1B69' }}>
            <h3 className="text-lg font-semibold text-white mb-4">📚 Study Priority for Next Session</h3>
            <div className="priority-list">
              {analysisResult.study_priority.map((t: string, i: number) => (
                <div key={i} className="priority-item">
                  <span className="priority-num">{i+1}</span>
                  {t}
                </div>
              ))}
            </div>
            <div className="next-step-box">
              <strong style={{ color: '#A78BFA' }}>Next Step:</strong> {analysisResult.next_step}
            </div>
          </div>

          {/* Question Review — expandable */}
          <div className="result-card p-6 rounded-2xl mt-4" style={{ background: '#160D2E', border: '1px solid #2D1B69' }}>
            <h3 className="text-lg font-semibold text-white mb-4">🔍 Question Review</h3>
            {questions.map((q, i) => (
              <div key={i} className={`question-review ${userAnswers[q.number] === q.correctAnswer ? 'correct' : 'wrong'}`}>
                <div className="review-header">
                  <span>{userAnswers[q.number] === q.correctAnswer ? '✅' : '❌'}</span>
                  <span className="difficulty-tag">{q.difficulty}</span>
                  {q.topic_tag && <span className="topic-tag-small">{q.topic_tag}</span>}
                </div>
                <p className="review-question">{q.text}</p>
                <p className="your-answer">Your answer: {userAnswers[q.number] || 'Skipped'} — {q.options.find(o => o.label === userAnswers[q.number])?.text || ''}</p>
                {userAnswers[q.number] !== q.correctAnswer && (
                  <p className="correct-answer">Correct: {q.correctAnswer} — {q.options.find(o => o.label === q.correctAnswer)?.text}</p>
                )}
                <div className="explanation-box">{q.explanation}</div>
                {userAnswers[q.number] !== q.correctAnswer && q.why_wrong && q.why_wrong[userAnswers[q.number]] && (
                  <div className="why-wrong-box">
                    Why your answer was wrong: {q.why_wrong[userAnswers[q.number]]}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
            <button
              onClick={() => {
                const link = getExamWhatsAppLink(score, questions.length, subject)
                window.open(link, '_blank')
              }}
              className="w-full sm:w-auto text-[14px] font-medium px-6 py-3 rounded-[10px] transition-all hover:brightness-110"
              style={{ background: '#075E54', color: 'white' }}
            >
              Share Score on WhatsApp
            </button>
            <button
              onClick={handleTryAnother}
              className="w-full sm:w-auto text-[14px] font-medium px-6 py-3 rounded-[10px] transition-all hover:bg-[#1E1B4B]"
              style={{ border: '1px solid #4338CA', color: '#A78BFA' }}
            >
              Try another test
            </button>
          </div>

        </div>
      ) : (
        <div className="text-center py-20" style={{ color: '#9CA3AF' }}>Failed to analyze results.</div>
      )}
    </div>
  )
}
