import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;

    // Fetch all exam attempts
    const { data: exams } = await supabase
      .from('ExamAttempt')
      .select('*')
      .eq('userId', userId)
      .order('createdAt', { ascending: false });

    // Fetch streaks
    const { data: streaks } = await supabase
      .from('StudyStreak')
      .select('*')
      .eq('userId', userId)
      .order('date', { ascending: false });

    // Calculate stats
    const totalQuestions = exams?.reduce((sum, e) => sum + (e.totalQuestions || 0), 0) || 0;
    const totalCorrect = exams?.reduce((sum, e) => sum + (e.correctAnswers || 0), 0) || 0;
    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const totalStudyTime = exams?.reduce((sum, e) => sum + (e.timeTaken || 0), 0) || 0;

    // Calculate current streak
    let currentStreak = 0;
    if (streaks && streaks.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const dates = [...new Set(streaks.map((s: any) => s.date))].sort().reverse();
      for (let i = 0; i < dates.length; i++) {
        const expected = new Date();
        expected.setDate(expected.getDate() - i);
        if (dates[i] === expected.toISOString().split('T')[0]) currentStreak++;
        else break;
      }
    }

    // Subject performance
    const subjectMap: any = {};
    exams?.forEach((e) => {
      if (!subjectMap[e.subject]) subjectMap[e.subject] = { correct: 0, total: 0 };
      subjectMap[e.subject].correct += e.correctAnswers || 0;
      subjectMap[e.subject].total += e.totalQuestions || 0;
    });

    const subjectPerformance = Object.entries(subjectMap).map(([subject, data]: any) => ({
      subject,
      accuracy: Math.round((data.correct / data.total) * 100),
      total: data.total,
    }));

    return NextResponse.json({
      totalQuestionsAttempted: totalQuestions,
      overallAccuracy: accuracy,
      totalStudyTimeMinutes: Math.round(totalStudyTime / 60),
      currentStreak,
      totalExams: exams?.length || 0,
      subjectPerformance,
      recentExams: exams?.slice(0, 5) || [],
    });

  } catch (error: any) {
    console.error('❌ Progress Error:', error?.message);
    return NextResponse.json({ error: 'Failed to fetch progress.' }, { status: 500 });
  }
}

// Reset progress
export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    await supabase.from('ExamAttempt').delete().eq('userId', userId);
    await supabase.from('StudyStreak').delete().eq('userId', userId);
    await supabase.from('WeakAreaTracking').delete().eq('userId', userId);

    return NextResponse.json({ success: true, message: 'Progress reset successfully.' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to reset progress.' }, { status: 500 });
  }
}
