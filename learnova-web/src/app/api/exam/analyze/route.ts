import { NextRequest, NextResponse } from 'next/server'
import { getAIResponse } from '@/lib/aiRouter'
import { sanitizeJsonPostBody } from '@/lib/validation'

export async function POST(req: NextRequest) {
  try {
    let rawBody: unknown = {}
    try {
      rawBody = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = sanitizeJsonPostBody(rawBody, ['testData'], 50000)
    if (!parsed.ok) return parsed.response

    let testDataSerialized = ''
    try {
      testDataSerialized = JSON.stringify(parsed.body.testData)
    } catch {
      return NextResponse.json({ error: 'Invalid test data' }, { status: 400 })
    }

    // SECURITY: Bound serialized test payload size after canonicalization.
    // OWASP Reference: A05:2021 Security Misconfiguration
    if (testDataSerialized.length > 45000) {
      return NextResponse.json({ error: 'Test data too large' }, { status: 413 })
    }

    const systemPrompt = `You are Learnova's adaptive exam analyzer for Indian students.

Analyze this student's practice test performance.
Questions and answers: ${testDataSerialized}

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

    const rawText = await getAIResponse(
      [{ role: 'user', content: 'Analyze the provided test data and return the required JSON.' }],
      systemPrompt,
      { temperature: 0.3, maxTokens: 3000, feature: 'exam-analyze' }
    )

    let cleaned = rawText.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
    const objMatch = cleaned.match(/(\{[\s\S]*\})/)
    if (objMatch) {
      cleaned = objMatch[1].trim()
    }

    const analysisResult = JSON.parse(cleaned)
    return NextResponse.json({ result: analysisResult })
  } catch (error: any) {
    console.error('[EXAM ANALYZE API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze exam results.' },
      { status: 500 }
    )
  }
}
