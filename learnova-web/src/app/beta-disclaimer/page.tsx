import Link from 'next/link'

export default function BetaDisclaimerPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8" style={{ color: 'var(--foreground)' }}>
          Beta Disclaimer
        </h1>
        
        <div className="space-y-6" style={{ color: 'var(--foreground-secondary)' }}>
          <p className="text-sm">Last updated: April 28, 2026</p>
          
          <div className="p-4 rounded-lg border-l-4" style={{ backgroundColor: 'var(--warning-light)', borderColor: 'var(--warning)' }}>
            <p className="font-semibold" style={{ color: 'var(--foreground)' }}>
              Important: Learnova AI is currently in beta testing phase.
            </p>
          </div>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              What "Beta" Means
            </h2>
            <p>
              Learnova AI is a work in progress. We are actively developing, testing, and improving the 
              platform. While we strive to provide a high-quality experience, you should expect:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Occasional bugs, errors, or unexpected behavior</li>
              <li>Features that may change, be added, or be removed</li>
              <li>Performance improvements over time</li>
              <li>Incomplete or placeholder content in some areas</li>
              <li>Potential downtime during updates or maintenance</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              AI-Generated Content Accuracy
            </h2>
            <p>
              Learnova AI uses artificial intelligence to generate:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Study plans and recommendations</li>
              <li>Exam questions and explanations</li>
              <li>Business idea analyses</li>
              <li>Interview questions and feedback</li>
              <li>Pitch deck content</li>
              <li>General responses to your queries</li>
            </ul>
            <p className="mt-2">
              <strong>AI can make mistakes.</strong> Always verify critical information from multiple sources, 
              especially for:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Exam preparation (cross-reference with official syllabus and textbooks)</li>
              <li>Business decisions (conduct your own market research)</li>
              <li>Important academic or career choices</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Free to Use
            </h2>
            <p>
              During the beta phase, Learnova AI is completely free to use. We may introduce paid features 
              in the future, but:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Existing free features will remain accessible</li>
              <li>We will communicate clearly about any pricing changes</li>
              <li>Early beta users may receive special offers when we launch paid tiers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Data and Privacy During Beta
            </h2>
            <p>
              As we test and improve the platform, we may:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Reset or clear user data during major updates</li>
              <li>Change how data is stored or processed</li>
              <li>Experiment with new features that use your data differently</li>
            </ul>
            <p className="mt-2">
              We will always follow our{' '}
              <Link href="/privacy" className="text-blue-600 hover:underline">
                Privacy Policy
              </Link>{' '}
              and notify you of significant changes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Your Feedback Matters
            </h2>
            <p>
              Beta testing is a collaborative process. We encourage you to:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Report bugs or issues you encounter</li>
              <li>Suggest new features or improvements</li>
              <li>Share your experience (positive or negative)</li>
              <li>Tell us what works and what doesn't</li>
            </ul>
            <p className="mt-2">
              Your feedback directly shapes the future of Learnova AI.
              <br />
              Contact:{' '}
              <a href="mailto:feedback@learnova.ai" className="text-blue-600 hover:underline">
                feedback@learnova.ai
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              No Guarantees
            </h2>
            <p>
              While we are committed to building a valuable platform, we cannot guarantee:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Specific exam results or academic outcomes</li>
              <li>Business success from using our idea validation tools</li>
              <li>100% accuracy of AI-generated content</li>
              <li>Continuous uptime or availability</li>
              <li>That beta features will remain unchanged</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-3" style={{ color: 'var(--foreground)' }}>
              Building in Public
            </h2>
            <p>
              Learnova AI was built by Salman Memon from Gariyaband, Chhattisgarh, India. This is an 
              independent project built with passion for Indian students and entrepreneurs. I'm building 
              this platform in public and sharing the journey openly.
            </p>
            <p className="mt-2">
              Thank you for being an early user and helping shape Learnova AI into something great.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t" style={{ borderColor: 'var(--border)' }}>
          <Link href="/" className="text-sm hover:underline" style={{ color: 'var(--accent)' }}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
