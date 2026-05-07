import { chatWithHistory } from '@/lib/openai';
import { getBasePrompt } from '@/lib/prompts/basePrompt';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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

    const parsed = sanitizeJsonPostBody(rawBody, ['message', 'messages', 'language', 'mode']);
    if (!parsed.ok) return parsed.response;

    // SECURITY: Sanitize user input to prevent XSS and injection attacks
    // OWASP Reference: A03:2021 Injection
    const msgs = sanitizeMessages(parsed.body.messages);
    const single = sanitizeString(parsed.body.message, 12000);
    void validateLanguage(parsed.body.language);
    void sanitizeString(parsed.body.mode, 64);

    const message =
      msgs.length > 0 ? msgs.filter((m) => m.role === 'user').pop()?.content || '' : single;

    if (!message) {
      return NextResponse.json({ error: 'No message provided' }, { status: 400 });
    }

    // Simple rate limiting via cookies (1 demo per session)
    const cookieStore = await cookies();
    const demoUsed = cookieStore.get('thinkior-demo-used');
    
    if (demoUsed) {
      return NextResponse.json(
        { 
          error: 'Demo limit reached', 
          message: 'You have used your free demo. Sign up for unlimited access.',
          demoLimitReached: true 
        }, 
        { status: 429 }
      );
    }

    // Build a simple system prompt for demo
    const systemPrompt = getBasePrompt('class', 'english') + `

IMPORTANT: This is a demo interaction. Provide a helpful, concise response that showcases your capabilities.
Keep responses under 300 words for the demo. Be engaging and show the value of Thinkior AI.`;

    // Call AI with the message
    const messages = [{ role: 'user', content: message }];
    const responseText = await chatWithHistory(messages, systemPrompt);

    const response = NextResponse.json({ 
      message: responseText, 
      role: 'assistant',
      demoUsed: true,
    });

    // Set cookie to prevent unlimited demo usage
    response.cookies.set('thinkior-demo-used', 'true', {
      maxAge: 60 * 60 * 24, // 24 hours
      httpOnly: true,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('❌ Demo Chat Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to process your message. Please try again.' }, { status: 500 });
  }
}
