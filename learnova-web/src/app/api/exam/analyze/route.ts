import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

const PRIMARY_MODEL = 'llama-3.3-70b-versatile'
const FALLBACK_MODEL = 'llama-3.1-8b-instant'

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
    return await tryModel(PRIMARY_MODEL)
  } catch (err: any) {
    const status = err?.status ?? err?.statusCode ?? 0
    const isRetryable = status === 429 || status === 500 || status === 503 || status === 0
    if (isRetryable) {
      return await tryModel(FALLBACK_MODEL)
    }
    throw err
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { testData } = body

    const systemPrompt = `You are Learnova's adaptive exam analyzer for Indian students.

Analyze this student's practice test performance.
Questions and answers: ${JSON.stringify(testData)}

Respond ONLY in this JSON — no markdown, no extra text:
{
  "overall_score": 0,
  "total_questions": 0,
  "correct": 0,
  "time_taken": "string",
  "performance_level": "Needs Work | Average | Good | Excellent",
  "topic_analysis": [
    {
      "topic": "string",
      "questions_asked": 0,
      "correct": 0,
      "strength": "weak | average | strong",
      "recommendation": "string"
    }
  ],
  "mistake_patterns": ["string", "string"],
  "strongest_area": "string",
  "weakest_area": "string",
  "study_priority": ["topic1", "topic2", "topic3"],
  "next_step": "string — specific actionable advice",
  "motivational_message": "string — personalized for Indian student"
}`

    const completion = await callGroqWithFallback(
      [{ role: 'system', content: systemPrompt }],
      { temperature: 0.3, max_tokens: 3000 }
    )

    const rawText = completion.choices[0]?.message?.content || ''

    let cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const objMatch = cleaned.match(/(\{[\s\S]*\})/)
    if (objMatch) {
      cleaned = objMatch[1].trim()
    }

    let parsed = JSON.parse(cleaned)
    return NextResponse.json({ result: parsed })
  } catch (error: any) {
    console.error('[EXAM ANALYZE API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze exam results.' },
      { status: 500 }
    )
  }
}
