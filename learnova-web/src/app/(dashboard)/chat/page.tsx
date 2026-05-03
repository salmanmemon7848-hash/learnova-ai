'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { usePersonaStore } from '@/lib/stores/personaStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Plus,
  Globe,
  BookOpen,
  Lightbulb,
  Calendar,
  Copy,
  Check,
  Send,
  Menu,
  X,
  Settings,
  Home,
  HelpCircle,
  BarChart3,
  Mic,
  PenTool,
  TrendingUp,
  FileText,
  Navigation,
  CreditCard,
} from 'lucide-react'
import { usePathname } from 'next/navigation'
import { updateStreak, loadStreak, getMilestoneMessage, getStreakWhatsAppLink, StreakData } from '@/lib/utils/streak'
import { validateInput, buildRateLimitMessage } from '@/lib/rateLimitClient'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
}

// Memoized message component to prevent unnecessary re-renders
const MessageBubble = React.memo(({ message, onCopy, isCopied }: { 
  message: Message; 
  onCopy: (text: string, id: string) => void;
  isCopied: boolean;
}) => {
  return (
    <div
      key={message.id}
      className={`max-w-[85%] ${message.role === 'user' ? 'self-end' : 'self-start'}`}
    >
      {message.role === 'user' ? (
        <div
          className="text-white text-[14px] leading-relaxed"
          style={{
            background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
            borderRadius: '16px 16px 4px 16px',
            padding: '12px 16px',
            boxShadow: '0 4px 16px #7C3AED30',
          }}
        >
          {message.content}
        </div>
      ) : (
        <div
          className="text-[14px] leading-relaxed"
          style={{
            background: '#160D2E',
            border: '1px solid #2D1B69',
            borderLeft: '2px solid #7C3AED',
            borderRadius: '4px 16px 16px 16px',
            padding: '14px 16px',
            boxShadow: '0 0 20px #7C3AED10',
          }}
        >
          {/* AI Header */}
          <div className="flex items-center justify-between mb-2">
            <span
              className="text-[11px] px-2 py-0.5 rounded-[20px]"
              style={{
                background: '#1E1B4B',
                color: '#A78BFA',
                border: '1px solid #4338CA',
              }}
            >
              Learnova
            </span>
            <button
              onClick={() => onCopy(message.content, message.id)}
              className="transition-colors hover:text-[#A78BFA]"
              style={{ color: isCopied ? '#A78BFA' : '#9CA3AF' }}
            >
              {isCopied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>

          {/* Markdown Content */}
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ children }) => <h1 className="text-[#F5F3FF] font-semibold text-xl mb-2">{children}</h1>,
                h2: ({ children }) => <h2 className="text-[#F5F3FF] font-semibold text-lg mb-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-[#F5F3FF] font-semibold text-base mb-2">{children}</h3>,
                p: ({ children }) => <p className="text-[#F5F3FF] leading-relaxed mb-2">{children}</p>,
                ul: ({ children }) => <ul className="list-disc pl-5 mb-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-5 mb-2">{children}</ol>,
                li: ({ children }) => <li className="text-[#C4B5FD] pl-1">{children}</li>,
                strong: ({ children }) => <strong className="text-[#F5F3FF] font-semibold">{children}</strong>,
                code: ({ children, className }: any) => {
                  const isInline = !className
                  return isInline ? (
                    <code
                      className="text-[12px] px-1.5 py-0.5 rounded"
                      style={{
                        background: '#0F0A1E',
                        color: '#A78BFA',
                        border: '1px solid #2D1B69',
                      }}
                    >
                      {children}
                    </code>
                  ) : (
                    <pre
                      className="text-[13px] p-3.5 rounded-lg overflow-x-auto mb-2"
                      style={{
                        background: '#0F0A1E',
                        border: '1px solid #2D1B69',
                      }}
                    >
                      <code>{children}</code>
                    </pre>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
});

MessageBubble.displayName = 'MessageBubble';

interface Conversation {
  id: string
  title: string
  messages: Message[]
  createdAt: number
}

function ChatContent() {
  const { user } = useAuth()
  const { persona } = usePersonaStore()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConvId, setCurrentConvId] = useState<string | null>(null)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [language, setLanguage] = useState<'english' | 'hindi'>('english')
  const [streak, setStreak] = useState<StreakData>({ currentStreak: 0, longestStreak: 0, lastActiveDate: '', milestonesShown: [] })
  const [milestone, setMilestone] = useState<number | null>(null)
  const [limitWarning, setLimitWarning] = useState('')
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('learnova_language')
    if (savedLanguage === 'hindi' || savedLanguage === 'english') {
      setLanguage(savedLanguage)
    }

    const savedStreak = loadStreak()
    setStreak(savedStreak)

    const savedConvs = localStorage.getItem('learnova_conversations')
    if (savedConvs) {
      setConversations(JSON.parse(savedConvs))
    }
  }, [])

  // Redirect to persona selection if not set
  useEffect(() => {
    if (!persona) {
      router.push('/persona')
    }
  }, [persona, router])

  // Auto-send prompt from URL query param
  useEffect(() => {
    const prompt = searchParams.get('prompt')
    if (prompt && messages.length === 0 && persona) {
      setTimeout(() => {
        handleSendMessage(prompt)
      }, 500)
    }
  }, [searchParams, persona, messages.length])

  // Save conversations to localStorage
  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('learnova_conversations', JSON.stringify(conversations))
    }
  }, [conversations])

  // Auto-scroll to bottom - optimized to prevent excessive scrolling
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use instant scroll for loading state, smooth for new messages
      const behavior = loading ? 'instant' : 'smooth';
      messagesEndRef.current.scrollIntoView({ behavior });
    }
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px'
    }
  }, [input])

  const getSystemPrompt = () => {
    let prompt = ''
    
    if (persona === 'student') {
      prompt = "You are Learnova, an AI tutor built specifically for Indian students. You explain concepts in simple English using Indian curriculum (CBSE, NCERT, JEE, NEET). Show step-by-step solutions. Use Indian examples and context. Be encouraging and patient."
    } else if (persona === 'founder') {
      prompt = "You are Learnova, an AI business advisor for Indian entrepreneurs. You understand Indian market conditions, GST, MSME policies, UPI, Tier 2/3 city challenges. Give practical, honest, actionable advice in Indian context."
    }

    if (language === 'hindi') {
      prompt += "\n\nIMPORTANT: Always respond in Hindi (Devanagari script). Use simple, conversational Hindi that a Class 10-12 student from a small Indian city can understand. Hinglish is acceptable for technical terms. For example: 'Momentum' ka matlab hai 'किसी वस्तु की गति और द्रव्यमान का गुणनफल'."
    }

    return prompt
  }

  const getQuickPrompts = () => {
    if (language === 'hindi') {
      // Hindi mode prompts
      if (persona === 'student') {
        return [
          "JEE के लिए Newton's Laws समझाओ",
          "मेरे exams के लिए study plan बनाओ",
          "Physics के 10 MCQ दो",
          "NEET Biology के important topics बताओ",
        ]
      } else if (persona === 'founder') {
        return [
          "मेरा business idea validate करो",
          "India में पहले 100 customers कैसे पाएं?",
          "Startup kaise register kare India mein?",
          "Mera pitch deck banane mein help karo",
        ]
      }
    } else {
      // English mode prompts
      if (persona === 'student') {
        return [
          "Explain Newton's Laws for JEE",
          "Solve this maths problem step by step",
          "Make a study plan for my exams",
          "What will come in my next test?",
        ]
      } else if (persona === 'founder') {
        return [
          "Validate my business idea",
          "How do I get my first 100 customers in India?",
          "Help me write a pitch for investors",
          "Create a business plan outline",
        ]
      }
    }
    return []
  }

  const handleSendMessage = async (text?: string) => {
    const messageText = text || input.trim()
    if (!messageText || loading) return
    const inputError = validateInput(messageText, 'chat')
    if (inputError) {
      setMessages((prev) => [...prev, { role: 'assistant', content: inputError, id: Date.now().toString() }])
      return
    }

    const userMessage: Message = {
      role: 'user',
      content: messageText,
      id: Date.now().toString(),
    }

    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Create or update conversation
    let convId = currentConvId
    if (!convId) {
      convId = Date.now().toString()
      setCurrentConvId(convId)
      const newConv: Conversation = {
        id: convId,
        title: messageText.slice(0, 50) + (messageText.length > 50 ? '...' : ''),
        messages: newMessages,
        createdAt: Date.now(),
      }
      setConversations(prev => [newConv, ...prev])
    } else {
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, messages: newMessages } : c)
      )
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          persona,
          language,
          systemPrompt: getSystemPrompt(),
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 429 || error?.error === 'rate_limit_exceeded') {
          throw new Error(buildRateLimitMessage(error))
        }
        throw new Error(error.error || 'Failed to send message')
      }
      const warning = response.headers.get('X-RateLimit-Warning')
      if (warning) setLimitWarning(warning)

      const data = await response.json()
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        id: (Date.now() + 1).toString(),
      }

      const updatedMessages = [...newMessages, assistantMessage]
      setMessages(updatedMessages)

      // Update conversation
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, messages: updatedMessages } : c)
      )

      // Update streak
      const { streak: newStreak, newMilestone } = updateStreak()
      setStreak(newStreak)
      
      if (newMilestone) {
        setMilestone(newMilestone)
      }
    } catch (error: any) {
      console.error('Chat error:', error)
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}`,
        id: (Date.now() + 1).toString(),
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setLoading(false)
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setCurrentConvId(null)
    setInput('')
  }

  const handleLoadConversation = (conv: Conversation) => {
    setMessages(conv.messages)
    setCurrentConvId(conv.id)
    setShowMobileSidebar(false)
  }

  const handleCopyMessage = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const toggleLanguage = () => {
    const newLang = language === 'english' ? 'hindi' : 'english'
    setLanguage(newLang)
    localStorage.setItem('learnova_language', newLang)
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'User'
  const userInitials = userName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)

  const quickPrompts = getQuickPrompts()

  const tools = [
    { icon: Globe, label: 'Chat', path: '/chat' },
    { icon: BookOpen, label: 'Exam Simulator', path: '/exam' },
    { icon: Lightbulb, label: 'Business Validator', path: '/tools/business-validator' },
    { icon: Calendar, label: 'Study Planner', path: '/planner' },
  ]

  const navigateItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: HelpCircle, label: 'Doubt Solver', path: '/doubt-solver' },
    { icon: BarChart3, label: 'My Progress', path: '/progress' },
    { icon: Mic, label: 'Mock Interview', path: '/interview' },
    { icon: PenTool, label: 'AI Writer', path: '/writer', pro: true },
    { icon: TrendingUp, label: 'Business Ideas', path: '/business-ideas' },
    { icon: FileText, label: 'Pitch Deck', path: '/pitch-deck' },
    { icon: Navigation, label: 'Career Guide', path: '/career' },
  ]

  const accountItems = [
    { icon: CreditCard, label: 'Pricing', path: '/pricing' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ]

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#080412' }}>
      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Chat Header */}
        <header
          className="flex items-center justify-between flex-shrink-0"
          style={{
            height: '56px',
            borderBottom: '1px solid #2D1B69',
            padding: '0 20px',
          }}
        >
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setShowMobileSidebar(true)}
            >
              <Menu size={20} color="#A78BFA" />
            </button>
            <h2 className="text-[15px] font-medium" style={{ color: '#F5F3FF' }}>
              {messages.length === 0 ? 'New Conversation' : 'Chat'}
            </h2>
            {/* Hindi Mode Badge */}
            {language === 'hindi' && (
              <span
                className="text-[11px] px-2 py-0.5 rounded-[20px]"
                style={{
                  background: '#1E1B4B',
                  color: '#A78BFA',
                  border: '1px solid #4338CA',
                }}
              >
                हिंदी
              </span>
            )}
          </div>

          {/* Streak Badge - Student Persona Only */}
          {persona === 'student' && streak.currentStreak > 0 && (
            <div
              className="relative group inline-flex items-center gap-1.5 rounded-[20px] px-3 py-1 cursor-pointer"
              style={{
                background: '#1E1B4B',
                border: '1px solid #92400E',
              }}
            >
              {/* CSS Flame Icon */}
              <div
                style={{
                  width: '12px',
                  height: '16px',
                  clipPath: 'polygon(50% 0%, 80% 30%, 100% 60%, 70% 100%, 30% 100%, 0% 60%, 20% 30%)',
                  background: streak.currentStreak >= 30
                    ? 'linear-gradient(180deg, #A78BFA, #7C3AED)'
                    : streak.currentStreak >= 7
                    ? 'linear-gradient(180deg, #F59E0B, #EF4444)'
                    : '#F59E0B',
                }}
              />
              {/* Streak Text */}
              <span
                className="text-[12px] font-semibold"
                style={{
                  color: streak.currentStreak >= 30
                    ? '#A78BFA'
                    : streak.currentStreak >= 7
                    ? '#FB923C'
                    : '#F59E0B',
                }}
              >
                {streak.currentStreak} day streak
              </span>
              
              {/* Tooltip */}
              <div
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50"
                style={{
                  background: '#0F0A1E',
                  color: '#C4B5FD',
                  border: '1px solid #2D1B69',
                  borderRadius: '8px',
                  padding: '4px 10px',
                  fontSize: '12px',
                }}
              >
                Longest streak: {streak.longestStreak} days
              </div>
            </div>
          )}
        </header>

        {/* Messages Area */}
        <div
          className="flex-1 overflow-y-auto"
          style={{
            background: '#080412',
            backgroundImage: 'radial-gradient(ellipse 700px 300px at 50% 0%, #7C3AED0D, transparent)',
            padding: '24px 20px',
          }}
        >
          <div className="max-w-[720px] mx-auto flex flex-col gap-4">
            {messages.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <h3
                  className="text-[22px] font-semibold text-center mb-8"
                  style={{
                    background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  Hello, what would you like to learn today?
                </h3>

                {/* Quick Prompts */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-[13px] px-3.5 py-1.5 rounded-[20px] cursor-pointer transition-all"
                      style={{
                        background: '#160D2E',
                        border: '1px solid #2D1B69',
                        color: '#C4B5FD',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#7C3AED'
                        e.currentTarget.style.color = '#F5F3FF'
                        e.currentTarget.style.background = '#1E1040'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#2D1B69'
                        e.currentTarget.style.color = '#C4B5FD'
                        e.currentTarget.style.background = '#160D2E'
                      }}
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={handleCopyMessage}
                isCopied={copiedId === message.id}
              />
            ))}

            {/* Loading Indicator */}
            {loading && (
              <div
                className="self-start max-w-[85%]"
                style={{
                  background: '#160D2E',
                  border: '1px solid #2D1B69',
                  borderLeft: '2px solid #7C3AED',
                  borderRadius: '4px 16px 16px 16px',
                  padding: '14px 16px',
                  boxShadow: '0 0 20px #7C3AED10',
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: '#7C3AED',
                        animation: 'pulse 1.4s ease-in-out 0s infinite',
                      }}
                    />
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: '#7C3AED',
                        animation: 'pulse 1.4s ease-in-out 0.2s infinite',
                      }}
                    />
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        background: '#7C3AED',
                        animation: 'pulse 1.4s ease-in-out 0.4s infinite',
                      }}
                    />
                  </div>
                  <span className="text-[13px]" style={{ color: '#9CA3AF' }}>
                    Learnova is thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div
          className="flex-shrink-0 border-t"
          style={{
            borderTop: '1px solid #2D1B69',
            padding: '16px 20px',
            background: '#080412',
          }}
        >
          <div className="max-w-[720px] mx-auto">
            {limitWarning && (
              <div style={{ marginBottom: 10, background: '#451a03', border: '1px solid #92400e', color: '#fbbf24', borderRadius: 10, padding: '8px 12px', fontSize: 12 }}>
                {limitWarning}
              </div>
            )}
            {/* Milestone Toast Banner */}
            {milestone && (
              <div
                className="flex items-center gap-3 rounded-[10px] mb-2.5"
                style={{
                  background: 'linear-gradient(135deg, #1E1040, #160D2E)',
                  border: '1px solid #4338CA',
                  padding: '12px 16px',
                }}
              >
                {/* Flame Icon */}
                <div
                  style={{
                    width: '16px',
                    height: '20px',
                    clipPath: 'polygon(50% 0%, 80% 30%, 100% 60%, 70% 100%, 30% 100%, 0% 60%, 20% 30%)',
                    background: milestone >= 30
                      ? 'linear-gradient(180deg, #A78BFA, #7C3AED)'
                      : milestone >= 7
                      ? 'linear-gradient(180deg, #F59E0B, #EF4444)'
                      : '#F59E0B',
                    flexShrink: 0,
                  }}
                />
                
                {/* Milestone Text */}
                <span className="flex-1 text-[13px] font-medium" style={{ color: '#F5F3FF' }}>
                  {getMilestoneMessage(milestone)}
                </span>
                
                {/* WhatsApp Share Button */}
                <button
                  onClick={() => {
                    const link = getStreakWhatsAppLink(milestone)
                    window.open(link, '_blank')
                  }}
                  className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium cursor-pointer transition-all duration-150"
                  style={{
                    background: '#075E54',
                    color: 'white',
                    border: 'none',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#128C7E'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#075E54'}
                >
                  Share on WhatsApp
                </button>
                
                {/* Close Button */}
                <button
                  onClick={() => setMilestone(null)}
                  className="p-1 cursor-pointer transition-colors"
                  style={{ color: '#9CA3AF' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = '#A78BFA'}
                  onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
                >
                  <X size={16} />
                </button>
              </div>
            )}
            {/* Prompt Chips (only when empty) */}
            {messages.length === 0 && quickPrompts.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2.5">
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-[13px] px-3.5 py-1.5 rounded-[20px] cursor-pointer transition-all"
                    style={{
                      background: '#160D2E',
                      border: '1px solid #2D1B69',
                      color: '#C4B5FD',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#7C3AED'
                      e.currentTarget.style.color = '#F5F3FF'
                      e.currentTarget.style.background = '#1E1040'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#2D1B69'
                      e.currentTarget.style.color = '#C4B5FD'
                      e.currentTarget.style.background = '#160D2E'
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input Container */}
            <div
              className="flex items-end gap-2.5 rounded-[14px] p-3 transition-all"
              style={{
                background: '#160D2E',
                border: '1px solid #2D1B69',
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#7C3AED'
                e.currentTarget.style.boxShadow = '0 0 0 3px #7C3AED20'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#2D1B69'
                e.currentTarget.style.boxShadow = 'none'
              }}
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder={language === 'hindi' ? 'Learnova से कुछ भी पूछें...' : 'Ask Learnova anything...'}
                className="flex-1 text-[14px] leading-relaxed bg-transparent border-none outline-none resize-none"
                style={{
                  color: '#F5F3FF',
                  minHeight: '24px',
                  maxHeight: '120px',
                }}
                rows={1}
              />
              <button
                onClick={() => handleSendMessage()}
                disabled={!input.trim() || loading}
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-50"
                style={{
                  background: input.trim() && !loading ? 'linear-gradient(135deg, #7C3AED, #4F46E5)' : '#2D1B69',
                  boxShadow: input.trim() && !loading ? '0 4px 12px #7C3AED40' : 'none',
                }}
              >
                <Send size={16} color="white" />
              </button>
            </div>

            {/* Share on WhatsApp */}
            {messages.length > 0 && (
              <button
                className="text-[12px] mt-2 ml-auto block transition-colors hover:text-[#25D366]"
                style={{ color: '#9CA3AF', background: 'transparent', border: 'none', cursor: 'pointer' }}
                onMouseLeave={(e) => e.currentTarget.style.color = '#9CA3AF'}
              >
                Share this conversation →
              </button>
            )}
          </div>
        </div>

        {/* Pulse Animation */}
        <style>{`
          @keyframes pulse {
            0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
            40% { opacity: 1; transform: scale(1); }
          }
        `}</style>
      </main>
    </div>
  )
}

export default function ChatPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080412' }}>
        <div className="text-center">
          <div className="text-4xl mb-4">💬</div>
          <p style={{ color: '#C4B5FD' }}>Loading chat...</p>
        </div>
      </div>
    }>
      <ChatContent />
    </Suspense>
  )
}
