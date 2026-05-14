import { aiHandler } from '@/lib/ai/aiHandler';
import { NextResponse } from 'next/server';

export async function GET() {
  // SECURITY: Diagnostic endpoint - fixed prompt only; consider restricting by deployment policy.
  try {
    const response = await aiHandler({
      prompt:
        'Return ONLY this JSON array with no other text: [{"name":"Test Idea","category":"Test","description":"This is a test","difficulty":"Easy","viabilityScore":80,"scores":{"market_demand":80,"profit_potential":75,"ease_of_execution":85,"india_fit":90},"revenue":"Rs 10,000/month","investment":"Rs 0","timeToRevenue":"1 week","whyPerfect":"Test","howItWorks":"Test","revenueModel":"Test","firstSteps":["Step 1","Step 2","Step 3"],"indianExamples":"Test","toolsNeeded":["Tool1"],"risks":"Test","competitiveEdge":"Test"}]',
      featureName: 'test-business',
      isSearchFeature: false,
      taskComplexity: 'complex',
    });

    const text = response.result;
    let parsed: unknown = null;

    try {
      parsed = JSON.parse(text.trim());
    } catch {}

    if (!parsed) {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) {
        try {
          parsed = JSON.parse(match[0]);
        } catch {}
      }
    }

    return NextResponse.json({
      success: Boolean(parsed),
      rawLength: text.length,
      parsed,
      rawPreview: text.substring(0, 300),
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Our AI is temporarily unavailable. Please try again in a moment.' },
      { status: 500 }
    );
  }
}
