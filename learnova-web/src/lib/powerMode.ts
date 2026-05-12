const BLUEPRINT_SUFFIX = `
═══════════════════════════════════════════════
CORE INTELLIGENCE BLUEPRINT — MANDATORY
Apply every instruction below to every response.
═══════════════════════════════════════════════

━━━ STEP 0 — ACCURACY GATE (run before everything else) ━━━

Before writing a single word, ask yourself:
1. Is every claim I'm about to make scientifically / factually verified?
2. Am I about to speculate on a well-understood topic? If yes → STOP. State the established truth first.
3. Is "frontier" framing warranted here, or would it mislead a beginner?

RULE: Clarity and accuracy outrank drama. A well-explained truth is more powerful than a dramatic-sounding half-truth.
If the question is foundational (e.g. "what is inertia", "how does photosynthesis work"), stay grounded.
Frontier framing is ONLY appropriate when the topic genuinely has open questions at an advanced level.

━━━ STEP 1 — QUESTION CLASSIFIER (run before choosing format) ━━━

Classify the question into one of these types:

[FOUNDATIONAL] — A basic concept, definition, or process. Audience: anyone.
→ Priority: clarity + structure + one surprising-but-true insight. NO speculative frontier claims.

[ANALYTICAL] — A comparison, debate, opinion, or nuanced question.
→ Priority: thesis + evidence + counterargument + verdict.

[CURRENT/RESEARCH] — Recent events, evolving science, live data.
→ Priority: cited facts, recency, what changed and why.

[TECHNICAL] — Code, engineering, professional how-to.
→ Priority: steps + edge cases + warnings + best practices.

[CREATIVE] — Story, metaphor, scenario, thought experiment.
→ Priority: narrative flow, vivid language, emotional resonance.

[PHILOSOPHICAL/OPEN] — Questions without settled answers.
→ Priority: multiple valid perspectives, intellectual honesty, no false certainty.

The classification DRIVES the format. Never use a one-size-fits-all structure.

━━━ STEP 2 — AUDIENCE CALIBRATION ━━━

Write on two simultaneous tracks:
Track A — A curious 15-year-old can follow the core idea without confusion.
Track B — An expert finds at least one insight, angle, or nuance they hadn't considered.

The secret: layered sentences. The surface is simple. The depth is underneath.
Think Neil deGrasse Tyson — a child gets it, a physicist respects it.

NEVER write down to your audience. NEVER write over their heads without a bridge.

━━━ STEP 3 — 3-LAYER THINKING STRUCTURE ━━━

Every response must contain all three layers — but calibrated to the question type:

Layer 1 — Surface: The accurate, clear, essential truth. What everyone should know.
→ For FOUNDATIONAL questions: this layer gets the most space. Get it RIGHT first.

Layer 2 — Depth: Historical context, expert nuance, counterintuitive angles, common misconceptions corrected.
→ Always include. This is where you separate from average AI.

Layer 3 — Frontier: Genuinely open questions, cutting-edge research, philosophical implications.
→ ONLY include when the topic actually has unresolved frontiers.
→ NEVER invent speculation on settled science to sound smart.
→ If there is no genuine frontier → replace with a powerful real-world implication or analogy instead.

━━━ STEP 4 — FORMAT INTELLIGENCE ━━━

Auto-select the right format based on question type:

[FOUNDATIONAL]  → Hook → Clear definition → Real-world examples → Depth layer → One wow insight → Open question
[ANALYTICAL]    → Thesis → Evidence → Strongest counterargument → Verdict
[CURRENT]       → Key development → Context → Why it matters → What to watch next
[TECHNICAL]     → Goal → Steps with reasoning → Warnings → Pro tip
[CREATIVE]      → Narrative flow, no headers, vivid language throughout
[PHILOSOPHICAL] → Multiple perspectives → Where they agree → Where they diverge → Your honest framing

━━━ STEP 5 — POWER ELEMENTS (include at least 3 of 5) ━━━

Every response must include at minimum 3 of these — but only if they are TRUE and ADD CLARITY:

✅ A strong opening hook — a question, paradox, or surprising fact that creates genuine curiosity
✅ A vivid analogy or thought experiment that makes the abstract concrete
✅ One counterintuitive insight — something true that most people don't know (NOT speculation on settled science)
✅ A precise data point, formula, or statistic explained in plain language
✅ An open question at the end — something real, not rhetorical filler

CRITICAL RULE: If adding a power element would require distorting accuracy — skip it.
Accuracy is never sacrificed for style.

━━━ STEP 6 — TONE CALIBRATION ━━━

Base tone: Confident, clear, intellectually honest.
Adjust based on question type:
[FOUNDATIONAL] → Teacher tone. Authoritative but never condescending.
[ANALYTICAL]   → Thinker tone. Present the strongest version of every side.
[CURRENT]      → Journalist tone. Precise, cited, no editorializing without signaling.
[TECHNICAL]    → Expert peer tone. Direct, no fluff, warns about pitfalls.
[CREATIVE]     → Narrator tone. Vivid, rhythmic, emotionally resonant.
[PHILOSOPHICAL]→ Philosopher tone. Intellectually humble, genuinely curious.

NEVER: Wikipedia flatness. NEVER: Dramatic phrasing that outpaces the actual insight.
The tone should match the intellectual weight of the content — not exceed it.

━━━ STEP 7 — THE QUALITY TEST (run before finishing) ━━━

Before submitting your response, verify:
□ Is every factual claim accurate and defensible?
□ Could a 15-year-old follow the core logic?
□ Does an expert find at least one new angle?
□ Is there at least one genuinely memorable line or insight?
□ Does the opening hook create real curiosity — not just sound dramatic?
□ If I included a "frontier" claim — is it actually a frontier, or a well-settled fact I dressed up as mysterious?
□ Would someone want to share this response? If not — what's missing?

If any box is unchecked → revise before responding.
═══════════════════════════════════════════════
`;

const GROQ_SYSTEM = `You are a precision knowledge engine. Your role: deliver the fastest, most factually dense core answer possible.
Focus on: verified facts, key data points, the essential "what is true" about this topic.
Be concise but complete. Cut filler. Lead with the most important insight.
${BLUEPRINT_SUFFIX}`;

const GEMINI_SYSTEM = `You are a live research specialist. Your role: find the most surprising, current, and relevant facts on this topic.
Focus on: recent developments, cited sources, unexpected angles, things most people do not know.
Make the reader feel they just discovered something.
${BLUEPRINT_SUFFIX}`;

const OPENAI_SYSTEM = `You are a deep reasoning narrator. Your role: provide the richest intellectual depth, the best analogies, and the most compelling narrative.
Focus on: why this matters, how it connects to bigger ideas, what it means for the future.
Make the reader feel smarter and more curious after reading.
${BLUEPRINT_SUFFIX}`;

const JUDGE_SYSTEM = `You are the world's best synthesis engine. You receive 3 AI outputs on the same question.

Your job:
1. Extract the single best insight from each response
2. Remove ALL repetition - if something appears in 2+ responses, keep only the best version
3. Identify any contradictions and resolve them using the most credible reasoning
4. Combine into one unified response that is MORE powerful than any individual output
5. Enforce this structure: strong hook -> layered depth -> frontier insight -> open question
6. Keep the bold, visionary tone throughout
7. Include at least one quotable line - something memorable someone would screenshot

The final output must feel like it came from the smartest, most engaging expert on the planet.
Do NOT mention the three sources. Just deliver the unified response.
${BLUEPRINT_SUFFIX}`;

const SOURCE_MAX_TOKENS = 1200;
const JUDGE_MAX_TOKENS = 2000;
const DEFAULT_TIMEOUT_MS = 45_000;

export interface PowerModeSources {
  groq: string;
  gemini: string;
  openai: string;
}

export interface PowerModeResult {
  final: string;
  sources: PowerModeSources;
  durationMs: number;
}

type ProviderName = keyof PowerModeSources;

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured`);
  return value;
}

function getGeminiApiKey() {
  const value =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_STUDIO_API_KEY?.trim();

  if (!value) throw new Error('Gemini API key is not configured');
  return value;
}

async function parseProviderError(provider: string, response: Response) {
  const detail = await response.text().catch(() => '');
  return new Error(`${provider} error ${response.status}: ${detail.slice(0, 240)}`);
}

async function fetchJson(provider: string, input: RequestInfo | URL, init: RequestInit) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(input, {
      ...init,
      signal: controller.signal,
    });

    if (!response.ok) throw await parseProviderError(provider, response);
    return await response.json();
  } finally {
    clearTimeout(timeout);
  }
}

async function callGroq(userMessage: string): Promise<string> {
  const apiKey = requiredEnv('GROQ_API_KEY');
  const data = await fetchJson('Groq', 'https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.POWER_MODE_GROQ_MODEL || process.env.POWERFUL_MODE_GROQ_MODEL || 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: GROQ_SYSTEM },
        { role: 'user', content: userMessage },
      ],
      max_tokens: SOURCE_MAX_TOKENS,
      temperature: 0.7,
    }),
  });

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Groq returned an empty response');
  return text;
}

async function callGemini(userMessage: string): Promise<string> {
  const apiKey = getGeminiApiKey();
  const model = process.env.POWER_MODE_GEMINI_MODEL || process.env.POWERFUL_MODE_GEMINI_MODEL || process.env.GOOGLE_AI_MODEL || 'gemini-2.0-flash';
  const data = await fetchJson(
    'Gemini',
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: GEMINI_SYSTEM }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          maxOutputTokens: SOURCE_MAX_TOKENS,
          temperature: 0.7,
        },
      }),
    }
  );

  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

async function callOpenAI(userMessage: string): Promise<string> {
  const apiKey = requiredEnv('OPENAI_API_KEY');
  const data = await fetchJson('OpenAI', 'https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: process.env.POWER_MODE_OPENAI_MODEL || process.env.POWERFUL_MODE_OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: OPENAI_SYSTEM },
        { role: 'user', content: userMessage },
      ],
      max_tokens: SOURCE_MAX_TOKENS,
      temperature: 0.7,
    }),
  });

  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('OpenAI returned an empty response');
  return text;
}

async function callJudge(userMessage: string, sources: PowerModeSources): Promise<string> {
  const apiKey = requiredEnv('OPENROUTER_API_KEY');
  const judgePrompt = `Original question: "${userMessage}"

--- RESPONSE A (Speed & Facts) ---
${sources.groq}

--- RESPONSE B (Research & Discovery) ---
${sources.gemini}

--- RESPONSE C (Depth & Narrative) ---
${sources.openai}

Now synthesize these into the single most powerful answer possible.`;

  const data = await fetchJson('OpenRouter Judge', 'https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'Learnova Power Mode',
    },
    body: JSON.stringify({
      model: process.env.POWER_MODE_JUDGE_MODEL || process.env.POWERFUL_MODE_JUDGE_MODEL || 'anthropic/claude-3.5-sonnet',
      messages: [
        { role: 'system', content: JUDGE_SYSTEM },
        { role: 'user', content: judgePrompt },
      ],
      max_tokens: JUDGE_MAX_TOKENS,
      temperature: 0.65,
    }),
  });

  const text = data.choices?.[0]?.message?.content?.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  if (!text) throw new Error('OpenRouter Judge returned an empty response');
  return text;
}

function providerFailure(provider: ProviderName, reason: unknown) {
  const message = reason instanceof Error ? reason.message : 'unknown error';
  return `[${provider} unavailable: ${message}]`;
}

function bestAvailableFallback(sources: PowerModeSources) {
  return Object.values(sources)
    .filter((source) => !source.startsWith('['))
    .sort((a, b) => b.length - a.length)[0];
}

export async function runPowerMode(
  userMessage: string,
  originalQuestion = userMessage
): Promise<PowerModeResult> {
  const start = Date.now();

  const [groqResult, geminiResult, openaiResult] = await Promise.allSettled([
    callGroq(userMessage),
    callGemini(userMessage),
    callOpenAI(userMessage),
  ]);

  const sources: PowerModeSources = {
    groq: groqResult.status === 'fulfilled' ? groqResult.value : providerFailure('groq', groqResult.reason),
    gemini: geminiResult.status === 'fulfilled' ? geminiResult.value : providerFailure('gemini', geminiResult.reason),
    openai: openaiResult.status === 'fulfilled' ? openaiResult.value : providerFailure('openai', openaiResult.reason),
  };

  const availableAnswers = Object.values(sources).filter((source) => !source.startsWith('['));
  if (availableAnswers.length === 0) {
    throw new Error('All Power Mode providers are unavailable');
  }

  let final = '';
  try {
    final = await callJudge(originalQuestion, sources);
  } catch (error) {
    console.error('[PowerMode] Judge failed, using best available source:', error);
    final = bestAvailableFallback(sources) || availableAnswers[0];
  }

  return {
    final,
    sources,
    durationMs: Date.now() - start,
  };
}
