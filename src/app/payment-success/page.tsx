'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import confetti from 'canvas-confetti'
import { CheckCircle2, ArrowRight } from 'lucide-react'

export default function PaymentSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mounted, setMounted] = useState(false)

  const plan = searchParams.get('plan')
  
  const planNames: Record<string, string> = {
    pro: 'Pro',
    max: 'Max',
    builder: 'Builder',
    founder_pro: 'Founder Pro',
  }
  
  const displayPlan = plan ? planNames[plan] || plan : 'your new plan'

  useEffect(() => {
    setMounted(true)
    
    // Confetti animation
    const duration = 3 * 1000
    const end = Date.now() + duration

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#7C3AED', '#4F46E5', '#A78BFA']
      })
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#7C3AED', '#4F46E5', '#A78BFA']
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }
    
    frame()
  }, [])

  if (!mounted) return null

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F19] px-4">
      <div 
        className="w-full max-w-md rounded-3xl p-8 text-center"
        style={{
          background: 'linear-gradient(135deg, rgba(22, 13, 46, 0.96), rgba(30, 16, 64, 0.98))',
          border: '1px solid #2a2d3a',
          boxShadow: '0 0 40px rgba(124, 58, 237, 0.15)'
        }}
      >
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#1E1B4B]">
          <CheckCircle2 size={40} className="text-[#4ADE80]" />
        </div>
        
        <h1 className="mb-2 text-3xl font-bold text-[#F5F3FF]">Payment Successful!</h1>
        <p className="mb-8 text-[#C4B5FD]">
          Welcome to <span className="font-semibold text-white">{displayPlan}</span>. 
          Your new features have been unlocked.
        </p>
        
        <button
          onClick={() => router.push('/dashboard')}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all hover:brightness-110"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
            color: '#FFFFFF',
            boxShadow: '0 4px 20px #7C3AED40'
          }}
        >
          Start Using Learnova
          <ArrowRight size={18} />
        </button>
      </div>
    </div>
  )
}
