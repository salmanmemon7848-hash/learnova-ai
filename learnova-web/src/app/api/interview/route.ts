import { chatWithHistory } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { askAIWithSearch } from '@/lib/aiWithSearch';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, interviewType, schoolClass, role, language, question, answer, questionNumber, totalQuestions } = body;

    if (action === 'generate_questions') {
      // Build context map for different interview types
      const contextMap: Record<string, string> = {
        school_general: `school teacher/principal interviewing a ${schoolClass || 'Class 9-12'} student for school selection or scholarship`,
        school_science: `interviewer assessing a ${schoolClass || 'Class 11-12'} Science stream student's subject knowledge and career goals`,
        school_commerce: `interviewer assessing a ${schoolClass || 'Class 11-12'} Commerce stream student's aptitude and goals`,
        college_admission: 'college admission officer interviewing a student applying for undergraduate admission in India',
        iit_interview: 'IIT/NIT counsellor assessing a JEE qualifier student',
        medical_college: 'medical college interviewer assessing a NEET qualifier student',
        software_engineer: 'senior software engineer conducting a technical + behavioral interview at an Indian tech company',
        marketing: 'marketing manager conducting an interview at an Indian company',
        sales: 'sales manager conducting an interview at an Indian company',
        operations: 'operations manager conducting an interview at an Indian company',
        finance: 'finance manager conducting an interview at an Indian bank or financial institution',
        hr: 'HR manager conducting a behavioral and cultural fit interview',
        startup_founder: 'experienced startup mentor grilling a young Indian founder about their startup idea',
        investor_pitch: 'angel investor asking tough questions about a startup pitch',
        upsc_interview: 'UPSC board member conducting the personality test (interview) round',
        ssc_interview: 'SSC panel member conducting a government job interview',
        bank_interview: 'bank HR manager conducting a Bank PO interview',
      }

      const langInstruction = {
        english: 'Ask questions in clear professional English.',
        hindi: 'प्रश्न हिंदी में पूछें। (Ask questions in Hindi)',
        hinglish: 'Ask questions in natural Hinglish (mix of Hindi and English like Indians speak).',
      }

      // Generate interview questions
      const systemPrompt = `You are acting as: ${contextMap[interviewType] || 'an interviewer'}

${langInstruction[language as keyof typeof langInstruction] || langInstruction.english}

Generate exactly 8 interview questions that are:
- Appropriate for: ${contextMap[interviewType] || 'a general interview'}
- Progressive in difficulty (start easy, get harder)
- A mix of technical, behavioral, and situational questions
- Realistic and commonly asked in real interviews

For school/college interviews:
- Focus on academics, career goals, strengths, challenges
- Use age-appropriate language, encouraging tone

For job interviews:
- Mix of technical and behavioral questions
- Include situational and problem-solving questions

For startup/investor interviews:
- Focus on business model, market, competition, traction

For UPSC/government interviews:
- Current affairs, ethics, personal background, opinions on social issues

Return ONLY a JSON array of strings, like this:
["Question 1?", "Question 2?", "Question 3?", ...]

Do not include any other text or explanations.`;

      // Enrich system prompt with live interview questions/tips for this role
      const searchQuery = `${interviewType.replace(/_/g, ' ')} interview questions tips India ${role || ''} 2025`.trim()
      const { finalSystemPrompt: enrichedSystemPrompt } = await askAIWithSearch({
        userMessage: searchQuery,
        systemPrompt,
        needsSearch: true,
      })

      const response = await chatWithHistory(
        [{ role: 'user', content: 'Generate interview questions' }],
        enrichedSystemPrompt
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
      // Build context for evaluation
      const contextMap: Record<string, string> = {
        school_general: `school teacher evaluating a ${schoolClass || 'Class 9-12'} student's answer`,
        school_science: `interviewer evaluating a Science stream student's answer`,
        school_commerce: `interviewer evaluating a Commerce stream student's answer`,
        college_admission: 'college admission officer evaluating the answer',
        software_engineer: 'senior software engineer evaluating the technical answer',
        upsc_interview: 'UPSC board member evaluating the answer',
      }

      const langInstruction = {
        english: 'Respond in clear professional English.',
        hindi: 'प्रतिक्रिया हिंदी में दें। (Respond in Hindi)',
        hinglish: 'Respond in natural Hinglish (mix of Hindi and English).',
      }

      // Evaluate the user's answer
      const systemPrompt = `You are ${contextMap[interviewType] || 'an interviewer evaluating an answer'}.

${langInstruction[language as keyof typeof langInstruction] || langInstruction.english}

Question: ${question}
User's Answer: ${answer}

Evaluate the answer and return ONLY a JSON object with this exact structure:
{
  "score": 7,
  "feedback": "What was good about the answer (2 points, 2-3 sentences)",
  "improvement": "What could be improved (2 points, 2-3 sentences)",
  "modelAnswer": "A model answer (2-3 sentences)"
}

Score criteria:
- 1-3: Poor, incomplete, or irrelevant
- 4-6: Average, covers basics but lacks depth
- 7-8: Good, well-structured with relevant details
- 9-10: Excellent, comprehensive and insightful

For school students:
- Use encouraging tone, age-appropriate feedback
- Focus on clarity of thought and confidence

For job interviews:
- Focus on technical accuracy, communication, problem-solving approach

For UPSC/government:
- Focus on analytical thinking, ethics, current affairs knowledge

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
