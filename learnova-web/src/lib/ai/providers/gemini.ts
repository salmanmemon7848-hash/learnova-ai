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

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
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

  const model = taskComplexity === 'complex' ? 'gemini-pro-latest' : 'gemini-flash-latest';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: buildPrompt(prompt, context) }],
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
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw classifyProviderFailure('gemini', response.status, errorText);
    }

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    if (!text) {
      throw new AIProviderError('gemini', 'empty_response', 'Gemini returned an empty response');
    }

    return text;
  } catch (error) {
    throw normalizeThrownError('gemini', error);
  } finally {
    clearTimeout(timeout);
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

  const model = taskComplexity === 'complex' ? 'gemini-1.5-pro' : 'gemini-1.5-flash';
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), VISION_TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_BASE_URL}/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
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
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw classifyProviderFailure('gemini', response.status, errorText);
    }

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
    if (!text) {
      throw new AIProviderError('gemini', 'empty_response', 'Gemini returned an empty vision response');
    }

    return text;
  } catch (error) {
    throw normalizeThrownError('gemini', error);
  } finally {
    clearTimeout(timeout);
  }
}
