import { chatWithHistory } from '@/lib/openai';
import { generateInterviewQuestions } from '@/lib/groqInterviewService';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage, buildBlockedResponse, buildRateLimitHeaders } from '@/lib/rateLimit';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import { NextRequest, NextResponse } from 'next/server';
import {
  LEARNOVA_FULL_CONTEXT,
  STUDENT_KNOWLEDGE,
  FOUNDER_KNOWLEDGE,
  CAREER_GUIDE_KNOWLEDGE,
} from '@/lib/learnovaKnowledge';
import { LANGUAGE_CONFIGS, getLanguageInstruction, normalizeLanguage, validateLanguage } from '@/lib/languageConfig';

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
    let responseHeaders: Record<string, string> = {};
    if (action === 'voice_turn' || action === 'generate_questions') {
      const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
      const rateLimitResult = await checkAndIncrementUsage(session.user.id, 'interview', ipAddress);
      if (!rateLimitResult.allowed) {
        return NextResponse.json(buildBlockedResponse(rateLimitResult), { status: 429 });
      }
      responseHeaders = buildRateLimitHeaders(rateLimitResult);
    }
    const INTERVIEW_MODEL = 'llama-3.3-70b-versatile';
    const normalizeAPILanguage = (lang: string): 'english' | 'hindi' | 'hinglish' => {
      const val = (lang || '').toLowerCase().trim();
      if (['hinglish', 'hi-en', 'mixed', 'hindi+english'].some(v => val === v || val.includes(v))) return 'hinglish';
      if (['hindi', 'hi', 'hi-in'].some(v => val === v || val.includes(v))) return 'hindi';
      return 'english';
    };
    const normalizedLang = normalizeAPILanguage(language);
    const selectedLanguage = normalizeLanguage(language);
    const langConfig = LANGUAGE_CONFIGS[selectedLanguage];
    const langInstruction = getLanguageInstruction(selectedLanguage);
    const totalQuestions = Number.isFinite(Number(numberOfQuestions)) ? Number(numberOfQuestions) : 8;
    console.log('[Interview API] Language received:', language);
    console.log('[Interview API] Language normalized:', normalizedLang);

    const isFounderInterview = ['startup_founder', 'investor_pitch'].includes(interviewType || '');
    const knowledgeBlock = isFounderInterview
      ? `${LEARNOVA_FULL_CONTEXT}\n${FOUNDER_KNOWLEDGE}`
      : `${LEARNOVA_FULL_CONTEXT}\n${STUDENT_KNOWLEDGE}\n${CAREER_GUIDE_KNOWLEDGE}`;

    // VOICE MODE: conversational turn
    if (action === 'voice_turn') {
      const VOICE_FALLBACKS: Record<'english' | 'hindi' | 'hinglish', string[]> = {
        english: [
          'Please introduce your background and recent experience.',
          'What core skills make you a strong fit for this role?',
          'Describe a challenging project and the exact steps you took to solve it.',
          'How do you prioritize tasks when deadlines are tight?',
          'Tell me about a time you resolved a team conflict professionally.',
          'Which technical or domain area do you want to improve next, and how?',
          'Explain a difficult decision you made at work and its outcome.',
          'How do you stay updated with changes in your field?',
          'Describe a mistake you made and what you learned from it.',
          'How do you handle feedback when you disagree with it?',
          'What would your manager say is your biggest strength and one growth area?',
          'What questions would you like to ask me about this role?',
        ],
        hindi: [
          'कृपया अपने बैकग्राउंड और हाल के अनुभव के बारे में बताइए।',
          'इस भूमिका के लिए आपको मजबूत उम्मीदवार क्या बनाता है?',
          'किसी चुनौतीपूर्ण प्रोजेक्ट का उदाहरण दीजिए और आपने उसे कैसे हल किया, यह चरणों में समझाइए।',
          'कड़े समय-सीमा में आप कामों की प्राथमिकता कैसे तय करते हैं?',
          'टीम में मतभेद होने पर आपने उसे पेशेवर तरीके से कैसे सुलझाया, एक उदाहरण दीजिए।',
          'किस तकनीकी या डोमेन क्षेत्र में आप आगे सुधार करना चाहते हैं और कैसे?',
          'काम में लिया गया कोई कठिन निर्णय बताइए और उसका परिणाम क्या रहा।',
          'अपने क्षेत्र में बदलावों के साथ अपडेट रहने के लिए आप क्या करते हैं?',
          'कोई गलती बताइए जो आपने की और आपने उससे क्या सीखा।',
          'जब आप किसी फीडबैक से सहमत नहीं होते, तब आप कैसे प्रतिक्रिया देते हैं?',
          'आपका मैनेजर आपकी सबसे बड़ी ताकत और एक सुधार क्षेत्र के बारे में क्या कहेगा?',
          'इस भूमिका के बारे में आप मुझसे कौन-से प्रश्न पूछना चाहेंगे?',
        ],
        hinglish: [
          'Please apne background aur recent experience ke baare mein batao.',
          'Is role ke liye aapko strong candidate kya banata hai?',
          'Ek challenging project ka example do aur step by step batao aapne usse kaise solve kiya.',
          'Tight deadlines mein aap tasks ko prioritize kaise karte ho?',
          'Team conflict ko professional way mein kaise resolve kiya, ek example do.',
          'Kaunsi technical ya domain skill mein aap next improvement karna chahte ho aur kaise?',
          'Work mein liya hua ek difficult decision batao aur uska outcome kya tha.',
          'Apne field mein changes ke saath updated rehne ke liye aap kya karte ho?',
          'Koi mistake batao jo aapne ki aur aapne kya seekha.',
          'Jab aap kisi feedback se agree nahi karte, tab aap kaise respond karte ho?',
          'Aapka manager aapki biggest strength aur ek growth area ke baare mein kya bolega?',
          'Is role ke baare mein aap mujhe kaunse questions poochna chahoge?',
        ],
      };

      const sanitizeVoiceText = (text: string) =>
        (text || '')
          .replace(/\s+/g, ' ')
          .trim();

      const normalizeForComparison = (text: string) =>
        sanitizeVoiceText(text).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '');

      /** Pull the sentence that is most likely the actual interview question (model often returns 2 sentences). */
      const extractLikelyQuestionPortion = (raw: string): string => {
        const t = sanitizeVoiceText(raw);
        if (!t) return '';
        const segments = t.split(/\s*(?:[.!?।]+|\n)\s+/).map((s) => s.trim()).filter(Boolean);
        if (segments.length === 0) return t;
        const qLike =
          /[?？]|क्या|कैसे|क्यों|कहाँ|कब|describe|explain|tell me|what |why |how |which |could you|please|बताइए|बताओ|batao|kyun|kaise|kya|\baap\b/i;
        for (let i = segments.length - 1; i >= 0; i--) {
          const s = segments[i];
          if (qLike.test(s) && s.length >= 12) return s;
        }
        return segments[segments.length - 1];
      };

      const wordDiceCoefficient = (aNorm: string, bNorm: string): number => {
        const wa = new Set(aNorm.split(/\s+/).filter((w) => w.length > 1));
        const wb = new Set(bNorm.split(/\s+/).filter((w) => w.length > 1));
        if (wa.size === 0 || wb.size === 0) return 0;
        let inter = 0;
        for (const w of wa) if (wb.has(w)) inter++;
        return (2 * inter) / (wa.size + wb.size);
      };

      const isSubstantiallySameQuestion = (candidateQ: string, previousQs: string[]): boolean => {
        const n = normalizeForComparison(candidateQ);
        if (n.length < 10) return false;
        for (const pRaw of previousQs) {
          const p = normalizeForComparison(pRaw);
          if (!p) continue;
          if (n === p) return true;
          const shorter = n.length <= p.length ? n : p;
          const longer = n.length > p.length ? n : p;
          if (shorter.length >= 24 && longer.includes(shorter)) return true;
          if (wordDiceCoefficient(n, p) >= 0.45) return true;
        }
        return false;
      };

      const pickUnusedVoiceQuestion = (
        lang: 'english' | 'hindi' | 'hinglish',
        startSlot: number,
        previousAssistantTexts: string[]
      ): string => {
        const bank = VOICE_FALLBACKS[lang] || VOICE_FALLBACKS.english;
        const prevExtracted = previousAssistantTexts.map((t) => extractLikelyQuestionPortion(t));
        const order: number[] = [];
        for (let i = Math.max(0, startSlot); i < bank.length; i++) order.push(i);
        for (let i = 0; i < Math.min(startSlot, bank.length); i++) order.push(i);
        for (const idx of order) {
          const line = bank[idx];
          if (!isSubstantiallySameQuestion(line, prevExtracted)) return line;
        }
        let bestLine = bank[startSlot % bank.length];
        let bestSeparation = -1;
        for (const line of bank) {
          let maxDice = 0;
          for (const p of prevExtracted) {
            const d = wordDiceCoefficient(normalizeForComparison(line), normalizeForComparison(p));
            if (d > maxDice) maxDice = d;
          }
          const separation = 1 - maxDice;
          if (separation > bestSeparation) {
            bestSeparation = separation;
            bestLine = line;
          }
        }
        return bestLine;
      };

      const ensureVoiceLanguage = (
        text: string,
        nextSlot: number,
        previouslyAsked: string[]
      ) => {
        const cleaned = sanitizeVoiceText(text);
        if (!cleaned) return pickUnusedVoiceQuestion(normalizedLang, nextSlot, previouslyAsked);

        const valid = validateLanguage(cleaned, selectedLanguage);
        if (!valid) {
          console.warn(
            `[Interview API] Voice question language mismatch for ${selectedLanguage}. Using language-safe fallback.`,
            cleaned.substring(0, 120)
          );
          return pickUnusedVoiceQuestion(normalizedLang, nextSlot, previouslyAsked);
        }

        const candidateQ = extractLikelyQuestionPortion(cleaned);
        const prevExtracted = previouslyAsked.map((q) => extractLikelyQuestionPortion(q));
        if (isSubstantiallySameQuestion(candidateQ, prevExtracted)) {
          console.warn('[Interview API] Duplicate or near-duplicate voice question — substituting next unique question.');
          return pickUnusedVoiceQuestion(normalizedLang, nextSlot, previouslyAsked);
        }

        return cleaned;
      };

      const strictLanguageRule = `
ABSOLUTE LANGUAGE RULE:
SELECTED LANGUAGE: ${selectedLanguage}
SCRIPT TO USE: ${langConfig.script}

${langInstruction}

This language rule is mandatory and higher priority than everything else.
All output must be in ${selectedLanguage}.
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
- Q1: "Please introduce your background and what motivates your career choices."
- Q2-Q4: Core questions based on ${interviewType || 'General'}
- Q5-Q6: Behavioral — "Tell me about a time when..."
- Q7: One deeper challenging question
- Q8: "Do you have any questions for me?"
- After Q8: Spoken evaluation under 80 words. End with "All the best, thank you for your time."

Never repeat a question already asked. Track conversation history carefully.
Before you respond, compare your planned next question to every assistant question in the history; if it is the same topic or wording, replace it with a different question.`,
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

पहले से पूछे गए सवाल दोबारा मत पूछें।
जवाब देने से पहले, अपना अगला सवाल पूरे इतिहास से मिलाएँ; अगर विषय या शब्द समान लगें तो दूसरा सवाल पूछें।`,

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

Never repeat a question already asked.
Before responding, check your next question against every prior assistant line in history; if it matches in topic or wording, ask something different.`,
      };

      const systemPrompt = systemPrompts[normalizedLang] || systemPrompts['english'];
      console.log('[Interview API] System prompt language selected:', normalizedLang);

      const rawHistory: any[] = messages || [];
      const trimmedHistory = rawHistory.slice(-10);
      const previouslyAsked = trimmedHistory
        .filter((m: any) => m?.role === 'assistant')
        .map((m: any) => String(m?.content || ''));
      /** Next question slot: number of assistant turns already completed (0 = opening question). */
      const nextSlot = previouslyAsked.length;

      try {
        const response = await chatWithHistory(trimmedHistory, systemPrompt, INTERVIEW_MODEL, 0.2, 1200);
        const safeVoiceText = ensureVoiceLanguage(response, nextSlot, previouslyAsked);
        return NextResponse.json({ text: safeVoiceText }, { headers: responseHeaders });
      } catch (aiError: any) {
        return NextResponse.json({
          text: pickUnusedVoiceQuestion(normalizedLang, nextSlot, previouslyAsked),
        }, { status: 200, headers: responseHeaders });
      }
    }

    // VOICE MODE: final evaluation
    if (action === 'voice_evaluate') {
      const conversationHistory = messages || [];

      const evaluationPrompt = `${knowledgeBlock}

${langInstruction}

You are a senior hiring manager and strict professional evaluator with 20 years of experience at top Indian and global companies. You have interviewed thousands of candidates. You give honest, detailed, and sometimes uncomfortable feedback because you want the candidate to genuinely improve.

You just completed a full voice interview with this candidate.

Interview type: ${interviewType || 'General'}
Language used: ${selectedLanguage}
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

      const response = await chatWithHistory(conversationHistory, evaluationPrompt, INTERVIEW_MODEL, 0.2, 4000);

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
      const questions = await generateInterviewQuestions({
        jobRole: roleQuery,
        experienceLevel: experienceLevel || schoolClass || 'Mid-level',
        interviewType: `${interviewType || 'General'} ${searchUsageInstruction || ''} ${searchContext || ''}`.trim(),
        numberOfQuestions: totalQuestions,
        language: selectedLanguage,
      });
      return NextResponse.json({ questions, language: selectedLanguage, total: questions.length }, { headers: responseHeaders });
    }

    if (action === 'evaluate_answer') {
      const evaluationPrompt = `
${langInstruction}

CRITICAL: Your ENTIRE feedback response must be in ${selectedLanguage} only.
Zero English if language is Hindi. Zero Devanagari if language is Hinglish.

Evaluate this mock interview answer:
Question: ${question}
User's Answer: ${answer}

Provide feedback in ${selectedLanguage} covering:
1. Strengths of the answer
2. Areas to improve
3. A better/ideal answer example
4. Score out of 10

Return ONLY this JSON (all values in ${selectedLanguage}):
{
  "score": 7,
  "strengths": "write in ${selectedLanguage}",
  "improvements": "write in ${selectedLanguage}",
  "idealAnswer": "write in ${selectedLanguage}",
  "overallFeedback": "write in ${selectedLanguage}"
}
`.trim();

      const response = await chatWithHistory(
        [{ role: 'user', content: evaluationPrompt }],
        undefined,
        INTERVIEW_MODEL,
        0.2,
        1000
      );
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          return NextResponse.json({
            ...parsed,
            feedback: parsed.overallFeedback || parsed.strengths || '',
            improvement: parsed.improvements || '',
          });
        }
      } catch {}
      return NextResponse.json({
        score: 5,
        strengths: 'Good attempt.',
        improvements: 'Use the STAR method.',
        idealAnswer: '',
        overallFeedback: 'Good attempt.',
        feedback: 'Good attempt.',
        improvement: 'Use the STAR method.',
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (fatalError: any) {
    console.error('[Interview] FATAL route error:', fatalError?.message || fatalError);
    return NextResponse.json(
      {
        text: 'The session paused unexpectedly. Please continue with your next response.',
        error: fatalError?.message,
      },
      { status: 200 }
    );
  }
}
