'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, Lock, Star } from 'lucide-react'
import RazorpayCheckout from '@/components/RazorpayCheckout'

// ─── Types (mirrored from pricing page) ──────────────────────────────────────
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

// ─── Plan data (identical to /pricing page) ──────────────────────────────────
const studentPlans: Plan[] = [
  {
    name: 'Free',
    price: '₹0',
    tagline: 'Start learning with Learnova AI - no card needed.',
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
    tagline: 'Full Learnova AI - interviews, career guide & beyond.',
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
    tagline: 'Explore Learnova AI before you commit a rupee.',
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

// ─── Sub-components (same design as /pricing page) ───────────────────────────
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

function WelcomePlanCard({
  plan,
  onSelect,
  loading,
}: {
  plan: Plan
  onSelect: () => void
  loading: boolean
}) {
  const isFreePlan = plan.price === '₹0'

  return (
    <article
      className="relative flex h-full flex-col rounded-2xl p-5 transition-all"
      style={{
        background: plan.featured
          ? 'linear-gradient(135deg, rgba(22, 13, 46, 0.96), rgba(30, 16, 64, 0.98))'
          : '#13151e',
        border: plan.featured ? '2px solid #7C3AED' : '1px solid #2a2d3a',
        boxShadow: plan.featured
          ? '0 0 36px rgba(124, 58, 237, 0.28)'
          : '0 0 24px rgba(0, 0, 0, 0.18)',
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
        onClick={onSelect}
        disabled={loading}
        className="mt-auto w-full rounded-xl px-4 py-3 text-sm font-semibold transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: plan.featured
            ? 'linear-gradient(135deg, #7C3AED, #4F46E5)'
            : isFreePlan
            ? '#1E1040'
            : '#1E1040',
          border: plan.featured ? '1px solid #7C3AED' : '1px solid #2D1B69',
          color: '#FFFFFF',
          boxShadow: plan.featured ? '0 4px 20px #7C3AED40' : 'none',
        }}
      >
        {loading ? 'Processing...' : plan.cta}
      </button>
    </article>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function WelcomePricingPage() {
  const [role, setRole] = useState<'student' | 'founder' | null>(null)
  const [loading, setLoading] = useState(false)
  const [resolving, setResolving] = useState(true)
  const [selectedCheckoutPlan, setSelectedCheckoutPlan] = useState<{ plan: string; planLabel: string } | null>(null)
  const router = useRouter()
  const supabase = createClient()

  // ── Step 1: Detect role from localStorage (set by landing page click) ──
  useEffect(() => {
    const detectRole = async () => {
      // First priority: localStorage set by landing page button click
      const pendingRole = typeof window !== 'undefined'
        ? localStorage.getItem('learnova_pending_role')
        : null

      if (pendingRole === 'student' || pendingRole === 'founder') {
        setRole(pendingRole)
        setResolving(false)
        return
      }

      // Second priority: check Supabase profile (in case they refreshed)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (profile?.role === 'student' || profile?.role === 'founder') {
          setRole(profile.role)
          setResolving(false)
          return
        }
      }

      // Fallback: default to student if nothing found
      setRole('student')
      setResolving(false)
    }

    detectRole()
  }, [])

  // ── Step 2: Handle plan selection ──
  const handlePlanSelect = async (plan: Plan) => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const isFree = plan.price === '₹0'
    const selectedRole = role ?? 'student'

    if (!isFree) {
      // Set state to trigger the Razorpay Checkout component overlay safely
      setSelectedCheckoutPlan({
        plan: plan.name.toLowerCase().replace(' ', '_'),
        planLabel: plan.name,
      })
      setLoading(false)
      return
    }

    // Free plan — update profiles and initialize user_plans
    await supabase.from('profiles').update({
      role: selectedRole,
    }).eq('id', user.id)

    await supabase.from('user_plans').upsert({
      user_id: user.id,
      role: selectedRole,
      plan: 'free',
      is_active: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

    // Clear pending role from localStorage
    localStorage.removeItem('learnova_pending_role')

    // Redirect to welcome
    router.push(`/welcome?role=${selectedRole}`)
  }

  const handleSkip = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const selectedRole = role ?? 'student'

    await supabase.from('profiles').update({
      role: selectedRole,
    }).eq('id', user.id)

    await supabase.from('user_plans').upsert({
      user_id: user.id,
      role: selectedRole,
      plan: 'free',
      is_active: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

    localStorage.removeItem('learnova_pending_role')
    router.push(`/welcome?role=${selectedRole}`)
  }

  // Show loading spinner while detecting role
  if (resolving) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080412' }}>
        <div className="text-purple-400 text-sm">Loading your plan options...</div>
      </div>
    )
  }

  // ── Step 3: Render — NO role toggle shown, just the correct plans ──
  const plans = role === 'founder' ? founderPlans : studentPlans
  const heading = role === 'founder'
    ? 'Learnova AI — Founder Plans'
    : 'Learnova AI — Student Plans'
  const subheading = role === 'founder'
    ? 'Built for founders. Validate faster. Build smarter.'
    : 'Built for students. Study smarter. Score higher.'

  return (
    <div className="min-h-screen py-12 px-4" style={{ background: '#080412' }}>
      <div className="text-center mb-10">
        {/* Role badge — shows which mode they're in, NOT a toggle */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-4"
          style={{ background: '#1E1B4B', color: '#A78BFA', border: '1px solid #4338CA' }}>
          {role === 'founder' ? '🚀 Founder Mode' : '🎓 Student Mode'}
        </div>
        <h1 className="text-3xl font-bold text-white">{heading}</h1>
        <p className="text-purple-300 mt-2 text-sm">{subheading}</p>
      </div>

      {/* Plan cards */}
      <section className="grid gap-4 lg:grid-cols-3 w-full max-w-5xl mx-auto">
        {plans.map((plan: Plan) => (
          <WelcomePlanCard
            key={plan.name}
            plan={plan}
            onSelect={() => handlePlanSelect(plan)}
            loading={loading}
          />
        ))}
      </section>

      {/* Skip link */}
      <div className="text-center mt-8">
        <button
          onClick={handleSkip}
          disabled={loading}
          className="text-sm text-purple-400 hover:text-white underline underline-offset-4 transition-colors"
        >
          Skip for now — start with Free plan
        </button>
      </div>

      {/* Razorpay Checkout Simulation Overlay */}
      {selectedCheckoutPlan && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(15,15,26,0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{
            background: '#13151e', borderRadius: 24,
            padding: '36px', maxWidth: 440, width: '90%',
            border: '1px solid rgba(124,58,237,0.3)',
            boxShadow: '0 20px 50px rgba(124,58,237,0.15)',
            color: '#F5F3FF',
            fontFamily: 'system-ui, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f5f3ff', margin: 0 }}>
                  Complete Upgrading
                </h3>
                <p style={{ fontSize: '0.875rem', color: '#c4b5fd', marginTop: 4, marginBottom: 0 }}>
                  to {selectedCheckoutPlan.planLabel} Plan
                </p>
              </div>
              <button 
                onClick={() => setSelectedCheckoutPlan(null)}
                style={{ 
                  background: 'rgba(255,255,255,0.05)', 
                  border: 'none', 
                  color: '#9ca3af', 
                  width: 32, height: 32,
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <RazorpayCheckout
                plan={selectedCheckoutPlan.plan}
                role={role || 'student'}
                planLabel={selectedCheckoutPlan.planLabel}
                onSuccess={async () => {
                  const selectedRole = role || 'student'
                  
                  // Set role on profiles table
                  await supabase.from('profiles').update({
                    role: selectedRole
                  }).eq('id', (await supabase.auth.getUser()).data.user?.id)

                  setSelectedCheckoutPlan(null)
                  localStorage.removeItem('learnova_pending_role')
                  router.push(`/welcome?role=${selectedRole}`)
                }}
                onClose={() => {
                  setSelectedCheckoutPlan(null)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
