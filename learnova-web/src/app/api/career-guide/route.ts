import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getAIResponse } from '@/lib/aiRouter';
import { checkAndIncrementUsage, buildBlockedResponse, buildRateLimitHeaders } from '@/lib/rateLimit';
import {
  sanitizeJsonPostBody,
  sanitizeMessages,
  sanitizeString,
  validateLanguage,
} from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    let rawBody: unknown = {};
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = sanitizeJsonPostBody(rawBody, ['query', 'prompt', 'language', 'messages']);
    if (!parsed.ok) return parsed.response;

    const b = parsed.body;

    // SECURITY: Sanitize user input to prevent XSS and injection attacks
    // OWASP Reference: A03:2021 Injection
    const prompt = sanitizeString(b.prompt || b.query, 8000);
    void sanitizeMessages(b.messages);
    void validateLanguage(b.language);

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkAndIncrementUsage(session.user.id, 'career-guide', ipAddress);
    if (!rateLimitResult.allowed) return NextResponse.json(buildBlockedResponse(rateLimitResult), { status: 429 });
    const responseHeaders = buildRateLimitHeaders(rateLimitResult);

    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const message = await getAIResponse(
      [{ role: 'user', content: prompt }],
      'You are Thinkior career guide for Indian students. Give concise practical guidance.',
      { feature: 'career-guide', maxTokens: 1200 }
    );

    return NextResponse.json({ message }, { headers: responseHeaders });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to generate career guidance' }, { status: 500 });
  }
}
