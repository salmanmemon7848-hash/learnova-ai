import { NextRequest, NextResponse } from 'next/server';
import { aiHandler } from '@/lib/ai/aiHandler';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage, buildBlockedResponse, buildRateLimitHeaders } from '@/lib/rateLimit';
import { sanitizeEnum, sanitizeJsonPostBody, sanitizeNumber, sanitizeString } from '@/lib/validation';

const DIFFICULTIES = ['Easy', 'Medium', 'Hard', 'Mixed'];
const QUESTION_COUNTS = [5, 10, 15, 20, 30];

function buildPYQPrompt(exam: string, subject: string, topic: string, difficulty: string, count: number): string {
  const diffInstruction =
    difficulty === 'Easy' ? 'direct formula / single-concept recall' :
    difficulty === 'Medium' ? '1–2 step reasoning, application based' :
    difficulty === 'Hard' ? 'multi-concept, trap options, JEE/NEET advanced standard' :
    'mixed: 30% Easy, 40% Medium, 30% Hard';

  return `You are an expert Indian competitive exam question generator with deep knowledge of ${exam} past year papers from 2010 to 2024.

Generate exactly ${count} questions on the topic "${topic}" from subject "${subject}" for ${exam}.

STRICT RULES:
1. Only generate questions based on concepts that have appeared in actual past papers OR are highly likely based on official syllabus weightage
2. For JEE/NEET: prioritize chapters with >5% weightage
3. For board exams: follow NCERT pattern strictly
4. Difficulty: ${diffInstruction}
5. Each question must have 4 options (A/B/C/D), correct answer, and detailed solution
6. Tag each question as "PYQ YYYY" (if it appeared in past papers), "Most Repeated", or "High Weightage"
7. For Numerical type (JEE/MHT-CET only): provide integer/decimal answer

Return ONLY a valid JSON array — no markdown, no text outside JSON:
[
  {
    "id": "1",
    "question": "...",
    "options": ["A. ...", "B. ...", "C. ...", "D. ..."],
    "correctAnswer": "A",
    "solution": "Step 1: ... Step 2: ...",
    "type": "MCQ",
    "difficulty": "Medium",
    "tag": "PYQ 2022",
    "numericalAnswer": null
  }
]

type must be "MCQ" or "Numerical". tag must be one of: "PYQ 2023", "PYQ 2022", "PYQ 2021", "PYQ 2020", "Most Repeated", "High Weightage".`;
}

function parseQuestions(raw: string): object[] {
  const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/g, '').trim();
  const start = cleaned.indexOf('[');
  const end = cleaned.lastIndexOf(']');
  if (start === -1 || end === -1) return [];
  try {
    const arr = JSON.parse(cleaned.slice(start, end + 1));
    if (!Array.isArray(arr)) return [];
    return arr.filter((q: object) => {
      const item = q as Record<string, unknown>;
      return typeof item.question === 'string' && Array.isArray(item.options) && item.options.length >= 2 && item.correctAnswer;
    });
  } catch { return []; }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const rateLimit = await checkAndIncrementUsage(session.user.id, 'exam', ip);
    if (!rateLimit.allowed) return NextResponse.json(buildBlockedResponse(rateLimit), { status: 429 });

    let body: unknown = {};
    try { body = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }

    const parsed = sanitizeJsonPostBody(body, ['exam', 'subject', 'topic', 'difficulty', 'numberOfQuestions']);
    if (!parsed.ok) return parsed.response;
    const b = parsed.body;

    const exam = sanitizeString(b.exam, 120);
    const subject = sanitizeString(b.subject, 100);
    const topic = sanitizeString(b.topic, 150);
    const difficulty = sanitizeEnum(b.difficulty, DIFFICULTIES, 'Mixed');
    const numberOfQuestions = sanitizeNumber(b.numberOfQuestions, 5, 30, 10);

    if (!exam || !subject || !topic) {
      return NextResponse.json({ error: 'exam, subject, and topic are required' }, { status: 400 });
    }

    const allowed = QUESTION_COUNTS.includes(numberOfQuestions as 5|10|15|20|30)
      ? numberOfQuestions
      : 10;

    const prompt = buildPYQPrompt(exam, subject, topic, difficulty, allowed);
    const aiResponse = await aiHandler({
      prompt,
      featureName: 'practice-tests',
      isSearchFeature: false,
      taskComplexity: 'complex',
    });

    const questions = parseQuestions(aiResponse.result);
    if (questions.length === 0) {
      return NextResponse.json({ error: 'Could not generate questions. Please try again.' }, { status: 422 });
    }

    return NextResponse.json({ questions }, { headers: buildRateLimitHeaders(rateLimit) });
  } catch (err) {
    console.error('[PracticeTests] Error:', err);
    return NextResponse.json({ error: 'Failed to generate questions.' }, { status: 500 });
  }
}
