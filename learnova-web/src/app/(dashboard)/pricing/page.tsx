'use client'

import { Check, Lock, Star } from 'lucide-react'
import { useRole } from '@/contexts/RoleContext'
import { useSubscription } from '@/hooks/useSubscription'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
type Audience = 'student' | 'founder'

type Feature = {
  name: string
  limit?: string
  included?: boolean
  locked?: boolean
}

type Plan = {
  name: string
  price: string
  tagline: string
  cta: string
  featured?: boolean
  features: Feature[]
}

const studentPlans: Plan[] = [
  {
    name: 'Free',
    price: '₹0',
    tagline: 'Start learning with Thinkior AI - no card needed.',
    cta: 'Get started free',
    features: [
      { name: 'AI chat', limit: '10/day' },
      { name: 'Doubt solver', limit: '3/day' },
      { name: 'Practice test', limit: '1/day' },
      { name: 'Full usage dashboard', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Edu finder', locked: true },
      { name: 'Mock interview', locked: true },
      { name: 'Career guide', locked: true },
    ],
  },
  {
    name: 'Pro',
    price: '₹299',
    tagline: 'More power for students who study seriously every day.',
    cta: 'Upgrade to Pro',
    features: [
      { name: 'AI chat', limit: '20/day' },
      { name: 'Doubt solver', limit: '5/day' },
      { name: 'Practice test', limit: '10/day' },
      { name: 'Edu finder', limit: '5/day' },
      { name: 'Full usage dashboard', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Mock interview', locked: true },
      { name: 'Career guide', locked: true },
    ],
  },
  {
    name: 'Max',
    price: '₹599',
    tagline: 'Full Thinkior AI - interviews, career guide & beyond.',
    cta: 'Upgrade to Max',
    featured: true,
    features: [
      { name: 'AI chat', limit: '20/day' },
      { name: 'Doubt solver', limit: '10/day' },
      { name: 'Practice test', limit: '20/day' },
      { name: 'Edu finder', limit: '10/day' },
      { name: 'Mock interview with voice', limit: '5/day' },
      { name: 'Career guide', limit: '5/day' },
      { name: 'Full usage dashboard', included: true },
      { name: 'Priority email support', included: true },
    ],
  },
]

const founderPlans: Plan[] = [
  {
    name: 'Starter',
    price: '₹0',
    tagline: 'Explore Thinkior AI before you commit a rupee.',
    cta: 'Get started free',
    features: [
      { name: 'AI chat', limit: '10/day' },
      { name: 'Business ideas', limit: 'one-time' },
      { name: 'Full usage dashboard', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Business validator', locked: true },
      { name: 'Competitor research', locked: true },
      { name: 'Mock interview', locked: true },
    ],
  },
  {
    name: 'Builder',
    price: '₹299',
    tagline: 'Validate ideas & research your market every day.',
    cta: 'Upgrade to Builder',
    features: [
      { name: 'AI chat', limit: '20/day' },
      { name: 'Business ideas', limit: '10/day' },
      { name: 'Business validator', limit: '10/day' },
      { name: 'Full usage dashboard', included: true },
      { name: 'Priority email support', included: true },
      { name: 'Competitor research', locked: true },
      { name: 'Mock interview', locked: true },
    ],
  },
  {
    name: 'Founder Pro',
    price: '₹599',
    tagline: 'Full stack for founders who move fast & pitch hard.',
    cta: 'Upgrade to Founder Pro',
    featured: true,
    features: [
      { name: 'AI chat', limit: '20/day' },
      { name: 'Business ideas', limit: '10/day' },
      { name: 'Business validator', limit: '10/day' },
      { name: 'Competitor research', limit: '5/day' },
      { name: 'Mock interview with voice', limit: '5/day' },
      { name: 'Full usage dashboard', included: true },
      { name: 'Priority email support', included: true },
    ],
  },
]

const pricingCopy = {
  student: {
    title: 'Thinkior AI — Student Plans',
    subtitle: 'Built for students. Fair daily limits. No surprises.',
  },
  founder: {
    title: 'Thinkior AI — Founder Plans',
    subtitle: 'Built for founders. Validate faster. Build smarter.',
  },
}

function LimitBadge({ children, muted = false }: { children: string; muted?: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold whitespace-nowrap"
      style={{
        background: muted ? '#1e2130' : '#1E1B4B',
        border: muted ? '1px solid #374151' : '1px solid #4338CA',
        color: muted ? '#9CA3AF' : '#A78BFA',
      }}
    >
      {children}
    </span>
  )
}

function FeatureRow({ feature }: { feature: Feature }) {
  if (feature.locked) {
    return (
      <li className="flex items-center justify-between gap-3 py-2.5">
        <div className="flex min-w-0 items-center gap-2.5" style={{ color: '#9CA3AF' }}>
          <Lock size={16} className="shrink-0" color="#6B7280" />
          <span className="text-sm" style={{ color: '#9CA3AF' }}>{feature.name}</span>
        </div>
        <LimitBadge muted>Locked</LimitBadge>
      </li>
    )
  }

  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2.5">
        <Check size={16} className="shrink-0" color="#4ADE80" />
        <span className="text-sm" style={{ color: '#E2E8F0' }}>{feature.name}</span>
      </div>
      <LimitBadge>{feature.limit || 'Included'}</LimitBadge>
    </li>
  )
}

function PlanCard({ plan, currentPlan, onUpgrade, isProcessing }: { plan: Plan; currentPlan: string; onUpgrade: (planName: string) => void; isProcessing: boolean }) {
  const normalizedCardPlan = plan.name.toLowerCase().replace(' ', '_')
  const isCurrentPlan = currentPlan === normalizedCardPlan || (currentPlan === 'free' && plan.price === '₹0')
  const isFreePlan = plan.price === '₹0'
  return (
    <article
      className="relative flex h-full flex-col rounded-2xl p-5 transition-all"
      style={{
        background: plan.featured
          ? 'linear-gradient(135deg, rgba(22, 13, 46, 0.96), rgba(30, 16, 64, 0.98))'
          : '#13151e',
        border: plan.featured ? '2px solid #7C3AED' : '1px solid #2a2d3a',
        boxShadow: plan.featured ? '0 0 36px rgba(124, 58, 237, 0.28)' : '0 0 24px rgba(0, 0, 0, 0.18)',
      }}
    >
      {plan.featured && (
        <div
          className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
            color: '#FFFFFF',
            boxShadow: '0 4px 16px #7C3AED35',
          }}
        >
          <Star size={13} fill="currentColor" />
          Best value
        </div>
      )}

      <div className="mb-5 pr-24">
        <h2 className="text-2xl font-bold" style={{ color: '#F5F3FF' }}>{plan.name}</h2>
        <p className="mt-2 min-h-[44px] text-sm leading-6" style={{ color: '#C4B5FD' }}>
          {plan.tagline}
        </p>
      </div>

      <div className="mb-5 flex items-end gap-1">
        <span className="text-4xl font-bold leading-none" style={{ color: '#F5F3FF' }}>
          {plan.price}
        </span>
        <span className="pb-1 text-sm" style={{ color: '#9CA3AF' }}>/mo</span>
      </div>

      <ul className="mb-6 flex-1 divide-y" style={{ borderColor: '#2a2d3a' }}>
        {plan.features.map((feature) => (
          <FeatureRow key={feature.name} feature={feature} />
        ))}
      </ul>

      <button
        onClick={() => !isCurrentPlan && !isFreePlan && onUpgrade(plan.name)}
        disabled={isCurrentPlan || isProcessing}
        className="mt-auto w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: isCurrentPlan ? '#374151' : plan.featured ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : '#1E1040',
          border: isCurrentPlan ? '1px solid #4B5563' : plan.featured ? '1px solid #7C3AED' : '1px solid #2D1B69',
          color: isCurrentPlan ? '#9CA3AF' : '#FFFFFF',
          boxShadow: plan.featured && !isCurrentPlan ? '0 4px 20px #7C3AED40' : 'none',
        }}
      >
        {isCurrentPlan ? 'Current Plan' : isProcessing ? 'Processing...' : plan.cta}
      </button>
    </article>
  )
}

export default function PricingPage() {
  const { role, roleLoading } = useRole()
  const { plan: currentPlan, isLoading: planLoading } = useSubscription()
  const router = useRouter()
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const audience: Audience = role === 'founder' ? 'founder' : 'student'
  const plans = audience === 'student' ? studentPlans : founderPlans
  const copy = pricingCopy[audience]

  const handleUpgrade = async (planType: string) => {
    if (planType === 'Free' || planType === 'Starter') return
    
    alert('Payment integration is currently disabled.')
  }

  if (roleLoading || planLoading) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6">
        <div
          className="h-40 rounded-2xl"
          style={{
            background: '#13151e',
            border: '1px solid #2a2d3a',
            boxShadow: '0 0 24px rgba(0, 0, 0, 0.18)',
          }}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 md:px-6 md:py-6">
      <header className="mb-7">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[1.5px]" style={{ color: '#A78BFA' }}>
              Thinkior AI Pricing
            </p>
            <h1 className="text-3xl font-bold md:text-4xl" style={{ color: '#F5F3FF' }}>
              {copy.title}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 md:text-base" style={{ color: '#C4B5FD' }}>
              {copy.subtitle}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard 
            key={plan.name} 
            plan={plan} 
            currentPlan={currentPlan}
            onUpgrade={handleUpgrade}
            isProcessing={processingPlan === plan.name}
          />
        ))}
      </section>

      <p className="mt-5 text-center text-xs" style={{ color: '#9CA3AF' }}>
        All limits are strictly per day and reset at midnight IST.
      </p>
    </div>
  )
}
