import Groq from 'groq-sdk';
import { getConfig, type GroqLanguageConfig } from './languageConfig';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  dangerouslyAllowBrowser: false,
});

const GROQ_MODEL = 'llama-3.3-70b-versatile';

const HINGLISH_INSTRUCTION = `
LANGUAGE SELECTED: Hinglish

WHAT HINGLISH IS — READ CAREFULLY:
Hinglish is NOT Hindi. Hinglish is NOT Devanagari script.
Hinglish = Hindi words spelled in English/Roman letters + English words mixed together.

SCRIPT RULE — MOST IMPORTANT:
✅ CORRECT: Use English alphabet (A B C D...) ONLY
❌ WRONG: Do NOT use Devanagari script (क ख ग घ...)
❌ WRONG: Do NOT write in pure Hindi
❌ WRONG: Do NOT write in pure English

HINGLISH WRITING RULES:
1. Write ALL text using English/Roman letters only
2. Mix Hindi words naturally using Roman spelling
3. Sentence structure can be Hindi or English style
4. Every question MUST contain Hindi words spelled in Roman letters

MANDATORY HINDI WORDS TO USE (spelled in Roman/English letters):
aap, kya, kaise, batao, hai, hain, mein, ka, ki, ke, toh, aur,
bhi, bahut, achha, theek, sahi, karein, batayein, chaliye, apna,
apne, apni, kab, kahan, kyun, kaun, iska, uska, yeh, woh, hua,
kiya, tha, raha, liya, diya, samjhe, milke, karte, hote, chahiye

CORRECT HINGLISH EXAMPLES:
✅ "Aap apne baare mein batao — background kya hai aapka?"
✅ "Ek aisi situation batao jab aapko koi bada challenge face karna pada?"
✅ "Aapne apni team ke saath kaise kaam kiya is project mein?"
✅ "Aap apni strengths aur weaknesses ke baare mein kya sochte hain?"
✅ "Career mein aage badhne ke liye aap kya plan kar rahe hain?"

WRONG EXAMPLES — NEVER GENERATE THESE:
❌ "कृपया अपने बैकग्राउंड के बारे में बताइए" (Devanagari — BANNED)
❌ "Please tell me about your background" (Pure English — BANNED)
❌ "आप अपने अनुभव के बारे में बताएं" (Devanagari — BANNED)

FINAL CHECK BEFORE OUTPUTTING:
- Does every question use ONLY English/Roman alphabet? YES/NO
- Does every question contain at least 3 Hindi words in Roman spelling? YES/NO
If both answers are not YES — rewrite the question before outputting.
`;

const getSystemPrompt = (language: string) => {
  if (language === 'Hinglish') {
    return `
You are a mock interview conductor for Thinkior AI.

🔴 CRITICAL RULE — SCRIPT: You must use ENGLISH/ROMAN ALPHABET ONLY.
Do NOT use Devanagari script (क ख ग) under ANY circumstance.
The user selected Hinglish — NOT Hindi.

🔴 CRITICAL RULE — LANGUAGE: Write in Hinglish style.
Hinglish = Roman-spelled Hindi words mixed with English.
Example: "Aap apne experience ke baare mein batao?"

${HINGLISH_INSTRUCTION}

Any response containing Devanagari characters is a complete failure.
    `;
  }

  if (language === 'Hindi') {
    return `
You are a mock interview conductor for Thinkior AI.

🔴 CRITICAL RULE: Write EVERYTHING in Hindi using Devanagari script only.
Example: "आप अपने अनुभव के बारे में बताइए।"
Do NOT use Roman/English letters for Hindi words.
Do NOT write Hinglish — write pure Devanagari Hindi only.
    `;
  }

  return `
You are a mock interview conductor for Thinkior AI.
Write everything in clear professional English only.
  `;
};

const getUserPrompt = (
  language: string,
  jobRole: string,
  experienceLevel: string,
  numberOfQuestions: number
) => {
  const hinglishReminder = language === 'Hinglish' ? `
⚠️ HINGLISH REMINDER:
- Roman/English letters ONLY — no Devanagari at all
- Every question needs Hindi words spelled in Roman letters
- Correct style: "Aap [topic] ke baare mein batao?"
- Wrong style: anything with क ख ग or pure English sentences
` : '';

  return `
${hinglishReminder}

Generate exactly ${numberOfQuestions} mock interview questions.

Language: ${language}
${language === 'Hinglish' ? 'Script: Roman/English alphabet ONLY — NO Devanagari' : ''}
${language === 'Hindi' ? 'Script: Devanagari ONLY — NO Roman letters' : ''}
Job Role: ${jobRole}
Experience Level: ${experienceLevel}

Each question must be unique and test a different skill.
Return ONLY a JSON array in this format:

[
  {
    "id": 1,
    "question": "${
      language === 'Hinglish'
        ? 'Hinglish question here using Roman letters with Hindi words'
        : language === 'Hindi'
        ? 'हिंदी प्रश्न यहाँ देवनागरी में'
        : 'English question here'
    }",
    "category": "technical/behavioral/situational",
    "difficulty": "easy/medium/hard"
  }
]

No text outside the JSON. Start with [ and end with ].
  `;
};

const validateHinglishQuestion = (questionText: string) => {
  // Rule 1: Must NOT contain Devanagari characters
  const hasDevanagari = /[\u0900-\u097F]/.test(questionText);
  if (hasDevanagari) {
    console.warn('❌ Hinglish validation FAILED — contains Devanagari:', questionText);
    return false;
  }

  // Rule 2: Must contain at least one Hindi word in Roman spelling
  const hindiRomanWords =
    /\b(aap|kya|kaise|batao|hai|hain|mein|toh|aur|bhi|achha|theek|karein|batayein|apne|apna|apni|kab|kyun|kaun|hua|kiya|tha|raha|chahiye|samjhe)\b/i;
  const hasHindiWords = hindiRomanWords.test(questionText);
  if (!hasHindiWords) {
    console.warn('❌ Hinglish validation FAILED — no Hindi words found:', questionText);
    return false;
  }

  console.log('✅ Hinglish validation PASSED:', questionText.substring(0, 60));
  return true;
};

export type GenerateInterviewQuestionsParams = {
  jobRole: string;
  experienceLevel: string;
  interviewType: string;
  numberOfQuestions: number;
  language: string;
};

export const generateInterviewQuestions = async ({
  jobRole,
  experienceLevel,
  interviewType,
  numberOfQuestions,
  language,
}: GenerateInterviewQuestionsParams) => {
  const langConfig = getConfig(language);
  const normalizedLanguage =
    String(language).toLowerCase() === 'hinglish' ? 'Hinglish'
      : String(language).toLowerCase() === 'hindi' ? 'Hindi'
      : 'English';

  const systemPrompt = `
${getSystemPrompt(normalizedLanguage)}

══════════════════════════════════════════════════
🔴 RULE 2 — OUTPUT FORMAT (SECOND MOST IMPORTANT) 🔴
══════════════════════════════════════════════════

You must return ONLY a valid JSON array.
- Start your response with [
- End your response with ]
- No text before [
- No text after ]
- No markdown backticks
- No "Here are your questions:" or any preamble
- No conversational filler between questions
- No explanation of any kind outside the JSON
- Only the raw JSON array

══════════════════════════════════════════════════
🔴 RULE 3 — NO HARDCODED OR CANNED QUESTIONS 🔴
══════════════════════════════════════════════════

You must NOT generate canned filler questions under any circumstance.
Generate fresh, specific questions for the role instead.
`.trim();

  const userPrompt = `
${getUserPrompt(normalizedLanguage, jobRole, experienceLevel, numberOfQuestions)}

LANGUAGE REMINDER: ${langConfig.nativeInstruction}
YOU ARE WRITING IN: ${normalizedLanguage} (${langConfig.script})
CORRECT EXAMPLE: "${langConfig.exampleOutput}"

Interview Type: ${interviewType}
Difficulty progression:
- First ${Math.ceil(numberOfQuestions * 0.3)} questions: easy/warm-up
- Next ${Math.ceil(numberOfQuestions * 0.4)} questions: medium/core
- Last ${Math.floor(numberOfQuestions * 0.3)} questions: hard/advanced
`.trim();

  const response = await groq.chat.completions.create({
    model: GROQ_MODEL,
    temperature: 0.3,
    max_tokens: 4096,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  });

  const rawText = response.choices[0]?.message?.content || '';
  return parseAndValidateQuestions(rawText, normalizedLanguage, langConfig);
};

function parseAndValidateQuestions(
  rawText: string,
  language: string,
  langConfig: GroqLanguageConfig
) {
  try {
    let cleaned = rawText
      .replace(/^```json\s*/im, '')
      .replace(/^```\s*/im, '')
      .replace(/\s*```$/im, '')
      .trim();

    const match = cleaned.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array found in response');
    cleaned = match[0];

    const questions = JSON.parse(cleaned) as { question?: string }[];
    if (!Array.isArray(questions)) throw new Error('Not an array');

    const seen = new Set<string>();
    const unique = questions.filter((q) => {
      if (!q.question) return false;
      const key = q.question.toLowerCase().trim().substring(0, 60);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const validated = unique.map((q, i) => {
      let languageValid = true;
      if (langConfig.validationRegex) {
        languageValid = langConfig.validationRegex.test(q.question!);
        if (!languageValid) {
          console.warn(
            `[Thinkior] ⚠️ Question ${i + 1} failed ${language} validation:`,
            q.question!.substring(0, 80)
          );
        }
      }
      return { ...q, id: i + 1, languageValid };
    });

    let final = validated.filter((q) => q.languageValid !== false);

    if (language === 'Hinglish') {
      const before = final.length;
      final = final.filter((q) => validateHinglishQuestion(String(q.question || '')));
      if (final.length < before) {
        console.error(
          `[Thinkior] ${before - final.length} Hinglish questions failed validation and were removed`
        );
      }
    }

    console.log(`[Thinkior] ✅ Generated ${final.length} valid ${language} questions`);
    return final;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Thinkior] Question parse error:', msg);
    console.error('[Thinkior] Raw response was:', rawText.substring(0, 300));
    return [];
  }
}
