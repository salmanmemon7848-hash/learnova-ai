import { createClient } from '@/lib/supabase/server';
import { runGeneralChat } from '@/lib/generalChatAI';
import { analyzeImageWithGemini } from '@/lib/gemini-vision';
import { sanitizeString, sanitizeMessages, checkBodySize } from '@/lib/validation';
import { NextRequest, NextResponse } from 'next/server';
import { checkAndTrackUsage, checkPowerfulModeLimit, checkImageLimit, buildUsageBlockedResponse } from '@/lib/usageTracker';
import type { AIMessage } from '@/lib/generalChatAI';


export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type') || '';
    const isImageRequest = contentType.includes('multipart/form-data');

    let body: any = {};
    let imageFile: File | null = null;
    let sessionId: string | null = null;

    if (isImageRequest) {
      let formData: FormData;
      try {
        formData = await req.formData();
      } catch {
        return NextResponse.json({ error: 'Failed to read form data' }, { status: 400 });
      }
      imageFile = formData.get('image') as File | null;
      body.message = formData.get('message') as string || '';
      sessionId = formData.get('sessionId') as string || null;
      
      if (!imageFile) {
        return NextResponse.json({ error: 'No image provided' }, { status: 400 });
      }

      // Use a local constant to help TypeScript narrowing
      const currentImageFile = imageFile;
      
      // Check image limit
      const imageCheck = await checkImageLimit(session.user.id);
      if (!imageCheck.allowed) {
        return NextResponse.json({
          error: 'image_limit_reached',
          message: imageCheck.message,
        }, { status: 429 });
      }
      
      // Support all image types
      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png',
        'image/webp', 'image/gif', 'image/bmp',
        'image/tiff', 'image/svg+xml',
      ];
    
      const geminiSupportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const mimeType = geminiSupportedTypes.includes(currentImageFile.type)
        ? currentImageFile.type
        : 'image/jpeg';
    
      if (!allowedTypes.some(t => currentImageFile.type.startsWith('image/'))) {
        return NextResponse.json({
          error: 'Please upload an image file (JPG, PNG, WebP, or GIF).'
        }, { status: 400 });
      }

      if (imageFile.size > 4 * 1024 * 1024) {
        return NextResponse.json({ error: 'Image too large. Please use an image under 4MB.' }, { status: 413 });
      }

    } else {
      let rawBody: unknown = {};
      try {
        rawBody = await req.json();
      } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
      }

      if (!checkBodySize(rawBody, 100000)) {
        return NextResponse.json({ error: 'Request too large' }, { status: 413 });
      }

      body = rawBody && typeof rawBody === 'object' ? rawBody as Record<string, unknown> : {};
      sessionId = typeof body.sessionId === 'string' ? sanitizeString(body.sessionId, 36) : null;
    }

    const messages = sanitizeMessages(body.messages || [])
      .filter((message) => message.role === 'user' || message.role === 'assistant');
    
    if (isImageRequest) {
      messages.push({ role: 'user', content: body.message });
    }

    if (!messages || messages.length === 0) {
      return NextResponse.json({ error: 'No messages provided' }, { status: 400 });
    }

    const isPowerfulMode = body.powerfulMode === true;
    if (isPowerfulMode && !isImageRequest) {
      const powerfulCheck = await checkPowerfulModeLimit(session.user.id);
      if (!powerfulCheck.allowed) {
        return NextResponse.json({
          error: 'powerful_mode_limit',
          message: powerfulCheck.message,
        }, { status: 429 });
      }
    }

    const usageResult = await checkAndTrackUsage(session.user.id, 'general-chat');
    if (!usageResult.allowed) {
      return NextResponse.json({
        success: false,
        error: usageResult.reason === 'locked' ? 'feature_locked' : 'rate_limit_exceeded',
        message: usageResult.message,
      }, { status: usageResult.reason === 'locked' ? 403 : 429 });
    }

    const lastUserMessage = messages.filter((message) => message.role === 'user').at(-1)?.content || '';

    const systemPrompt = `You are Thinkior — an intelligent AI assistant built for Indian students and founders.

For STUDENTS you help with:
- Explaining complex concepts in simple language
- Homework, essays, research, and study plans
- Career advice, internships, and skill building
- Exam preparation and learning strategies

For FOUNDERS you help with:
- Startup ideas, validation, and business models
- Pitch decks, investor questions, and fundraising
- Marketing, growth strategies, and GTM planning
- Product thinking, MVPs, and roadmaps
- Financial basics and unit economics

Your personality:
- Warm, clear, and direct — like a knowledgeable friend
- Use simple language unless the user asks for technical depth
- Give complete, actionable advice. Avoid fluff.
- Use Indian context naturally — ₹ for currency, Indian examples where relevant
- Respond in the same language the user writes in (English, Hindi, or Hinglish)
- Be the smartest friend they have.

Rules:
- Never refuse to answer general knowledge questions
- For conversational replies, write naturally — not in bullet points
- Use bullet points only when listing multiple items that genuinely benefit from a list
- Keep responses focused — no unnecessary padding
- For math or code, show your work clearly
- If web search results are provided, use them to give current and accurate answers`;

    let aiReply = '';
    let aiProvider = '';

    if (isImageRequest && imageFile) {
      const buffer = Buffer.from(await imageFile.arrayBuffer());
      aiReply = await analyzeImageWithGemini({
        imageBuffer: buffer,
        imageMimeType: imageFile.type,
        userQuestion: body.message || 'What do you see in this image? Describe and analyze it.',
      });
      aiProvider = 'gemini-vision';
    } else {
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
      aiReply = aiResult.text;
      aiProvider = aiResult.provider;
    }

    console.log(`[GeneralChat] Provider: ${aiProvider}`);

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
      const cleaned = lastUserMessage.replace(/[^\w\s\u0900-\u097F\u0980-\u09FF]/g, ' ').trim();
      const title = cleaned.length <= 45 ? cleaned : (cleaned.slice(0, 45).lastIndexOf(' ') > 20 ? cleaned.slice(0, cleaned.slice(0, 45).lastIndexOf(' ')) : cleaned.slice(0, 45)) + '...';

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
          content: aiReply,
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
      reply: aiReply,
      sessionId: currentSessionId,
      provider: aiProvider,
      remaining: usageResult.remaining,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[GeneralChat] Fatal error:', message);
    return NextResponse.json({ 
      success: false,
      error: 'service_unavailable',
      message: 'The AI service is currently unavailable. Please try again later.' 
    }, { status: 500 });
  }
}
