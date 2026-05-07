import { getSearchContext, buildSearchUsageInstruction } from '@/lib/aiWithSearch'
import { getAIResponse } from '@/lib/aiRouter'
import { createClient } from '@/lib/supabase/server'
import { checkAndIncrementUsage, buildBlockedResponse, buildRateLimitHeaders } from '@/lib/rateLimit'
import { NextRequest, NextResponse } from 'next/server'
import {
  THINKIOR_FULL_CONTEXT,
  FOUNDER_KNOWLEDGE,
  getLanguageInstruction,
} from '@/lib/thinkiorKnowledge'
import {
  sanitizeJsonPostBody,
  sanitizeMessages,
  sanitizeString,
  validateLanguage,
} from '@/lib/validation'

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    let rawBody: unknown = {}
    try {
      rawBody = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const parsed = sanitizeJsonPostBody(rawBody, [
      'idea',
      'industry',
      'stage',
      'messages',
      'language',
      'targetMarket',
      'budget',
    ])
    if (!parsed.ok) return parsed.response

    const b = parsed.body

    // SECURITY: Sanitize user input to prevent XSS and injection attacks
    // OWASP Reference: A03:2021 Injection
    const idea = sanitizeString(b.idea, 8000)
    const industry = sanitizeString(b.industry, 200)
    const stage = sanitizeString(b.stage, 120)
    void sanitizeMessages(b.messages)
    void validateLanguage(b.language)
    const targetMarket = sanitizeString(b.targetMarket, 500)
    const budget = sanitizeString(b.budget, 200)

    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'unknown'
    const rateLimitResult = await checkAndIncrementUsage(session.user.id, 'validate', ipAddress)
    if (!rateLimitResult.allowed) return NextResponse.json(buildBlockedResponse(rateLimitResult), { status: 429 })
    const responseHeaders = buildRateLimitHeaders(rateLimitResult)

    // Validate input
    if (!idea || !idea.trim()) {
      return NextResponse.json({ error: 'Business idea is required' }, { status: 400 })
    }

    const languageInstruction = getLanguageInstruction(`${idea} ${stage}`);

    const baseSystemPrompt = `${THINKIOR_FULL_CONTEXT}
${FOUNDER_KNOWLEDGE}

LANGUAGE FOR THIS RESPONSE: ${languageInstruction}

You are an expert Indian startup advisor for Thinkior AI. You deeply understand:
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

    const result = await getAIResponse(
      [{ role: 'user', content: userPrompt }],
      systemPrompt,
      { temperature: 0.7, maxTokens: 3000, feature: 'validate' }
    )

    return NextResponse.json({ result }, { headers: responseHeaders })
  } catch (error: any) {
    console.error('❌ Validate Error:', error?.message || error)

    const msg = typeof error?.message === 'string' ? error.message : ''

    if (error?.name === 'AbortError' || msg.toLowerCase().includes('timeout')) {
      return NextResponse.json(
        { error: 'Request timed out. Please try again with a simpler idea description.' },
        { status: 408 }
      )
    }

    if (msg.includes('GROQ_API_KEY') || msg.includes('API key is missing or invalid')) {
      return NextResponse.json(
        {
          error:
            'AI is not configured for this deployment. Add GROQ_API_KEY in Vercel → Project → Settings → Environment Variables, then redeploy.',
        },
        { status: 503 }
      )
    }

    const status = error?.status ?? error?.response?.status
    if (status === 401 || status === 403) {
      return NextResponse.json(
        {
          error:
            'AI API key is missing or invalid. Check GROQ_API_KEY in your deployment environment.',
        },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { error: 'AI validation service is temporarily unavailable. Please try again in a moment.' },
      { status: 500 }
    )
  }
}
