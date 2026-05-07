import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  console.log('🔄 Auth callback triggered');
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const next = requestUrl.searchParams.get('next') || '/dashboard'

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
              console.error('❌ Error setting cookies in callback:', err);
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
      console.log('✅ Session established for user:', data.user.id);
      
      // Read the pending role from cookie (set by client before OAuth redirect)
      const pendingRole = cookieStore.get('thinkior_pending_role')?.value

      if (pendingRole && (pendingRole === 'student' || pendingRole === 'founder')) {
        console.log('👤 Applying pending role:', pendingRole);
        await supabase
          .from('profiles')
          .upsert({ id: data.user.id, role: pendingRole }, { onConflict: 'id' })
      }

      // Clear the pending role cookie and redirect
      const response = NextResponse.redirect(`${origin}${next}`)
      response.cookies.set('thinkior_pending_role', '', { maxAge: 0, path: '/' })
      return response
    }
  }

  console.warn('⚠️ No code found in auth callback or exchange failed');
  return NextResponse.redirect(`${origin}/auth`)
}
