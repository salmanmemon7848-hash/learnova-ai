import { chatWithHistory } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage, buildBlockedResponse, buildRateLimitHeaders } from '@/lib/rateLimit';
import { getBasePrompt } from '@/lib/prompts/basePrompt';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import { NextRequest, NextResponse } from 'next/server';
import {
  LEARNOVA_FULL_CONTEXT,
  STUDENT_KNOWLEDGE,
  FOUNDER_KNOWLEDGE,
  CAREER_GUIDE_KNOWLEDGE,
  EDUFINDER_KNOWLEDGE,
  AI_WRITER_KNOWLEDGE,
  getLanguageInstruction,
} from '@/lib/learnovaKnowledge';
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

    const parsed = sanitizeJsonPostBody(rawBody, [
      'message',
      'messages',
      'mode',
      'toneMode',
      'language',
      'depthLevel',
      'conversationId',
      'persona',
    ]);
    if (!parsed.ok) return parsed.response;

    const body = parsed.body;

    // SECURITY: Sanitize user input to prevent XSS and injection attacks
    // OWASP Reference: A03:2021 Injection
    const message = sanitizeString(body.message, 20000);
    let messagesArray = sanitizeMessages(body.messages);
    const toneMode = sanitizeString(body.toneMode, 64);
    const mode = sanitizeString(body.mode, 64);
    const language = validateLanguage(body.language);
    const persona = sanitizeString(body.persona, 32);

    let latestUserMessage = '';

    if (messagesArray.length > 0) {
      const userMessages = messagesArray.filter((m) => m.role === 'user');
      latestUserMessage = userMessages[userMessages.length - 1]?.content || '';
    } else if (message) {
      messagesArray = [{ role: 'user', content: message }];
      latestUserMessage = message;
    } else {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkAndIncrementUsage(session.user.id, 'chat', ipAddress);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(buildBlockedResponse(rateLimitResult), { status: 429 });
    }
    const responseHeaders = buildRateLimitHeaders(rateLimitResult);

    // Intelligent web search via getSearchContext
    const searchContext = await getSearchContext(
      latestUserMessage,
      'chat'
    );
    const usedWebSearch = !!searchContext;
    const searchUsageInstruction = buildSearchUsageInstruction(searchContext);

    const { data: userPrefs } = await supabase
      .from('UserPreferences')
      .select('*')
      .eq('userId', session.user.id)
      .single();

    // Build system prompt with optional web search data
    const basePrompt = getBasePrompt(
      toneMode || mode || userPrefs?.toneMode || 'class',
      language || userPrefs?.language || 'english'
    );

    // Language detection from actual message content
    const languageInstruction = getLanguageInstruction(latestUserMessage);

    // Add persona-specific system prompt
    let systemPrompt = basePrompt;
    
    if (persona === 'student') {
      systemPrompt = `${LEARNOVA_FULL_CONTEXT}
${STUDENT_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

You are Thinkior, an AI tutor built specifically for Indian students. You explain concepts in simple English using Indian curriculum (CBSE, NCERT, JEE, NEET). Show step-by-step solutions. Use Indian examples and context. Be encouraging and patient.

${basePrompt}`;
    } else if (persona === 'founder') {
      systemPrompt = `${LEARNOVA_FULL_CONTEXT}
${FOUNDER_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

You are Thinkior, an AI business advisor for Indian entrepreneurs. You understand Indian market conditions, GST, MSME policies, UPI, Tier 2/3 city challenges. Give practical, honest, actionable advice in Indian context.

${basePrompt}`; 
    } else {
      systemPrompt = `${LEARNOVA_FULL_CONTEXT}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

${basePrompt}`;
    }

    // Append live search context + usage instructions to the enriched system prompt
    if (searchContext) {
      systemPrompt = `${systemPrompt}

${searchContext}

${searchUsageInstruction}`;
    } else {
      systemPrompt = `${systemPrompt}

${searchUsageInstruction}`;
    }

    const responseText = await chatWithHistory(messagesArray, systemPrompt);

    // Return response with metadata
    return NextResponse.json({
      message: responseText, 
      role: 'assistant',
      metadata: {
        usedWebSearch,
        searchResultsCount: usedWebSearch ? searchContext.split('\n\n').length : 0,
      }
    }, { headers: responseHeaders });
  } catch (error: any) {
    console.error('âŒ Chat Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to process your message. Please try again.' }, { status: 500 });
  }
}
