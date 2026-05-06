'use client'

import { useState, useEffect } from 'react'
import { X, MessageSquare } from 'lucide-react'

export default function BetaBanner() {
  const [visible, setVisible] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if user has dismissed the banner in this session
    const dismissed = sessionStorage.getItem('beta-banner-dismissed')
    if (!dismissed) {
      setVisible(true)
    }
  }, [])

  const handleDismiss = () => {
    setVisible(false)
    sessionStorage.setItem('beta-banner-dismissed', 'true')
  }

  // Prevent flash during SSR
  if (!mounted) {
    return null
  }

  if (!visible) {
    return null
  }

  return (
    <div
      className="relative py-2 px-4"
      style={{
        backgroundColor: 'var(--accent)',
        color: '#ffffff',
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between text-xs md:text-sm">
        <div className="flex items-center gap-2 flex-1 pr-4">
          <MessageSquare className="w-4 h-4 flex-shrink-0" />
          <p className="leading-tight">
            <strong>Thinkior is in public beta.</strong>{' '}
            <span className="hidden sm:inline">You may encounter bugs. Your feedback helps us improve.</span>
            <span className="sm:hidden">Help us improve with your feedback.</span>
            {' '}
            <a
              href="mailto:feedback@learnova.ai"
              className="underline font-semibold hover:opacity-80 transition-opacity"
            >
              Send feedback →
            </a>
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 hover:bg-white/10 rounded transition-colors flex-shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
