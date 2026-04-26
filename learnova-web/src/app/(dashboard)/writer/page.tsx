'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'

export default function WriterPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [contentType, setContentType] = useState('essay')
  const [topic, setTopic] = useState('')
  const [tone, setTone] = useState('professional')
  const [loading, setLoading] = useState(false)

  const generateContent = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/writer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contentType, topic, tone }),
      })

      const data = await response.json()
      
      if (data.error) throw new Error(data.error)

      // Save to sessionStorage and redirect to results page
      sessionStorage.setItem('writerResult', JSON.stringify(data.content))
      sessionStorage.setItem('writerMeta', JSON.stringify({ contentType, topic, tone }))
      router.push('/writer/results')

    } catch (err: any) {
      console.error(err)
      alert('Failed to generate content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#e2e8f0' }}>
        AI Writer ✍️
      </h1>

      <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#13151e', border: '0.5px solid #2a2d3a' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#e2e8f0' }}>Generate Content</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 transition-all"
              style={{ backgroundColor: '#0f1117', borderColor: '#2a2d3a', color: '#e2e8f0' } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
              onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
            >
              <option value="essay">Essay</option>
              <option value="pitch">Business Pitch</option>
              <option value="email">Email</option>
              <option value="blog">Blog Post</option>
              <option value="marketing">Marketing Copy</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
              Topic / Subject
            </label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g., The impact of AI on education..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 transition-all"
              style={{ backgroundColor: '#0f1117', borderColor: '#2a2d3a', color: '#e2e8f0' } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
              onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
              Tone
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 transition-all"
              style={{ backgroundColor: '#0f1117', borderColor: '#2a2d3a', color: '#e2e8f0' } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
              onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
            >
              <option value="professional">Professional</option>
              <option value="casual">Casual</option>
              <option value="academic">Academic</option>
              <option value="persuasive">Persuasive</option>
            </select>
          </div>
          <button
            onClick={generateContent}
            disabled={loading || !topic.trim()}
            className="w-full py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-white"
            style={{ backgroundColor: '#7c3aed' }}
          >
            {loading ? 'Generating...' : 'Generate Content'}
          </button>
        </div>
      </div>
    </div>
  )
}
