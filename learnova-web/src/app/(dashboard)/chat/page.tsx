'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import {
  Send,
  Copy,
  Check,
  Sparkles,
  Bookmark,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  Globe,
  Minimize2,
  Maximize2,
  Flame,
  Zap,
  BookOpen,
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'

interface Message {
  role: 'user' | 'assistant'
  content: string
  id: string
  feedback?: 'helpful' | 'not-helpful' | null
}

interface ToneMode {
  id: string
  name: string
  icon: string
  description: string
  color: string
}

const toneModes: ToneMode[] = [
  {
    id: 'simple-bhai',
    name: 'Simple Bhai',
    icon: '🤝',
    description: 'Casual Hinglish, desi analogies like a dost',
    color: '#1D9E75',
  },
  {
    id: 'class',
    name: 'Class',
    icon: '👨‍🏫',
    description: 'Teacher-style, NCERT-mapped explanations',
    color: '#534AB7',
  },
  {
    id: 'expert',
    name: 'Expert',
    icon: '🎓',
    description: 'JEE/NEET/UPSC level technical depth',
    color: '#3C3489',
  },
  {
    id: 'business',
    name: 'Business',
    icon: '💼',
    description: 'Indian market startup advisor',
    color: '#BA7517',
  },
  {
    id: 'revision',
    name: 'Revision',
    icon: '⚡',
    description: 'Rapid-fire, memory tricks, exam tips',
    color: '#E74C3C',
  },
]

const languages = [
  { id: 'en', name: 'English', flag: '🇬🇧' },
  { id: 'hi', name: 'हिंदी', flag: '🇮🇳' },
  { id: 'hinglish', name: 'Hinglish', flag: '🗣️' },
]

export default function ChatPage() {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState('class')
  const [language, setLanguage] = useState('en')
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [showToneSelector, setShowToneSelector] = useState(false)
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [depthLevel, setDepthLevel] = useState<'simple' | 'detailed'>('detailed')
  const [savingNote, setSavingNote] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentMode = toneModes.find((m) => m.id === mode) || toneModes[1]
  const currentLanguage = languages.find((l) => l.id === language) || languages[0]

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMessage = input.trim()
    setInput('')
    const messageId = Date.now().toString()
    setMessages((prev) => [...prev, { role: 'user', content: userMessage, id: messageId }])
    setLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          mode,
          language,
          depthLevel,
          conversationId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to send message')
      }

      // Parse JSON response and extract only the message
      const data = await response.json()
      const assistantId = (Date.now() + 1).toString()
      
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message, id: assistantId }
      ])
    } catch (error: any) {
      const errorId = (Date.now() + 1).toString()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${error.message}`, id: errorId },
      ])
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleSaveNote = async (content: string, id: string) => {
    setSavingNote(id)
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Chat Note - ${new Date().toLocaleDateString()}`,
          content,
          sourceType: 'chat',
          sourceId: conversationId,
          tags: [mode, language],
        }),
      })

      if (response.ok) {
        console.log('Note saved successfully')
      }
    } catch (error) {
      console.error('Failed to save note:', error)
    } finally {
      setSavingNote(null)
    }
  }

  const handleFeedback = (messageId: string, feedback: 'helpful' | 'not-helpful') => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId ? { ...msg, feedback } : msg
      )
    )
  }

  const handleExplainDifferently = (message: Message) => {
    const prevUserMessage = messages[messages.indexOf(message) - 1]
    if (prevUserMessage && prevUserMessage.role === 'user') {
      setInput(`Explain this differently: ${prevUserMessage.content}`)
    }
  }

  const toggleDepth = () => {
    setDepthLevel(depthLevel === 'simple' ? 'detailed' : 'simple')
  }

  const userName = user?.user_metadata?.name || user?.email?.split('@')[0] || 'there'

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <div className="chat-page max-w-5xl mx-auto h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)]">
      {/* Header with Controls */}
      <div className="chat-topbar flex-shrink-0 mb-3 sm:mb-4 rounded-xl">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <h2 className="text-base sm:text-lg lg:text-xl font-semibold truncate max-w-[160px] sm:max-w-none">
              {getGreeting()}, {userName} 👋
            </h2>
            <p className="text-xs sm:text-sm hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
              Ask me anything — study questions, exam prep, or general help
            </p>
          </div>
          
          {/* Controls — shrink on mobile, never overflow */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageSelector(!showLanguageSelector)}
                className="flex items-center gap-1 px-2 py-2 rounded-lg border transition-colors text-xs"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-input)',
                  color: 'var(--text-secondary)'
                }}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{currentLanguage.flag}</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
              
              {showLanguageSelector && (
                <div className="absolute right-0 top-full mt-2 rounded-lg border p-2 z-20 min-w-[150px]" style={{ 
                  backgroundColor: 'var(--bg-secondary)',
                  borderColor: 'var(--border-card)'
                }}>
                  {languages.map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => {
                        setLanguage(lang.id)
                        setShowLanguageSelector(false)
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        language === lang.id ? '' : 'hover:bg-[#1e2130]'
                      }`}
                      style={{
                        backgroundColor: language === lang.id ? '#1e1b4b' : 'transparent',
                        color: language === lang.id ? '#a78bfa' : '#9ca3af'
                      }}
                    >
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Depth Toggle */}
            <button
              onClick={toggleDepth}
              className="flex items-center gap-1 px-2 py-2 rounded-lg border transition-colors text-xs"
              style={{
                backgroundColor: depthLevel === 'detailed' ? 'var(--accent-purple-glow)' : 'var(--bg-tertiary)',
                borderColor: depthLevel === 'detailed' ? 'var(--border-focus)' : 'var(--border-input)',
                color: depthLevel === 'detailed' ? 'var(--accent-purple-light)' : 'var(--text-secondary)'
              }}
            >
              {depthLevel === 'simple' ? (
                <Minimize2 className="w-3.5 h-3.5" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5" />
              )}
            </button>
          
            {/* Tone Switcher */}
            <button
              onClick={() => setShowToneSelector(!showToneSelector)}
              className="flex items-center gap-1 px-2 py-2 rounded-lg border transition-colors text-xs"
              style={{
                backgroundColor: 'var(--accent-purple-glow)',
                borderColor: 'var(--border-focus)',
                color: 'var(--accent-purple-light)'
              }}
            >
              <span className="text-base">{currentMode.icon}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tone Selector Dropdown */}
        {showToneSelector && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-3" style={{ borderTop: '1px solid var(--border-card)' }}>
            {toneModes.map((toneMode) => (
              <button
                key={toneMode.id}
                onClick={() => {
                  setMode(toneMode.id)
                  setShowToneSelector(false)
                }}
                className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 transition-all hover:bg-[#1e2130]"
                style={{
                  borderColor: mode === toneMode.id ? toneMode.color : 'var(--border-input)',
                  backgroundColor: mode === toneMode.id ? `${toneMode.color}20` : 'var(--bg-secondary)',
                }}
              >
                <span className="text-xl">{toneMode.icon}</span>
                <span className="font-semibold text-xs" style={{ color: toneMode.color }}>
                  {toneMode.name}
                </span>
                <p className="text-[10px] text-[#9ca3af] text-center leading-tight">
                  {toneMode.description}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div className="chat-messages flex-1 overflow-y-auto space-y-3 sm:space-y-4 mb-3 sm:mb-4 px-3 pt-3 pb-[80px] lg:pb-4">
        {messages.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-[14px] mb-6" style={{ backgroundColor: 'var(--accent-purple-glow)' }}>
              <Sparkles className="w-10 h-10" style={{ color: 'var(--accent-purple-light)' }} />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3" style={{ color: 'var(--text-primary)' }}>
              Welcome to Learnova AI
            </h2>
            <p className="text-sm sm:text-base max-w-md mx-auto leading-relaxed mb-6 sm:mb-8 px-4" style={{ color: 'var(--text-secondary)' }}>
              Ask me anything — from exam prep to startup advice. I'm here to help you succeed.
            </p>
            
            {/* Quick Start Suggestions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 max-w-2xl mx-auto px-4">
              {[
                { icon: '📚', text: "Explain Newton's Laws simply", category: 'Physics' },
                { icon: '🎯', text: 'Help me plan JEE preparation', category: 'Exam Prep' },
                { icon: '💡', text: 'Validate my startup idea', category: 'Business' },
                { icon: '✍️', text: 'Write a formal letter for board exam', category: 'Writing' },
              ].map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(suggestion.text)}
                  className="suggestion-card"
                >
                  <span className="sugg-emoji">{suggestion.icon}</span>
                  <div className="flex-1">
                    <p className="sugg-text">
                      {suggestion.text}
                    </p>
                    <span className="sugg-tag">
                      {suggestion.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, idx) => (
          <div
            key={`msg-${message.id}-${idx}`}
            className={`flex gap-3 mb-6 ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
          >
            {/* AI Avatar */}
            {message.role === 'assistant' && (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-600 to-purple-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                AI
              </div>
            )}

            {/* Message Bubble */}
            <div
              className={`max-w-[85%] sm:max-w-[78%] px-3 sm:px-5 py-2 sm:py-3 rounded-2xl text-xs sm:text-sm leading-6 sm:leading-7
                ${message.role === 'user'
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-[var(--bg-secondary)] text-gray-100 border border-gray-700/40 rounded-bl-none'
                }`}
            >
              {message.role === 'assistant' ? (
                <ReactMarkdown
                  components={{
                    p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({children}) => <strong className="font-semibold text-white">{children}</strong>,
                    ul: ({children}) => <ul className="list-disc list-inside space-y-1 my-2">{children}</ul>,
                    ol: ({children}) => <ol className="list-decimal list-inside space-y-1 my-2">{children}</ol>,
                    li: ({children}) => <li className="text-gray-300">{children}</li>,
                    code: ({children}) => <code className="bg-gray-800 px-2 py-0.5 rounded text-purple-300 text-xs">{children}</code>,
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                <p className="whitespace-pre-wrap">{message.content}</p>
              )}
              
              {message.role === 'assistant' && (
                <div className="mt-3 pt-2 flex items-center gap-2 flex-wrap" style={{ borderTop: '1px solid var(--border-card)' }}>
                  <button
                    onClick={() => copyToClipboard(message.content, message.id)}
                    className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1e2130] transition-colors"
                    style={{ color: '#9ca3af' }}
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                  <button
                    onClick={() => handleSaveNote(message.content, message.id)}
                    disabled={savingNote === message.id}
                    className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1e2130] transition-colors disabled:opacity-50" style={{ color: '#a78bfa' }}
                  >
                    <Bookmark className="w-3.5 h-3.5" /> {savingNote === message.id ? 'Saving...' : 'Save Note'}
                  </button>
                  <button
                    onClick={() => handleExplainDifferently(message)}
                    className="text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-[#1e2130] transition-colors"
                    style={{ color: '#9ca3af' }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Explain Differently
                  </button>
                  <div className="flex items-center gap-1 ml-auto">
                    <button
                      onClick={() => handleFeedback(message.id, 'helpful')}
                      className={`p-1.5 rounded transition-colors ${
                        message.feedback === 'helpful'
                          ? 'bg-green-500 text-white'
                          : 'hover:bg-[#1e2130] text-[#9ca3af]'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleFeedback(message.id, 'not-helpful')}
                      className={`p-1.5 rounded transition-colors ${
                        message.feedback === 'not-helpful'
                          ? 'bg-red-500 text-white'
                          : 'hover:bg-[#1e2130] text-[#9ca3af]'
                      }`}
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar */}
            {message.role === 'user' && (
              <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-1">
                U
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="border rounded-xl px-5 py-3" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-card)' }}>
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-purple-light)', animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-purple-light)', animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--accent-purple-light)', animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Thinking...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex-shrink-0 border p-3 sm:p-4 rounded-[12px]" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-card)' }}>
        {/* Input row — must stay within screen width */}
        <div className="chat-input-row flex gap-2 w-full">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-3 text-base"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="chat-send-btn flex-shrink-0 w-11 h-11 sm:w-auto sm:px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium text-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
        
        {/* Mode pills row — scrollable, never wraps or overflows */}
        <div className="chat-context-pills flex items-center gap-2 mt-2 overflow-x-auto scrollbar-hide pb-0.5">
          <span className="context-pill flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border">
            {currentMode.icon} {currentMode.name}
          </span>
          <span className="flex-shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>•</span>
          <span className="flex-shrink-0 inline-flex items-center gap-1 text-xs" style={{ color: 'var(--text-muted)' }}>
            {currentLanguage.flag} {currentLanguage.name}
          </span>
          <span className="flex-shrink-0 text-xs" style={{ color: 'var(--text-muted)' }}>•</span>
          <span className="context-pill flex-shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border">
            {depthLevel === 'simple' ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
            {depthLevel === 'simple' ? 'Simple' : 'Detailed'}
          </span>
        </div>
      </form>
    </div>
  )
}
