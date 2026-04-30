import { generateText } from '@/lib/openai';
import { createClient } from '@/lib/supabase/server';
import { askAIWithSearch } from '@/lib/aiWithSearch';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { answers, existingIdeas, count } = body;

    console.log('📥 Business Ideas API called with answers:', answers);

    const labelMap: Record<string, Record<string, string>> = {
      '1': { tech: 'Technology & Apps', education: 'Education & Coaching', health: 'Health & Wellness', lifestyle: 'Fashion & Beauty', food: 'Food & Agriculture', finance: 'Finance & Investment' },
      '2': { communication: 'Communication & Talking', creative: 'Creative Work', technical: 'Technical/Coding', organizing: 'Planning & Organizing', teaching: 'Teaching & Explaining', problem_solving: 'Problem Solving' },
      '3': { minimal: 'Less than 1 hour/day', part_time: '1-3 hours/day', serious: '3-6 hours/day', full_time: 'Full time 8+ hours/day' },
      '4': { zero: 'Zero budget', low: 'Under ₹10,000', medium: '₹10,000 to ₹1 Lakh', high: '₹1 Lakh or more' },
      '5': { students: 'Students & Young People', professionals: 'Working Professionals', small_business: 'Small Business Owners', rural: 'Rural Communities', families: 'Parents & Families', everyone: 'Mass Market' },
      '6': { product: 'Sell physical products', service: 'Offer a service', platform: 'Build app or platform', content: 'Content or courses', resell: 'Resell or franchise' },
      '7': { financial_risk: 'Losing money', time: 'Not enough time', market_risk: 'Nobody will buy', skills_gap: 'Lacks skills', competition: 'Too much competition', fearless: 'Not afraid at all' },
      '8': { side_income: '₹20-50K side income/month', full_income: 'Replace full-time salary', exit: 'Build and sell company', scale: 'Scale to 100+ crore', impact: 'Social impact' },
    };

    const profile = Object.entries(answers || {}).map(([qId, val]) => {
      const readable = labelMap[qId]?.[val as string] || val;
      const qNames: Record<string, string> = {
        '1': 'Interest', '2': 'Strength', '3': 'Daily Time',
        '4': 'Budget', '5': 'Target Customer', '6': 'Business Model',
        '7': 'Biggest Fear', '8': '3-Year Goal',
      };
      return `${qNames[qId] || `Q${qId}`}: ${readable}`;
    }).join('\n');

    const excludeText = existingIdeas?.length > 0
      ? `Do NOT repeat: ${existingIdeas.join(', ')}.`
      : '';

    // FASTER, SHORTER PROMPT for quicker response
    const prompt = `You are an expert Indian business coach. Generate exactly ${count || 5} personalized startup ideas for this person:

${profile}
${excludeText}

Return ONLY a JSON array. No text before or after. No markdown. Just pure JSON starting with [ and ending with ]:

[{"name":"Business Name","category":"Category","description":"What it is and how it works in 2-3 sentences","difficulty":"Easy","viabilityScore":80,"scores":{"market_demand":80,"profit_potential":75,"ease_of_execution":85,"india_fit":90},"revenue":"₹X-Y/month","investment":"₹X to start","timeToRevenue":"X weeks","whyPerfect":"Why this matches their exact profile","howItWorks":"Day to day operations","revenueModel":"Exact pricing math","firstSteps":["Step 1","Step 2","Step 3","Step 4","Step 5","Step 6","Step 7"],"indianExamples":"Real Indian examples","toolsNeeded":["Tool1","Tool2","Tool3"],"risks":"Main risks and how to avoid","competitiveEdge":"Their unique advantage"}]

Make all ${count || 5} ideas different industries. Match their exact budget (${labelMap['4']?.[answers?.['4'] as string] || 'unknown'}) and time (${labelMap['3']?.[answers?.['3'] as string] || 'unknown'}). Be specific with Indian rupee amounts and Indian market context.`;

    // Enrich prompt with live Indian startup/market data
    const interestLabel = labelMap['1']?.[answers?.['1'] as string] || answers?.['1'] || 'business';
    const budgetLabel = labelMap['4']?.[answers?.['4'] as string] || 'any budget';
    const searchQuery = `India startup business ideas ${interestLabel} ${budgetLabel} market 2025`;
    const { finalSystemPrompt } = await askAIWithSearch({
      userMessage: searchQuery,
      systemPrompt: `You are an expert Indian business coach who gives personalized startup ideas based on real Indian market conditions.`,
      needsSearch: true,
    });

    console.log('🤖 Calling Groq AI...');

    const text = await generateText(finalSystemPrompt ? prompt : prompt, finalSystemPrompt || undefined);

    console.log('📤 Raw AI response length:', text?.length);
    console.log('📤 First 200 chars:', text?.substring(0, 200));

    // Try multiple parsing strategies
    let ideas = null;

    // Strategy 1: Direct parse if starts with [
    try {
      const trimmed = text?.trim();
      if (trimmed?.startsWith('[')) {
        ideas = JSON.parse(trimmed);
        console.log('✅ Strategy 1 worked — direct parse');
      }
    } catch (e) {
      console.log('Strategy 1 failed:', e);
    }

    // Strategy 2: Find JSON array in text
    if (!ideas) {
      try {
        const match = text?.match(/\[[\s\S]*\]/);
        if (match) {
          ideas = JSON.parse(match[0]);
          console.log('✅ Strategy 2 worked — regex match');
        }
      } catch (e) {
        console.log('Strategy 2 failed:', e);
      }
    }

    // Strategy 3: Clean markdown and retry
    if (!ideas) {
      try {
        const cleaned = text?.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const match = cleaned?.match(/\[[\s\S]*\]/);
        if (match) {
          ideas = JSON.parse(match[0]);
          console.log('✅ Strategy 3 worked — cleaned markdown');
        }
      } catch (e) {
        console.log('Strategy 3 failed:', e);
      }
    }

    // Strategy 4: Fix common JSON issues and retry
    if (!ideas) {
      try {
        const fixed = text
          ?.replace(/,\s*]/g, ']')
          ?.replace(/,\s*}/g, '}')
          ?.replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
        const match = fixed?.match(/\[[\s\S]*\]/);
        if (match) {
          ideas = JSON.parse(match[0]);
          console.log('✅ Strategy 4 worked — fixed JSON');
        }
      } catch (e) {
        console.log('Strategy 4 failed:', e);
      }
    }

    if (!ideas || ideas.length === 0) {
      console.error('❌ All parsing strategies failed. Raw text:', text);
      return NextResponse.json(
        { error: 'AI response could not be parsed. Please try again.' },
        { status: 500 }
      );
    }

    console.log(`✅ Successfully parsed ${ideas.length} ideas`);
    return NextResponse.json({ ideas });

  } catch (error: any) {
    console.error('❌ Business Ideas Route Error:', error?.message || error);
    return NextResponse.json(
      { error: 'Server error. Please try again.' },
      { status: 500 }
    );
  }
}
