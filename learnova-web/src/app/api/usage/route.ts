import { createClient } from '@/lib/supabase/server';
import { getUserUsageSummary } from '@/lib/rateLimit';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const summary = await getUserUsageSummary(session.user.id);
    return NextResponse.json({ usage: summary });
  } catch (error: any) {
    console.error('[Usage API] Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch usage' }, { status: 500 });
  }
}
