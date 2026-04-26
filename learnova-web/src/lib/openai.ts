import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error('GROQ_API_KEY is not set in .env.local');

export const groqClient = new Groq({ apiKey });
export const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  const response = await groqClient.chat.completions.create({
    model: DEFAULT_MODEL,
    messages,
    max_tokens: 2048,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || '';
}

export async function chatWithHistory(
  messages: { role: string; content: string }[],
  systemPrompt?: string
): Promise<string> {
  const formatted: any[] = [];
  if (systemPrompt) formatted.push({ role: 'system', content: systemPrompt });
  formatted.push(...messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  })));

  const response = await groqClient.chat.completions.create({
    model: DEFAULT_MODEL,
    messages: formatted,
    max_tokens: 2048,
    temperature: 0.7,
  });

  return response.choices[0]?.message?.content || '';
}
