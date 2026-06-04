import { SYSTEM_PROMPTS } from '@/lib/systemPrompts';
import { createClient } from '@/lib/supabase/server';
import { aiHandler, messagesToPrompt, type AIChatMessage } from '@/lib/ai/aiHandler';
import { NextRequest, NextResponse } from 'next/server';
import { sanitizeJsonPostBody, sanitizeMessages, sanitizeString } from '@/lib/validation';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function isSearchFeature(feature: string): boolean {
  return feature === 'edufinder';
}

function taskComplexity(feature: string): 'simple' | 'complex' {
  return feature === 'doubt_solver' || feature === 'practice_test' ? 'simple' : 'complex';
}

export async function POST(req: NextRequest) {
  try {
    let rawBody: unknown = {};
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = sanitizeJsonPostBody(rawBody, ['feature', 'messages']);
    if (!parsed.ok) return parsed.response;

    const feature = sanitizeString(parsed.body.feature, 64);
    const messagesSanitized = sanitizeMessages(parsed.body.messages)
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .map((message) => ({
        role: message.role as 'user' | 'assistant',
        content: message.content,
      })) as ChatMessage[];

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!feature || !SYSTEM_PROMPTS[feature]) {
      return NextResponse.json(
        {
          error: `Unknown feature "${feature}". Valid features: ${Object.keys(SYSTEM_PROMPTS).join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (messagesSanitized.length === 0) {
      return NextResponse.json(
        { error: 'messages must be a non-empty array of { role, content } objects.' },
        { status: 400 }
      );
    }

    const aiMessages: AIChatMessage[] = messagesSanitized.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    const response = await aiHandler({
      prompt: messagesToPrompt(aiMessages),
      context: SYSTEM_PROMPTS[feature],
      featureName: feature,
      isSearchFeature: isSearchFeature(feature),
      taskComplexity: taskComplexity(feature),
    });

    return NextResponse.json({ reply: response.result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('[__PROTECT_API_LEARNOVA__] Unexpected error:', message);
    return NextResponse.json(
      { error: 'Our AI is temporarily unavailable. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
