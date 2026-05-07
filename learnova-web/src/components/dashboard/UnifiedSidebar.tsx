'use client'

import React, { memo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePersonaStore } from '@/lib/stores/personaStore'
import { useRouter, usePathname } from 'next/navigation'
import {
  Plus,
  Globe,
  BookOpen,
  Lightbulb,
  Home,
  HelpCircle,
  GraduationCap,
  Mic,
  TrendingUp,
  Telescope,
  Navigation,
  CreditCard,
  Settings,
  X,
} from 'lucide-react'
import { useState } from 'react'

interface Conversation {
  id: string
  title: string
  messages: any[]
  createdAt: number
}

interface SidebarProps {
  conversations: Conversation[]
  currentConvId: string | null
  language: 'english' | 'hindi'
  onNewChat: () => void
  onLoadConversation: (conv: Conversation) => void
  onLanguageChange: (lang: 'english' | 'hindi') => void
  showMobileSidebar: boolean
  onCloseMobileSidebar: () => void
}

type SidebarNavItem = {
  icon: React.ElementType
  label: string
  path: string
  pro?: boolean
  isNew?: boolean
}

function UnifiedSidebar({
  conversations,
  currentConvId,
  language,
  onNewChat,
  onLoadConversation,
  onLanguageChange,
  showMobileSidebar,
  onCloseMobileSidebar,
}: SidebarProps) {
  const { user } = useAuth()
  const { persona } = usePersonaStore()
  const router = useRouter()
  const pathname = usePathname()

  const tools: SidebarNavItem[] = [
    { icon: Globe, label: 'Chat', path: '/chat' },
    { icon: BookOpen, label: 'Exam Simulator', path: '/exam' },
    { icon: Lightbulb, label: 'Business Validator', path: '/tools/business-validator' },
  ]

  const navigateItems: SidebarNavItem[] = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: HelpCircle, label: 'Doubt Solver', path: '/doubt-solver' },
    { icon: GraduationCap, label: 'EduFinder', path: '/edufinder' },
    { icon: Mic, label: 'Mock Interview', path: '/interview' },
    { icon: TrendingUp, label: 'Business Ideas', path: '/business-ideas' },
    { icon: Telescope, label: 'Competitor Research', path: '/competitor-research', isNew: true },
    { icon: Navigation, label: 'Career Guide', path: '/career' },
  ]

  const accountItems = [
    { icon: CreditCard, label: 'Pricing', path: '/pricing' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]

  const isActive = (path: string) => pathname === path

  const navItemStyle = (path: string) => ({
    height: '38px',
    padding: '0 10px',
    background: isActive(path) ? '#1E1040' : 'transparent',
    border: isActive(path) ? '1px solid #2D1B69' : '1px solid transparent',
    color: isActive(path) ? '#F5F3FF' : '#C4B5FD',
  })

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <>
      {/* Mobile Overlay */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={onCloseMobileSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-200 ease-in-out lg:transform-none ${
          showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{
          background: '#0F0A1E',
          borderRight: '1px solid #2D1B69',
          padding: '16px 12px',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Close button (mobile only) */}
        <button
          className="lg:hidden absolute top-4 right-4"
          onClick={onCloseMobileSidebar}
        >
          <X size={20} color="#A78BFA" />
        </button>

        {/* Logo & Persona */}
        <div>
          <h1
            className="text-[18px] font-semibold"
            style={{
              background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Thinkior AI
          </h1>
          {persona && (
            <span
              className="inline-block text-[11px] mt-2 px-2.5 py-0.5 rounded-[20px]"
              style={{
                background: '#1E1B4B',
                color: '#A78BFA',
                border: '1px solid #4338CA',
              }}
            >
              {persona === 'student' ? '📚 Student' : '💼 Founder'}
            </span>
          )}
        </div>

        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="w-full mt-4 flex items-center justify-center gap-2 text-white text-[14px] font-medium rounded-[10px] transition-all hover:brightness-110"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
            height: '40px',
            boxShadow: '0 4px 16px #7C3AED35',
          }}
        >
          <Plus size={16} />
          New Chat
        </button>

        {/* TOOLS Section */}
        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-[1.5px] px-2 mb-1.5" style={{ color: '#9CA3AF' }}>
            TOOLS
          </p>
          {tools.map((tool, idx) => (
            <button
              key={idx}
              onClick={() => {
                router.push(tool.path)
                onCloseMobileSidebar()
              }}
              className="w-full flex items-center gap-2.5 rounded-lg transition-all mb-0.5"
              style={navItemStyle(tool.path)}
              onMouseEnter={(e) => {
                if (!isActive(tool.path)) e.currentTarget.style.background = '#160D2E'
              }}
              onMouseLeave={(e) => {
                if (!isActive(tool.path)) e.currentTarget.style.background = 'transparent'
              }}
            >
              <tool.icon size={16} color="#A78BFA" />
              <span className="text-[13px]">{tool.label}</span>
            </button>
          ))}
        </div>

        {/* NAVIGATE Section */}
        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-[1.5px] px-2 mb-1.5" style={{ color: '#9CA3AF' }}>
            NAVIGATE
          </p>
          {navigateItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                router.push(item.path)
                onCloseMobileSidebar()
              }}
              className="w-full flex items-center gap-2.5 rounded-lg transition-all mb-0.5"
              style={navItemStyle(item.path)}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) e.currentTarget.style.background = '#160D2E'
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) e.currentTarget.style.background = 'transparent'
              }}
            >
              <item.icon size={16} color="#A78BFA" />
              <span className="text-[13px] flex-1">{item.label}</span>
              {item.isNew && (
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-semibold"
                  style={{
                    background: '#7C3AED',
                    color: '#EDE9FE',
                  }}
                >
                  New
                </span>
              )}
              {item.pro && !item.isNew && (
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-semibold"
                  style={{
                    background: '#7C3AED',
                    color: '#EDE9FE',
                  }}
                >
                  Pro
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ACCOUNT Section */}
        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-[1.5px] px-2 mb-1.5" style={{ color: '#9CA3AF' }}>
            ACCOUNT
          </p>
          {accountItems.map((item, idx) => (
            <button
              key={idx}
              onClick={() => {
                router.push(item.path)
                onCloseMobileSidebar()
              }}
              className="w-full flex items-center gap-2.5 rounded-lg transition-all mb-0.5"
              style={navItemStyle(item.path)}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) e.currentTarget.style.background = '#160D2E'
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) e.currentTarget.style.background = 'transparent'
              }}
            >
              <item.icon size={16} color="#A78BFA" />
              <span className="text-[13px]">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Recent Chats */}
        <div className="mt-5 flex-1 overflow-y-auto">
          <p className="text-[11px] uppercase tracking-[1.5px] px-2 mb-1.5" style={{ color: '#9CA3AF' }}>
            RECENT
          </p>
          {conversations.length === 0 ? (
            <p className="text-[12px] px-2 py-1" style={{ color: '#9CA3AF' }}>No conversations yet</p>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => onLoadConversation(conv)}
                className="w-full text-left text-[13px] rounded-md transition-all mb-0.5 px-2.5 py-1.5 truncate"
                style={{
                  color: currentConvId === conv.id ? '#C4B5FD' : '#9CA3AF',
                  background: currentConvId === conv.id ? '#160D2E' : 'transparent',
                }}
                onMouseEnter={(e) => {
                  if (currentConvId !== conv.id) e.currentTarget.style.background = '#160D2E'
                }}
                onMouseLeave={(e) => {
                  if (currentConvId !== conv.id) e.currentTarget.style.background = 'transparent'
                }}
              >
                {conv.title}
              </button>
            ))
          )}
        </div>

        {/* Sidebar Bottom */}
        <div className="mt-auto pt-4">
          {/* Language Toggle */}
          <div
            className="inline-flex items-center rounded-[20px] mb-3"
            style={{
              background: '#160D2E',
              border: '1px solid #2D1B69',
              padding: '4px',
            }}
          >
            <button
              onClick={() => onLanguageChange('english')}
              className="px-3 py-1 rounded-[16px] text-[12px] cursor-pointer transition-all duration-150"
              style={{
                background: language === 'english' ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : 'transparent',
                color: language === 'english' ? 'white' : '#9CA3AF',
                fontWeight: language === 'english' ? 600 : 400,
                boxShadow: language === 'english' ? '0 2px 8px #7C3AED40' : 'none',
              }}
            >
              EN
            </button>
            <button
              onClick={() => onLanguageChange('hindi')}
              className="px-3 py-1 rounded-[16px] text-[12px] cursor-pointer transition-all duration-150"
              style={{
                background: language === 'hindi' ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : 'transparent',
                color: language === 'hindi' ? 'white' : '#9CA3AF',
                fontWeight: language === 'hindi' ? 600 : 400,
                boxShadow: language === 'hindi' ? '0 2px 8px #7C3AED40' : 'none',
              }}
            >
              हि
            </button>
          </div>

          {/* User Row */}
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: '#2D1B69', color: '#C4B5FD', fontSize: '13px', fontWeight: 600 }}
            >
              {userInitials}
            </div>
            <span className="text-[13px] flex-1 truncate" style={{ color: '#C4B5FD' }}>
              {userName}
            </span>
            <button
              onClick={() => router.push('/settings')}
              className="transition-colors hover:text-[#A78BFA]"
              style={{ color: '#9CA3AF' }}
            >
              <Settings size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}

// Wrap with memo to prevent unnecessary re-renders
export default memo(UnifiedSidebar);
