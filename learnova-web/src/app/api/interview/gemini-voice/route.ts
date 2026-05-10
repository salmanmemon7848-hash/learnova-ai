/**
 * /api/interview/gemini-voice
 *
 * Gemini Flash multimodal endpoint for the mock interview voice feature.
 *
 * Handles three request types:
 *   1. { type: "ping" }     — connectivity check, returns 200
 *   2. { type: "opening" }  — generates the first interviewer question (no user audio)
 *   3. FormData with audio  — transcribes user audio + generates AI response in one Gemini call
 *
 * Uses GOOGLE_AI_API_KEY from .env.local (already present).
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const MODEL = 'gemini-2.0-flash';

// ── Types ──────────────────────────────────────────────────────────────────

interface InterviewConfig {
  userName: string;
  topicOrRole: string;
  userType: 'student' | 'founder';
}

interface HistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
  }>;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function getApiKey(): string {
  const key =
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_STUDIO_API_KEY?.trim();
  if (!key) throw new Error('GOOGLE_AI_API_KEY is not configured');
  return key;
}

function buildHistoryContext(history: HistoryItem[], config: InterviewConfig): string {
  if (!history.length) return '';
  return (
    '\n\nConversation so far:\n' +
    history
      .map(h => {
        const label = h.role === 'user' ? (config.userName || 'Candidate') : 'Interviewer';
        return `${label}: ${h.content}`;
      })
      .join('\n')
  );
}

// ── Opening question (text-only, no audio) ─────────────────────────────────

async function generateOpeningQuestion(
  config: InterviewConfig,
  systemPrompt: string,
  apiKey: string,
): Promise<string> {
  const prompt =
    `${systemPrompt}\n\nYou are starting the interview now. ` +
    `Introduce yourself briefly (one sentence) and ask the first interview question. ` +
    `Keep it to 2 sentences total. Do not use any formatting or bullet points.`;

  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
  };

  const res = await fetch(`${GEMINI_BASE}/${MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini opening error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as GeminiResponse;
  return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? '';
}

// ── Audio turn (multimodal: audio + text) ─────────────────────────────────

async function processAudioTurn(
  audioBase64: string,
  mimeType: string,
  history: HistoryItem[],
  config: InterviewConfig,
  systemPrompt: string,
  apiKey: string,
): Promise<{ transcript: string; aiResponse: string }> {
  const historyContext = buildHistoryContext(history, config);

  const instructionText =
    `${systemPrompt}${historyContext}\n\n` +
    `The candidate just finished speaking (audio attached). ` +
    `First, transcribe EXACTLY what they said on a line starting with "TRANSCRIPT:". ` +
    `Then, on a new line starting with "RESPONSE:", give your next interviewer question or comment ` +
    `(maximum 2 sentences, no formatting, no bullet points, professional tone).`;

  const body = {
    contents: [
      {
        role: 'user',
        parts: [
          { inline_data: { mime_type: mimeType, data: audioBase64 } },
          { text: instructionText },
        ],
      },
    ],
    generationConfig: { temperature: 0.7, maxOutputTokens: 300 },
  };

  const res = await fetch(`${GEMINI_BASE}/${MODEL}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini audio error ${res.status}: ${err.slice(0, 200)}`);
  }

  const data = (await res.json()) as GeminiResponse;
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  // Parse TRANSCRIPT: and RESPONSE: sections (no 's' flag — use [\s\S] instead)
  const transcriptMatch = raw.match(/TRANSCRIPT:\s*([\s\S]*?)(?=\nRESPONSE:|$)/i);
  const responseMatch = raw.match(/RESPONSE:\s*([\s\S]*)$/i);

  const transcript = (transcriptMatch?.[1] ?? '').trim();
  const aiResponse = (responseMatch?.[1] ?? raw).trim();

  return { transcript, aiResponse };
}

// ── Route handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    // Auth check
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = getApiKey();
    const contentType = req.headers.get('content-type') ?? '';

    // ── JSON requests (ping / opening) ─────────────────────────────────────
    if (contentType.includes('application/json')) {
      const body = await req.json() as {
        type?: string;
        interviewConfig?: InterviewConfig;
        systemPrompt?: string;
        history?: HistoryItem[];
      };

      // Ping — just confirm the route is reachable and the API key exists
      if (body.type === 'ping') {
        return NextResponse.json({ ok: true });
      }

      // Opening question
      if (body.type === 'opening') {
        const config = body.interviewConfig ?? { userName: 'Candidate', topicOrRole: 'General', userType: 'student' as const };
        const systemPrompt = body.systemPrompt ?? '';
        const aiResponse = await generateOpeningQuestion(config, systemPrompt, apiKey);
        return NextResponse.json({ transcript: '', aiResponse });
      }

      return NextResponse.json({ error: 'Unknown request type' }, { status: 400 });
    }

    // ── FormData requests (audio turn) ─────────────────────────────────────
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const audioFile = formData.get('audio') as File | null;
      const configStr = formData.get('interviewConfig') as string | null;
      const systemPrompt = (formData.get('systemPrompt') as string | null) ?? '';
      const historyStr = (formData.get('history') as string | null) ?? '[]';

      if (!audioFile) {
        return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
      }

      const config: InterviewConfig = configStr
        ? (JSON.parse(configStr) as InterviewConfig)
        : { userName: 'Candidate', topicOrRole: 'General', userType: 'student' };

      const history = JSON.parse(historyStr) as HistoryItem[];

      // Convert audio to base64
      const audioBuffer = await audioFile.arrayBuffer();
      const audioBase64 = Buffer.from(audioBuffer).toString('base64');
      const mimeType = audioFile.type || 'audio/webm';

      const result = await processAudioTurn(
        audioBase64,
        mimeType,
        history,
        config,
        systemPrompt,
        apiKey,
      );

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: 'Unsupported content type' }, { status: 415 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[GeminiVoice API] Error:', message);

    // Surface Gemini-specific status codes so the fallback can detect them
    if (message.includes('429')) return NextResponse.json({ error: message }, { status: 429 });
    if (message.includes('401') || message.includes('403')) return NextResponse.json({ error: message }, { status: 401 });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
