'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquare, GraduationCap, Lightbulb, Settings, LogOut,
  CreditCard, X, LayoutDashboard, Sparkles, Camera, Target,
  Navigation, Telescope, Users, CheckCircle, Menu,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import InstallButton from '@/components/InstallButton'
import InstallPrompt from '@/components/InstallPrompt'
import MobileBottomNav from './MobileBottomNav'
import type { UserRole } from '@/contexts/RoleContext'

type DashboardNavItem = {
  icon: React.ElementType
  label: string
  href: string
  prominent: boolean
  pro?: boolean
  isNew?: boolean
}

const studentNav: DashboardNavItem[] = [
  { icon: LayoutDashboard, label: 'Home',           href: '/dashboard',      prominent: false },
  { icon: Camera,          label: 'Doubt Solver',   href: '/doubt-solver',   prominent: true  },
  { icon: MessageSquare,   label: 'AI Chat',        href: '/dashboard-chat', prominent: false },
  { icon: Target,          label: 'Practice Tests', href: '/exam',           prominent: false },
  { icon: GraduationCap,   label: 'EduFinder',      href: '/edufinder',      prominent: false },
  { icon: Users,           label: 'Mock Interview', href: '/interview',      prominent: false },
  { icon: Navigation,      label: 'Career Guide',   href: '/career',         prominent: false },
  { icon: CreditCard,      label: 'Pricing',        href: '/pricing',        prominent: false },
  { icon: Settings,        label: 'Settings',       href: '/settings',       prominent: false },
]

const founderNav: DashboardNavItem[] = [
  { icon: LayoutDashboard, label: 'Home',               href: '/dashboard',                prominent: false },
  { icon: MessageSquare,   label: 'AI Chat',            href: '/dashboard-chat',           prominent: false },
  { icon: Users,           label: 'Mock Interview',     href: '/interview',                prominent: false },
  { icon: CheckCircle,     label: 'Business Validator', href: '/tools/business-validator', prominent: true  },
  { icon: Telescope,       label: 'Competitor Research',href: '/competitor-research',       prominent: false, isNew: true },
  { icon: Lightbulb,       label: 'Business Ideas',     href: '/business-ideas',           prominent: false },
  { icon: CreditCard,      label: 'Pricing',            href: '/pricing',                  prominent: false },
  { icon: Settings,        label: 'Settings',           href: '/settings',                 prominent: false },
]

function NavLink({
  icon: Icon, label, href, prominent, pro, isNew, isActive, onClick,
}: {
  icon: React.ElementType; label: string; href: string; prominent: boolean
  pro?: boolean; isNew?: boolean; isActive: boolean; onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
        borderRadius: 10, marginBottom: 2, textDecoration: 'none',
        transition: 'all 0.15s ease',
        background: isActive
          ? 'linear-gradient(135deg, rgba(13,148,136,0.18) 0%, rgba(124,58,237,0.12) 100%)'
          : 'transparent',
        border: isActive ? '1px solid rgba(13,148,136,0.3)' : '1px solid transparent',
        color: isActive ? '#F5F3FF' : 'rgba(255,255,255,0.6)',
        boxShadow: isActive ? '0 0 12px rgba(13,148,136,0.15)' : 'none',
      }}
      onMouseEnter={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
          e.currentTarget.style.color = 'rgba(255,255,255,0.9)';
          e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        }
      }}
      onMouseLeave={e => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent';
          e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
          e.currentTarget.style.borderColor = 'transparent';
        }
      }}
    >
      <Icon style={{ width: 17, height: 17, flexShrink: 0, color: isActive ? '#2DD4BF' : 'inherit' }} />
      <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400, flex: 1 }}>{label}</span>
      {prominent && !isNew && <Sparkles style={{ width: 13, height: 13, color: '#A78BFA' }} />}
      {isNew && (
        <span style={{ padding: '2px 7px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: 'rgba(13,148,136,0.2)', color: '#2DD4BF', border: '1px solid rgba(13,148,136,0.3)' }}>
          New
        </span>
      )}
      {pro && !prominent && !isNew && (
        <span style={{ padding: '2px 7px', borderRadius: 999, fontSize: 10, fontWeight: 700, background: 'rgba(124,58,237,0.2)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.3)' }}>
          Pro
        </span>
      )}
    </Link>
  )
}

function RoleBadge({ role }: { role: UserRole }) {
  if (!role) return null
  const isFounder = role === 'founder'
  return (
    <div style={{
      margin: '0 10px 8px',
      padding: '7px 12px',
      borderRadius: 8,
      display: 'flex', alignItems: 'center', gap: 6,
      fontSize: 11, fontWeight: 600,
      background: isFounder ? 'rgba(251,191,36,0.08)' : 'rgba(124,58,237,0.1)',
      border: isFounder ? '1px solid rgba(251,191,36,0.25)' : '1px solid rgba(124,58,237,0.25)',
      color: isFounder ? '#FBBF24' : '#A78BFA',
    }}>
      <span>{isFounder ? '🚀' : '🎓'}</span>
      <span style={{ textTransform: 'capitalize' }}>{role}</span>
    </div>
  )
}

const planBadgeStyle: Record<string, React.CSSProperties> = {
  free:        { background: 'rgba(75,85,99,0.3)',   color: '#9CA3AF', border: '1px solid rgba(75,85,99,0.4)' },
  starter:     { background: 'rgba(75,85,99,0.3)',   color: '#9CA3AF', border: '1px solid rgba(75,85,99,0.4)' },
  pro:         { background: 'rgba(124,58,237,0.15)',color: '#A78BFA', border: '1px solid rgba(124,58,237,0.35)' },
  builder:     { background: 'rgba(124,58,237,0.15)',color: '#A78BFA', border: '1px solid rgba(124,58,237,0.35)' },
  max:         { background: 'rgba(13,148,136,0.15)',color: '#2DD4BF', border: '1px solid rgba(13,148,136,0.35)' },
  founder_pro: { background: 'rgba(251,191,36,0.12)',color: '#FBBF24', border: '1px solid rgba(251,191,36,0.3)' },
}

interface DashboardLayoutProps { role: UserRole; children: React.ReactNode }

export default function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const { user, signOut } = useAuth()
  const { plan } = useSubscription()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const userInitial = userName.charAt(0).toUpperCase()
  const navItems = role === 'founder' ? founderNav : studentNav
  const normalizedPlan = (plan || 'free').toLowerCase().replace(' ', '_')
  const planLabel = (plan || 'Free').split('_').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [sidebarOpen])

  return (
    <div style={{ minHeight: '100vh', background: '#060210' }}>

      {/* ── Mobile menu button ─────────────────────────────────────────────── */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
        className="flex lg:hidden items-center justify-center"
        style={{
          position: 'fixed', top: 14, left: 14, zIndex: 200,
          width: 40, height: 40,
          background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 10, cursor: 'pointer', color: '#A78BFA',
        }}
      >
        {sidebarOpen ? <X style={{ width: 18, height: 18 }} /> : <Menu style={{ width: 18, height: 18 }} />}
      </button>

      {/* ── Mobile overlay ─────────────────────────────────────────────────── */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 150,
            background: 'rgba(6,2,16,0.7)', backdropFilter: 'blur(4px)',
          }}
          className="lg:hidden"
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────────────── */}
      <aside
        style={{
          position: 'fixed', top: 0, left: 0, height: '100%', width: 252,
          background: 'rgba(13, 9, 32, 0.85)', backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', flexDirection: 'column', zIndex: 160,
          transition: 'transform 0.25s ease',
        }}
        className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
      >
        {/* Logo */}
        <div style={{ padding: '18px 14px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'linear-gradient(135deg, #7C3AED, #0D9488)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: '#fff',
              }}>L</div>
              <span style={{
                fontSize: 16, fontWeight: 700,
                background: 'linear-gradient(135deg, #A78BFA, #2DD4BF)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
              }}>Learnova AI</span>
            </Link>
            <InstallButton />
          </div>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 6, paddingLeft: 38 }}>
            {role === 'founder' ? 'AI Business Companion' : 'AI Study Companion'}
          </p>
        </div>

        {/* Role badge */}
        <div style={{ paddingTop: 12 }}>
          <RoleBadge role={role} />
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '4px 10px', overflowY: 'auto' }}>
          {navItems.map((item, i) => (
            <NavLink
              key={`nav-${item.href}-${i}`}
              icon={item.icon}
              label={item.label}
              href={item.href}
              prominent={item.prominent}
              pro={item.pro}
              isNew={item.isNew}
              isActive={pathname === item.href}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* User card */}
        <div style={{ padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, flexShrink: 0,
              background: 'linear-gradient(135deg, #7C3AED, #0D9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, color: '#fff',
            }}>
              {userInitial}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#F5F3FF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userName}</span>
                <span style={{
                  fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
                  textTransform: 'uppercase', letterSpacing: 0.5, flexShrink: 0,
                  ...(planBadgeStyle[normalizedPlan] || planBadgeStyle.free),
                }}>
                  {planLabel}
                </span>
              </div>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                {user?.email}
              </span>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            style={{
              display: 'flex', alignItems: 'center', gap: 8, width: '100%',
              padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
              background: 'transparent', border: '1px solid transparent',
              fontSize: 13, color: 'rgba(255,255,255,0.45)',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
              e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)';
              e.currentTarget.style.color = '#F87171';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'transparent';
              e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
            }}
          >
            <LogOut style={{ width: 15, height: 15 }} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main content ───────────────────────────────────────────────────── */}
      <main className="lg:ml-[252px] lg:pb-0" style={{ minHeight: '100vh', paddingBottom: 72 }}>
        <div className="p-4 pt-16 sm:p-6 lg:p-8 lg:pt-8">
          {children}
        </div>
      </main>

      {/* ── Mobile Bottom Navigation ───────────────────────────────────────── */}
      <MobileBottomNav role={role} />

      {/* ── PWA Install Prompt ─────────────────────────────────────────────── */}
      <InstallPrompt />
    </div>
  )
}
