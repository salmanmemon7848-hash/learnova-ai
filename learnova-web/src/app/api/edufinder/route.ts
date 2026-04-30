import { NextRequest, NextResponse } from 'next/server';
import { searchWeb } from '@/lib/searxng';

// ─── System Prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are EduFinder — an intelligent institution discovery assistant inside an Indian education platform called Learnova AI. Your job is to recommend the most suitable schools, colleges, or coaching institutes based on a student's profile.

You will receive:
1. The student's profile including their exact city, state, and pincode
2. LOCAL web search results — institutions found near their city
3. NATIONAL web search results — top institutions across India

Always use ₹ for fees. Always reference NIRF rankings when available.

You must output TWO clearly labelled sections:

---SECTION: NEARBY---
List 2 to 3 institutions found in or near the student's city and state.
Only include institutions genuinely located in or very close to their city.
If no local options are found, say: "No strong local matches found — consider the national picks below."

---SECTION: NATIONAL---
List 3 to 5 top institutions across India best suited to this student's profile.
Never recommend foreign institutions unless the user explicitly asked for abroad.

For every institution in both sections use this exact format:

---
🏆 [Rank]. [Institution Name]
📍 Location: [City, State]
🎓 Type: [Government / Private / Deemed / Autonomous]
💰 Approx Fees: ₹[X] per year
⭐ NIRF Ranking: [Rank or "Highly Regarded"]
📌 Why it suits you: [2–3 lines personalised to their specific profile answers]
🎯 Entrance Required: [Exam name or Direct Admission]
💡 Scholarship Available: [Yes — mention type / No]
---

After all recommendations, end with one short motivational line for Indian students.

Special rules:
- Budget under ₹50,000: Prioritise government colleges, mention PM scholarship schemes and NSP portal
- No entrance exam: Recommend direct/management quota colleges, suggest which exam to register for
- Never discourage low marks — suggest IGNOU, open universities, lateral entry options
- Every "Why it suits you" must reference something specific from the student's actual answers
- Never output more than 5 institutions in the national section`;

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userType, eduLevel, fields, budget, userCity, userState, userPincode, entrance } = body;

    const fieldStr = Array.isArray(fields) && fields.length > 0 ? fields.join(' ') : 'general';

    const budgetMap: Record<string, string> = {
      'Under ₹50,000': 'under 50000',
      '₹50,000 – ₹2,00,000': 'under 2 lakh',
      '₹2,00,000 – ₹5,00,000': 'under 5 lakh',
      '₹5,00,000+': 'above 5 lakh',
    };
    const budgetStr = budgetMap[budget] || budget || '';
    const examStr = entrance && entrance.toLowerCase() !== 'none' ? entrance : '';

    // ── Step A: Build two SearXNG queries ─────────────────────────────────────

    const localQuery = `best ${fieldStr} schools colleges institutes in ${userCity || ''} ${userState || ''} ${userPincode || ''} ${budgetStr} 2025`.trim().replace(/\s+/g, ' ');
    const nationalQuery = `best ${fieldStr} colleges India ${budgetStr} ${examStr} 2025 NIRF ranking`.trim().replace(/\s+/g, ' ');

    console.log('[EduFinder] Local query:', localQuery);
    console.log('[EduFinder] National query:', nationalQuery);

    // ── Step B: Run both searches in parallel ──────────────────────────────────

    const [localResults, nationalResults] = await Promise.allSettled([
      searchWeb(localQuery),
      searchWeb(nationalQuery),
    ]);

    const localContext = localResults.status === 'fulfilled' && localResults.value.length > 0
      ? localResults.value.map(r => `Title: ${r.title} | Summary: ${r.content}`).join('\n')
      : 'No local results found.';

    const nationalContext = nationalResults.status === 'fulfilled' && nationalResults.value.length > 0
      ? nationalResults.value.map(r => `Title: ${r.title} | Summary: ${r.content}`).join('\n')
      : 'No national results found.';

    console.log('[EduFinder] Local results:', localResults.status === 'fulfilled' ? localResults.value.length : 0);
    console.log('[EduFinder] National results:', nationalResults.status === 'fulfilled' ? nationalResults.value.length : 0);

    // ── Step C: Build user message ─────────────────────────────────────────────

    const userMessage = `Student Profile:
- User type: ${userType || 'Student'}
- Education level: ${eduLevel || 'Not specified'}
- Fields of interest: ${Array.isArray(fields) ? fields.join(', ') : 'Not specified'}
- Annual budget: ${budget || 'Not specified'}
- City: ${userCity || 'Not specified'}
- State: ${userState || 'Not specified'}
- Pincode: ${userPincode || 'Not specified'}
- Entrance exam: ${entrance || 'None'}

LOCAL Search Results (institutions near ${userCity || ''}, ${userState || ''}):
${localContext}

NATIONAL Search Results (top institutions across India):
${nationalContext}

Please recommend institutions in TWO sections: nearby institutions first, then national top picks.
Return as: { "recommendations": "..." }`;

    // ── Step D: Call Groq API ──────────────────────────────────────────────────

    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
      }),
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      console.error('[EduFinder] Groq API error:', errText);
      return NextResponse.json({ error: 'AI service is temporarily unavailable. Please try again.' }, { status: 502 });
    }

    const groqData = await groqResponse.json();
    const recommendations = groqData?.choices?.[0]?.message?.content || '';

    if (!recommendations) {
      return NextResponse.json({ error: 'No recommendations received from AI. Please try again.' }, { status: 500 });
    }

    console.log('[EduFinder] ✅ Recommendations generated successfully');
    return NextResponse.json({ recommendations });

  } catch (error: any) {
    console.error('[EduFinder] Route error:', error?.message || error);
    return NextResponse.json({ error: 'Server error. Please try again.' }, { status: 500 });
  }
}
