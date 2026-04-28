'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronRight, MessageSquare, FileText, Lightbulb, PenTool, Calendar, Search, Target, BookOpen, Users, TrendingUp, CheckCircle, ArrowRight } from 'lucide-react'
import BetaBanner from '@/components/BetaBanner'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Beta Banner */}
      <BetaBanner />

      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled ? 'shadow-sm' : ''
        }`}
        style={{ backgroundColor: 'var(--surface)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold font-heading" style={{ color: 'var(--accent)' }}>
            Learnova
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--foreground)' }}>
              Features
            </a>
            <Link href="/about" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: 'var(--foreground)' }}>
              About
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 border-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
              style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--highlight)' }}
            >
              Get started
            </Link>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
            style={{ color: 'var(--foreground)' }}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm font-medium py-2" style={{ color: 'var(--foreground)' }}>
                Features
              </a>
              <Link href="/about" className="block text-sm font-medium py-2" style={{ color: 'var(--foreground)' }}>
                About
              </Link>
              <Link href="/login" className="block text-sm font-medium py-2" style={{ color: 'var(--foreground)' }}>
                Sign in
              </Link>
              <Link
                href="/signup"
                className="block text-center py-3 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: 'var(--highlight)' }}
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Section 1: Hero */}
      <section className="pt-32 pb-20" style={{ background: 'var(--gradient-hero)' }}>
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div
            className="inline-block px-4 py-2 rounded-full text-xs font-semibold mb-6"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#f97316', border: '1px solid rgba(249,115,22,0.3)' }}
          >
            Currently in beta — free to use
          </div>

          <h1 className="text-4xl md:text-6xl font-bold leading-tight mb-6" style={{ color: '#ffffff' }}>
            The AI built for India's students
            <br />
            and builders
          </h1>

          <p className="text-lg md:text-xl max-w-3xl mx-auto mb-8" style={{ color: 'rgba(255,255,255,0.8)' }}>
            Prepare for UPSC, JEE, NEET & CAT — or validate your startup idea — with AI that speaks your language.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              href="/signup"
              className="px-8 py-4 rounded-lg text-base font-semibold text-white inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: 'var(--highlight)' }}
            >
              Start Free
              <ChevronRight className="w-5 h-5" />
            </Link>
            <a
              href="#demo"
              className="px-8 py-4 rounded-lg text-base font-semibold inline-flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{ backgroundColor: 'transparent', color: '#ffffff', border: '2px solid rgba(255,255,255,0.3)' }}
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* Section 2: Live Demo */}
      <section id="demo" className="py-20" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Try Learnova — No account needed
            </h2>
            <p className="text-lg" style={{ color: 'var(--foreground-muted)' }}>
              Click any example prompt below to see Learnova AI in action
            </p>
          </div>

          <LiveDemo />
        </div>
      </section>

      {/* Section 3: Features */}
      <section id="features" className="py-20" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: 'var(--accent)' }}>
              WHAT MAKES LEARNOVA DIFFERENT
            </p>
            <h2 className="text-3xl md:text-4xl font-bold" style={{ color: 'var(--foreground)' }}>
              Everything you need to learn and build
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: MessageSquare, title: 'AI Chat', benefit: 'Ask anything, get instant answers tailored to your level' },
              { icon: FileText, title: 'Exam Simulator', benefit: 'Practice with AI-generated questions for UPSC, JEE, NEET, CAT' },
              { icon: Lightbulb, title: 'Idea Validator', benefit: 'Get honest market analysis for your startup ideas' },
              { icon: PenTool, title: 'AI Writer', benefit: 'Generate essays, emails, pitches, and study notes' },
              { icon: Calendar, title: 'Smart Planner', benefit: 'Personalized study schedules that adapt to your progress' },
              { icon: Search, title: 'Doubt Solver', benefit: 'Upload a photo of any problem, get step-by-step solutions' },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-xl transition-all hover:shadow-lg"
                style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)' }}
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-lg mb-4"
                  style={{ backgroundColor: 'var(--active-bg)' }}
                >
                  <feature.icon className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  {feature.title}
                </h3>
                <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>
                  {feature.benefit}
                </p>
                <button className="text-sm font-semibold inline-flex items-center gap-1 hover:gap-2 transition-all" style={{ color: 'var(--accent)' }}>
                  See example <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Who is Learnova for? */}
      <section className="py-20" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: 'var(--foreground)' }}>
            Who is Learnova for?
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-xl" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-8 h-8" style={{ color: 'var(--accent)' }} />
                <h3 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Students</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Practice with exam-specific questions for UPSC, JEE, NEET, and CAT',
                  'Get instant doubt resolution with step-by-step explanations',
                  'Follow personalized study plans that adapt to your weak areas',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                    <span style={{ color: 'var(--foreground-secondary)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-8 rounded-xl" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-8 h-8" style={{ color: 'var(--highlight)' }} />
                <h3 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Builders</h3>
              </div>
              <ul className="space-y-4">
                {[
                  'Validate startup ideas with honest AI-powered market analysis',
                  'Generate investor-ready pitch decks in minutes, not days',
                  'Get actionable go-to-market strategies tailored to Indian markets',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'var(--success)' }} />
                    <span style={{ color: 'var(--foreground-secondary)' }}>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: How It Works */}
      <section className="py-20" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12" style={{ color: 'var(--foreground)' }}>
            How It Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Choose your goal', desc: 'Studying for exams or building a business' },
              { step: '2', title: 'Chat or use a tool', desc: 'AI chat, exam simulator, idea validator, and more' },
              { step: '3', title: 'Learn, plan, or build', desc: 'Get personalized results that actually help' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className="inline-flex items-center justify-center w-16 h-16 rounded-full text-2xl font-bold mb-4"
                  style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                  {item.title}
                </h3>
                <p style={{ color: 'var(--foreground-muted)' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: About / Founder */}
      <section id="about" className="py-20" style={{ backgroundColor: 'var(--background)' }}>
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-bold" style={{ backgroundColor: 'var(--accent)', color: '#ffffff' }}>
              SM
            </div>
            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--foreground)' }}>
              About Learnova
            </h2>
            <div className="space-y-4 text-lg" style={{ color: 'var(--foreground-secondary)' }}>
              <p>
                Learnova was built by <strong style={{ color: 'var(--foreground)' }}>Salman Memon</strong>, a student/developer from{' '}
                <strong style={{ color: 'var(--foreground)' }}>Gariyaband, Chhattisgarh, India</strong>.
              </p>
              <p>
                I built this because I couldn't find one AI tool that spoke my language, understood Indian exams, 
                and helped with real startup ideas at the same time.
              </p>
              <p>
                This is still in beta — I'm building it in public. Your feedback shapes what comes next.
              </p>
            </div>
            <div className="flex gap-4 justify-center mt-8">
              <a href="#" className="px-6 py-3 rounded-lg border transition-all hover:opacity-80" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                Twitter
              </a>
              <a href="#" className="px-6 py-3 rounded-lg border transition-all hover:opacity-80" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7: Footer */}
      <footer className="py-12" style={{ backgroundColor: 'var(--primary)' }}>
        <div className="max-w-7xl mx-auto px-4">
          {/* Main Footer Content */}
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: '#ffffff' }}>Learnova</h3>
            <p className="text-base md:text-lg mb-2" style={{ color: 'var(--accent-light)' }}>Made in India 🇮🇳</p>
            <p className="text-sm md:text-base mb-8" style={{ color: 'rgba(255,255,255,0.7)' }}>Built with ❤️ for students and builders in India</p>
            
            {/* Quick Links - All visible and prominent */}
            <div className="flex flex-wrap justify-center items-center gap-4 md:gap-6 lg:gap-8 mb-8 px-4">
              <Link 
                href="/" 
                className="text-sm md:text-base lg:text-lg font-medium px-4 py-2 rounded-lg transition-all hover:scale-105 hover:opacity-90"
                style={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                🏠 Home
              </Link>
              <Link 
                href="/about" 
                className="text-sm md:text-base lg:text-lg font-medium px-4 py-2 rounded-lg transition-all hover:scale-105 hover:opacity-90"
                style={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                👤 About
              </Link>
              <Link 
                href="/terms" 
                className="text-sm md:text-base lg:text-lg font-medium px-4 py-2 rounded-lg transition-all hover:scale-105 hover:opacity-90"
                style={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                📄 Terms
              </Link>
              <Link 
                href="/privacy" 
                className="text-sm md:text-base lg:text-lg font-medium px-4 py-2 rounded-lg transition-all hover:scale-105 hover:opacity-90"
                style={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                🔒 Privacy
              </Link>
              <Link 
                href="/beta-disclaimer" 
                className="text-sm md:text-base lg:text-lg font-medium px-4 py-2 rounded-lg transition-all hover:scale-105 hover:opacity-90"
                style={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                ⚠️ Beta Info
              </Link>
              <a 
                href="mailto:support@learnova.ai" 
                className="text-sm md:text-base lg:text-lg font-medium px-4 py-2 rounded-lg transition-all hover:scale-105 hover:opacity-90"
                style={{ color: '#ffffff', backgroundColor: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                📧 Contact
              </a>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="text-center pt-6 border-t" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-xs md:text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>© 2026 Learnova. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Live Demo Component
function LiveDemo() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([])
  const [loading, setLoading] = useState(false)
  const [demoUsed, setDemoUsed] = useState(false)

  const examplePrompts = [
    "Explain Newton's First Law simply",
    "Give me 5 questions on Indian Polity for UPSC",
    "Validate my idea: a tiffin delivery app for college hostels",
  ]

  const handlePromptClick = async (prompt: string) => {
    if (demoUsed || loading) return

    setLoading(true)
    setMessages([{ role: 'user', content: prompt }])

    try {
      const response = await fetch('/api/chat/demo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: prompt }),
      })

      const data = await response.json()
      
      if (data.demoLimitReached) {
        setDemoUsed(true)
        setMessages(prev => [...prev, { role: 'assistant', content: 'Demo limit reached. Sign up for unlimited access!' }])
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: data.message }])
        setDemoUsed(true)
      }
    } catch (error) {
      console.error('Demo error:', error)
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Please try again later.' }])
    } finally {
      setLoading(false)
    }
  }

  if (demoUsed && messages.length > 1) {
    return (
      <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
        <div className="space-y-4 mb-6">
          {messages.map((msg, i) => (
            <div key={i} className={`p-4 rounded-lg ${msg.role === 'user' ? 'ml-12' : 'mr-12'}`}
              style={{ 
                backgroundColor: msg.role === 'user' ? 'var(--accent)' : 'var(--background)',
                color: msg.role === 'user' ? '#ffffff' : 'var(--foreground)',
              }}
            >
              <p className="text-sm">{msg.content}</p>
            </div>
          ))}
        </div>
        <div className="text-center p-6 rounded-lg" style={{ backgroundColor: 'var(--active-bg)' }}>
          <p className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>
            Get unlimited access — it's free to sign up
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-3 rounded-lg text-white font-semibold hover:opacity-90 transition-opacity"
            style={{ backgroundColor: 'var(--highlight)' }}
          >
            Create Free Account
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
      {messages.length === 0 ? (
        <>
          <p className="text-sm mb-4" style={{ color: 'var(--foreground-muted)' }}>Click any prompt to try it:</p>
          <div className="space-y-3">
            {examplePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handlePromptClick(prompt)}
                disabled={loading}
                className="w-full text-left p-4 rounded-lg transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ backgroundColor: 'var(--background)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              >
                <p className="text-sm font-medium">{prompt}</p>
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="space-y-4 mb-6">
          {messages.map((msg, i) => (
            <div key={i} className={`p-4 rounded-lg ${msg.role === 'user' ? 'ml-12' : 'mr-12'}`}
              style={{ 
                backgroundColor: msg.role === 'user' ? 'var(--accent)' : 'var(--background)',
                color: msg.role === 'user' ? '#ffffff' : 'var(--foreground)',
              }}
            >
              <p className="text-sm">{loading && i === 1 ? 'Thinking...' : msg.content}</p>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--success)' }}></div>
        <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Powered by AI</p>
      </div>
    </div>
  )
}
