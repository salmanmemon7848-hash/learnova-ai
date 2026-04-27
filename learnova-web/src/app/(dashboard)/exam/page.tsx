'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import ReactMarkdown from 'react-markdown'

export default function ExamSimulatorPage() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [subject, setSubject] = useState('')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState('medium')
  const [questionCount, setQuestionCount] = useState(10)
  const [questions, setQuestions] = useState<any[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [score, setScore] = useState(0)

  const startExam = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          topic,
          difficulty,
          questionCount,
        }),
      })

      const data = await response.json()
      setQuestions(data.questions || [])
      setStep(2)
    } catch (error) {
      console.error('Failed to generate exam:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, { question: currentQuestion, answer: answerIndex }]
    setAnswers(newAnswers)

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      calculateScore(newAnswers)
    }
  }

  const calculateScore = (finalAnswers: any[]) => {
    let correct = 0
    finalAnswers.forEach((item, index) => {
      const userAnswer = Number(item.answer)
      const correctAnswer = Number(questions[index]?.correctAnswer)
      if (userAnswer === correctAnswer) {
        correct++
      }
    })
    setScore(correct)
    setShowResults(true)
    setStep(3)
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6" style={{ color: '#e2e8f0' }}>
        Exam Simulator 📝
      </h1>

      {step === 1 && (
        <div className="rounded-[10px] border p-4 sm:p-6" style={{ backgroundColor: '#13151e', borderColor: '#2a2d3a' }}>
          <h2 className="text-lg sm:text-xl font-semibold mb-4" style={{ color: '#e2e8f0' }}>Configure Your Practice Test</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#9ca3af' }}>
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g., Mathematics, Physics, Economics"
                className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 transition-all text-sm sm:text-base"
                style={{ 
                  backgroundColor: '#0f1117',
                  borderColor: '#2a2d3a',
                  color: '#e2e8f0'
                }}
                onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
                onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#9ca3af' }}>
                Topic (optional)
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Calculus, Thermodynamics"
                className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 transition-all text-sm sm:text-base"
                style={{ 
                  backgroundColor: '#0f1117',
                  borderColor: '#2a2d3a',
                  color: '#e2e8f0'
                }}
                onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
                onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#9ca3af' }}>
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 transition-all text-sm sm:text-base"
                style={{ 
                  backgroundColor: '#0f1117',
                  borderColor: '#2a2d3a',
                  color: '#e2e8f0'
                }}
                onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
                onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1" style={{ color: '#9ca3af' }}>
                Number of Questions
              </label>
              <input
                type="number"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                min={5}
                max={20}
                className="w-full px-3 sm:px-4 py-2 border rounded-lg focus:ring-2 transition-all text-sm sm:text-base"
                style={{ 
                  backgroundColor: '#0f1117',
                  borderColor: '#2a2d3a',
                  color: '#e2e8f0'
                }}
                onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
                onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
              />
            </div>
            <button
              onClick={startExam}
              disabled={loading || !subject}
              className="w-full py-2 sm:py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-white text-sm sm:text-base"
              style={{ backgroundColor: '#7c3aed' }}
            >
              {loading ? 'Generating Questions...' : 'Start Exam'}
            </button>
          </div>
        </div>
      )}

      {step === 2 && questions.length > 0 && (
        <div className="rounded-[10px] border p-4 sm:p-6" style={{ backgroundColor: '#13151e', borderColor: '#2a2d3a' }}>
          <div className="mb-4">
            <span className="text-xs sm:text-sm" style={{ color: '#9ca3af' }}>
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <h3 className="text-base sm:text-lg font-semibold mb-4" style={{ color: '#e2e8f0' }}>
            {questions[currentQuestion]?.question}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
            {questions[currentQuestion]?.options?.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => submitAnswer(index)}
                className="w-full text-left px-3 sm:px-4 py-3 sm:py-3 border rounded-lg transition-all hover:scale-[1.02] text-sm sm:text-base min-h-[48px]"
                style={{ 
                  backgroundColor: '#1e2130',
                  borderColor: '#2a2d3a',
                  color: '#e2e8f0'
                }}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="rounded-[10px] border p-6" style={{ backgroundColor: '#13151e', borderColor: '#2a2d3a' }}>
          <h2 className="text-2xl font-bold mb-4" style={{ color: '#e2e8f0' }}>Exam Results</h2>
          <div className="text-center mb-6">
            <div className="text-6xl font-bold mb-2" style={{ color: '#a78bfa' }}>
              {score}/{questions.length}
            </div>
            <p style={{ color: '#9ca3af' }}>
              {(() => {
                const percentage = Math.round((score / questions.length) * 100)
                if (percentage >= 80) return '🔥 Outstanding! You nailed it!'
                if (percentage >= 60) return '👍 Good effort! Keep it up!'
                if (percentage >= 40) return '📚 Not bad! A bit more practice needed.'
                if (percentage >= 20) return '💪 Keep practicing, you will get there!'
                return '🎯 Just getting started — keep going!'
              })()}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setStep(1)
                setCurrentQuestion(0)
                setAnswers([])
                setShowResults(false)
              }}
              className="flex-1 py-3 rounded-lg hover:opacity-90 transition-all font-medium text-white"
              style={{ backgroundColor: '#534AB7' }}
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setDifficulty(difficulty === 'hard' ? 'hard' : 'hard')
                setStep(1)
                setCurrentQuestion(0)
                setAnswers([])
                setShowResults(false)
              }}
              className="flex-1 py-3 border rounded-lg hover:opacity-80 transition-all"
              style={{ 
                backgroundColor: '#1e2130',
                borderColor: '#2a2d3a',
                color: '#e2e8f0'
              }}
            >
              Try Harder Version
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
