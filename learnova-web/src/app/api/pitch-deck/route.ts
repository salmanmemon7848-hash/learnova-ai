import { chatWithHistory } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { NextRequest, NextResponse } from 'next/server';
import {
  LEARNOVA_FULL_CONTEXT,
  FOUNDER_KNOWLEDGE,
  getLanguageInstruction,
  buildIndianSearchQuery,
} from '@/lib/learnovaKnowledge';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const body = await req.json();
    const { answers, stage, industry } = body;

    const pitchContent = [
      `Startup: ${answers.what || 'Not provided'}`,
      `Problem: ${answers.problem || 'Not provided'}`,
      `Target Customer: ${answers.customer || 'Not provided'}`,
      `Revenue Model: ${answers.revenue || 'Not provided'}`,
      `Competitors: ${answers.competitors || 'Not provided'}`,
      `Differentiation: ${answers.different || 'Not provided'}`,
      `Go-to-Market: ${answers.gomarket || 'Not provided'}`,
      `Team: ${answers.team || 'Not provided'}`,
      `Funding Ask: ${answers.raise || 'Not provided'}`,
      `Use of Funds: ${answers.funds || 'Not provided'}`,
    ].join('\n');

    const languageInstruction = getLanguageInstruction(answers.what || '');

    const systemPrompt = `${LEARNOVA_FULL_CONTEXT}
${FOUNDER_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

You are Learnova's Pitch Deck AI â€” a senior startup advisor and investor who has evaluated 500+ pitches at Indian accelerators (Y Combinator India, Sequoia Surge, 100X.VC).

You are brutally honest but constructive. You evaluate like a real investor would.

Founder's pitch input:
${pitchContent}

Startup stage: ${stage || 'Not specified'}
Industry: ${industry || 'Not specified'}

Use web search results to check market data, competitor landscape, and current investor trends.

Respond ONLY in this exact JSON with no extra text or markdown:

{
  "overall_score": 72,
  "investor_first_impression": "string â€” what an investor thinks in first 30 seconds",
  "fundability": "High",
  "dimensions": {
    "problem_clarity": { "score": 7, "feedback": "string", "improvement": "string" },
    "solution_strength": { "score": 6, "feedback": "string", "improvement": "string" },
    "market_understanding": { "score": 5, "feedback": "string", "improvement": "string" },
    "business_model": { "score": 8, "feedback": "string", "improvement": "string" },
    "team_credibility": { "score": 6, "feedback": "string", "improvement": "string" },
    "traction": { "score": 4, "feedback": "string", "improvement": "string" }
  },
  "strongest_slide": "string",
  "weakest_slide": "string",
  "red_flags": ["string", "string"],
  "green_flags": ["string", "string"],
  "investor_questions": ["string", "string", "string"],
  "rewrite_suggestions": [
    { "section": "string", "current_issue": "string", "suggested_rewrite": "string" }
  ],
  "market_reality_check": "string based on web search data",
  "next_milestone": "string â€” what to achieve before next fundraise",
  "final_verdict": "string â€” honest 2-3 sentence verdict"
}

Replace all placeholder strings with real, specific feedback for this pitch. fundability must be exactly one of: High, Medium, Low, Not Yet.`;

    const userMessage = `Evaluate my startup pitch and provide detailed investor feedback.`;

    const searchContext = await getSearchContext(answers.what || 'startup', 'pitch-deck', { industry: industry || '' });
    const searchUsageInstruction = buildSearchUsageInstruction(searchContext);
    const enrichedPrompt = searchContext
      ? `${systemPrompt}\n\n${searchContext}\n\n${searchUsageInstruction}`
      : `${systemPrompt}\n\n${searchUsageInstruction}`;

    const response = await chatWithHistory(
      [{ role: 'user', content: userMessage }],
      enrichedPrompt
    );

    // Parse JSON with multiple strategies
    let result: any = null;

    try {
      const trimmed = response.trim();
      if (trimmed.startsWith('{')) result = JSON.parse(trimmed);
    } catch (_) {}

    if (!result) {
      try {
        const match = response.match(/\{[\s\S]*\}/);
        if (match) result = JSON.parse(match[0]);
      } catch (_) {}
    }

    if (!result) {
      try {
        const cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const match = cleaned.match(/\{[\s\S]*\}/);
        if (match) result = JSON.parse(match[0]);
      } catch (_) {}
    }

    if (!result) {
      console.error('âŒ All parse strategies failed. Raw:', response.substring(0, 500));
      return NextResponse.json({ error: 'Failed to parse AI evaluation. Please try again.' }, { status: 500 });
    }

    // Save to Supabase (non-blocking)
    const deckTitle = `Pitch Evaluation: ${answers.what || 'My Startup'}`;
    try {
      await supabase.from('saved_files').insert({
        user_id: userId,
        file_type: 'pitch_evaluation',
        title: deckTitle,
        content: JSON.stringify(result),
      });
      await logActivity(supabase, userId, 'pitch_deck', deckTitle, {});
    } catch (saveErr) {
      console.warn('[Pitch Deck] Save failed:', saveErr);
    }

    return NextResponse.json({ result });
  } catch (error: any) {
    console.error('âŒ Pitch Deck Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to evaluate pitch. Please try again.' }, { status: 500 });
  }
}
