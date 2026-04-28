'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function ValidatePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState({
    idea: '',
    targetAudience: '',
    city: '',
    budget: '',
    problem: '',
  })
  const [loading, setLoading] = useState(false)

  const handleValidateIdea = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      
      if (response.ok) {
        sessionStorage.setItem('validationResult', JSON.stringify(data))
        sessionStorage.setItem('validationIdea', formData.idea)
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

  return (
    <div className="max-w-4xl mx-auto" style={{ color: 'var(--foreground)' }}>
      <h1 className="text-3xl font-bold mb-6 font-heading">
        Idea Validator
      </h1>

      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h2 className="text-xl font-semibold mb-2">Describe Your Business Idea</h2>
        <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
          Fill in the details below and I'll analyze market potential, risks, and give you actionable next steps.
        </p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-secondary)' }}>
              Startup Idea Description *
            </label>
            <textarea
              value={formData.idea}
              onChange={(e) => setFormData({...formData, idea: e.target.value})}
              placeholder="e.g., I want to build a platform that connects local tutors with students in my city..."
              rows={4}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all resize-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-secondary)' }}>
              Target Audience *
            </label>
            <select
              value={formData.targetAudience}
              onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <option value="">Select target audience...</option>
              <option value="Students">Students</option>
              <option value="Professionals">Professionals</option>
              <option value="Businesses">Businesses</option>
              <option value="General consumers">General consumers</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-secondary)' }}>
              City/Region
            </label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({...formData, city: e.target.value})}
              placeholder="e.g., Bangalore, Delhi, Tier-2 cities"
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-secondary)' }}>
              Budget Range
            </label>
            <select
              value={formData.budget}
              onChange={(e) => setFormData({...formData, budget: e.target.value})}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            >
              <option value="">Select budget range...</option>
              <option value="Under ₹10K">Under ₹10K</option>
              <option value="₹10K–1L">₹10K–1L</option>
              <option value="₹1L+">₹1L+</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--foreground-secondary)' }}>
              Main Problem Being Solved *
            </label>
            <textarea
              value={formData.problem}
              onChange={(e) => setFormData({...formData, problem: e.target.value})}
              placeholder="What pain point does your idea address?"
              rows={3}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 transition-all resize-none"
              style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
          </div>

          <button
            onClick={handleValidateIdea}
            disabled={loading || !formData.idea.trim() || !formData.targetAudience || !formData.problem.trim()}
            className="w-full py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-white"
            style={{ backgroundColor: 'var(--highlight)' }}
          >
            {loading ? 'Analyzing...' : 'Validate My Idea'}
          </button>
        </div>
      </div>
    </div>
  )
}
