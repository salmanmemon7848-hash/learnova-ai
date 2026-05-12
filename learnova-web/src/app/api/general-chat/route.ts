import { createClient } from '@/lib/supabase/server';
import { runGeneralChat } from '@/lib/generalChatAI';
import { sanitizeString, sanitizeMessages, checkBodySize } from '@/lib/validation';
import { NextRequest, NextResponse } from 'next/server';
import type { AIMessage } from '@/lib/generalChatAI';

const DAILY_MESSAGE_LIMIT = 20;
type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

// Generate a good title from the first user message
const generateTitle = (message: string): string => {
  const cleaned = message
    .replace(/[^\w\s\u0900-\u097F\u0980-\u09FF]/g, ' ') // keep Hindi chars too
    .trim();

  if (cleaned.length <= 45) return cleaned;

  // Try to cut at a word boundary
  const truncated = cleaned.slice(0, 45);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated) + '...';
};

async function checkGeneralChatLimit(userId: string, supabase: SupabaseServerClient): Promise<{
  allowed: boolean;
  remaining: number;
  message?: string;
}> {
  const today = new Date().toISOString().split('T')[0];

  const { count } = await supabase
    .from('chat_messages')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('role', 'user')
    .gte('created_at', `${today}T00:00:00.000Z`)
    .lt('created_at', `${today}T23:59:59.999Z`);

  const used = count || 0;
  const remaining = Math.max(0, DAILY_MESSAGE_LIMIT - used);

  if (used >= DAILY_MESSAGE_LIMIT) {
    return {
      allowed: false,
      remaining: 0,
      message: `You have used all ${DAILY_MESSAGE_LIMIT} daily messages. Come back tomorrow!`,
    };
  }

  return { allowed: true, remaining };
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let rawBody: unknown = {};
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    if (!checkBodySize(rawBody, 100000)) {
      return NextResponse.json({ error: 'Request too large' }, { status: 413 });
    }

    const body = rawBody && typeof rawBody === 'object'
      ? rawBody as Record<string, unknown>
      : {};

    const messages = sanitizeMessages(body.messages)
      .filter((message) => message.role === 'user' || message.role === 'assistant');
    const sessionId = typeof body.sessionId === 'string'
      ? sanitizeString(body.sessionId, 36)
      : null;

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const limitCheck = await checkGeneralChatLimit(session.user.id, supabase);
    if (!limitCheck.allowed) {
      return NextResponse.json({
        error: 'rate_limit_exceeded',
        message: limitCheck.message,
      }, { status: 429 });
    }

    const lastUserMessage = messages.filter((message) => message.role === 'user').at(-1)?.content || '';

    const systemPrompt = `You are Thinkior — a helpful, intelligent, and friendly AI assistant built for Indian users.

You can help with anything: general knowledge, science, math, history, current events, writing, coding, career advice, business, education, and more.

Your personality:
- Warm, clear, and direct — like a knowledgeable friend
- Use simple language unless the user asks for technical depth
- Give complete, useful answers
- Use Indian context naturally — ₹ for currency, Indian examples where relevant
- Respond in the same language the user writes in (English, Hindi, or Hinglish)
- Be honest when you don't know something

Rules:
- Never refuse to answer general knowledge questions
- For conversational replies, write naturally — not in bullet points
- Use bullet points only when listing multiple items that genuinely benefit from a list
- Keep responses focused — no unnecessary padding
- For math or code, show your work clearly
- If web search results are provided, use them to give current and accurate answers`;

    const fullMessages: AIMessage[] = [
      { role: 'system' as const, content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ];

    const aiResult = await runGeneralChat(fullMessages, lastUserMessage, 1500);

    if (!aiResult.text || aiResult.provider === 'failed') {
      return NextResponse.json({
        error: 'AI service unavailable. Please try again in a moment.',
      }, { status: 500 });
    }

    console.log(`[GeneralChat] Provider: ${aiResult.provider} | Search: ${aiResult.searchUsed}`);

    let currentSessionId = sessionId;

    if (currentSessionId) {
      const { data: existingSession } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('id', currentSessionId)
        .eq('user_id', session.user.id)
        .single();

      if (!existingSession) currentSessionId = null;
    }

    if (!currentSessionId) {
      const title = generateTitle(lastUserMessage);

      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({
          user_id: session.user.id,
          title: title || 'New conversation',
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (sessionError) {
        console.error('[GeneralChat] Session creation failed:', sessionError.message);
      }
      currentSessionId = newSession?.id || null;
    }

    if (currentSessionId) {
      const messagesToInsert = [
        {
          session_id: currentSessionId,
          user_id: session.user.id,
          role: 'user' as const,
          content: lastUserMessage,
          created_at: new Date().toISOString(),
        },
        {
          session_id: currentSessionId,
          user_id: session.user.id,
          role: 'assistant' as const,
          content: aiResult.text,
          created_at: new Date(Date.now() + 1).toISOString(), // 1ms later to preserve order
        },
      ];

      const { error: msgError } = await supabase
        .from('chat_messages')
        .insert(messagesToInsert);

      if (msgError) {
        console.error('[GeneralChat] Message save failed:', msgError.message);
      }

      // Also update the session updated_at manually to ensure ordering works
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentSessionId);
    }

    return NextResponse.json({
      reply: aiResult.text,
      sessionId: currentSessionId,
      provider: aiResult.provider,
      remaining: limitCheck.remaining - 1,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GeneralChat] Fatal error:', message);
    return NextResponse.json({ error: 'Service unavailable' }, { status: 500 });
  }
}
