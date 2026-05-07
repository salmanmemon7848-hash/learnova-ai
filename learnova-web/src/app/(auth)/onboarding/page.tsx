'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [persona, setPersona] = useState<'student' | 'founder'>('student')
  const [language, setLanguage] = useState<'english' | 'hindi'>('english')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!user?.id) {
      console.error('No user found')
      return
    }

    setLoading(true)

    try {
      // Save persona to localStorage
      localStorage.setItem('thinkior_persona', persona)
      
      // Save language preference
      const langKey = language === 'hindi' ? 'hindi' : 'english'
      localStorage.setItem('thinkior_language', langKey)

      console.log('Onboarding complete:', { persona, language })
      
      // Small delay to ensure localStorage is saved
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // Redirect to chat
      router.push('/chat')
    } catch (error) {
      console.error('Failed to save preferences:', error)
      alert('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#080412' }}
    >
      <div
        className="max-w-2xl w-full rounded-2xl p-8"
        style={{
          background: 'linear-gradient(135deg, #160D2E, #1E1040)',
          border: '1px solid #2D1B69',
          boxShadow: '0 0 40px #7C3AED18',
        }}
      >
        {step === 1 && (
          <div>
            <h1
              className="text-3xl font-bold mb-4"
              style={{ color: '#F5F3FF' }}
            >
              Welcome to Thinkior! 🌟
            </h1>
            <p
              className="text-base mb-8"
              style={{ color: '#C4B5FD' }}
            >
              Let's personalize your experience. What best describes you?
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setPersona('student')}
                className="p-6 border-2 rounded-xl text-left transition-all"
                style={{
                  background: persona === 'student' ? '#1E1B4B' : '#0F0A1E',
                  borderColor: persona === 'student' ? '#7C3AED' : '#2D1B69',
                  color: '#F5F3FF',
                }}
              >
                <div className="text-4xl mb-3">📚</div>
                <h3 className="text-xl font-semibold mb-2">Student</h3>
                <p style={{ color: '#C4B5FD' }}>I want to learn better and faster</p>
              </button>

              <button
                onClick={() => setPersona('founder')}
                className="p-6 border-2 rounded-xl text-left transition-all"
                style={{
                  background: persona === 'founder' ? '#1E1B4B' : '#0F0A1E',
                  borderColor: persona === 'founder' ? '#7C3AED' : '#2D1B69',
                  color: '#F5F3FF',
                }}
              >
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="text-xl font-semibold mb-2">Founder</h3>
                <p style={{ color: '#C4B5FD' }}>I want to turn ideas into real businesses</p>
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-lg transition-all font-medium"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                color: 'white',
              }}
              onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 32px #7C3AED50'}
              onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1
              className="text-3xl font-bold mb-4"
              style={{ color: '#F5F3FF' }}
            >
              Choose your persona
            </h1>
            <p
              className="text-base mb-8"
              style={{ color: '#C4B5FD' }}
            >
              This will personalize your AI experience
            </p>

            <div className="space-y-3 mb-8">
              <div
                className="p-4 border-2 rounded-xl"
                style={{
                  background: persona === 'student' ? '#1E1B4B' : '#0F0A1E',
                  borderColor: persona === 'student' ? '#7C3AED' : '#2D1B69',
                  color: '#F5F3FF',
                }}
              >
                <h3 className="font-semibold mb-1">📚 Student Persona</h3>
                <p className="text-sm" style={{ color: '#C4B5FD' }}>
                  Get help with exams, study plans, and learning concepts
                </p>
              </div>
              <div
                className="p-4 border-2 rounded-xl"
                style={{
                  background: persona === 'founder' ? '#1E1B4B' : '#0F0A1E',
                  borderColor: persona === 'founder' ? '#7C3AED' : '#2D1B69',
                  color: '#F5F3FF',
                }}
              >
                <h3 className="font-semibold mb-1">🚀 Founder Persona</h3>
                <p className="text-sm" style={{ color: '#C4B5FD' }}>
                  Validate ideas, create business plans, and get startup advice
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-lg transition-all font-medium"
                style={{
                  background: '#0F0A1E',
                  border: '1px solid #2D1B69',
                  color: '#C4B5FD',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#160D2E'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#0F0A1E'}
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-3 rounded-lg transition-all font-medium"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  color: 'white',
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 8px 32px #7C3AED50'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1
              className="text-3xl font-bold mb-4"
              style={{ color: '#F5F3FF' }}
            >
              What's your preferred language? 🌍
            </h1>
            <p
              className="text-base mb-8"
              style={{ color: '#C4B5FD' }}
            >
              I'll respond in your chosen language
            </p>

            <div className="space-y-3 mb-8">
              {[
                { id: 'english' as const, name: 'English', flag: '🇺🇸' },
                { id: 'hindi' as const, name: 'Hindi', flag: '🇮🇳' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className="w-full p-4 border-2 rounded-xl text-left transition-all flex items-center gap-3"
                  style={{
                    background: language === lang.id ? '#1E1B4B' : '#0F0A1E',
                    borderColor: language === lang.id ? '#7C3AED' : '#2D1B69',
                    color: '#F5F3FF',
                  }}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-semibold">{lang.name}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 py-3 rounded-lg transition-all font-medium"
                style={{
                  background: '#0F0A1E',
                  border: '1px solid #2D1B69',
                  color: '#C4B5FD',
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#160D2E'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#0F0A1E'}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 rounded-lg transition-all font-medium disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  color: 'white',
                }}
                onMouseEnter={(e) => {
                  if (!loading) e.currentTarget.style.boxShadow = '0 8px 32px #7C3AED50'
                }}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                {loading ? 'Getting Started...' : 'Get Started 🚀'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
