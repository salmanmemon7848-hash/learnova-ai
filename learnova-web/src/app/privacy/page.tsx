import Link from 'next/link'

export default function PrivacyPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Plain English Summary */}
      <div className="py-12" style={{ backgroundColor: 'var(--accent)' }}>
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#ffffff' }}>
            Privacy Policy
          </h1>
          <div className="p-4 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <p className="text-sm md:text-base" style={{ color: '#ffffff' }}>
              <strong>In plain terms:</strong> We collect your email to create your account and your AI conversations to power the product. 
              We don't sell your data and you can delete your account anytime.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-sm mb-8" style={{ color: 'var(--foreground-muted)' }}>
          Last updated: April 28, 2026
        </p>

        <div className="space-y-10" style={{ color: 'var(--foreground-secondary)' }}>
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              1. Introduction
            </h2>
            <p className="mb-3">
              Learnova AI ("we," "our," or "us") is an AI-powered educational and business tool built for Indian students and entrepreneurs. 
              This privacy policy explains what data we collect, how we use it, and your rights regarding your data.
            </p>
            <p>
              This policy applies to all Learnova services, including our website, AI chat, exam simulator, business validator, 
              and any other features we offer. By using Learnova, you agree to the practices described in this policy.
            </p>
          </section>

          {/* What Data We Collect */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              2. What Data We Collect
            </h2>
            
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Account Data</h3>
            <p className="mb-4">
              If you create an account (via Google sign-in or email), we collect:
            </p>
            <ul className="list-disc ml-6 mb-6 space-y-1">
              <li>Your name</li>
              <li>Your email address</li>
              <li>Authentication tokens (to keep you logged in)</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>AI Inputs and Conversations</h3>
            <p className="mb-4">
              When you interact with our AI features (chat, exam simulator, business validator, etc.), we collect:
            </p>
            <ul className="list-disc ml-6 mb-6 space-y-1">
              <li>The text you type (questions, prompts, answers)</li>
              <li>AI-generated responses</li>
              <li>Session metadata (timestamps, feature used)</li>
            </ul>
            <p className="mb-4" style={{ color: 'var(--foreground-muted)' }}>
              <strong>Important:</strong> We do NOT permanently store your AI conversations in our database. 
              Conversations are processed in real-time and may be temporarily cached for performance, but we don't build a permanent record of what you ask.
            </p>

            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Usage Data</h3>
            <p className="mb-4">
              We may collect anonymous usage data to improve the product:
            </p>
            <ul className="list-disc ml-6 mb-6 space-y-1">
              <li>Pages visited and features used</li>
              <li>Time spent on the platform</li>
              <li>Device type and browser (for compatibility testing)</li>
            </ul>
            <p className="mb-4" style={{ color: 'var(--foreground-muted)' }}>
              This data is anonymous and cannot be traced back to individual users.
            </p>

            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Cookies</h3>
            <p className="mb-4">
              We use cookies for:
            </p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Authentication:</strong> To keep you logged in (session cookies)</li>
              <li><strong>Theme preference:</strong> To remember your light/dark mode choice</li>
              <li><strong>Demo limit:</strong> To track your free demo usage (24-hour cookie)</li>
            </ul>
          </section>

          {/* How We Use Your Data */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              3. How We Use Your Data
            </h2>
            <p className="mb-3">We use your data to:</p>
            <ul className="list-disc ml-6 mb-6 space-y-1">
              <li>Create and maintain your account</li>
              <li>Process your AI queries and generate responses</li>
              <li>Improve the product based on usage patterns</li>
              <li>Send you product updates (only if you opt in — we won't spam you)</li>
              <li>Debug issues and prevent abuse</li>
            </ul>
          </section>

          {/* What We Do NOT Do */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              4. What We Do NOT Do
            </h2>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--success-light)', borderLeft: '4px solid var(--success)' }}>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>We do <strong>NOT</strong> sell your data to anyone</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>We do <strong>NOT</strong> share your data with advertisers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>We do <strong>NOT</strong> use your conversations to train third-party AI models</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>We do <strong>NOT</strong> monetize your personal information</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              5. Third-Party Services We Use
            </h2>
            <p className="mb-4">
              Learnova relies on several third-party services to function. Each has its own privacy policy:
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h4 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Supabase (Authentication & Database)</h4>
                <p className="text-sm">Handles user sign-in and stores minimal account data.</p>
                <a href="https://supabase.com/privacy" className="text-sm hover:underline" style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">
                  Supabase Privacy Policy →
                </a>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h4 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Google AI (AI Processing)</h4>
                <p className="text-sm">Processes your AI queries and generates responses.</p>
                <a href="https://policies.google.com/privacy" className="text-sm hover:underline" style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">
                  Google Privacy Policy →
                </a>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h4 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Vercel (Hosting)</h4>
                <p className="text-sm">Hosts our website and may collect server logs.</p>
                <a href="https://vercel.com/legal/privacy-policy" className="text-sm hover:underline" style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">
                  Vercel Privacy Policy →
                </a>
              </div>

              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h4 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Google OAuth (Optional Sign-In)</h4>
                <p className="text-sm">If you sign in with Google, they provide your name and email.</p>
                <a href="https://policies.google.com/privacy" className="text-sm hover:underline" style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">
                  Google Privacy Policy →
                </a>
              </div>
            </div>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              6. Data Retention & Deletion
            </h2>
            <p className="mb-3">
              <strong>How long we keep your data:</strong>
            </p>
            <ul className="list-disc ml-6 mb-6 space-y-1">
              <li>Account data: Until you delete your account</li>
              <li>AI conversations: Not permanently stored (processed in real-time)</li>
              <li>Usage analytics: Aggregated and anonymized after 90 days</li>
              <li>Cookies: As specified in Section 2 (session to 24 hours)</li>
            </ul>

            <p className="mb-3">
              <strong>How to delete your data:</strong>
            </p>
            <p className="mb-3">
              You can request full deletion of your account and all associated data by emailing us at:{' '}
              <a href="mailto:privacy@learnova.ai" className="hover:underline" style={{ color: 'var(--accent)' }}>
                privacy@learnova.ai
              </a>
            </p>
            <p style={{ color: 'var(--foreground-muted)' }}>
              We will process deletion requests within 30 days.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              7. Your Rights
            </h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc ml-6 mb-6 space-y-1">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Ask us to correct inaccurate data</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Get your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from any communications</li>
            </ul>
            <p>
              To exercise these rights, contact:{' '}
              <a href="mailto:privacy@learnova.ai" className="hover:underline" style={{ color: 'var(--accent)' }}>
                privacy@learnova.ai
              </a>
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              8. Children's Privacy
            </h2>
            <p>
              Learnova is not directed at children under 13 years of age. We do not knowingly collect personal 
              information from children under 13. If we learn that we have collected data from a child under 13, 
              we will delete it promptly. If you believe we have such data, please contact us.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              9. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time as we improve the product or change our practices. 
              When we make significant changes, we will notify users by:
            </p>
            <ul className="list-disc ml-6 mt-3 mb-6 space-y-1">
              <li>Posting an announcement on the homepage</li>
              <li>Updating the "Last updated" date at the top of this page</li>
              <li>Email notification (if you've opted in to communications)</li>
            </ul>
            <p style={{ color: 'var(--foreground-muted)' }}>
              Your continued use of Learnova after changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              10. Contact Us
            </h2>
            <p className="mb-3">
              If you have questions about this Privacy Policy or our data practices, contact us:
            </p>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="mb-1"><strong>Email:</strong>{' '}
                <a href="mailto:privacy@learnova.ai" className="hover:underline" style={{ color: 'var(--accent)' }}>
                  privacy@learnova.ai
                </a>
              </p>
              <p><strong>Address:</strong> Gariyaband, Chhattisgarh, India</p>
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
