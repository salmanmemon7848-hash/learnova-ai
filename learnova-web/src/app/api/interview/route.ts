import { chatWithHistory } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, interviewType, schoolClass, role, language, question, answer, messages, mode } = body;

    // ── VOICE MODE: conversational turn ──────────────────────────────────────
    if (action === 'voice_turn') {
      const systemPrompts: Record<string, string> = {

        english: `You are Learnova's AI Interviewer — a professional interviewer conducting a real voice interview at a top Indian technology company in Bangalore. You conduct interviews in natural Indian English, spoken out loud like a real phone call.

CRITICAL VOICE RULES — this is spoken audio, not text:
- Maximum 2 sentences per response, always
- First sentence: one brief warm reaction to what the candidate just said (5–8 words max)
- Second sentence: the next interview question
- Example good: "Good answer. Now tell me about a time you handled pressure at work."
- Example bad: "That's a great point you raised. I really appreciate the detail. Moving on, I'd like to ask..."
- Never use bullet points, asterisks, or any markdown
- Never repeat the question back to the candidate
- Never say "As an AI" or break character
- Sound like a real human speaking on a phone call
- Speak only in clear Indian English

You will receive the full conversation history.
CRITICAL: Never repeat a question you have already asked.
Look at the conversation history carefully — count how many questions have been asked so far and ask the NEXT question in the sequence only.
If the history shows 3 questions already asked, ask question 4.
Never ask the same question twice under any circumstance.

Interview type: ${interviewType || 'General'}

Interview structure:
- Q1: "So, tell me about yourself and what brought you here."
- Q2–Q4: Core technical or subject questions based on interview type
- Q5–Q6: Behavioral — "Tell me about a time when..."
- Q7: One challenging deeper question
- Q8: "Do you have any questions for me?"
- After Q8: Spoken evaluation in 2–3 short sentences. End with "All the best, thank you for your time."

Tone: Professional, warm, like a real Indian senior.`,

        hindi: `आप Learnova के AI इंटरव्यूअर हैं — एक पेशेवर इंटरव्यूअर जो एक बड़ी भारतीय कंपनी में काम करते हैं। आप पूरी तरह हिंदी में इंटरव्यू ले रहे हैं — यह एक फोन कॉल की तरह बोला जाएगा।

आवश्यक नियम — यह बोला जाएगा, लिखा नहीं:
- हर जवाब में अधिकतम 2 वाक्य
- पहला वाक्य: उम्मीदवार के जवाब पर एक छोटी प्रतिक्रिया (5–8 शब्द)
- दूसरा वाक्य: अगला सवाल
- अच्छा उदाहरण: "बहुत अच्छा जवाब। अब बताइए, आपने कोई मुश्किल परिस्थिति कैसे संभाली?"
- बुरा उदाहरण: "आपने जो बताया वो बहुत विस्तृत था और मैं उसकी सराहना करता हूं। मैं आपसे अगले विषय पर बात करना चाहूंगा..."
- कोई bullet points, asterisks या formatting नहीं
- सवाल दोबारा न दोहराएं
- केवल शुद्ध हिंदी में बोलें

आपको पूरी बातचीत का इतिहास मिलेगा।
महत्वपूर्ण: कभी भी वही सवाल दोबारा न पूछें जो पहले पूछा जा चुका है।
बातचीत का इतिहास ध्यान से देखें — अब तक कितने सवाल पूछे गए हैं यह गिनें और केवल अगला सवाल पूछें।
एक ही सवाल दो बार कभी न पूछें।

इंटरव्यू प्रकार: ${interviewType || 'सामान्य'}

इंटरव्यू संरचना:
- Q1: "तो, अपने बारे में बताइए और यहाँ आवेदन क्यों किया?"
- Q2–Q4: इंटरव्यू प्रकार के अनुसार मुख्य सवाल
- Q5–Q6: "एक ऐसा समय बताइए जब..."
- Q7: एक चुनौतीपूर्ण गहरा सवाल
- Q8: "क्या आपके कोई सवाल हैं?"
- Q8 के बाद: 2–3 छोटे वाक्यों में मूल्यांकन। अंत में: "शुभकामनाएं, धन्यवाद।"

स्वर: पेशेवर, गर्मजोशी भरा, असली फोन इंटरव्यू की तरह।`,

        hinglish: `You are Learnova's AI Interviewer — a friendly but professional interviewer at a growing Indian startup. You conduct interviews in Hinglish — the natural mix of Hindi and English that Indians actually speak — like a real phone call.

CRITICAL VOICE RULES — this is spoken audio, not text:
- Maximum 2 sentences per response, always
- First sentence: one brief warm reaction to what the candidate said (5–8 words)
- Second sentence: the next interview question
- Good example: "Accha, bahut achha. Ab batao, koi challenging project handle kiya hai tumne?"
- Bad example: "That's a really interesting point you raised and I appreciate the detail. Now I would like to move on and ask you about..."
- Never use bullet points, asterisks, or any markdown
- Never repeat the question back
- Never say "As an AI" or break character
- Sound like a real person on a phone call

You will receive the full conversation history.
CRITICAL: Never repeat a question you have already asked.
Look at the conversation history carefully — count how many questions have been asked so far and ask the NEXT question in the sequence only.
If the history shows 3 questions already asked, ask question 4.
Never ask the same question twice under any circumstance.

Interview type: ${interviewType || 'General'}

Interview structure:
- Q1: "Toh, apne baare mein batao — background kya hai aur yahan apply kyun kiya?"
- Q2–Q4: Core technical ya subject questions in Hinglish
- Q5–Q6: "Ek situation batao jab tumne..." behavioral questions
- Q7: Ek thoda challenging question
- Q8: "Koi questions hain tumhare mere liye?"
- After Q8: 2–3 short sentences evaluation in Hinglish. End with "All the best, bahut achha tha!"

Tone: Friendly startup vibe — professional lekin approachable, real Indian office energy.`,
      };

      const systemPrompt = systemPrompts[language] || systemPrompts.english;

      const history = messages || [];
      const response = await chatWithHistory(history, systemPrompt);
      return NextResponse.json({ text: response });
    }

    // ── VOICE MODE: final evaluation parsing ─────────────────────────────────
    if (action === 'voice_evaluate') {
      const evalSystemPrompt = `You are evaluating a voice interview. Based on the conversation, return ONLY a JSON object:
{
  "overallScore": 7,
  "communication": 7,
  "technical": 6,
  "confidence": 8,
  "presentation": 7,
  "strength": "One key strength in one sentence.",
  "improvement": "One improvement tip in one sentence."
}
Score each dimension 1-10. No other text.`;

      const history = messages || [];
      const response = await chatWithHistory(history, evalSystemPrompt);
      let evalResult = { overallScore: 7, communication: 7, technical: 6, confidence: 7, presentation: 7, strength: 'Good communication skills.', improvement: 'Add more specific examples.' };
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) evalResult = JSON.parse(match[0]);
      } catch {}

      // ── Save to Supabase (non-blocking) ──────────────────────────────────
      try {
        await supabase.from('interview_sessions').insert({
          user_id: session.user.id,
          interview_type: interviewType || 'General',
          language: language || 'english',
          overall_score: evalResult.overallScore,
          communication_score: evalResult.communication,
          technical_score: evalResult.technical,
          confidence_score: evalResult.confidence,
          feedback: `${evalResult.strength} ${evalResult.improvement}`,
        });

        await logActivity(
          supabase,
          session.user.id,
          'interview',
          `${interviewType || 'General'} Interview — Score: ${evalResult.overallScore}/10`,
          { language: language || 'english', overall_score: evalResult.overallScore }
        );
      } catch (saveErr) {
        console.warn('[Interview] Failed to save to Supabase:', saveErr);
      }

      return NextResponse.json(evalResult);
    }


    // ── CHAT MODE: generate questions ────────────────────────────────────────
    if (action === 'generate_questions') {
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

      const langInstruction: Record<string, string> = {
        english: 'Ask questions in clear professional English.',
        hindi: 'प्रश्न हिंदी में पूछें।',
        hinglish: 'Ask questions in natural Hinglish (mix of Hindi and English).',
      };

      const systemPrompt = `You are acting as: ${contextMap[interviewType] || 'an interviewer'}

${langInstruction[language as keyof typeof langInstruction] || langInstruction.english}

Generate exactly 8 interview questions that are progressive in difficulty, a mix of technical, behavioral, and situational questions. Realistic and commonly asked in real interviews.

Return ONLY a JSON array of strings:
["Question 1?", "Question 2?", ...]

Do not include any other text.`;

      const response = await chatWithHistory([{ role: 'user', content: 'Generate interview questions' }], systemPrompt);

      let questions: string[] = [];
      try {
        const match = response.match(/\[[\s\S]*\]/);
        if (match) questions = JSON.parse(match[0]);
      } catch {
        questions = response.split('\n').filter(q => q.trim().length > 0).slice(0, 8);
      }
      return NextResponse.json({ questions });
    }

    // ── CHAT MODE: evaluate answer ───────────────────────────────────────────
    if (action === 'evaluate_answer') {
      const langInstruction: Record<string, string> = {
        english: 'Respond in clear professional English.',
        hindi: 'प्रतिक्रिया हिंदी में दें।',
        hinglish: 'Respond in natural Hinglish.',
      };

      const systemPrompt = `You are an interviewer evaluating an answer.

${langInstruction[language as keyof typeof langInstruction] || langInstruction.english}

Question: ${question}
User's Answer: ${answer}

Return ONLY a JSON object:
{
  "score": 7,
  "feedback": "What was good (2-3 sentences)",
  "improvement": "What to improve (2-3 sentences)"
}`;

      const response = await chatWithHistory([{ role: 'user', content: 'Evaluate my answer' }], systemPrompt);
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) return NextResponse.json(JSON.parse(match[0]));
      } catch {}
      return NextResponse.json({ score: 5, feedback: 'Good attempt.', improvement: 'Use the STAR method.' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('❌ Interview Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to process interview.' }, { status: 500 });
  }
}
