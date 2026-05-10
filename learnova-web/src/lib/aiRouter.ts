import { aiHandler, messagesToPrompt, type AIProviderName } from './ai/aiHandler';

export interface AIMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIRouterOptions {
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
  feature?: string;
  isSearchFeature?: boolean;
  taskComplexity?: 'simple' | 'complex';
}

export async function routeAI(
  messages: AIMessage[],
  systemPrompt: string,
  options: AIRouterOptions = {}
): Promise<{ text: string; provider: AIProviderName | null }> {
  void options.maxTokens;
  void options.temperature;
  void options.timeoutMs;

  const result = await aiHandler({
    prompt: messagesToPrompt(messages),
    context: systemPrompt,
    featureName: options.feature || 'unknown',
    isSearchFeature: options.isSearchFeature ?? false,
    taskComplexity: options.taskComplexity ?? 'simple',
  });

  return { text: result.result, provider: result.provider };
}

export async function getAIResponse(
  messages: AIMessage[],
  systemPrompt: string,
  options: AIRouterOptions = {}
): Promise<string> {
  const result = await routeAI(messages, systemPrompt, options);
  return result.text;
}
