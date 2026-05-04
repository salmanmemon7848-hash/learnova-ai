import { NextResponse } from 'next/server';
import { getAIResponse } from '@/lib/aiRouter';
import { chatWithGemini } from '@/lib/gemini';

export async function GET() {
  // SECURITY: Internal health probe — fixed prompts only; no user input surface.
  const results: Record<string, any> = {};

  try {
    const start = Date.now();
    await getAIResponse(
      [{ role: 'user', content: 'Say OK' }],
      'You are a test assistant. Reply with just the word OK.',
      { maxTokens: 10, feature: 'health-check' }
    );
    results.groq = { status: 'ok', ms: Date.now() - start };
  } catch (e: any) {
    results.groq = { status: 'error', error: e.message };
  }

  try {
    const start = Date.now();
    await chatWithGemini(
      [{ role: 'user', content: 'Say OK' }],
      'You are a test assistant. Reply with just the word OK.',
      10
    );
    results.gemini = { status: 'ok', ms: Date.now() - start };
  } catch (e: any) {
    results.gemini = { status: 'error', error: e.message };
  }

  const allOk = Object.values(results).every((r: any) => r.status === 'ok');

  return NextResponse.json({
    status: allOk ? 'all systems ok' : 'degraded',
    providers: results,
    timestamp: new Date().toISOString(),
  });
}
