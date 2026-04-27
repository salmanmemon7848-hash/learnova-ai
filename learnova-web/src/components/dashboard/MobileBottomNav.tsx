'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Target, Camera, Lightbulb, Settings } from 'lucide-react'

const navItems = [
  { icon: MessageSquare, label: 'Chat', href: '/dashboard/chat' },
  { icon: Target, label: 'Exam', href: '/dashboard/exam' },
  { icon: Camera, label: 'Doubt', href: '/dashboard/doubt-solver' },
  { icon: Lightbulb, label: 'Ideas', href: '/dashboard/validate' },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings' },
]

export default function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t flex lg:hidden justify-around py-2 z-40" style={{ backgroundColor: '#13151e', borderTop: '0.5px solid #2a2d3a' }}>
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors"
            style={{
              color: isActive ? '#a78bfa' : '#9ca3af'
            }}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
