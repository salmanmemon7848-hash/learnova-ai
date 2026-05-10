import { AIMessage, AIRouterOptions, routeAI } from './aiRouter';
import type { AIProviderName } from './ai/aiHandler';

export async function chatWithFallback(
  messages: AIMessage[],
  options: AIRouterOptions = {}
): Promise<{ text: string; provider: AIProviderName | null }> {
  const systemPrompt = messages.find((message) => message.role === 'system')?.content || '';
  return routeAI(messages, systemPrompt, options);
}
