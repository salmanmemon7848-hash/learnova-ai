import { generateText } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage, buildBlockedResponse, buildRateLimitHeaders } from '@/lib/rateLimit';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import { BUSINESS_IDEA_PROMPT } from '@/lib/systemPrompts';
import { NextRequest, NextResponse } from 'next/server';
import {
  LEARNOVA_FULL_CONTEXT,
  FOUNDER_KNOWLEDGE,
  getLanguageInstruction,
  buildIndianSearchQuery,
} from '@/lib/learnovaKnowledge';
import {
  sanitizeArray,
  sanitizeJsonPostBody,
  sanitizeNumber,
  sanitizeString,
  sanitizeStringRecord,
  validateLanguage,
} from '@/lib/validation';

export async function POST(req: NextRequest) {
  try {
    let rawBody: unknown = {};
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = sanitizeJsonPostBody(rawBody, [
      'conversationContext',
      'answers',
      'existingIdeas',
      'count',
      'language',
      'messages',
      'context',
    ]);
    if (!parsed.ok) return parsed.response;

    const b = parsed.body;

    // SECURITY: Sanitize user input to prevent XSS and injection attacks
    // OWASP Reference: A03:2021 Injection
    let conversationContext: unknown = b.conversationContext ?? b.context;
    if (conversationContext && typeof conversationContext === 'object' && !Array.isArray(conversationContext)) {
      conversationContext = sanitizeStringRecord(conversationContext, 80, 120, 2000);
    } else if (typeof conversationContext === 'string') {
      conversationContext = sanitizeString(conversationContext, 20000);
    }
    const answers =
      b.answers && typeof b.answers === 'object' && !Array.isArray(b.answers)
        ? sanitizeStringRecord(b.answers, 24, 24, 256)
        : {};
    const existingIdeas = sanitizeArray(b.existingIdeas, 50, 400);
    const count = sanitizeNumber(b.count, 1, 15, 5);
    void validateLanguage(b.language);

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkAndIncrementUsage(session.user.id, 'business-ideas', ipAddress);
    if (!rateLimitResult.allowed) return NextResponse.json(buildBlockedResponse(rateLimitResult), { status: 429 });
    const responseHeaders = buildRateLimitHeaders(rateLimitResult);

    console.log('ðŸ“¥ Business Ideas API called');

    // Build context string from MCQ answers for backward compatibility
    const labelMap: Record<string, Record<string, string>> = {
      '1': { tech: 'Technology & Apps', education: 'Education & Coaching', health: 'Health & Wellness', lifestyle: 'Fashion & Beauty', food: 'Food & Agriculture', finance: 'Finance & Investment' },
      '2': { communication: 'Communication & Talking', creative: 'Creative Work', technical: 'Technical/Coding', organizing: 'Planning & Organizing', teaching: 'Teaching & Explaining', problem_solving: 'Problem Solving' },
      '3': { minimal: 'Less than 1 hour/day', part_time: '1-3 hours/day', serious: '3-6 hours/day', full_time: 'Full time 8+ hours/day' },
      '4': { zero: 'Zero budget', low: 'Under â‚¹10,000', medium: 'â‚¹10,000 to â‚¹1 Lakh', high: 'â‚¹1 Lakh or more' },
      '5': { students: 'Students & Young People', professionals: 'Working Professionals', small_business: 'Small Business Owners', rural: 'Rural Communities', families: 'Parents & Families', everyone: 'Mass Market' },
      '6': { product: 'Sell physical products', service: 'Offer a service', platform: 'Build app or platform', content: 'Content or courses', resell: 'Resell or franchise' },
      '7': { financial_risk: 'Losing money', time: 'Not enough time', market_risk: 'Nobody will buy', skills_gap: 'Lacks skills', competition: 'Too much competition', fearless: 'Not afraid at all' },
      '8': { side_income: 'â‚¹20-50K side income/month', full_income: 'Replace full-time salary', exit: 'Build and sell company', scale: 'Scale to 100+ crore', impact: 'Social impact' },
    };

    const qNames: Record<string, string> = {
      '1': 'Industry Interest', '2': 'Core Strength', '3': 'Daily Time Available',
      '4': 'Starting Budget', '5': 'Target Customer', '6': 'Preferred Business Model',
      '7': 'Biggest Fear', '8': '3-Year Goal',
    };

    // Build context from MCQ answers
    const ctx = conversationContext || (() => {
      const profile: Record<string, string> = {};
      Object.entries(answers || {}).forEach(([qId, val]) => {
        const readable = labelMap[qId]?.[val as string] || (val as string);
        profile[qNames[qId] || `Q${qId}`] = readable;
      });
      return profile;
    })();

    const excludeText = existingIdeas?.length > 0
      ? `Do NOT suggest any of these already-shown ideas: ${existingIdeas.join(', ')}.`
      : '';

    const budgetVal = answers?.['4'] as string;
    const budgetLabel = labelMap['4']?.[budgetVal] || 'flexible budget';
    const timeVal = answers?.['3'] as string;
    const timeLabel = labelMap['3']?.[timeVal] || 'flexible time';
    const industryVal = answers?.['1'] as string;
    const industryLabel = labelMap['1']?.[industryVal] || 'business';

    const languageInstruction = getLanguageInstruction(
      typeof ctx === 'object' ? Object.values(ctx as Record<string, string>).join(' ') : String(ctx)
    );

    const systemPrompt = `${LEARNOVA_FULL_CONTEXT}
${FOUNDER_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

You are Learnova's Business Mentor â€” a practical startup advisor with deep knowledge of the Indian market. You think like a smart mentor, not a generic AI.

Everything you know about this founder:
${JSON.stringify(ctx, null, 2)}

Rules:
- Every idea must be deeply personalized to their specific profile
- If budget is low or zero, suggest only bootstrappable ideas
- Factor in their time availability â€” part-time means low-maintenance ideas
- Reference real Indian startups and specific Indian market realities
- Be specific about Indian rupee amounts
- Never suggest ideas that contradict their budget or time constraints
${excludeText}

Respond ONLY in this exact JSON with no extra text or markdown:

{
  "ideas": [
    {
      "rank": 1,
      "idea_name": "string",
      "one_line": "string â€” elevator pitch in one sentence",
      "problem_solved": "string",
      "target_customer": "string â€” specific, not generic",
      "why_now": "string â€” why this idea makes sense in India right now",
      "startup_cost": "â‚¹X â€“ â‚¹Y",
      "revenue_model": "string",
      "time_to_first_revenue": "string",
      "real_indian_example": "string â€” similar successful startup or entrepreneur in India",
      "biggest_risk": "string",
      "founder_fit_score": 85,
      "founder_fit_reason": "string â€” based on their specific skills and background",
      "first_3_steps": ["string", "string", "string"],
      "market_size_india": "string"
    }
  ],
  "mentor_observation": "string â€” personal observation about this founder's strengths",
  "honest_warning": "string â€” one honest risk specific to their situation",
  "recommended_idea": 1,
  "why_recommended": "string â€” specific reason based on their full profile"
}

Generate exactly ${count || 5} ideas. All ideas must be different industries.`;

    // Enrich with live Indian market data
    const searchContext = await getSearchContext(`${industryLabel} startup`, 'business-ideas', { industry: industryLabel });
    const searchUsageInstruction = buildSearchUsageInstruction(searchContext);
    const finalSystemPrompt = searchContext
      ? `${systemPrompt}\n\n${searchContext}\n\n${searchUsageInstruction}`
      : `${systemPrompt}\n\n${searchUsageInstruction}`;

    console.log('ðŸ¤– Calling Groq AI for business ideas...');
    const text = await generateText(systemPrompt, finalSystemPrompt || undefined);
    console.log('ðŸ“¤ Raw AI response length:', text?.length);

    let result: any = null;

    // Strategy 1: Direct parse
    try {
      const trimmed = text?.trim();
      if (trimmed?.startsWith('{')) {
        result = JSON.parse(trimmed);
        console.log('âœ… Strategy 1 worked');
      }
    } catch (_) {}

    // Strategy 2: Regex find object
    if (!result) {
      try {
        const match = text?.match(/\{[\s\S]*\}/);
        if (match) {
          result = JSON.parse(match[0]);
          console.log('âœ… Strategy 2 worked');
        }
      } catch (_) {}
    }

    // Strategy 3: Clean markdown
    if (!result) {
      try {
        const cleaned = text?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const match = cleaned?.match(/\{[\s\S]*\}/);
        if (match) {
          result = JSON.parse(match[0]);
          console.log('âœ… Strategy 3 worked');
        }
      } catch (_) {}
    }

    // Strategy 4: Fix trailing commas
    if (!result) {
      try {
        const fixed = text?.replace(/,\s*]/g, ']').replace(/,\s*}/g, '}');
        const match = fixed?.match(/\{[\s\S]*\}/);
        if (match) {
          result = JSON.parse(match[0]);
          console.log('âœ… Strategy 4 worked');
        }
      } catch (_) {}
    }

    if (!result || !result.ideas || result.ideas.length === 0) {
      console.error('âŒ All parse strategies failed.');
      return NextResponse.json(
        { error: 'AI response could not be parsed. Please try again.' },
        { status: 500 }
      );
    }

    console.log(`âœ… Successfully parsed ${result.ideas.length} ideas`);
    return NextResponse.json({ result }, { headers: responseHeaders });

  } catch (error: any) {
    console.error('âŒ Business Ideas Route Error:', error?.message || error);
    return NextResponse.json(
      { error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
