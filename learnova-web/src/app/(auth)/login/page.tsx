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
  const [showOnboarding, setShowOnboarding] = useState(false)
  const supabase = useMemo(() => createClient(), [])

  // Check if user needs onboarding after login
  useEffect(() => {
    if (authLoading) return // wait for auth to initialize
    if (!user) return       // no user, stay on login page

    // User is already logged in — always send them to /chat
    router.replace('/chat')
  }, [user, authLoading]) // IMPORTANT: minimal deps — do NOT add router or supabase here

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)

    try {
      // SECURITY: Application-level brute-force check before Supabase password auth.
      // OWASP Reference: A07:2021 Identification and Authentication Failures
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
        email: email.trim(),
        password,
      })

      if (signInError) {
        const invalidCreds =
          signInError.message.includes('Invalid login credentials') ||
          signInError.message.includes('invalid_credentials')
        // SECURITY: Record failed attempt for IP-based lockout tracking (server-side).
        // OWASP Reference: A07:2021 Identification and Authentication Failures
        if (invalidCreds) {
          void fetch('/api/auth/failed-login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email.trim() }),
          })
          setError('Invalid credentials, please try again.')
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Please verify your email address before logging in.')
        } else {
          setError(signInError.message || 'Sign in failed. Please try again.')
        }
        console.error('Login error:', signInError)
        setLoading(false)
        return
      }

      if (data?.user) {
        // Redirect directly to chat — no onboarding
        router.replace('/chat')
      } else {
        setError('Sign in failed. Please try again.')
        setLoading(false)
      }
    } catch (err: any) {
      setError('Something went wrong. Please try again.')
      console.error('Unexpected error:', err)
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      // Get the correct redirect URL based on environment
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${siteUrl}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        setError('Google sign-in failed. Please try again.')
        console.error('Google sign-in error:', error)
      }
    } catch (err) {
      setError('Google sign-in failed. Please try again.')
      console.error('Google sign-in error:', err)
    }
  }

  return (
    <div className="auth-page min-h-screen flex">
      {/* Left Panel - Brand */}
      <div
        className="hidden lg:flex lg:w-2/5 flex-col justify-center items-center p-12 relative"
        style={{ backgroundColor: '#534AB7' }}
      >
        <div className="max-w-sm text-center">
          {/* Logo */}
          <h1 className="text-[26px] font-semibold text-white mb-3">
            Thinkior
          </h1>
          
          {/* Tagline */}
          <p className="text-base text-white mb-8" style={{ opacity: 0.85 }}>
            The AI that studies with you and builds with you
          </p>

          {/* Feature List */}
          <div className="space-y-4 text-left mb-8">
            {[
              'Exam simulator with instant feedback',
              'Business idea validator & AI writer',
              'Smart planner & session recaps',
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-white flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <p className="text-white text-sm">{feature}</p>
              </div>
            ))}
          </div>

          {/* Trust Note */}
          <p className="text-white/50 text-xs">
            Built for Indian students & young entrepreneurs
          </p>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-4 lg:p-8" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="w-full max-w-[380px]">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2" style={{ color: '#0F0F1A' }}>
              Welcome to Thinkior
            </h2>
            <p className="text-sm" style={{ color: '#5A5A72' }}>
              Sign in to start learning and building
            </p>
          </div>

          {error && (
            <div
              className="px-4 py-3 rounded-lg mb-4 text-sm"
              style={{ backgroundColor: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' }}
            >
              {error}
            </div>
          )}

          {/* Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-[10px] font-medium text-sm transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E0E0E0',
              color: '#0F0F1A',
            }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div style={{ borderTop: '1px solid rgba(83,74,183,0.12)', width: '100%' }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span
                className="px-4 text-xs"
                style={{ backgroundColor: '#FFFFFF', color: '#5A5A72' }}
              >
                or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: '#0F0F1A' }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  borderColor: 'rgba(83,74,183,0.2)',
                  backgroundColor: '#FAFAFA',
                  color: '#0F0F1A',
                }}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: '#0F0F1A' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-3 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 focus:border-transparent"
                style={{
                  borderColor: 'rgba(83,74,183,0.2)',
                  backgroundColor: '#FAFAFA',
                  color: '#0F0F1A',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-lg font-medium text-sm text-white transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#534AB7' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
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
                  Signing in...
                </span>
              ) : (
                'Continue with email'
              )}
            </button>
          </form>

          {/* Terms */}
          <p className="mt-6 text-center text-[11px]" style={{ color: '#8888A0' }}>
            By continuing you agree to our{' '}
            <a href="/terms" className="hover:underline">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="hover:underline">
              Privacy Policy
            </a>
          </p>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm" style={{ color: '#5A5A72' }}>
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium hover:underline" style={{ color: '#534AB7' }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
      />
    </div>
  )
}
