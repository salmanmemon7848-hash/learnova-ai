import {
  AIProviderError,
  buildPrompt,
  classifyProviderFailure,
  normalizeThrownError,
} from '../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const TIMEOUT_MS = 25_000;

interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export async function call(prompt: string, context?: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new AIProviderError('groq', 'configuration', 'GROQ_API_KEY is not configured');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: buildPrompt(prompt, context) }],
        temperature: 0.7,
        max_tokens: 4096,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw classifyProviderFailure('groq', response.status, errorText);
    }

    const data = (await response.json()) as GroqResponse;
    const text = data.choices?.[0]?.message?.content?.trim() ?? '';
    if (!text) {
      throw new AIProviderError('groq', 'empty_response', 'Groq returned an empty response');
    }

    return text;
  } catch (error) {
    throw normalizeThrownError('groq', error);
  } finally {
    clearTimeout(timeout);
  }
}
