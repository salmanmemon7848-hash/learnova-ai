import { aiHandler, messagesToPrompt, type AIChatMessage } from './ai/aiHandler';

export interface GeminiMessage {
  role: 'user' | 'model';
  parts: { text: string }[];
}

export function toGeminiMessages(
  messages: { role: string; content: string }[],
  systemPrompt?: string
): { system: string; history: GeminiMessage[] } {
  return {
    system: systemPrompt || '',
    history: messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .map((message) => ({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content || '' }],
      })),
  };
}

export async function chatWithGemini(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  maxTokens: number = 2000,
  timeoutMs: number = 15000
): Promise<string> {
  void maxTokens;
  void timeoutMs;

  const aiMessages: AIChatMessage[] = messages
    .filter((message) => message.role === 'user' || message.role === 'assistant')
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: message.content,
    }));

  const response = await aiHandler({
    prompt: messagesToPrompt(aiMessages),
    context: systemPrompt,
    featureName: 'legacy-gemini-wrapper',
    isSearchFeature: false,
    taskComplexity: 'simple',
  });

  return response.result;
}

export async function askGemini(
  prompt: string,
  systemPrompt: string = '',
  maxTokens: number = 2000
): Promise<string> {
  void maxTokens;

  const response = await aiHandler({
    prompt,
    context: systemPrompt,
    featureName: 'legacy-gemini-wrapper',
    isSearchFeature: false,
    taskComplexity: 'simple',
  });

  return response.result;
}
