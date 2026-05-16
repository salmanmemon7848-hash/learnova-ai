/**
 * Global Rate Limit Handling Utility
 * Provides consistent messaging and response handling across all AI features.
 */

export interface RateLimitResponse {
  success: false;
  error: 'rate_limit_exceeded';
  message: string;
}

export interface PowerfulModeSources {
  openai: string;
  gemini: string;
  groq: string;
}

export interface PowerfulModeMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface PowerfulModeResponse {
  reply: string;
  sessionId: string | null;
  provider: string;
  durationMs?: number;
}

/**
 * Generates a human-readable message based on the feature that reached its limit.
 */
export function getRateLimitMessage(feature: string): string {
  const featureMap: Record<string, string> = {
    'Powerful Mode': 'daily Powerful Mode limit',
    'Normal Chat': 'daily message limit',
    'General Chat': 'daily message limit',
    'Image Upload': 'daily image upload limit',
    'AI Tools': 'tool usage limit',
  };

  const limitName = featureMap[feature] || `${feature} limit`;
  return `You’ve reached your ${limitName}. Please try again later or upgrade your plan.`;
}

/**
 * Universal handler for API responses to catch 429 errors globally.
 */
export async function handleApiResponse(response: Response, featureName: string): Promise<Response | RateLimitResponse> {
  if (response.status === 429) {
    const data = await response.json().catch(() => ({}));
    return {
      success: false,
      error: 'rate_limit_exceeded',
      message: data.message || getRateLimitMessage(featureName),
    };
  }

  return response;
}

/**
 * Helper to check if a result is a rate limit error.
 */
export function isRateLimitError(result: any): result is RateLimitResponse {
  return result && typeof result === 'object' && result.error === 'rate_limit_exceeded';
}
