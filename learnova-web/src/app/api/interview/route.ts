import { chatWithHistory } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, interviewType, role, language, question, answer } = body;

    if (action === 'generate_questions') {
      // Generate interview questions
      const systemPrompt = `You are an expert interviewer conducting a mock interview.

Interview Type: ${interviewType}
${role ? `Target Role/Institution: ${role}` : ''}
Language: ${language}

Generate exactly 8 interview questions that are:
- Relevant to the interview type and role
- Progressive in difficulty (start easy, get harder)
- A mix of technical, behavioral, and situational questions
- Realistic and commonly asked in real interviews

Return ONLY a JSON array of strings, like this:
["Question 1?", "Question 2?", "Question 3?", ...]

Do not include any other text or explanations.`;

      const response = await chatWithHistory(
        [{ role: 'user', content: 'Generate interview questions' }],
        systemPrompt
      );

      // Parse the response to extract questions
      let questions: string[] = [];
      try {
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          questions = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        // Fallback: split by newlines if JSON parsing fails
        questions = response.split('\n').filter(q => q.trim().length > 0).slice(0, 8);
      }

      return NextResponse.json({ questions });
    }

    if (action === 'evaluate_answer') {
      // Evaluate the user's answer
      const systemPrompt = `You are evaluating a mock interview answer. Provide honest, constructive feedback.

Language: ${language}

Question: ${question}
User's Answer: ${answer}

Evaluate the answer and return ONLY a JSON object with this exact structure:
{
  "score": 7,
  "feedback": "What was good about the answer (2-3 sentences)",
  "improvement": "What could be improved + sample better answer (2-3 sentences)"
}

Score criteria:
- 1-3: Poor, incomplete, or irrelevant
- 4-6: Average, covers basics but lacks depth
- 7-8: Good, well-structured with relevant details
- 9-10: Excellent, comprehensive and insightful

Be honest but encouraging. Provide specific, actionable feedback.`;

      const response = await chatWithHistory(
        [{ role: 'user', content: 'Evaluate my answer' }],
        systemPrompt
      );

      // Parse the response
      try {
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const evaluation = JSON.parse(jsonMatch[0]);
          return NextResponse.json(evaluation);
        }
      } catch (e) {
        // Fallback
        return NextResponse.json({
          score: 5,
          feedback: 'Good attempt. Try to provide more specific examples.',
          improvement: 'Structure your answer using the STAR method (Situation, Task, Action, Result).',
        });
      }
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('❌ Interview Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to process interview. Please try again.' }, { status: 500 });
  }
}
