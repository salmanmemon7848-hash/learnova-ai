import { createClient } from '@/lib/supabase/server';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import {
  GROQ_FALLBACK_MODEL,
  GROQ_PRIMARY_MODEL,
  groqChatCompletion,
} from '@/lib/groqCompletion';
import { getGroqInternalClient, isGroqConfigured } from '@/lib/openai';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { NextRequest, NextResponse } from 'next/server';
import { getLanguageInstruction } from '@/lib/learnovaKnowledge';

export const runtime = 'nodejs';
export const maxDuration = 60;

function buildCompactPitchPrompt(
  pitchContent: string,
  languageInstruction: string,
  stage: string,
  industry: string,
  searchContext: string,
  searchUsageInstruction: string
): string {
  const base = `You are Learnova's Pitch Deck AI — a senior Indian startup investor advisor.
Be direct and constructive. Use ₹ and Indian market context. Write narrative fields in the language implied below.

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

FOUNDER INPUT:
${pitchContent}

Stage: ${stage || 'Not specified'}
Industry: ${industry || 'Not specified'}

${searchContext ? `${searchContext}\n\n` : ''}${searchUsageInstruction}

Respond ONLY with a single JSON object (no markdown fences, no text before or after):

{
  "overall_score": 72,
  "investor_first_impression": "string",
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
  "red_flags": ["string"],
  "green_flags": ["string"],
  "investor_questions": ["string", "string", "string"],
  "rewrite_suggestions": [
    { "section": "string", "current_issue": "string", "suggested_rewrite": "string" }
  ],
  "market_reality_check": "string",
  "next_milestone": "string",
  "final_verdict": "string"
}

Rules: fundability must be exactly one of: High, Medium, Low, Not Yet. Scores are 1–10 integers. Fill every field with specific feedback for this pitch.`;

  return base;
}

function tryParsePitchJson(raw: string): unknown | null {
  const response = raw.trim();
  if (!response) return null;

  const attempts: string[] = [response];
  const unfenced = response.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  if (unfenced !== response) attempts.push(unfenced);

  for (const text of attempts) {
    try {
      if (text.startsWith('{')) return JSON.parse(text);
    } catch {
      /* continue */
    }
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch {
        /* continue */
      }
    }
  }
  return null;
}

function groqErrorToMessage(error: unknown): string {
  const err = error as {
    message?: string;
    error?: { message?: string };
    status?: number;
    response?: { status?: number };
  };
  const nested = err?.error?.message;
  const msg = nested || err?.message || String(error);
  const status = err?.status ?? err?.response?.status;
  return [status ? `HTTP ${status}` : '', msg].filter(Boolean).join(': ');
}

export async function POST(req: NextRequest) {
  try {
    if (!isGroqConfigured()) {
      return NextResponse.json(
        {
          error:
            'AI is not configured for this deployment. Add GROQ_API_KEY in Vercel → Project → Settings → Environment Variables, then redeploy.',
        },
        { status: 503 }
      );
    }

    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
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

    const onVercel = Boolean(process.env.VERCEL);
    const pitchSearch =
      !onVercel || process.env.PITCH_WEB_SEARCH === '1'
        ? await getSearchContext(answers.what || 'startup', 'pitch-deck', {
            industry: industry || '',
          })
        : '';

    const searchUsageInstruction = buildSearchUsageInstruction(pitchSearch);
    const systemPrompt = buildCompactPitchPrompt(
      pitchContent,
      languageInstruction,
      stage,
      industry,
      pitchSearch,
      searchUsageInstruction
    );

    const userMessage = `Evaluate this startup pitch and return the JSON object now.`;

    const pitchTimeout = Number(process.env.GROQ_PITCH_TIMEOUT_MS);
    const timeoutMs =
      Number.isFinite(pitchTimeout) && pitchTimeout > 0
        ? pitchTimeout
        : onVercel
          ? 9_000
          : 55_000;

    const useFastPitchPath = onVercel && process.env.PITCH_USE_FULL_MODEL !== '1';

    const completion = await groqChatCompletion(getGroqInternalClient(), {
      model: useFastPitchPath ? GROQ_FALLBACK_MODEL : GROQ_PRIMARY_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.45,
      max_tokens: 3_500,
      timeoutMs,
      retryFallback: !useFastPitchPath,
    });

    const responseText = completion.choices[0]?.message?.content?.trim() || '';
    const result = tryParsePitchJson(responseText);

    if (!result || typeof result !== 'object') {
      console.error('[Pitch Deck] Parse failed. Raw (500 chars):', responseText.slice(0, 500));
      return NextResponse.json(
        { error: 'Failed to parse AI evaluation. Please try again.' },
        { status: 500 }
      );
    }

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
  } catch (error: unknown) {
    const detail = groqErrorToMessage(error);
    console.error('[Pitch Deck]', detail, error);

    const msg = typeof (error as Error)?.message === 'string' ? (error as Error).message : '';

    if (msg.includes('GROQ_API_KEY') || msg.includes('API key is missing or invalid')) {
      return NextResponse.json(
        {
          error:
            'AI is not configured for this deployment. Add GROQ_API_KEY in Vercel → Project → Settings → Environment Variables, then redeploy.',
        },
        { status: 503 }
      );
    }

    if (
      (error as Error)?.name === 'AbortError' ||
      msg.toLowerCase().includes('timeout') ||
      msg.toLowerCase().includes('timed out')
    ) {
      return NextResponse.json(
        { error: 'Pitch evaluation timed out. Please try again (shorter answers help on free hosting).' },
        { status: 408 }
      );
    }

    const status = (error as { status?: number })?.status;
    if (status === 401 || status === 403) {
      return NextResponse.json(
        {
          error:
            'AI API key is missing or invalid. Check GROQ_API_KEY in your deployment environment.',
        },
        { status: 503 }
      );
    }

    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json(
        { error: `Pitch evaluation failed: ${detail || msg || 'unknown error'}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ error: 'Failed to evaluate pitch. Please try again.' }, { status: 500 });
  }
}
