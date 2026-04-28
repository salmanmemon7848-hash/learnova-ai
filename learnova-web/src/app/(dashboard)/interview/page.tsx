'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Target, Briefcase, GraduationCap, Sparkles } from 'lucide-react'

export default function InterviewPage() {
  const { user } = useAuth()
  const [step, setStep] = useState<'setup' | 'interview' | 'results'>('setup')
  const [interviewType, setInterviewType] = useState('')
  const [schoolClass, setSchoolClass] = useState('')
  const [role, setRole] = useState('')
  const [language, setLanguage] = useState('english')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [questions, setQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<{question: string, answer: string, score: number, feedback: string, improvement: string}[]>([])
  const [userAnswer, setUserAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFeedback, setShowFeedback] = useState(false)

  const interviewTypes = [
    {
      group: 'School & College',
      options: [
        { value: 'school_general', label: '🏫 School Interview (Class 9–12)' },
        { value: 'school_science', label: '🔬 Science Stream Interview' },
        { value: 'school_commerce', label: '💼 Commerce Stream Interview' },
        { value: 'college_admission', label: '🎓 College Admission Interview' },
        { value: 'iit_interview', label: '⚛️ IIT/NIT Counselling' },
        { value: 'medical_college', label: '🏥 Medical College Interview' },
      ]
    },
    {
      group: 'Job Interviews',
      options: [
        { value: 'software_engineer', label: '💻 Software Engineer' },
        { value: 'marketing', label: '📣 Marketing' },
        { value: 'sales', label: '🤝 Sales' },
        { value: 'operations', label: '⚙️ Operations' },
        { value: 'finance', label: '💰 Finance/Banking' },
        { value: 'hr', label: '👥 HR / People Ops' },
      ]
    },
    {
      group: 'Startup & Business',
      options: [
        { value: 'startup_founder', label: '🚀 Startup Founder Pitch' },
        { value: 'investor_pitch', label: '💡 Investor Q&A Practice' },
      ]
    },
    {
      group: 'Government / Competitive',
      options: [
        { value: 'upsc_interview', label: '🏛️ UPSC Personality Test' },
        { value: 'ssc_interview', label: '📋 SSC / Government Job' },
        { value: 'bank_interview', label: '🏦 Bank PO Interview' },
      ]
    }
  ]

  const startInterview = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewType,
          schoolClass,
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

        <div className="interview-config-card">
          <h2>Setup Your Interview</h2>

          {/* Interview Type — Grouped Dropdown */}
          <div className="form-field">
            <label className="form-label">Interview Type</label>
            <select
              className="form-select"
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
            >
              <option value="">Select type...</option>
              {interviewTypes.map(group => (
                <optgroup key={group.group} label={group.group}>
                  {group.options.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          {/* School class — show only for school interview types */}
          {interviewType.startsWith('school_') && (
            <div className="form-field">
              <label className="form-label">Your Class</label>
              <select
                className="form-select"
                value={schoolClass}
                onChange={(e) => setSchoolClass(e.target.value)}
              >
                <option value="">Select your class...</option>
                {['Class 9','Class 10','Class 11','Class 12'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          )}

          {/* Language */}
          <div className="form-field">
            <label className="form-label">Language</label>
            <select
              className="form-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="english">English</option>
              <option value="hindi">हिंदी (Hindi)</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>

          <button
            className="btn-primary"
            onClick={startInterview}
            disabled={!interviewType}
          >
            ✨ Start Interview
          </button>
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
