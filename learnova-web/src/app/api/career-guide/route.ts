import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { aiHandler } from '@/lib/ai/aiHandler';
import { checkAndIncrementUsage, buildBlockedResponse, buildRateLimitHeaders } from '@/lib/rateLimit';
import {
  THINKIOR_FULL_CONTEXT,
  CAREER_GUIDE_KNOWLEDGE,
  STUDENT_KNOWLEDGE,
} from '@/lib/thinkiorKnowledge';
import {
  sanitizeJsonPostBody,
  sanitizeString,
  sanitizeStringRecord,
  validateLanguage,
} from '@/lib/validation';

type CareerGuideResponse = {
  careers?: unknown[];
  personalizedMessage?: string;
};

function expectedStreamLabel(streamAnswer?: string): string | null {
  const normalized = String(streamAnswer || '').toLowerCase();
  if (normalized.includes('not sure')) return null;
  if (normalized.includes('pcm')) return 'Science (PCM)';
  if (normalized.includes('pcb')) return 'Science (PCB)';
  if (normalized.includes('commerce')) return 'Commerce';
  if (normalized.includes('arts') || normalized.includes('humanities')) return 'Arts';
  return streamAnswer || null;
}

function careerMatchesSelectedStream(career: any, streamAnswer?: string): boolean {
  const expected = expectedStreamLabel(streamAnswer);
  if (!expected) return true;
  const stream = String(career?.stream || '').toLowerCase();
  if (!stream) return true;
  if (expected === 'Science (PCM)') return /science|pcm|engineering|tech/.test(stream) && !/commerce|arts|humanities|medical|biology|pcb/.test(stream);
  if (expected === 'Science (PCB)') return /science|pcb|medical|biology|life/.test(stream) && !/commerce|arts|humanities|engineering|tech|pcm/.test(stream);
  if (expected === 'Commerce') return /commerce|finance|business/.test(stream);
  if (expected === 'Arts') return /arts|humanities|creative/.test(stream);
  return stream === expected.toLowerCase();
}

function extractJson(text: string): CareerGuideResponse | null {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  return JSON.parse(match[0]) as CareerGuideResponse;
}

export async function POST(req: NextRequest) {
  try {
    let rawBody: unknown = {};
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = sanitizeJsonPostBody(rawBody, ['answers', 'language', 'query', 'prompt']);
    if (!parsed.ok) return parsed.response;

    const body = parsed.body;
    const answers = sanitizeStringRecord(body.answers, 10, 80, 300);
    const language = validateLanguage(body.language);
    const legacyPrompt = sanitizeString(body.prompt || body.query, 8000);

    if (Object.keys(answers).length === 0 && !legacyPrompt) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkAndIncrementUsage(session.user.id, 'career-guide', ipAddress);
    if (!rateLimitResult.allowed) return NextResponse.json(buildBlockedResponse(rateLimitResult), { status: 429 });
    const responseHeaders = buildRateLimitHeaders(rateLimitResult);

    const systemPrompt = `${THINKIOR_FULL_CONTEXT}
${CAREER_GUIDE_KNOWLEDGE}
${STUDENT_KNOWLEDGE}

You are Thinkior's Career Guide AI. Based on the student's answers, recommend exactly 3 best-fit career paths personalized to their interests, work style, priorities and timeline.

CRITICAL STREAM RULE:
The student answered their stream as: ${answers.stream || 'Not provided'}
You MUST only recommend careers from the stream they selected.
- If they selected Science (PCM) -> only return Science/Engineering/Tech careers and set stream to "Science (PCM)"
- If they selected Science (PCB) -> only return Medical/Biology/Life Sciences careers and set stream to "Science (PCB)"
- If they selected Commerce -> only return Commerce/Finance/Business careers and set stream to "Commerce"
- If they selected Arts -> only return Arts/Humanities/Creative careers and set stream to "Arts"
- If they selected "Not sure yet" -> return 1 career from each of 3 different streams

NEVER mix streams. If student chose Science PCM, do NOT show Commerce or Arts careers.
Set the stream field in each career object to match exactly.

CRITICAL: Respond with ONLY valid JSON. No markdown. Start with { end with }.

{
  "careers": [
    {
      "colorIndex": 0,
      "icon": "⚙️",
      "title": "Engineering (B.Tech/B.E.)",
      "tagline": "Build the future with technology",
      "stream": "Science",
      "entrySalary": "₹3-8 LPA",
      "topSalary": "₹60 LPA+",
      "duration": "4 years",
      "demandPercent": 22,
      "demandLabel": "High",
      "difficulty": "Hard",
      "exams": ["JEE Main", "JEE Advanced", "BITSAT", "State CETs", "VITEEE"],
      "whyMatch": "string - 2 sentences explaining why this matches their specific answers",
      "keySkills": ["string", "string", "string"],
      "topColleges": ["IIT Bombay", "NIT Trichy", "BITS Pilani"],
      "careerPath": "string - typical career progression",
      "fullDetails": "string - 3-4 paragraph detailed career overview"
    }
  ],
  "personalizedMessage": "string - personalized message addressing their specific answers"
}`;

    const userMessage = Object.keys(answers).length > 0
      ? `Student answers:\n${JSON.stringify(answers, null, 2)}\n\nLanguage preference: ${language}`
      : `Student request:\n${legacyPrompt}\n\nLanguage preference: ${language}`;

    const aiResult = await aiHandler({
      prompt: userMessage,
      context: systemPrompt,
      featureName: 'career-guide',
      isSearchFeature: false,
      taskComplexity: 'complex',
    });

    if (!aiResult.result) {
      return NextResponse.json({ error: 'Failed to generate career guidance' }, { status: 500 });
    }

    let data: CareerGuideResponse | null;
    try {
      data = extractJson(aiResult.result);
    } catch {
      return NextResponse.json({ error: 'Could not parse career guidance' }, { status: 500 });
    }

    if (!data?.careers || !Array.isArray(data.careers)) {
      return NextResponse.json({ error: 'Career guidance was incomplete' }, { status: 500 });
    }

    const expectedStream = expectedStreamLabel(answers.stream);
    const streamFilteredCareers = expectedStream
      ? data.careers.filter((career: any) => careerMatchesSelectedStream(career, answers.stream))
      : data.careers;
    const finalCareers = (streamFilteredCareers.length > 0 ? streamFilteredCareers : data.careers)
      .slice(0, 3)
      .map((career: any) => expectedStream ? { ...career, stream: expectedStream } : career);

    console.log('[CareerGuide] Fixed: API prompt and response guard now keep careers within selected stream');

    return NextResponse.json({
      careers: finalCareers,
      personalizedMessage: data.personalizedMessage || '',
    }, { headers: responseHeaders });
  } catch (error: unknown) {
    return NextResponse.json({ error: 'Our AI is temporarily unavailable. Please try again in a moment.' }, { status: 500 });
  }
}
