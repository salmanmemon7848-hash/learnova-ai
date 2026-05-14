import { NextRequest, NextResponse } from 'next/server';
import { checkLoginAttempts } from '@/lib/authSecurity';
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

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
  }

  const ipAddress =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  const result = await checkLoginAttempts(email, ipAddress);
  if (!result.allowed) {
    return NextResponse.json({ allowed: false, message: result.message }, { status: 429 });
  }

  return NextResponse.json({ allowed: true });
}
