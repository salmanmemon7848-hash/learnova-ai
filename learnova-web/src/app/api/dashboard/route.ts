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
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();
    const userRole = profile?.role === 'founder' ? 'founder' : 'student';
    const founderActivityTypes = ['business-ideas', 'validate', 'competitor-research', 'competitor-research-job', 'interview', 'pitch-deck', 'pitch_deck', 'chat', 'writer'];
    const studentActivityTypes = ['doubt', 'exam', 'test', 'planner', 'edufinder', 'interview', 'chat', 'writer'];
    const activityFilter = userRole === 'founder' ? founderActivityTypes : studentActivityTypes;

    // Fetch all dashboard data in parallel
    const [
      activityRes,
      streakRes,
      testsRes,
      allTestsRes,
      interviewsRes,
      allInterviewsRes,
      doubtsRes,
      savedFilesRes,
    ] = await Promise.all([
      supabase
        .from('activity_log')
        .select('*')
        .eq('user_id', userId)
        .in('activity_type', activityFilter)
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
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(10),

      supabase
        .from('practice_tests')
        .select('id,score,created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1000),

      supabase
        .from('interview_sessions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(5),

      supabase
        .from('interview_sessions')
        .select('id,created_at,overall_score')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1000),

      supabase
        .from('doubt_history')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', twentyFourHoursAgo)
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
    const allTests = allTestsRes.data || [];
    const allInterviews = allInterviewsRes.data || [];
    const avgScore = allTests.length
      ? Math.round(allTests.reduce((sum: number, t: any) => sum + (t.score || 0), 0) / allTests.length)
      : 0;
    console.log('[Dashboard] Fixed: role-filtered activity with 24h feed/tab data and all-time stat totals');

    return NextResponse.json({
      userRole,
      recentActivity: activityRes.data || [],
      streak: streakRes.data || { current_streak: 0, longest_streak: 0, total_sessions: 0 },
      practiceTests: tests,
      allTimePracticeTestCount: allTests.length,
      avgTestScore: avgScore,
      interviewSessions: interviewsRes.data || [],
      allTimeInterviewCount: allInterviews.length,
      latestInterviewAt: allInterviews[0]?.created_at || null,
      doubtHistory: doubtsRes.data || [],
      savedFiles: savedFilesRes.data || [],
    });
  } catch (error: any) {
    console.error('❌ Dashboard API Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to load dashboard.' }, { status: 500 });
  }
}
