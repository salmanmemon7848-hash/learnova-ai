import {
  AIProviderError,
  TaskComplexity,
  buildPrompt,
  classifyProviderFailure,
  normalizeThrownError,
} from '../types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const TIMEOUT_MS = 25_000;
const MAX_RETRIES = 2;

interface OpenRouterResponse {
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
    console.warn(`[OpenRouter] Rate limited (429), retrying... (${retryCount + 1}/${MAX_RETRIES})`);
    await wait(1000 * (retryCount + 1));
    return fetchWithRetry(url, options, retryCount + 1);
  }

  return response;
}

export async function call(
  prompt: string,
  context?: string,
  taskComplexity: TaskComplexity = 'simple'
): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY?.trim();
  if (!apiKey) {
    throw new AIProviderError('openrouter', 'configuration', 'OPENROUTER_API_KEY is not configured');
  }

  // Use high-performance models via OpenRouter
  const primaryModel = taskComplexity === 'complex' ? 'anthropic/claude-3.5-sonnet' : 'meta-llama/llama-3.1-70b-instruct';
  const fallbackModel = 'mistralai/mistral-7b-instruct:free';

  const makeCall = async (model: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetchWithRetry(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://learnova-ai.com', // Optional, for OpenRouter analytics
          'X-Title': 'Learnova AI',
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
        throw classifyProviderFailure('openrouter', response.status, errorText);
      }

      const data = (await response.json()) as OpenRouterResponse;
      const text = data.choices?.[0]?.message?.content?.trim() ?? '';
      if (!text) {
        throw new AIProviderError('openrouter', 'empty_response', 'OpenRouter returned an empty response');
      }
      return text;
    } finally {
      clearTimeout(timeout);
    }
  };

  try {
    return await makeCall(primaryModel);
  } catch (error) {
    if (primaryModel !== fallbackModel && error instanceof AIProviderError && error.reason === 'rate_limit') {
      console.warn(`[OpenRouter] Primary model ${primaryModel} failed with 429, falling back to ${fallbackModel}`);
      return await makeCall(fallbackModel);
    }
    throw error;
  }
}
