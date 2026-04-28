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
    <div className="settings-page max-w-4xl mx-auto">
      <h1>
        Settings ⚙️
      </h1>

      <div className="settings-section">
        <h2>Profile Settings</h2>
        <div className="settings-field">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="settings-field"
          />
        </div>
        <div className="settings-field">
          <label>Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="settings-field"
            style={{ opacity: 0.6, cursor: 'not-allowed' }}
          />
        </div>
      </div>

      <div className="settings-section">
        <h2>Preferences</h2>
        <div className="settings-field">
          <label>Default Tone Mode</label>
          <select
            value={toneMode}
            onChange={(e) => setToneMode(e.target.value)}
            className="settings-field"
          >
            <option value="simple">Simple</option>
            <option value="balanced">Balanced</option>
            <option value="expert">Expert</option>
            <option value="study">Study</option>
            <option value="business">Business</option>
          </select>
        </div>
        <div className="settings-field">
          <label>Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="settings-field"
          >
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="hinglish">Hinglish</option>
          </select>
        </div>
      </div>

      <button
        onClick={saveSettings}
        disabled={saving}
        className="btn-save"
      >
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  )
}
