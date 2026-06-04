import { aiHandler, messagesToPrompt, type AIChatMessage } from '@/lib/ai/aiHandler';
import { generateInterviewQuestions } from '@/lib/groqInterviewService';
import { createClient } from '@/lib/supabase/server';
import { checkAndTrackUsage, buildUsageBlockedResponse } from '@/lib/usageTracker';
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
      ? `${LEARNOVA_FULL_CONTEXT}\n${FOUNDER_KNOWLEDGE}`
      : `${LEARNOVA_FULL_CONTEXT}\n${STUDENT_KNOWLEDGE}\n${CAREER_GUIDE_KNOWLEDGE}`;

    // â”€â”€ VOICE MODE: conversational turn â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
          'à¤•à¥ƒà¤ªà¤¯à¤¾ à¤…à¤ªà¤¨à¥‡ à¤¬à¥ˆà¤•à¤—à¥à¤°à¤¾à¤‰à¤‚à¤¡ à¤”à¤° à¤¹à¤¾à¤² à¤•à¥‡ à¤…à¤¨à¥à¤­à¤µ à¤•à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚ à¤¬à¤¤à¤¾à¤‡à¤à¥¤',
          'à¤‡à¤¸ à¤­à¥‚à¤®à¤¿à¤•à¤¾ à¤•à¥‡ à¤²à¤¿à¤ à¤†à¤ªà¤•à¥‹ à¤®à¤œà¤¬à¥‚à¤¤ à¤‰à¤®à¥à¤®à¥€à¤¦à¤µà¤¾à¤° à¤•à¥à¤¯à¤¾ à¤¬à¤¨à¤¾à¤¤à¤¾ à¤¹à¥ˆ?',
          'à¤•à¤¿à¤¸à¥€ à¤šà¥à¤¨à¥Œà¤¤à¥€à¤ªà¥‚à¤°à¥à¤£ à¤ªà¥à¤°à¥‹à¤œà¥‡à¤•à¥à¤Ÿ à¤•à¤¾ à¤‰à¤¦à¤¾à¤¹à¤°à¤£ à¤¦à¥€à¤œà¤¿à¤à¥¤',
          'à¤•à¤¡à¤¼à¥‡ à¤¸à¤®à¤¯-à¤¸à¥€à¤®à¤¾ à¤®à¥‡à¤‚ à¤†à¤ª à¤•à¤¾à¤®à¥‹à¤‚ à¤•à¥€ à¤ªà¥à¤°à¤¾à¤¥à¤®à¤¿à¤•à¤¤à¤¾ à¤•à¥ˆà¤¸à¥‡ à¤¤à¤¯ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚?',
          'à¤Ÿà¥€à¤® à¤®à¥‡à¤‚ à¤®à¤¤à¤­à¥‡à¤¦ à¤¹à¥‹à¤¨à¥‡ à¤ªà¤° à¤†à¤ªà¤¨à¥‡ à¤‰à¤¸à¥‡ à¤•à¥ˆà¤¸à¥‡ à¤¸à¥à¤²à¤à¤¾à¤¯à¤¾?',
          'à¤•à¤¿à¤¸ à¤¤à¤•à¤¨à¥€à¤•à¥€ à¤•à¥à¤·à¥‡à¤¤à¥à¤° à¤®à¥‡à¤‚ à¤†à¤ª à¤¸à¥à¤§à¤¾à¤° à¤•à¤°à¤¨à¤¾ à¤šà¤¾à¤¹à¤¤à¥‡ à¤¹à¥ˆà¤‚?',
          'à¤•à¤¾à¤® à¤®à¥‡à¤‚ à¤²à¤¿à¤¯à¤¾ à¤—à¤¯à¤¾ à¤•à¥‹à¤ˆ à¤•à¤ à¤¿à¤¨ à¤¨à¤¿à¤°à¥à¤£à¤¯ à¤¬à¤¤à¤¾à¤‡à¤à¥¤',
          'à¤…à¤ªà¤¨à¥‡ à¤•à¥à¤·à¥‡à¤¤à¥à¤° à¤®à¥‡à¤‚ à¤…à¤ªà¤¡à¥‡à¤Ÿ à¤°à¤¹à¤¨à¥‡ à¤•à¥‡ à¤²à¤¿à¤ à¤†à¤ª à¤•à¥à¤¯à¤¾ à¤•à¤°à¤¤à¥‡ à¤¹à¥ˆà¤‚?',
          'à¤•à¥‹à¤ˆ à¤—à¤²à¤¤à¥€ à¤¬à¤¤à¤¾à¤‡à¤ à¤œà¥‹ à¤†à¤ªà¤¨à¥‡ à¤•à¥€ à¤”à¤° à¤†à¤ªà¤¨à¥‡ à¤•à¥à¤¯à¤¾ à¤¸à¥€à¤–à¤¾à¥¤',
          'à¤œà¤¬ à¤†à¤ª à¤•à¤¿à¤¸à¥€ à¤«à¥€à¤¡à¤¬à¥ˆà¤• à¤¸à¥‡ à¤¸à¤¹à¤®à¤¤ à¤¨à¤¹à¥€à¤‚ à¤¹à¥‹à¤¤à¥‡, à¤¤à¤¬ à¤†à¤ª à¤•à¥ˆà¤¸à¥‡ à¤ªà¥à¤°à¤¤à¤¿à¤•à¥à¤°à¤¿à¤¯à¤¾ à¤¦à¥‡à¤¤à¥‡ à¤¹à¥ˆà¤‚?',
          'à¤†à¤ªà¤•à¤¾ à¤®à¥ˆà¤¨à¥‡à¤œà¤° à¤†à¤ªà¤•à¥€ à¤¸à¤¬à¤¸à¥‡ à¤¬à¤¡à¤¼à¥€ à¤¤à¤¾à¤•à¤¤ à¤•à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚ à¤•à¥à¤¯à¤¾ à¤•à¤¹à¥‡à¤—à¤¾?',
          'à¤‡à¤¸ à¤­à¥‚à¤®à¤¿à¤•à¤¾ à¤•à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚ à¤†à¤ª à¤®à¥à¤à¤¸à¥‡ à¤•à¥‹à¤ˆ à¤ªà¥à¤°à¤¶à¥à¤¨ à¤ªà¥‚à¤›à¤¨à¤¾ à¤šà¤¾à¤¹à¥‡à¤‚à¤—à¥‡?',
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
        const segs = t.split(/\s*(?:[.!?à¥¤]+|\n)\s+/).map(s => s.trim()).filter(Boolean);
        const qLike = /[?ï¼Ÿ]|describe|explain|tell me|what |why |how |which |batao|kaise|kya/i;
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
You are Learnova's AI Interviewer â€” strict, professional, conducting a voice interview.
Interview type: ${roleLabel}
${candidateName !== 'the candidate' ? `Address the candidate as ${candidateName}.` : ''}
Voice rules â€” responses will be spoken aloud:
- Maximum 2 sentences per response
- First sentence: brief reaction to candidate's answer (5-8 words)
- Second sentence: the next question
- Never use bullet points, asterisks, or markdown
- Sound like a real human interviewer on a phone call
Interview structure:
- Q1: Introduce yourself and ask the candidate to introduce their background.
- Q2-Q4: Core questions based on ${roleLabel}
- Q5-Q6: Behavioral â€” "Tell me about a time when..."
- Q7: One deeper challenging question
- Q8: "Do you have any questions for me?"
- After Q8: Spoken evaluation under 80 words. End with "All the best, thank you for your time."
Never repeat a question already asked.`;

      const hindiPrompt = `${knowledgeBlock}\n${strictLangRule}
à¤†à¤ª Learnova à¤•à¥‡ AI à¤‡à¤‚à¤Ÿà¤°à¤µà¥à¤¯à¥‚à¤…à¤° à¤¹à¥ˆà¤‚à¥¤ à¤‡à¤‚à¤Ÿà¤°à¤µà¥à¤¯à¥‚ à¤ªà¥à¤°à¤•à¤¾à¤°: ${roleLabel}
${candidateName !== 'the candidate' ? `à¤‰à¤®à¥à¤®à¥€à¤¦à¤µà¤¾à¤° à¤•à¥‹ ${candidateName} à¤¨à¤¾à¤® à¤¸à¥‡ à¤¸à¤‚à¤¬à¥‹à¤§à¤¿à¤¤ à¤•à¤°à¥‡à¤‚à¥¤` : ''}
à¤¹à¤° à¤œà¤µà¤¾à¤¬ 2 à¤µà¤¾à¤•à¥à¤¯à¥‹à¤‚ à¤®à¥‡à¤‚, à¤•à¥‹à¤ˆ formatting à¤¨à¤¹à¥€à¤‚à¥¤ à¤ªà¤¹à¤²à¥‡ à¤¸à¥‡ à¤ªà¥‚à¤›à¥‡ à¤¸à¤µà¤¾à¤² à¤¦à¥‹à¤¬à¤¾à¤°à¤¾ à¤¨ à¤ªà¥‚à¤›à¥‡à¤‚à¥¤`;

      const hinglishPrompt = `${knowledgeBlock}
CRITICAL: Respond in HINGLISH ONLY â€” mix Hindi and English naturally.
You are Learnova's AI Interviewer. Interview type: ${roleLabel}
${candidateName !== 'the candidate' ? `Address the candidate as ${candidateName}.` : ''}
Max 2 sentences, no bullets. Never repeat a question.`;

      const systemPrompts: Record<string, string> = {

        english: `${knowledgeBlock}

You are Learnova's AI Interviewer â€” a professional interviewer conducting a real voice interview in Indian English.

CRITICAL LANGUAGE RULE: You MUST respond ONLY in English. Every single word must be English.

Interview type: ${interviewType || 'General'}

Voice rules â€” responses will be spoken aloud:
- Maximum 2 sentences per response
- First sentence: brief reaction to candidate's answer (5-8 words)
- Second sentence: the next question
- Never use bullet points, asterisks, or markdown
- Sound like a real human interviewer on a phone call

Interview structure:
- Q1: "Please introduce your background and what motivates your career choices."
- Q2-Q4: Core questions based on ${interviewType || 'General'}
- Q5-Q6: Behavioral â€” "Tell me about a time when..."
- Q7: One deeper challenging question
- Q8: "Do you have any questions for me?"
- After Q8: Spoken evaluation under 80 words. End with "All the best, thank you for your time."

Never repeat a question already asked. Track conversation history carefully.`,

        hindi: `${knowledgeBlock}

à¤†à¤ª Learnova à¤•à¥‡ AI à¤‡à¤‚à¤Ÿà¤°à¤µà¥à¤¯à¥‚à¤…à¤° à¤¹à¥ˆà¤‚ â€” à¤à¤• à¤ªà¥‡à¤¶à¥‡à¤µà¤° à¤‡à¤‚à¤Ÿà¤°à¤µà¥à¤¯à¥‚à¤…à¤° à¤œà¥‹ à¤ªà¥‚à¤°à¥€ à¤¤à¤°à¤¹ à¤¹à¤¿à¤‚à¤¦à¥€ à¤®à¥‡à¤‚ à¤‡à¤‚à¤Ÿà¤°à¤µà¥à¤¯à¥‚ à¤²à¥‡ à¤°à¤¹à¥‡ à¤¹à¥ˆà¤‚à¥¤

à¤…à¤¤à¥à¤¯à¤‚à¤¤ à¤®à¤¹à¤¤à¥à¤µà¤ªà¥‚à¤°à¥à¤£ à¤­à¤¾à¤·à¤¾ à¤¨à¤¿à¤¯à¤®: à¤†à¤ªà¤•à¥‹ à¤•à¥‡à¤µà¤² à¤”à¤° à¤•à¥‡à¤µà¤² à¤¹à¤¿à¤‚à¤¦à¥€ à¤®à¥‡à¤‚ à¤œà¤µà¤¾à¤¬ à¤¦à¥‡à¤¨à¤¾ à¤¹à¥ˆà¥¤ à¤à¤• à¤­à¥€ à¤…à¤‚à¤—à¥à¤°à¥‡à¤œà¥€ à¤¶à¤¬à¥à¤¦ à¤¨à¤¹à¥€à¤‚à¥¤ à¤¹à¤° à¤¶à¤¬à¥à¤¦ à¤¹à¤¿à¤‚à¤¦à¥€ à¤®à¥‡à¤‚ à¤¹à¥‹à¤¨à¤¾ à¤šà¤¾à¤¹à¤¿à¤à¥¤

à¤‡à¤‚à¤Ÿà¤°à¤µà¥à¤¯à¥‚ à¤ªà¥à¤°à¤•à¤¾à¤°: ${interviewType || 'General'}

à¤†à¤µà¤¾à¤œà¤¼ à¤•à¥‡ à¤¨à¤¿à¤¯à¤® â€” à¤œà¤µà¤¾à¤¬ à¤œà¤¼à¥‹à¤° à¤¸à¥‡ à¤¬à¥‹à¤²à¥‡ à¤œà¤¾à¤à¤‚à¤—à¥‡:
- à¤¹à¤° à¤œà¤µà¤¾à¤¬ à¤…à¤§à¤¿à¤•à¤¤à¤® 2 à¤µà¤¾à¤•à¥à¤¯à¥‹à¤‚ à¤®à¥‡à¤‚ à¤¹à¥‹à¤¨à¤¾ à¤šà¤¾à¤¹à¤¿à¤
- à¤ªà¤¹à¤²à¤¾ à¤µà¤¾à¤•à¥à¤¯: à¤‰à¤®à¥à¤®à¥€à¤¦à¤µà¤¾à¤° à¤•à¥‡ à¤œà¤µà¤¾à¤¬ à¤ªà¤° à¤¸à¤‚à¤•à¥à¤·à¤¿à¤ªà¥à¤¤ à¤ªà¥à¤°à¤¤à¤¿à¤•à¥à¤°à¤¿à¤¯à¤¾
- à¤¦à¥‚à¤¸à¤°à¤¾ à¤µà¤¾à¤•à¥à¤¯: à¤…à¤—à¤²à¤¾ à¤¸à¤µà¤¾à¤²
- à¤•à¥‹à¤ˆ bullet points à¤¯à¤¾ formatting à¤¨à¤¹à¥€à¤‚
- à¤à¤• à¤…à¤¸à¤²à¥€ à¤‡à¤‚à¤Ÿà¤°à¤µà¥à¤¯à¥‚à¤…à¤° à¤•à¥€ à¤¤à¤°à¤¹ à¤¬à¥‹à¤²à¥‡à¤‚

à¤‡à¤‚à¤Ÿà¤°à¤µà¥à¤¯à¥‚ à¤¸à¤‚à¤°à¤šà¤¨à¤¾:
- Q1: "à¤¤à¥‹, à¤…à¤ªà¤¨à¥‡ à¤¬à¤¾à¤°à¥‡ à¤®à¥‡à¤‚ à¤¬à¤¤à¤¾à¤‡à¤ à¤”à¤° à¤¯à¤¹à¤¾à¤ à¤•à¥à¤¯à¥‹à¤‚ à¤†à¤?"
- Q2-Q4: ${interviewType || 'General'} à¤¸à¥‡ à¤¸à¤‚à¤¬à¤‚à¤§à¤¿à¤¤ à¤®à¥à¤–à¥à¤¯ à¤¸à¤µà¤¾à¤²
- Q5-Q6: "à¤à¤• à¤à¤¸à¤¾ à¤¸à¤®à¤¯ à¤¬à¤¤à¤¾à¤‡à¤ à¤œà¤¬ à¤†à¤ªà¤¨à¥‡..."
- Q7: à¤à¤• à¤—à¤¹à¤°à¤¾ à¤šà¥à¤¨à¥Œà¤¤à¥€à¤ªà¥‚à¤°à¥à¤£ à¤¸à¤µà¤¾à¤²
- Q8: "à¤•à¥à¤¯à¤¾ à¤†à¤ªà¤•à¥‡ à¤•à¥‹à¤ˆ à¤¸à¤µà¤¾à¤² à¤¹à¥ˆà¤‚ à¤®à¥‡à¤°à¥‡ à¤²à¤¿à¤?"
- Q8 à¤•à¥‡ à¤¬à¤¾à¤¦: 80 à¤¶à¤¬à¥à¤¦à¥‹à¤‚ à¤®à¥‡à¤‚ à¤¬à¥‹à¤²à¤•à¤° à¤®à¥‚à¤²à¥à¤¯à¤¾à¤‚à¤•à¤¨à¥¤ à¤…à¤‚à¤¤ à¤®à¥‡à¤‚: "à¤¬à¤¹à¥à¤¤ à¤§à¤¨à¥à¤¯à¤µà¤¾à¤¦ à¤”à¤° à¤¶à¥à¤­à¤•à¤¾à¤®à¤¨à¤¾à¤à¤‚à¥¤"

à¤ªà¤¹à¤²à¥‡ à¤¸à¥‡ à¤ªà¥‚à¤›à¥‡ à¤—à¤ à¤¸à¤µà¤¾à¤² à¤¦à¥‹à¤¬à¤¾à¤°à¤¾ à¤®à¤¤ à¤ªà¥‚à¤›à¥‡à¤‚à¥¤`,

        hinglish: `${knowledgeBlock}

You are Learnova's AI Interviewer â€” a friendly startup interviewer who speaks in Hinglish, naturally mixing Hindi and English the way Indians speak in offices.

CRITICAL LANGUAGE RULE: You MUST respond in Hinglish ONLY â€” every response must mix Hindi and English naturally. Example: "Accha, that's a good point. Ab batao, aapne koi challenging project handle kiya hai?" Never respond in pure English or pure Hindi.

Interview type: ${interviewType || 'General'}

Voice rules â€” responses will be spoken aloud:
- Maximum 2 sentences per response
- First sentence: brief Hinglish reaction (5-8 words mixing Hindi+English)
- Second sentence: next question in Hinglish
- Never use bullet points or markdown
- Sound like a real Indian office senior on a call

Natural Hinglish phrases to use: "Accha", "Theek hai", "Bahut achha", "Bilkul", "Samajh gaya", "Tell me more yaar", "Interesting point hai"

Interview structure:
- Q1: "Toh apne baare mein batao â€” background kya hai aur yahan kyun aaye?"
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
        return NextResponse.json({ text: ensureVoice(response, nextSlot, prevAsked) }, {});
      } catch {
        return NextResponse.json({ text: pickFallback(normalizedLang, nextSlot, prevAsked) }, { status: 200, headers: responseHeaders });
      }
    }

    // â”€â”€ VOICE MODE: final evaluation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
  "interview_ready": "Almost â€” 2-4 weeks more practice",
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
        interview_ready: 'Almost â€” 2-4 weeks more practice',
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
          `${roleLabel} Interview â€” Score: ${overallScore}/10 â€” ${evalResult.hiring_decision}`,
          { language: normalizedLang, overall_score: overallScore, hiring_decision: evalResult.hiring_decision }
        );
      } catch (saveErr) { console.warn('[Interview] Supabase save failed:', saveErr); }

      return NextResponse.json(evalResult);
    }

    // â”€â”€ CHAT MODE: generate questions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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
      return NextResponse.json({ questions, language: selectedLanguage, total: questions.length }, {});
    }

    // â”€â”€ CHAT MODE: evaluate answer â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

    // â”€â”€ LEGACY: voice_turn alias kept for backward compat â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    void mode; void langConfig; void schoolClass;
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });

  } catch (fatalError: unknown) {
    const msg = fatalError instanceof Error ? fatalError.message : String(fatalError);
    console.error('[Interview] FATAL route error:', msg);
    return NextResponse.json({ text: 'The session paused unexpectedly. Please continue.', error: msg }, { status: 200 });
  }
}

