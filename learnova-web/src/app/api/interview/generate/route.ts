import { generateInterviewQuestions } from '@/lib/groqInterviewService';
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

    return NextResponse.json({ questions, language, total: questions.length });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[Learnova API] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
