'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BIZ_VALIDATOR_STORAGE_KEY,
  type BizValidatorStorage,
  type BizValidatorReport,
} from '@/lib/businessValidatorReport'

const TOAST_REDIRECT =
  '/tools/business-validator?toast=' + encodeURIComponent('Please validate an idea first')

const cardShell =
  'rounded-[16px] p-6 border border-[#2D1B69] bg-[#160D2E] transition-all duration-500 ease-out'

function ScoreRing({ score, strokeColor }: { score: number; strokeColor: string }) {
  const r = 40
  const c = 2 * Math.PI * r
  const pct = Math.min(100, Math.max(0, score))
  const offset = c * (1 - pct / 100)

  return (
    <div className="relative h-[96px] w-[96px] shrink-0">
      <svg width={96} height={96} viewBox="0 0 96 96" className="absolute inset-0">
        <circle cx={48} cy={48} r={r} fill="none" stroke="#2D1B69" strokeWidth={8} />
        <circle
          cx={48}
          cy={48}
          r={r}
          fill="none"
          stroke={strokeColor}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          transform="rotate(-90 48 48)"
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[18px] font-bold text-white leading-none">{score}</span>
        <span className="mt-0.5 text-[10px] font-medium text-[#9CA3AF]">/ 100</span>
      </div>
    </div>
  )
}

function GrowthTrendDisplay({ trend }: { trend: BizValidatorReport['market']['growthTrend'] }) {
  if (trend === 'up') {
    return <span className="text-[#22c55e] text-lg font-semibold">↑</span>
  }
  if (trend === 'down') {
    return <span className="text-[#ef4444] text-lg font-semibold">↓</span>
  }
  return <span className="text-[#9CA3AF] text-lg font-semibold">→</span>
}

function DemandPill({ level }: { level: BizValidatorReport['market']['demandLevel'] }) {
  const cls =
    level === 'High'
      ? 'bg-[#14532D] text-[#4ADE80] border-[#166534]'
      : level === 'Medium'
        ? 'bg-[#713F12] text-[#FDE047] border-[#A16207]'
        : 'bg-[#7F1D1D] text-[#FCA5A5] border-[#991B1B]'
  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-[13px] font-medium ${cls}`}>
      {level}
    </span>
  )
}

function saturationBarColor(pct: number) {
  if (pct < 40) return '#22c55e'
  if (pct <= 70) return '#eab308'
  return '#ef4444'
}

export default function BusinessValidatorResultPage() {
  const router = useRouter()
  const [data, setData] = useState<BizValidatorStorage | null>(null)
  const [mounted, setMounted] = useState(false)
  const [copyLabel, setCopyLabel] = useState('📋 Copy Report')

  useEffect(() => {
    const raw = localStorage.getItem(BIZ_VALIDATOR_STORAGE_KEY)
    if (!raw) {
      router.replace(TOAST_REDIRECT)
      return
    }
    try {
      const parsed = JSON.parse(raw) as BizValidatorStorage
      if (!parsed?.result || typeof parsed.result.score !== 'number') {
        router.replace(TOAST_REDIRECT)
        return
      }
      setData(parsed)
      requestAnimationFrame(() => setMounted(true))
    } catch {
      router.replace(TOAST_REDIRECT)
    }
  }, [router])

  const copyReport = async () => {
    if (!data) return
    await navigator.clipboard.writeText(JSON.stringify(data.result, null, 2))
    setCopyLabel('✓ Copied!')
    setTimeout(() => setCopyLabel('📋 Copy Report'), 2000)
  }

  if (!data) {
    return <div className="min-h-screen bg-[#080412]" />
  }

  const r = data.result
  const ringColor = r.score > 70 ? '#22c55e' : r.score >= 40 ? '#eab308' : '#ef4444'
  const satFill = saturationBarColor(r.marketSaturation)

  const cardAnim = (index: number) =>
    `${cardShell} ${
      mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
    }`

  return (
    <div className="min-h-screen bg-[#080412]">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <button
          type="button"
          onClick={() => router.push('/tools/business-validator')}
          className="text-[#A78BFA] text-[13px] hover:underline mb-4 block text-left"
        >
          ← Back to Validator
        </button>

        <header>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-[28px] font-semibold text-[#F5F3FF]">Validation Report</h1>
            <span className="text-[13px] px-3 py-1 rounded-full bg-[#1E1B4B] text-[#A78BFA] border border-[#4338CA]">
              {data.ideaName}
            </span>
          </div>
          <p className="text-[#9CA3AF] text-[14px] mt-2">
            AI-powered analysis of your business idea
          </p>
        </header>

        <div className="flex flex-col gap-5 mt-6">
          {/* Card 1 */}
          <section
            className={`border-l-4 border-[#7C3AED] ${cardAnim(0)}`}
            style={{ transitionDelay: mounted ? `${0 * 100}ms` : '0ms' }}
          >
            <h2 className="text-[16px] font-semibold text-[#F5F3FF] mb-4 flex items-center gap-2">
              Idea Score &amp; Summary
            </h2>
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <ScoreRing score={Math.round(r.score)} strokeColor={ringColor} />
              <div className="flex-1 min-w-0 w-full">
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280] mb-1">
                  Idea Score
                </p>
                <p className="text-[#D1D5DB] text-[14px] leading-relaxed">{r.summary}</p>
              </div>
            </div>
          </section>

          {/* Card 2 */}
          <section
            className={`border-l-4 border-[#2563EB] ${cardAnim(1)}`}
            style={{ transitionDelay: mounted ? `${1 * 100}ms` : '0ms' }}
          >
            <h2 className="text-[16px] font-semibold text-[#F5F3FF] mb-4 flex items-center gap-2">
              <span aria-hidden>📊</span>
              Market Analysis
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280] mb-1">
                  Market Size
                </p>
                <p className="text-[#D1D5DB] text-[14px]">{r.market.size}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280] mb-1">
                  Target Audience
                </p>
                <p className="text-[#D1D5DB] text-[14px]">{r.market.targetAudience}</p>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280] mb-1">
                  Growth Trend
                </p>
                <div className="flex items-center gap-2">
                  <GrowthTrendDisplay trend={r.market.growthTrend} />
                </div>
              </div>
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280] mb-1">
                  Demand Level
                </p>
                <DemandPill level={r.market.demandLevel} />
              </div>
            </div>
          </section>

          {/* Card 3 */}
          <section
            className={`border-l-4 border-[#EA580C] ${cardAnim(2)}`}
            style={{ transitionDelay: mounted ? `${2 * 100}ms` : '0ms' }}
          >
            <h2 className="text-[16px] font-semibold text-[#F5F3FF] mb-4 flex items-center gap-2">
              <span aria-hidden>⚔️</span>
              Competitor Overview
            </h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {r.competitors.map((c) => (
                <span
                  key={c}
                  className="bg-[#1C1532] text-[#F5F3FF] border border-[#2D1B69] rounded-full px-3 py-1 text-[13px]"
                >
                  {c}
                </span>
              ))}
            </div>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280] mb-1">
              Competitive Advantage
            </p>
            <p className="text-[#D1D5DB] text-[14px] leading-relaxed mb-4">{r.competitiveAdvantage}</p>
            <div className="flex items-center justify-between gap-3 mb-1">
              <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280]">
                Market Saturation
              </p>
              <span className="text-[#D1D5DB] text-[13px] font-medium">{r.marketSaturation}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-[#0F0A1E] border border-[#2D1B69] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${r.marketSaturation}%`, backgroundColor: satFill }}
              />
            </div>
          </section>

          {/* Card 4 */}
          <section
            className={`border-l-4 border-[#16A34A] ${cardAnim(3)}`}
            style={{ transitionDelay: mounted ? `${3 * 100}ms` : '0ms' }}
          >
            <h2 className="text-[16px] font-semibold text-[#F5F3FF] mb-4 flex items-center gap-2">
              <span aria-hidden>💰</span>
              Revenue Potential
            </h2>
            <p className="text-[#4ADE80] text-[22px] font-bold mb-4">{r.revenue.estimatedMonthly}</p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280] mb-2">
              Monetization Strategies
            </p>
            <ul className="space-y-2 mb-4">
              {r.revenue.monetizationStrategies.map((s) => (
                <li key={s} className="flex items-start gap-2 text-[#D1D5DB] text-[14px]">
                  <span className="text-[#22c55e] shrink-0">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] font-medium uppercase tracking-wide text-[#6B7280] mb-2">
              Time to Profitability
            </p>
            <span className="inline-block rounded-[12px] bg-[#14532D] text-[#4ADE80] border border-[#166534] px-4 py-2 text-[14px] font-medium">
              {r.revenue.timeToProfitability}
            </span>
          </section>

          {/* Card 5 */}
          <section
            className={`border-l-4 border-[#DB2777] ${cardAnim(4)}`}
            style={{ transitionDelay: mounted ? `${4 * 100}ms` : '0ms' }}
          >
            <h2 className="text-[16px] font-semibold text-[#F5F3FF] mb-4 flex items-center gap-2">
              <span aria-hidden>🚀</span>
              Action Plan / Next Steps
            </h2>
            <ol className="m-0 list-none p-0">
              {r.actionPlan.map((item, idx) => {
                const isLast = idx === r.actionPlan.length - 1
                return (
                  <li key={item.step} className="relative flex gap-4 pb-6 last:pb-0">
                    {!isLast && (
                      <span
                        className="absolute left-[11px] top-7 bottom-0 border-l-2 border-dashed border-[#2D1B69] w-px"
                        aria-hidden
                      />
                    )}
                    <div className="relative z-[1] flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#DB2777] text-[12px] font-bold text-white">
                      {item.step}
                    </div>
                    <div className="min-w-0 pt-0.5">
                      <h3 className="text-[15px] font-semibold text-[#F5F3FF]">{item.title}</h3>
                      <p className="mt-1 text-[13px] leading-relaxed text-[#9CA3AF]">{item.description}</p>
                    </div>
                  </li>
                )
              })}
            </ol>
          </section>
        </div>

        <div className="flex flex-wrap gap-3 justify-between items-center mt-8">
          <button
            type="button"
            onClick={() => router.push('/tools/business-validator')}
            className="rounded-[12px] px-5 py-2.5 text-[14px] font-medium transition-all hover:brightness-110 bg-[#1E1B4B] text-[#A78BFA] border border-[#4338CA]"
          >
            ← Start Over
          </button>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={copyReport}
              className="rounded-[12px] px-5 py-2.5 text-[14px] font-medium transition-all hover:brightness-110 bg-[#1C1532] text-[#F5F3FF] border border-[#2D1B69]"
            >
              {copyLabel}
            </button>
            <button
              type="button"
              onClick={() => alert('PDF export coming soon!')}
              className="rounded-[12px] px-5 py-2.5 text-[14px] font-medium transition-all hover:brightness-110 bg-gradient-to-r from-[#7C3AED] to-[#4F46E5] text-white"
            >
              ⬇ Export PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
