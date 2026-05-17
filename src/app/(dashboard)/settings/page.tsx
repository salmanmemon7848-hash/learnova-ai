'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.user_metadata?.name || '')
  const [toneMode, setToneMode] = useState('balanced')
  const [language, setLanguage] = useState('en')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const saveSettings = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, toneMode, language }),
      })
      if (!response.ok) throw new Error('Failed to save settings')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (error) {
      console.error('Save failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #2D1B69',
    background: '#0F0A1E',
    color: '#F5F3FF',
    fontSize: 14,
    outline: 'none',
  }

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: '#C4B5FD',
    marginBottom: 6,
  }

  const sectionStyle = {
    background: '#13151e',
    border: '1px solid #2a2d3a',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 16,
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 16 }}>
      <h1 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#F5F3FF', marginBottom: 4 }}>
        Settings ⚙️
      </h1>
      <p style={{ color: '#6b7280', fontSize: 13, marginBottom: 24 }}>
        Manage your profile and preferences
      </p>

      {/* Profile Section */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px 0' }}>
          Profile Settings
        </h2>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            style={{ ...inputStyle, opacity: 0.5, cursor: 'not-allowed' }}
          />
        </div>
      </div>

      {/* Preferences Section */}
      <div style={sectionStyle}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: '#e2e8f0', margin: '0 0 16px 0' }}>
          Preferences
        </h2>
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Default Tone Mode</label>
          <select
            value={toneMode}
            onChange={(e) => setToneMode(e.target.value)}
            style={inputStyle}
          >
            <option value="simple">🌱 Simple</option>
            <option value="balanced">⚖️ Balanced</option>
            <option value="expert">🎓 Expert</option>
            <option value="study">📚 Study</option>
            <option value="business">💼 Business</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Language</label>
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            style={inputStyle}
          >
            <option value="en">🇺🇸 English</option>
            <option value="hi">🇮🇳 Hindi</option>
            <option value="hinglish">🇮🇳 Hinglish</option>
          </select>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={saveSettings}
        disabled={saving}
        style={{
          width: '100%',
          padding: '12px 0',
          borderRadius: 10,
          border: 'none',
          background: saved ? '#065f46' : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: saving ? 'not-allowed' : 'pointer',
          opacity: saving ? 0.7 : 1,
          transition: 'all 0.2s',
        }}
      >
        {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Settings'}
      </button>
    </div>
  )
}
