import { chatWithHistory } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { askAIWithSearch } from '@/lib/aiWithSearch';
import { logActivity } from '@/lib/supabase/dashboardHelpers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const userId = session.user.id;
    const body = await req.json();
    const { answers } = body;

    const systemPrompt = `You are an expert startup consultant creating a 10-slide investor pitch deck.

Based on the user's answers, generate content for these 10 slides:
1. Cover - Startup name and tagline
2. Problem - The pain point being solved
3. Solution - How the startup solves it
4. Market Size - Target market and opportunity
5. Business Model - How it makes money
6. Traction - Current status (be honest: "Early stage, building MVP" if applicable)
7. Competition - Main competitors and differentiation
8. Team - Founding team
9. Ask - Funding amount and use of funds
10. Thank You - Contact information

Return ONLY a JSON array of 10 slide objects with this exact structure:
[
  {
    "title": "Slide Title",
    "content": "Slide content (can be multiple lines separated by \\n)"
  },
  ...
]

Make the content:
- Professional and investor-ready
- Concise (bullet points, not paragraphs)
- Specific to the user's startup
- Realistic and honest about stage
- Action-oriented

Do not include any other text or explanations.`;

    const userMessage = `Create my pitch deck with these answers:
- What: ${answers.what || 'Not provided'}
- Problem: ${answers.problem || 'Not provided'}
- Customer: ${answers.customer || 'Not provided'}
- Revenue: ${answers.revenue || 'Not provided'}
- Competitors: ${answers.competitors || 'Not provided'}
- Different: ${answers.different || 'Not provided'}
- Go-to-market: ${answers.gomarket || 'Not provided'}
- Team: ${answers.team || 'Not provided'}
- Raise: ${answers.raise || 'Not provided'}
- Funds: ${answers.funds || 'Not provided'}`;

    // Enrich system prompt with live market/competition data for this startup
    const searchQuery = `${answers.what || 'startup'} India market competition investors pitch 2025`.trim()
    const { finalSystemPrompt: enrichedSystemPrompt } = await askAIWithSearch({
      userMessage: searchQuery,
      systemPrompt,
      needsSearch: true,
    })

    const response = await chatWithHistory(
      [{ role: 'user', content: userMessage }],
      enrichedSystemPrompt
    );

    // Parse the response
    let slides: any[] = [];
    try {
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        slides = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('JSON parse error:', e);
    }

    if (slides.length === 0) {
      // Fallback slides if parsing fails
      slides = [
        { title: answers.what || 'Your Startup', content: 'Pitch Deck\nInvestor Presentation' },
        { title: 'Problem', content: answers.problem || 'The problem you are solving' },
        { title: 'Solution', content: answers.what || 'Your innovative solution' },
        { title: 'Market Size', content: 'Target Market: ' + (answers.customer || 'Your target customers') },
        { title: 'Business Model', content: answers.revenue || 'How you make money' },
        { title: 'Traction', content: 'Early stage, building MVP' },
        { title: 'Competition', content: 'Competitors: ' + (answers.competitors || 'Market players') + '\n\nDifferentiator: ' + (answers.different || 'Your edge') },
        { title: 'Team', content: answers.team || 'Founding team' },
        { title: 'Ask', content: 'Seeking: ' + (answers.raise || 'Funding') + '\n\nUse: ' + (answers.funds || 'Fund allocation') },
        { title: 'Thank You', content: 'Contact us to learn more' },
      ];
    }

    // ── Save to Supabase (non-blocking) ───────────────────────────────────────
    const deckTitle = `Pitch Deck: ${answers.what || 'My Startup'}`;
    try {
      await supabase.from('saved_files').insert({
        user_id: userId,
        file_type: 'pitch_deck',
        title: deckTitle,
        content: JSON.stringify(slides),
      });

      await logActivity(supabase, userId, 'pitch_deck', deckTitle, {});
    } catch (saveErr) {
      console.warn('[Pitch Deck] Failed to save to Supabase:', saveErr);
    }

    return NextResponse.json({ slides });
  } catch (error: any) {
    console.error('❌ Pitch Deck Error:', error?.message || error);
    return NextResponse.json({ error: 'Failed to generate pitch deck. Please try again.' }, { status: 500 });
  }
}
