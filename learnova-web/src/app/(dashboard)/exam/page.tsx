'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Clock, CheckCircle, XCircle, TrendingUp, RotateCcw } from 'lucide-react'

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
  topic: string
}

export default function ExamSimulatorPage() {
  const { user } = useAuth()
  const [step, setStep] = useState(1) // 1: setup, 2: exam, 3: results
  const [examType, setExamType] = useState('')
  const [schoolClass, setSchoolClass] = useState('')
  const [subject, setSubject] = useState('')
  const [chapter, setChapter] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [questionCount, setQuestionCount] = useState(10)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{questionIndex: number, answer: number, correct: boolean}[]>([])
  const [loading, setLoading] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeLeft, setTimeLeft] = useState(0)
  const [examStartTime, setExamStartTime] = useState<Date | null>(null)

  // Exam types with School added
  const examTypes = [
    { value: 'school', label: '🏫 School (Class 6–12)' },
    { value: 'jee', label: '⚛️ JEE Main & Advanced' },
    { value: 'neet', label: '🧬 NEET' },
    { value: 'upsc', label: '🏛️ UPSC' },
    { value: 'cat', label: '📊 CAT' },
    { value: 'other', label: '📚 Other' },
  ]

  // School class options
  const schoolClasses = [
    'Class 6', 'Class 7', 'Class 8',
    'Class 9', 'Class 10', 'Class 11', 'Class 12'
  ]

  // Timer logic
  useEffect(() => {
    if (step === 2 && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (step === 2 && timeLeft === 0 && questions.length > 0) {
      // Auto-submit when time runs out
      calculateResults()
    }
  }, [timeLeft, step])

  const getTimePerQuestion = () => {
    switch(difficulty) {
      case 'easy': return 90
      case 'medium': return 120
      case 'hard': return 150
      default: return 120
    }
  }

  const startExam = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examType,
          schoolClass,
          subject,
          chapter,
          difficulty,
          questionCount,
        }),
      })

      const data = await response.json()
      setQuestions(data.questions || [])
      setTimeLeft(getTimePerQuestion() * (data.questions?.length || questionCount))
      setExamStartTime(new Date())
      setStep(2)
    } catch (error) {
      console.error('Failed to generate exam:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = (answerIndex: number) => {
    const currentQ = questions[currentQuestion]
    const isCorrect = answerIndex === currentQ.correctAnswer
    
    setAnswers(prev => [...prev, {
      questionIndex: currentQuestion,
      answer: answerIndex,
      correct: isCorrect
    }])
    
    setShowExplanation(true)
  }

  const nextQuestion = () => {
    setShowExplanation(false)
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setTimeLeft(getTimePerQuestion())
    } else {
      calculateResults()
    }
  }

  const calculateResults = () => {
    const endTime = new Date()
    const timeTaken = examStartTime ? Math.floor((endTime.getTime() - examStartTime.getTime()) / 1000) : 0
    
    // Save to localStorage
    const sessions = JSON.parse(localStorage.getItem('learnova_exam_sessions') || '[]')
    sessions.push({
      examType,
      subject,
      difficulty,
      score: answers.filter(a => a.correct).length,
      total: questions.length,
      timeTaken,
      date: new Date().toISOString(),
    })
    localStorage.setItem('learnova_exam_sessions', JSON.stringify(sessions.slice(-10))) // Keep last 10
    
    setStep(3)
  }

  const resetExam = () => {
    setStep(1)
    setCurrentQuestion(0)
    setAnswers([])
    setShowExplanation(false)
    setQuestions([])
  }

  const score = answers.filter(a => a.correct).length
  const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0
  const timeTaken = examStartTime ? Math.floor((new Date().getTime() - examStartTime.getTime()) / 1000) : 0

  return (
    <div className="max-w-4xl mx-auto" style={{ color: 'var(--foreground)' }}>
      <h1 className="text-3xl font-bold mb-6 font-heading">
        Exam Simulator
      </h1>

      {step === 1 && (
        <div className="exam-config-card">
          <h2>Configure Your Practice Test</h2>
          
          <div className="space-y-4">
            {/* Exam Type */}
            <div className="form-field">
              <label className="form-label">Exam Type</label>
              <select
                className="form-select"
                value={examType}
                onChange={(e) => setExamType(e.target.value)}
              >
                <option value="">Select exam type...</option>
                {examTypes.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>

            {/* School Class — only show if School selected */}
            {examType === 'school' && (
              <div className="form-field">
                <label className="form-label">Class / Grade</label>
                <select
                  className="form-select"
                  value={schoolClass}
                  onChange={(e) => setSchoolClass(e.target.value)}
                >
                  <option value="">Select your class...</option>
                  {schoolClasses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Subject — show for all exam types */}
            <div className="form-field">
              <label className="form-label">Subject</label>
              <input
                type="text"
                className="form-input"
                placeholder={
                  examType === 'school'
                    ? 'e.g., Mathematics, Science, History...'
                    : 'e.g., Physics, Indian Polity, Mathematics...'
                }
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>

            {/* Chapter — NEW field, show for all exam types */}
            <div className="form-field">
              <label className="form-label">
                Chapter <span className="label-optional">(optional)</span>
              </label>
              <input
                type="text"
                className="form-input"
                placeholder={
                  examType === 'school'
                    ? 'e.g., Fractions, Light & Shadow, French Revolution...'
                    : 'e.g., Thermodynamics, Mughal Empire, Limits...'
                }
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
              />
              <p className="field-hint">
                Add a chapter for more focused questions
              </p>
            </div>

            {/* Difficulty */}
            <div className="form-field">
              <label className="form-label">Difficulty</label>
              <select
                className="form-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Easy (90s per question)</option>
                <option value="medium">Medium (120s per question)</option>
                <option value="hard">Hard (180s per question)</option>
              </select>
            </div>

            {/* Number of Questions */}
            <div className="form-field">
              <label className="form-label">Number of Questions</label>
              <div className="count-options">
                {[5, 10, 20].map(n => (
                  <button
                    key={n}
                    className={`count-btn ${questionCount === n ? 'selected' : ''}`}
                    onClick={() => setQuestionCount(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn-primary"
              onClick={startExam}
              disabled={loading || !examType || !subject || (examType === 'school' && !schoolClass)}
            >
              {loading ? 'Generating Questions...' : 'Start Exam →'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && questions.length > 0 && (
        <div>
          {/* Progress and Timer */}
          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <Clock className="w-4 h-4" style={{ color: timeLeft < 30 ? 'var(--error)' : 'var(--accent)' }} />
              <span className="text-sm font-mono font-semibold" style={{ color: timeLeft < 30 ? 'var(--error)' : 'var(--foreground)' }}>
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 className="text-lg font-semibold mb-6">
              {questions[currentQuestion]?.question}
            </h3>

            <div className="space-y-3">
              {questions[currentQuestion]?.options.map((option: string, index: number) => {
                const isSelected = answers[answers.length - 1]?.questionIndex === currentQuestion && 
                                  answers[answers.length - 1]?.answer === index
                const isCorrect = index === questions[currentQuestion].correctAnswer
                const showResult = showExplanation

                return (
                  <button
                    key={index}
                    onClick={() => !showExplanation && submitAnswer(index)}
                    disabled={showExplanation}
                    className="w-full text-left px-4 py-3 border rounded-lg transition-all min-h-[48px]"
                    style={{
                      backgroundColor: showResult 
                        ? isCorrect ? 'var(--success-light)' : isSelected ? 'var(--error-light)' : 'var(--background)'
                        : 'var(--background)',
                      borderColor: showResult
                        ? isCorrect ? 'var(--success)' : isSelected ? 'var(--error)' : 'var(--border)'
                        : 'var(--border)',
                      color: 'var(--foreground)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <span>{option}</span>
                      {showResult && isCorrect && <CheckCircle className="w-5 h-5" style={{ color: 'var(--success)' }} />}
                      {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5" style={{ color: 'var(--error)' }} />}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Explanation */}
          {showExplanation && (
            <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--active-bg)', border: '1px solid var(--accent)' }}>
              <h4 className="font-semibold mb-2" style={{ color: 'var(--accent)' }}>
                Explanation:
              </h4>
              <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>
                {questions[currentQuestion]?.explanation || 'Explanation will be provided by AI.'}
              </p>
              <button
                onClick={nextQuestion}
                className="mt-4 w-full py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'View Results'}
              </button>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-2xl font-bold mb-6">Exam Results</h2>
          
          <div className="text-center mb-8">
            <div className="text-6xl font-bold mb-2" style={{ color: 'var(--accent)' }}>
              {percentage}%
            </div>
            <p className="text-lg" style={{ color: 'var(--foreground-secondary)' }}>
              {score} out of {questions.length} correct
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--foreground-muted)' }}>Time Taken</p>
              <p className="text-lg font-semibold">{Math.floor(timeTaken / 60)}m {timeTaken % 60}s</p>
            </div>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
              <p className="text-xs mb-1" style={{ color: 'var(--foreground-muted)' }}>Difficulty</p>
              <p className="text-lg font-semibold capitalize">{difficulty}</p>
            </div>
          </div>

          {percentage >= 80 ? (
            <p className="text-center mb-6 text-lg">🔥 Outstanding! You nailed it!</p>
          ) : percentage >= 60 ? (
            <p className="text-center mb-6 text-lg">👍 Good effort! Keep it up!</p>
          ) : percentage >= 40 ? (
            <p className="text-center mb-6 text-lg">📚 Not bad! A bit more practice needed.</p>
          ) : (
            <p className="text-center mb-6 text-lg">💪 Keep practicing, you will get there!</p>
          )}

          <div className="flex gap-3">
            <button
              onClick={resetExam}
              className="flex-1 py-3 rounded-lg hover:opacity-90 transition-all font-semibold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--highlight)' }}
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <button
              onClick={() => {
                setDifficulty(difficulty === 'hard' ? 'hard' : 'hard')
                resetExam()
              }}
              className="flex-1 py-3 border rounded-lg hover:opacity-80 transition-all flex items-center justify-center gap-2"
              style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <TrendingUp className="w-4 h-4" />
              Try Harder
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
