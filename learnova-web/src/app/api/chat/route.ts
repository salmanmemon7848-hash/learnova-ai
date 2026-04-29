import { chatWithHistory } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { getBasePrompt } from '@/lib/prompts/basePrompt';
import { shouldSearch, searchWeb, formatSearchResults } from '@/lib/webSearch';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

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

    // Intelligent web search decision
    let webSearchResults = '';
    let usedWebSearch = false;

    if (latestUserMessage && shouldSearch(latestUserMessage)) {
      console.log('\n🔍 ═══════════════════════════════════════');
      console.log('🔍 Intelligent Search: TRIGGERED');
      console.log('📝 Query:', latestUserMessage);
      console.log('🔍 ═══════════════════════════════════════\n');
      
      // Perform web search
      const results = await searchWeb(latestUserMessage);
      
      if (results.length > 0) {
        webSearchResults = formatSearchResults(results);
        usedWebSearch = true;
        console.log(`\n✅ Web Search: SUCCESS - Found ${results.length} results`);
        console.log('📊 First result:', results[0]?.title);
        console.log('🔗 First URL:', results[0]?.url, '\n');
      } else {
        console.log('\n⚠️ Web Search: No results returned\n');
      }
    } else {
      console.log('\nℹ️ Intelligent Search: SKIPPED (using AI knowledge only)\n');
    }

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

    // Add persona-specific system prompt
    let systemPrompt = basePrompt;
    
    if (persona === 'student') {
      systemPrompt = `You are Learnova, an AI tutor built specifically for Indian students. You explain concepts in simple English using Indian curriculum (CBSE, NCERT, JEE, NEET). Show step-by-step solutions. Use Indian examples and context. Be encouraging and patient.

${basePrompt}`;
    } else if (persona === 'founder') {
      systemPrompt = `You are Learnova, an AI business advisor for Indian entrepreneurs. You understand Indian market conditions, GST, MSME policies, UPI, Tier 2/3 city challenges. Give practical, honest, actionable advice in Indian context.

${basePrompt}`;
    }

    // Add web search context if available
    if (usedWebSearch && webSearchResults) {
      systemPrompt = `${basePrompt}

## ⚠️ CRITICAL INSTRUCTION - READ CAREFULLY:
You currently have REAL-TIME web search data below. This is LIVE, CURRENT information from the internet.

**YOU MUST USE THIS DATA TO ANSWER THE USER'S QUESTION.**

**DO NOT say:**
- "I don't have access to real-time information"
- "I can't browse the internet"
- "I don't have access to current news"
- "As an AI, I don't have real-time data"
- "I recommend checking news websites"

**YOU MUST:**
- Use the web search results below to provide CURRENT, SPECIFIC answers
- Mention actual news headlines, dates, and details from the search results
- Sound informed and up-to-date
- Cite sources when using web data (mention URLs or source names)
- If the user asks about "today" or "current affairs", use the ACTUAL current information from the web search

## REAL-TIME WEB SEARCH DATA (CURRENT & UP-TO-DATE):
${webSearchResults}

## HOW TO USE THIS DATA:
1. The web data above is CURRENT and REAL-TIME
2. Answer the user's question using SPECIFIC details from this data
3. If asked about current affairs/news, list the ACTUAL headlines from the search results
4. Be confident - you HAVE the information, just use it
5. Provide dates, names, and specific details from the web search
6. If web data conflicts with your training data, PREFER the web data (it's more recent)
`;
    }

    const responseText = await chatWithHistory(messagesArray, systemPrompt);

    // Return response with metadata
    return NextResponse.json({ 
      message: responseText, 
      role: 'assistant',
      metadata: {
        usedWebSearch,
        searchResultsCount: usedWebSearch ? webSearchResults.split('\n\n').length : 0,
      }
    });
  } catch (error: any) {
    console.error('❌ Chat Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to process your message. Please try again.' }, { status: 500 });
  }
}
