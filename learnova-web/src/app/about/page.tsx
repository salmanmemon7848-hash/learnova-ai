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
            Built in India, for India&apos;s students and builders
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
                  Hi, I&apos;m Salman Memon, and I&apos;m from Gariyaband, Chhattisgarh, India.
                </strong>
              </p>

              <p className="mb-4">
                I built Thinkior AI because I lived the problem myself. Growing up in a small town, I saw
                students around me struggling with:
              </p>

              <ul className="list-disc ml-6 mb-6 space-y-2">
                <li>Expensive coaching classes they could not afford</li>
                <li>Generic AI tools that did not understand Indian exams like UPSC, JEE, or NEET</li>
                <li>No personalized study guidance that matched the Indian curriculum</li>
                <li>Ideas for local startups with no way to quickly validate them</li>
              </ul>

              <p className="mb-4">
                Every AI tool I tried either cost too much, did not speak my language, or gave me answers
                that were too generic — they did not understand the Indian education system, the real
                competition, or the unique challenges of building in India.
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
              Thinkior is not just another AI tool. It is built from the ground up for India.
            </p>
            <ul className="space-y-3">
              {[
                { title: '✅ Indian Students', desc: 'AI that deeply understands UPSC, JEE, NEET, CAT, and all state boards — not generic study advice.' },
                { title: '✅ Affordable Access', desc: 'Free to start, always affordable. Quality education and business tools should not be a luxury.' },
                { title: '✅ Hindi + English + Hinglish', desc: 'Multilingual support built in. AI should speak your language.' },
                { title: '✅ Real Entrepreneurship', desc: 'Tools that help validate startup ideas specifically for Indian markets — not Western templates applied to Indian problems.' },
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div>
                    <strong style={{ color: 'var(--foreground)' }}>{item.title}</strong>
                    <p className="text-sm" style={{ color: 'var(--foreground-muted)' }}>{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* What Makes Thinkior Different */}
          <section>
            <h3 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              What Makes Thinkior Different
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                {
                  icon: '🎯',
                  title: 'Exam-Specific Intelligence',
                  desc: 'Not generic study advice. AI that understands Indian exam patterns, official syllabi, NCERT content, and question styles for JEE, NEET, UPSC, CAT, and more.',
                },
                {
                  icon: '💼',
                  title: 'Business Intelligence for India',
                  desc: 'Validate business ideas, research competitors, and generate startup content tailored to the Indian market — with live web research and real market data.',
                },
                {
                  icon: '🎤',
                  title: 'Voice Mock Interviews',
                  desc: 'Practice with an AI interviewer that asks progressive questions, gives strict honest feedback, and supports English, Hindi, and Hinglish — just like a real Indian interview.',
                },
                {
                  icon: '📅',
                  title: 'Personalized Study Planning',
                  desc: 'Study plans that adapt to your weak areas, available time, and exam date — not one-size-fits-all schedules.',
                },
                {
                  icon: '🔍',
                  title: 'Competitor Research',
                  desc: 'Deep competitive analysis for founders — find out who your competitors are, what they are missing, and where your opportunity lies.',
                },
                {
                  icon: '🎓',
                  title: 'Career Guidance',
                  desc: 'Personalized career recommendations based on your interests, strengths, and goals — with real Indian college names, salary data, and exam requirements.',
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

          {/* Built With Purpose */}
          <section className="p-6 rounded-xl" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
            <h3 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              Built With Purpose
            </h3>
            <p className="mb-4" style={{ color: 'var(--foreground-secondary)' }}>
              Thinkior is built by a solo developer who understands the Indian student and founder experience firsthand. Every feature is designed with one question in mind: does this actually help someone in Gariyaband, or Jaipur, or Patna — not just someone in Bangalore or Delhi?
            </p>
            <p style={{ color: 'var(--foreground-secondary)' }}>
              If you want a polished corporate product with a large team behind it, there are other options. If you want something built by someone who genuinely understands your struggle and is working every day to make it better — you are in the right place.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h3 className="text-2xl font-bold mb-6 font-heading" style={{ color: 'var(--foreground)' }}>
              Let&apos;s Connect
            </h3>
            <div className="p-6 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <h4 className="font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Get in touch, share feedback, or just say hello:</h4>
              <div className="space-y-3">
                <a href="mailto:thinkior.ai@gmail.com" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                  <Mail className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <span style={{ color: 'var(--foreground-secondary)' }}>thinkior.ai@gmail.com</span>
                </a>
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5" style={{ color: 'var(--accent)' }} />
                  <span style={{ color: 'var(--foreground-secondary)' }}>Gariyaband, Chhattisgarh, India</span>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center py-8">
            <h3 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              Try Thinkior AI
            </h3>
            <p className="mb-6" style={{ color: 'var(--foreground-muted)' }}>
              Free to start. No credit card required.
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
