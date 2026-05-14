import { aiHandler, messagesToPrompt, type AIChatMessage } from '@/lib/ai/aiHandler';
import { generateInterviewQuestions } from '@/lib/groqInterviewService';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage, buildBlockedResponse, buildRateLimitHeaders } from '@/lib/rateLimit';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import { NextRequest, NextResponse } from 'next/server';
import {
  THINKIOR_FULL_CONTEXT,
  STUDENT_KNOWLEDGE,
  FOUNDER_KNOWLEDGE,
  CAREER_GUIDE_KNOWLEDGE,
} from '@/lib/thinkiorKnowledge';
import { LANGUAGE_CONFIGS, getLanguageInstruction, normalizeLanguage, validateLanguage } from '@/lib/languageConfig';
import {
  sanitizeJsonPostBody,
  sanitizeMessages,
  sanitizeNumber,
  sanitizeString,
} from '@/lib/validation';

async function runInterviewAI(
  messages: Array<{ role: string; content: string }>,
  systemPrompt: string,
  featureName: string
): Promise<string> {
  const aiMessages: AIChatMessage[] = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));

  const response = await aiHandler({
    prompt: messagesToPrompt(aiMessages),
    context: systemPrompt,
    featureName,
    isSearchFeature: false,
    taskComplexity: 'complex',
  });
  return response.result;
}

export async function POST(req: NextRequest) {
  try {
    let rawBody: unknown = {};
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const parsed = sanitizeJsonPostBody(rawBody, [
      'action', 'interviewType', 'schoolClass', 'role', 'language',
      'question', 'answer', 'messages', 'mode', 'numberOfQuestions',
      'experienceLevel', 'userName', 'topicOrRole', 'userType',
    ]);
    if (!parsed.ok) return parsed.response;

    const body = parsed.body;
    const action        = sanitizeString(body.action, 64);
    const interviewType = sanitizeString(body.interviewType, 120);
    const schoolClass   = sanitizeString(body.schoolClass, 80);
    const role          = sanitizeString(body.role, 200);
    const language      = sanitizeString(body.language, 48);
    const question      = sanitizeString(body.question, 8000);
    const answer        = sanitizeString(body.answer, 8000);
    const messages      = sanitizeMessages(body.messages);
    const mode          = sanitizeString(body.mode, 64);
    const numberOfQuestions = sanitizeNumber(body.numberOfQuestions, 1, 50, 8);
    const experienceLevel   = sanitizeString(body.experienceLevel, 120);
    // Personalisation fields (new)
    const userName    = sanitizeString(body.userName, 80);
    const topicOrRole = sanitizeString(body.topicOrRole, 120);
    const userType    = sanitizeString(body.userType, 32) as 'student' | 'founder';

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    let responseHeaders: Record<string, string> = {};
    if (action === 'voice_turn' || action === 'generate_questions') {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
      const rl = await checkAndIncrementUsage(session.user.id, 'interview', ip);
      if (!rl.allowed) return NextResponse.json(buildBlockedResponse(rl), { status: 429 });
      responseHeaders = buildRateLimitHeaders(rl);
    }

    const normalizeAPILanguage = (lang: string): 'english' | 'hindi' | 'hinglish' => {
      const v = (lang || '').toLowerCase().trim();
      if (['hinglish','hi-en','mixed','hindi+english'].some(x => v === x || v.includes(x))) return 'hinglish';
      if (['hindi','hi','hi-in'].some(x => v === x || v.includes(x))) return 'hindi';
      return 'english';
    };
    const normalizedLang    = normalizeAPILanguage(language);
    const selectedLanguage  = normalizeLanguage(language);
    const langConfig        = LANGUAGE_CONFIGS[selectedLanguage];
    const langInstruction   = getLanguageInstruction(selectedLanguage);
    const totalQuestions    = Number.isFinite(Number(numberOfQuestions)) ? Number(numberOfQuestions) : 8;

    const isFounderInterview = userType === 'founder' || ['startup_founder','investor_pitch'].includes(interviewType || '');
    const knowledgeBlock = isFounderInterview
      ? `${THINKIOR_FULL_CONTEXT}\n${FOUNDER_KNOWLEDGE}`
      : `${THINKIOR_FULL_CONTEXT}\n${STUDENT_KNOWLEDGE}\n${CAREER_GUIDE_KNOWLEDGE}`;

    // ── VOICE MODE: conversational turn ────────────────────────────────────
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
          'किसी चुनौतीपूर्ण प्रोजेक्ट का उदाहरण दीजिए।',
          'कड़े समय-सीमा में आप कामों की प्राथमिकता कैसे तय करते हैं?',
          'टीम में मतभेद होने पर आपने उसे कैसे सुलझाया?',
          'किस तकनीकी क्षेत्र में आप सुधार करना चाहते हैं?',
          'काम में लिया गया कोई कठिन निर्णय बताइए।',
          'अपने क्षेत्र में अपडेट रहने के लिए आप क्या करते हैं?',
          'कोई गलती बताइए जो आपने की और आपने क्या सीखा।',
          'जब आप किसी फीडबैक से सहमत नहीं होते, तब आप कैसे प्रतिक्रिया देते हैं?',
          'आपका मैनेजर आपकी सबसे बड़ी ताकत के बारे में क्या कहेगा?',
          'इस भूमिका के बारे में आप मुझसे कोई प्रश्न पूछना चाहेंगे?',
        ],
        hinglish: [
          'Please apne background aur recent experience ke baare mein batao.',
          'Is role ke liye aapko strong candidate kya banata hai?',
          'Ek challenging project ka example do aur step by step batao.',
          'Tight deadlines mein aap tasks ko prioritize kaise karte ho?',
          'Team conflict ko professional way mein kaise resolve kiya?',
          'Kaunsi technical skill mein aap next improvement karna chahte ho?',
          'Work mein liya hua ek difficult decision batao.',
          'Apne field mein updated rehne ke liye aap kya karte ho?',
          'Koi mistake batao jo aapne ki aur aapne kya seekha.',
          'Jab aap kisi feedback se agree nahi karte, kaise respond karte ho?',
          'Aapka manager aapki biggest strength ke baare mein kya bolega?',
          'Is role ke baare mein aap mujhe kaunse questions poochna chahoge?',
        ],
      };

      const sanitizeVoiceText = (t: string) => (t || '').replace(/\s+/g, ' ').trim();
      const normForCmp = (t: string) => sanitizeVoiceText(t).toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, '');

      const extractQuestion = (raw: string): string => {
        const t = sanitizeVoiceText(raw);
        if (!t) return '';
        const segs = t.split(/\s*(?:[.!?।]+|\n)\s+/).map(s => s.trim()).filter(Boolean);
        const qLike = /[?？]|describe|explain|tell me|what |why |how |which |batao|kaise|kya/i;
        for (let i = segs.length - 1; i >= 0; i--) {
          if (qLike.test(segs[i]) && segs[i].length >= 12) return segs[i];
        }
        return segs[segs.length - 1] ?? t;
      };

      const dice = (a: string, b: string): number => {
        const wa = new Set(a.split(/\s+/).filter(w => w.length > 1));
        const wb = new Set(b.split(/\s+/).filter(w => w.length > 1));
        if (!wa.size || !wb.size) return 0;
        let inter = 0;
        for (const w of wa) if (wb.has(w)) inter++;
        return (2 * inter) / (wa.size + wb.size);
      };

      const isSame = (cand: string, prev: string[]): boolean => {
        const n = normForCmp(cand);
        if (n.length < 10) return false;
        for (const p of prev.map(normForCmp)) {
          if (!p) continue;
          if (n === p) return true;
          const [sh, lo] = n.length <= p.length ? [n, p] : [p, n];
          if (sh.length >= 24 && lo.includes(sh)) return true;
          if (dice(n, p) >= 0.45) return true;
        }
        return false;
      };

      const pickFallback = (lang: 'english'|'hindi'|'hinglish', slot: number, prev: string[]): string => {
        const bank = VOICE_FALLBACKS[lang] || VOICE_FALLBACKS.english;
        const prevEx = prev.map(extractQuestion);
        for (let i = Math.max(0, slot); i < bank.length; i++) {
          if (!isSame(bank[i], prevEx)) return bank[i];
        }
        return bank[slot % bank.length];
      };

      const ensureVoice = (text: string, slot: number, prev: string[]): string => {
        const cleaned = sanitizeVoiceText(text);
        if (!cleaned) return pickFallback(normalizedLang, slot, prev);
        if (!validateLanguage(cleaned, selectedLanguage)) return pickFallback(normalizedLang, slot, prev);
        if (isSame(extractQuestion(cleaned), prev.map(extractQuestion))) return pickFallback(normalizedLang, slot, prev);
        return cleaned;
      };

      const strictLangRule = `ABSOLUTE LANGUAGE RULE:\nSELECTED LANGUAGE: ${selectedLanguage}\nSCRIPT TO USE: ${langConfig.script}\n${langInstruction}\nAll output must be in ${selectedLanguage}.`;

      const candidateName = userName || 'the candidate';
      const roleLabel     = topicOrRole || interviewType || 'General';

      const founderPrompt = `${knowledgeBlock}\n${strictLangRule}
You are a strict, professional venture capitalist conducting a mock founder interview for a startup in the ${roleLabel} space.
Address the founder as ${candidateName}. Ask sharp questions about business model, market, traction, competition, and vision.
One question at a time. No encouragement. Professional and concise.
Voice rules: max 2 sentences, no bullets or markdown.
Never repeat a question already asked.`;

      const studentPrompt = `${knowledgeBlock}\n${strictLangRule}
You are Thinkior's AI Interviewer — strict, professional, conducting a voice interview.
Interview type: ${roleLabel}
${candidateName !== 'the candidate' ? `Address the candidate as ${candidateName}.` : ''}
Voice rules — responses will be spoken aloud:
- Maximum 2 sentences per response
- First sentence: brief reaction to candidate's answer (5-8 words)
- Second sentence: the next question
- Never use bullet points, asterisks, or markdown
- Sound like a real human interviewer on a phone call
Interview structure:
- Q1: Introduce yourself and ask the candidate to introduce their background.
- Q2-Q4: Core questions based on ${roleLabel}
- Q5-Q6: Behavioral — "Tell me about a time when..."
- Q7: One deeper challenging question
- Q8: "Do you have any questions for me?"
- After Q8: Spoken evaluation under 80 words. End with "All the best, thank you for your time."
Never repeat a question already asked.`;

      const hindiPrompt = `${knowledgeBlock}\n${strictLangRule}
आप Thinkior के AI इंटरव्यूअर हैं। इंटरव्यू प्रकार: ${roleLabel}
${candidateName !== 'the candidate' ? `उम्मीदवार को ${candidateName} नाम से संबोधित करें।` : ''}
हर जवाब 2 वाक्यों में, कोई formatting नहीं। पहले से पूछे सवाल दोबारा न पूछें।`;

      const hinglishPrompt = `${knowledgeBlock}
CRITICAL: Respond in HINGLISH ONLY — mix Hindi and English naturally.
You are Thinkior's AI Interviewer. Interview type: ${roleLabel}
${candidateName !== 'the candidate' ? `Address the candidate as ${candidateName}.` : ''}
Max 2 sentences, no bullets. Never repeat a question.`;

      const systemPrompts: Record<string, string> = {

        english: `${knowledgeBlock}

You are Thinkior's AI Interviewer — a professional interviewer conducting a real voice interview in Indian English.

CRITICAL LANGUAGE RULE: You MUST respond ONLY in English. Every single word must be English.

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

Never repeat a question already asked. Track conversation history carefully.`,

        hindi: `${knowledgeBlock}

आप Thinkior के AI इंटरव्यूअर हैं — एक पेशेवर इंटरव्यूअर जो पूरी तरह हिंदी में इंटरव्यू ले रहे हैं।

अत्यंत महत्वपूर्ण भाषा नियम: आपको केवल और केवल हिंदी में जवाब देना है। एक भी अंग्रेजी शब्द नहीं। हर शब्द हिंदी में होना चाहिए।

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

पहले से पूछे गए सवाल दोबारा मत पूछें।`,

        hinglish: `${knowledgeBlock}

You are Thinkior's AI Interviewer — a friendly startup interviewer who speaks in Hinglish, naturally mixing Hindi and English the way Indians speak in offices.

CRITICAL LANGUAGE RULE: You MUST respond in Hinglish ONLY — every response must mix Hindi and English naturally. Example: "Accha, that's a good point. Ab batao, aapne koi challenging project handle kiya hai?" Never respond in pure English or pure Hindi.

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
      const rawHistory   = (messages || []).slice(-10);
      const prevAsked    = rawHistory.filter((m: {role:string}) => m?.role === 'assistant').map((m: {content:string}) => String(m?.content || ''));
      const nextSlot     = prevAsked.length;

      try {
        const response = await runInterviewAI(rawHistory, systemPrompt, 'mock-interview-voice-turn');
        return NextResponse.json({ text: ensureVoice(response, nextSlot, prevAsked) }, { headers: responseHeaders });
      } catch {
        return NextResponse.json({ text: pickFallback(normalizedLang, nextSlot, prevAsked) }, { status: 200, headers: responseHeaders });
      }
    }

    // ── VOICE MODE: final evaluation ───────────────────────────────────────
    if (action === 'voice_evaluate') {
      const conversationHistory = messages || [];
      const candidateName = userName || 'the candidate';
      const roleLabel     = topicOrRole || interviewType || 'General';

      const evaluationPrompt = `${knowledgeBlock}\n${langInstruction}

You are a senior hiring manager evaluating a mock interview.
Candidate name: ${candidateName}
Interview topic/role: ${roleLabel}
Language: ${selectedLanguage}
Full transcript:
${conversationHistory.map((m: {role:string;content:string}) => `${m.role.toUpperCase()}: ${m.content}`).join('\n\n')}

Evaluate strictly and honestly. Do NOT be encouraging for the sake of it.
CRITICAL: Respond with ONLY valid JSON. No markdown. Start with { end with }.

Return exactly this JSON structure:
{
  "overall_score": 7,
  "hiring_decision": "Strong Yes",
  "hiring_reason": "2 sentences with specific evidence.",
  "executive_summary": "3-4 sentences. Be specific.",
  "dimension_scores": {
    "communication": { "score": 7, "verdict": "Good", "evidence": "Specific quote.", "detailed_feedback": "2-3 sentences.", "improvement": "Specific advice." },
    "technical_knowledge": { "score": 7, "verdict": "Good", "evidence": "Specific evidence.", "detailed_feedback": "2-3 sentences.", "improvement": "Specific advice." },
    "confidence": { "score": 7, "verdict": "Good", "evidence": "Specific evidence.", "detailed_feedback": "2-3 sentences.", "improvement": "Specific advice." },
    "structure_and_clarity": { "score": 7, "verdict": "Good", "evidence": "Specific evidence.", "detailed_feedback": "2-3 sentences.", "improvement": "Specific advice." },
    "relevance_of_answers": { "score": 7, "verdict": "Good", "evidence": "Specific evidence.", "detailed_feedback": "2-3 sentences.", "improvement": "Specific advice." },
    "depth_of_thinking": { "score": 7, "verdict": "Good", "evidence": "Specific evidence.", "detailed_feedback": "2-3 sentences.", "improvement": "Specific advice." }
  },
  "question_by_question_review": [
    { "question_number": 1, "question_asked": "Exact question.", "candidate_answer_summary": "Summary.", "answer_quality": "Good", "what_was_good": "Specific.", "what_was_missing": "Specific.", "ideal_answer_points": ["Point 1", "Point 2"], "score": 7 }
  ],
  "critical_weaknesses": [{ "weakness": "Direct.", "impact": "How it hurts.", "fix": "Specific exercise." }],
  "genuine_strengths": [{ "strength": "Only if genuinely observed.", "evidence": "Specific moment." }],
  "red_flags": ["Things that would eliminate this candidate."],
  "green_flags": ["Things that genuinely impressed."],
  "interview_ready": "Almost — 2-4 weeks more practice",
  "30_day_improvement_plan": [{ "week": "Week 1", "focus": "Area.", "daily_practice": "Exercise.", "goal": "Achievement." }],
  "resources_to_study": [{ "resource": "Book or method.", "why": "Specific to weakness.", "time_needed": "Estimate." }],
  "senior_judge_message": "3-4 sentences speaking directly to ${candidateName}. Reference specific moments."
}`;

      const response = await runInterviewAI(conversationHistory, evaluationPrompt, 'mock-interview-voice-evaluate');

      const defaultEval = {
        overall_score: 7, hiring_decision: 'Maybe',
        hiring_reason: 'The candidate showed some potential but needs more preparation.',
        executive_summary: 'The candidate demonstrated basic familiarity with the interview format.',
        dimension_scores: {}, question_by_question_review: [], critical_weaknesses: [],
        genuine_strengths: [], red_flags: [], green_flags: [],
        interview_ready: 'Almost — 2-4 weeks more practice',
        '30_day_improvement_plan': [], resources_to_study: [],
        senior_judge_message: 'Keep practicing and focus on giving concrete examples.',
      };

      let evalResult = { ...defaultEval };
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) evalResult = { ...defaultEval, ...JSON.parse(match[0]) };
      } catch (e) { console.warn('[Interview] Parse eval JSON failed:', e); }

      try {
        const overallScore = evalResult.overall_score ?? 0;
        const commScore    = (evalResult.dimension_scores as Record<string,{score:number}>)?.communication?.score ?? 0;
        const techScore    = (evalResult.dimension_scores as Record<string,{score:number}>)?.technical_knowledge?.score ?? 0;
        const confScore    = (evalResult.dimension_scores as Record<string,{score:number}>)?.confidence?.score ?? 0;
        await supabase.from('interview_sessions').insert({
          user_id: session.user.id, interview_type: roleLabel,
          language: normalizedLang, overall_score: overallScore,
          communication_score: commScore, technical_score: techScore, confidence_score: confScore,
          feedback: (evalResult as {executive_summary?:string}).executive_summary || '',
        });
        await logActivity(supabase, session.user.id, 'interview',
          `${roleLabel} Interview — Score: ${overallScore}/10 — ${evalResult.hiring_decision}`,
          { language: normalizedLang, overall_score: overallScore, hiring_decision: evalResult.hiring_decision }
        );
      } catch (saveErr) { console.warn('[Interview] Supabase save failed:', saveErr); }

      return NextResponse.json(evalResult);
    }

    // ── CHAT MODE: generate questions ──────────────────────────────────────
    if (action === 'generate_questions') {
      const roleQuery = role || topicOrRole || interviewType || 'general interview';
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

    // ── CHAT MODE: evaluate answer ─────────────────────────────────────────
    if (action === 'evaluate_answer') {
      const evalPrompt = `${langInstruction}
CRITICAL: Your ENTIRE response must be in ${selectedLanguage} only.

Evaluate this mock interview answer:
Question: ${question}
User's Answer: ${answer}

Return ONLY this JSON (all values in ${selectedLanguage}):
{
  "score": 7,
  "strengths": "write in ${selectedLanguage}",
  "improvements": "write in ${selectedLanguage}",
  "idealAnswer": "write in ${selectedLanguage}",
  "overallFeedback": "write in ${selectedLanguage}"
}`.trim();

      const response = await runInterviewAI([{ role: 'user', content: evalPrompt }], '', 'mock-interview-answer-evaluate');
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          return NextResponse.json({ ...parsed, feedback: parsed.overallFeedback || parsed.strengths || '', improvement: parsed.improvements || '' });
        }
      } catch { /**/ }
      return NextResponse.json({ score: 5, strengths: 'Good attempt.', improvements: 'Use the STAR method.', idealAnswer: '', overallFeedback: 'Good attempt.', feedback: 'Good attempt.', improvement: 'Use the STAR method.' });
    }

    // ── LEGACY: voice_turn alias kept for backward compat ─────────────────
    void mode; void langConfig; void schoolClass;
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (fatalError: unknown) {
    const msg = fatalError instanceof Error ? fatalError.message : String(fatalError);
    console.error('[Interview] FATAL route error:', msg);
    return NextResponse.json({ text: 'The session paused unexpectedly. Please continue.', error: msg }, { status: 200 });
  }
}
