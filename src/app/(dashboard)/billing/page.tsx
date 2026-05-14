'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

export default function BillingPage() {
  const { data: session } = useSession()
  const userName = session?.user?.name || 'there'

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6" style={{ color: '#e2e8f0' }}>
        Billing & Subscription 💳
      </h1>

      {/* Current Plan */}
      <div className="bg-[#13151e] rounded-2xl border-2 border-[#2a2d3a] p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#e2e8f0' }}>Current Plan</h2>
        <div className="bg-[#1e2130] p-6 rounded-xl">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-2xl font-bold" style={{ color: '#a78bfa' }}>Free Plan 🆓</p>
              <p className="text-sm" style={{ color: '#9ca3af' }}>Try karo, trust karo</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold" style={{ color: '#e2e8f0' }}>₹0</p>
              <p className="text-xs" style={{ color: '#9ca3af' }}>per month</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#2a2d3a]">
            <div>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Chats Today</p>
              <p className="text-lg font-semibold" style={{ color: '#e2e8f0' }}>12/20</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Exams This Month</p>
              <p className="text-lg font-semibold" style={{ color: '#e2e8f0' }}>1/3</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Doubts Today</p>
              <p className="text-lg font-semibold" style={{ color: '#e2e8f0' }}>2/3</p>
            </div>
            <div>
              <p className="text-xs" style={{ color: '#9ca3af' }}>Validations</p>
              <p className="text-lg font-semibold" style={{ color: '#e2e8f0' }}>0/1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Upgrade Banner */}
      <div className="bg-gradient-to-r from-[#534AB7] to-[#3C3489] rounded-2xl p-6 mb-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-2">Unlock Full Potential 🚀</h3>
            <p className="text-sm opacity-90">
              Get unlimited doubts, full analytics, parent dashboard, and more starting at just ₹79/month
            </p>
          </div>
          <Link
            href="/pricing"
            className="px-6 py-3 bg-[#7c3aed] text-white rounded-xl font-semibold hover:shadow-lg hover:bg-[#6d28d9] transition-all whitespace-nowrap"
          >
            View Plans
          </Link>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-[#13151e] rounded-2xl border-2 border-[#2a2d3a] p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#e2e8f0' }}>Payment History</h2>
        <div className="text-center py-8">
          <p className="text-4xl mb-3">📝</p>
          <p style={{ color: '#9ca3af' }}>No payment history available.</p>
          <p className="text-sm mt-1" style={{ color: '#9ca3af' }}>Upgrade to a paid plan to get started!</p>
        </div>
      </div>

      {/* Special Offers */}
      <div className="bg-[#13151e] rounded-2xl border-2 border-[#2a2d3a] p-6">
        <h2 className="text-xl font-semibold mb-4" style={{ color: '#e2e8f0' }}>Special Offers 🎉</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 bg-[#1e2130] rounded-xl">
            <div className="text-2xl mb-2">📦</div>
            <h4 className="font-semibold text-sm mb-1" style={{ color: '#e2e8f0' }}>Family Pack</h4>
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              ₹249/month for 2 siblings (saves ₹79/month)
            </p>
          </div>
          <div className="p-4 bg-[#1e2130] rounded-xl">
            <div className="text-2xl mb-2">🏫</div>
            <h4 className="font-semibold text-sm mb-1" style={{ color: '#e2e8f0' }}>School/Coaching Plan</h4>
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              ₹999/month for 20 students (₹50/student)
            </p>
          </div>
          <div className="p-4 bg-[#1e2130] rounded-xl">
            <div className="text-2xl mb-2">🎁</div>
            <h4 className="font-semibold text-sm mb-1" style={{ color: '#e2e8f0' }}>Referral Bonus</h4>
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              Refer 3 friends → Get 1 month free
            </p>
          </div>
          <div className="p-4 bg-[#1e2130] rounded-xl">
            <div className="text-2xl mb-2">📱</div>
            <h4 className="font-semibold text-sm mb-1" style={{ color: '#e2e8f0' }}>Free Trial</h4>
            <p className="text-xs" style={{ color: '#9ca3af' }}>
              7 days free on any paid plan — no credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
