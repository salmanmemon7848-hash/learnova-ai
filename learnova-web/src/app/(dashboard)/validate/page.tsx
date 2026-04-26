'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ValidatePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [idea, setIdea] = useState('')
  const [loading, setLoading] = useState(false)

  const handleValidateIdea = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea }),
      })

      const data = await response.json()
      
      if (response.ok) {
        // Save to sessionStorage and redirect to results page
        sessionStorage.setItem('validationResult', JSON.stringify(data))
        sessionStorage.setItem('validationIdea', idea)
        router.push('/validate/results')
      } else {
        alert(`Error: ${data.error || 'Failed to validate idea'}`)
      }
    } catch (error) {
      console.error('Validation failed:', error)
      alert('Failed to validate idea. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#e2e8f0' }}>
        Idea Validator 💡
      </h1>

      <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#13151e', border: '0.5px solid #2a2d3a' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#e2e8f0' }}>Describe Your Business Idea</h2>
        <p className="mb-4" style={{ color: '#9ca3af' }}>
          Tell me about your startup idea and I'll analyze market potential, risks, and give you actionable next steps.
        </p>
        <textarea
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="e.g., I want to build a platform that connects local tutors with students in my city..."
          rows={6}
          className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all resize-none"
          style={{ backgroundColor: '#0f1117', borderColor: '#2a2d3a', color: '#e2e8f0' } as React.CSSProperties}
          onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
          onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
        />
        <button
          onClick={handleValidateIdea}
          disabled={loading || !idea.trim()}
          className="mt-4 w-full py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-white"
          style={{ backgroundColor: '#7c3aed' }}
        >
          {loading ? 'Analyzing...' : 'Validate My Idea'}
        </button>
      </div>
    </div>
  )
}
