'use client'

import { useRouter } from 'next/navigation'

interface UpgradeNudgeModalProps {
  isOpen: boolean
  onClose: () => void
  featureName: string       // e.g. "AI Chat"
  currentLimit: number      // e.g. 10
  upgradeLimit: number      // e.g. 20
  upgradePlan: string       // e.g. "Pro"
  upgradePrice: string      // e.g. "₹299/mo"
}

export default function UpgradeNudgeModal({
  isOpen,
  onClose,
  featureName,
  currentLimit,
  upgradeLimit,
  upgradePlan,
  upgradePrice,
}: UpgradeNudgeModalProps) {
  const router = useRouter()
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl"
        style={{
          background: '#1a1a2e',
          border: '1px solid rgba(124, 58, 237, 0.3)',
        }}
      >
        {/* Icon */}
        <div className="text-4xl mb-4">⚡</div>

        {/* Title */}
        <h2 className="text-xl font-bold mb-2" style={{ color: '#F5F3FF' }}>
          You&apos;ve used all {currentLimit} {featureName} today
        </h2>

        {/* Description */}
        <p className="text-sm mb-6" style={{ color: '#9CA3AF' }}>
          Upgrade to{' '}
          <span className="font-semibold" style={{ color: '#A78BFA' }}>
            {upgradePlan}
          </span>{' '}
          and get{' '}
          <span className="font-semibold" style={{ color: '#F5F3FF' }}>
            {upgradeLimit}/day
          </span>{' '}
          — plus more features unlocked.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push('/pricing')}
            className="w-full font-semibold py-3 rounded-xl transition-all"
            style={{
              background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
              color: '#FFFFFF',
              border: 'none',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            Upgrade to {upgradePlan} — {upgradePrice}
          </button>
          <button
            onClick={onClose}
            className="w-full text-sm py-2 transition-colors"
            style={{ color: '#9CA3AF' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#F5F3FF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
          >
            Maybe tomorrow
          </button>
        </div>
      </div>
    </div>
  )
}
