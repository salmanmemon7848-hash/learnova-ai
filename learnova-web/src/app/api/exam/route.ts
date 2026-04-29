import { NextRequest, NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { examType, subject, chapter, questionCount, language } = body

    let systemPrompt = `You are an expert Indian competitive exam tutor. Generate MCQs strictly following this format:

Q[N]. [Question text]
(A) option
(B) option
(C) option
(D) option
✓ Correct Answer: (X)
Explanation: [step-by-step reasoning, mention NCERT chapter if applicable]
Difficulty: [Easy / Medium / Hard]

Rules:
- Exactly 4 options per question
- Always show correct answer and explanation after each question
- Mention which NCERT chapter or JEE/NEET topic this is from
- Use Indian examples, units, and context
- When asked for a mock test: ask subject + chapter + number of questions, then generate all at once
- Generate exactly ${questionCount} questions
- Return ONLY the questions in the format above, no additional text`

    if (language === 'hindi') {
      systemPrompt += "\n\nIMPORTANT: Generate questions in Hindi (Devanagari script) for question text and explanations. NCERT Hindi textbook terms use karo jahan possible ho. Equations aur formulas English mein reh sakte hain. Options should be in Hindi."
    }

    const userPrompt = `Generate ${questionCount} MCQ questions for ${examType} - ${subject}${chapter ? ` (Chapter: ${chapter})` : ''}.

Follow the exact format specified. Each question should have:
1. Question number (Q1., Q2., etc.)
2. Question text
3. Four options labeled (A), (B), (C), (D)
4. Correct answer with ✓ symbol
5. Detailed explanation
6. Difficulty level (Easy/Medium/Hard)`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 4000,
    })

    const responseText = completion.choices[0]?.message?.content || ''

    // Parse the response to extract questions
    const questions = parseQuestions(responseText)

    return NextResponse.json({ questions })
  } catch (error: any) {
    console.error('Exam generation error:', error)
    
    // Handle timeout errors
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

function parseQuestions(text: string) {
  const questions: any[] = []
  const questionBlocks = text.split(/(?=Q\d+\.)/).filter(Boolean)

  for (let i = 0; i < questionBlocks.length; i++) {
    const block = questionBlocks[i]
    try {
      // Extract question number
      const numberMatch = block.match(/Q(\d+)\./)
      const number = numberMatch ? parseInt(numberMatch[1]) : i + 1

      // Extract question text
      const textMatch = block.match(/Q\d+\.\s+([\s\S]*?)(?=\n\(A\))/)
      const questionText = textMatch ? textMatch[1].trim() : ''

      // Extract options
      const options: { label: string; text: string }[] = []
      const optionMatches = block.matchAll(/\(([A-D])\)\s+([^\n]+)/g)
      for (const match of optionMatches) {
        options.push({
          label: match[1],
          text: match[2].trim(),
        })
      }

      // Extract correct answer
      const answerMatch = block.match(/✓\s*Correct Answer:\s*\(([A-D])\)/)
      const correctAnswer = answerMatch ? answerMatch[1] : ''

      // Extract explanation
      const explanationMatch = block.match(/Explanation:\s*([\s\S]*?)(?=Difficulty:|$)/)
      const explanation = explanationMatch ? explanationMatch[1].trim() : ''

      // Extract difficulty
      const difficultyMatch = block.match(/Difficulty:\s*(Easy|Medium|Hard)/i)
      const difficulty = difficultyMatch ? (difficultyMatch[1] as 'Easy' | 'Medium' | 'Hard') : 'Medium'

      // Extract chapter/topic if mentioned
      const chapterMatch = explanation.match(/(?:NCERT|chapter|topic)[:\s]+([^\n,.]+)/i)
      const chapter = chapterMatch ? chapterMatch[1].trim() : undefined

      if (questionText && options.length === 4 && correctAnswer) {
        questions.push({
          number,
          text: questionText,
          options,
          correctAnswer,
          explanation,
          difficulty,
          chapter,
        })
      }
    } catch (error) {
      console.error('Error parsing question block:', error)
    }
  }

  return questions
}
