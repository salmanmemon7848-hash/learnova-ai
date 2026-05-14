import { aiHandler, aiVisionHandler, messagesToPrompt, type AIChatMessage } from '@/lib/ai/aiHandler';
import { createClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { checkAndTrackUsage, buildUsageBlockedResponse } from '@/lib/usageTracker';
import { getBasePrompt } from '@/lib/prompts/basePrompt';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import { runPowerMode } from '@/lib/powerMode';
import { NextRequest, NextResponse } from 'next/server';
import {
  THINKIOR_FULL_CONTEXT,
  STUDENT_KNOWLEDGE,
  FOUNDER_KNOWLEDGE,
  getLanguageInstruction,
} from '@/lib/thinkiorKnowledge';
import { sanitizeMessages, sanitizeString, validateLanguage } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');
    
    let body: Record<string, unknown> = {};
    let imageFile: File | null = null;

    if (isMultipart) {
      let formData: FormData;
      try {
        formData = await req.formData();
      } catch {
        return NextResponse.json({ error: 'Failed to read form data' }, { status: 400 });
      }
      body.message = formData.get('message') || '';
      body.messages = formData.get('messages') ? JSON.parse(formData.get('messages') as string) : [];
      body.mode = formData.get('mode') || '';
      body.toneMode = formData.get('toneMode') || '';
      body.language = formData.get('language') || '';
      body.depthLevel = formData.get('depthLevel') || '';
      body.conversationId = formData.get('conversationId') || '';
      body.persona = formData.get('persona') || '';
      imageFile = formData.get('image') as File | null;
    } else {
      try {
        body = await req.json();
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
      }
    }

    // SECURITY: Sanitize user input to prevent XSS and injection attacks
    const message = sanitizeString(body.message, 20000);
    let messagesArray = sanitizeMessages(body.messages || []);
    const toneMode = sanitizeString(body.toneMode, 64);
    const mode = sanitizeString(body.mode, 64);
    const language = validateLanguage(body.language);
    const persona = sanitizeString(body.persona, 32);
    const powerMode = !isMultipart && body.powerMode === true;

    let latestUserMessage = '';

    if (messagesArray.length > 0) {
      const userMessages = messagesArray.filter((m) => m.role === 'user');
      latestUserMessage = userMessages[userMessages.length - 1]?.content || '';
    } else if (message) {
      messagesArray = [{ role: 'user', content: message }];
      latestUserMessage = message;
    } else if (!imageFile) {
      return NextResponse.json({ error: 'No messages or image provided' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const usageResult = await checkAndTrackUsage(session.user.id, 'chat');
    if (!usageResult.allowed) {
      return NextResponse.json(
        buildUsageBlockedResponse(usageResult),
        { status: usageResult.reason === 'locked' ? 403 : 429 }
      );
    }

// Intelligent web search via getSearchContext with graceful fallback
let searchContext = '';
let usedWebSearch = false;
let searchUsageInstruction = '';

const isPowerMode = !isMultipart && body.powerMode === true;

try {
  if (isPowerMode) {
    // Upgrade 2: Always trigger SearXNG in Powerful Mode
    const searxRes = await fetch(
      `${process.env.SEARXNG_URL}/search?q=${encodeURIComponent(latestUserMessage)}&format=json&categories=general`,
      { headers: { 'Accept': 'application/json' } }
    );
    const searxData = await searxRes.json();
    const topResults = (searxData.results || []).slice(0, 5).map((r: any) => ({
      title: r.title,
      url: r.url,
      snippet: r.content
    }));
    
    searchContext = `[WEB CONTEXT — Live Search Results]\n${topResults.map((r: any, i: number) => `[${i+1}] ${r.title}\nURL: ${r.url}\n${r.snippet}`).join('\n\n')}`;
    usedWebSearch = true;
  } else {
    const sc = await getSearchContext(
      latestUserMessage || (imageFile ? 'Please analyze this image' : ''),
      'chat'
    );
    searchContext = sc ?? '';
    usedWebSearch = !!searchContext;
  }

  if (searchContext) {
    searchUsageInstruction = buildSearchUsageInstruction(searchContext);
  }
} catch (err) {
  console.error('Search Context Error:', err);
  // Keep defaults (no search context)
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

    // Language detection from actual message content
    const languageInstruction = getLanguageInstruction(latestUserMessage || 'english');

    // Add persona-specific system prompt
    let systemPrompt = basePrompt;

    if (isPowerMode) {
      // Upgrade 2: Structured context for Powerful Mode
      systemPrompt = searchContext ? `${searchContext}\n\n${latestUserMessage}` : latestUserMessage;
    } else {
      if (persona === 'student') {
        systemPrompt = `${THINKIOR_FULL_CONTEXT}\n${STUDENT_KNOWLEDGE}\n\nLANGUAGE FOR THIS RESPONSE: ${languageInstruction}\n\n${basePrompt}`;
      } else if (persona === 'founder') {
        systemPrompt = `${THINKIOR_FULL_CONTEXT}\n${FOUNDER_KNOWLEDGE}\n\nLANGUAGE FOR THIS RESPONSE: ${languageInstruction}\n\n${basePrompt}`;
      } else {
        systemPrompt = `${THINKIOR_FULL_CONTEXT}\n\nLANGUAGE FOR THIS RESPONSE: ${languageInstruction}\n\n${basePrompt}`;
      }

      // Append live search context + usage instructions to the enriched system prompt
      if (searchContext) {
        systemPrompt = `${systemPrompt}\n\n${searchContext}\n\n${searchUsageInstruction}`;
      } else {
        systemPrompt = `${systemPrompt}\n\n${searchUsageInstruction}`;
      }
    }

    let responseText = '';
    let powerModeResult: Awaited<ReturnType<typeof runPowerMode>> | null = null;

    if (imageFile) {
      const maxImageSize = 10 * 1024 * 1024;
      if (imageFile.size > maxImageSize) {
        return NextResponse.json({ error: 'Please upload an image under 10MB.' }, { status: 413 });
      }
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json({ error: 'Invalid file type. Please upload a JPG, PNG, WebP, or GIF image.' }, { status: 400 });
      }

      const imageBytes = await imageFile.arrayBuffer();
      const base64Image = Buffer.from(imageBytes).toString('base64');
      
      const visionPrompt = `${systemPrompt}\n\nUser request: ${latestUserMessage || 'Please analyze this image and help me understand it.'}`;
      
      let visionResponse;
      try {
        visionResponse = await aiVisionHandler({
          prompt: visionPrompt,
          imageBase64: base64Image,
          mimeType: imageFile.type,
          featureName: 'chat-image',
          taskComplexity: 'complex',
        });
        responseText = visionResponse.result;
      } catch (err) {
        console.error('Vision AI Error:', err);
        // Fallback generic response when provider fails
        responseText = 'Sorry, the image analysis service is currently unavailable. Please try again later.';
      }
    } else {
      const aiMessages: AIChatMessage[] = messagesArray
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .map((message) => ({
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: message.content,
        }));

      if (powerMode) {
        powerModeResult = await runPowerMode(
          systemPrompt,
          // onStatusUpdate is not easily handled in a standard POST response
          // unless we use streaming. For now, we'll just log it.
          (status) => console.log(`[PowerMode Status] ${status}`)
        );
        responseText = powerModeResult.final;
      } else {
        let aiResponse;
        try {
          aiResponse = await aiHandler({
            prompt: messagesToPrompt(aiMessages),
            context: systemPrompt,
            featureName: 'ai-chat',
            isSearchFeature: false,
            taskComplexity: 'simple',
          });
          responseText = aiResponse.result;
        } catch (err) {
          console.error('Chat AI Error:', err);
          responseText = 'Sorry, the chat service is currently unavailable. Please try again later.';
        }
      }
    }

    await logActivity(
      supabase,
      session.user.id,
      'chat',
      `Chat: ${latestUserMessage.slice(0, 60)}${latestUserMessage.length > 60 ? '...' : ''}`,
      { persona: persona || 'default' }
    );

    return NextResponse.json({
      message: responseText,
      content: responseText,
      role: 'assistant',
      mode: powerModeResult ? 'power' : (mode || 'normal'),
      metadata: {
        usedWebSearch,
        searchResultsCount: usedWebSearch ? searchContext.split('\n\n').length : 0,
        persona: persona || 'default',
        isPowerMode: !!powerMode,
        ...(powerModeResult ? {
          provider: powerModeResult.provider,
          durationMs: powerModeResult.durationMs,
        } : {}),
      }
    }, { });
  } catch (error: unknown) {
    console.error('Chat Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to process your message. Please try again.' }, { status: 500 });
  }
}
