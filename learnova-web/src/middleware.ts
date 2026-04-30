import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Pages that are always public — no auth check needed
  const isPublicPage =
    pathname === '/' ||
    pathname === '/login' ||
    pathname === '/signup' ||
    pathname === '/about' ||
    pathname === '/privacy' ||
    pathname === '/terms' ||
    pathname === '/beta-disclaimer' ||
    pathname.startsWith('/auth/')

  if (isPublicPage) {
    return NextResponse.next()
  }

  // For protected pages, check Supabase session properly
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options) {
          request.cookies.set({ name, value, ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options) {
          request.cookies.set({ name, value: '', ...options })
          response = NextResponse.next({
            request: { headers: request.headers },
          })
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  // Get the current session — this reads the real Supabase cookie correctly
  const { data: { session } } = await supabase.auth.getSession()

  // Not authenticated trying to access protected route → send to login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Authenticated user trying to access login or signup → send to chat
  if (session && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icons|manifest.json|service-worker.js).*)',
  ],
}
