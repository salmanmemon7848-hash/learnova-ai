'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import {
  BIZ_VALIDATOR_STORAGE_KEY,
  type BizValidatorStorage,
} from '@/lib/businessValidatorReport'

function BusinessValidatorForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [toast, setToast] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    ideaName: '',
    description: '',
    targetAudience: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const t = searchParams.get('toast')
    if (t) {
      setToast(decodeURIComponent(t))
      router.replace('/tools/business-validator', { scroll: false })
    }
  }, [searchParams, router])

  const handleValidate = async () => {
    if (!formData.ideaName.trim() || !formData.description.trim()) return

    setLoading(true)
    try {
      const response = await fetch('/api/tools/business-validator', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ideaName: formData.ideaName.trim(),
          description: formData.description.trim(),
          targetAudience: formData.targetAudience.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.report) {
        alert(data.error || 'Failed to validate idea')
        return
      }

      const payload: BizValidatorStorage = {
        ideaName: formData.ideaName.trim(),
        description: formData.description.trim(),
        targetAudience: formData.targetAudience.trim(),
        result: data.report,
      }

      localStorage.setItem(BIZ_VALIDATOR_STORAGE_KEY, JSON.stringify(payload))
      router.push('/tools/business-validator/result')
    } catch (e) {
      console.error(e)
      alert('Failed to validate idea. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen"
      style={{ background: '#080412', maxWidth: '800px', margin: '0 auto', padding: '32px 20px' }}
    >
      {toast && (
        <div
          role="alert"
          className="mb-4 rounded-[12px] px-4 py-3 text-[14px]"
          style={{
            background: '#1E1B4B',
            border: '1px solid #4338CA',
            color: '#E9D5FF',
          }}
        >
          <div className="flex justify-between gap-3">
            <span>{toast}</span>
            <button
              type="button"
              className="shrink-0 underline text-[#A78BFA]"
              onClick={() => setToast(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => router.push('/chat')}
        className="text-[13px] transition-colors hover:underline"
        style={{ color: '#A78BFA' }}
      >
        ← Back to Chat
      </button>

      <div className="flex flex-wrap items-center gap-3 mt-4">
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
          AI report
        </span>
      </div>

      <div
        className="rounded-[16px] p-7 mt-6"
        style={{
          background: 'linear-gradient(135deg, #160D2E, #1E1040)',
          border: '1px solid #2D1B69',
          boxShadow: '0 0 40px #7C3AED18',
        }}
      >
        <div className="mb-4">
          <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#C4B5FD' }}>
            Idea name *
          </label>
          <input
            type="text"
            value={formData.ideaName}
            onChange={(e) => setFormData({ ...formData, ideaName: e.target.value })}
            placeholder="e.g. TutorLink — Tier-2 city tutoring marketplace"
            className="w-full rounded-[10px] px-3.5 py-3 text-[14px] transition-all"
            style={{
              background: '#0F0A1E',
              border: '1px solid #2D1B69',
              color: '#F5F3FF',
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

        <div className="mb-4">
          <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#C4B5FD' }}>
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What problem you solve, how it works, and what makes it different..."
            className="w-full rounded-[10px] px-3.5 py-3 text-[14px] resize-y transition-all"
            style={{
              background: '#0F0A1E',
              border: '1px solid #2D1B69',
              color: '#F5F3FF',
              minHeight: '120px',
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

        <div className="mb-2">
          <label className="block text-[12px] font-medium mb-1.5" style={{ color: '#C4B5FD' }}>
            Target audience
          </label>
          <input
            type="text"
            value={formData.targetAudience}
            onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
            placeholder="e.g. Parents of Class 9–12 students in Tier-2 cities"
            className="w-full rounded-[10px] px-3.5 py-3 text-[14px] transition-all"
            style={{
              background: '#0F0A1E',
              border: '1px solid #2D1B69',
              color: '#F5F3FF',
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

        <button
          type="button"
          onClick={handleValidate}
          disabled={loading || !formData.ideaName.trim() || !formData.description.trim()}
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
                className="w-5 h-5 rounded-full animate-spin"
                style={{
                  border: '2px solid white',
                  borderTopColor: 'transparent',
                }}
              />
              Generating report…
            </>
          ) : (
            <>
              <Search size={18} />
              Validate My Idea
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default function BusinessValidatorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080412]" />}>
      <BusinessValidatorForm />
    </Suspense>
  )
}
