import Groq from 'groq-sdk'
import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch'
import { NextRequest, NextResponse } from 'next/server'
import {
  LEARNOVA_FULL_CONTEXT,
  FOUNDER_KNOWLEDGE,
  getLanguageInstruction,
} from '@/lib/learnovaKnowledge'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export async function POST(req: NextRequest) {
  try {
    const { idea, targetMarket, budget, industry } = await req.json()

    // Validate input
    if (!idea || !idea.trim()) {
      return NextResponse.json({ error: 'Business idea is required' }, { status: 400 })
    }

    const languageInstruction = getLanguageInstruction(idea);

    const baseSystemPrompt = `${LEARNOVA_FULL_CONTEXT}
${FOUNDER_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

You are an expert Indian startup advisor for Learnova AI. You deeply understand:
- Indian consumer behaviour and price sensitivity (customers won't pay more than they need to)
- Tier 1, Tier 2, Tier 3 city market dynamics
- Indian startup ecosystem (bootstrapped founders, angel networks, Sequoia India, govt schemes)
- GST, MSME registration, Startup India benefits, UPI/ONDC integrations
- Local competition: Reliance JioMart, Tata, Meesho, Flipkart, Swiggy, Zomato, etc.
- Real challenges: low margins, high CAC, logistics in smaller cities, cash economy

ALWAYS structure your validation response exactly like this:

## Idea Summary
[1-2 sentence restatement of the idea]

## Market Reality Check (India-specific)
- Target customer: [who exactly, city tier, income range in ₹]
- Market size: [TAM estimate in Indian context]
- What do Indians currently use for this problem?

## Validation Score: X/10
[Honest score with one-line reason]

## Green Flags
[What's genuinely promising in India — be specific]

## Red Flags
[Honest problems — don't sugarcoat]

## India-Specific Challenges
[Regulatory, cultural, infrastructure barriers]

## 3 Concrete Next Steps
[Specific, low-cost actions an Indian founder can take THIS WEEK]

## Your next 48-hour action:
[Single most important thing to do right now]

Always use ₹ for pricing. Always think about UPI and cash-on-delivery. Always consider whether this works in a city of 5 lakh population.`

    // Enrich system prompt with live market intelligence for this idea
    const searchContext = await getSearchContext(idea, 'validate', { industry: industry || '' })
    const searchUsageInstruction = buildSearchUsageInstruction(searchContext);
    const systemPrompt = searchContext
      ? `${baseSystemPrompt}\n\n${searchContext}\n\n${searchUsageInstruction}`
      : `${baseSystemPrompt}\n\n${searchUsageInstruction}`;

    const userPrompt = `Validate this business idea for the Indian market:
Idea: ${idea}
Target market: ${targetMarket || 'Not specified'}
Starting budget: ${budget || 'Not specified'}
Industry: ${industry || 'Not specified'}

Please analyse this thoroughly using your India expertise.`

    const completion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 3000,
    })

    const result = completion.choices[0]?.message?.content || ''

    return NextResponse.json({ result })
  } catch (error: any) {
    console.error('❌ Validate Error:', error?.message || error)
    
    // Handle timeout errors
    if (error?.name === 'AbortError' || error?.message?.includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timed out. Please try again with a simpler idea description.' },
        { status: 408 }
      )
    }
    
    return NextResponse.json(
      { error: 'AI validation service is temporarily unavailable. Please try again in a moment.' },
      { status: 500 }
    )
  }
}
