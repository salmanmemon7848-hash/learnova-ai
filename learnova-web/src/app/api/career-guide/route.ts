import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { chatWithFallback } from '@/lib/aiFallback';
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

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkAndIncrementUsage(session.user.id, 'career-guide', ipAddress);
    if (!rateLimitResult.allowed) return NextResponse.json(buildBlockedResponse(rateLimitResult), { status: 429 });
    const responseHeaders = buildRateLimitHeaders(rateLimitResult);

    if (Object.keys(answers).length === 0 && !legacyPrompt) {
      return NextResponse.json({ error: 'Answers are required' }, { status: 400 });
    }

    const systemPrompt = `${THINKIOR_FULL_CONTEXT}
${CAREER_GUIDE_KNOWLEDGE}
${STUDENT_KNOWLEDGE}

You are Thinkior's Career Guide AI. Based on the student's answers, recommend exactly 3 best-fit career paths personalized to their interests, work style, priorities and timeline.

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

    const aiResult = await chatWithFallback(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      { feature: 'career-guide', maxTokens: 2500, temperature: 0.3 }
    );

    if (!aiResult.text) {
      return NextResponse.json({ error: 'Failed to generate career guidance' }, { status: 500 });
    }

    let data: CareerGuideResponse | null;
    try {
      data = extractJson(aiResult.text);
    } catch {
      return NextResponse.json({ error: 'Could not parse career guidance' }, { status: 500 });
    }

    if (!data?.careers || !Array.isArray(data.careers)) {
      return NextResponse.json({ error: 'Career guidance was incomplete' }, { status: 500 });
    }

    return NextResponse.json({
      careers: data.careers.slice(0, 3),
      personalizedMessage: data.personalizedMessage || '',
      provider: aiResult.provider,
    }, { headers: responseHeaders });
  } catch (error: unknown) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Failed to generate career guidance' }, { status: 500 });
  }
}
