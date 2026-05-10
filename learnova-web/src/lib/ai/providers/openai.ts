import {
  AIProviderError,
  TaskComplexity,
  buildPrompt,
  classifyProviderFailure,
  normalizeThrownError,
} from '../types';

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const TIMEOUT_MS = 10_000;

interface OpenAIResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
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

  const model = taskComplexity === 'complex' ? 'gpt-4o' : 'gpt-4o-mini';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(OPENAI_API_URL, {
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
  } catch (error) {
    throw normalizeThrownError('openai', error);
  } finally {
    clearTimeout(timeout);
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
