import { generateText } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { idea, targetMarket, budget } = await req.json();

    // Validate input
    if (!idea || !idea.trim()) {
      return NextResponse.json({ error: 'Business idea is required' }, { status: 400 });
    }

    // Build prompt for Groq AI
    const prompt = `You are an expert business analyst validating startup ideas for the Indian market.

BUSINESS IDEA TO VALIDATE:
${idea}

Target Market: ${targetMarket || 'India'}
Budget: ${budget || 'Not specified'}

Provide a comprehensive validation analysis based on your expertise and knowledge.

Return ONLY valid JSON with this exact structure:
{
  "scores": {
    "marketDemand": <0-100>,
    "competition": <0-100>,
    "profitPotential": <0-100>,
    "executionEase": <0-100>
  },
  "overall": <0-100>,
  "risks": ["risk1", "risk2", "risk3"],
  "actionPlan": ["Day 1-2: specific action", "Day 3-4: specific action", "Day 5-7: specific action"],
  "verdict": "Short 2-3 sentence verdict"
}`;

    // Generate analysis using Groq
    const text = await generateText(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response from AI');

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error: any) {
    console.error('❌ Validate Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to validate idea.' }, { status: 500 });
  }
}
