import { generateText } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { question, subject } = await req.json();

    const prompt = `Solve this ${subject || 'general'} doubt for an Indian student.
Question: ${question}
Give: subject/topic identification, step-by-step solution, key concepts, NCERT reference, exam relevance (CBSE/JEE/NEET), common mistakes to avoid.`;

    const solution = await generateText(prompt);
    return NextResponse.json({ solution });
  } catch (error: any) {
    console.error('❌ Doubt Solver Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to solve doubt.' }, { status: 500 });
  }
}
