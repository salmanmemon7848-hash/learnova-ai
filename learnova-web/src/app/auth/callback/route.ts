import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
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
            } catch {}
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/auth?error=auth_failed`)
    }

    if (data.user) {
      // Read the pending role from cookie (set by client before OAuth redirect)
      const pendingRole = cookieStore.get('learnova_pending_role')?.value

      if (pendingRole && (pendingRole === 'student' || pendingRole === 'founder')) {
        // User explicitly chose a role via landing page CTA — always apply it
        await supabase
          .from('profiles')
          .upsert({ id: data.user.id, role: pendingRole }, { onConflict: 'id' })
      }

      // Clear the pending role cookie
      const response = NextResponse.redirect(`${origin}/dashboard`)
      response.cookies.set('learnova_pending_role', '', { maxAge: 0, path: '/' })
      return response
    }
  }

  return NextResponse.redirect(`${origin}/auth`)
}
