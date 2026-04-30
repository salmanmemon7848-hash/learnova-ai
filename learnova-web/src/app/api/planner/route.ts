import { generateText } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { askAIWithSearch } from '@/lib/aiWithSearch';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { targetExam, schoolClass, examDate, studyHours, weakSubjects, strongSubjects } = body;

    // Calculate days left
    const daysLeft = Math.ceil(
      (new Date(examDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    const planDays = Math.min(daysLeft, 60)

    // Build exam context
    const examContext = targetExam === 'school'
      ? `${schoolClass || 'Class'} student preparing for school exams (CBSE/ICSE/State Board)`
      : `student preparing for ${targetExam.toUpperCase().replace('_', ' ')}`

    // Enrich with live exam syllabus/strategy data
    const examName = targetExam === 'school'
      ? `${schoolClass || ''} CBSE school exam`
      : targetExam.toUpperCase().replace('_', ' ')
    const searchQuery = `${examName} syllabus study plan strategy ${weakSubjects?.join(' ') || ''} 2025`.trim()
    const { finalSystemPrompt } = await askAIWithSearch({
      userMessage: searchQuery,
      systemPrompt: `You are an expert Indian academic study planner who creates personalised, structured study schedules based on real exam syllabi and strategies.`,
      needsSearch: true,
    })

    // Build the enhanced prompt
    const prompt = `
You are an expert Indian academic study planner.

Create a personalized ${planDays}-day study plan for a ${examContext}.
- Exam date: ${examDate} (${daysLeft} days away)
- Daily study time available: ${studyHours || 6} hours
- Weak subjects (need MORE time): ${weakSubjects?.join(', ') || 'None specified'}
- Strong subjects (need LESS time): ${strongSubjects?.join(', ') || 'None specified'}

PLANNING RULES:
1. Weak subjects get 60% of daily study time
2. Strong subjects get 20% of daily time (revision only)
3. Unspecified/other subjects share the remaining 20%
4. Sundays are rest + light revision only (max 2 hours)
5. Last 7 days before exam = full revision, no new topics
6. Space repetition: revisit each weak topic every 5-7 days

Return ONLY valid JSON:
{
  "planTitle": "${planDays}-Day Study Plan",
  "totalDays": ${planDays},
  "dailyHours": ${studyHours || 6},
  "summary": "Brief 2-sentence overview of the strategy",
  "weeklySchedule": {
    "Monday": [{"subject": "Physics", "topic": "Thermodynamics", "hours": 2, "type": "new"}],
    "Tuesday": [...],
    "Wednesday": [...],
    "Thursday": [...],
    "Friday": [...],
    "Saturday": [...],
    "Sunday": [{"subject": "All", "topic": "Weekly Revision", "hours": 1.5, "type": "revision"}]
  },
  "subjectAllocation": [
    {"subject": "Physics", "weeklyHours": 8, "priority": "high", "reason": "Listed as weak subject"}
  ],
  "tips": [
    "Specific actionable tip 1 for this student",
    "Specific actionable tip 2",
    "Specific actionable tip 3"
  ]
}
`

    const text = await generateText(prompt, finalSystemPrompt)
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid response')

    return NextResponse.json(JSON.parse(jsonMatch[0]))
  } catch (error: any) {
    console.error('❌ Planner Error:', error?.message || error)
    return NextResponse.json({ error: 'Failed to generate plan.' }, { status: 500 })
  }
}
