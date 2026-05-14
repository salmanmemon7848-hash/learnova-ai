import { createClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { NextRequest, NextResponse } from 'next/server';
import {
  sanitizeJsonPostBody,
  sanitizeNumber,
  sanitizeString,
} from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    let rawBody: unknown = {};
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = sanitizeJsonPostBody(rawBody, [
      'examType',
      'subject',
      'score',
      'totalQuestions',
      'correctAnswers',
      'timeTakenSeconds',
    ]);
    if (!parsed.ok) return parsed.response;

    const b = parsed.body;

    // SECURITY: Sanitize user input to prevent XSS and injection attacks
    // OWASP Reference: A03:2021 Injection
    const examType = sanitizeString(b.examType, 120);
    const subject = sanitizeString(b.subject, 200);
    const score = sanitizeNumber(b.score, 0, 100, 0);
    const totalQuestions = sanitizeNumber(b.totalQuestions, 1, 500, 1);
    const correctAnswers = sanitizeNumber(b.correctAnswers, 0, 500, 0);
    const timeTakenSeconds = sanitizeNumber(b.timeTakenSeconds, 0, 86400, 0);

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;

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
