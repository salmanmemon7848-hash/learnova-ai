'use client'
import { useAuth } from '@/contexts/AuthContext'
import { useSubscription } from '@/hooks/useSubscription'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquare,
  GraduationCap,
  Lightbulb,
  Settings,
  LogOut,
  CreditCard,
  Menu,
  X,
  LayoutDashboard,
  Sparkles,
  Camera,
  Target,
  Navigation,
  Telescope,
  Users,
  CheckCircle,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import InstallButton from '@/components/InstallButton'
import InstallPrompt from '@/components/InstallPrompt'
import MobileBottomNav from './MobileBottomNav'
import type { UserRole } from '@/contexts/RoleContext'
// ─── Nav definitions ─────────────────────────────────────────────────────────
type DashboardNavItem = {
  icon: React.ElementType
  label: string
  href: string
  prominent: boolean
  pro?: boolean
  isNew?: boolean
}
const studentNav: DashboardNavItem[] = [
  { icon: LayoutDashboard, label: 'Home',          href: '/dashboard',      prominent: false },
  { icon: Camera,          label: 'Doubt Solver',  href: '/doubt-solver',   prominent: true  },
  { icon: MessageSquare,   label: 'AI Chat',       href: '/dashboard-chat', prominent: false },
  { icon: Target,          label: 'Practice Tests',href: '/exam',           prominent: false },
  { icon: GraduationCap,   label: 'EduFinder',     href: '/edufinder',      prominent: false },
  { icon: Users,           label: 'Mock Interview',href: '/interview',      prominent: false },
  { icon: Navigation,      label: 'Career Guide',  href: '/career',         prominent: false },
  { icon: CreditCard,      label: 'Pricing',       href: '/pricing',        prominent: false },
  { icon: Settings,        label: 'Settings',      href: '/settings',       prominent: false },
]
const founderNav: DashboardNavItem[] = [
  { icon: LayoutDashboard, label: 'Home',                href: '/dashboard',              prominent: false },
  { icon: MessageSquare,   label: 'AI Chat',             href: '/dashboard-chat',         prominent: false },
  { icon: Users,           label: 'Mock Interview',      href: '/interview',              prominent: false },
  { icon: CheckCircle,     label: 'Business Validator',  href: '/tools/business-validator', prominent: true  },
  { icon: Telescope,       label: 'Competitor Research', href: '/competitor-research',    prominent: false, isNew: true },
  { icon: Lightbulb,       label: 'Business Ideas',      href: '/business-ideas',         prominent: false },
  { icon: CreditCard,      label: 'Pricing',             href: '/pricing',                prominent: false },
  { icon: Settings,        label: 'Settings',            href: '/settings',               prominent: false },
]
// ─── Nav link ────────────────────────────────────────────────────────────────
function NavLink({
  icon: Icon,
  label,
  href,
  prominent,
  pro,
  isNew,
  isActive,
  onClick,
}: {
  icon: React.ElementType
  label: string
  href: string
  prominent: boolean
  pro?: boolean
  isNew?: boolean
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`dashboard-sidebar-nav-item flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all ${
        isActive 
          ? 'bg-[#1e1b4b]' 
          : 'bg-transparent hover:bg-[#1e2130]'
      }`}
      style={{
        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.7)'
      }}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium text-sm flex-1">{label}</span>
      {prominent && <Sparkles className="w-4 h-4 text-[#a78bfa]" />}
      {isNew && (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#7c3aed]" style={{ color: '#ede9fe' }}>
          New
        </span>
      )}
      {pro && !prominent && !isNew && (
        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#7c3aed]" style={{ color: '#ede9fe' }}>
          Pro
        </span>
      )}
    </Link>
  )
}
// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: UserRole }) {
  if (!role) return null
  return (
    <div
      className={`mx-3 mb-3 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium border ${
        role === 'founder' 
          ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]' 
          : 'bg-[#a78bfa]/10 border-[#a78bfa]/30 text-[#a78bfa]'
      }`}
    >
      {role === 'founder' ? '🚀' : '🎓'}
      <span className="capitalize">{role}</span>
    </div>
  )
}
// ─── Main layout ──────────────────────────────────────────────────────────────
interface DashboardLayoutProps {
  role: UserRole
  children: React.ReactNode
}
const badgeStyles: Record<string, React.CSSProperties> = {
  free: { background: 'rgba(55,65,81,0.4)', color: '#9CA3AF', border: '1px solid #374151' },
  starter: { background: 'rgba(55,65,81,0.4)', color: '#9CA3AF', border: '1px solid #374151' },
  pro: { background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.4)' },
  builder: { background: 'rgba(124,58,237,0.15)', color: '#A78BFA', border: '1px solid rgba(124,58,237,0.4)' },
  max: { background: 'rgba(217,119,6,0.15)', color: '#FCD34D', border: '1px solid rgba(217,119,6,0.4)' },
  founder_pro: { background: 'rgba(217,119,6,0.15)', color: '#FCD34D', border: '1px solid rgba(217,119,6,0.4)' },
}

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
    console.log('[Sidebar] Fixed: companion subtitle and mobile sign out layout are role-aware')
  }, [])
  return (
    <div className="dashboard-shell min-h-screen bg-background">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="mobile-menu-btn lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg border border-border bg-surface transition-colors"
        aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
      >
        {sidebarOpen
          ? <X className="w-5 h-5 text-foreground" />
          : <Menu className="w-5 h-5 text-foreground" />}
      </button>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="mobile-overlay fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      {/* Sidebar */}
      <aside
        className={`sidebar fixed top-0 left-0 h-full w-[260px] bg-[#13151e] border-r border-[#2a2d3a] transform transition-transform duration-200 z-50 ${
          sidebarOpen ? 'sidebar-open translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5 border-b border-[#2a2d3a]">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold" style={{ color: '#a78bfa' }}>
                Learnova
              </Link>
              <InstallButton />
            </div>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {role === 'founder' ? 'AI Business Companion' : 'AI Study Companion'}
            </p>
          </div>
          {/* Role badge */}
          <div className="pt-3">
            <RoleBadge role={role} />
          </div>
          {/* Navigation */}
          <nav className="sidebar-nav-list flex-1 px-3 py-2 overflow-y-auto">
            {navItems.map((item, index) => (
              <NavLink
                key={`nav-${item.href}-${index}`}
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
          {/* User Card & Logout */}
          <div className="sidebar-bottom-section p-4 border-t border-[#2a2d3a]">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm bg-gradient-to-br from-purple-primary to-purple-accent"
              >
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>{userName}</p>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide shrink-0"
                    style={badgeStyles[normalizedPlan] || badgeStyles.free}
                  >
                    {planLabel}
                  </span>
                </div>
                <p className="text-xs truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>{user?.email}</p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="sign-out-btn flex items-center gap-2 text-sm font-medium w-full px-3 py-2 rounded-lg transition-all hover:bg-[#1e1010] hover:text-[#f87171]"
              style={{ color: 'rgba(255,255,255,0.6)' }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
      {/* Main content */}
      <main
        className="main-content min-h-screen lg:ml-[260px] pb-16 lg:pb-0 overflow-x-hidden"
      >
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav role={role} />
      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  )
}
