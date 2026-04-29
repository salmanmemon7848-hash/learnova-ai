'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { BookOpen, Lightbulb, Calendar, ArrowRight } from 'lucide-react';
import { usePersonaStore } from '@/lib/stores/personaStore';
import { Suspense } from 'react';

function LandingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setPersona } = usePersonaStore();

  const handleStudentClick = () => {
    setPersona('student');
    router.push('/chat');
  };

  const handleFounderClick = () => {
    setPersona('founder');
    router.push('/chat');
  };

  const handlePromptClick = (prompt: string) => {
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const handleGetStarted = () => {
    router.push('/chat');
  };

  const features = [
    {
      icon: <BookOpen size={22} color="#A78BFA" />,
      title: 'Exam Prep AI',
      description: 'JEE, NEET, CBSE — understands Indian curriculum and NCERT syllabus.',
    },
    {
      icon: <Lightbulb size={22} color="#A78BFA" />,
      title: 'Business Validator',
      description: 'Validate your startup idea against real Indian market conditions and competition.',
      badge: 'Most Used',
    },
    {
      icon: <Calendar size={22} color="#A78BFA" />,
      title: 'Study Planner',
      description: 'Personalized revision plans for your exam date, subjects, and weak areas.',
    },
  ];

  const prompts = [
    'Explain organic chemistry for NEET',
    'Validate my food delivery startup idea',
    'Create a 30-day JEE revision plan',
    'How to register an MSME in India?',
    "Explain Newton's Laws step by step",
  ];

  const testimonials = [
    {
      quote: '"Learnova helped me crack JEE Advanced with a top 500 rank. The step-by-step explanations are better than my coaching classes."',
      name: 'Arjun Sharma',
      role: 'Class 12 Student, Jaipur',
    },
    {
      quote: '"I was struggling with NEET preparation. Learnova made complex biology concepts so simple. Scored 680/720 in my mock test!"',
      name: 'Priya Nair',
      role: 'NEET Aspirant, Kochi',
    },
    {
      quote: '"Validated my startup idea in 5 minutes. Learnova gave me insights about Indian market that I never considered. Launched last month!"',
      name: 'Rahul Gupta',
      role: 'Founder, Indore',
    },
  ];

  return (
    <div className="min-h-screen" style={{ background: '#080412', color: '#F5F3FF', fontFamily: 'var(--font-body), Inter, sans-serif' }}>
      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 border-b" style={{ background: '#080412', borderColor: '#2D1B69', height: '60px', padding: '0 24px' }}>
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between">
          {/* Logo */}
          <h1
            className="text-[20px] font-semibold cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
            onClick={() => router.push('/')}
          >
            Learnova AI
          </h1>

          {/* Right Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/login')}
              className="text-[14px] font-medium transition-all hover:bg-[#1E1B4B]"
              style={{
                color: '#A78BFA',
                border: '1px solid #4338CA',
                borderRadius: '8px',
                padding: '8px 16px',
              }}
            >
              Sign In
            </button>
            <button
              onClick={handleGetStarted}
              className="text-[14px] font-medium text-white transition-all hover:brightness-110"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                borderRadius: '8px',
                padding: '8px 18px',
                boxShadow: '0 4px 20px #7C3AED40',
              }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center flex-col px-6" style={{ padding: '80px 24px' }}>
        {/* Background Glows */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 600px 400px at 15% 50%, #7C3AED15, transparent)',
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 600px 400px at 85% 50%, #4F46E515, transparent)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
          {/* Top Badge */}
          <div
            className="text-[13px] font-medium px-4 py-1 rounded-[20px]"
            style={{
              background: '#1E1B4B',
              color: '#A78BFA',
              border: '1px solid #4338CA',
            }}
          >
            🇮🇳 Built for India
          </div>

          {/* Headline */}
          <h2
            className="text-[32px] sm:text-[52px] font-bold text-center leading-[1.15] mt-5"
            style={{ maxWidth: '700px' }}
          >
            <span style={{ color: '#F5F3FF' }}>The AI built for </span>
            <span
              style={{
                background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 50%, #C026D3 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              India's Students
            </span>
            <span style={{ color: '#F5F3FF' }}> and Builders</span>
          </h2>

          {/* Subheadline */}
          <p
            className="text-[17px] text-center leading-[1.6] mt-4"
            style={{ color: '#C4B5FD', maxWidth: '520px' }}
          >
            Smarter than a tutor. Faster than Google. Built for JEE, NEET, and Indian startups.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              onClick={handleStudentClick}
              className="text-[15px] font-medium text-white flex items-center gap-2 transition-all hover:brightness-110 hover:-translate-y-0.5"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                height: '48px',
                padding: '0 28px',
                borderRadius: '10px',
                boxShadow: '0 4px 24px #7C3AED50',
              }}
            >
              I'm a Student <ArrowRight size={18} />
            </button>
            <button
              onClick={handleFounderClick}
              className="text-[15px] font-medium transition-all hover:bg-[#1E1B4B] hover:-translate-y-0.5"
              style={{
                border: '1px solid #4338CA',
                color: '#A78BFA',
                height: '48px',
                padding: '0 28px',
                borderRadius: '10px',
              }}
            >
              I'm a Founder →
            </button>
          </div>

          {/* Social Proof */}
          <p className="text-[13px] text-center mt-5" style={{ color: '#9CA3AF' }}>
            Join 1,000+ students and founders using Learnova AI
          </p>
        </div>
      </section>

      {/* ===== FEATURES SECTION ===== */}
      <section className="px-6" style={{ padding: '80px 24px', background: '#080412' }}>
        <div className="max-w-5xl mx-auto">
          {/* Section Label */}
          <p className="text-[12px] font-semibold text-center uppercase tracking-[2px]" style={{ color: '#7C3AED' }}>
            FEATURES
          </p>

          {/* Section Title */}
          <h3 className="text-[32px] font-semibold text-center mt-2" style={{ color: '#F5F3FF', maxWidth: '500px', margin: '8px auto 0' }}>
            Everything you need to learn and build in India
          </h3>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10" style={{ maxWidth: '860px', margin: '40px auto 0' }}>
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="relative rounded-[16px] p-6 cursor-pointer transition-all duration-200 hover:-translate-y-0.5"
                style={{
                  background: 'linear-gradient(135deg, #160D2E, #1E1040)',
                  border: '1px solid #2D1B69',
                  boxShadow: '0 0 30px #7C3AED18',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#7C3AED';
                  e.currentTarget.style.boxShadow = '0 0 40px #7C3AED30';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#2D1B69';
                  e.currentTarget.style.boxShadow = '0 0 30px #7C3AED18';
                }}
              >
                {/* Badge */}
                {feature.badge && (
                  <span
                    className="absolute top-3 right-3 text-[10px] font-semibold px-2 py-0.5 rounded-[20px]"
                    style={{
                      background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                      color: 'white',
                    }}
                  >
                    {feature.badge}
                  </span>
                )}

                {/* Icon */}
                <div
                  className="w-[44px] h-[44px] rounded-[10px] flex items-center justify-center mb-4"
                  style={{
                    background: '#1E1B4B',
                    border: '1px solid #4338CA',
                  }}
                >
                  {feature.icon}
                </div>

                {/* Content */}
                <h4 className="text-[17px] font-semibold mb-2" style={{ color: '#F5F3FF' }}>
                  {feature.title}
                </h4>
                <p className="text-[14px] leading-[1.6]" style={{ color: '#C4B5FD' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== EXAMPLE PROMPTS SECTION ===== */}
      <section className="px-6" style={{ background: '#0F0A1E', padding: '80px 24px' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-[28px] font-semibold" style={{ color: '#F5F3FF' }}>
            See what Learnova can do
          </h3>
          <p className="text-[14px] mt-2" style={{ color: '#9CA3AF' }}>
            Click any prompt to try it instantly
          </p>

          {/* Prompt Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 mt-6">
            {prompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(prompt)}
                className="text-[14px] px-5 py-2.5 rounded-[20px] cursor-pointer transition-all duration-200"
                style={{
                  background: '#160D2E',
                  border: '1px solid #2D1B69',
                  color: '#C4B5FD',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#1E1040';
                  e.currentTarget.style.borderColor = '#7C3AED';
                  e.currentTarget.style.color = '#F5F3FF';
                  e.currentTarget.style.boxShadow = '0 0 20px #7C3AED25';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#160D2E';
                  e.currentTarget.style.borderColor = '#2D1B69';
                  e.currentTarget.style.color = '#C4B5FD';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SOCIAL PROOF SECTION ===== */}
      <section className="px-6" style={{ background: '#080412', padding: '60px 24px' }}>
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ maxWidth: '860px', margin: '0 auto' }}>
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="rounded-[14px] p-6"
                style={{
                  background: 'linear-gradient(135deg, #160D2E, #1E1040)',
                  border: '1px solid #2D1B69',
                }}
              >
                {/* Quote */}
                <p className="text-[14px] leading-[1.7] italic" style={{ color: '#C4B5FD' }}>
                  {testimonial.quote}
                </p>

                {/* Name */}
                <p className="text-[13px] font-semibold mt-4" style={{ color: '#F5F3FF' }}>
                  {testimonial.name}
                </p>

                {/* Role Badge */}
                <span
                  className="inline-block text-[11px] mt-2 px-2.5 py-0.5 rounded-[20px]"
                  style={{
                    background: '#1E1B4B',
                    color: '#A78BFA',
                    border: '1px solid #4338CA',
                  }}
                >
                  {testimonial.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="px-6 border-t" style={{ background: '#080412', borderColor: '#2D1B69', padding: '32px 24px' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Left */}
          <div>
            <h4
              className="text-[18px] font-semibold"
              style={{
                background: 'linear-gradient(135deg, #A78BFA, #7C3AED)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Learnova AI
            </h4>
            <p className="text-[13px] mt-1" style={{ color: '#9CA3AF' }}>
              Made with love for India 🇮🇳
            </p>
          </div>

          {/* Right Links */}
          <div className="flex items-center gap-5">
            {['Home', 'Chat', 'About'].map((link) => (
              <button
                key={link}
                onClick={() => router.push(`/${link.toLowerCase() === 'home' ? '' : link.toLowerCase()}`)}
                className="text-[13px] font-medium transition-colors hover:text-[#F5F3FF]"
                style={{ color: '#C4B5FD' }}
              >
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div style={{ background: '#080412', minHeight: '100vh' }} />}>
      <LandingContent />
    </Suspense>
  );
}
