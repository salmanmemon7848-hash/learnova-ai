'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import OnboardingModal from '@/components/ui/OnboardingModal'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const roleFromUrl = params.get('role')
    if (roleFromUrl && ['student', 'founder', 'general'].includes(roleFromUrl)) {
      localStorage.setItem('learnova_pending_role', roleFromUrl)
    }
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) return
    router.replace('/auth/redirect')
  }, [user, authLoading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    try {
      const checkRes = await fetch('/api/auth/login-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const checkJson = await checkRes.json().catch(() => ({}))
      if (checkRes.status === 429 || checkJson?.allowed === false) {
        setError(checkJson?.message || 'Too many login attempts. Please wait before trying again.')
        setLoading(false)
        return
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(), password,
      })

      if (signInError) {
        const invalidCreds = signInError.message.includes('Invalid login credentials') || signInError.message.includes('invalid_credentials')
        if (invalidCreds) {
          void fetch('/api/auth/failed-login', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() }),
          })
          setError('Invalid credentials, please try again.')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please verify your email address before logging in.')
        } else {
          setError(signInError.message || 'Sign in failed. Please try again.')
        }
        setLoading(false)
        return
      }

      if (data?.user) {
        router.replace('/chat')
      } else {
        setError('Sign in failed. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=/auth/redirect`,
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      })
      if (error) setError('Google sign-in failed. Please try again.')
    } catch {
      setError('Google sign-in failed. Please try again.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: '#060210',
      fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
    }}>
      {/* Ambient glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 65%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '0%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 65%)', filter: 'blur(40px)' }} />
      </div>

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex" style={{
        width: '42%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '48px 40px', position: 'relative', zIndex: 1,
        background: 'linear-gradient(160deg, rgba(124,58,237,0.12) 0%, rgba(13,148,136,0.08) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 340 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 11,
              background: 'linear-gradient(135deg, #7C3AED, #0D9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, fontWeight: 800, color: '#fff',
            }}>L</div>
            <span style={{ fontSize: 20, fontWeight: 700, background: 'linear-gradient(135deg, #A78BFA, #2DD4BF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Learnova AI
            </span>
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F5F3FF', marginBottom: 10, lineHeight: 1.2 }}>
            The AI that studies &amp; builds with you
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 32 }}>
            Built for India's students and entrepreneurs — Hindi, English, or Hinglish.
          </p>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '📝', text: 'Exam simulator with instant AI feedback' },
              { icon: '✅', text: 'Business idea validator & market insights' },
              { icon: '🤔', text: 'Doubt solver & session recaps' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                }}>{f.icon}</span>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0, paddingTop: 6 }}>{f.text}</p>
              </div>
            ))}
          </div>

          {/* Trust badge */}
          <div style={{
            marginTop: 36, display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(13,148,136,0.1)', border: '1px solid rgba(13,148,136,0.25)',
            borderRadius: 999, padding: '6px 14px', fontSize: 12, color: '#2DD4BF', fontWeight: 500,
          }}>
            🇮🇳 Built for Indian students & founders
          </div>
        </div>
      </div>

      {/* ── Right Panel — Form ── */}
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px 20px', position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>

          {/* Mobile logo */}
          <div className="lg:hidden" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, justifyContent: 'center' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #7C3AED, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 800, color: '#fff' }}>L</div>
            <span style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg, #A78BFA, #2DD4BF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Learnova AI</span>
          </div>

          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F5F3FF', marginBottom: 6 }}>Welcome back</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Sign in to continue your journey</p>

          {error && (
            <div style={{
              padding: '12px 16px', borderRadius: 10, marginBottom: 18, fontSize: 13,
              background: 'rgba(239,68,68,0.1)', color: '#F87171', border: '1px solid rgba(239,68,68,0.25)',
            }}>
              {error}
            </div>
          )}

          {/* Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 12, fontSize: 14, fontWeight: 500, cursor: 'pointer',
              background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)', color: '#F5F3FF',
              transition: 'all 0.2s', marginBottom: 20,
              opacity: loading ? 0.6 : 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <svg style={{ width: 18, height: 18, flexShrink: 0 }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)' }} />
            </div>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
              <span style={{ padding: '0 14px', background: '#060210', fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>
                or sign in with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 7 }}>
                Email address
              </label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)} required
                placeholder="you@example.com"
                style={{
                  width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                  background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.1)', color: '#F5F3FF',
                  outline: 'none', transition: 'all 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 7 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                  placeholder="Enter your password"
                  style={{
                    width: '100%', padding: '11px 44px 11px 14px', borderRadius: 10, fontSize: 14,
                    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#F5F3FF',
                    outline: 'none', transition: 'all 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '12px', borderRadius: 12, fontSize: 14, fontWeight: 600,
                color: '#fff', cursor: loading ? 'not-allowed' : 'pointer',
                background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', border: 'none',
                boxShadow: '0 4px 20px rgba(124,58,237,0.4)', transition: 'all 0.2s',
                opacity: loading ? 0.7 : 1, marginTop: 4,
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <svg style={{ width: 16, height: 16, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24">
                    <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
            By continuing you agree to our{' '}
            <a href="/terms" style={{ color: '#A78BFA', textDecoration: 'none' }}>Terms</a>{' '}
            and{' '}
            <a href="/privacy" style={{ color: '#A78BFA', textDecoration: 'none' }}>Privacy Policy</a>
          </p>

          <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Don't have an account?{' '}
            <Link href="/signup" style={{ color: '#A78BFA', fontWeight: 600, textDecoration: 'none' }}>Sign up free</Link>
          </p>
        </div>
      </div>

      <OnboardingModal isOpen={showOnboarding} onClose={() => setShowOnboarding(false)} />

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
