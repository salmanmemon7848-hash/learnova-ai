import { generateText } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { subject, topic, difficulty, questionCount } = await req.json();
    const count = questionCount || 5;

    const prompt = `You are an exam question generator for Indian students (CBSE/JEE/NEET).

Generate exactly ${count} multiple choice questions.
Subject: ${subject || 'General Science'}
Topic: ${topic || 'Mixed'}
Difficulty: ${difficulty || 'Medium'}

STRICT RULES:
- Return ONLY a valid JSON array
- No explanation before or after the JSON
- No markdown formatting
- Each question must have exactly 4 options
- correctAnswer must be 0, 1, 2, or 3 (index of correct option)

JSON format:
[
  {
    "question": "What is Newton's first law of motion?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of why this is correct"
  }
]

Generate exactly ${count} questions now:`;

    const text = await generateText(prompt);

    // Try multiple ways to extract JSON
    let questions = null;

    // Method 1: Direct JSON array
    try {
      const trimmed = text.trim();
      if (trimmed.startsWith('[')) {
        questions = JSON.parse(trimmed);
      }
    } catch {}

    // Method 2: Find JSON array in text
    if (!questions) {
      try {
        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (jsonMatch) questions = JSON.parse(jsonMatch[0]);
      } catch {}
    }

    // Method 3: Clean and retry
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
      const retryPrompt = `Generate ${count} MCQ questions about ${subject} - ${topic}.
Return ONLY JSON array: [{"question":"...","options":["A","B","C","D"],"correctAnswer":0,"explanation":"..."}]`;
      const retryText = await generateText(retryPrompt);
      const retryMatch = retryText.match(/\[[\s\S]*\]/);
      if (retryMatch) questions = JSON.parse(retryMatch[0]);
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json({ error: 'Failed to generate questions. Please try again.' }, { status: 500 });
    }

    return NextResponse.json({ questions });

  } catch (error: any) {
    console.error('❌ Exam Generate Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to generate exam. Please try again.' }, { status: 500 });
  }
}
