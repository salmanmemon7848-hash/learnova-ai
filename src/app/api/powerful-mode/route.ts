import { createClient } from '@/lib/supabase/server';
import { runPowerMode } from '@/lib/powerMode';
import { checkBodySize, sanitizeMessages, sanitizeString } from '@/lib/validation';
import { NextRequest, NextResponse } from 'next/server';
import { checkAndTrackUsage, checkPowerfulModeLimit } from '@/lib/usageTracker';

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

const generateTitle = (message: string): string => {
  const cleaned = message.replace(/[^\w\s\u0900-\u097F\u0980-\u09FF]/g, ' ').trim();
  if (cleaned.length <= 45) return cleaned;

  const truncated = cleaned.slice(0, 45);
  const lastSpace = truncated.lastIndexOf(' ');
  return `${lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated}...`;
};


function buildPowerfulPrompt(messages: Array<{ role: string; content: string }>) {
  const conversation = messages
    .slice(-10)
    .map((message) => `${message.role === 'assistant' ? 'Assistant' : 'User'}: ${message.content}`)
    .join('\n\n');

  const lastUserMessage = messages.filter((message) => message.role === 'user').at(-1)?.content || '';

  return {
    lastUserMessage,
    prompt: `Conversation context:
${conversation}

Answer the latest user message with full context. Latest user message: ${lastUserMessage}`,
  };
}

async function saveConversation({
  supabase,
  userId,
  sessionId,
  userMessage,
  assistantMessage,
}: {
  supabase: SupabaseServerClient;
  userId: string;
  sessionId: string | null;
  userMessage: string;
  assistantMessage: string;
}) {
  let currentSessionId = sessionId;

  if (currentSessionId) {
    const { data: existingSession } = await supabase
      .from('chat_sessions')
      .select('id')
      .eq('id', currentSessionId)
      .eq('user_id', userId)
      .single();

    if (!existingSession) currentSessionId = null;
  }

  if (!currentSessionId) {
    const { data: newSession, error: sessionError } = await supabase
      .from('chat_sessions')
      .insert({
        user_id: userId,
        title: generateTitle(userMessage) || 'New conversation',
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (sessionError) {
      console.error('[PowerMode] Session creation failed:', sessionError.message);
    }

    currentSessionId = newSession?.id || null;
  }

  if (currentSessionId) {
    const messagesToInsert = [
      {
        session_id: currentSessionId,
        user_id: userId,
        role: 'user' as const,
        content: userMessage,
        created_at: new Date().toISOString(),
      },
      {
        session_id: currentSessionId,
        user_id: userId,
        role: 'assistant' as const,
        content: assistantMessage,
        created_at: new Date(Date.now() + 1).toISOString(),
      },
    ];

    const { error: messageError } = await supabase
      .from('chat_messages')
      .insert(messagesToInsert);

    if (messageError) {
      console.error('[PowerMode] Message save failed:', messageError.message);
    }

    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', currentSessionId);
  }

  return currentSessionId;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let rawBody: unknown = {};
    try {
      rawBody = await request.json();
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

    const fallbackQuestion = sanitizeString(body.question, 20000);
    if (messages.length === 0 && fallbackQuestion) {
      messages.push({ role: 'user', content: fallbackQuestion });
    }

    const sessionId = typeof body.sessionId === 'string'
      ? sanitizeString(body.sessionId, 36)
      : null;

    if (messages.length === 0) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const powerfulCheck = await checkPowerfulModeLimit(session.user.id);
    if (!powerfulCheck.allowed) {
      return NextResponse.json({
        success: false,
        error: 'rate_limit_exceeded',
        message: powerfulCheck.message,
      }, { status: 429 });
    }

    const usageResult = await checkAndTrackUsage(session.user.id, 'general-chat');
    if (!usageResult.allowed) {
      return NextResponse.json({
        success: false,
        error: usageResult.reason === 'locked' ? 'feature_locked' : 'rate_limit_exceeded',
        message: usageResult.message || `Limit reached. Please upgrade your plan.`,
      }, { status: usageResult.reason === 'locked' ? 403 : 429 });
    }

    const { lastUserMessage, prompt } = buildPowerfulPrompt(messages);
    if (!lastUserMessage) {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }

    const encoder = new TextEncoder();

    return new Response(new ReadableStream({
      async start(controller) {
        function emit(data: Record<string, any>) {
          controller.enqueue(encoder.encode(JSON.stringify(data) + '\n'));
        }

        try {
          // Upgrade 2: Always trigger SearXNG in Powerful Mode
          let searchContext = '';
          try {
            emit({ type: 'status', status: 'searching_web' });
            const searxRes = await fetch(
              `${process.env.SEARXNG_URL}/search?q=${encodeURIComponent(lastUserMessage)}&format=json&categories=general`,
              { headers: { 'Accept': 'application/json' } }
            );
            const searxData = await searxRes.json();
            const topResults = (searxData.results || []).slice(0, 5).map((r: any) => ({
              title: r.title,
              url: r.url,
              snippet: r.content
            }));
            
            searchContext = `[WEB CONTEXT — Live Search Results]\n${topResults.map((r: any, i: number) => `[${i+1}] ${r.title}\nURL: ${r.url}\n${r.snippet}`).join('\n\n')}`;
          } catch (err) {
            console.error('Search Context Error:', err);
          }

          const enrichedPrompt = searchContext ? `${searchContext}\n\n${prompt}` : prompt;

          const result = await runPowerMode(enrichedPrompt, (status) => {
            emit({ type: 'status', status });
          });

          const currentSessionId = await saveConversation({
            supabase,
            userId: session.user.id,
            sessionId,
            userMessage: lastUserMessage,
            assistantMessage: result.final,
          });

          emit({
            type: 'result',
            reply: result.final,
            answer: result.final,
            sessionId: currentSessionId,
            provider: result.provider,
            durationMs: result.durationMs,
            remaining: usageResult.remaining,
          });

          controller.close();
        } catch (error: unknown) {
          const message = error instanceof Error ? error.message : 'Unknown error';
          console.error('[PowerMode] Fatal error:', message);
          emit({
            type: 'error',
            error: 'Power Mode failed. Please try again.',
            message: process.env.NODE_ENV === 'development' ? message : 'Power Mode failed. Please try again.',
          });
          controller.close();
        }
      }
    }), {
      headers: {
        'Content-Type': 'application/x-ndjson',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PowerMode] Fatal error:', message);
    return NextResponse.json({
      error: 'Power Mode failed. Please try again.',
      message: process.env.NODE_ENV === 'development' ? message : 'Power Mode failed. Please try again.',
    }, { status: 500 });
  }
}
