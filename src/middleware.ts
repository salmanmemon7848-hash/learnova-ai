import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const publicRoutes = ['/', '/login', '/signup', '/auth', '/auth/callback', '/about', '/privacy', '/terms', '/beta-disclaimer']
  const isPublicRoute = publicRoutes.some(route => pathname === route || pathname.startsWith('/auth'))
  const pricingBypassRoutes = ['/welcome-pricing', '/welcome', '/chat', '/auth/redirect', '/api']
  const shouldBypassPricingGate = pricingBypassRoutes.some(route => pathname === route || pathname.startsWith(route))

  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request: { headers: request.headers } })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // Not logged in → redirect to /auth
  if (!user && !isPublicRoute) {
    return NextResponse.redirect(new URL('/auth', request.url))
  }

  // Logged in on auth page → redirect to dashboard (unless specific auth sub-routes)
  if (user && (pathname === '/login' || pathname === '/signup' || pathname === '/auth')) {
    if (pathname === '/auth' && request.nextUrl.searchParams.has('role')) {
      return response
    }
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Logged in + first-time user (no plan set) → redirect to /welcome-pricing
  // EXCEPT if they are already on /welcome-pricing to avoid redirect loop
  if (user && !isPublicRoute && !shouldBypassPricingGate) {
    // 1. Query user_plans for active plan and role
    const { data: planData } = await supabase
      .from('user_plans')
      .select('plan, role')
      .eq('user_id', user.id)
      .single()

    // 2. Query profiles table safely for role only
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const userRole = planData?.role || profile?.role || 'student'
    const isGeneralRole = userRole === 'general'

    // If user_plans is not initialized yet and they are not a general user, redirect to onboarding pricing
    if (!planData && !isGeneralRole) {
      return NextResponse.redirect(new URL('/welcome-pricing', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icons|manifest.json|service-worker.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
