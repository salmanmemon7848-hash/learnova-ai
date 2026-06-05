'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [validationErrors, setValidationErrors] = useState<{ [key: string]: string }>({})
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const roleFromUrl = params.get('role')
    if (roleFromUrl && ['student', 'founder', 'general'].includes(roleFromUrl)) {
      localStorage.setItem('learnova_pending_role', roleFromUrl)
    }
  }, [])

  const validateForm = () => {
    const errors: { [key: string]: string } = {}
    if (!name.trim()) errors.name = 'Name is required'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Please enter a valid email address'
    if (password.length < 6) errors.password = 'Password must be at least 6 characters'
    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setValidationErrors({})
    if (!validateForm()) return
    setLoading(true)
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email, password, options: { data: { name } },
      })
      if (signUpError) {
        if (signUpError.message.includes('User already registered')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else if (signUpError.message.includes('Password should be at least 6 characters')) {
          setError('Password must be at least 6 characters long.')
        } else {
          setError(signUpError.message)
        }
        return
      }
      if (data.user) {
        if (data.user.identities && data.user.identities.length === 0) {
          setError('An account with this email already exists. Please sign in instead.')
          setLoading(false)
        } else {
          router.replace('/auth/redirect')
        }
      } else {
        setError('Sign up failed. Please try again.')
        setLoading(false)
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: 'offline', prompt: 'consent' },
      },
    })
    if (error) setError('Google sign-up failed. Please try again.')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', background: '#060210',
      fontFamily: 'var(--font-body), Inter, system-ui, sans-serif',
    }}>
      {/* Ambient glows */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-15%', right: '-10%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 65%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '-5%', left: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.08) 0%, transparent 65%)', filter: 'blur(40px)' }} />
      </div>

      {/* ── Left Panel ── */}
      <div className="hidden lg:flex" style={{
        width: '42%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        padding: '48px 40px', position: 'relative', zIndex: 1,
        background: 'linear-gradient(160deg, rgba(13,148,136,0.1) 0%, rgba(124,58,237,0.1) 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ maxWidth: 340 }}>
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
            Start your journey today — free forever
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 32 }}>
            An AI platform for students and founders — built for India.
          </p>

          {/* What you get */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { icon: '🎓', text: 'JEE, NEET, CBSE exam prep with AI', teal: false },
              { icon: '✅', text: 'Startup idea validation in minutes', teal: true },
              { icon: '🎤', text: 'Mock interview practice with feedback', teal: false },
              { icon: '🔍', text: 'Competitor research & market insights', teal: true },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  background: f.teal ? 'rgba(13,148,136,0.12)' : 'rgba(124,58,237,0.1)',
                  border: f.teal ? '1px solid rgba(13,148,136,0.25)' : '1px solid rgba(124,58,237,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                }}>{f.icon}</span>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', margin: 0 }}>{f.text}</p>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 36, display: 'inline-flex', alignItems: 'center', gap: 6,
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
            borderRadius: 999, padding: '6px 14px', fontSize: 12, color: '#A78BFA', fontWeight: 500,
          }}>
            🇮🇳 Built for Indian students & young entrepreneurs
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

          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F5F3FF', marginBottom: 6 }}>Create your account</h1>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 28 }}>Free to start — no credit card required</p>

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
            onClick={handleGoogleSignUp}
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
                or sign up with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { id: 'name',     label: 'Full name',      type: 'text',     val: name,     set: setName,     placeholder: 'Rahul Sharma', key: 'name' },
              { id: 'email',    label: 'Email address',  type: 'email',    val: email,    set: setEmail,    placeholder: 'you@example.com', key: 'email' },
            ].map(f => (
              <div key={f.id}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 7 }}>
                  {f.label}
                </label>
                <input
                  id={f.id} type={f.type} value={f.val} onChange={e => f.set(e.target.value)} required
                  placeholder={f.placeholder}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: 10, fontSize: 14,
                    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)',
                    border: validationErrors[f.key] ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
                    color: '#F5F3FF', outline: 'none', transition: 'all 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = validationErrors[f.key] ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                {validationErrors[f.key] && <p style={{ marginTop: 5, fontSize: 11, color: '#F87171' }}>{validationErrors[f.key]}</p>}
              </div>
            ))}

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 7 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password" type={showPassword ? 'text' : 'password'} value={password}
                  onChange={e => setPassword(e.target.value)} required
                  placeholder="At least 6 characters"
                  style={{
                    width: '100%', padding: '11px 44px 11px 14px', borderRadius: 10, fontSize: 14,
                    background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)',
                    border: validationErrors.password ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
                    color: '#F5F3FF', outline: 'none', transition: 'all 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(124,58,237,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
                  onBlur={e => { e.target.style.borderColor = validationErrors.password ? 'rgba(239,68,68,0.4)' : 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: 13 }}
                >
                  {showPassword ? '👁️' : '🙈'}
                </button>
              </div>
              {validationErrors.password && <p style={{ marginTop: 5, fontSize: 11, color: '#F87171' }}>{validationErrors.password}</p>}
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
                  Creating account...
                </span>
              ) : 'Create Free Account'}
            </button>
          </form>

          <p style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.25)' }}>
            By continuing you agree to our{' '}
            <a href="/terms" style={{ color: '#A78BFA', textDecoration: 'none' }}>Terms</a>{' '}
            and{' '}
            <a href="/privacy" style={{ color: '#A78BFA', textDecoration: 'none' }}>Privacy Policy</a>
          </p>

          <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: '#A78BFA', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
