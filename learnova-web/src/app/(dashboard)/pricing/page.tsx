'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Check, X, Star } from 'lucide-react'

export default function PricingPage() {
  const { user } = useAuth()
  const [isYearly, setIsYearly] = useState(false)
  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'

  const plans = [
    {
      name: 'Free',
      emoji: '🆓',
      price: '₹0',
      period: '/month',
      description: 'Try karo, trust karo',
      tagline: 'Perfect for getting started',
      highlighted: false,
      current: true,
      features: [
        { text: '20 messages/day', included: true },
        { text: '3 doubts/day (photo)', included: true },
        { text: '3 tests/month', included: true },
        { text: '3 career checks/month', included: true },
        { text: 'Basic doubt explanations', included: true },
        { text: '1 flashcard set (20 cards)', included: true },
        { text: 'Basic career quiz', included: true },
        { text: '1 validation/month', included: true },
        { text: 'Full streak & gamification', included: true },
        { text: 'Top 3 weaknesses only', included: true },
        { text: '2 tone modes (Simple + Class)', included: true },
        { text: 'English + Hinglish', included: true },
        { text: 'Non-intrusive ads', included: true },
        { text: 'Parent Dashboard', included: false },
      ],
      cta: 'Current Plan',
    },
    {
      name: 'Student',
      emoji: '🎓',
      price: isYearly ? '₹699' : '₹79',
      period: isYearly ? '/year' : '/month',
      savings: isYearly ? 'Save 26%' : null,
      description: 'Topper banne ka sabse sasta raasta',
      tagline: 'Best for: Class 9-12 students, board exam prep',
      highlighted: true,
      current: false,
      features: [
        { text: '60 messages/day', included: true },
        { text: '15 doubts/day (photo)', included: true },
        { text: '20 tests/month + PYQ access', included: true },
        { text: '15 career checks/month', included: true },
        { text: 'Full doubt-solving access', included: true },
        { text: 'Unlimited flashcard sets', included: true },
        { text: 'Full career guide access', included: true },
        { text: '3 validations/month', included: true },
        { text: 'Parent Dashboard', included: true },
        { text: 'Full streak + exclusive badges', included: true },
        { text: 'Daily AI briefing', included: true },
        { text: 'All 5 tone modes', included: true },
        { text: 'English + Hindi + Hinglish', included: true },
        { text: 'No ads', included: true },
        { text: 'Full analytics + recommendations', included: true },
      ],
      cta: 'Upgrade to Student',
    },
    {
      name: 'Competitive',
      emoji: '🚀',
      price: isYearly ? '₹1,299' : '₹149',
      period: isYearly ? '/year' : '/month',
      savings: isYearly ? 'Save 27%' : null,
      description: 'JEE/NEET/UPSC ke liye designed',
      tagline: 'Best for: JEE/NEET/UPSC aspirants',
      highlighted: false,
      current: false,
      popular: true,
      features: [
        { text: 'Everything in Student, PLUS:', included: true, bold: true },
        { text: '120 messages/day', included: true },
        { text: 'Unlimited doubts (photo)', included: true },
        { text: 'Unlimited tests + 10yr PYQ bank', included: true },
        { text: 'Unlimited career checks', included: true },
        { text: 'JEE/NEET/UPSC test patterns', included: true },
        { text: 'Detailed analytics (percentile, time)', included: true },
        { text: 'AI-generated mock test PDFs', included: true },
        { text: 'Advanced exam analytics', included: true },
        { text: 'AI-generated chapter summaries', included: true },
        { text: 'Study Buddy System', included: true },
        { text: '5 validations/month', included: true },
        { text: 'Priority support (24hr)', included: true },
      ],
      cta: 'Upgrade to Competitive',
    },
    {
      name: 'Pro Builder',
      emoji: '💼',
      price: isYearly ? '₹1,799' : '₹199',
      period: isYearly ? '/year' : '/month',
      savings: isYearly ? 'Save 25%' : null,
      description: 'Students + Entrepreneurs',
      tagline: 'Best for: College students with startup dreams',
      highlighted: false,
      current: false,
      features: [
        { text: 'Everything in Competitive, PLUS:', included: true, bold: true },
        { text: '200 messages/day', included: true },
        { text: 'Unlimited validations', included: true },
        { text: 'Unlimited founder research', included: true },
        { text: 'Business Plan Generator', included: true },
        { text: 'GST & Startup India guidance', included: true },
        { text: 'LinkedIn/Instagram content calendar', included: true },
        { text: 'Pitch Deck outline generator', included: true },
        { text: 'Business Expert mode', included: true },
        { text: 'Export everything as PDF', included: true },
        { text: 'Priority support (12hr)', included: true },
        { text: 'Early access to new features', included: true },
      ],
      cta: 'Upgrade to Pro Builder',
    },
  ]

  const specialOffers = [
    {
      emoji: '📦',
      name: 'Family Pack',
      description: '₹249/month for 2 siblings (both get Student Plan — saves ₹79/month)',
    },
    {
      emoji: '🏫',
      name: 'School/Coaching Plan',
      description: '₹999/month for 20 students (₹50/student — best value)',
    },
    {
      emoji: '🎁',
      name: 'Referral Bonus',
      description: 'Refer 3 friends who subscribe → Get 1 month free',
    },
    {
      emoji: '📱',
      name: 'Free Trial',
      description: 'First 7 Days Free on any paid plan — no credit card required',
    },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <div className="text-center">
        {/* Animated Icon */}
        <div className="mb-8 relative">
          <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 animate-pulse">
            <span className="text-6xl">🚀</span>
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#1D9E75] rounded-full animate-bounce" />
          <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
        </div>

        {/* Coming Soon Text */}
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
          Coming Soon
        </h1>

        {/* Building Animation */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-[#13151e] border-2 border-[#2a2d3a]">
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
            </div>
            <span className="text-lg font-semibold" style={{ color: '#e2e8f0' }}>
              Salman Is Building This ....
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: '#9ca3af' }}>
          We're working hard to bring you amazing pricing plans that will blow your mind.
          Something incredible is coming your way! 🎉
        </p>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="h-2 bg-[#13151e] rounded-full overflow-hidden border border-[#2a2d3a]">
            <div 
              className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 rounded-full animate-pulse"
              style={{ width: '65%' }}
            />
          </div>
          <p className="text-sm mt-2" style={{ color: '#6b7280' }}>
            65% Complete
          </p>
        </div>

        {/* Notify Button */}
        <button
          className="px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 transition-all hover:shadow-xl hover:scale-105 transform"
          onClick={() => alert('We\'ll notify you when it\'s ready! 🚀')}
        >
          🔔 Notify Me When It's Ready
        </button>

        {/* Fun Message */}
        <p className="text-sm mt-8" style={{ color: '#6b7280' }}>
          💡 Pro tip: Great things take time. Stay tuned!
        </p>
      </div>
    </div>
  )
}
