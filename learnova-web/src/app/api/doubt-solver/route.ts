import { generateText } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage, buildBlockedResponse, buildRateLimitHeaders } from '@/lib/rateLimit';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { NextRequest, NextResponse } from 'next/server';
import {
  LEARNOVA_FULL_CONTEXT,
  STUDENT_KNOWLEDGE,
  CAREER_GUIDE_KNOWLEDGE,
  EDUFINDER_KNOWLEDGE,
  AI_WRITER_KNOWLEDGE,
  getLanguageInstruction,
} from '@/lib/learnovaKnowledge';

// ── Level-specific instructions ───────────────────────────────────────────────
const levelInstructions: Record<string, string> = {
  auto: `First detect the complexity of the question. If it seems like a basic school question, explain simply. If it seems like a competitive exam question, go deep with theory and edge cases. Mention which level you detected at the start.`,
  basic: `The student is in Class 6–8. Use very simple language. Avoid jargon. Use relatable real-world Indian examples like cricket, chai, rickshaw, school. Keep sentences short.`,
  medium: `The student is in Class 9–12. Use correct technical terms but explain them. Connect concepts to CBSE/ICSE syllabus. Use examples from daily Indian life and board exam patterns.`,
  advanced: `The student is preparing for JEE/NEET/UPSC/CAT. Give deep theoretical understanding. Include edge cases, exceptions, and common exam traps. Reference standard books where relevant (HC Verma, NCERT, RD Sharma).`,
};

function buildSystemPrompt(level: string, languageInstruction: string): string {
  const instruction = levelInstructions[level] ?? levelInstructions['auto'];

  return `${LEARNOVA_FULL_CONTEXT}
${STUDENT_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

You are Learnova's AI Doubt Solver — a world-class Indian tutor who explains concepts like a real teacher, not a search engine.

Level context: ${instruction}

CRITICAL: You must ALWAYS respond in this EXACT JSON structure — no extra text, no markdown outside the JSON:

{
  "concept_in_one_line": "string — explain the core concept in one simple sentence",
  "detected_level": "string — Basic / Medium / Advanced",
  "step_by_step": [
    { "step": 1, "title": "string", "explanation": "string" },
    { "step": 2, "title": "string", "explanation": "string" },
    { "step": 3, "title": "string", "explanation": "string" }
  ],
  "simple_example": {
    "title": "string",
    "example": "string — use an Indian real-world example"
  },
  "medium_example": {
    "title": "string",
    "example": "string — slightly more complex, textbook-style"
  },
  "advanced_example": {
    "title": "string",
    "example": "string — exam-level application"
  },
  "why_it_works": "string — explain the reasoning and logic behind the answer, not just the answer",
  "common_mistakes": ["string", "string"],
  "memory_trick": "string — a short mnemonic or trick to remember this concept",
  "exam_tip": "string — one specific tip for CBSE/JEE/NEET students",
  "related_topics": ["string", "string", "string"]
}

Rules:
- Always use ₹, Indian city names, Indian context in examples
- Never write bullet points or markdown outside the JSON
- Never give a one-line answer — always give full structured response
- If web search results are provided, use them to make examples current and accurate
- The step_by_step array must always have at least 3 steps
- Never skip advanced_example even for basic questions — scale it appropriately`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkAndIncrementUsage(session.user.id, 'doubt-solver', ipAddress);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(buildBlockedResponse(rateLimitResult), { status: 429 });
    }
    const responseHeaders = buildRateLimitHeaders(rateLimitResult);

    const userId = session.user.id;
    const { question, questionText, subject, imageUrl, level = 'auto' } = await req.json();
    // Support both field names: frontend sends `questionText`, normalise to `question`
    const userQuestion = (question || questionText || '').trim();
    const userSubject = (subject || '').trim();

    // ── Language detection ─────────────────────────────────────────────────────
    const languageInstruction = getLanguageInstruction(userQuestion);

    const baseSystemPrompt = buildSystemPrompt(level, languageInstruction);

    // Fetch live web context for this question
    const searchContext = await getSearchContext(userQuestion, 'doubt-solver', { subject: userSubject });
    const searchUsageInstruction = buildSearchUsageInstruction(searchContext);

    const finalSystemPrompt = searchContext
      ? `${baseSystemPrompt}\n\n${searchContext}\n\n${searchUsageInstruction}`
      : `${baseSystemPrompt}\n\n${searchUsageInstruction}`;

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

    return NextResponse.json({ solution }, { headers: responseHeaders });
  } catch (error: any) {
    console.error('❌ Doubt Solver Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to solve doubt.' }, { status: 500 });
  }
}
