import { NextRequest, NextResponse } from 'next/server';
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch';
import {
  LEARNOVA_FULL_CONTEXT,
  EDUFINDER_KNOWLEDGE,
  STUDENT_KNOWLEDGE,
  getLanguageInstruction,
  buildIndianSearchQuery,
} from '@/lib/learnovaKnowledge';

// â”€â”€â”€ POST handler â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userType, eduLevel, fields, budget, userCity, userState, userPincode, entrance } = body;

    const fieldStr = Array.isArray(fields) && fields.length > 0 ? fields.join(' ') : 'general';
    const location = [userCity, userState].filter(Boolean).join(', ');

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

    // â”€â”€ Step D: Call Groq API â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 3000,
        messages: [
          { role: 'user', content: systemPrompt },
        ],
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('[EduFinder] Groq API error:', errText);
      return NextResponse.json({ error: 'AI service is temporarily unavailable. Please try again.' }, { status: 502 });
    }

    const groqData = await groqResponse.json();
    const rawContent = groqData?.choices?.[0]?.message?.content || '';

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
      return NextResponse.json({ recommendations, structured: true });
    }

    // Fallback: return raw text
    return NextResponse.json({ recommendations: rawContent, structured: false });

  } catch (error: any) {
    console.error('[EduFinder] Route error:', error?.message || error);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
