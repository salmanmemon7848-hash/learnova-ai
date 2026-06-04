import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🔄 Auth callback triggered')
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (err) {
              console.error('❌ Error setting cookies in callback:', err)
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('❌ Auth callback exchange error:', error)
      return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
    }

    if (data?.user) {
      console.log('✅ Session established for user:', data.user.id)

      const pendingRoleCookie = cookieStore.get('learnova_pending_role')?.value

      // Check if this user has already gone through pricing selection
      const { data: profile } = await supabase
        .from('profiles')
        .select('has_seen_pricing, role')
        .eq('id', data.user.id)
        .single()

      let redirectPath = profile?.has_seen_pricing ? '/dashboard' : '/welcome-pricing'

      if (pendingRoleCookie === 'general') {
        // New user clicked Just Chat -> set free plan, skip pricing forever
        await supabase
          .from('profiles')
          .update({
            has_seen_pricing: true,
            role: 'general',
            plan: 'free',
          })
          .eq('id', data.user.id)
        redirectPath = '/chat'
      } else if (pendingRoleCookie && pendingRoleCookie !== 'general') {
        // Student or Founder -> save role, let pricing gate handle the rest
        await supabase
          .from('profiles')
          .update({ role: pendingRoleCookie })
          .eq('id', data.user.id)
        // redirectPath stays as determined above (/welcome-pricing or /dashboard)
      } else if (profile?.role === 'general') {
        // Returning general user -> always go to /chat, never pricing
        redirectPath = '/chat'
      } else if (!profile?.role && !pendingRoleCookie) {
        // No role set anywhere -> default to student, show pricing
        await supabase
          .from('profiles')
          .update({ role: 'student' })
          .eq('id', data.user.id)
        redirectPath = profile?.has_seen_pricing ? '/dashboard' : '/welcome-pricing'
      }

      const response = NextResponse.redirect(`${origin}${redirectPath}`)
      response.cookies.set('learnova_pending_role', '', { maxAge: 0, path: '/' })
      return response
    }
  }

  console.warn('⚠️ No code found in auth callback or exchange failed')
  return NextResponse.redirect(`${origin}/auth`)
}
