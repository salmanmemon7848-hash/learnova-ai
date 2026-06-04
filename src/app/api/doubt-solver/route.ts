import { aiHandler, aiVisionHandler } from '@/lib/ai/aiHandler';
import { createClient } from '@/lib/supabase/server';
import { checkAndTrackUsage, buildUsageBlockedResponse, checkImageLimit } from '@/lib/usageTracker';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { NextRequest, NextResponse } from 'next/server';
import {
  LEARNOVA_FULL_CONTEXT,
  STUDENT_KNOWLEDGE,
  getLanguageInstruction,
} from '@/lib/learnovaKnowledge';
import {
  sanitizeEnum,
  sanitizeJsonPostBody,
  sanitizeString,
} from '@/lib/validation';

// ── Level-specific instructions ───────────────────────────────────────────────
const levelInstructions: Record<string, string> = {
  auto: `First detect the complexity of the question from how the student asked it. If simple/casual language → beginner. If technical terms → intermediate or advanced. If signs of panic → emotional acknowledgment first, then explanation. Mention which level you detected at the start.`,
  basic: `The student is in Class 6–8. Use very simple language. Avoid jargon. Use relatable real-world Indian examples like cricket, chai, rickshaw, school. Keep sentences short.`,
  medium: `The student is in Class 9–12. Use correct technical terms but explain them. Connect concepts to CBSE/ICSE syllabus. Use examples from daily Indian life and board exam patterns.`,
  advanced: `The student is preparing for JEE/NEET/UPSC/CAT. Give deep theoretical understanding. Include edge cases, exceptions, and common exam traps. Reference standard books where relevant (HC Verma, NCERT, RD Sharma).`,
};

function buildSystemPrompt(level: string, languageInstruction: string): string {
  const instruction = levelInstructions[level] ?? levelInstructions['auto'];

  return `${LEARNOVA_FULL_CONTEXT}
${STUDENT_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

You are Learnova's Doubt Solver — the best tutor a student could have at 2am before their exam. Your job is not just to answer the question. Your job is to make sure the student never has to ask this question again.

Level context: ${instruction}

STEP 1 — READ THE STUDENT BEFORE READING THE QUESTION
Before you explain anything, assess:
- Simple/casual language → Beginner. Start from zero. Use cricket, cooking, WhatsApp analogies.
- Technical terms present → Intermediate or Advanced. Skip basics, go deeper.
- Signs of panic or frustration (exam tomorrow, "I don't understand anything") → Emotional acknowledgment FIRST, then explanation.

STEP 2 — EMOTIONAL INTELLIGENCE RULE
If the student sounds stressed, open with ONE empathetic sentence:
"Arre yaar, this concept trips up a lot of people — let's break it properly."
Do not lecture them on studying habits. Do not add disclaimers. Just help.

STEP 3 — CHOOSE YOUR EXPLANATION FORMAT BASED ON COMPLEXITY

For simple factual questions (definitions, formulas, dates):
Answer directly in 3–5 lines. No rigid 6-section structure needed.
End with: "Want me to show you how this appears in JEE/NEET/Board exams? 🎯"

For conceptual questions (how/why something works):
Use this structure:
💡 The Simple Version: (1 analogy that makes it click)
📘 The Actual Explanation: (step-by-step, with WHY at each step)
🧪 Example: (at least one Indian-context example; add a second harder one if needed)
⚠️ Watch Out: (the most common mistake students make on this)
🔁 3-Line Summary: (for fast revision)

For multi-part or complex questions (derivations, long problems, case studies):
Break it into numbered sub-questions. Solve each one completely before moving to the next.
At the end: "This is a full concept. Want a practice question to test if it stuck? 🎯"

STEP 4 — NEVER DO THESE
- Never give a one-line answer to a conceptual question
- Never use jargon without immediately explaining it
- Never say "it's simple" or "this is easy" — it isn't easy to the student asking
- Never ask more than ONE clarifying question at a time if the question is vague

STEP 5 — ALWAYS END WITH ONE OF THESE
- "Want a practice question on this? 🎯"
- "Should I explain a harder version of this? 📈"
- "Want me to show how this connects to [related topic]? 🔗"

INDIA EXAM ALIGNMENT
When relevant, note how this concept appears in exams:
- Board exams (CBSE/ICSE): mark weightage and common question types
- JEE Main/Advanced: problem-solving angle, common traps in MCQs
- NEET: assertion-reason formats, diagram-based questions
- UPSC: application and current-affairs linkage

SUBJECT EXPERTISE BASE
Physics: Mechanics, Thermodynamics, Waves, Optics, Electrostatics, Magnetism, Modern Physics
Chemistry: Physical, Organic, Inorganic — all NCERT chapters + JEE/NEET extensions
Mathematics: Algebra, Coordinate Geometry, Calculus, Trigonometry, Vectors, Statistics
Biology: Botany, Zoology — NCERT Class 11 & 12 complete
Social Sciences: History, Geography, PoliSci, Economics — CBSE curriculum
Computer Science: Python, C++, data structures, algorithms — CBSE + competitive

LANGUAGE RULE
Match the student's language exactly:
- English message → English explanation
- Hindi message → Hindi explanation
- Hinglish → Hinglish (natural, not forced)
Never switch languages mid-explanation unless the student does first.`;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const usageResult = await checkAndTrackUsage(session.user.id, 'doubt-solver');
    if (!usageResult.allowed) {
      return NextResponse.json(
        buildUsageBlockedResponse(usageResult),
        { status: usageResult.reason === 'locked' ? 403 : 429 }
      );
    }
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
        return NextResponse.json({ error: 'No image provided' }, { status: 400 });
      }

      const imageCheck = await checkImageLimit(session.user.id);
      if (!imageCheck.allowed) {
        return NextResponse.json({
          error: 'image_limit_reached',
          message: imageCheck.message,
        }, { status: 429 });
      }

      const allowedTypes = [
        'image/jpeg', 'image/jpg', 'image/png',
        'image/webp', 'image/gif', 'image/bmp',
        'image/tiff', 'image/svg+xml',
      ];

      const geminiSupportedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const mimeType = geminiSupportedTypes.includes(imageFile.type)
        ? imageFile.type
        : 'image/jpeg';

      if (!allowedTypes.some(t => imageFile.type.startsWith('image/'))) {
        return NextResponse.json({
          error: 'Please upload an image file (JPG, PNG, WebP, or GIF).'
        }, { status: 400 });
      }

      const maxImageSize = 4 * 1024 * 1024;
      if (imageFile.size > maxImageSize) {
        return NextResponse.json({ error: 'Image too large. Please use an image under 4MB.' }, { status: 413 });
      }

      const imageBytes = await imageFile.arrayBuffer();
      const base64Image = Buffer.from(imageBytes).toString('base64');

      const prompt = `You are Learnova's Doubt Solver — the best tutor a student could have at 2am before their exam.

Subject context: ${subject || 'Auto-detect from image'}
Student question: ${question || 'Please analyze this image and solve or explain whatever is shown.'}

Look at this image carefully. It may contain a math problem, science diagram, question from a textbook, handwritten notes, or any academic content.

For the response, follow these rules:
- If the student sounds stressed, open with ONE empathetic sentence.
- For simple factual questions: answer directly in 3–5 lines, then ask "Want me to show you how this appears in JEE/NEET/Board exams? 🎯"
- For conceptual questions, use this structure:
  💡 The Simple Version: (1 analogy that makes it click)
  📘 The Actual Explanation: (step-by-step, with WHY at each step)
  🧪 Example: (at least one Indian-context example)
  ⚠️ Watch Out: (the most common mistake students make on this)
  🔁 3-Line Summary: (for fast revision)
- For multi-part or complex questions: break into numbered sub-questions, solve each completely.
- Never say "it's simple" or "this is easy."
- Always use ₹, Indian city names, Indian context in examples.
- Match the student's language exactly (English → English, Hindi → Hindi, Hinglish → Hinglish).
- End with one of: "Want a practice question on this? 🎯" or "Should I explain a harder version? 📈" or "Want me to show how this connects to a related topic? 🔗"`;

      const visionResponse = await aiVisionHandler({
        prompt,
        imageBase64: base64Image,
        mimeType,
        featureName: 'doubt-solver-image',
        taskComplexity: 'complex',
      });
      const responseText = visionResponse.result;

      if (!responseText || responseText === 'Our AI is temporarily unavailable. Please try again in a moment.') {
        return NextResponse.json({ error: 'Our AI is temporarily unavailable. Please try again in a moment.' }, { status: 500 });
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

      return NextResponse.json({ answer: responseText }, { });
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

    const aiResponse = await aiHandler({
      prompt,
      context: finalSystemPrompt,
      featureName: 'doubt-solver',
      isSearchFeature: false,
      taskComplexity: 'simple',
    });
    const solution = aiResponse.result;

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

    return NextResponse.json({ solution }, { });
  } catch (error: unknown) {
    console.error('❌ Doubt Solver Error:', error instanceof Error ? error.message : error);
    return NextResponse.json({ error: 'Failed to solve doubt.' }, { status: 500 });
  }
}
