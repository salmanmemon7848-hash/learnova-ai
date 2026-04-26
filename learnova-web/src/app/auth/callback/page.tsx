'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/contexts/AuthContext'

export default function AuthCallbackPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const handleCallback = async () => {
      // Get the hash from the URL (Supabase returns session data in hash)
      const hash = window.location.hash
      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')
      const refreshToken = params.get('refresh_token')

      if (accessToken) {
        // Set the session from the URL params
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || '',
        })

        if (error) {
          console.error('Error setting session:', error)
          router.push('/login')
          return
        }
      }

      // Wait for auth state to update
      if (!loading && user) {
        // Check if user needs onboarding
        try {
          const { data: userData } = await supabase
            .from('users')
            .select('userType, toneMode, language')
            .eq('id', user.id)
            .single()

          if (
            !userData ||
            (userData.userType === 'student' &&
              userData.toneMode === 'balanced' &&
              userData.language === 'en')
          ) {
            // New user, redirect to chat which will show onboarding
            router.push('/chat')
          } else {
            // Existing user, redirect to chat
            router.push('/chat')
          }
        } catch (err) {
          console.error('Error checking user data:', err)
          router.push('/chat')
        }
      }
    }

    handleCallback()
  }, [user, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFFFFF' }}>
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#534AB7] border-t-transparent mb-4"></div>
        <p className="text-lg" style={{ color: '#0F0F1A' }}>
          Completing sign-in...
        </p>
      </div>
    </div>
  )
}
