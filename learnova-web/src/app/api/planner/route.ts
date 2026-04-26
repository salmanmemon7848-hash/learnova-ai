import { generateText } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { goal, deadline, dailyHours, subjects, planType, duration } = body;

    // Support both simple format (from UI) and detailed format
    const goalText = goal || `${planType || 'Study'} plan: ${duration || '7'} days`;
    const deadlineText = deadline || `${duration || '7'} days`;
    const dailyHoursText = dailyHours || 'Not specified';
    const subjectsText = subjects || 'Not specified';

    const prompt = `Create a study/action plan for Indian student.
Goal: ${goalText}, Deadline: ${deadlineText}, Daily Hours: ${dailyHoursText}, Subjects: ${subjectsText}
Return ONLY valid JSON:
{"totalDays":30,"dailyPlan":[{"day":1,"date":"Day 1","tasks":["task1","task2"],"hours":3,"focus":"topic"}],"weeklyGoals":["goal1"],"tips":["tip1"]}`;

    const text = await generateText(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('Invalid response');

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error: any) {
    console.error('❌ Planner Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to generate plan.' }, { status: 500 });
  }
}
