// src/app/api/transcribe/route.ts
// SECURITY: Server-side proxy for Groq Whisper transcription
// This ensures GROQ_API_KEY never reaches the browser
// OWASP Reference: A02:2021 Cryptographic Failures

import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { sanitizeString } from '@/lib/validation';

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ['audio/webm', 'audio/mp4', 'audio/mpeg', 'audio/wav', 'audio/ogg'];
const ALLOWED_EXT_REGEX = /\.(webm|mp4|mp3|wav|ogg)$/i;
const ALLOWED_LANGUAGES = ['en', 'hi'];

export async function POST(req: NextRequest) {
  try {
    // Auth check — only logged in users can transcribe
    const supabase = await createClient();
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the audio file from the request
    const formData = await req.formData();
    const audioFile = formData.get('file') as File | null;
    const language = sanitizeString(formData.get('language'), 16) || 'en';
    const prompt = sanitizeString(formData.get('prompt'), 400) || '';

    // Validate audio file exists
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Validate file size — max 25MB (Groq limit)
    if (audioFile.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: 'Audio file too large. Maximum 25MB.' }, { status: 413 });
    }

    // Validate file type
    const hasAllowedMime = ALLOWED_MIME_TYPES.includes(audioFile.type);
    const hasAllowedExt = ALLOWED_EXT_REGEX.test(audioFile.name || '');
    if (!hasAllowedMime && !hasAllowedExt) {
      return NextResponse.json({ error: 'Invalid audio file type' }, { status: 400 });
    }

    // Validate language
    const safeLanguage = ALLOWED_LANGUAGES.includes(language) ? language : 'en';

    // Sanitize prompt — limit length
    const safePrompt = prompt.slice(0, 200);

    // SECURITY: GROQ_API_KEY used here server-side only — never exposed to browser
    const groqKey = process.env.GROQ_API_KEY?.trim();
    if (!groqKey) {
      return NextResponse.json({ error: 'Transcription service unavailable' }, { status: 503 });
    }

    // Build Groq Whisper request
    const groqFormData = new FormData();
    groqFormData.append('file', audioFile, 'audio.webm');
    groqFormData.append('model', 'whisper-large-v3');
    groqFormData.append('language', safeLanguage);
    if (safePrompt) {
      groqFormData.append('prompt', safePrompt);
    }

    const groqResponse = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        // SECURITY: Key stays on server — never sent to or visible from browser
        Authorization: `Bearer ${groqKey}`,
      },
      body: groqFormData,
    });

    if (!groqResponse.ok) {
      const errorText = await groqResponse.text();
      console.error('[Transcribe] Groq Whisper error:', groqResponse.status, errorText.slice(0, 200));
      return NextResponse.json({ error: 'Transcription failed. Please try again.' }, { status: 500 });
    }

    const data = await groqResponse.json();
    const transcribedText = typeof data?.text === 'string' ? data.text : '';

    if (!transcribedText.trim()) {
      return NextResponse.json({ text: '', empty: true }, { status: 200 });
    }

    console.log('[Transcribe] Success — length:', transcribedText.length);
    return NextResponse.json({ text: transcribedText });
  } catch (error: any) {
    console.error('[Transcribe] Fatal error:', error?.message || error);
    return NextResponse.json({ error: 'Transcription service unavailable' }, { status: 500 });
  }
}
