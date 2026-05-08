import { generateText } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage, buildBlockedResponse, buildRateLimitHeaders } from '@/lib/rateLimit';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { NextRequest, NextResponse } from 'next/server';
import {
  THINKIOR_FULL_CONTEXT,
  STUDENT_KNOWLEDGE,
  getLanguageInstruction,
} from '@/lib/thinkiorKnowledge';
import {
  sanitizeEnum,
  sanitizeJsonPostBody,
  sanitizeString,
} from '@/lib/validation';

// ── Level-specific instructions ───────────────────────────────────────────────
const levelInstructions: Record<string, string> = {
  auto: `First detect the complexity of the question. If it seems like a basic school question, explain simply. If it seems like a competitive exam question, go deep with theory and edge cases. Mention which level you detected at the start.`,
  basic: `The student is in Class 6–8. Use very simple language. Avoid jargon. Use relatable real-world Indian examples like cricket, chai, rickshaw, school. Keep sentences short.`,
  medium: `The student is in Class 9–12. Use correct technical terms but explain them. Connect concepts to CBSE/ICSE syllabus. Use examples from daily Indian life and board exam patterns.`,
  advanced: `The student is preparing for JEE/NEET/UPSC/CAT. Give deep theoretical understanding. Include edge cases, exceptions, and common exam traps. Reference standard books where relevant (HC Verma, NCERT, RD Sharma).`,
};

function buildSystemPrompt(level: string, languageInstruction: string): string {
  const instruction = levelInstructions[level] ?? levelInstructions['auto'];

  return `${THINKIOR_FULL_CONTEXT}
${STUDENT_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

You are Thinkior's AI Doubt Solver — a world-class Indian tutor who explains concepts like a real teacher, not a search engine.

Level context: ${instruction}

CRITICAL: You must ALWAYS respond in this EXACT JSON structure — no extra text, no markdown outside the JSON:

{
  "concept_in_one_line": "string — explain the core concept in one simple sentence",
  "detected_level": "string — Basic / Medium / Advanced",
  "step_by_step": [
    { "step": 1, "title": "string", "explanation": "string" },
    { "step": 2, "title": "string", "explanation": "string" },
    { "step": 3, "title": "string", "explanation": "string" }
  ],
  "simple_example": {
    "title": "string",
    "example": "string — use an Indian real-world example"
  },
  "medium_example": {
    "title": "string",
    "example": "string — slightly more complex, textbook-style"
  },
  "advanced_example": {
    "title": "string",
    "example": "string — exam-level application"
  },
  "why_it_works": "string — explain the reasoning and logic behind the answer, not just the answer",
  "common_mistakes": ["string", "string"],
  "memory_trick": "string — a short mnemonic or trick to remember this concept",
  "exam_tip": "string — one specific tip for CBSE/JEE/NEET students",
  "related_topics": ["string", "string", "string"]
}

Rules:
- Always use ₹, Indian city names, Indian context in examples
- Never write bullet points or markdown outside the JSON
- Never give a one-line answer — always give full structured response
- If web search results are provided, use them to make examples current and accurate
- The step_by_step array must always have at least 3 steps
- Never skip advanced_example even for basic questions — scale it appropriately`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkAndIncrementUsage(session.user.id, 'doubt-solver', ipAddress);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(buildBlockedResponse(rateLimitResult), { status: 429 });
    }
    const responseHeaders = buildRateLimitHeaders(rateLimitResult);
    const userId = session.user.id;

    const contentType = req.headers.get('content-type') || '';
    const isMultipart = contentType.includes('multipart/form-data');

    if (isMultipart) {
      let formData: FormData;
      try {
        formData = await req.formData();
      } catch {
        return NextResponse.json({ error: 'Failed to read image data' }, { status: 400 });
      }
      const imageFile = formData.get('image') as File | null;
      const question = sanitizeString(formData.get('question'), 500);
      const subject = sanitizeString(formData.get('subject'), 100);

      if (!imageFile) {
        return NextResponse.json({ error: 'No image file received' }, { status: 400 });
      }

      const maxImageSize = 4 * 1024 * 1024;
      if (imageFile.size > maxImageSize) {
        return NextResponse.json({ error: 'Image is too large. Please use an image under 4MB or compress it first.' }, { status: 413 });
      }

      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(imageFile.type)) {
        return NextResponse.json({ error: 'Invalid file type. Please upload a JPG, PNG, or WebP image.' }, { status: 400 });
      }

      const googleApiKey = process.env.GOOGLE_AI_API_KEY || process.env.GOOGLE_AI_STUDIO_API_KEY;
      if (!googleApiKey) {
        return NextResponse.json({ error: 'Image analysis not configured' }, { status: 500 });
      }

      const imageBytes = await imageFile.arrayBuffer();
      const base64Image = Buffer.from(imageBytes).toString('base64');
      const mimeType = imageFile.type;

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${googleApiKey}`;

      const prompt = `You are Thinkior's AI Doubt Solver — a world-class tutor for Indian students preparing for CBSE, JEE, NEET, and other exams.

Subject context: ${subject || 'Auto-detect from image'}
Student question: ${question || 'Please analyze this image and solve or explain whatever is shown.'}

Look at this image carefully. It may contain a math problem, science diagram, question from a textbook, handwritten notes, or any academic content.

Provide a complete response with:
1. **What I see:** Describe exactly what academic content is in the image
2. **Step-by-step solution:** Solve or explain with clear numbered steps
3. **Key concept:** The underlying concept or formula being tested
4. **Why it works:** The reasoning behind the solution
5. **Exam tip:** A specific tip for CBSE/JEE/NEET students on this topic

Use clear Indian English. Reference NCERT where relevant. Give examples from Indian context.`;

      const geminiBody = {
        contents: [
          {
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image,
                },
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.3,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      };

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(geminiBody),
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        console.error('[DoubtSolver Image] Gemini error:', geminiRes.status, errText.slice(0, 200));
        return NextResponse.json({ error: 'Could not analyze image. Please try again.' }, { status: 500 });
      }

      const geminiData = await geminiRes.json();
      const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!responseText) {
        return NextResponse.json({ error: 'No response from AI. Please try again.' }, { status: 500 });
      }

      try {
        await supabase.from('doubt_history').insert({
          user_id: session.user.id,
          subject: subject || 'Image',
          question: question || 'Image upload',
          answer: responseText,
        });
        await supabase.from('activity_log').insert({
          user_id: session.user.id,
          activity_type: 'doubt',
          title: `Image doubt — ${subject || 'General'}`,
          metadata: { subject, hasImage: true },
        });
        console.log('[DoubtSolver] Fixed: image doubts are saved and routed through Gemini Vision');
      } catch (logErr) {
        console.warn('[DoubtSolver] Supabase log failed:', logErr);
      }

      return NextResponse.json({ answer: responseText, provider: 'gemini-vision' }, { headers: responseHeaders });
    }

    let rawBody: unknown = {};
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = sanitizeJsonPostBody(rawBody, [
      'question',
      'questionText',
      'subject',
      'imageUrl',
      'level',
      'language',
      'messages',
    ]);
    if (!parsed.ok) return parsed.response;

    const body = parsed.body;

    // SECURITY: Sanitize user input to prevent XSS and injection attacks
    // OWASP Reference: A03:2021 Injection
    const question = sanitizeString(body.question, 500);
    const questionText = sanitizeString(body.questionText, 500);
    const userSubject = sanitizeString(body.subject, 100);
    const level = sanitizeEnum(body.level, ['auto', 'basic', 'medium', 'advanced'], 'auto');

    const userQuestion = (question || questionText || '').trim();

    // ── Language detection ─────────────────────────────────────────────────────
    const languageInstruction = getLanguageInstruction(userQuestion);

    const baseSystemPrompt = buildSystemPrompt(level, languageInstruction);

    // Fetch live web context for this question
    const searchContext = await getSearchContext(userQuestion, 'doubt-solver', { subject: userSubject });
    const searchUsageInstruction = buildSearchUsageInstruction(searchContext);

    const finalSystemPrompt = searchContext
      ? `${baseSystemPrompt}\n\n${searchContext}\n\n${searchUsageInstruction}`
      : `${baseSystemPrompt}\n\n${searchUsageInstruction}`;

    if (!userQuestion) {
      return NextResponse.json({ solution: 'Please type your question clearly and I will help you.' });
    }

    const prompt = userSubject
      ? `[Subject: ${userSubject}] ${userQuestion}`
      : userQuestion;

    const solution = await generateText(prompt, finalSystemPrompt);

    // ── Save to Supabase (non-blocking) ───────────────────────────────────────
    try {
      await supabase.from('doubt_history').insert({
        user_id: userId,
        subject: userSubject || null,
        question: userQuestion,
        answer: solution,
      });

      await logActivity(
        supabase,
        userId,
        'doubt',
        `Asked: ${userQuestion.slice(0, 60)}${userQuestion.length > 60 ? '...' : ''}`,
        { subject: userSubject }
      );
    } catch (saveErr) {
      console.warn('[Doubt Solver] Failed to save to Supabase:', saveErr);
    }

    return NextResponse.json({ solution }, { headers: responseHeaders });
  } catch (error: unknown) {
    console.error('❌ Doubt Solver Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to solve doubt.' }, { status: 500 });
  }
}
