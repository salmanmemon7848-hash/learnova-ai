'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { MessageSquare, Target, Camera, Lightbulb, Settings, CheckCircle } from 'lucide-react'
import type { UserRole } from '@/contexts/RoleContext'

const studentItems = [
  { icon: MessageSquare, label: 'Chat',     href: '/chat' },
  { icon: Target,        label: 'Exam',     href: '/exam' },
  { icon: Camera,        label: 'Doubt',    href: '/doubt-solver' },
  { icon: Lightbulb,     label: 'Ideas',    href: '/business-ideas' },
  { icon: Settings,      label: 'Settings', href: '/settings' },
]

const founderItems = [
  { icon: MessageSquare, label: 'Chat',      href: '/chat' },
  { icon: CheckCircle,   label: 'Validate',  href: '/tools/business-validator' },
  { icon: Lightbulb,     label: 'Ideas',     href: '/business-ideas' },
  { icon: Settings,      label: 'Settings',  href: '/settings' },
]

export default function MobileBottomNav({ role }: { role?: UserRole }) {
  const pathname = usePathname()
  const items = role === 'founder' ? founderItems : studentItems

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex lg:hidden items-center justify-around bg-[#12121A] border-t border-white/10 px-2 py-2 h-16">
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full py-1"
          >
            <Icon className={`w-5 h-5 ${isActive ? 'opacity-100' : 'opacity-50'}`} />
            <span className={`text-[10px] ${isActive ? 'text-[#534AB7] font-medium' : 'text-gray-400'}`}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
