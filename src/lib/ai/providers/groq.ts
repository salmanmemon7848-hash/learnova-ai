import {
  AIProviderError,
  buildPrompt,
  classifyProviderFailure,
  normalizeThrownError,
} from '../types';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const FALLBACK_MODEL = 'llama-3.1-8b-instant';
const TIMEOUT_MS = 25_000;
const MAX_RETRIES = 2;

interface GroqResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: RequestInit, retryCount = 0): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 429 && retryCount < MAX_RETRIES) {
    console.warn(`[Groq] Rate limited (429), retrying... (${retryCount + 1}/${MAX_RETRIES})`);
    await wait(1000 * (retryCount + 1));
    return fetchWithRetry(url, options, retryCount + 1);
  }

  return response;
}

export async function call(prompt: string, context?: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    throw new AIProviderError('groq', 'configuration', 'GROQ_API_KEY is not configured');
  }

  const makeCall = async (model: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetchWithRetry(GROQ_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
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
    } finally {
      clearTimeout(timeout);
    }
  };

  try {
    return await makeCall(GROQ_MODEL);
  } catch (error) {
    if (error instanceof AIProviderError && error.reason === 'rate_limit') {
      console.warn(`[Groq] Primary model ${GROQ_MODEL} failed with 429, falling back to ${FALLBACK_MODEL}`);
      return await makeCall(FALLBACK_MODEL);
    }
    throw error;
  }
}
