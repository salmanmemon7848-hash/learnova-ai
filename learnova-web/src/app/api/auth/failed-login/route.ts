import { NextRequest, NextResponse } from 'next/server';
import { recordFailedLoginAttempt } from '@/lib/authSecurity';
import { sanitizeJsonPostBody, sanitizeString } from '@/lib/validation';

export async function POST(req: NextRequest) {
  let rawBody: unknown = {};
  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = sanitizeJsonPostBody(rawBody, ['email'], 8000);
  if (!parsed.ok) return parsed.response;

  // SECURITY: Sanitize user input to prevent XSS and injection attacks
  // OWASP Reference: A03:2021 Injection
  const email = sanitizeString(parsed.body.email, 320);

  const ipAddress =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  await recordFailedLoginAttempt(email || 'unknown', ipAddress);

  return NextResponse.json({ ok: true });
}
