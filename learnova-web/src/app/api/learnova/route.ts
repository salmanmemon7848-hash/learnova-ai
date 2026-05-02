/**
 * /api/learnova — Unified Learnova AI endpoint
 *
 * Accepts: { feature: string, messages: ChatMessage[] }
 * Returns: { reply: string }
 *
 * feature must be one of:
 *   doubt_solver | practice_test | study_planner |
 *   edufinder | mock_interview | pitch_deck | business_idea
 *
 * Passes the full conversation history so multi-turn features
 * (Mock Interview, Business Idea Flow, EduFinder) retain memory.
 */

import { SYSTEM_PROMPTS } from '@/lib/systemPrompts';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    // ── Auth guard ────────────────────────────────────────────────────────────
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Parse body ────────────────────────────────────────────────────────────
    const { feature, messages } = (await req.json()) as {
      feature: string;
      messages: ChatMessage[];
    };

    if (!feature || !SYSTEM_PROMPTS[feature]) {
      return NextResponse.json(
        {
          error: `Unknown feature "${feature}". Valid features: ${Object.keys(SYSTEM_PROMPTS).join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'messages must be a non-empty array of { role, content } objects.' },
        { status: 400 }
      );
    }

    const systemPrompt = SYSTEM_PROMPTS[feature];

    // ── Call Anthropic (Claude) ───────────────────────────────────────────────
    const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY ?? '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages,
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error('[/api/learnova] Anthropic error:', errText);
      return NextResponse.json(
        { error: 'AI service temporarily unavailable. Please try again.' },
        { status: 502 }
      );
    }

    const data = await anthropicRes.json();
    const reply: string = data?.content?.[0]?.text ?? '';

    if (!reply) {
      return NextResponse.json(
        { error: 'Empty response from AI.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error('[/api/learnova] Unexpected error:', error?.message ?? error);
    return NextResponse.json(
      { error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
