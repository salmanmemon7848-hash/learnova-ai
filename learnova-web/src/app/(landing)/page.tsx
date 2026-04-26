'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, ChevronRight, Star, Check, Shield, Zap, Calendar, PenTool, Lightbulb, GraduationCap, MessageSquare } from 'lucide-react'

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen" style={{ fontFamily: 'Inter, system-ui, -apple-system, sans-serif' }}>
      {/* Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
          scrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white'
        }`}
      >
        <div className="max-w-[1100px] mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-[22px] font-semibold tracking-[-0.5px]" style={{ color: '#534AB7' }}>
            Learnova
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#0F0F1A' }}>
              Features
            </a>
            <Link href="/pricing" className="text-sm font-medium hover:opacity-70 transition-opacity" style={{ color: '#0F0F1A' }}>
              Pricing
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 border-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
              style={{ borderColor: '#534AB7', color: '#534AB7' }}
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: '#534AB7' }}
            >
              Get started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-sm font-medium py-2" style={{ color: '#0F0F1A' }}>
                Features
              </a>
              <Link href="/pricing" className="block text-sm font-medium py-2" style={{ color: '#0F0F1A' }}>
                Pricing
              </Link>
              <Link href="/login" className="block text-sm font-medium py-2" style={{ color: '#0F0F1A' }}>
                Sign in
              </Link>
              <Link
                href="/signup"
                className="block text-center py-3 rounded-lg text-sm font-medium text-white"
                style={{ backgroundColor: '#534AB7' }}
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-[1100px] mx-auto px-4 text-center">
          {/* Badge */}
          <div
            className="inline-block px-[14px] py-1 rounded-[20px] text-[12px] font-medium mb-6"
            style={{
              backgroundColor: '#EEEDFE',
              color: '#3C3489',
              border: '1px solid #AFA9EC',
            }}
          >
            ✦ Trusted by 50,000+ students & founders
          </div>

          {/* Headline */}
          <h1
            className="text-[52px] md:text-[52px] font-semibold leading-[1.15] mb-4"
            style={{ color: '#0F0F1A' }}
          >
            The AI that studies with you
            <br />
            and builds with you
          </h1>

          {/* Subheadline */}
          <p
            className="text-[18px] max-w-2xl mx-auto mb-8"
            style={{ color: '#5A5A72' }}
          >
            One powerful AI for students who want to ace every exam
            <br />
            and builders who want to launch great ideas — built for India.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
            <Link
              href="/signup"
              className="px-7 py-3.5 rounded-[10px] text-[15px] font-medium text-white inline-flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#534AB7' }}
            >
              Start for free
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link
              href="#features"
              className="px-7 py-3.5 rounded-[10px] text-[15px] font-medium inline-flex items-center justify-center gap-2 transition-all hover:opacity-80"
              style={{
                backgroundColor: 'transparent',
                color: '#534AB7',
                border: '1.5px solid #534AB7',
              }}
            >
              See how it works
            </Link>
          </div>

          {/* Trust Line */}
          <p className="text-[12px]" style={{ color: '#8888A0' }}>
            No credit card required · Free plan available · Cancel anytime
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20" style={{ backgroundColor: '#F8F8FA' }}>
        <div className="max-w-[1100px] mx-auto px-4">
          {/* Section Label */}
          <p
            className="text-[11px] font-medium tracking-[0.1em] text-center mb-4"
            style={{ color: '#534AB7' }}
          >
            WHAT MAKES LEARNOVA DIFFERENT
          </p>

          {/* Section Headline */}
          <h2
            className="text-[36px] font-semibold text-center mb-12"
            style={{ color: '#0F0F1A' }}
          >
            Everything you need to learn and build
          </h2>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <MessageSquare className="w-5 h-5" style={{ color: '#534AB7' }} />,
                title: 'Smart AI chat',
                description:
                  'Ask anything — from exam concepts to business strategy. Learnova explains like your smartest friend and advises like your best mentor.',
              },
              {
                icon: <Zap className="w-5 h-5" style={{ color: '#534AB7' }} />,
                title: 'Tone switcher',
                description:
                  'Switch between Simple, Balanced, Expert, Study mode, and Business mode with one tap. The AI adapts completely to how you want to learn.',
              },
              {
                icon: <GraduationCap className="w-5 h-5" style={{ color: '#534AB7' }} />,
                title: 'Exam simulator',
                description:
                  'Practice tests with real scoring, instant feedback on every answer, weak area detection, and performance tracking over time.',
                badge: 'Most used',
              },
              {
                icon: <Lightbulb className="w-5 h-5" style={{ color: '#534AB7' }} />,
                title: 'Idea validator',
                description:
                  'Describe your business idea. Get a scored analysis of market demand, competition, profit potential, and 3 concrete next steps in seconds.',
              },
              {
                icon: <PenTool className="w-5 h-5" style={{ color: '#534AB7' }} />,
                title: 'AI writer',
                description:
                  'Write essays, business emails, startup pitches, study notes, cover letters, and social media posts. Works for both students and founders.',
                badge: 'Pro',
              },
              {
                icon: <Calendar className="w-5 h-5" style={{ color: '#534AB7' }} />,
                title: 'Smart planner',
                description:
                  'Tell Learnova your goals and deadlines. It builds your complete daily schedule — study plan or work plan — and adapts as you progress.',
                badge: 'Pro',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="p-6 rounded-[14px] transition-all hover:shadow-md"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(83,74,183,0.1)',
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-10 h-10 rounded-[10px] mb-4"
                  style={{ backgroundColor: '#EEEDFE' }}
                >
                  {feature.icon}
                </div>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold" style={{ color: '#0F0F1A' }}>
                    {feature.title}
                  </h3>
                  {feature.badge && (
                    <span
                      className="px-2 py-0.5 rounded-full text-[11px] font-medium"
                      style={{
                        backgroundColor: feature.badge === 'Pro' ? '#534AB7' : '#EEEDFE',
                        color: feature.badge === 'Pro' ? '#FFFFFF' : '#3C3489',
                      }}
                    >
                      {feature.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm leading-relaxed" style={{ color: '#5A5A72' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-[1100px] mx-auto px-4">
          <h2
            className="text-[36px] font-semibold text-center mb-12"
            style={{ color: '#0F0F1A' }}
          >
            How it works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Sign in with Google',
                description: 'One click, no forms, instant access',
              },
              {
                step: '2',
                title: 'Tell Learnova your goal',
                description: 'Studying for exams or building a business',
              },
              {
                step: '3',
                title: 'Get results immediately',
                description: 'Chat, practice, validate, plan, write',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-full text-xl font-semibold mb-4"
                  style={{ backgroundColor: '#EEEDFE', color: '#534AB7' }}
                >
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#0F0F1A' }}>
                  {item.title}
                </h3>
                <p style={{ color: '#5A5A72' }}>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20" style={{ backgroundColor: '#F8F8FA' }}>
        <div className="max-w-[1100px] mx-auto px-4">
          <h2
            className="text-[36px] font-semibold text-center mb-12"
            style={{ color: '#0F0F1A' }}
          >
            Loved by students and founders
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote:
                  'I went from failing Economics to scoring 89% in 3 weeks. The exam simulator and instant explanations are genuinely incredible.',
                name: 'Priya Sharma',
                role: 'Class 12 student, Jaipur',
                initials: 'PS',
              },
              {
                quote:
                  'I validated my food delivery idea, built my pitch, and got my first investor meeting — all using Learnova in one afternoon.',
                name: 'Rahul Mehta',
                role: 'Founder, FreshBox',
                initials: 'RM',
              },
              {
                quote:
                  'The tone switcher is genius. I use Expert mode for my MBA prep and Simple mode when I\'m explaining things to my team.',
                name: 'Ananya Iyer',
                role: 'MBA aspirant, Bangalore',
                initials: 'AI',
              },
            ].map((testimonial, index) => (
              <div
                key={index}
                className="p-6 rounded-[14px]"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid rgba(83,74,183,0.1)',
                }}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" style={{ color: '#BA7517' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: '#0F0F1A' }}>
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white"
                    style={{ backgroundColor: '#534AB7' }}
                  >
                    {testimonial.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#0F0F1A' }}>
                      {testimonial.name}
                    </p>
                    <p className="text-xs" style={{ color: '#5A5A72' }}>
                      {testimonial.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20" style={{ backgroundColor: '#FFFFFF' }}>
        <div className="max-w-[700px] mx-auto px-4 text-center">
          <h2
            className="text-[36px] font-semibold mb-4"
            style={{ color: '#0F0F1A' }}
          >
            Start free today — no card required
          </h2>
          <p className="text-lg mb-8" style={{ color: '#5A5A72' }}>
            Join thousands of students and builders who are already using Learnova to achieve their goals.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[10px] text-[15px] font-medium text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#534AB7' }}
          >
            Create your free account
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-12"
        style={{ backgroundColor: '#0F0F1A', color: '#5A5A72' }}
      >
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            {/* Left */}
            <div>
              <p className="text-lg font-semibold mb-1" style={{ color: '#FFFFFF' }}>
                Learnova
              </p>
              <p className="text-sm">© 2025 Learnova AI. All rights reserved.</p>
            </div>

            {/* Center */}
            <div className="flex gap-6">
              <a href="#" className="text-sm hover:opacity-70 transition-opacity">
                Privacy Policy
              </a>
              <a href="#" className="text-sm hover:opacity-70 transition-opacity">
                Terms of Service
              </a>
              <a href="#" className="text-sm hover:opacity-70 transition-opacity">
                Contact
              </a>
            </div>

            {/* Right */}
            <div className="flex gap-4">
              {/* Twitter/X */}
              <a href="#" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* LinkedIn */}
              <a href="#" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              {/* Instagram */}
              <a href="#" className="hover:opacity-70 transition-opacity">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.765.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
