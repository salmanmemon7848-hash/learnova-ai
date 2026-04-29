'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Copy, Check, ArrowLeft } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getBusinessWhatsAppLink } from '@/lib/utils/streak'

export default function ValidatePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    idea: '',
    targetMarket: 'Tier 2',
    budget: '₹50K–5L',
    industry: 'EdTech',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState('')
  const [copied, setCopied] = useState(false)

  const targetMarkets = ['Metro City', 'Tier 1', 'Tier 2', 'Tier 3', 'Pan-India']
  const budgets = ['Under ₹50K', '₹50K–5L', '₹5L–50L', '₹50L+']
  const industries = ['EdTech', 'FinTech', 'D2C', 'SaaS', 'Food & Beverage', 'Healthcare', 'Offline Retail', 'Other']

  const handleValidate = async () => {
    if (!formData.idea.trim()) return
    
    setLoading(true)
    setResult('')

    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (response.ok && data.result) {
        setResult(data.result)
      } else {
        alert(data.error || 'Failed to validate idea')
      }
    } catch (error: any) {
      console.error('Validation failed:', error)
      alert('Failed to validate idea. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyResults = async () => {
    await navigator.clipboard.writeText(result)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShareWhatsApp = () => {
    const scoreMatch = result.match(/Validation Score:\s*([0-9.]+)\/10/)
    const score = scoreMatch ? scoreMatch[1] : 'X'
    const link = getBusinessWhatsAppLink(score)
    window.open(link, '_blank')
  }

  return (
    <div className="min-h-screen" style={{ background: '#080412', maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}>
      {/* Back Link */}
      <button
        onClick={() => router.push('/chat')}
        className="text-[13px] transition-colors hover:underline"
        style={{ color: '#A78BFA' }}
      >
        ← Back to Chat
      </button>

      {/* Page Header */}
      <div className="flex items-center gap-3 mt-4">
        <h1 className="text-[28px] font-semibold" style={{ color: '#F5F3FF' }}>
          Business Idea Validator
        </h1>
        <span
          className="text-[11px] px-3 py-0.5 rounded-[20px]"
          style={{
            background: '#1E1B4B',
            color: '#A78BFA',
            border: '1px solid #4338CA',
          }}
        >
          🇮🇳 India-focused
        </span>
      </div>

      {/* Input Form Card */}
      <div
        className="rounded-[16px] p-7 mt-6"
        style={{
          background: 'linear-gradient(135deg, #160D2E, #1E1040)',
          border: '1px solid #2D1B69',
          boxShadow: '0 0 40px #7C3AED18',
        }}
      >
        {/* Idea Textarea */}
        <div className="mb-4">
          <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#C4B5FD' }}>
            Describe your business idea *
          </label>
          <textarea
            value={formData.idea}
            onChange={(e) => setFormData({ ...formData, idea: e.target.value })}
            placeholder="e.g. An app that connects local tutors with students in Tier 2 cities..."
            className="w-full rounded-[10px] px-3.5 py-3 text-[14px] resize-y transition-all"
            style={{
              background: '#0F0A1E',
              border: '1px solid #2D1B69',
              color: '#F5F3FF',
              minHeight: '100px',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#7C3AED'
              e.target.style.boxShadow = '0 0 0 3px #7C3AED20'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#2D1B69'
              e.target.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Target Market */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#C4B5FD' }}>
              Target Market
            </label>
            <select
              value={formData.targetMarket}
              onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
              className="w-full rounded-[10px] px-3.5 py-2.5 text-[14px] appearance-none cursor-pointer transition-all"
              style={{
                background: '#0F0A1E',
                border: '1px solid #2D1B69',
                color: '#F5F3FF',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A78BFA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7C3AED'
                e.target.style.boxShadow = '0 0 0 3px #7C3AED20'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2D1B69'
                e.target.style.boxShadow = 'none'
              }}
            >
              {targetMarkets.map(market => (
                <option key={market} value={market}>{market}</option>
              ))}
            </select>
          </div>

          {/* Starting Budget */}
          <div>
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#C4B5FD' }}>
              Starting Budget
            </label>
            <select
              value={formData.budget}
              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              className="w-full rounded-[10px] px-3.5 py-2.5 text-[14px] appearance-none cursor-pointer transition-all"
              style={{
                background: '#0F0A1E',
                border: '1px solid #2D1B69',
                color: '#F5F3FF',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A78BFA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7C3AED'
                e.target.style.boxShadow = '0 0 0 3px #7C3AED20'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2D1B69'
                e.target.style.boxShadow = 'none'
              }}
            >
              {budgets.map(budget => (
                <option key={budget} value={budget}>{budget}</option>
              ))}
            </select>
          </div>

          {/* Industry */}
          <div className="md:col-span-2">
            <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#C4B5FD' }}>
              Industry
            </label>
            <select
              value={formData.industry}
              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
              className="w-full rounded-[10px] px-3.5 py-2.5 text-[14px] appearance-none cursor-pointer transition-all"
              style={{
                background: '#0F0A1E',
                border: '1px solid #2D1B69',
                color: '#F5F3FF',
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23A78BFA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 12px center',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#7C3AED'
                e.target.style.boxShadow = '0 0 0 3px #7C3AED20'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#2D1B69'
                e.target.style.boxShadow = 'none'
              }}
            >
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Validate Button */}
        <button
          onClick={handleValidate}
          disabled={loading || !formData.idea.trim()}
          className="w-full mt-6 flex items-center justify-center gap-2 text-white text-[16px] font-semibold rounded-[12px] transition-all disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
            height: '52px',
            boxShadow: '0 8px 32px #7C3AED40',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.filter = 'brightness(1.1)'
              e.currentTarget.style.boxShadow = '0 12px 40px #7C3AED50'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(1)'
            e.currentTarget.style.boxShadow = '0 8px 32px #7C3AED40'
            e.currentTarget.style.transform = 'translateY(0)'
          }}
        >
          {loading ? (
            <>
              <div
                className="w-4 h-4 rounded-full animate-spin"
                style={{
                  border: '2px solid white',
                  borderTopColor: '#7C3AED',
                }}
              />
              Analysing your idea...
            </>
          ) : (
            <>
              <Search size={18} />
              Validate My Idea →
            </>
          )}
        </button>
      </div>

      {/* Result Card */}
      {result && (
        <div
          className="rounded-[16px] p-7 mt-6"
          style={{
            background: 'linear-gradient(135deg, #160D2E, #1E1040)',
            border: '1px solid #2D1B69',
          }}
        >
          {/* Result Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[18px] font-semibold" style={{ color: '#F5F3FF' }}>
              Validation Result
            </h2>
            <div
              className="text-[16px] font-bold px-5 py-1.5 rounded-[20px]"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                color: 'white',
                boxShadow: '0 4px 16px #7C3AED40',
              }}
            >
              {result.match(/Validation Score:\s*([0-9.]+)\/10/)?.[1] || 'X'} / 10
            </div>
          </div>

          {/* Markdown Result */}
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h2: ({ children }) => {
                  const text = String(children)
                  let borderColor = '#7C3AED'
                  let titleColor = '#A78BFA'
                  let bulletColor = '#7C3AED'

                  if (text.includes('Green Flags')) {
                    borderColor = '#22C55E'
                    titleColor = '#4ADE80'
                    bulletColor = '#22C55E'
                  } else if (text.includes('Red Flags')) {
                    borderColor = '#EF4444'
                    titleColor = '#F87171'
                    bulletColor = '#EF4444'
                  } else if (text.includes('Next Steps')) {
                    borderColor = '#7C3AED'
                    titleColor = '#A78BFA'
                    bulletColor = '#7C3AED'
                  }

                  if (text.includes('48-hour action')) {
                    return (
                      <div
                        className="rounded-lg p-3.5 mb-3"
                        style={{
                          background: '#1E1B4B',
                          border: '1px solid #4338CA',
                        }}
                      >
                        <p className="text-[14px] italic" style={{ color: '#C4B5FD' }}>
                          {children}
                        </p>
                      </div>
                    )
                  }

                  return (
                    <div
                      className="rounded-[10px] p-4 mb-2.5"
                      style={{
                        background: '#0F0A1E',
                        border: '1px solid #2D1B69',
                        borderLeft: `2px solid ${borderColor}`,
                        borderRadius: `0 10px 10px 0`,
                      }}
                    >
                      <h3 className="text-[13px] font-semibold mb-2" style={{ color: titleColor }}>
                        {children}
                      </h3>
                    </div>
                  )
                },
                p: ({ children }) => {
                  const text = String(children)
                  if (text.includes('48-hour action') || text.includes('THIS WEEK')) {
                    return (
                      <p className="text-[14px] italic mb-2" style={{ color: '#C4B5FD' }}>
                        {children}
                      </p>
                    )
                  }
                  return <p className="text-[14px] text-[#F5F3FF] leading-relaxed mb-2">{children}</p>
                },
                ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
                li: ({ children }) => <li className="text-[#C4B5FD] pl-1 mb-1">{children}</li>,
                strong: ({ children }) => <strong className="text-[#F5F3FF] font-semibold">{children}</strong>,
              }}
            >
              {result}
            </ReactMarkdown>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={handleShareWhatsApp}
              className="text-[13px] px-4 py-2 rounded-lg cursor-pointer transition-all duration-150"
              style={{
                background: '#075E54',
                color: 'white',
                border: 'none',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#128C7E'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#075E54'}
            >
              Share on WhatsApp
            </button>
            <button
              onClick={handleCopyResults}
              className="text-[13px] px-4 py-2 rounded-lg transition-all hover:bg-[#1E1B4B]"
              style={{
                border: '1px solid #4338CA',
                color: '#A78BFA',
              }}
            >
              {copied ? <Check size={14} className="inline mr-1" /> : <Copy size={14} className="inline mr-1" />}
              {copied ? 'Copied!' : 'Copy Results'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
