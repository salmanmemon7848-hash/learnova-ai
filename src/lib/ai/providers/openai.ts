import {
  AIProviderError,
  TaskComplexity,
  buildPrompt,
  classifyProviderFailure,
  normalizeThrownError,
} from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 25_000;
const MAX_RETRIES = 2;

interface OpenAIResponse {
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
    console.warn(`[OpenAI] Rate limited (429), retrying... (${retryCount + 1}/${MAX_RETRIES})`);
    await wait(1000 * (retryCount + 1));
    return fetchWithRetry(url, options, retryCount + 1);
  }

  return response;
}

type OpenAIMessageContent =
  | string
  | Array<
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } }
    >;

async function callOpenAI(content: OpenAIMessageContent, taskComplexity: TaskComplexity): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) {
    throw new AIProviderError('openai', 'configuration', 'OPENAI_API_KEY is not configured');
  }

  const primaryModel = taskComplexity === 'complex' ? 'gpt-4o' : 'gpt-4o-mini';
  const fallbackModel = 'gpt-4o-mini';

  const makeCall = async (model: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetchWithRetry(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content }],
          temperature: 0.7,
          max_tokens: 4096,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw classifyProviderFailure('openai', response.status, errorText);
      }

      const data = (await response.json()) as OpenAIResponse;
      const text = data.choices?.[0]?.message?.content?.trim() ?? '';
      if (!text) {
        throw new AIProviderError('openai', 'empty_response', 'OpenAI returned an empty response');
      }
      return text;
    } finally {
      clearTimeout(timeout);
    }
  };

  try {
    return await makeCall(primaryModel);
  } catch (error) {
    if (primaryModel !== fallbackModel && error instanceof AIProviderError && error.code === 'rate_limit') {
      console.warn(`[OpenAI] Primary model ${primaryModel} failed with 429, falling back to ${fallbackModel}`);
      return await makeCall(fallbackModel);
    }
    throw error;
  }
}

export async function call(
  prompt: string,
  context?: string,
  taskComplexity: TaskComplexity = 'simple'
): Promise<string> {
  return callOpenAI(buildPrompt(prompt, context), taskComplexity);
}

export async function callVision(
  prompt: string,
  imageBase64: string,
  mimeType: string,
  taskComplexity: TaskComplexity = 'simple'
): Promise<string> {
  return callOpenAI(
    [
      { type: 'text', text: prompt },
      { type: 'image_url', image_url: { url: `data:${mimeType};base64,${imageBase64}` } },
    ],
    taskComplexity
  );
}
