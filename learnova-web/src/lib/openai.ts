import Groq from 'groq-sdk';

const apiKey = process.env.GROQ_API_KEY;
if (!apiKey) throw new Error('GROQ_API_KEY is not set in .env.local');

export const groqClient = new Groq({ apiKey });
export const DEFAULT_MODEL = 'llama-3.3-70b-versatile';

export async function generateText(prompt: string, systemPrompt?: string): Promise<string> {
  const messages: any[] = [];
  if (systemPrompt) messages.push({ role: 'system', content: systemPrompt });
  messages.push({ role: 'user', content: prompt });

  try {
    // Add 30 second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await groqClient.chat.completions.create({
      model: DEFAULT_MODEL,
      messages,
      max_tokens: 2048,
      temperature: 0.7,
    });

    clearTimeout(timeout);
    return response.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error('Groq API error (generateText):', error?.message || error);
    
    // Return user-friendly error message
    if (error?.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    
    throw new Error('AI is temporarily unavailable. Please try again in a moment.');
  }
}

export async function chatWithHistory(
  messages: { role: string; content: string }[],
  systemPrompt?: string,
  modelOverride?: string,
  temperatureOverride?: number,
  maxTokensOverride?: number
): Promise<string> {
  const formatted: any[] = [];
  if (systemPrompt) formatted.push({ role: 'system', content: systemPrompt });
  formatted.push(...messages.map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  })));

  const runChat = async (model: string) => {
    return groqClient.chat.completions.create({
      model,
      messages: formatted,
      max_tokens: maxTokensOverride ?? 2048,
      temperature: temperatureOverride ?? 0.7,
    });
  };

  try {
    // Add 30 second timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    let response;
    try {
      response = await runChat(modelOverride || DEFAULT_MODEL);
    } catch (primaryError) {
      if (!modelOverride) throw primaryError;
      console.warn(`Model override "${modelOverride}" failed, falling back to ${DEFAULT_MODEL}`);
      response = await runChat(DEFAULT_MODEL);
    }

    clearTimeout(timeout);
    return response.choices[0]?.message?.content || '';
  } catch (error: any) {
    console.error('Groq API error (chatWithHistory):', error?.message || error);
    
    // Return user-friendly error message
    if (error?.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    
    throw new Error('AI is temporarily unavailable. Please try again in a moment.');
  }
}

export async function transcribeAudio(audioFile: File, language?: string, prompt?: string): Promise<string> {
  try {
    const transcription = await groqClient.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-large-v3',
      language: language || 'en',
      prompt: prompt || '',
      response_format: 'json',
    });
    return transcription.text;
  } catch (error: any) {
    console.error('Groq Whisper error:', error?.message || error);
    throw new Error('Speech recognition failed. Please try again or type your answer.');
  }
}
