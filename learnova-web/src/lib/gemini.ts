// Google AI Studio (Gemini) API utility — used as fallback when Groq fails

const GEMINI_API_KEY = process.env.GOOGLE_AI_STUDIO_API_KEY;
const GEMINI_MODEL = 'gemini-1.5-flash';
const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export function toGeminiMessages(
  messages: { role: string; content: string }[],
  systemPrompt?: string
): { system: string; history: GeminiMessage[] } {
  const system = systemPrompt || '';

  const history: GeminiMessage[] = messages
    .filter((m) => m.role === 'user' || m.role === 'assistant')
    .map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }],
    }));

  const fixed: GeminiMessage[] = [];
  for (let i = 0; i < history.length; i += 1) {
    if (i === 0 && history[i].role === 'model') continue;
    if (fixed.length > 0 && fixed[fixed.length - 1].role === history[i].role) {
      fixed[fixed.length - 1].parts[0].text += `\n${history[i].parts[0].text}`;
    } else {
      fixed.push(history[i]);
    }
  }

  return { system, history: fixed };
}

export async function chatWithGemini(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  maxTokens: number = 2000,
  timeoutMs: number = 15000
): Promise<string> {
  if (!GEMINI_API_KEY) {
    throw new Error('GOOGLE_AI_STUDIO_API_KEY is not set');
  }

  const { system, history } = toGeminiMessages(messages, systemPrompt);

  const lastUserMessage =
    history[history.length - 1]?.role === 'user'
      ? history[history.length - 1].parts[0].text
      : 'Please continue.';

  const conversationHistory = history.slice(0, -1);

  const requestBody = {
    system_instruction: system ? { parts: [{ text: system }] } : undefined,
    contents: [
      ...conversationHistory,
      { role: 'user', parts: [{ text: lastUserMessage }] },
    ],
    generationConfig: {
      maxOutputTokens: maxTokens,
      temperature: 0.7,
    },
    safetySettings: [
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
    ],
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(
      `${GEMINI_BASE_URL}/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Gemini API error ${res.status}: ${errorText.slice(0, 200)}`);
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text || text.trim() === '') {
      throw new Error('Gemini returned empty response');
    }

    console.log('[Gemini] Response received successfully');
    return text;
  } catch (error: any) {
    clearTimeout(timeout);
    if (error?.name === 'AbortError') {
      throw new Error('Gemini request timed out');
    }
    throw error;
  }
}

export async function askGemini(
  prompt: string,
  systemPrompt: string = '',
  maxTokens: number = 2000
): Promise<string> {
  return chatWithGemini([{ role: 'user', content: prompt }], systemPrompt, maxTokens);
}
