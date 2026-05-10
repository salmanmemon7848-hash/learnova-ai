import Groq from 'groq-sdk';
import { GROQ_PRIMARY_MODEL } from './groqCompletion';
import { aiHandler, messagesToPrompt } from './ai/aiHandler';

export const DEFAULT_MODEL = GROQ_PRIMARY_MODEL;

let groqSingleton: Groq | null = null;

export function getGroqInternalClient(): Groq {
  return getGroq();
}

function getGroq(): Groq {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      'GROQ_API_KEY is not configured. Add it under Vercel Project Settings Environment Variables, then redeploy.'
    );
  }
  if (!groqSingleton) {
    groqSingleton = new Groq({ apiKey });
  }
  return groqSingleton;
}

/** Lazy client retained for non-text Groq APIs such as Whisper transcription. */
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
  const response = await aiHandler({
    prompt,
    context: systemPrompt,
    featureName: 'generateText',
    isSearchFeature: false,
    taskComplexity: 'simple',
  });

  return response.result;
}

export async function chatWithHistory(
  messages: { role: string; content: string }[],
  systemPrompt?: string,
  modelOverride?: string,
  temperatureOverride?: number,
  maxTokensOverride?: number
): Promise<string> {
  void temperatureOverride;
  void maxTokensOverride;
  console.log('[chatWithHistory] Called - messages:', messages.length);

  const filteredMessages = messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role === 'assistant' ? ('assistant' as const) : ('user' as const),
      content: message.content,
    }));

  const response = await aiHandler({
    prompt: messagesToPrompt(filteredMessages),
    context: systemPrompt || '',
    featureName: modelOverride ? `chatWithHistory:${modelOverride}` : 'chatWithHistory',
    isSearchFeature: false,
    taskComplexity: 'simple',
  });

  return response.result;
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Groq Whisper error:', message);
    throw new Error('Speech recognition failed. Please try again or type your answer.');
  }
}
