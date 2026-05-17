import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ plan: 'free', userType: 'student' })
    }

    const { data: sub, error } = await supabase
      .from('user_plans')
      .select('plan, role, is_active')
      .eq('user_id', session.user.id)
      .single()

    if (error || !sub) {
      return NextResponse.json({
        plan: 'free',
        userType: 'student',
        status: 'active'
      })
    }

    return NextResponse.json({
      plan: sub.plan || 'free',
      userType: sub.role || 'student',
      status: sub.is_active ? 'active' : 'inactive'
    })
  } catch (error) {
    return NextResponse.json({ plan: 'free', userType: 'student' })
  }
}
