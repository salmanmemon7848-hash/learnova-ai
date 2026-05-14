const POWER_MODE_SYSTEM_PROMPT = `You are an advanced AI assistant operating in POWERFUL MODE. Your task is to deliver the most thorough, accurate, and deeply researched answer possible.

INSTRUCTIONS:
- Analyze the user's question and determine its true depth and scope before answering.
- Use the provided [WEB CONTEXT] to enrich your answer with current, real-world information. Cite sources where relevant.
- Structure your answer clearly: use headers, bullet points, numbered steps, or prose — whatever best fits the question type.
- For technical questions: provide working examples, edge cases, and explain the "why" not just the "what".
- For conceptual questions: use analogies, comparisons, and real-world applications.
- For factual questions: be precise, include data/statistics from web context, and acknowledge uncertainty where it exists.
- Do NOT truncate your answer. A complete answer is always preferred over a brief one in Powerful Mode.
- Do NOT add unnecessary disclaimers or padding. Every sentence must add value.
- Match answer depth to question complexity: a complex multi-part question deserves a long structured answer; a focused question deserves a focused but complete answer.
- Always end with a concise summary or key takeaway if the answer is longer than 300 words.`;

const DEFAULT_TIMEOUT_MS = 15_000;

export interface PowerModeResult {
  final: string;
  provider: string;
  durationMs: number;
}

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

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = DEFAULT_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function callGroq(userMessage: string): Promise<string> {
  const apiKey = requiredEnv('GROQ_API_KEY');
  const model = process.env.POWER_MODE_GROQ_MODEL || 'llama-3.3-70b-versatile';

  const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: POWER_MODE_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`Groq error ${response.status}`);
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('Groq returned an empty response');
  return text;
}

async function callGemini(userMessage: string): Promise<string> {
  const apiKey = getGeminiApiKey();
  const model = process.env.POWER_MODE_GEMINI_MODEL || 'gemini-2.0-flash';

  const response = await fetchWithTimeout(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: POWER_MODE_SYSTEM_PROMPT }] },
        contents: [{ role: 'user', parts: [{ text: userMessage }] }],
        generationConfig: {
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) throw new Error(`Gemini error ${response.status}`);
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

async function callOpenAI(userMessage: string): Promise<string> {
  const apiKey = requiredEnv('OPENAI_API_KEY');
  const model = process.env.POWER_MODE_OPENAI_MODEL || 'gpt-4o';

  const response = await fetchWithTimeout('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: POWER_MODE_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`OpenAI error ${response.status}`);
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error('OpenAI returned an empty response');
  return text;
}

async function callOpenRouter(userMessage: string): Promise<string> {
  const apiKey = requiredEnv('OPENROUTER_API_KEY');
  const model = process.env.POWER_MODE_OPENROUTER_MODEL || 'anthropic/claude-3.5-sonnet';

  const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      'X-Title': 'Learnova Power Mode',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: POWER_MODE_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
    }),
  });

  if (!response.ok) throw new Error(`OpenRouter error ${response.status}`);
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
  if (!text) throw new Error('OpenRouter returned an empty response');
  return text;
}

export async function runPowerMode(
  userMessage: string,
  onStatusUpdate?: (status: string) => void
): Promise<PowerModeResult> {
  const start = Date.now();

  // 1. Try Groq
  try {
    onStatusUpdate?.('groq_working');
    const final = await callGroq(userMessage);
    onStatusUpdate?.('generating');
    return { final, provider: 'groq', durationMs: Date.now() - start };
  } catch (error) {
    console.warn('[PowerMode] Groq failed, trying Gemini...', error);
  }

  // 2. Try Gemini
  try {
    onStatusUpdate?.('gemini_working');
    const final = await callGemini(userMessage);
    onStatusUpdate?.('generating');
    return { final, provider: 'gemini', durationMs: Date.now() - start };
  } catch (error) {
    console.warn('[PowerMode] Gemini failed, trying OpenAI...', error);
  }

  // 3. Try OpenAI
  try {
    onStatusUpdate?.('openai_working');
    const final = await callOpenAI(userMessage);
    onStatusUpdate?.('generating');
    return { final, provider: 'openai', durationMs: Date.now() - start };
  } catch (error) {
    console.warn('[PowerMode] OpenAI failed, trying OpenRouter...', error);
  }

  // 4. Try OpenRouter
  try {
    onStatusUpdate?.('openrouter_working');
    const final = await callOpenRouter(userMessage);
    onStatusUpdate?.('generating');
    return { final, provider: 'openrouter', durationMs: Date.now() - start };
  } catch (error) {
    console.error('[PowerMode] All providers failed:', error);
    throw new Error('All AI providers are currently unavailable. Please try again later.');
  }
}
