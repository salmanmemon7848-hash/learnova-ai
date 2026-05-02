import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch'
import {
  LEARNOVA_FULL_CONTEXT,
  STUDENT_KNOWLEDGE,
  CAREER_GUIDE_KNOWLEDGE,
  EDUFINDER_KNOWLEDGE,
  AI_WRITER_KNOWLEDGE,
  getLanguageInstruction,
  buildIndianSearchQuery,
} from '@/lib/learnovaKnowledge'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Primary model â€” fast and capable. Fallback if rate-limited or unavailable.
const PRIMARY_MODEL = 'llama-3.3-70b-versatile'
const FALLBACK_MODEL = 'llama-3.1-8b-instant'

/**
 * Call Groq with automatic model fallback.
 * If the primary model returns a 429 (rate limit) or 503/500 (service error),
 * we immediately retry with the fallback model instead of returning an error.
 */
async function callGroqWithFallback(
  messages: { role: 'system' | 'user'; content: string }[],
  options: { temperature: number; max_tokens: number }
) {
  const tryModel = async (model: string) =>
    groq.chat.completions.create({
      messages,
      model,
      temperature: options.temperature,
      max_tokens: options.max_tokens,
    })

  try {
    console.log(`[EXAM API] Trying primary model: ${PRIMARY_MODEL}`)
    return await tryModel(PRIMARY_MODEL)
  } catch (err: any) {
    const status = err?.status ?? err?.statusCode ?? 0
    const isRetryable = status === 429 || status === 500 || status === 503 || status === 0
    if (isRetryable) {
      console.warn(
        `[EXAM API] Primary model failed (status ${status}). Falling back to ${FALLBACK_MODEL}â€¦`
      )
      return await tryModel(FALLBACK_MODEL)
    }
    // Non-retryable error â€” rethrow so the outer catch handles it
    throw err
  }
}

// â”€â”€ Adaptive difficulty instructions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const adaptiveInstructions: Record<string, string> = {
  beginner:     'Generate straightforward recall-based questions. No tricks. Simple language. Class 6â€“8 level.',
  intermediate: 'Mix recall and application questions. Some questions should require 2-step thinking. Class 9â€“12 level.',
  advanced:     'Include conceptual, analytical, and trap questions. JEE/NEET/competitive exam standard. Some questions should have very close option pairs.',
  adaptive:     'Generate a mixed set: 3 easy, 4 medium, 3 hard questions (scale proportionally). Clearly mark each with its difficulty.',
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { examType, subject, chapter, questionCount, language, studentLevel = 'adaptive' } = body

    // â”€â”€ Build adaptive system prompt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const numQuestions = questionCount || 10
    const topicClause  = chapter ? ` focusing on chapter/topic: ${chapter}` : ''
    const langClause   =
      language === 'hindi'
        ? ' Write question text, options, and explanation in Hindi (Devanagari script). Equations and formulas may remain in English.'
        : ''

    const levelInstruction = adaptiveInstructions[studentLevel] ?? adaptiveInstructions['adaptive']

    // â”€â”€ Language detection & India-specific search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const sampleMsg = `${subject} ${chapter || ''} ${examType}`.trim();
    const languageInstruction = getLanguageInstruction(language === 'hindi' ? 'à¤¨à¤®à¤¸à¥à¤¤à¥‡' : sampleMsg);

    const baseSystemPrompt = `${LEARNOVA_FULL_CONTEXT}
${STUDENT_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

You are Learnova's adaptive exam engine for Indian students.

Student level: ${levelInstruction}
Subject: ${subject}
Topic/Chapter: ${chapter || 'General'}
Exam type: ${examType}
Number of questions: ${numQuestions}

Generate exactly ${numQuestions} MCQ questions. Use web search results provided to make questions current and syllabus-accurate.${langClause}

Respond ONLY in this exact JSON â€” no markdown, no extra text:

{
  "questions": [
    {
      "id": 1,
      "question": "string",
      "options": {
        "A": "string",
        "B": "string",
        "C": "string",
        "D": "string"
      },
      "correct_answer": "A",
      "difficulty": "easy",
      "topic_tag": "string â€” specific sub-topic this tests",
      "explanation": "string â€” full explanation of why this answer is correct",
      "why_wrong": {
        "B": "string â€” why B is wrong",
        "C": "string â€” why C is wrong",
        "D": "string â€” why D is wrong"
      },
      "exam_relevance": "string â€” which exam this type of question appears in"
    }
  ]
}

Rules:
- Never repeat a question type twice in a row
- For adaptive level: first 3 questions must be easier, last 3 must be harder
- explanation must be at least 2 sentences
- why_wrong must be filled for all 3 wrong options
- topic_tag must be specific (e.g. "Newton's Third Law" not just "Physics")
- Never generate image-dependent questions since we cannot show images
- difficulty must be exactly one of: easy, medium, hard`

    // Enrich system prompt with live web search results (3 s cap)
    const searchContext = await Promise.race([
      getSearchContext(
        `${examType} ${subject} ${chapter || ''}`.trim(),
        'exam',
        { subject, examType, chapter: chapter || '' }
      ),
      new Promise<string>((resolve) => setTimeout(() => resolve(''), 3000)),
    ]);
    const searchUsageInstruction = buildSearchUsageInstruction(searchContext);
    const systemPrompt = searchContext
      ? `${baseSystemPrompt}\n\n${searchContext}\n\n${searchUsageInstruction}`
      : `${baseSystemPrompt}\n\n${searchUsageInstruction}`;

    const userPrompt = `Generate ${numQuestions} MCQ questions for ${examType} â€” ${subject}${topicClause}.
Return the JSON object with a "questions" array of ${numQuestions} objects. Each object must have: id, question, options (object with A/B/C/D keys), correct_answer (A/B/C/D), difficulty (easy/medium/hard), topic_tag, explanation, why_wrong (object with wrong option keys), exam_relevance.
Do not include anything outside the JSON object in your response.`

    console.log('[EXAM API] Prompt sent to AI:', { systemPrompt, userPrompt })

    const completion = await callGroqWithFallback(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.7, max_tokens: 6000 }
    )

    const rawText = completion.choices[0]?.message?.content || ''
    console.log('[EXAM API] Raw AI response:', rawText)

    // â”€â”€ Parse & validate â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const questions = parseAndValidateQuestions(rawText)

    if (questions.length === 0) {
      console.error('[EXAM API] Parsed 0 valid questions from response:', rawText)
      return NextResponse.json(
        { error: 'Could not generate questions â€” please try again.' },
        { status: 422 }
      )
    }

    console.log(`[EXAM API] Successfully parsed ${questions.length} questions.`)
    return NextResponse.json({ questions })
  } catch (error: any) {
    console.error('[EXAM API] Generation error:', error)

    if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timed out. Please try again with fewer questions or a simpler topic.' },
        { status: 408 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to generate questions. The AI service is temporarily unavailable. Please try again in a moment.' },
      { status: 500 }
    )
  }
}

// â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Strip markdown code fences and extract the JSON object/array.
 */
function stripMarkdownFences(text: string): string {
  // Remove ```json ... ``` or ``` ... ``` fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) {
    return fenceMatch[1].trim()
  }

  // Try to extract the outermost { â€¦ } block (new schema: { questions: [...] })
  const objMatch = text.match(/(\{[\s\S]*\})/)
  if (objMatch) {
    return objMatch[1].trim()
  }

  // Fallback: try to extract a plain array (old schema)
  const arrayMatch = text.match(/(\[[\s\S]*\])/)
  if (arrayMatch) {
    return arrayMatch[1].trim()
  }

  return text.trim()
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

/**
 * Parse the raw AI text into a structured question array, with full validation.
 * Supports both:
 *   - NEW schema: { questions: [{ id, question, options:{A,B,C,D}, correct_answer, difficulty, topic_tag, explanation, why_wrong, exam_relevance }] }
 *   - OLD schema: [{ question, options:[], correct_answer, explanation }]
 */
function parseAndValidateQuestions(rawText: string) {
  const cleaned = stripMarkdownFences(rawText)

  let parsed: any
  try {
    parsed = JSON.parse(cleaned)
  } catch (e) {
    console.error('[EXAM API] JSON.parse failed. Cleaned text was:', cleaned)
    return []
  }

  // Handle new { questions: [...] } wrapper
  let items: any[] = []
  if (parsed && typeof parsed === 'object' && Array.isArray(parsed.questions)) {
    items = parsed.questions
  } else if (Array.isArray(parsed)) {
    items = parsed
  } else {
    console.error('[EXAM API] Parsed value is neither array nor {questions:[]}:', parsed)
    return []
  }

  const valid: any[] = []

  items.forEach((item: any, idx: number) => {
    // â”€â”€ Required: question text â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const questionText = item?.question || item?.text
    if (typeof questionText !== 'string' || !questionText.trim()) {
      console.warn(`[EXAM API] Item ${idx}: missing question`, item)
      return
    }

    // â”€â”€ Required: correct_answer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    if (typeof item?.correct_answer !== 'string' || !item.correct_answer.trim()) {
      console.warn(`[EXAM API] Item ${idx}: missing correct_answer`, item)
      return
    }
    const correctAnswer = item.correct_answer.trim().toUpperCase().charAt(0)

    // â”€â”€ Options: accept object {A,B,C,D} or legacy array â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let options: { label: string; text: string }[] = []
    if (item?.options && typeof item.options === 'object' && !Array.isArray(item.options)) {
      // New schema: { A: "...", B: "...", C: "...", D: "..." }
      options = OPTION_LABELS
        .filter((l) => typeof item.options[l] === 'string')
        .map((l) => ({ label: l, text: String(item.options[l]).trim() }))
    } else if (Array.isArray(item?.options)) {
      // Old schema: ["opt1", "opt2", ...]
      options = item.options.slice(0, 4).map((opt: any, i: number) => ({
        label: OPTION_LABELS[i],
        text: String(opt).trim(),
      }))
    }

    if (options.length < 2) {
      console.warn(`[EXAM API] Item ${idx}: insufficient options`, item)
      return
    }

    // â”€â”€ Normalise difficulty â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const rawDiff = (item?.difficulty || 'Medium').toString().toLowerCase()
    const difficulty: 'Easy' | 'Medium' | 'Hard' =
      rawDiff === 'easy' ? 'Easy' : rawDiff === 'hard' ? 'Hard' : 'Medium'

    // â”€â”€ Build why_wrong map â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let whyWrong: Record<string, string> = {}
    if (item?.why_wrong && typeof item.why_wrong === 'object') {
      whyWrong = item.why_wrong
    }

    valid.push({
      number:        idx + 1,
      id:            item?.id ?? idx + 1,
      text:          questionText.trim(),
      options,
      correctAnswer,
      explanation:   typeof item?.explanation === 'string' ? item.explanation.trim() : '',
      difficulty,
      topic_tag:     typeof item?.topic_tag === 'string' ? item.topic_tag.trim() : '',
      why_wrong:     whyWrong,
      exam_relevance: typeof item?.exam_relevance === 'string' ? item.exam_relevance.trim() : '',
      chapter:       item?.chapter || item?.topic_tag || undefined,
    })
  })

  return valid
}
