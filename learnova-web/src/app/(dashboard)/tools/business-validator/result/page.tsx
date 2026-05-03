'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  BIZ_VALIDATOR_STORAGE_KEY,
  type BizValidatorStorage,
  type BizValidatorReport,
} from '@/lib/businessValidatorReport'

function TrendIcon({ trend }: { trend: BizValidatorReport['market']['growthTrend'] }) {
  if (trend === 'up') {
    return (
      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    )
  }
  if (trend === 'down') {
    return (
      <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
      </svg>
    )
  }
  return (
    <svg className="w-5 h-5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
    </svg>
  )
}

function DemandBadge({ level }: { level: BizValidatorReport['market']['demandLevel'] }) {
  const styles =
    level === 'High'
      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
      : level === 'Medium'
        ? 'bg-amber-500/20 text-amber-200 border-amber-500/40'
        : 'bg-red-500/20 text-red-300 border-red-500/40'
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${styles}`}>{level}</span>
  )
}

export default function BusinessValidatorResultPage() {
  const router = useRouter()
  const [data, setData] = useState<BizValidatorStorage | null>(null)
  const [showCards, setShowCards] = useState(false)

  useEffect(() => {
    const raw = localStorage.getItem(BIZ_VALIDATOR_STORAGE_KEY)
    if (!raw) {
      router.replace(
        `/tools/business-validator?toast=${encodeURIComponent('Please validate an idea first.')}`
      )
      return
    }
    try {
      const parsed = JSON.parse(raw) as BizValidatorStorage
      if (!parsed?.result || typeof parsed.result.score !== 'number') {
        router.replace(
          `/tools/business-validator?toast=${encodeURIComponent('Please validate an idea first.')}`
        )
        return
      }
      setData(parsed)
      requestAnimationFrame(() => setShowCards(true))
    } catch {
      router.replace(
        `/tools/business-validator?toast=${encodeURIComponent('Please validate an idea first.')}`
      )
    }
  }, [router])

  const copyReport = async () => {
    if (!data) return
    const text = JSON.stringify(data.result, null, 2)
    await navigator.clipboard.writeText(text)
  }

  if (!data) {
    return <div className="min-h-screen bg-gray-950" />
  }

  const { result: r, ideaName } = data
  const ringColor = r.score > 70 ? '#22c55e' : r.score >= 40 ? '#eab308' : '#ef4444'

  const cardBase =
    'rounded-2xl p-6 bg-zinc-900/80 border border-zinc-800 shadow-lg transition-all duration-500 ease-out'
  const fade = (i: number) =>
    `${showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'} ${cardBase}`

  return (
    <div className="min-h-screen bg-gray-950 text-zinc-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <button
          type="button"
          onClick={() => router.push('/tools/business-validator')}
          className="text-sm text-violet-400 hover:text-violet-300 hover:underline mb-6"
        >
          ← Back to Validator
        </button>

        <header className="mb-10">
          <div className="flex flex-wrap items-center gap-3 gap-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Validation Report</h1>
            <span
              className="text-xs sm:text-sm font-medium px-3 py-1 rounded-full border"
              style={{ borderColor: '#7c3aed55', background: '#7c3aed22', color: '#c4b5fd' }}
            >
              {ideaName}
            </span>
          </div>
          <p className="mt-2 text-zinc-400 text-sm sm:text-base">AI-powered analysis of your business idea</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {/* Card 1 — Score + Summary */}
          <section
            className={`md:col-span-2 ${fade(0)}`}
            style={{ transitionDelay: showCards ? '0ms' : '0ms', borderLeft: '4px solid #7c3aed' }}
          >
            <div className="flex flex-col sm:flex-row sm:items-start gap-6">
              <div className="flex items-center gap-3 sm:block sm:text-center mx-auto sm:mx-0">
                <div
                  className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center shrink-0 p-1"
                  style={{
                    background: `conic-gradient(${ringColor} ${r.score}%, #27272a 0)`,
                  }}
                >
                  <div className="w-full h-full rounded-full bg-zinc-950 flex flex-col items-center justify-center">
                    <span className="text-2xl sm:text-3xl font-bold text-white">{r.score}</span>
                    <span className="text-xs text-zinc-500">/ 100</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-6 h-6 text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <h2 className="text-lg font-semibold text-white">Idea Score &amp; Summary</h2>
                </div>
                <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">{r.summary}</p>
              </div>
            </div>
          </section>

          {/* Card 2 — Market */}
          <section
            className={fade(1)}
            style={{ transitionDelay: showCards ? '100ms' : '0ms', borderLeft: '4px solid #2563eb' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-blue-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-lg font-semibold text-white">Market Analysis</h2>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-zinc-500 text-xs uppercase tracking-wide">Market size estimate</dt>
                <dd className="text-zinc-200 mt-1">{r.market.size}</dd>
              </div>
              <div>
                <dt className="text-zinc-500 text-xs uppercase tracking-wide">Target audience</dt>
                <dd className="text-zinc-200 mt-1">{r.market.targetAudience}</dd>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <dt className="text-zinc-500 text-xs uppercase tracking-wide w-full">Growth trend</dt>
                <dd className="flex items-center gap-2 text-zinc-200">
                  <TrendIcon trend={r.market.growthTrend} />
                  <span className="capitalize">{r.market.growthTrend}</span>
                </dd>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-zinc-500 text-xs uppercase tracking-wide">Demand level</span>
                <DemandBadge level={r.market.demandLevel} />
              </div>
            </dl>
          </section>

          {/* Card 3 — Competitors */}
          <section
            className={fade(2)}
            style={{ transitionDelay: showCards ? '200ms' : '0ms', borderLeft: '4px solid #ea580c' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-orange-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h2 className="text-lg font-semibold text-white">Competitor Overview</h2>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {r.competitors.slice(0, 5).map((c) => (
                <span
                  key={c}
                  className="text-xs px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-200 border border-orange-500/30"
                >
                  {c}
                </span>
              ))}
            </div>
            <div className="mb-4">
              <h3 className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Competitive advantage</h3>
              <p className="text-sm text-zinc-300 leading-relaxed">{r.competitiveAdvantage}</p>
            </div>
            <div>
              <div className="flex justify-between text-xs text-zinc-500 mb-1">
                <span>Market saturation</span>
                <span>{r.marketSaturation}%</span>
              </div>
              <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-orange-500 transition-all duration-700"
                  style={{ width: `${r.marketSaturation}%` }}
                />
              </div>
            </div>
          </section>

          {/* Card 4 — Revenue */}
          <section
            className={`md:col-span-2 ${fade(3)}`}
            style={{ transitionDelay: showCards ? '300ms' : '0ms', borderLeft: '4px solid #16a34a' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h2 className="text-lg font-semibold text-white">Revenue Potential</h2>
            </div>
            <p className="text-lg font-semibold text-green-300 mb-4">{r.revenue.estimatedMonthly}</p>
            <h3 className="text-xs uppercase tracking-wide text-zinc-500 mb-2">Monetization strategies</h3>
            <ul className="space-y-2">
              {r.revenue.monetizationStrategies.map((s) => (
                <li key={s} className="flex gap-2 text-sm text-zinc-300">
                  <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 pt-4 border-t border-zinc-800">
              <h3 className="text-xs uppercase tracking-wide text-zinc-500 mb-1">Time to profitability</h3>
              <p className="text-sm text-zinc-200">{r.revenue.timeToProfitability}</p>
            </div>
          </section>

          {/* Card 5 — Action plan */}
          <section
            className={`md:col-span-2 ${fade(4)}`}
            style={{ transitionDelay: showCards ? '400ms' : '0ms', borderLeft: '4px solid #db2777' }}
          >
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-6 h-6 text-pink-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                />
              </svg>
              <h2 className="text-lg font-semibold text-white">Action Plan / Next Steps</h2>
            </div>
            <ol className="space-y-4">
              {r.actionPlan.map((item) => (
                <li key={item.step} className="flex gap-4">
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #db2777, #7c3aed)' }}
                  >
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-medium text-white">{item.title}</h3>
                    <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{item.description}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* CTA strip */}
        <div
          className={`mt-10 flex flex-col sm:flex-row flex-wrap gap-3 p-5 rounded-2xl border border-zinc-800 bg-zinc-900/50 transition-all duration-500 ${
            showCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
          }`}
          style={{ transitionDelay: showCards ? '500ms' : '0ms' }}
        >
          <button
            type="button"
            onClick={() => router.push('/tools/business-validator')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition hover:brightness-110"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)' }}
          >
            Start Over
          </button>
          <button
            type="button"
            onClick={() => alert('PDF export coming soon.')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-zinc-600 text-zinc-200 hover:bg-zinc-800 transition"
          >
            Export as PDF
          </button>
          <button
            type="button"
            onClick={copyReport}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold border border-zinc-600 text-zinc-200 hover:bg-zinc-800 transition"
          >
            Copy Report
          </button>
        </div>
      </div>
    </div>
  )
}
