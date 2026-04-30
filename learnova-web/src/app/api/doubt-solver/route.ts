import { generateText } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { askAIWithSearch } from '@/lib/aiWithSearch';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const { question, questionText, subject, imageUrl } = await req.json();
    // Support both field names: frontend sends `questionText`, normalise to `question`
    const userQuestion = (question || questionText || '').trim();
    const userSubject = (subject || '').trim();

    const baseSystemPrompt = `You are a concise and helpful AI tutor for Indian students preparing for CBSE, JEE, and NEET exams.

When a student asks a question, answer in this exact format and nothing else:

**Answer:** [1-2 sentence direct answer]

**Why:** [2-3 sentences explaining the concept simply]

**Remember:** [1 key point to remember for exams]

Rules:
- Never write more than 8 lines total
- Never add sections like "NCERT Reference", "Common Mistakes", "Exam Relevance", "Step by Step" unless the student specifically asks
- If the question is a calculation, show only the steps needed, no commentary
- Use simple English that a Class 10-12 student understands
- If the topic comes in as undefined or empty, ask the student: "Please type your question clearly and I will help you."
- Never repeat the question back to the student`;

    // Enrich system prompt with live web context for this question
    const { finalSystemPrompt } = await askAIWithSearch({
      userMessage: `${userSubject ? userSubject + ' ' : ''}${userQuestion}`,
      systemPrompt: baseSystemPrompt,
      needsSearch: true,
    });

    if (!userQuestion) {
      return NextResponse.json({ solution: 'Please type your question clearly and I will help you.' });
    }

    const prompt = userSubject
      ? `[Subject: ${userSubject}] ${userQuestion}`
      : userQuestion;

    const solution = await generateText(prompt, finalSystemPrompt);

    // ── Save to Supabase (non-blocking) ───────────────────────────────────────
    try {
      await supabase.from('doubt_history').insert({
        user_id: userId,
        subject: userSubject || null,
        question: userQuestion,
        answer: solution,
      });

      await logActivity(
        supabase,
        userId,
        'doubt',
        `Asked: ${userQuestion.slice(0, 60)}${userQuestion.length > 60 ? '...' : ''}`,
        { subject: userSubject }
      );
    } catch (saveErr) {
      console.warn('[Doubt Solver] Failed to save to Supabase:', saveErr);
    }

    return NextResponse.json({ solution });
  } catch (error: any) {
    console.error('❌ Doubt Solver Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to solve doubt.' }, { status: 500 });
  }
}
