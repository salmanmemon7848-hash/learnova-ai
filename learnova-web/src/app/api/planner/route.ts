import { getAIResponse } from '@/lib/aiRouter';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage, buildBlockedResponse, buildRateLimitHeaders } from '@/lib/rateLimit';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { NextRequest, NextResponse } from 'next/server';
import {
  LEARNOVA_FULL_CONTEXT,
  STUDENT_KNOWLEDGE,
  CAREER_GUIDE_KNOWLEDGE,
  EDUFINDER_KNOWLEDGE,
  AI_WRITER_KNOWLEDGE,
  getLanguageInstruction,
  buildIndianSearchQuery,
} from '@/lib/learnovaKnowledge';
import {
  sanitizeArray,
  sanitizeJsonPostBody,
  sanitizeString,
  validateBoolean,
} from '@/lib/validation';

export async function POST(req: NextRequest) {
  console.log('Planner API called');

  try {
    let rawBody: unknown = {};
    try {
      rawBody = await req.json();
      console.log('Request body received:', JSON.stringify(rawBody));
    } catch (parseErr) {
      console.error('Failed to parse request body:', parseErr);
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const parsed = sanitizeJsonPostBody(rawBody, [
      'targetExam',
      'schoolClass',
      'examDate',
      'studyHours',
      'dailyHours',
      'weakSubjects',
      'strongSubjects',
      'currentLevel',
      'includeBreaks',
      'examType',
    ]);
    if (!parsed.ok) return parsed.response;

    const b = parsed.body;

    // SECURITY: Sanitize user input to prevent XSS and injection attacks
    // OWASP Reference: A03:2021 Injection
    const targetExam = sanitizeString(b.targetExam, 120);
    const schoolClass = sanitizeString(b.schoolClass, 80);
    const examDate = sanitizeString(b.examDate, 48);
    const studyHours = sanitizeString(b.studyHours, 16) || sanitizeString(b.dailyHours, 16) || '6';
    const weakSubjects = sanitizeArray(b.weakSubjects, 40, 120);
    const strongSubjects = sanitizeArray(b.strongSubjects, 40, 120);
    const currentLevel = sanitizeString(b.currentLevel, 40);
    const includeBreaks = validateBoolean(b.includeBreaks, true);
    const examType = sanitizeString(b.examType, 120);

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkAndIncrementUsage(session.user.id, 'planner', ipAddress);
    if (!rateLimitResult.allowed) return NextResponse.json(buildBlockedResponse(rateLimitResult), { status: 429 });
    const responseHeaders = buildRateLimitHeaders(rateLimitResult);

    const userId = session.user.id;

    console.log('Parsed values:', { targetExam, examDate, studyHours, weakSubjects, examType });

    // â”€â”€ Resolve display exam name â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const resolvedExamType = examType || (
      targetExam === 'school'
        ? `${schoolClass || 'Class'} School Exam (CBSE/ICSE)`
        : targetExam?.toUpperCase().replace(/_/g, ' ') || 'General Exam'
    );

    // â”€â”€ B: Safe date calculation â€” never crash on bad date â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let daysUntilExam = 90; // safe default
    try {
      if (examDate && String(examDate).trim() !== '') {
        const examDateObj = new Date(examDate);
        if (!isNaN(examDateObj.getTime())) {
          daysUntilExam = Math.max(
            1,
            Math.ceil((examDateObj.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
          );
        } else {
          console.warn('Invalid exam date value:', examDate, 'â€” using default 90 days');
        }
      }
    } catch (e) {
      console.warn('Date parse failed, using default 90 days:', e);
    }
    console.log('Days until exam:', daysUntilExam);

    const dailyHours = Math.max(1, parseInt(String(studyHours || '6'), 10) || 6);

    // â”€â”€ C: Intelligent search context â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const languageInstruction = getLanguageInstruction(resolvedExamType);
    const searchContext = await getSearchContext(
      resolvedExamType,
      'planner',
      { examType: resolvedExamType }
    );
    const searchUsageInstruction = buildSearchUsageInstruction(searchContext);

    // â”€â”€ Build system prompt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const systemPrompt = `${LEARNOVA_FULL_CONTEXT}
${STUDENT_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

You are Learnova's Study Planner AI for Indian students.

CRITICAL: You must respond with ONLY a valid JSON object. No introduction, no explanation, no markdown code blocks. Start your response with { and end with }. Nothing else.

Student Profile:
- Exam: ${resolvedExamType}
- Days until exam: ${daysUntilExam}
- Daily study hours: ${dailyHours}
- Level: ${currentLevel}
- Weak areas: ${Array.isArray(weakSubjects) ? weakSubjects.join(', ') : weakSubjects || 'Not specified'}
- Strong areas: ${Array.isArray(strongSubjects) ? strongSubjects.join(', ') : strongSubjects || 'Not specified'}
- Include breaks: ${includeBreaks}

${searchContext ? `Current syllabus context from web:\n${searchContext}` : ''}

${searchUsageInstruction}

Return this exact JSON structure:
{
  "strategy_summary": "2-3 sentence overview",
  "total_days": ${daysUntilExam},
  "daily_hours": ${dailyHours},
  "phase_plan": [
    {"phase": "Phase 1 - Foundation", "duration": "Days 1-30", "focus": "string", "goal": "string"},
    {"phase": "Phase 2 - Practice", "duration": "Days 31-60", "focus": "string", "goal": "string"},
    {"phase": "Phase 3 - Revision", "duration": "Days 61-${daysUntilExam}", "focus": "string", "goal": "string"}
  ],
  "weekly_schedule": [
    {
      "day": "Monday",
      "sessions": [
        {"time_slot": "9:00 AM - 11:00 AM", "subject": "string", "topic": "string", "type": "study", "duration_minutes": 120}
      ]
    },
    {"day": "Tuesday", "sessions": []},
    {"day": "Wednesday", "sessions": []},
    {"day": "Thursday", "sessions": []},
    {"day": "Friday", "sessions": []},
    {"day": "Saturday", "sessions": []},
    {"day": "Sunday", "sessions": []}
  ],
  "subject_allocation": [
    {"subject": "string", "hours_per_week": 10, "priority": "high", "reason": "string"}
  ],
  "weak_topic_plan": [
    {"topic": "string", "current_issue": "string", "fix_strategy": "string", "time_to_allocate": "string"}
  ],
  "milestones": [
    {"day": 30, "milestone": "string", "check": "string"},
    {"day": 60, "milestone": "string", "check": "string"},
    {"day": ${daysUntilExam}, "milestone": "string", "check": "string"}
  ],
  "revision_strategy": {
    "first_revision": "string",
    "second_revision": "string",
    "final_revision": "Last 7 days plan"
  },
  "daily_routine_template": {
    "morning": "string",
    "afternoon": "string",
    "evening": "string",
    "night": "string"
  },
  "motivational_roadmap": "string"
}`;

    const userMessage = `Create a detailed personalized study plan for:
- Exam: ${resolvedExamType}
- Days until exam: ${daysUntilExam}
- Daily study hours: ${dailyHours}
- Current level: ${currentLevel}
- Weak subjects: ${Array.isArray(weakSubjects) ? weakSubjects.join(', ') : weakSubjects || 'None specified'}
- Strong subjects: ${Array.isArray(strongSubjects) ? strongSubjects.join(', ') : strongSubjects || 'None specified'}
- Include breaks: ${includeBreaks}`;

    // â”€â”€ D: AI router call with automatic Groq -> Gemini fallback â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    let rawText = '';
    try {
      console.log('Calling AI router...');
      rawText = await getAIResponse(
        [{ role: 'user', content: userMessage }],
        systemPrompt,
        { maxTokens: 8000, temperature: 0.7, feature: 'planner' }
      );

      if (!rawText) {
        console.error('AI router returned empty content');
        return NextResponse.json(
          { error: 'AI returned an empty response. Please try again.' },
          { status: 500 }
        );
      }
    } catch (groqError: any) {
      console.error('AI router call failed:', groqError?.message || groqError);
      return NextResponse.json(
        { error: 'AI service unavailable. Please try again in a moment.' },
        { status: 503 }
      );
    }

    // â”€â”€ E: JSON parsing â€” strip markdown wrappers, fallback extraction â”€â”€â”€â”€â”€â”€â”€
    console.log('Raw AI response (first 500 chars):', rawText.slice(0, 500));

    const cleanJson = rawText
      .replace(/```json\n?/gi, '')
      .replace(/```\n?/gi, '')
      .replace(/^\s*[\r\n]/gm, '')
      .trim();

    let planData: any;
    try {
      planData = JSON.parse(cleanJson);
      console.log('JSON parsed successfully');
    } catch (parseError) {
      console.error('JSON parse failed on cleaned text. Trying regex extraction...');
      console.error('Parse error:', parseError);

      // Try to extract JSON object from anywhere in the text
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          planData = JSON.parse(jsonMatch[0]);
          console.log('JSON extracted from text successfully');
        } catch (e) {
          console.error('Regex extraction also failed. Raw text was:', rawText.slice(0, 1000));
          return NextResponse.json(
            { error: 'AI returned an invalid response. Please try again.' },
            { status: 500 }
          );
        }
      } else {
        console.error('No JSON object found in AI response. Raw text:', rawText.slice(0, 1000));
        return NextResponse.json(
          { error: 'AI returned an invalid response. Please try again.' },
          { status: 500 }
        );
      }
    }

    // â”€â”€ Save to Supabase (non-blocking) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const planTitle = `Study Plan: ${resolvedExamType} â€” ${daysUntilExam} days`;
    try {
      await supabase.from('saved_files').insert({
        user_id: userId,
        file_type: 'study_plan',
        title: planTitle,
        content: JSON.stringify(planData),
      });

      await logActivity(supabase, userId, 'planner', planTitle, {
        exam: resolvedExamType,
        days: daysUntilExam,
      });
    } catch (saveErr) {
      console.warn('[Planner] Failed to save to Supabase:', saveErr);
    }

    return NextResponse.json(planData, { headers: responseHeaders });
  } catch (error: any) {
    console.error('âŒ Planner Error:', error?.message || error);
    return NextResponse.json(
      { error: error?.message || 'Failed to generate plan. Please try again.' },
      { status: 500 }
    );
  }
}
