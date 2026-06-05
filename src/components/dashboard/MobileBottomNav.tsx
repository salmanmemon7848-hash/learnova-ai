'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Settings, Camera,
  CheckCircle, Target, Telescope,
} from 'lucide-react'
import type { UserRole } from '@/contexts/RoleContext'

const studentItems = [
  { icon: LayoutDashboard, label: 'Home',    href: '/dashboard' },
  { icon: Camera,          label: 'Doubt',   href: '/doubt-solver' },
  { icon: Target,          label: 'Exam',    href: '/exam' },
  { icon: Settings,        label: 'Settings',href: '/settings' },
]

const founderItems = [
  { icon: LayoutDashboard, label: 'Home',      href: '/dashboard' },
  { icon: CheckCircle,     label: 'Validate',  href: '/tools/business-validator' },
  { icon: Telescope,       label: 'Research',  href: '/competitor-research' },
  { icon: Settings,        label: 'Settings',  href: '/settings' },
]

export default function MobileBottomNav({ role }: { role?: UserRole }) {
  const pathname = usePathname()
  const items = role === 'founder' ? founderItems : studentItems

  return (
    <nav
      className="flex lg:hidden items-center"
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 300,
        background: 'rgba(13, 9, 32, 0.85)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        height: 68,
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {items.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href

        return (
          <Link
            key={item.href}
            href={item.href}
            style={{
              flex: 1, height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 4,
              textDecoration: 'none', position: 'relative',
              transition: 'opacity 0.15s',
            }}
          >
            {isActive && (
              <span style={{
                position: 'absolute', top: 8,
                width: 28, height: 28, borderRadius: 9,
                background: 'rgba(13,148,136,0.15)',
                border: '1px solid rgba(13,148,136,0.3)',
              }} />
            )}
            <Icon
              style={{
                width: 20, height: 20,
                color: isActive ? '#2DD4BF' : 'rgba(255,255,255,0.4)',
                position: 'relative', zIndex: 1,
                transition: 'color 0.15s',
              }}
            />
            <span style={{
              fontSize: 10, fontWeight: isActive ? 600 : 400,
              color: isActive ? '#2DD4BF' : 'rgba(255,255,255,0.4)',
              transition: 'color 0.15s',
            }}>
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
