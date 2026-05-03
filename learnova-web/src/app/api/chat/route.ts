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

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkAndIncrementUsage(session.user.id, 'chat', ipAddress);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(buildBlockedResponse(rateLimitResult), { status: 429 });
    }
    const responseHeaders = buildRateLimitHeaders(rateLimitResult);

    const body = await req.json();
    const { message, messages, mode, toneMode, language, depthLevel, conversationId, persona } = body;
    
    // Support both single message and messages array format
    let messagesArray: { role: string; content: string }[] = [];
    let latestUserMessage = '';
    
    if (messages && Array.isArray(messages)) {
      // Already in array format
      messagesArray = messages;
      // Get the latest user message for search decision
      const userMessages = messages.filter((m: any) => m.role === 'user');
      latestUserMessage = userMessages[userMessages.length - 1]?.content || '';
    } else if (message) {
      // Convert single message to array format
      messagesArray = [{ role: 'user', content: message }];
      latestUserMessage = message;
    } else {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

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

You are Learnova, an AI tutor built specifically for Indian students. You explain concepts in simple English using Indian curriculum (CBSE, NCERT, JEE, NEET). Show step-by-step solutions. Use Indian examples and context. Be encouraging and patient.

${basePrompt}`;
    } else if (persona === 'founder') {
      systemPrompt = `${LEARNOVA_FULL_CONTEXT}
${FOUNDER_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

You are Learnova, an AI business advisor for Indian entrepreneurs. You understand Indian market conditions, GST, MSME policies, UPI, Tier 2/3 city challenges. Give practical, honest, actionable advice in Indian context.

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
