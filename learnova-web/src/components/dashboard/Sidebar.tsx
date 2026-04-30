'use client'

import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquare,
  GraduationCap,
  Lightbulb,
  PenTool,
  Calendar,
  Settings,
  LogOut,
  CreditCard,
  Menu,
  X,
  LayoutDashboard,
  Sparkles,
  Camera,
  Target,
  TrendingUp,
  BookOpen,
  Briefcase,
  Navigation,
  Users,
  FileText,
} from 'lucide-react'
import { useState } from 'react'
import InstallButton from '@/components/InstallButton'
import InstallPrompt from '@/components/InstallPrompt'
import MobileBottomNav from './MobileBottomNav'

const navItems = [
  { icon: LayoutDashboard, label: 'Home', href: '/dashboard', pro: false, prominent: false },
  { icon: Camera, label: 'Doubt Solver', href: '/doubt-solver', pro: false, prominent: true },
  { icon: MessageSquare, label: 'AI Chat', href: '/chat', pro: false, prominent: false },
  { icon: Target, label: 'Practice Tests', href: '/exam', pro: false, prominent: false },
  { icon: Calendar, label: 'Study Planner', href: '/planner', pro: false, prominent: false },
  { icon: GraduationCap, label: 'EduFinder', href: '/edufinder', pro: false, prominent: false },
  { icon: Users, label: 'Mock Interview', href: '/interview', pro: false, prominent: false },
  { icon: PenTool, label: 'AI Writer', href: '/writer', pro: true, prominent: false },
  { icon: Lightbulb, label: 'Business Validator', href: '/validate', pro: false, prominent: false },
  { icon: FileText, label: 'Pitch Deck', href: '/pitch-deck', pro: false, prominent: false },
  { icon: Navigation, label: 'Career Guide', href: '/career', pro: false, prominent: false },
  { icon: Briefcase, label: 'Business Ideas', href: '/business-ideas', pro: false, prominent: false },
  { icon: CreditCard, label: 'Pricing', href: '/pricing', pro: false, prominent: false },
  { icon: Settings, label: 'Settings', href: '/settings', pro: false, prominent: false },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg border transition-colors"
        style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
      >
        {sidebarOpen ? <X className="w-5 h-5" style={{ color: 'var(--foreground)' }} /> : <Menu className="w-5 h-5" style={{ color: 'var(--foreground)' }} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-[260px] transform transition-transform duration-200 z-40 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
        style={{ 
          backgroundColor: '#13151e',
          borderRight: '0.5px solid #2a2d3a'
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-5" style={{ borderBottom: '0.5px solid #2a2d3a' }}>
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold" style={{ color: '#a78bfa' }}>
                Learnova
              </Link>
              <InstallButton />
            </div>
            <p className="text-xs mt-1" style={{ color: '#a78bfa' }}>AI Study Companion</p>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            {navItems.map((item, index) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              // Prominent item (Doubt Solver)
              if (item.prominent) {
                return (
                  <Link
                    key={`nav-${item.href}-${index}`}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all"
                    style={{
                      backgroundColor: isActive ? '#1e1b4b' : 'transparent',
                      color: isActive ? '#a78bfa' : '#c4b5fd',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = '#1e2130'
                        e.currentTarget.style.color = '#e2e8f0'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = '#c4b5fd'
                      }
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium text-sm flex-1">{item.label}</span>
                    <Sparkles className="w-4 h-4" style={{ color: '#a78bfa' }} />
                  </Link>
                )
              }
              
              return (
                <Link
                  key={`nav-${item.href}-${index}`}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 transition-all"
                  style={{
                    backgroundColor: isActive ? '#1e1b4b' : 'transparent',
                    color: isActive ? '#a78bfa' : '#c4b5fd',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = '#1e2130'
                      e.currentTarget.style.color = '#e2e8f0'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.color = '#c4b5fd'
                    }
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium text-sm flex-1">{item.label}</span>
                  {item.pro && (
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-semibold"
                      style={{
                        backgroundColor: '#7c3aed',
                        color: '#ede9fe',
                      }}
                    >
                      Pro
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Card & Logout */}
          <div className="p-4" style={{ borderTop: '0.5px solid #2a2d3a' }}>
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                style={{ background: 'var(--gradient-primary)' }}
              >
                {userInitial}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: '#e2e8f0' }}>
                  {userName}
                </p>
                <p className="text-xs truncate" style={{ color: '#a78bfa' }}>
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              className="flex items-center gap-2 text-sm font-medium w-full px-3 py-2 rounded-lg transition-all"
              style={{ 
                color: '#9ca3af',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#1e1010'
                e.currentTarget.style.color = '#f87171'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.color = '#9ca3af'
              }}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-[260px] min-h-screen pb-16 lg:pb-0">
        <div className="p-4 sm:p-6 lg:p-8 pt-16 lg:pt-8">{children}</div>
      </main>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* PWA Install Prompt */}
      <InstallPrompt />
    </div>
  )
}
