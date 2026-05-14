export type AIProviderName = 'groq' | 'gemini' | 'openai' | 'searxng';

export type TaskComplexity = 'simple' | 'complex';

export interface AIHandlerInput {
  prompt: string;
  context?: string;
  featureName: string;
  isSearchFeature: boolean;
  taskComplexity: TaskComplexity;
}

export interface AIHandlerOutput {
  result: string;
  provider: AIProviderName | null;
  fallbackTriggered: boolean;
  failedProviders?: string[];
}

export interface AIVisionHandlerInput {
  prompt: string;
  imageBase64: string;
  mimeType: string;
  featureName: string;
  taskComplexity: TaskComplexity;
}

export type ProviderErrorReason =
  | 'rate_limit'
  | 'quota_exhausted'
  | 'unauthorized'
  | 'timeout'
  | 'network'
  | 'provider_down'
  | 'empty_response'
  | 'bad_request'
  | 'configuration'
  | 'unknown';

export class AIProviderError extends Error {
  readonly provider: AIProviderName;
  readonly reason: ProviderErrorReason;
  readonly status?: number;
  readonly shouldFallback: boolean;

  constructor(
    provider: AIProviderName,
    reason: ProviderErrorReason,
    message: string,
    options: { status?: number; shouldFallback?: boolean; cause?: unknown } = {}
  ) {
    super(message);
    this.name = 'AIProviderError';
    this.provider = provider;
    this.reason = reason;
    this.status = options.status;
    this.shouldFallback = options.shouldFallback ?? reason !== 'bad_request';
    this.cause = options.cause;
  }
}

export function buildPrompt(prompt: string, context?: string): string {
  const cleanPrompt = prompt.trim();
  const cleanContext = context?.trim();
  if (!cleanContext) return cleanPrompt;
  return `${cleanContext}\n\nUser request:\n${cleanPrompt}`;
}

export function classifyProviderFailure(
  provider: AIProviderName,
  status: number,
  body: string
): AIProviderError {
  const lower = body.toLowerCase();

  if (status === 429) {
    return new AIProviderError(provider, 'rate_limit', `${provider} rate limit exceeded`, { status });
  }

  if (status === 401 || status === 403) {
    return new AIProviderError(provider, 'unauthorized', `${provider} unauthorized`, { status });
  }

  if (status === 500 || status === 503) {
    return new AIProviderError(provider, 'provider_down', `${provider} unavailable`, { status });
  }

  if (
    lower.includes('quota') ||
    lower.includes('billing') ||
    lower.includes('insufficient_quota') ||
    lower.includes('limit exceeded')
  ) {
    return new AIProviderError(provider, 'quota_exhausted', `${provider} quota exhausted`, { status });
  }

  if (status >= 400 && status < 500) {
    return new AIProviderError(provider, 'bad_request', `${provider} rejected request`, {
      status,
      shouldFallback: false,
    });
  }

  return new AIProviderError(provider, 'unknown', `${provider} request failed`, { status });
}

export function normalizeThrownError(
  provider: AIProviderName,
  error: unknown
): AIProviderError {
  if (error instanceof AIProviderError) return error;

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new AIProviderError(provider, 'timeout', `${provider} request timed out`, {
      shouldFallback: true,
      cause: error,
    });
  }

  if (error instanceof Error) {
    return new AIProviderError(provider, 'network', error.message || `${provider} network error`, {
      shouldFallback: true,
      cause: error,
    });
  }

  return new AIProviderError(provider, 'unknown', `${provider} failed`, {
    shouldFallback: true,
    cause: error,
  });
}
