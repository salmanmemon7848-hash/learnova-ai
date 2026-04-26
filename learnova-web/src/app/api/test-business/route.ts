import { generateText } from '@/lib/openai';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const text = await generateText(
      'Return ONLY this JSON array with no other text: [{"name":"Test Idea","category":"Test","description":"This is a test","difficulty":"Easy","viabilityScore":80,"scores":{"market_demand":80,"profit_potential":75,"ease_of_execution":85,"india_fit":90},"revenue":"₹10,000/month","investment":"₹0","timeToRevenue":"1 week","whyPerfect":"Test","howItWorks":"Test","revenueModel":"Test","firstSteps":["Step 1","Step 2","Step 3"],"indianExamples":"Test","toolsNeeded":["Tool1"],"risks":"Test","competitiveEdge":"Test"}]'
    );

    let parsed = null;
    try { parsed = JSON.parse(text.trim()); } catch {}
    if (!parsed) {
      const match = text.match(/\[[\s\S]*\]/);
      if (match) try { parsed = JSON.parse(match[0]); } catch {}
    }

    return NextResponse.json({
      success: !!parsed,
      rawLength: text.length,
      parsed: parsed,
      rawPreview: text.substring(0, 300),
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
