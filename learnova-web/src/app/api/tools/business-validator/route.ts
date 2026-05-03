import { NextRequest, NextResponse } from 'next/server'
import { getAIResponse } from '@/lib/aiRouter'
import { parseBizValidatorReport } from '@/lib/businessValidatorReport'

export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_PROMPT = `You are an expert startup business analyst. Analyze the business idea and return ONLY valid JSON (no markdown fences, no commentary) in this exact shape:

{
  "score": <number 0-100>,
  "summary": "<2-3 sentence overview>",
  "market": {
    "size": "<e.g. $4.2B global market>",
    "targetAudience": "<who are the customers>",
    "growthTrend": "up" | "down" | "stable",
    "demandLevel": "High" | "Medium" | "Low"
  },
  "competitors": ["<name1>", "<name2>", "<name3>"],
  "competitiveAdvantage": "<what makes this idea unique>",
  "marketSaturation": <number 0-100>,
  "revenue": {
    "estimatedMonthly": "<e.g. $5,000 - $20,000>",
    "monetizationStrategies": ["<strategy1>", "<strategy2>", "<strategy3>"],
    "timeToProfitability": "<e.g. 6-12 months>"
  },
  "actionPlan": [
    { "step": 1, "title": "<short title>", "description": "<1-2 sentences>" }
  ]
}

Include 4-6 objects in actionPlan. Use realistic strings and numbers.`

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const ideaName = String(body.ideaName ?? '').trim()
    const description = String(body.description ?? '').trim()
    const targetAudience = String(body.targetAudience ?? '').trim()

    if (!ideaName || !description) {
      return NextResponse.json(
        { error: 'Idea name and description are required.' },
        { status: 400 }
      )
    }

    const userContent = `Business Idea: ${ideaName}
Description: ${description}
Target Audience: ${targetAudience || 'Not specified'}`

    const raw = (
      await getAIResponse(
        [{ role: 'user', content: userContent }],
        SYSTEM_PROMPT,
        {
          temperature: 0.35,
          maxTokens: 3000,
          timeoutMs: process.env.VERCEL ? 12_000 : 45_000,
          feature: 'business-validator',
        }
      )
    ).trim()
    const report = parseBizValidatorReport(raw)

    if (!report) {
      console.error('[business-validator] Parse failed. Raw:', raw.slice(0, 400))
      return NextResponse.json(
        { error: 'Could not parse AI report. Please try again.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ report })
  } catch (error: unknown) {
    console.error('[business-validator]', error)
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: msg || 'Validation failed. Please try again.' },
      { status: 500 }
    )
  }
}
