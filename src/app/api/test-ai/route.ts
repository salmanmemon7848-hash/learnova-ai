import { aiHandler } from '@/lib/ai/aiHandler';
import { NextResponse } from 'next/server';

export async function GET() {
  // SECURITY: Diagnostic endpoint - fixed prompt only; consider restricting by deployment policy.
  try {
    const response = await aiHandler({
      prompt: 'Say exactly: Learnova AI fallback chain is working.',
      featureName: 'test-ai',
      isSearchFeature: false,
      taskComplexity: 'simple',
    });

    return NextResponse.json({ success: true, message: response.result });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Our AI is temporarily unavailable. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
