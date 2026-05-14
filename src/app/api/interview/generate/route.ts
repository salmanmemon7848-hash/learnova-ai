import { generateInterviewQuestions } from '@/lib/groqInterviewService';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage, buildBlockedResponse, buildRateLimitHeaders } from '@/lib/rateLimit';
import { NextRequest, NextResponse } from 'next/server';
import {
  sanitizeJsonPostBody,
  sanitizeNumber,
  sanitizeString,
  validateLanguage,
} from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    let rawBody: unknown = {};
    try {
      rawBody = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = sanitizeJsonPostBody(rawBody, [
      'jobRole',
      'experienceLevel',
      'interviewType',
      'numberOfQuestions',
      'language',
    ]);
    if (!parsed.ok) return parsed.response;

    const body = parsed.body;

    // SECURITY: Sanitize user input to prevent XSS and injection attacks
    // OWASP Reference: A03:2021 Injection
    const jobRole = sanitizeString(body.jobRole, 500);
    const language = validateLanguage(body.language);
    const experienceLevel = sanitizeString(body.experienceLevel, 120);
    const interviewType = sanitizeString(body.interviewType, 120);
    const numberOfQuestions = sanitizeNumber(body.numberOfQuestions, 1, 25, 5);

    if (!jobRole || !language) {
      return NextResponse.json({ error: 'jobRole and language are required' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkAndIncrementUsage(session.user.id, 'interview', ipAddress);
    if (!rateLimitResult.allowed) return NextResponse.json(buildBlockedResponse(rateLimitResult), { status: 429 });
    const responseHeaders = buildRateLimitHeaders(rateLimitResult);
    console.log('[MockInterview] Fixed: interview question generation now enforces auth and rate limits');

    const questions = await generateInterviewQuestions({
      jobRole,
      experienceLevel: experienceLevel || 'Mid-level',
      interviewType: interviewType || 'General',
      numberOfQuestions,
      language,
    });

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
    }

    return NextResponse.json({ questions, language, total: questions.length }, { headers: responseHeaders });
  } catch (error: unknown) {
    console.error('[Thinkior API] Error:', error);
    return NextResponse.json({ error: 'Our AI is temporarily unavailable. Please try again in a moment.' }, { status: 500 });
  }
}
