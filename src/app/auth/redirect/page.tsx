'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Smart Auth Redirect Page
 *
 * Runs immediately after sign-in and decides where to send the user:
 * - New user (has_seen_pricing = false) → /welcome-pricing
 * - Returning user → /dashboard
 */
export default function AuthRedirect() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const supabase = createClient()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (redirecting) return

    const handleRedirect = async () => {
      if (loading) return

      if (!user) {
        console.warn('⚠️ No user session found, redirecting to auth...')
        setRedirecting(true)
        router.replace('/login')
        return
      }

      console.log('✅ User authenticated, checking pricing status...')

      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('has_seen_pricing')
          .eq('id', user.id)
          .single()

        setRedirecting(true)

        if (!profile || !profile.has_seen_pricing) {
          console.log('🆕 New user — redirecting to /welcome-pricing')
          router.replace('/welcome-pricing')
        } else {
          console.log('✅ Returning user — redirecting to /dashboard')
          router.replace('/dashboard')
        }
      } catch (err) {
        console.error('❌ Error checking user status:', err)
        setRedirecting(true)
        router.replace('/dashboard')
      }
    }

    handleRedirect()
  }, [user, loading, router, supabase, redirecting])

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{
        background: '#080412',
        backgroundImage: 'radial-gradient(ellipse 700px 300px at 50% 0%, #7C3AED0D, transparent)',
      }}
    >
      <div className="text-center">
        <div
          className="inline-block animate-spin rounded-full h-12 w-12 border-4 mb-4"
          style={{ borderColor: '#7C3AED', borderTopColor: 'transparent' }}
        />
        <p className="text-lg font-medium" style={{ color: '#C4B5FD' }}>
          Setting up your account...
        </p>
        <p className="text-sm mt-2" style={{ color: '#9CA3AF' }}>
          Please wait while we prepare your experience
        </p>
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: '#7C3AED',
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}

