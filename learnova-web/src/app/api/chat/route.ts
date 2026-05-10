import { aiHandler, aiVisionHandler, messagesToPrompt, type AIChatMessage } from '@/lib/ai/aiHandler';
import { createClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { checkAndIncrementUsage, buildBlockedResponse, buildRateLimitHeaders } from '@/lib/rateLimit';
import { getBasePrompt } from '@/lib/prompts/basePrompt';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import { NextRequest, NextResponse } from 'next/server';
import {
  THINKIOR_FULL_CONTEXT,
  STUDENT_KNOWLEDGE,
  FOUNDER_KNOWLEDGE,
  CAREER_GUIDE_KNOWLEDGE,
  EDUFINDER_KNOWLEDGE,
  getLanguageInstruction,
} from '@/lib/thinkiorKnowledge';
import { sanitizeMessages, sanitizeString, validateLanguage } from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');
    
    let body: any = {};
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
    const rateLimitResult = await checkAndIncrementUsage(session.user.id, 'chat', ipAddress);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(buildBlockedResponse(rateLimitResult), { status: 429 });
    }
    const responseHeaders = buildRateLimitHeaders(rateLimitResult);

    // Intelligent web search via getSearchContext
    const searchContext = await getSearchContext(
      latestUserMessage || (imageFile ? 'Please analyze this image' : ''),
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
    const languageInstruction = getLanguageInstruction(latestUserMessage || 'english');

    // Add persona-specific system prompt
    let systemPrompt = basePrompt;
    
    if (persona === 'student') {
      systemPrompt = `${THINKIOR_FULL_CONTEXT}
${STUDENT_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

You are Thinkior, an AI tutor built specifically for Indian students. You explain concepts in simple English using Indian curriculum (CBSE, NCERT, JEE, NEET). Show step-by-step solutions. Use Indian examples and context. Be encouraging and patient.

${basePrompt}`;
    } else if (persona === 'founder') {
      systemPrompt = `${THINKIOR_FULL_CONTEXT}
${FOUNDER_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

You are Thinkior, an AI business advisor for Indian entrepreneurs. You understand Indian market conditions, GST, MSME policies, UPI, Tier 2/3 city challenges. Give practical, honest, actionable advice in Indian context.

${basePrompt}`; 
    } else {
      systemPrompt = `${THINKIOR_FULL_CONTEXT}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

${basePrompt}`;
    }

    // Append live search context + usage instructions to the enriched system prompt
    if (searchContext) {
      systemPrompt = `${systemPrompt}\n\n${searchContext}\n\n${searchUsageInstruction}`;
    } else {
      systemPrompt = `${systemPrompt}\n\n${searchUsageInstruction}`;
    }

    let responseText = '';

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
      
      const visionResponse = await aiVisionHandler({
        prompt: visionPrompt,
        imageBase64: base64Image,
        mimeType: imageFile.type,
        featureName: 'chat-image',
        taskComplexity: 'complex',
      });
      responseText = visionResponse.result;
    } else {
      const aiMessages: AIChatMessage[] = messagesArray
        .filter((message) => message.role === 'user' || message.role === 'assistant')
        .map((message) => ({
          role: message.role === 'assistant' ? 'assistant' : 'user',
          content: message.content,
        }));
      const aiResponse = await aiHandler({
        prompt: messagesToPrompt(aiMessages),
        context: systemPrompt,
        featureName: 'ai-chat',
        isSearchFeature: false,
        taskComplexity: 'simple',
      });
      responseText = aiResponse.result;
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
      role: 'assistant',
      metadata: {
        usedWebSearch,
        searchResultsCount: usedWebSearch ? searchContext.split('\n\n').length : 0,
      }
    }, { headers: responseHeaders });
  } catch (error: any) {
    console.error('❌ Chat Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to process your message. Please try again.' }, { status: 500 });
  }
}
