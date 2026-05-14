'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return // Already installed
    }

    // Check if user dismissed before
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedDate = new Date(dismissed)
      const daysSinceDismissal = (Date.now() - dismissedDate.getTime()) / (1000 * 60 * 60 * 24)
      if (daysSinceDismissal < 7) {
        return // Don't show again for 7 days
      }
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show prompt after 5 seconds
      setTimeout(() => {
        setShowPrompt(true)
      }, 5000)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
    } else {
      console.log('User dismissed the install prompt')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-fade-in">
      <div
        className="rounded-xl shadow-2xl border p-4"
        style={{
          background: '#13151e',
          borderColor: '#2a2d3a',
        }}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 hover:opacity-70 transition-opacity"
          style={{ color: '#9ca3af' }}
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div
            className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #534AB7 100%)' }}
          >
            <Smartphone className="w-6 h-6 text-white" />
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-base font-semibold mb-1" style={{ color: '#e2e8f0' }}>
              Install Thinkior AI
            </h3>
            <p className="text-sm mb-3" style={{ color: '#9ca3af' }}>
              Add to your home screen for quick access and offline support
            </p>

            <div className="flex gap-2">
              <button
                onClick={handleInstall}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #534AB7 100%)' }}
              >
                <Download className="w-4 h-4" />
                Install App
              </button>
              <button
                onClick={handleDismiss}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                style={{
                  background: '#1e2130',
                  color: '#9ca3af',
                  border: '1px solid #2a2d3a',
                }}
              >
                Later
              </button>
            </div>
          </div>
        </div>

        {/* Platform-specific instructions */}
        <div
          className="mt-3 pt-3 text-xs"
          style={{
            color: '#6b7280',
            borderTop: '1px solid #2a2d3a',
          }}
        >
          <p className="mb-1 font-medium" style={{ color: '#9ca3af' }}>
            Manual installation:
          </p>
          <p className="mb-1">
            <strong style={{ color: '#9ca3af' }}>iOS Safari:</strong> Tap Share → "Add to Home Screen"
          </p>
          <p>
            <strong style={{ color: '#9ca3af' }}>Android Chrome:</strong> Tap ⋮ → "Install app"
          </p>
        </div>
      </div>
    </div>
  )
}
