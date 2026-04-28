import { generateText } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { examType, schoolClass, subject, chapter, difficulty, questionCount } = await req.json();
    const count = questionCount || 5;

    // Build context based on exam type
    const contextLine = examType === 'school'
      ? `${schoolClass} level student in India (CBSE/ICSE/State Board curriculum)`
      : `student preparing for ${examType.toUpperCase()} exam in India`;

    const chapterLine = chapter
      ? `specifically from the chapter/topic: "${chapter}"`
      : 'covering general important topics in this subject';

    const difficultyMap: Record<string, string> = {
      easy: 'simple, straightforward, suitable for beginners',
      medium: 'moderate difficulty, requires good understanding',
      hard: 'challenging, requires deep conceptual clarity'
    };

    const prompt = `You are an expert Indian exam question generator.

Generate exactly ${count} multiple choice questions for a ${contextLine}.
Subject: ${subject || 'General Science'}
Topic/Chapter: ${chapterLine}
Difficulty: ${difficultyMap[difficulty || 'medium']}

STRICT FORMAT — Return ONLY valid JSON, no extra text:
{
  "questions": [
    {
      "id": 1,
      "question": "Question text here?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct": "A",
      "explanation": "Clear explanation of why A is correct and why others are wrong.",
      "topic": "Sub-topic name",
      "difficulty": "${difficulty || 'medium'}"
    }
  ]
}

Rules:
- Questions must be appropriate for ${examType === 'school' ? schoolClass : examType?.toUpperCase() || 'the exam'}
- All options must be plausible (no obviously wrong answers)
- Explanations must be educational and easy to understand
- For school level: use simple language, relatable Indian examples
- For competitive exams: use standard exam format and terminology
- Never repeat questions
- Return ONLY the JSON object, nothing else`;

    const text = await generateText(prompt);

    // Try multiple ways to extract JSON
    let questions = null;

    // Method 1: Extract from {"questions": [...]} format
    try {
      const trimmed = text.trim();
      if (trimmed.includes('"questions"')) {
        const parsed = JSON.parse(trimmed);
        questions = parsed.questions;
      }
    } catch {}

    // Method 2: Direct JSON array (backward compatibility)
    if (!questions) {
      try {
        const trimmed = text.trim();
        if (trimmed.startsWith('[')) {
          questions = JSON.parse(trimmed);
        }
      } catch {}
    }

    // Method 3: Find JSON object with questions array
    if (!questions) {
      try {
        const jsonMatch = text.match(/\{[\s\S]*"questions"[\s\S]*\[[\s\S]*\][\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          questions = parsed.questions;
        }
      } catch {}
    }

    // Method 4: Find JSON array in text
    if (!questions) {
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) questions = JSON.parse(jsonMatch[0]);
      } catch {}
    }

    // Method 5: Clean and retry
    if (!questions) {
      try {
        const cleaned = text
          .replace(/```json/g, '')
          .replace(/```/g, '')
          .trim();
        const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
        if (jsonMatch) questions = JSON.parse(jsonMatch[0]);
      } catch {}
    }

    if (!questions || questions.length === 0) {
      // Retry once with simpler prompt
      const retryPrompt = `Generate ${count} MCQ questions about ${subject} for ${contextLine}. ${chapter ? `Chapter: ${chapter}.` : ''}
Return ONLY JSON array: [{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]`;
      const retryText = await generateText(retryPrompt);
      const retryMatch = retryText.match(/\[[\s\S]*\]/);
      if (retryMatch) questions = JSON.parse(retryMatch[0]);
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'Failed to generate questions. Please try again.' }, { status: 500 });
    }

    // Normalize questions to match the expected format
    const normalizedQuestions = questions.map((q: any, idx: number) => ({
      id: q.id || idx + 1,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer !== undefined ? q.correctAnswer : 
                     q.correct ? q.correct.charCodeAt(0) - 65 : 0, // Convert "A" -> 0
      explanation: q.explanation,
      topic: q.topic || subject,
    }));

    return NextResponse.json({ questions: normalizedQuestions });

  } catch (error: any) {
    console.error('❌ Exam Generate Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to generate exam. Please try again.' }, { status: 500 });
  }
}
