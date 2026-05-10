import { NextResponse } from 'next/server';
import { aiHandler } from '@/lib/ai/aiHandler';

export async function GET() {
  // SECURITY: Internal health probe - fixed prompt only; no user input surface.
  const start = Date.now();

  try {
    const response = await aiHandler({
      prompt: 'Say OK',
      context: 'You are a test assistant. Reply with just the word OK.',
      featureName: 'health-check',
      isSearchFeature: false,
      taskComplexity: 'simple',
    });

    return NextResponse.json({
      status: response.result.trim().length > 0 ? 'ok' : 'degraded',
      ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({
      status: 'degraded',
      ms: Date.now() - start,
      timestamp: new Date().toISOString(),
    });
  }
}
