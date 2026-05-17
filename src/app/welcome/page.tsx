'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const planColors: Record<string, string> = {
  free: '#374151',
  starter: '#374151',
  pro: '#7C3AED',
  builder: '#7C3AED',
  max: '#D97706',
  founder_pro: '#D97706',
}

const planGlows: Record<string, string> = {
  free: 'none',
  starter: 'none',
  pro: '0 0 32px rgba(124, 58, 237, 0.35)',
  builder: '0 0 32px rgba(124, 58, 237, 0.35)',
  max: '0 0 32px rgba(217, 119, 6, 0.35)',
  founder_pro: '0 0 32px rgba(217, 119, 6, 0.35)',
}

export default function WelcomePage() {
  const [userName, setUserName] = useState('')
  const [plan, setPlan] = useState('free')
  const [role, setRole] = useState('student')
  const [countdown, setCountdown] = useState(5)
  const router = useRouter()
  const searchParams = useSearchParams()
  const roleParam = searchParams.get('role') as 'student' | 'founder' | null
  const supabase = createClient()

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/auth')

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, role')
        .eq('id', user.id)
        .single()

      const name =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split('@')[0] ||
        'there'
      setUserName(name)

      if (profile) {
        setPlan(profile.plan || 'free')
        setRole(profile.role || 'student')
      }
    }
    loadUser()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
          return 0
        }
        return c - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [router])

  const normalizedPlan = plan.toLowerCase().replace(' ', '_')
  const planLabel = plan
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

  const badgeColor = planColors[normalizedPlan] || planColors.free
  const badgeGlow = planGlows[normalizedPlan] || 'none'

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center text-center px-4"
      style={{
        background: '#080412',
        backgroundImage: 'radial-gradient(ellipse 800px 500px at 50% 30%, #2D1B6920, transparent)',
      }}
    >
      {/* Animated emoji */}
      <div
        className="text-6xl mb-6"
        style={{ animation: 'bounce 1s ease-in-out 3' }}
      >
        🎉
      </div>

      {/* Welcome heading */}
      <h1 className="text-4xl font-bold mb-3" style={{ color: '#F5F3FF' }}>
        Welcome, {userName}!
      </h1>

      {/* Plan badge */}
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-white text-sm font-semibold mb-6"
        style={{
          background: badgeColor,
          boxShadow: badgeGlow,
        }}
      >
        {role === 'founder' ? '🚀' : '🎓'} {planLabel} Plan
      </div>

      {/* Subtitle */}
      <p className="max-w-sm mb-10 text-base leading-7" style={{ color: '#C4B5FD' }}>
        You&apos;re all set. Thinkior AI is ready to help you{' '}
        {roleParam === 'founder' || role === 'founder'
          ? 'build, validate, and grow your ideas.'
          : 'study smarter and ace your exams.'}
      </p>

      {/* CTA button */}
      <button
        onClick={() => router.push('/dashboard')}
        className="font-semibold px-8 py-3 rounded-full transition-all text-base"
        style={{
          background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
          color: '#FFFFFF',
          boxShadow: '0 4px 24px rgba(124, 58, 237, 0.45)',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
      >
        Start using Thinkior →
      </button>

      {/* Countdown */}
      <p className="mt-4 text-xs" style={{ color: '#6B7280' }}>
        Redirecting automatically in {countdown}s
      </p>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-16px); }
        }
      `}</style>
    </div>
  )
}
