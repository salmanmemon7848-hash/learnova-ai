import { chatWithHistory } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import { NextRequest, NextResponse } from 'next/server';
import {
  LEARNOVA_FULL_CONTEXT,
  STUDENT_KNOWLEDGE,
  FOUNDER_KNOWLEDGE,
  CAREER_GUIDE_KNOWLEDGE,
  getLanguageInstruction,
} from '@/lib/learnovaKnowledge';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('[Interview] Failed to parse request body:', parseError);
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { action, interviewType, schoolClass, role, language, question, answer, messages, numberOfQuestions, experienceLevel } = body;
    const INTERVIEW_MODEL = process.env.MOCK_INTERVIEW_MODEL || 'gemini-pro-high';
    const normalizeAPILanguage = (lang: string): 'english' | 'hindi' | 'hinglish' => {
      const val = (lang || '').toLowerCase().trim();
      if (['hindi', 'hi', 'hi-in'].some(v => val.includes(v))) return 'hindi';
      if (['hinglish', 'hi-en', 'mixed'].some(v => val.includes(v))) return 'hinglish';
      return 'english';
    };
    const normalizedLang = normalizeAPILanguage(language);
    const selectedLanguage = normalizedLang === 'hindi' ? 'Hindi' : normalizedLang === 'hinglish' ? 'Hinglish' : 'English';
    const totalQuestions = Number.isFinite(Number(numberOfQuestions)) ? Number(numberOfQuestions) : 8;
    console.log('[Interview API] Language received:', language);
    console.log('[Interview API] Language normalized:', normalizedLang);

    const isFounderInterview = ['startup_founder', 'investor_pitch'].includes(interviewType || '');
    const knowledgeBlock = isFounderInterview
      ? `${LEARNOVA_FULL_CONTEXT}\n${FOUNDER_KNOWLEDGE}`
      : `${LEARNOVA_FULL_CONTEXT}\n${STUDENT_KNOWLEDGE}\n${CAREER_GUIDE_KNOWLEDGE}`;

    // VOICE MODE: conversational turn
    if (action === 'voice_turn') {
      const strictLanguageRule = `
CRITICAL LANGUAGE RULE — READ THIS FIRST:
The user has selected: "${normalizedLang}" as their interview language.

You MUST write EVERY single response in ${normalizedLang} ONLY.
Do NOT mix languages under any circumstance.
Do NOT switch to English if the language is Hindi.
Do NOT switch to Hindi if the language is English.
Every question, every word, every punctuation — must be in ${normalizedLang}.
This rule has NO exceptions. Not even for technical terms.
If a technical term exists in ${normalizedLang}, use it.
If no translation exists, write the term as-is but keep all surrounding text in ${normalizedLang}.
`;

      const systemPrompts: Record<string, string> = {
        english: `${knowledgeBlock}\n${strictLanguageRule}
You are Learnova's AI Interviewer — a professional interviewer conducting a real voice interview in Indian English.

Interview type: ${interviewType || 'General'}

Voice rules — responses will be spoken aloud:
- Maximum 2 sentences per response
- First sentence: brief reaction to candidate's answer (5-8 words)
- Second sentence: the next question
- Never use bullet points, asterisks, or markdown
- Sound like a real human interviewer on a phone call

Interview structure:
- Q1: "So, tell me about yourself and what brought you here."
- Q2-Q4: Core questions based on ${interviewType || 'General'}
- Q5-Q6: Behavioral — "Tell me about a time when..."
- Q7: One deeper challenging question
- Q8: "Do you have any questions for me?"
- After Q8: Spoken evaluation under 80 words. End with "All the best, thank you for your time."

Never repeat a question already asked. Track conversation history carefully.`,

        hindi: `${knowledgeBlock}\n${strictLanguageRule}
आप Learnova के AI इंटरव्यूअर हैं — एक पेशेवर इंटरव्यूअर जो पूरी तरह हिंदी में इंटरव्यू ले रहे हैं।

इंटरव्यू प्रकार: ${interviewType || 'General'}

आवाज़ के नियम — जवाब ज़ोर से बोले जाएंगे:
- हर जवाब अधिकतम 2 वाक्यों में होना चाहिए
- पहला वाक्य: उम्मीदवार के जवाब पर संक्षिप्त प्रतिक्रिया
- दूसरा वाक्य: अगला सवाल
- कोई bullet points या formatting नहीं
- एक असली इंटरव्यूअर की तरह बोलें

इंटरव्यू संरचना:
- Q1: "तो, अपने बारे में बताइए और यहाँ क्यों आए?"
- Q2-Q4: ${interviewType || 'General'} से संबंधित मुख्य सवाल
- Q5-Q6: "एक ऐसा समय बताइए जब आपने..."
- Q7: एक गहरा चुनौतीपूर्ण सवाल
- Q8: "क्या आपके कोई सवाल हैं मेरे लिए?"
- Q8 के बाद: 80 शब्दों में बोलकर मूल्यांकन। अंत में: "बहुत धन्यवाद और शुभकामनाएं।"

पहले से पूछे गए सवाल दोबारा मत पूछें.`,

        hinglish: `${knowledgeBlock}
CRITICAL LANGUAGE RULE — READ THIS FIRST:
The user has selected: "${normalizedLang}" as their interview language.
You MUST respond in HINGLISH ONLY — every response must mix Hindi and English naturally. Example: "Accha, that's a good point. Ab batao, aapne koi challenging project handle kiya hai?" Never respond in pure English or pure Hindi. This rule has NO exceptions.

You are Learnova's AI Interviewer — a friendly startup interviewer who speaks in Hinglish, naturally mixing Hindi and English the way Indians speak in offices.

Interview type: ${interviewType || 'General'}

Voice rules — responses will be spoken aloud:
- Maximum 2 sentences per response
- First sentence: brief Hinglish reaction (5-8 words mixing Hindi+English)
- Second sentence: next question in Hinglish
- Never use bullet points or markdown
- Sound like a real Indian office senior on a call

Natural Hinglish phrases to use: "Accha", "Theek hai", "Bahut achha", "Bilkul", "Samajh gaya", "Tell me more yaar", "Interesting point hai"

Interview structure:
- Q1: "Toh apne baare mein batao — background kya hai aur yahan kyun aaye?"
- Q2-Q4: ${interviewType || 'General'} related core questions in Hinglish
- Q5-Q6: "Ek situation batao jab tumne..." behavioral questions
- Q7: Ek challenging deeper question in Hinglish
- Q8: "Koi questions hain tumhare mere liye?"
- After Q8: Evaluation in Hinglish under 80 words. End with "Bahut achha tha interview, all the best!"

Never repeat a question already asked.`,
      };

      const systemPrompt = systemPrompts[normalizedLang] || systemPrompts['english'];
      console.log('[Interview API] System prompt language selected:', normalizedLang);

      const rawHistory: any[] = messages || [];
      const trimmedHistory = rawHistory.slice(-10);

      try {
        const response = await chatWithHistory(trimmedHistory, systemPrompt, INTERVIEW_MODEL);
        if (!response || response.trim() === '') {
          return NextResponse.json({
            text: 'That is interesting. Could you elaborate a bit more on that?',
          });
        }
        return NextResponse.json({ text: response });
      } catch (aiError: any) {
        return NextResponse.json({
          text: 'I see. Let us continue — could you tell me about a challenging situation you have handled?',
        }, { status: 200 });
      }
    }

    // VOICE MODE: final evaluation
    if (action === 'voice_evaluate') {
      const conversationHistory = messages || [];

      const evaluationPrompt = `${knowledgeBlock}

You are a senior hiring manager and strict professional evaluator with 20 years of experience at top Indian and global companies. You have interviewed thousands of candidates. You give honest, detailed, and sometimes uncomfortable feedback because you want the candidate to genuinely improve.

You just completed a full voice interview with this candidate.

Interview type: ${interviewType || 'General'}
Language used: ${normalizedLang}
Full conversation transcript:
${conversationHistory.map((m: any) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}

Evaluate this candidate strictly and honestly like a senior judge. Do not be encouraging for the sake of it. If they performed poorly, say so clearly with specific evidence from their answers. If they performed well, acknowledge it specifically.

CRITICAL: Respond with ONLY valid JSON. No markdown. Start with { end with }.

Return exactly this JSON structure (fill all fields with real assessment based on the transcript above):
{
  "overall_score": 7,
  "hiring_decision": "Strong Yes",
  "hiring_reason": "2 sentences explaining the hiring decision with specific evidence from the interview.",
  "executive_summary": "3-4 sentences. A senior manager reading this should instantly understand this candidate level. Be specific.",
  "dimension_scores": {
    "communication": {
      "score": 7,
      "verdict": "Good",
      "evidence": "Quote or paraphrase something specific they said.",
      "detailed_feedback": "2-3 sentences of real feedback.",
      "improvement": "Specific actionable advice."
    },
    "technical_knowledge": {
      "score": 7,
      "verdict": "Good",
      "evidence": "Specific evidence from their answers.",
      "detailed_feedback": "2-3 sentences of real feedback.",
      "improvement": "Specific actionable advice."
    },
    "confidence": {
      "score": 7,
      "verdict": "Good",
      "evidence": "Specific evidence from their answers.",
      "detailed_feedback": "2-3 sentences of real feedback.",
      "improvement": "Specific actionable advice."
    },
    "structure_and_clarity": {
      "score": 7,
      "verdict": "Good",
      "evidence": "Specific evidence from their answers.",
      "detailed_feedback": "2-3 sentences of real feedback.",
      "improvement": "Specific actionable advice."
    },
    "relevance_of_answers": {
      "score": 7,
      "verdict": "Good",
      "evidence": "Specific evidence from their answers.",
      "detailed_feedback": "2-3 sentences of real feedback.",
      "improvement": "Specific actionable advice."
    },
    "depth_of_thinking": {
      "score": 7,
      "verdict": "Good",
      "evidence": "Specific evidence from their answers.",
      "detailed_feedback": "2-3 sentences of real feedback.",
      "improvement": "Specific actionable advice."
    }
  },
  "question_by_question_review": [
    {
      "question_number": 1,
      "question_asked": "The exact question that was asked.",
      "candidate_answer_summary": "Summarize what they said.",
      "answer_quality": "Good",
      "what_was_good": "Specific positive aspect or N/A.",
      "what_was_missing": "Specific gap or N/A.",
      "ideal_answer_points": ["Key point 1", "Key point 2", "Key point 3"],
      "score": 7
    }
  ],
  "critical_weaknesses": [
    {
      "weakness": "Be direct.",
      "impact": "How this hurts them in a real interview.",
      "fix": "Specific exercise or practice to improve."
    }
  ],
  "genuine_strengths": [
    {
      "strength": "Only if genuinely observed.",
      "evidence": "Specific moment from interview."
    }
  ],
  "red_flags": ["Things that would immediately eliminate this candidate."],
  "green_flags": ["Things that genuinely impressed."],
  "interview_ready": "Almost — 2-4 weeks more practice",
  "30_day_improvement_plan": [
    {
      "week": "Week 1",
      "focus": "Specific area to work on.",
      "daily_practice": "Specific daily exercise.",
      "goal": "What to achieve by end of week."
    }
  ],
  "resources_to_study": [
    {
      "resource": "Book, YouTube channel, or practice method.",
      "why": "Specific to their weakness.",
      "time_needed": "Estimated time."
    }
  ],
  "senior_judge_message": "3-4 sentences as a strict but fair senior professional speaking directly to the candidate. Reference specific things from their interview. Personal and real, not generic."
}`;

      const response = await chatWithHistory(conversationHistory, evaluationPrompt, INTERVIEW_MODEL);

      const defaultEval: any = {
        overall_score: 7,
        hiring_decision: 'Maybe',
        hiring_reason: 'The candidate showed some potential but needs more preparation to be consistently interview-ready.',
        executive_summary: 'The candidate demonstrated basic familiarity with the interview format. Their answers lacked depth and specific examples. With focused practice over 2-4 weeks they could improve significantly.',
        dimension_scores: {},
        question_by_question_review: [],
        critical_weaknesses: [],
        genuine_strengths: [],
        red_flags: [],
        green_flags: [],
        interview_ready: 'Almost — 2-4 weeks more practice',
        '30_day_improvement_plan': [],
        resources_to_study: [],
        senior_judge_message: 'Keep practicing.'
      };

      let evalResult: any = { ...defaultEval };
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          evalResult = { ...defaultEval, ...parsed };
        }
      } catch (e) {
        console.warn('[Interview] Failed to parse deep eval JSON, using default:', e);
      }

      try {
        const overallScoreValue = evalResult.overall_score ?? evalResult.overallScore ?? 0;
        const commScore = evalResult.dimension_scores?.communication?.score ?? evalResult.clarity ?? evalResult.communication ?? 0;
        const techScore = evalResult.dimension_scores?.technical_knowledge?.score ?? evalResult.relevance ?? evalResult.technical ?? 0;
        const confScore = evalResult.dimension_scores?.confidence?.score ?? evalResult.confidence ?? 0;

        await supabase.from('interview_sessions').insert({
          user_id: session.user.id,
          interview_type: interviewType || 'General',
          language: normalizedLang,
          overall_score: overallScoreValue,
          communication_score: commScore,
          technical_score: techScore,
          confidence_score: confScore,
          feedback: evalResult.executive_summary || evalResult.final_verdict || `${evalResult.strength} ${evalResult.improvement}`,
        });

        await logActivity(
          supabase,
          session.user.id,
          'interview',
          `${interviewType || 'General'} Interview — Score: ${overallScoreValue}/10 — ${evalResult.hiring_decision || 'Evaluated'}`,
          { language: normalizedLang, overall_score: overallScoreValue, hiring_decision: evalResult.hiring_decision }
        );
      } catch (saveErr) {
        console.warn('[Interview] Failed to save to Supabase:', saveErr);
      }

      return NextResponse.json(evalResult);
    }

    // CHAT MODE: generate questions
    if (action === 'generate_questions') {
      const roleQuery = role || interviewType || 'general interview';
      const searchContext = await getSearchContext(roleQuery, 'interview', { role: role || '' });
      const searchUsageInstruction = buildSearchUsageInstruction(searchContext);

      const contextMap: Record<string, string> = {
        school_general: `school teacher/principal interviewing a ${schoolClass || 'Class 9-12'} student`,
        school_science: `interviewer assessing a ${schoolClass || 'Class 11-12'} Science stream student`,
        school_commerce: `interviewer assessing a ${schoolClass || 'Class 11-12'} Commerce stream student`,
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
      };

      const systemPrompt = `${knowledgeBlock}
${searchContext ? `\n\n${searchContext}` : ''}
${searchUsageInstruction}

You are a professional mock interview conductor for Learnova AI.

CRITICAL LANGUAGE RULE — READ THIS FIRST:
The user has selected: "${selectedLanguage}" as their interview language.

You MUST write EVERY single question in ${selectedLanguage} ONLY.
Do NOT mix languages under any circumstance.
Do NOT switch to English if the language is Hindi.
Do NOT switch to Hindi if the language is English.
Every question, every word, every punctuation — must be in ${selectedLanguage}.
This rule has NO exceptions. Not even for technical terms.
If a technical term exists in ${selectedLanguage}, use it.
If no translation exists, write the term as-is but keep all surrounding
text in ${selectedLanguage}.

INTERVIEW CONTEXT:
- Job Role: ${role || contextMap[interviewType] || 'General Role'}
- Experience Level: ${experienceLevel || schoolClass || 'Not specified'}
- Interview Type: ${interviewType || 'General'}
- Language: ${selectedLanguage}

YOUR TASK:
Generate a complete set of mock interview questions for this candidate.

Generate exactly ${totalQuestions} unique mock interview questions.

STRICT RULES — follow all of them without exception:

LANGUAGE RULE:
- Write ALL questions in ${selectedLanguage} ONLY
- Zero mixing of languages allowed
- If selectedLanguage is Hindi, use Devanagari script throughout

UNIQUENESS RULE:
- Every question must be completely different from the others
- No two questions should test the same concept or skill
- Do NOT repeat any question even if rephrased
- Do NOT ask the same question in different words

SEQUENCE RULE:
- Questions must follow a logical progression: easy → medium → hard
- Do NOT loop back or repeat earlier questions
- Each question must build on or differ from all previous ones

FORMAT RULE:
- Return ONLY a valid JSON array, nothing else
- No markdown, no backticks, no explanation text outside the JSON
- No preamble like "Here are your questions:"
- Format exactly like this:

[
  {
    "id": 1,
    "question": "question text here in ${selectedLanguage}",
    "category": "technical/behavioral/situational",
    "difficulty": "easy/medium/hard"
  },
  {
    "id": 2,
    "question": "question text here in ${selectedLanguage}",
    "category": "technical/behavioral/situational", 
    "difficulty": "easy/medium/hard"
  }
]

Generate exactly ${totalQuestions} questions now. No more, no less.`;

      const response = await chatWithHistory(
        [{ role: 'user', content: `Generate exactly ${totalQuestions} questions now. No more, no less. JSON array ONLY.` }],
        systemPrompt,
        INTERVIEW_MODEL
      );

      return NextResponse.json({ rawResponse: response });
    }

    if (action === 'evaluate_answer') {
      const langInstruction: Record<string, string> = {
        english: 'Respond in clear professional English.',
        hindi: 'प्रतिक्रिया हिंदी में दें।',
        hinglish: 'Respond in natural Hinglish.',
      };

      const systemPrompt = `You are an interviewer evaluating an answer.

${langInstruction[normalizedLang] || langInstruction.english}

Question: ${question}
User's Answer: ${answer}

Return ONLY a JSON object:
{
  "score": 7,
  "feedback": "What was good (2-3 sentences)",
  "improvement": "What to improve (2-3 sentences)"
}`;

      const response = await chatWithHistory([{ role: 'user', content: 'Evaluate my answer' }], systemPrompt, INTERVIEW_MODEL);
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) return NextResponse.json(JSON.parse(match[0]));
      } catch {}
      return NextResponse.json({ score: 5, feedback: 'Good attempt.', improvement: 'Use the STAR method.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (fatalError: any) {
    console.error('[Interview] FATAL route error:', fatalError?.message || fatalError);
    return NextResponse.json(
      {
        text: 'I apologize for the interruption. Let us continue — could you tell me about your greatest professional strength?',
        error: fatalError?.message,
      },
      { status: 200 }
    );
  }
}
