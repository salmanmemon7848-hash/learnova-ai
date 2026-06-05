'use client';

import { useRouter } from 'next/navigation';
import { BookOpen, Lightbulb, Telescope, ArrowRight, Zap, Star, Shield } from 'lucide-react';
import { Suspense } from 'react';

function LandingContent() {
  const router = useRouter();

  const handleStudentClick = () => {
    if (typeof window !== 'undefined') localStorage.setItem('learnova_pending_role', 'student');
    router.push('/signup?role=student');
  };

  const handleFounderClick = () => {
    if (typeof window !== 'undefined') localStorage.setItem('learnova_pending_role', 'founder');
    router.push('/signup?role=founder');
  };

  const handleGeneralClick = () => {
    if (typeof window !== 'undefined') localStorage.setItem('learnova_pending_role', 'general');
    router.push('/signup?role=general');
  };

  const handlePromptClick = (prompt: string) => {
    router.push(`/chat?prompt=${encodeURIComponent(prompt)}`);
  };

  const features = [
    {
      icon: <BookOpen size={20} color="#A78BFA" />,
      title: 'Exam Prep AI',
      description: 'JEE, NEET, CBSE — deep understanding of Indian curriculum and NCERT syllabus.',
      accent: 'purple',
    },
    {
      icon: <Lightbulb size={20} color="#2DD4BF" />,
      title: 'Business Validator',
      description: 'Validate your startup idea against real Indian market conditions and competition.',
      badge: 'Most Used',
      accent: 'teal',
    },
    {
      icon: <Telescope size={20} color="#A78BFA" />,
      title: 'Competitor Research',
      description: 'Discover your top competitors and find gaps they are missing in the Indian market.',
      accent: 'purple',
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
      quote: 'Learnova helped me crack JEE Advanced with a top 500 rank. The step-by-step explanations are better than my coaching classes.',
      name: 'Arjun Sharma',
      role: 'Class 12 Student, Jaipur',
      emoji: '🎓',
    },
    {
      quote: 'I was struggling with NEET preparation. Learnova made complex biology concepts so simple. Scored 680/720 in my mock test!',
      name: 'Priya Nair',
      role: 'NEET Aspirant, Kochi',
      emoji: '🔬',
    },
    {
      quote: 'Validated my startup idea in 5 minutes. Learnova gave me insights about Indian market that I never considered. Launched last month!',
      name: 'Rahul Gupta',
      role: 'Founder, Indore',
      emoji: '🚀',
    },
  ];

  const roleOptions = [
    {
      icon: '🎓',
      title: "I'm a Student",
      subtitle: 'Exam prep, doubts & study tools',
      description: 'JEE, NEET, CBSE, college prep, study plans, and step-by-step learning.',
      buttonText: 'Start Learning',
      onClick: handleStudentClick,
      badge: 'Most Popular',
      accentColor: '#A78BFA',
      borderColor: 'rgba(124,58,237,0.35)',
      glowColor: 'rgba(124,58,237,0.15)',
    },
    {
      icon: '🚀',
      title: "I'm a Founder",
      subtitle: 'Startup tools for Indian builders',
      description: 'Validate ideas, research competitors, practice pitches, and build better business plans.',
      buttonText: 'Start Building',
      onClick: handleFounderClick,
      badge: null,
      accentColor: '#2DD4BF',
      borderColor: 'rgba(13,148,136,0.35)',
      glowColor: 'rgba(13,148,136,0.12)',
    },
    {
      icon: '💬',
      title: 'Just Chat',
      subtitle: 'General AI — ask anything',
      description: 'No exam prep, no startup tools. Just a powerful AI you can talk to about anything.',
      buttonText: 'Start Chatting',
      onClick: handleGeneralClick,
      badge: null,
      accentColor: '#A78BFA',
      borderColor: 'rgba(124,58,237,0.25)',
      glowColor: 'rgba(124,58,237,0.08)',
    },
  ];

  const stats = [
    { value: '1,000+', label: 'Active Users' },
    { value: '50K+', label: 'Doubts Solved' },
    { value: '99%', label: 'Satisfaction' },
  ];

  return (
    <div style={{ background: '#060210', color: '#F5F3FF', fontFamily: 'var(--font-body), Inter, sans-serif', minHeight: '100vh' }}>

      {/* ── Background ambient glows ──────────────────────────────────────── */}
      <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '45vw', height: '45vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(13,148,136,0.1) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      </div>

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: 'rgba(6, 2, 16, 0.8)', backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        height: 60, padding: '0 20px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #7C3AED, #0D9488)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, fontWeight: 700,
            }}>L</div>
            <span style={{ fontSize: 18, fontWeight: 700, background: 'linear-gradient(135deg, #A78BFA, #2DD4BF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              Learnova AI
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => router.push('/login')}
              style={{
                fontSize: 13, fontWeight: 500, color: '#A78BFA',
                background: 'transparent', border: '1px solid rgba(124,58,237,0.35)',
                borderRadius: 8, padding: '7px 16px', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.1)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              Sign In
            </button>
            <button
              onClick={() => router.push('/signup')}
              style={{
                fontSize: 13, fontWeight: 600, color: '#fff',
                background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                border: 'none', borderRadius: 8, padding: '8px 18px', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '80px 20px 60px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.3)',
          borderRadius: 999, padding: '5px 14px', marginBottom: 24,
          fontSize: 12, fontWeight: 600, color: '#2DD4BF',
        }}>
          <span>🇮🇳</span> Built for India
        </div>

        {/* Headline */}
        <h1 style={{ textAlign: 'center', fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px', maxWidth: 720 }}>
          <span style={{ fontSize: 'clamp(32px, 6vw, 58px)', display: 'block', color: '#F5F3FF' }}>The AI built for </span>
          <span style={{
            fontSize: 'clamp(32px, 6vw, 58px)',
            background: 'linear-gradient(135deg, #A78BFA 0%, #7C3AED 40%, #2DD4BF 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>
            India's Students &amp; Builders
          </span>
        </h1>

        {/* Subheadline */}
        <p style={{ fontSize: 'clamp(15px, 2vw, 18px)', textAlign: 'center', color: '#9CA3AF', maxWidth: 520, lineHeight: 1.7, margin: '0 0 16px' }}>
          Your AI-powered companion for academic excellence and startup success — built exclusively for India.
        </p>

        {/* Stats row */}
        <div style={{ display: 'flex', gap: 32, marginBottom: 48, flexWrap: 'wrap', justifyContent: 'center' }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, background: 'linear-gradient(135deg, #A78BFA, #2DD4BF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Role Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 16, width: '100%', maxWidth: 960,
        }}>
          {roleOptions.map((option) => (
            <button
              key={option.title}
              onClick={option.onClick}
              style={{
                position: 'relative', textAlign: 'left', borderRadius: 20,
                padding: 24, cursor: 'pointer',
                background: `linear-gradient(135deg, rgba(16,13,34,0.9) 0%, rgba(22,13,46,0.9) 100%)`,
                backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
                border: `1px solid ${option.borderColor}`,
                boxShadow: `0 4px 24px ${option.glowColor}, 0 0 0 0px transparent`,
                transition: 'all 0.25s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = `0 16px 48px ${option.glowColor}, 0 0 0 1px ${option.borderColor}`;
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = `0 4px 24px ${option.glowColor}`;
              }}
            >
              {option.badge && (
                <span style={{
                  position: 'absolute', top: 14, right: 14,
                  background: 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                  color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                }}>
                  {option.badge}
                </span>
              )}
              <div style={{
                width: 44, height: 44, borderRadius: 12,
                background: `rgba(${option.accentColor === '#2DD4BF' ? '13,148,136' : '124,58,237'}, 0.15)`,
                border: `1px solid ${option.borderColor}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 22, marginBottom: 16,
              }}>
                {option.icon}
              </div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#F5F3FF', marginBottom: 4 }}>{option.title}</div>
              <div style={{ fontSize: 12, color: option.accentColor, marginBottom: 10, fontWeight: 500 }}>{option.subtitle}</div>
              <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.6, marginBottom: 20 }}>{option.description}</p>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 13, fontWeight: 600, color: '#fff',
                background: option.accentColor === '#2DD4BF'
                  ? 'linear-gradient(135deg, #0D9488, #0891B2)'
                  : 'linear-gradient(135deg, #7C3AED, #4F46E5)',
                padding: '8px 16px', borderRadius: 10,
                boxShadow: option.accentColor === '#2DD4BF' ? '0 4px 16px rgba(13,148,136,0.3)' : '0 4px 16px rgba(124,58,237,0.35)',
              }}>
                {option.buttonText} <ArrowRight size={14} />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '60px 20px', background: 'rgba(13, 9, 32, 0.5)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#0D9488', textTransform: 'uppercase', marginBottom: 10 }}>FEATURES</div>
            <h2 style={{ fontSize: 'clamp(24px, 4vw, 34px)', fontWeight: 700, color: '#F5F3FF', maxWidth: 480, margin: '0 auto' }}>
              Everything you need to learn and build in India
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {features.map((feature, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  backdropFilter: 'blur(20px)',
                  border: `1px solid ${feature.accent === 'teal' ? 'rgba(13,148,136,0.25)' : 'rgba(255,255,255,0.07)'}`,
                  borderRadius: 16, padding: 24, position: 'relative',
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = feature.accent === 'teal' ? 'rgba(13,148,136,0.5)' : 'rgba(124,58,237,0.4)';
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = feature.accent === 'teal' ? '0 12px 32px rgba(13,148,136,0.15)' : '0 12px 32px rgba(124,58,237,0.15)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = feature.accent === 'teal' ? 'rgba(13,148,136,0.25)' : 'rgba(255,255,255,0.07)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {feature.badge && (
                  <span style={{
                    position: 'absolute', top: 14, right: 14,
                    background: 'linear-gradient(135deg, #0D9488, #0891B2)',
                    color: '#fff', fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                  }}>
                    {feature.badge}
                  </span>
                )}
                <div style={{
                  width: 40, height: 40, borderRadius: 10, marginBottom: 16,
                  background: feature.accent === 'teal' ? 'rgba(13,148,136,0.12)' : 'rgba(124,58,237,0.12)',
                  border: `1px solid ${feature.accent === 'teal' ? 'rgba(13,148,136,0.3)' : 'rgba(124,58,237,0.3)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {feature.icon}
                </div>
                <div style={{ fontSize: 16, fontWeight: 600, color: '#F5F3FF', marginBottom: 8 }}>{feature.title}</div>
                <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.6 }}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXAMPLE PROMPTS ─────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '60px 20px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <Zap size={16} color="#2DD4BF" />
            <h2 style={{ fontSize: 24, fontWeight: 700, color: '#F5F3FF', margin: 0 }}>See what Learnova can do</h2>
          </div>
          <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 28 }}>Click any prompt to try it instantly</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {prompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handlePromptClick(prompt)}
                style={{
                  fontSize: 13, padding: '9px 18px', borderRadius: 999, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.04)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: '#C4B5FD',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)';
                  e.currentTarget.style.color = '#F5F3FF';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                  e.currentTarget.style.color = '#C4B5FD';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 20px 60px', background: 'rgba(13,9,32,0.4)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 8 }}>
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
              <Star size={14} color="#FBBF24" fill="#FBBF24" />
            </div>
            <p style={{ fontSize: 13, color: '#6B7280' }}>Trusted by students and founders across India</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
            {testimonials.map((t, idx) => (
              <div key={idx} style={{
                background: 'rgba(255,255,255,0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: 16, padding: 24,
              }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{t.emoji}</div>
                <p style={{ fontSize: 13, color: '#C4B5FD', lineHeight: 1.7, fontStyle: 'italic', marginBottom: 16 }}>
                  "{t.quote}"
                </p>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#F5F3FF' }}>{t.name}</div>
                <span style={{
                  display: 'inline-block', marginTop: 6, fontSize: 11, padding: '3px 10px', borderRadius: 999,
                  background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', color: '#A78BFA',
                }}>
                  {t.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ──────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', zIndex: 1, padding: '40px 20px' }}>
        <div style={{
          maxWidth: 640, margin: '0 auto', textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(13,148,136,0.12) 100%)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(124,58,237,0.25)',
          borderRadius: 24, padding: '40px 32px',
          boxShadow: '0 0 60px rgba(124,58,237,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <Shield size={16} color="#2DD4BF" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#2DD4BF', letterSpacing: 2, textTransform: 'uppercase' }}>Free to start</span>
          </div>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 700, color: '#F5F3FF', marginBottom: 12 }}>
            Ready to learn smarter &amp; build faster?
          </h2>
          <p style={{ fontSize: 14, color: '#9CA3AF', marginBottom: 28, lineHeight: 1.6 }}>
            Join 1,000+ students and founders using Learnova AI — no credit card required.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleStudentClick}
              style={{
                fontSize: 14, fontWeight: 600, color: '#fff', padding: '11px 24px', borderRadius: 12,
                background: 'linear-gradient(135deg, #7C3AED, #4F46E5)', border: 'none', cursor: 'pointer',
                boxShadow: '0 4px 20px rgba(124,58,237,0.4)', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.filter = 'brightness(1.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.filter = 'brightness(1)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Start Learning Free
            </button>
            <button
              onClick={handleFounderClick}
              style={{
                fontSize: 14, fontWeight: 600, color: '#2DD4BF', padding: '11px 24px', borderRadius: 12,
                background: 'rgba(13,148,136,0.12)', border: '1px solid rgba(13,148,136,0.35)', cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(13,148,136,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(13,148,136,0.12)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Validate My Idea
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(6,2,16,0.8)', backdropFilter: 'blur(20px)',
        padding: '28px 20px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg, #7C3AED, #0D9488)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700 }}>L</div>
              <span style={{ fontSize: 15, fontWeight: 700, background: 'linear-gradient(135deg, #A78BFA, #2DD4BF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Learnova AI</span>
            </div>
            <p style={{ fontSize: 12, color: '#4B5563' }}>Made with love for India 🇮🇳</p>
          </div>
          <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            {[
              { label: 'Chat', onClick: () => router.push('/chat') },
              { label: 'About', onClick: () => router.push('/about') },
            ].map(link => (
              <button key={link.label} onClick={link.onClick} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#6B7280', transition: 'color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#C4B5FD'; }}
                onMouseLeave={e => { e.currentTarget.style.color = '#6B7280'; }}
              >
                {link.label}
              </button>
            ))}
            <a href="/privacy" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }} onMouseEnter={e => { (e.target as HTMLAnchorElement).style.color = '#C4B5FD'; }} onMouseLeave={e => { (e.target as HTMLAnchorElement).style.color = '#6B7280'; }}>Privacy</a>
            <a href="/terms" style={{ fontSize: 13, color: '#6B7280', textDecoration: 'none' }} onMouseEnter={e => { (e.target as HTMLAnchorElement).style.color = '#C4B5FD'; }} onMouseLeave={e => { (e.target as HTMLAnchorElement).style.color = '#6B7280'; }}>Terms</a>
          </div>
        </div>
        <div style={{ maxWidth: 1100, margin: '16px auto 0', borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 11, color: '#374151' }}>© 2026 Learnova AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div style={{ background: '#060210', minHeight: '100vh' }} />}>
      <LandingContent />
    </Suspense>
  );
}
