'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle } from 'lucide-react'

interface OnboardingModalProps {
  isOpen: boolean
  onClose: () => void
}

type UserType = 'student' | 'business'
type ToneMode = 'simple' | 'balanced' | 'expert' | 'study' | 'business'
type Language = 'en' | 'hi' | 'hinglish'

interface ToneOption {
  id: ToneMode
  name: string
  icon: string
  description: string
  color: string
}

interface LanguageOption {
  id: Language
  name: string
  flag: string
}

const toneOptions: ToneOption[] = [
  {
    id: 'simple',
    name: 'Simple',
    icon: '🌱',
    description: 'Easy explanations, like talking to a friend',
    color: '#1D9E75',
  },
  {
    id: 'balanced',
    name: 'Balanced',
    icon: '⚖️',
    description: 'Perfect mix of detail and clarity',
    color: '#534AB7',
  },
  {
    id: 'expert',
    name: 'Expert',
    icon: '🎓',
    description: 'Deep, technical explanations for advanced users',
    color: '#3C3489',
  },
  {
    id: 'study',
    name: 'Study',
    icon: '📚',
    description: 'Exam-focused with key points and summaries',
    color: '#BA7517',
  },
  {
    id: 'business',
    name: 'Business',
    icon: '💼',
    description: 'Professional, strategic, and actionable advice',
    color: '#534AB7',
  },
]

const languageOptions: LanguageOption[] = [
  { id: 'en', name: 'English', flag: '🇺🇸' },
  { id: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { id: 'hinglish', name: 'Hinglish', flag: '🇮🇳' },
]

export default function OnboardingModal({ isOpen, onClose }: OnboardingModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [userType, setUserType] = useState<UserType>('student')
  const [toneMode, setToneMode] = useState<ToneMode>('balanced')
  const [language, setLanguage] = useState<Language>('en')
  const [saving, setSaving] = useState(false)
  const [completed, setCompleted] = useState(false)

  const totalSteps = 3

  useEffect(() => {
    if (isOpen) {
      setStep(1)
      setCompleted(false)
    }
  }, [isOpen])

  const handleSubmit = async () => {
    if (!user?.id) return

    setSaving(true)
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

      setCompleted(true)
      
      // Auto-redirect after showing completion
      setTimeout(() => {
        onClose()
        router.push('/chat')
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error('Failed to save preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* Progress Bar */}
        {!completed && (
          <div className="h-1 bg-gray-200">
            <div
              className="h-full transition-all duration-500 ease-out"
              style={{
                width: `${(step / totalSteps) * 100}%`,
                backgroundColor: '#534AB7',
              }}
            />
          </div>
        )}

        {/* Content */}
        <div className="p-8 max-h-[80vh] overflow-y-auto">
          {completed ? (
            /* Completion State */
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-6 animate-bounce">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">
                You're all set! 🎉
              </h2>
              <p className="text-gray-600 text-lg">
                Redirecting you to your personalized dashboard...
              </p>
            </div>
          ) : step === 1 ? (
            /* Step 1: User Type */
            <div>
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#EEEDFE] mb-4">
                  <Sparkles className="w-8 h-8" style={{ color: '#534AB7' }} />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Welcome to Learnova! 👋
                </h2>
                <p className="text-gray-600">
                  Let's personalize your experience. What best describes you?
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <button
                  onClick={() => setUserType('student')}
                  className={`p-6 border-2 rounded-2xl text-left transition-all hover:shadow-md ${
                    userType === 'student'
                      ? 'border-[#534AB7] bg-[#EEEDFE]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-3">📚</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Student</h3>
                  <p className="text-gray-600">I want to learn better and faster</p>
                </button>

                <button
                  onClick={() => setUserType('business')}
                  className={`p-6 border-2 rounded-2xl text-left transition-all hover:shadow-md ${
                    userType === 'business'
                      ? 'border-[#534AB7] bg-[#EEEDFE]'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-4xl mb-3">🚀</div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Business Builder</h3>
                  <p className="text-gray-600">I want to turn ideas into real businesses</p>
                </button>
              </div>
            </div>
          ) : step === 2 ? (
            /* Step 2: Tone Mode */
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  How should I explain things? 🎨
                </h2>
                <p className="text-gray-600">
                  Choose your preferred communication style
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                {toneOptions.map((tone) => (
                  <button
                    key={tone.id}
                    onClick={() => setToneMode(tone.id)}
                    className={`p-4 border-2 rounded-xl text-left transition-all hover:scale-105 ${
                      toneMode === tone.id ? 'shadow-lg' : 'hover:shadow-md'
                    }`}
                    style={{
                      borderColor: toneMode === tone.id ? tone.color : 'rgba(83,74,183,0.12)',
                      backgroundColor: toneMode === tone.id ? `${tone.color}10` : 'white',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{tone.icon}</span>
                      <div className="flex-1">
                        <h3
                          className="font-semibold mb-1"
                          style={{ color: tone.color }}
                        >
                          {tone.name}
                        </h3>
                        <p className="text-sm text-gray-600">{tone.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Step 3: Language */
            <div>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  What's your preferred language? 🌍
                </h2>
                <p className="text-gray-600">
                  I'll respond in your chosen language
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {languageOptions.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setLanguage(lang.id)}
                    className={`w-full p-4 border-2 rounded-xl text-left transition-all flex items-center gap-4 hover:shadow-md ${
                      language === lang.id
                        ? 'border-[#534AB7] bg-[#EEEDFE]'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-3xl">{lang.flag}</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {lang.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {!completed && (
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              {step > 1 && (
                <button
                  onClick={handleBack}
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              )}
              <button
                onClick={handleNext}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 text-white rounded-xl hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg hover:shadow-xl"
                style={{ backgroundColor: '#534AB7' }}
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Saving...
                  </>
                ) : step === totalSteps ? (
                  <>
                    Get Started
                    <ChevronRight className="w-4 h-4" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}
