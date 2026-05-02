import { generateText } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { NextRequest, NextResponse } from 'next/server';
import {
  LEARNOVA_FULL_CONTEXT,
  AI_WRITER_KNOWLEDGE,
  getLanguageInstruction,
  buildIndianSearchQuery,
} from '@/lib/learnovaKnowledge';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const { contentType, topic, tone, details } = await req.json();

    // â”€â”€ Language detection & India-specific search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const languageInstruction = getLanguageInstruction(topic);
    const searchQuery = buildIndianSearchQuery('writer', topic);

    const baseSystemPrompt = `${LEARNOVA_FULL_CONTEXT}
${AI_WRITER_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

You are a professional content writer for an Indian audience.
Write engaging, accurate, and culturally relevant content. Use clear language, appropriate for the tone requested.
Always write the full content directly â€” no preamble, no meta-commentary.`;

    // Search for topic context â€” skip if this is a rewrite/format task
    const searchContext = await getSearchContext(topic, 'writer');
    const searchUsageInstruction = buildSearchUsageInstruction(searchContext);
    const finalSystemPrompt = searchContext
      ? `${baseSystemPrompt}\n\n${searchContext}\n\n${searchUsageInstruction}`
      : `${baseSystemPrompt}\n\n${searchUsageInstruction}`;

    const prompt = `Write a ${contentType} about "${topic}" in ${tone} tone for Indian audience.
Details: ${details || 'None'}. Write full content directly, no preamble.`;

    const content = await generateText(prompt, finalSystemPrompt);

    // â”€â”€ Save to Supabase (non-blocking) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const documentTitle = `${contentType.charAt(0).toUpperCase() + contentType.slice(1)}: ${topic.slice(0, 50)}`;
    try {
      await supabase.from('saved_files').insert({
        user_id: userId,
        file_type: 'ai_writer',
        title: documentTitle,
        content,
      });

      await logActivity(supabase, userId, 'writer', documentTitle, { content_type: contentType, tone });
    } catch (saveErr) {
      console.warn('[Writer] Failed to save to Supabase:', saveErr);
    }

    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('âŒ Writer Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to generate content.' }, { status: 500 });
  }
}
