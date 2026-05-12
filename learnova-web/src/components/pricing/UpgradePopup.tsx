'use client'

import { Lock, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface UpgradePopupProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
  userType: 'student' | 'founder'
}

export function UpgradePopup({ isOpen, onClose, featureName, userType }: UpgradePopupProps) {
  const router = useRouter()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div 
        className="relative w-full max-w-md rounded-2xl p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(22, 13, 46, 0.98), rgba(30, 16, 64, 0.98))',
          border: '1px solid #2a2d3a',
          boxShadow: '0 0 40px rgba(0, 0, 0, 0.5)'
        }}
      >
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 text-[#9CA3AF] hover:text-white"
        >
          <X size={20} />
        </button>

        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#1E1B4B]">
          <Lock size={24} className="text-[#A78BFA]" />
        </div>

        <h2 className="mb-2 text-xl font-bold text-[#F5F3FF]">
          {featureName} is locked
        </h2>
        <p className="mb-6 text-sm text-[#C4B5FD]">
          This feature is not available on your current plan. Upgrade to unlock {featureName} and much more.
        </p>

        <div className="flex flex-col gap-3">
          {userType === 'student' ? (
            <>
              <button
                onClick={() => router.push('/pricing')}
                className="w-full rounded-xl border border-[#4338CA] bg-[#1E1B4B] px-4 py-3 text-sm font-semibold text-[#E2E8F0] transition-colors hover:bg-[#312E81]"
              >
                Upgrade to Pro ₹299/mo
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  boxShadow: '0 4px 20px #7C3AED40'
                }}
              >
                Upgrade to Max ₹599/mo
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/pricing')}
                className="w-full rounded-xl border border-[#4338CA] bg-[#1E1B4B] px-4 py-3 text-sm font-semibold text-[#E2E8F0] transition-colors hover:bg-[#312E81]"
              >
                Upgrade to Builder ₹299/mo
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="w-full rounded-xl px-4 py-3 text-sm font-semibold text-white transition-all hover:brightness-110"
                style={{
                  background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  boxShadow: '0 4px 20px #7C3AED40'
                }}
              >
                Upgrade to Founder Pro ₹599/mo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
