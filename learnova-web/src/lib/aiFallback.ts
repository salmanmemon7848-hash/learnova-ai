import { AIMessage, AIRouterOptions, routeAI } from './aiRouter';

export async function chatWithFallback(
  messages: AIMessage[],
  options: AIRouterOptions = {}
): Promise<{ text: string; provider: 'groq' | 'gemini' }> {
  const systemPrompt = messages.find((message) => message.role === 'system')?.content || '';
  return routeAI(messages, systemPrompt, options);
}
