import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/Sidebar'
import RouteGuard from '@/components/dashboard/RouteGuard'
import type { UserRole } from '@/contexts/RoleContext'

export default async function Dashboard({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    console.log('🛡️ Dashboard Layout: No user found, redirecting to /auth');
    redirect('/auth')
  }

  // Fetch role server-side — single source of truth for sidebar rendering
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  const role = (profile?.role as UserRole) || null

  return (
    <DashboardLayout role={role}>
      <RouteGuard role={role}>
        {children}
      </RouteGuard>
    </DashboardLayout>
  )
}
