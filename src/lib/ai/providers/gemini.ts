import {
  AIProviderError,
  TaskComplexity,
  buildPrompt,
  classifyProviderFailure,
  normalizeThrownError,
} from '../types';

const GEMINI_BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models';
const TIMEOUT_MS = 25_000;
const VISION_TIMEOUT_MS = 30_000;
const MAX_RETRIES = 2;

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(url: string, options: RequestInit, retryCount = 0): Promise<Response> {
  const response = await fetch(url, options);

  if (response.status === 429 && retryCount < MAX_RETRIES) {
    console.warn(`[Gemini] Rate limited (429), retrying... (${retryCount + 1}/${MAX_RETRIES})`);
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
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_STUDIO_API_KEY?.trim();

  if (!apiKey) {
    throw new AIProviderError('gemini', 'configuration', 'Gemini API key is not configured');
  }

  const primaryModel: string = taskComplexity === 'complex' ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
  const fallbackModel: string = 'gemini-1.5-flash';

  const makeCall = async (model: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const body: any = {
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      };

      // Add system instruction if context is provided
      if (context?.trim()) {
        body.systemInstruction = {
          parts: [{ text: context.trim() }],
        };
      }

      const response = await fetchWithRetry(`${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Gemini Text] API error — Status: ${response.status}, Model: ${model}, Body: ${errorText}`);
        throw classifyProviderFailure('gemini', response.status, errorText);
      }

      const data = (await response.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
      if (!text) {
        throw new AIProviderError('gemini', 'empty_response', 'Gemini returned an empty response');
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
      console.warn(`[Gemini] Primary model ${primaryModel} failed with 429, falling back to ${fallbackModel}`);
      return await makeCall(fallbackModel);
    }
    throw error;
  }
}

export async function callVision(
  prompt: string,
  imageBase64: string,
  mimeType: string,
  taskComplexity: TaskComplexity = 'simple'
): Promise<string> {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_STUDIO_API_KEY?.trim();

  if (!apiKey) {
    throw new AIProviderError('gemini', 'configuration', 'Gemini API key is not configured');
  }

  const primaryModel: string = 'gemini-1.5-flash';
  const fallbackModel: string = 'gemini-2.0-flash';

  const makeCall = async (model: string) => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS);
    try {
      const body: any = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: imageBase64,
                },
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 4096,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      };

      const response = await fetchWithRetry(`${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[Gemini Vision] API error — Status: ${response.status}, Model: ${model}, Body: ${errorText}`);
        throw classifyProviderFailure('gemini', response.status, errorText);
      }

      const data = (await response.json()) as GeminiResponse;
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
      if (!text) {
        throw new AIProviderError('gemini', 'empty_response', 'Gemini returned an empty vision response');
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
      console.warn(`[Gemini] Vision primary model ${primaryModel} failed with 429, falling back to ${fallbackModel}`);
      return await makeCall(fallbackModel);
    }
    throw error;
  }
}
