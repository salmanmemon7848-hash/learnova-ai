'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.user_metadata?.name || '')
  const [toneMode, setToneMode] = useState('balanced')
  const [language, setLanguage] = useState('en')
  const [saving, setSaving] = useState(false)

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, toneMode, language }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#e2e8f0' }}>
        Settings ⚙️
      </h1>

      <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#13151e', border: '0.5px solid #2a2d3a' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#e2e8f0' }}>Profile Settings</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 transition-all"
              style={{ backgroundColor: '#0f1117', borderColor: '#2a2d3a', color: '#e2e8f0' } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
              onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-4 py-2 border rounded-lg"
              style={{ backgroundColor: '#0f1117', borderColor: '#2a2d3a', color: '#9ca3af' }}
            />
          </div>
        </div>
      </div>

      <div className="rounded-xl p-6 mb-6" style={{ backgroundColor: '#13151e', border: '0.5px solid #2a2d3a' }}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#e2e8f0' }}>Preferences</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
              Default Tone Mode
            </label>
            <select
              value={toneMode}
              onChange={(e) => setToneMode(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 transition-all"
              style={{ backgroundColor: '#0f1117', borderColor: '#2a2d3a', color: '#e2e8f0' } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
              onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
            >
              <option value="simple">Simple</option>
              <option value="balanced">Balanced</option>
              <option value="expert">Expert</option>
              <option value="study">Study</option>
              <option value="business">Business</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: '#d1d5db' }}>
              Language
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 transition-all"
              style={{ backgroundColor: '#0f1117', borderColor: '#2a2d3a', color: '#e2e8f0' } as React.CSSProperties}
              onFocus={(e) => e.target.style.borderColor = '#5b21b6'}
              onBlur={(e) => e.target.style.borderColor = '#2a2d3a'}
            >
              <option value="en">English</option>
              <option value="hi">Hindi</option>
              <option value="hinglish">Hinglish</option>
            </select>
          </div>
        </div>
      </div>

      <button
        onClick={saveSettings}
        disabled={saving}
        className="w-full py-3 rounded-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-white"
        style={{ backgroundColor: '#7c3aed' }}
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}
