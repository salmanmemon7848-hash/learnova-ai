'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

/**
 * Smart Auth Redirect Page
 * 
 * This page runs immediately after sign-in and decides where to send the user.
 * It prevents the login loop by ensuring users never redirect back to /login after auth.
 */
export default function AuthRedirect() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const supabase = createClient()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    // Prevent multiple redirects
    if (redirecting) return

    const handleRedirect = async () => {
      // Wait for auth to finish loading
      if (loading) {
        return
      }

      // Not signed in - send back to login (shouldn't happen if coming from OAuth)
      if (!user) {
        console.warn('⚠️ No user session found, redirecting to login...')
        setRedirecting(true)
        router.replace('/login')
        return
      }

      // User is authenticated - check if they have a persona set
      console.log('✅ User authenticated, checking persona status...')

      try {
        // Check localStorage for persona (set during onboarding)
        const localStoragePersona = localStorage.getItem('thinkior_persona')

        if (localStoragePersona) {
          // User has persona in localStorage - go straight to chat
          console.log('🎯 Persona found in localStorage, redirecting to chat...')
          setRedirecting(true)
          router.replace('/chat')
          return
        }

        // Check database for user preferences
        const { data: userData, error } = await supabase
          .from('users')
          .select('userType, toneMode, language')
          .eq('id', user.id)
          .single()

        // If user has non-default values in DB, they've completed onboarding
        const hasCompletedOnboarding = 
          userData && 
          !error &&
          !(userData.userType === 'student' && 
            userData.toneMode === 'balanced' && 
            userData.language === 'en')

        if (hasCompletedOnboarding) {
          console.log('✅ User has completed onboarding (DB check), redirecting to chat...')
          setRedirecting(true)
          router.replace('/chat')
        } else {
          console.log('🆕 New user or incomplete onboarding, redirecting to persona selection...')
          setRedirecting(true)
          router.replace('/persona')
        }
      } catch (err) {
        console.error('❌ Error checking user status:', err)
        // On error, default to persona selection for safety
        setRedirecting(true)
        router.replace('/persona')
      }
    }

    handleRedirect()
  }, [user, loading, router, supabase, redirecting])

  // Show a loading screen while redirecting (dark theme matching app)
  return (
    <div 
      className="min-h-screen flex items-center justify-center"
      style={{ 
        background: '#080412',
        backgroundImage: 'radial-gradient(ellipse 700px 300px at 50% 0%, #7C3AED0D, transparent)'
      }}
    >
      <div className="text-center">
        {/* Spinning loader */}
        <div 
          className="inline-block animate-spin rounded-full h-12 w-12 border-4 mb-4"
          style={{ 
            borderColor: '#7C3AED',
            borderTopColor: 'transparent'
          }}
        />
        
        {/* Loading text */}
        <p 
          className="text-lg font-medium"
          style={{ color: '#C4B5FD' }}
        >
          Setting up your account...
        </p>
        
        {/* Subtitle */}
        <p 
          className="text-sm mt-2"
          style={{ color: '#9CA3AF' }}
        >
          Please wait while we prepare your experience
        </p>

        {/* Animated dots */}
        <div className="flex justify-center gap-1 mt-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: '#7C3AED',
                animation: `pulse 1.4s ease-in-out ${i * 0.2}s infinite`
              }}
            />
          ))}
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  )
}
