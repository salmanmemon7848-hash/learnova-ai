'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function PlannerPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [planType, setPlanType] = useState('study')
  const [goal, setGoal] = useState('')
  const [duration, setDuration] = useState('7')
  const [loading, setLoading] = useState(false)

  const handleGeneratePlan = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/planner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, planType, duration }),
      })

      const data = await response.json()
      
      if (response.ok) {
        // Save plan to sessionStorage and redirect to results page
        sessionStorage.setItem('generatedPlan', JSON.stringify(data))
        sessionStorage.setItem('planMeta', JSON.stringify({ goal, planType, duration }))
        router.push('/planner/results')
      } else {
        alert(`Error: ${data.error || 'Failed to generate plan'}`)
      }
    } catch (error) {
      console.error('Plan generation failed:', error)
      alert('Failed to generate plan. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#e2e8f0' }}>
        Smart Planner 📅
      </h1>

      <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#13151e', border: '0.5px solid #2a2d3a' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#e2e8f0' }}>Create Your Plan</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
              Plan Type
            </label>
            <select
              value={planType}
              onChange={(e) => setPlanType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 transition-all"
              style={{ backgroundColor: '#0f1117', borderColor: '#2a2d3a', color: '#e2e8f0' } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
              onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
            >
              <option value="study">Study Schedule</option>
              <option value="business">Business Action Plan</option>
              <option value="exam">Exam Preparation</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
              Your Goal
            </label>
            <input
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., Master calculus for my final exam..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 transition-all"
              style={{ backgroundColor: '#0f1117', borderColor: '#2a2d3a', color: '#e2e8f0' } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
              onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
              Duration (days)
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              min={1}
              max={90}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 transition-all"
              style={{ backgroundColor: '#0f1117', borderColor: '#2a2d3a', color: '#e2e8f0' } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
              onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
            />
          </div>
          <button
            onClick={handleGeneratePlan}
            disabled={loading || !goal.trim()}
            className="w-full py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-white"
            style={{ backgroundColor: '#7c3aed' }}
          >
            {loading ? 'Creating Plan...' : 'Generate My Plan'}
          </button>
        </div>
      </div>
    </div>
  )
}
