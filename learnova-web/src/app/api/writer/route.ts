import { generateText } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { askAIWithSearch } from '@/lib/aiWithSearch';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { contentType, topic, tone, details } = await req.json();

    const baseSystemPrompt = `You are a professional content writer for an Indian audience.
Write engaging, accurate, and culturally relevant content. Use clear language, appropriate for the tone requested.
Always write the full content directly — no preamble, no meta-commentary.`;

    // Search for topic context — skip if this is a rewrite/format task
    const { finalSystemPrompt } = await askAIWithSearch({
      userMessage: topic,
      systemPrompt: baseSystemPrompt,
    });

    const prompt = `Write a ${contentType} about "${topic}" in ${tone} tone for Indian audience.
Details: ${details || 'None'}. Write full content directly, no preamble.`;

    const content = await generateText(prompt, finalSystemPrompt);
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('❌ Writer Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to generate content.' }, { status: 500 });
  }
}
