'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Calendar, Clock, Target, BookOpen } from 'lucide-react'

const examSubjects: Record<string, string[]> = {
  UPSC: ['Indian Polity', 'History', 'Geography', 'Economics', 'Science & Tech', 'Current Affairs', 'Ethics'],
  JEE: ['Physics', 'Chemistry', 'Mathematics', 'Mechanics', 'Thermodynamics', 'Electromagnetism'],
  NEET: ['Physics', 'Chemistry', 'Biology', 'Zoology', 'Botany', 'Organic Chemistry'],
  CAT: ['Verbal Ability', 'Reading Comprehension', 'Quantitative Aptitude', 'Logical Reasoning', 'Data Interpretation'],
}

export default function PlannerPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    targetExam: '',
    examDate: '',
    studyHours: '6',
    weakSubjects: [] as string[],
    strongSubjects: [] as string[],
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

  const handleGeneratePlan = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (response.ok) {
        sessionStorage.setItem('generatedPlan', JSON.stringify(data))
        sessionStorage.setItem('planMeta', JSON.stringify(formData))
        router.push('/planner/results')
      } else {
        alert(`Error: ${data.error || 'Failed to generate plan'}`)
      }
    } catch (error) {
      console.error('Plan generation failed:', error)
      alert('Failed to generate plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const availableSubjects = examSubjects[formData.targetExam] || []

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
                onChange={(e) => setFormData({...formData, targetExam: e.target.value, weakSubjects: [], strongSubjects: []})}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
                style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                <option value="">Select your exam...</option>
                <option value="UPSC">UPSC</option>
                <option value="JEE">JEE</option>
                <option value="NEET">NEET</option>
                <option value="CAT">CAT</option>
                <option value="Other">Other</option>
              </select>
            </div>

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

            <button
              onClick={() => setStep(2)}
              disabled={!formData.targetExam || !formData.examDate}
              className="w-full py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: 'var(--accent)' }}
            >
              Next Step
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">Step 2: Your Weak Subjects</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
              Select subjects you need more practice with (they'll get more study time)
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {availableSubjects.map(subject => (
                <button
                  key={subject}
                  onClick={() => handleSubjectToggle('weakSubjects', subject)}
                  className="p-3 border rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: formData.weakSubjects.includes(subject) ? 'var(--error-light)' : 'var(--background)',
                    borderColor: formData.weakSubjects.includes(subject) ? 'var(--error)' : 'var(--border)',
                    color: formData.weakSubjects.includes(subject) ? 'var(--error)' : 'var(--foreground)'
                  }}
                >
                  {subject}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border rounded-lg font-semibold hover:opacity-80 transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Next Step
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-2">Step 3: Your Strong Subjects</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
              Select subjects you're already good at (they'll get less time)
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              {availableSubjects.filter(s => !formData.weakSubjects.includes(s)).map(subject => (
                <button
                  key={subject}
                  onClick={() => handleSubjectToggle('strongSubjects', subject)}
                  className="p-3 border rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: formData.strongSubjects.includes(subject) ? 'var(--success-light)' : 'var(--background)',
                    borderColor: formData.strongSubjects.includes(subject) ? 'var(--success)' : 'var(--border)',
                    color: formData.strongSubjects.includes(subject) ? 'var(--success)' : 'var(--foreground)'
                  }}
                >
                  {subject}
                </button>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 border rounded-lg font-semibold hover:opacity-80 transition-all"
                style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
              >
                Back
              </button>
              <button
                onClick={handleGeneratePlan}
                disabled={loading}
                className="flex-1 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-all disabled:opacity-50"
                style={{ backgroundColor: 'var(--highlight)' }}
              >
                {loading ? 'Generating Plan...' : 'Generate My Study Plan'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
