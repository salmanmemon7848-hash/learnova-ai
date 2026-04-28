'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Target, Briefcase, GraduationCap, Sparkles } from 'lucide-react'

export default function InterviewPage() {
  const { user } = useAuth()
  const [step, setStep] = useState<'setup' | 'interview' | 'results'>('setup')
  const [interviewType, setInterviewType] = useState('')
  const [role, setRole] = useState('')
  const [language, setLanguage] = useState('english')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<{question: string, answer: string, score: number, feedback: string, improvement: string}[]>([])
  const [userAnswer, setUserAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const startInterview = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewType,
          role,
          language,
          action: 'generate_questions',
        }),
      })

      const data = await response.json()
      setQuestions(data.questions || [])
      setStep('interview')
    } catch (error) {
      console.error('Failed to start interview:', error)
    } finally {
      setLoading(false)
    }
  }

  const submitAnswer = async () => {
    if (!userAnswer.trim()) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questions[currentQuestion],
          answer: userAnswer,
          language,
          action: 'evaluate_answer',
        }),
      })

      const data = await response.json()
      
      setAnswers(prev => [...prev, {
        question: questions[currentQuestion],
        answer: userAnswer,
        score: data.score || 0,
        feedback: data.feedback || '',
        improvement: data.improvement || '',
      }])

      setShowFeedback(true)
    } catch (error) {
      console.error('Failed to evaluate answer:', error)
    } finally {
      setLoading(false)
    }
  }

  const nextQuestion = () => {
    setShowFeedback(false)
    setUserAnswer('')
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setStep('results')
    }
  }

  const averageScore = answers.length > 0 
    ? (answers.reduce((sum, a) => sum + a.score, 0) / answers.length).toFixed(1)
    : 0

  if (step === 'setup') {
    return (
      <div className="max-w-4xl mx-auto" style={{ color: 'var(--foreground)' }}>
        <div className="mb-8">
          <h1 className="text-4xl font-bold font-heading mb-2">
            Practice interviews until you're unbeatable
          </h1>
          <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
            AI-powered mock interviews in English, Hindi, or Hinglish — available 24/7, brutally honest feedback
          </p>
        </div>

        <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h2 className="text-xl font-semibold mb-6">Setup Your Interview</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-secondary)' }}>
                Interview Type
              </label>
              <select
                value={interviewType}
                onChange={(e) => setInterviewType(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="">Select type...</option>
                <option value="job">Job Interview</option>
                <option value="college">College Interview</option>
                <option value="startup">Startup Founder Pitch Practice</option>
              </select>
            </div>

            {interviewType === 'job' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-secondary)' }}>
                  Target Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  <option value="">Select role...</option>
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Sales">Sales</option>
                  <option value="Operations">Operations</option>
                </select>
              </div>
            )}

            {interviewType === 'college' && (
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-secondary)' }}>
                  Target Institution
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g., IIT Delhi, IIM Bangalore"
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                  style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-secondary)' }}>
                Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="english">English</option>
                <option value="hindi">Hindi</option>
                <option value="hinglish">Hinglish</option>
              </select>
            </div>

            <button
              onClick={startInterview}
              disabled={loading || !interviewType}
              className="w-full py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-white flex items-center justify-center gap-2"
              style={{ backgroundColor: 'var(--highlight)' }}
            >
              <Sparkles className="w-5 h-5" />
              {loading ? 'Preparing Interview...' : 'Start Interview'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (step === 'interview') {
    return (
      <div className="max-w-4xl mx-auto" style={{ color: 'var(--foreground)' }}>
        <div className="flex justify-between items-center mb-6">
          <span className="text-sm font-medium" style={{ color: 'var(--foreground-secondary)' }}>
            Question {currentQuestion + 1} of {questions.length}
          </span>
        </div>

        <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
          <h3 className="text-lg font-semibold mb-4">
            {questions[currentQuestion]}
          </h3>

          <textarea
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            placeholder="Type your answer here..."
            rows={6}
            className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all resize-none mb-4"
            style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            disabled={showFeedback}
          />

          {!showFeedback && (
            <button
              onClick={submitAnswer}
              disabled={loading || !userAnswer.trim()}
              className="w-full py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-white"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              {loading ? 'Evaluating...' : 'Submit Answer'}
            </button>
          )}
        </div>

        {showFeedback && answers.length > 0 && (
          <div className="space-y-4">
            <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--active-bg)', border: '1px solid var(--accent)' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="text-3xl font-bold" style={{ color: 'var(--accent)' }}>
                  {answers[answers.length - 1].score}/10
                </div>
                <div className="text-sm" style={{ color: 'var(--foreground-muted)' }}>Your Score</div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: 'var(--success)' }}>What was good:</h4>
                  <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>{answers[answers.length - 1].feedback}</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1" style={{ color: 'var(--warning)' }}>What to improve:</h4>
                  <p className="text-sm" style={{ color: 'var(--foreground-secondary)' }}>{answers[answers.length - 1].improvement}</p>
                </div>
              </div>

              <button
                onClick={nextQuestion}
                className="mt-6 w-full py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {currentQuestion < questions.length - 1 ? 'Next Question' : 'View Results'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Results
  return (
    <div className="max-w-4xl mx-auto" style={{ color: 'var(--foreground)' }}>
      <h1 className="text-3xl font-bold font-heading mb-6">Interview Complete!</h1>

      <div className="rounded-xl p-8 mb-6 text-center" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="text-7xl font-bold mb-2" style={{ color: 'var(--accent)' }}>
          {averageScore}
        </div>
        <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>Average Score out of 10</p>
      </div>

      <div className="space-y-4 mb-6">
        {answers.map((a, i) => (
          <div key={i} className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold flex-1 mr-4">Q{i + 1}: {a.question}</h3>
              <span className="text-2xl font-bold flex-shrink-0" style={{ color: 'var(--accent)' }}>{a.score}/10</span>
            </div>
            <div className="space-y-2">
              <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}><strong>Your answer:</strong> {a.answer}</p>
              <p className="text-sm" style={{ color: 'var(--success)' }}><strong>Feedback:</strong> {a.feedback}</p>
              <p className="text-sm" style={{ color: 'var(--warning)' }}><strong>Improvement:</strong> {a.improvement}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => window.location.reload()}
        className="w-full py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all"
        style={{ backgroundColor: 'var(--highlight)' }}
      >
        Take Another Interview
      </button>
    </div>
  )
}
