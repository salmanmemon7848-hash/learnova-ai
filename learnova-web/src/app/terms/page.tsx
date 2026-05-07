import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 font-heading" style={{ color: 'var(--foreground)' }}>
          Terms of Service
        </h1>
        
        <p className="text-sm mb-10" style={{ color: 'var(--foreground-muted)' }}>
          Last updated: April 28, 2026
        </p>

        <div className="space-y-10" style={{ color: 'var(--foreground-secondary)' }}>
          {/* Acceptance of Terms */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing or using Thinkior AI ("the Service"), you agree to be bound by these Terms of Service. 
              If you do not agree to these terms, do not use the Service.
            </p>
          </section>

          {/* What Thinkior Is */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              2. What Thinkior Is
            </h2>
            <p>
              Thinkior AI is an AI-powered educational and business tool built for Indian students preparing for 
              competitive exams (UPSC, JEE, NEET, CAT) and young entrepreneurs validating startup ideas.
            </p>
            <p className="mt-3">
              The Service includes:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>AI-powered chat and study assistance</li>
              <li>Exam simulator with AI-generated questions</li>
              <li>Business idea validation and analysis</li>
              <li>Mock interview practice</li>
              <li>Study planning tools</li>
              <li>Pitch deck generation</li>
              <li>Other features we may add over time</li>
            </ul>
          </section>

          {/* Beta Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              3. Beta Disclaimer — Please Read Carefully
            </h2>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--warning-light)', borderLeft: '4px solid var(--warning)' }}>
              <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                Thinkior is currently in public beta.
              </p>
              <ul className="space-y-1 text-sm">
                <li>• Features may change, break, or be removed without notice</li>
                <li>• The Service may contain bugs, errors, or incomplete functionality</li>
                <li>• We are not responsible for decisions made based on AI outputs</li>
                <li>• AI-generated content may contain inaccuracies — always verify important information</li>
                <li>• We expect occasional downtime during updates and improvements</li>
              </ul>
            </div>
            <p className="mt-4">
              By using Thinkior during beta, you acknowledge these limitations and accept that the Service 
              is provided "as-is" without guarantees of reliability or accuracy.
            </p>
          </section>

          {/* Acceptable Use */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              4. Acceptable Use
            </h2>
            <p className="mb-3">You may use Thinkior for:</p>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li>Studying and exam preparation</li>
              <li>Business idea validation and planning</li>
              <li>Interview practice</li>
              <li>Personal learning and skill development</li>
              <li>Any lawful educational or entrepreneurial purpose</li>
            </ul>

            <p className="mb-3 mt-6">You may NOT:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Use the Service for any illegal purpose</li>
              <li>Attempt to reverse engineer, hack, or exploit the Service</li>
              <li>Use automated systems (bots, scrapers) to access the Service without permission</li>
              <li>Share your account credentials with others</li>
              <li>Use the AI to generate harmful, offensive, misleading, or malicious content</li>
              <li>Attempt to extract or copy our AI prompts, algorithms, or proprietary systems</li>
              <li>Overload the Service with excessive requests (rate limiting applies)</li>
            </ul>
          </section>

          {/* AI Limitations */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              5. AI Limitations — Important
            </h2>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--error-light)', borderLeft: '4px solid var(--error)' }}>
              <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                AI-generated content is NOT professional advice.
              </p>
            </div>
            <p className="mt-4">
               Thinkior uses artificial intelligence to generate:
             </p>
            <ul className="list-disc ml-6 mt-2 mb-4 space-y-1">
              <li>Study plans and recommendations</li>
              <li>Exam questions and explanations</li>
              <li>Business idea analyses</li>
              <li>Interview questions and feedback</li>
              <li>Pitch deck content</li>
              <li>General responses to your queries</li>
            </ul>
            <p className="mb-3">
              <strong>AI can and does make mistakes.</strong> You should:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li>Always verify important information from multiple sources</li>
              <li>Not rely solely on AI for critical exam preparation — use official textbooks and resources</li>
              <li>Conduct your own market research before making business decisions</li>
              <li>Not treat AI content as professional legal, financial, medical, or academic advice</li>
              <li>Use your judgment and common sense when evaluating AI outputs</li>
            </ul>
            <p style={{ color: 'var(--foreground-muted)' }}>
              We strive for accuracy, but we cannot guarantee that AI-generated content is error-free, 
              complete, or suitable for your specific needs.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              6. Ownership and Intellectual Property
            </h2>
            <p className="mb-3">
              Content you create using Thinkior (study plans, business analyses, pitch decks, etc.) belongs to you. 
              However, the Service itself and its underlying technology are protected:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Thinkior's code, algorithms, and technical infrastructure</li>
              <li>Thinkior's branding, logo, design, and visual identity</li>
            </ul>
          </section>

          {/* Account Termination */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              7. Account Termination
            </h2>
            <p className="mb-3">
              We reserve the right to suspend or terminate your access to the Service if:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li>You violate these Terms of Service</li>
              <li>You engage in abusive, harmful, or illegal behavior</li>
              <li>You attempt to exploit or abuse the Service</li>
              <li>Law enforcement or legal requirements demand it</li>
            </ul>
            <p>
              We will make reasonable efforts to notify you before termination, except in cases of severe violations 
              or legal requirements.
            </p>
          </section>

          {/* Liability Limitation */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              8. Limitation of Liability
            </h2>
            <p className="mb-3">
              Thinkior AI is provided "AS-IS" during the beta phase. To the maximum extent permitted by law:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li>We make no warranties, express or implied, about the Service's reliability, accuracy, or fitness for a particular purpose</li>
              <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages</li>
              <li>We are not responsible for exam results, business outcomes, or decisions made based on AI outputs</li>
              <li>We are not liable for service interruptions, data loss, or technical issues</li>
              <li>Our total liability shall not exceed the amount you have paid us (which, during beta, is ₹0)</li>
            </ul>
            <p style={{ color: 'var(--foreground-muted)' }}>
              You use Thinkior at your own risk. We strongly encourage you to verify important information independently.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              9. Governing Law
            </h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of India. 
              Any disputes arising from these Terms or your use of the Service shall be subject to the 
              exclusive jurisdiction of the courts in Chhattisgarh, India.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              10. Changes to These Terms
            </h2>
            <p>
              We may modify these Terms at any time. We will notify users of material changes by:
            </p>
            <ul className="list-disc ml-6 mt-3 mb-6 space-y-1">
              <li>Posting an announcement on the homepage</li>
              <li>Updating the "Last updated" date at the top of this page</li>
              <li>Email notification (if you've opted in to communications)</li>
            </ul>
            <p>
              Your continued use of the Service after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              11. Contact Us
            </h2>
            <p className="mb-3">
              For questions about these Terms of Service, contact us:
            </p>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="mb-1"><strong>Email:</strong>{' '}
                <a href="mailto:legal@thinkior.ai" className="hover:underline" style={{ color: 'var(--accent)' }}>
                   legal@thinkior.ai
                 </a>
              </p>
              <p><strong>Location:</strong> Gariyaband, Chhattisgarh, India</p>
            </div>
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
