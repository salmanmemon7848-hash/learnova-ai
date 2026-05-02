import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { transcribeAudio } from '@/lib/openai';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const audioFile = formData.get('file') as File;
    const language = formData.get('language') as string;
    const prompt = formData.get('prompt') as string;

    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const text = await transcribeAudio(audioFile, language, prompt);
    return NextResponse.json({ text });
  } catch (error: any) {
    console.error('[Transcribe API] Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
  }
}
