import { generateText } from '@/lib/openai';
import { NextResponse } from 'next/server';

export async function GET() {
  // SECURITY: Diagnostic endpoint — fixed prompt only; consider restricting by deployment policy.
  try {
    const text = await generateText('Say exactly: Learnova AI is now powered by Groq!');
    return NextResponse.json({ success: true, message: text });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
