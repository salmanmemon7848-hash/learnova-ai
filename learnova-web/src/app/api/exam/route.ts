import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'
import { askAIWithSearch } from '@/lib/aiWithSearch'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

// Primary model — fast and capable. Fallback if rate-limited or unavailable.
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
        `[EXAM API] Primary model failed (status ${status}). Falling back to ${FALLBACK_MODEL}…`
      )
      return await tryModel(FALLBACK_MODEL)
    }
    // Non-retryable error — rethrow so the outer catch handles it
    throw err
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { examType, subject, chapter, questionCount, language } = body

    // ── Build prompt ──────────────────────────────────────────────────────────
    const topicClause = chapter ? ` focusing on chapter/topic: ${chapter}` : ''
    const langClause =
      language === 'hindi'
        ? ' Write question text, options, and explanation in Hindi (Devanagari script). Equations and formulas may remain in English.'
        : ''

    const baseSystemPrompt = `You are an expert Indian competitive exam tutor specialising in ${examType}.
Your job is to generate multiple-choice questions and return them as a valid JSON array.
IMPORTANT RULES:
- Respond with a valid JSON array ONLY — no markdown, no explanation, no code blocks, no surrounding text.
- Each element of the array must be an object with exactly these fields:
  {
    "question": "<question text>",
    "options": ["<option A text>", "<option B text>", "<option C text>", "<option D text>"],
    "correct_answer": "<one of: A, B, C, or D>",
    "explanation": "<step-by-step reasoning, mention NCERT chapter or exam topic if applicable>"
  }
- Generate EXACTLY ${questionCount} questions.
- Do not include anything outside the JSON array in your response.${langClause}`

    // ── Enrich system prompt with live web search results (3 s cap) ──────────
    const searchQuery = `${examType} ${subject}${chapter ? ' ' + chapter : ''} important topics questions syllabus`
    const searchPromise = askAIWithSearch({
      userMessage: searchQuery,
      systemPrompt: baseSystemPrompt,
      needsSearch: true,
    })
    // Never let a slow SearXNG instance block question generation
    const searchTimeout = new Promise<{ finalSystemPrompt: string; usedSearch: boolean }>(
      (resolve) =>
        setTimeout(
          () => resolve({ finalSystemPrompt: baseSystemPrompt, usedSearch: false }),
          3000
        )
    )
    const { finalSystemPrompt: systemPrompt } = await Promise.race([searchPromise, searchTimeout])

    const userPrompt = `Generate ${questionCount} MCQ questions for ${examType} — ${subject}${topicClause}.
Return a JSON array of ${questionCount} objects. Each object must have: question, options (array of 4 strings), correct_answer (A/B/C/D), explanation.
Do not include anything outside the JSON array in your response.`

    // ── Debug: log the prompt ─────────────────────────────────────────────────
    console.log('[EXAM API] Prompt sent to AI:', { systemPrompt, userPrompt })

    const completion = await callGroqWithFallback(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      { temperature: 0.7, max_tokens: 4000 }
    )

    const rawText = completion.choices[0]?.message?.content || ''

    // ── Debug: log the raw AI response ────────────────────────────────────────
    console.log('[EXAM API] Raw AI response:', rawText)

    // ── Parse & validate ──────────────────────────────────────────────────────
    const questions = parseAndValidateQuestions(rawText)

    if (questions.length === 0) {
      console.error('[EXAM API] Parsed 0 valid questions from response:', rawText)
      return NextResponse.json(
        { error: 'Could not generate questions — please try again.' },
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

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Strip markdown code fences from a string and return the inner content.
 * Handles ```json … ```, ``` … ```, and raw text with extra prose before/after
 * the JSON array.
 */
function stripMarkdownFences(text: string): string {
  // Remove ```json ... ``` or ``` ... ``` fences
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) {
    return fenceMatch[1].trim()
  }

  // Try to extract the first JSON array directly (handles extra prose)
  const arrayMatch = text.match(/(\[[\s\S]*\])/)
  if (arrayMatch) {
    return arrayMatch[1].trim()
  }

  return text.trim()
}

const OPTION_LABELS = ['A', 'B', 'C', 'D']

/**
 * Parse the raw AI text into a structured question array, with full validation.
 * Maps the JSON schema { question, options[], correct_answer, explanation }
 * to the shape the client expects:
 * { number, text, options: [{label, text}], correctAnswer, explanation, difficulty }
 */
function parseAndValidateQuestions(rawText: string) {
  const cleaned = stripMarkdownFences(rawText)

  let parsed: any[]
  try {
    parsed = JSON.parse(cleaned)
  } catch (e) {
    console.error('[EXAM API] JSON.parse failed. Cleaned text was:', cleaned)
    return []
  }

  if (!Array.isArray(parsed)) {
    console.error('[EXAM API] Parsed value is not an array:', parsed)
    return []
  }

  const valid: any[] = []

  parsed.forEach((item: any, idx: number) => {
    // Required field checks
    if (typeof item?.question !== 'string' || !item.question.trim()) {
      console.warn(`[EXAM API] Item ${idx}: missing or invalid "question" field`, item)
      return
    }
    if (!Array.isArray(item?.options) || item.options.length < 2) {
      console.warn(`[EXAM API] Item ${idx}: "options" must be an array with at least 2 items`, item)
      return
    }
    if (typeof item?.correct_answer !== 'string' || !item.correct_answer.trim()) {
      console.warn(`[EXAM API] Item ${idx}: missing or invalid "correct_answer" field`, item)
      return
    }

    // Normalise correct_answer to uppercase single letter
    const correctAnswer = item.correct_answer.trim().toUpperCase().charAt(0)

    // Map flat options array → [{label, text}] shape
    const options = item.options.slice(0, 4).map((opt: any, i: number) => ({
      label: OPTION_LABELS[i],
      text: String(opt).trim(),
    }))

    valid.push({
      number: idx + 1,
      text: item.question.trim(),
      options,
      correctAnswer,
      explanation: typeof item.explanation === 'string' ? item.explanation.trim() : '',
      difficulty: 'Medium' as const,
      chapter: undefined,
    })
  })

  return valid
}
