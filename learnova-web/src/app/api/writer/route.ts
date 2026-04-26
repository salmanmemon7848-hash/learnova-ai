import { generateText } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { contentType, topic, tone, details } = await req.json();

    const prompt = `Write a ${contentType} about "${topic}" in ${tone} tone for Indian audience.
Details: ${details || 'None'}. Write full content directly, no preamble.`;

    const content = await generateText(prompt);
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('❌ Writer Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to generate content.' }, { status: 500 });
  }
}
