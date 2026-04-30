import { createClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const { examType, subject, score, totalQuestions, correctAnswers, timeTakenSeconds } = await req.json();

    await supabase.from('practice_tests').insert({
      user_id: userId,
      exam_type: examType,
      subject,
      score,
      total_questions: totalQuestions,
      correct_answers: correctAnswers,
      time_taken_seconds: timeTakenSeconds,
    });

    await logActivity(
      supabase,
      userId,
      'test',
      `${subject} Practice Test — ${score}%`,
      { exam_type: examType, score, subject }
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('❌ Exam Save Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to save exam result.' }, { status: 500 });
  }
}
