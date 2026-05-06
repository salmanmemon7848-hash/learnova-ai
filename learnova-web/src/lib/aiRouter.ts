// Intelligent AI router — tries Groq first, falls back to Gemini automatically

import { chatWithGemini } from './gemini';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const AI_TIMEOUT_MS = parseInt(process.env.AI_TIMEOUT_MS || '10000', 10);

/*
THINKIOR AI ROUTER — FALLBACK RULES:

Groq is used FIRST because:
- Faster response times (avg 1-3 seconds)
- Better at following structured JSON prompts
- Primary provider for all features

Gemini is used as FALLBACK when:
1. Groq API returns HTTP error (429, 500, 503 etc.)
2. Groq times out after 10 seconds
3. Groq returns empty or blank response
4. Groq API key is missing or invalid

Gemini is NOT used as fallback when:
- Groq returns a valid response (even if short)
- The feature explicitly passes provider: 'groq' only

Users NEVER see which provider answered.
Logs are server-side only.
No UI changes happen during fallback.
*/

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRouterOptions {
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  feature?: string;
}

export async function routeAI(
  messages: AIMessage[],
  systemPrompt: string,
  options: AIRouterOptions = {}
): Promise<{ text: string; provider: 'groq' | 'gemini' }> {
  const {
    maxTokens = 2000,
    temperature = 0.7,
    timeoutMs = AI_TIMEOUT_MS,
    feature = 'unknown',
  } = options;

  console.log(`[AIRouter] Feature: ${feature} — trying Groq first`);

  try {
    const groqResult = await callGroq(messages, systemPrompt, maxTokens, temperature, timeoutMs);
    if (groqResult && groqResult.trim() !== '') {
      console.log(`[AIRouter] Groq succeeded for feature: ${feature}`);
      return { text: groqResult, provider: 'groq' };
    }
    console.warn('[AIRouter] Groq returned empty — trying Gemini fallback');
  } catch (groqError: any) {
    console.warn(`[AIRouter] Groq failed for ${feature}: ${groqError.message} — switching to Gemini`);
  }

  console.log(`[AIRouter] Trying Gemini fallback for feature: ${feature}`);

  try {
    const geminiResult = await chatWithGemini(
      messages.filter((m) => m.role !== 'system'),
      systemPrompt,
      maxTokens,
      timeoutMs + 5000
    );

    if (geminiResult && geminiResult.trim() !== '') {
      console.log(`[AIRouter] Gemini fallback succeeded for feature: ${feature}`);
      return { text: geminiResult, provider: 'gemini' };
    }

    throw new Error('Gemini also returned empty response');
  } catch (geminiError: any) {
    console.error(`[AIRouter] Both Groq and Gemini failed for ${feature}:`, geminiError.message);
    throw new Error(`All AI providers failed for ${feature}: ${geminiError.message}`);
  }
}

async function callGroq(
  messages: AIMessage[],
  systemPrompt: string,
  maxTokens: number,
  temperature: number,
  timeoutMs: number
): Promise<string> {
  if (!GROQ_API_KEY) throw new Error('GROQ_API_KEY is not set');

  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.filter((m) => m.role !== 'system'),
  ];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(GROQ_BASE_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        max_tokens: maxTokens,
        temperature,
        messages: allMessages,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Groq ${res.status}: ${errorText.slice(0, 150)}`);
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    if (!text) throw new Error('Groq returned empty content');
    return text;
  } catch (error: any) {
    clearTimeout(timeout);
    if (error?.name === 'AbortError') throw new Error('Groq timed out');
    throw error;
  }
}

export async function getAIResponse(
  messages: AIMessage[],
  systemPrompt: string,
  options: AIRouterOptions = {}
): Promise<string> {
  const result = await routeAI(messages, systemPrompt, options);
  return result.text;
}
