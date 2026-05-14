import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { transcribeAudio } from '@/lib/openai';
import { sanitizeString } from '@/lib/validation';

const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    // SECURITY: Sanitize multipart text fields before forwarding to speech APIs.
    // OWASP Reference: A03:2021 Injection
    const language = sanitizeString(formData.get('language'), 16);
    const prompt = sanitizeString(formData.get('prompt'), 500);

    const audioFile = formData.get('file') as File | null;

    if (!audioFile || !(audioFile instanceof Blob)) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // SECURITY: Reject oversized uploads to mitigate DoS.
    // OWASP Reference: A05:2021 Security Misconfiguration
    if (typeof audioFile.size === 'number' && audioFile.size > MAX_AUDIO_BYTES) {
      return NextResponse.json({ error: 'Audio file too large' }, { status: 413 });
    }

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const text = await transcribeAudio(audioFile as File, language, prompt);
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('[Transcribe API] Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
  }
}
