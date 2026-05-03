import Groq from 'groq-sdk';
import { GROQ_PRIMARY_MODEL, groqChatCompletion } from './groqCompletion';

export const DEFAULT_MODEL = GROQ_PRIMARY_MODEL;

let groqSingleton: Groq | null = null;

export function getGroqInternalClient(): Groq {
  return getGroq();
}

function getGroq(): Groq {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is not configured. Add it under Vercel → Project → Settings → Environment Variables, then redeploy.'
    );
  }
  if (!groqSingleton) {
    groqSingleton = new Groq({ apiKey });
  }
  return groqSingleton;
}

/** Lazy client so API routes can load on Vercel even if env is missing until the handler runs. */
export const groqClient = new Proxy({} as Groq, {
  get(_target, prop) {
    const client = getGroq();
    const value = (client as unknown as Record<PropertyKey, unknown>)[prop];
    if (typeof value === 'function') {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});

export function isGroqConfigured(): boolean {
  return Boolean(process.env.GROQ_API_KEY?.trim());
}

export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  try {
    const response = await groqChatCompletion(getGroq(), {
      model: DEFAULT_MODEL,
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error('Groq API error (generateText):', error?.message || error);

    if (error?.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    if (typeof error?.message === 'string' && error.message.includes('GROQ_API_KEY')) {
      throw error;
    }
    const status = error?.status ?? error?.response?.status;
    if (status === 401 || status === 403) {
      throw new Error(
        'AI API key is missing or invalid. Check GROQ_API_KEY in your deployment environment.'
      );
    }

    throw new Error('AI is temporarily unavailable. Please try again in a moment.');
  }
}

export async function chatWithHistory(
  messages: { role: string; content: string }[],
  systemPrompt?: string,
  modelOverride?: string,
  temperatureOverride?: number,
  maxTokensOverride?: number
): Promise<string> {
  const formatted: any[] = [];
  if (systemPrompt) formatted.push({ role: 'system', content: systemPrompt });
  formatted.push(...messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  })));

  try {
    let response;
    try {
      response = await groqChatCompletion(getGroq(), {
        model: modelOverride || DEFAULT_MODEL,
        messages: formatted,
        max_tokens: maxTokensOverride ?? 2048,
        temperature: temperatureOverride ?? 0.7,
      });
    } catch (primaryError) {
      if (!modelOverride) throw primaryError;
      console.warn(`Model override "${modelOverride}" failed, falling back to ${DEFAULT_MODEL}`);
      response = await groqChatCompletion(getGroq(), {
        model: DEFAULT_MODEL,
        messages: formatted,
        max_tokens: maxTokensOverride ?? 2048,
        temperature: temperatureOverride ?? 0.7,
      });
    }

    return response.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error('Groq API error (chatWithHistory):', error?.message || error);

    if (error?.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    if (typeof error?.message === 'string' && error.message.includes('GROQ_API_KEY')) {
      throw error;
    }
    const status = error?.status ?? error?.response?.status;
    if (status === 401 || status === 403) {
      throw new Error(
        'AI API key is missing or invalid. Check GROQ_API_KEY in your deployment environment.'
      );
    }

    throw new Error('AI is temporarily unavailable. Please try again in a moment.');
  }
}

export async function transcribeAudio(audioFile: File, language?: string, prompt?: string): Promise<string> {
  try {
    const transcription = await groqClient.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      language: language || 'en',
      prompt: prompt || '',
      response_format: 'json',
    });
    return transcription.text;
  } catch (error: any) {
    console.error('Groq Whisper error:', error?.message || error);
    throw new Error('Speech recognition failed. Please try again or type your answer.');
  }
}
