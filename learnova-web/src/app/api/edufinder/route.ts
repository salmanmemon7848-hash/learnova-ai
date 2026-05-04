import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { checkAndIncrementUsage, buildBlockedResponse, buildRateLimitHeaders } from '@/lib/rateLimit';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import { getAIResponse } from '@/lib/aiRouter';
import {
  LEARNOVA_FULL_CONTEXT,
  EDUFINDER_KNOWLEDGE,
  STUDENT_KNOWLEDGE,
  getLanguageInstruction,
  buildIndianSearchQuery,
} from '@/lib/learnovaKnowledge';
import { sanitizeArray, sanitizeJsonPostBody, sanitizeString, validateLanguage } from '@/lib/validation';

// â”€â”€â”€ POST handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function POST(req: NextRequest) {
  try {
    let rawBody: unknown = {};
    try {
      rawBody = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const parsed = sanitizeJsonPostBody(rawBody, [
      'userType',
      'educationLevel',
      'eduLevel',
      'fields',
      'budget',
      'location',
      'userCity',
      'userState',
      'userPincode',
      'entranceExam',
      'entrance',
      'language',
    ]);
    if (!parsed.ok) return parsed.response;

    const b = parsed.body;

    // SECURITY: Sanitize user input to prevent XSS and injection attacks
    // OWASP Reference: A03:2021 Injection
    const userType = sanitizeString(b.userType, 120);
    const eduLevel = sanitizeString(b.eduLevel || b.educationLevel, 120);
    const fields = sanitizeArray(b.fields, 40, 120);
    const budget = sanitizeString(b.budget, 200);
    const locationFallback = sanitizeString(b.location, 300);
    const userCity = sanitizeString(b.userCity, 120);
    const userState = sanitizeString(b.userState, 120);
    const userPincode = sanitizeString(b.userPincode, 32);
    const entrance = sanitizeString(b.entrance || b.entranceExam, 120);
    void userPincode;
    void validateLanguage(b.language);

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown';
    const rateLimitResult = await checkAndIncrementUsage(session.user.id, 'edufinder', ipAddress);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(buildBlockedResponse(rateLimitResult), { status: 429 });
    }
    const responseHeaders = buildRateLimitHeaders(rateLimitResult);

    const fieldStr = Array.isArray(fields) && fields.length > 0 ? fields.join(' ') : 'general';
    const location = [userCity, userState].filter(Boolean).join(', ') || locationFallback;

    // â”€â”€ Language detection â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const languageInstruction = getLanguageInstruction(fieldStr);

    const budgetMap: Record<string, string> = {
      'Under â‚¹50,000': 'under 50000',
      'â‚¹50,000 â€“ â‚¹2,00,000': 'under 2 lakh',
      'â‚¹2,00,000 â€“ â‚¹5,00,000': 'under 5 lakh',
      'â‚¹5,00,000+': 'above 5 lakh',
    };
    const budgetStr = budgetMap[budget] || budget || '';
    const examStr = entrance && entrance.toLowerCase() !== 'none' ? entrance : '';

    // â”€â”€ Steps A & B: Run two smart searches in parallel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const [localContext, nationalContext] = await Promise.all([
      getSearchContext(
        `${fieldStr} colleges ${userCity || ''} ${userState || ''}`.trim(),
        'edufinder',
        { field: fieldStr, budget: budgetStr }
      ),
      getSearchContext(
        `best ${fieldStr} colleges India ${examStr}`.trim(),
        'edufinder',
        { field: fieldStr, budget: budgetStr }
      ),
    ]);

    const searchUsageInstruction = buildSearchUsageInstruction(localContext || nationalContext);

    console.log('[EduFinder] Local search context length:', localContext.length);
    console.log('[EduFinder] National search context length:', nationalContext.length);

    // â”€â”€ Step C: Build upgraded system prompt â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const systemPrompt = `${LEARNOVA_FULL_CONTEXT}
${EDUFINDER_KNOWLEDGE}
${STUDENT_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

${searchUsageInstruction}

You are EduFinder â€” a strict, honest institution advisor for Indian students. You give honest assessments, not just positive ones.

Student profile:
- User type: ${userType}
- Education level: ${eduLevel}
- Fields of interest: ${Array.isArray(fields) ? fields.join(', ') : 'Not specified'}
- Annual budget: ${budget}
- Location preference: ${location || 'Not specified'}
- Entrance exam status: ${entrance || 'None'}

Use the web search results below to get current NIRF rankings, fees, and admission data.

WEB SEARCH RESULTS:
LOCAL (near ${location}):
${localContext || 'No local results found.'}

NATIONAL:
${nationalContext || 'No national results found.'}

Respond ONLY in this exact JSON â€” no markdown, no extra text:

{
  "readiness_assessment": {
    "overall_readiness": "Ready | Partially Ready | Not Ready Yet",
    "readiness_score": number,
    "honest_feedback": "string â€” be honest if student is not ready",
    "improvement_needed": ["string", "string"]
  },
  "top_institutions": [
    {
      "rank": 1,
      "name": "string",
      "location": "City, State",
      "type": "Government | Private | Deemed",
      "fees_per_year": "â‚¹X",
      "nirf_ranking": "string",
      "why_good_match": "string â€” specific to student answers",
      "why_might_not_fit": "string â€” honest downside",
      "entrance_required": "string",
      "scholarship_available": "string",
      "admission_difficulty": "Easy | Moderate | Competitive | Highly Competitive",
      "student_profile_match": number
    }
  ],
  "field_analysis": {
    "chosen_field": "string",
    "market_demand": "High | Medium | Low",
    "avg_starting_salary": "â‚¹X LPA",
    "top_companies_hiring": ["string", "string"],
    "honest_reality": "string â€” real talk about this field in India",
    "alternative_fields": ["string", "string"]
  },
  "action_plan": [
    {
      "priority": 1,
      "action": "string",
      "deadline": "string",
      "why_important": "string"
    }
  ],
  "budget_reality_check": "string â€” honest assessment of what this budget can get in India",
  "final_advice": "string â€” one paragraph of honest personalized guidance"
}`;

    // â”€â”€ Step D: Call AI router â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const rawContent = await getAIResponse(
      [{ role: 'user', content: 'Generate EduFinder recommendations in the requested JSON format.' }],
      systemPrompt,
      { maxTokens: 3000, feature: 'edufinder' }
    );

    if (!rawContent) {
      return NextResponse.json({ error: 'No recommendations received from AI. Please try again.' }, { status: 500 });
    }

    // Try to parse JSON, fall back to raw text
    let recommendations: any = null;
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        recommendations = JSON.parse(jsonMatch[0]);
      } catch {
        recommendations = null;
      }
    }

    console.log('[EduFinder] âœ… Recommendations generated successfully');

    if (recommendations) {
      return NextResponse.json({ recommendations, structured: true }, { headers: responseHeaders });
    }

    // Fallback: return raw text
    return NextResponse.json({ recommendations: rawContent, structured: false }, { headers: responseHeaders });

  } catch (error: any) {
    console.error('[EduFinder] Route error:', error?.message || error);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
