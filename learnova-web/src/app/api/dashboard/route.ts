import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  // SECURITY: No client-supplied input — session-scoped dashboard read only.
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const twentyFourHoursAgo = new Date(Date.now() - 86400000).toISOString();

    // Fetch all dashboard data in parallel
    const [
      activityRes,
      streakRes,
      testsRes,
      interviewsRes,
      doubtsRes,
      savedFilesRes,
    ] = await Promise.all([
      supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(20),

      supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single(),

      supabase
        .from('practice_tests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),

      supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5),

      supabase
        .from('doubt_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),

      supabase
        .from('saved_files')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    const tests = testsRes.data || [];
    const avgScore = tests.length
      ? Math.round(tests.reduce((sum: number, t: any) => sum + (t.score || 0), 0) / tests.length)
      : 0;

    return NextResponse.json({
      recentActivity: activityRes.data || [],
      streak: streakRes.data || { current_streak: 0, longest_streak: 0, total_sessions: 0 },
      practiceTests: tests,
      avgTestScore: avgScore,
      interviewSessions: interviewsRes.data || [],
      doubtHistory: doubtsRes.data || [],
      savedFiles: savedFilesRes.data || [],
    });
  } catch (error: any) {
    console.error('❌ Dashboard API Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to load dashboard.' }, { status: 500 });
  }
}
