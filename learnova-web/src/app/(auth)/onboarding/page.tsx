'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { createClient } from '@/lib/supabase/client'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = useMemo(() => createClient(), [])
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<'student' | 'business'>('student')
  const [toneMode, setToneMode] = useState('balanced')
  const [language, setLanguage] = useState('en')

  const handleSubmit = async () => {
    if (!user?.id) return

    try {
      await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userType,
          toneMode,
          language,
        }),
      })

      router.push('/chat')
      router.refresh()
    } catch (error) {
      console.error('Failed to save preferences:', error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        {step === 1 && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Learnova! 🌟</h1>
            <p className="text-gray-600 mb-8">Let's personalize your experience. What best describes you?</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setUserType('student')}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                  userType === 'student'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-4xl mb-3">📚</div>
                <h3 className="text-xl font-semibold mb-2">Student</h3>
                <p className="text-gray-600">I want to learn better and faster</p>
              </button>

              <button
                onClick={() => setUserType('business')}
                className={`p-6 border-2 rounded-xl text-left transition-all ${
                  userType === 'business'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-4xl mb-3">🚀</div>
                <h3 className="text-xl font-semibold mb-2">Business Builder</h3>
                <p className="text-gray-600">I want to turn ideas into real businesses</p>
              </button>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">How should I explain things?</h1>
            <p className="text-gray-600 mb-8">Choose your preferred communication style</p>

            <div className="space-y-3 mb-8">
              {[
                { id: 'simple', title: 'Simple Mode', desc: 'Like talking to a curious 16-year-old. No jargon.' },
                { id: 'balanced', title: 'Balanced Mode', desc: 'Clear and friendly with some technical terms.' },
                { id: 'expert', title: 'Expert Mode', desc: 'Peer-level conversation. Deep and technical.' },
              ].map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setToneMode(mode.id)}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all ${
                    toneMode === mode.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h3 className="font-semibold mb-1">{mode.title}</h3>
                  <p className="text-sm text-gray-600">{mode.desc}</p>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">What's your preferred language?</h1>
            <p className="text-gray-600 mb-8">I'll respond in your chosen language</p>

            <div className="space-y-3 mb-8">
              {[
                { id: 'en', name: 'English', flag: '🇺🇸' },
                { id: 'hi', name: 'Hindi', flag: '🇮🇳' },
                { id: 'hinglish', name: 'Hinglish', flag: '🇮🇳' },
              ].map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`w-full p-4 border-2 rounded-xl text-left transition-all flex items-center gap-3 ${
                    language === lang.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-semibold">{lang.name}</span>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Get Started 🚀
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
