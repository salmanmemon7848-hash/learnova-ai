export type BizValidatorReport = {
  score: number
  summary: string
  market: {
    size: string
    targetAudience: string
    growthTrend: 'up' | 'down' | 'stable'
    demandLevel: 'High' | 'Medium' | 'Low'
  }
  competitors: string[]
  competitiveAdvantage: string
  marketSaturation: number
  revenue: {
    estimatedMonthly: string
    monetizationStrategies: string[]
    timeToProfitability: string
  }
  actionPlan: Array<{ step: number; title: string; description: string }>
}

export type BizValidatorStorage = {
  ideaName: string
  description: string
  targetAudience: string
  /** Parsed AI report (JSON object). */
  result: BizValidatorReport
}

export const BIZ_VALIDATOR_STORAGE_KEY = 'bizValidatorResult'

export function parseBizValidatorReport(raw: string): BizValidatorReport | null {
  const text = raw.trim()
  if (!text) return null

  const attempts: string[] = [text]
  const unfenced = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  if (unfenced !== text) attempts.push(unfenced)

  for (const chunk of attempts) {
    try {
      if (chunk.startsWith('{')) {
        const data = JSON.parse(chunk) as BizValidatorReport
        if (typeof data.score === 'number' && data.market && data.revenue) return normalizeReport(data)
      }
    } catch {
      /* continue */
    }
    const match = chunk.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        const data = JSON.parse(match[0]) as BizValidatorReport
        if (typeof data.score === 'number' && data.market && data.revenue) return normalizeReport(data)
      } catch {
        /* continue */
      }
    }
  }
  return null
}

function normalizeReport(data: BizValidatorReport): BizValidatorReport {
  const trend = data.market?.growthTrend
  const growthTrend =
    trend === 'up' || trend === 'down' || trend === 'stable' ? trend : 'stable'

  const demand = data.market?.demandLevel
  const demandLevel =
    demand === 'High' || demand === 'Medium' || demand === 'Low' ? demand : 'Medium'

  return {
    ...data,
    score: Math.min(100, Math.max(0, Number(data.score) || 0)),
    market: {
      ...data.market,
      growthTrend,
      demandLevel,
    },
    competitors: Array.isArray(data.competitors) ? data.competitors : [],
    marketSaturation: Math.min(
      100,
      Math.max(0, Number(data.marketSaturation) || 0)
    ),
    revenue: {
      estimatedMonthly: data.revenue?.estimatedMonthly ?? '',
      monetizationStrategies: Array.isArray(data.revenue?.monetizationStrategies)
        ? data.revenue.monetizationStrategies
        : [],
      timeToProfitability: data.revenue?.timeToProfitability ?? '',
    },
    actionPlan: Array.isArray(data.actionPlan) ? data.actionPlan : [],
  }
}
