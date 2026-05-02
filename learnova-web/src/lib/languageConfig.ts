export type SupportedLanguage = 'English' | 'Hindi' | 'Hinglish';

type LanguageConfig = {
  code: string;
  script: string;
  instruction: string;
  validationPattern: RegExp | null;
  exampleQuestion: string;
};

export const LANGUAGE_CONFIGS: Record<SupportedLanguage, LanguageConfig> = {
  English: {
    code: 'en',
    script: 'Latin/Roman script',
    instruction: `
LANGUAGE: English
Write EVERYTHING in English only.
Use standard English grammar and vocabulary.
Do NOT include any Hindi, Devanagari, or non-English words.
    `.trim(),
    validationPattern: null,
    exampleQuestion: 'Please describe your background and experience.',
  },
  Hindi: {
    code: 'hi',
    script: 'Devanagari script (देवनागरी)',
    instruction: `
भाषा: हिंदी (Hindi)

तुम्हें सारे प्रश्न और सारा content पूरी तरह हिंदी में लिखना है।

STRICT HINDI RULES:
- Write ALL text in Hindi using Devanagari script ONLY (like: आप, क्या, बताइए)
- Do NOT write anything in English letters/Roman script
- Do NOT mix English words into Hindi sentences
- Do NOT write Hindi words using English letters (that is Hinglish, not Hindi)
- Every single word must be in Devanagari Unicode characters
- Technical terms should be written in Devanagari transliteration
  Example: "software" -> "सॉफ्टवेयर", "interview" -> "साक्षात्कार"
- JSON keys stay in English but ALL values must be in Devanagari Hindi
    `.trim(),
    validationPattern: /[\u0900-\u097F]/,
    exampleQuestion: 'अपने बारे में और अपने अनुभव के बारे में बताइए।',
  },
  Hinglish: {
    code: 'hi-en',
    script: 'Roman script with Hindi words mixed in English sentences',
    instruction: `
LANGUAGE: Hinglish (Hindi + English mixed)

STRICT HINGLISH RULES:
- Write in Roman/English script ONLY (not Devanagari)
- Mix Hindi words naturally within English sentence structure
- Style examples:
  * "Aap apne baare mein kuch batao"
  * "Aapka kya experience hai is field mein?"
  * "Apne profile ke baare mein batao - kya kya kiya hai aapne?"
- The feel should be natural Indian conversational style
- Do NOT write in pure English - Hindi words must be present
- Do NOT write in Devanagari script - use Roman letters only
- Common Hindi words to naturally include: aap, kya, kaise,
  batao, hai, hain, mein, ka, ki, ke, toh, aur, bhi, bahut,
  achha, theek, sahi, samjhe, chaliye, batayein, karein
- JSON keys stay in English but ALL values must be in Hinglish style
    `.trim(),
    validationPattern: /\b(aap|kya|kaise|batao|hai|hain|mein|toh|aur|bhi|achha|theek)\b/i,
    exampleQuestion: 'Aap apne baare mein batao - kya kya experience hai aapka?',
  },
};

export const normalizeLanguage = (language?: string): SupportedLanguage => {
  const value = (language || '').toLowerCase().trim();
  // Check Hinglish first to avoid misclassification from mixed labels.
  if (
    value.includes('hinglish') ||
    value.includes('hi-en') ||
    value.includes('mixed') ||
    value.includes('hindi+english') ||
    value.includes('hindi english')
  ) return 'Hinglish';
  if (value.includes('hindi') || value === 'hi' || value === 'hi-in') return 'Hindi';
  return 'English';
};

export const getLanguageInstruction = (language?: string): string => {
  const normalized = normalizeLanguage(language);
  return LANGUAGE_CONFIGS[normalized].instruction;
};

export const validateLanguage = (text: string, language?: string): boolean => {
  const normalized = normalizeLanguage(language);
  const config = LANGUAGE_CONFIGS[normalized];
  if (!config.validationPattern) return true;
  return config.validationPattern.test(text || '');
};

export type GroqLanguageConfig = {
  name: SupportedLanguage;
  script: string;
  nativeInstruction: string;
  systemEnforcement: string;
  groqInstruction: string;
  validationRegex: RegExp | null;
  exampleOutput: string;
};

export const getConfig = (language?: string): GroqLanguageConfig => {
  const selected = normalizeLanguage(language);
  const base = LANGUAGE_CONFIGS[selected];

  return {
    name: selected,
    script: base.script,
    nativeInstruction: base.instruction,
    systemEnforcement: base.instruction,
    groqInstruction: base.instruction,
    validationRegex: base.validationPattern,
    exampleOutput: base.exampleQuestion,
  };
};
