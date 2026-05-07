import Link from 'next/link'
import { ArrowLeft, Mail, MapPin } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Hero */}
      <div className="py-16" style={{ backgroundColor: 'var(--accent)' }}>
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Meet the Founder
          </h1>
          <p className="text-lg md:text-xl" style={{ color: 'rgba(255,255,255,0.9)' }}>
            Built in India, for India's students and builders
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="space-y-12">
          {/* Founder Story */}
          <section>
            <h2 className="text-3xl font-bold mb-6 font-heading" style={{ color: 'var(--foreground)' }}>
              The Story Behind Thinkior
            </h2>
            <div className="prose" style={{ color: 'var(--foreground-secondary)' }}>
              <p className="text-lg mb-4">
                <strong style={{ color: 'var(--foreground)' }}>
                  Hi, I'm Salman Memon, and I'm from Gariyaband, Chhattisgarh, India.
                </strong>
              </p>
              
              <p className="mb-4">
                I built Thinkior AI because I lived the problem myself. Growing up in a small town, I saw 
                students around me struggling with:
              </p>

              <ul className="list-disc ml-6 mb-6 space-y-2">
                <li>Expensive coaching classes they couldn't afford</li>
                <li>Generic AI tools that didn't understand Indian exams like UPSC, JEE, or NEET</li>
                <li>No personalized study guidance</li>
                <li>Ideas for local startups but no way to validate them quickly</li>
              </ul>

              <p className="mb-4">
                Every AI tool I tried either cost too much, didn't speak my language, or gave me answers 
                that were too Western — they didn't get the Indian education system, the competition, or 
                the hustle.
              </p>

              <p className="mb-4">
                So I built one that does.
              </p>
            </div>
          </section>

          {/* Mission */}
          <section className="p-6 rounded-xl" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              My Mission
            </h3>
            <p className="text-lg mb-4" style={{ color: 'var(--foreground-secondary)' }}>
              Thinkior is not just another AI wrapper. It's built from the ground up for:
            </p>
            <ul className="space-y-3">
              {[
                { title: 'Indian Students', desc: 'AI that understands UPSC, JEE, NEET, CAT — not just generic study advice' },
                { title: 'Affordable Access', desc: 'Free during beta, and always affordable. Education should not be a luxury.' },
                { title: 'Hindi + English', desc: 'Bilingual support coming soon — AI should speak your language' },
                { title: 'Real Entrepreneurship', desc: 'Tools that help validate startup ideas for local Indian markets' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: 'var(--accent)' }}>
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <div>
                    <strong style={{ color: 'var(--foreground)' }}>{item.title}</strong>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* About the Product */}
          <section>
            <h3 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              What Makes Thinkior Different
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: '🎯',
                  title: 'Exam-Specific AI',
                  desc: 'Not generic study advice. AI trained on Indian exam patterns, syllabi, and question styles.',
                },
                {
                  icon: '💼',
                  title: 'Startup Validation',
                  desc: 'Validate business ideas for the Indian market with structured analysis, not generic AI fluff.',
                },
                {
                  icon: '🎤',
                  title: 'Mock Interviews',
                  desc: 'Practice with AI that asks progressive questions and gives real feedback.',
                },
                {
                  icon: '📅',
                  title: 'Personalized Planning',
                  desc: 'Study plans that adapt to YOUR weak areas, not one-size-fits-all schedules.',
                },
              ].map((item, i) => (
                <div
                  key={i}
                  className="p-6 rounded-lg"
                  style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}
                >
                  <div className="text-4xl mb-3">{item.icon}</div>
                  <h4 className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>{item.title}</h4>
                  <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Beta Honesty */}
          <section className="p-6 rounded-xl" style={{ backgroundColor: 'var(--warning-light)', borderLeft: '4px solid var(--warning)' }}>
            <h3 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              Transparency & Beta Status
            </h3>
            <p className="mb-4" style={{ color: 'var(--foreground-secondary)' }}>
              I'm being upfront: Thinkior is in <strong>public beta</strong>. This means:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-1" style={{ color: 'var(--foreground-secondary)' }}>
              <li>Features may change, break, or be removed</li>
              <li>AI can and does make mistakes — always verify important information</li>
              <li>I'm building this in public, and your feedback shapes what comes next</li>
            </ul>
            <p style={{ color: 'var(--foreground-secondary)' }}>
              I'm not pretending to be a mature product. I'm shipping fast, learning from users, 
              and improving every week. If you want a polished corporate tool, this isn't it yet. 
              But if you want something built by someone who gets your struggle, stick around.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h3 className="text-2xl font-bold mb-6 font-heading" style={{ color: 'var(--foreground)' }}>
              Let's Connect
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h4 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Get in Touch</h4>
                <div className="space-y-3">
                  <a href="mailto:founder@thinkior.ai" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <Mail className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <span style={{ color: 'var(--foreground-secondary)' }}>founder@thinkior.ai</span>
                  </a>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                    <span style={{ color: 'var(--foreground-secondary)' }}>Gariyaband, Chhattisgarh, India</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h4 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Follow the Journey</h4>
                <div className="space-y-3">
                  <a href="#" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <span className="text-lg">𝕏</span>
                    <span style={{ color: 'var(--foreground-secondary)' }}>Twitter (Coming Soon)</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <span className="text-lg">in</span>
                    <span style={{ color: 'var(--foreground-secondary)' }}>LinkedIn (Coming Soon)</span>
                  </a>
                  <a href="#" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                    <span className="text-lg">⌨</span>
                    <span style={{ color: 'var(--foreground-secondary)' }}>GitHub (Coming Soon)</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              Try Thinkior Yourself
            </h3>
            <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
              Free during beta. No credit card required.
            </p>
            <div className="flex gap-4 justify-center">
              <Link
                href="/signup"
                className="px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                Get Started Free
              </Link>
              <Link
                href="/"
                className="px-6 py-3 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
              >
                Back to Home
              </Link>
            </div>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <Link href="/" className="inline-flex items-center gap-2 text-sm hover:underline" style={{ color: 'var(--accent)' }}>
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
