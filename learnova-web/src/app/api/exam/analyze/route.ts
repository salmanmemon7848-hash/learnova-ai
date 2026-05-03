import { NextRequest, NextResponse } from 'next/server'
import { getAIResponse } from '@/lib/aiRouter'

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
