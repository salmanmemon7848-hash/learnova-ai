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
              <strong>In plain terms:</strong> We collect your email to create your account and process your inputs to power the AI features.
              We do not sell your data. You can request deletion of your account and all associated data at any time.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        <p className="text-sm mb-8" style={{ color: 'var(--foreground-muted)' }}>
          Last updated: May 9, 2026
        </p>

        <div className="space-y-10" style={{ color: 'var(--foreground-secondary)' }}>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              1. Introduction
            </h2>
            <p className="mb-3">
              Learnova AI (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is an AI-powered educational and business platform built for Indian students and entrepreneurs. This Privacy Policy explains what personal data we collect, why we collect it, how we use it, who we share it with, and what your rights are regarding your data.
            </p>
            <p className="mb-3">
              This Policy applies to all Learnova services including our website, AI chat, exam simulator, doubt solver, mock interview, career guide, business validator, competitor research, and all other features.
            </p>
            <p>
              By using Learnova AI, you agree to the collection and use of information as described in this Privacy Policy. If you do not agree, please do not use the Service. We operate from Gariyaband, Chhattisgarh, India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              2. Data We Collect
            </h2>

            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>2.1 Account Data</h3>
            <p className="mb-4">When you create an account (via Google Sign-In or email), we collect:</p>
            <ul className="list-disc ml-6 mb-6 space-y-1">
              <li>Your name</li>
              <li>Your email address</li>
              <li>Profile information provided by Google OAuth (if applicable)</li>
              <li>Authentication tokens to maintain your session</li>
              <li>Account creation timestamp</li>
              <li>User role preference (Student or Founder)</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>2.2 Content You Submit</h3>
            <p className="mb-4">When you use our AI features, we collect and temporarily process:</p>
            <ul className="list-disc ml-6 mb-6 space-y-1">
              <li>Text you type including questions, prompts, study topics, and business ideas</li>
              <li>Images you upload or capture in the Doubt Solver feature</li>
              <li>Audio recordings created during Mock Interview voice sessions</li>
              <li>Form inputs including exam preferences, career interests, and business details</li>
              <li>Conversation history within your session</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>2.3 Usage and Activity Data</h3>
            <p className="mb-4">We collect data about how you use the Service to improve it and provide personalized features:</p>
            <ul className="list-disc ml-6 mb-6 space-y-1">
              <li>Features accessed and actions taken</li>
              <li>Practice test results and scores</li>
              <li>Study session duration and frequency</li>
              <li>Usage counts for rate limiting purposes</li>
              <li>Timestamps of activities</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>2.4 Technical Data</h3>
            <p className="mb-4">We automatically collect certain technical information:</p>
            <ul className="list-disc ml-6 mb-6 space-y-1">
              <li>Device type and operating system</li>
              <li>Browser type and version</li>
              <li>IP address (used for abuse prevention and rate limiting)</li>
              <li>Referring URLs</li>
              <li>Error logs for debugging</li>
            </ul>

            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>2.5 Cookies and Local Storage</h3>
            <p className="mb-4">We use cookies and local storage for:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li><strong>Authentication</strong> — keeping you securely logged in</li>
              <li><strong>User preferences</strong> — remembering your settings</li>
              <li><strong>Session management</strong> — maintaining your current session state</li>
              <li><strong>Rate limit tracking</strong> — managing your usage within permitted limits</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              3. How We Use Your Data
            </h2>
            <p className="mb-3">We use collected data for the following purposes:</p>
            <ul className="list-disc ml-6 mb-6 space-y-1">
              <li><strong>To provide the Service</strong> — processing your queries through AI systems and returning responses</li>
              <li><strong>Account management</strong> — creating, maintaining, and authenticating your account</li>
              <li><strong>Personalization</strong> — remembering your preferences, progress, and history to improve your experience</li>
              <li><strong>Safety and security</strong> — detecting abuse, enforcing rate limits, and preventing unauthorized access</li>
              <li><strong>Product improvement</strong> — understanding how features are used to make the Service better</li>
              <li><strong>Communication</strong> — sending important service notifications and updates (not marketing unless you opt in)</li>
              <li><strong>Legal compliance</strong> — meeting our obligations under applicable Indian law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              4. How We Share Your Data
            </h2>
            <p className="mb-4">We do not sell your personal data. We do not share your data with advertisers. We share data with third parties only as described below.</p>

            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>4.1 AI Processing Services</h3>
            <p className="mb-4">Your text inputs, questions, and prompts are sent to AI processing services to generate responses:</p>
            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h4 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Groq API</h4>
                <p className="text-sm mb-1">Processes text-based AI queries for most features.</p>
                <a href="https://groq.com/privacy" className="text-sm hover:underline" style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">
                  Groq Privacy Policy →
                </a>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h4 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Google Gemini API</h4>
                <p className="text-sm mb-1">Processes image inputs in the Doubt Solver feature and serves as a fallback AI provider.</p>
                <a href="https://policies.google.com/privacy" className="text-sm hover:underline" style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">
                  Google Privacy Policy →
                </a>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>4.2 Voice Processing</h3>
            <p className="mb-4">Audio recorded during Mock Interview voice sessions is transmitted to Groq Whisper API for speech-to-text transcription and Google Gemini API as a fallback processor. Audio is processed in real time and is not permanently stored by us beyond the duration of your session.</p>

            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>4.3 Web Search</h3>
            <p className="mb-4">When features require current information from the internet, your queries are processed by our self-hosted SearXNG search engine instance hosted on Render. SearXNG is an open-source, privacy-respecting metasearch engine that we operate and control.</p>

            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>4.4 Infrastructure Services</h3>
            <div className="space-y-4 mb-6">
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h4 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Supabase (Authentication &amp; Database)</h4>
                <p className="text-sm mb-1">Provides our database, authentication, and backend infrastructure. Account data and activity logs are stored in Supabase.</p>
                <a href="https://supabase.com/privacy" className="text-sm hover:underline" style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">
                  Supabase Privacy Policy →
                </a>
              </div>
              <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
                <h4 className="font-semibold mb-1" style={{ color: 'var(--foreground)' }}>Vercel (Hosting)</h4>
                <p className="text-sm mb-1">Hosts our application and may collect server access logs.</p>
                <a href="https://vercel.com/legal/privacy-policy" className="text-sm hover:underline" style={{ color: 'var(--accent)' }} target="_blank" rel="noopener noreferrer">
                  Vercel Privacy Policy →
                </a>
              </div>
            </div>

            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>4.5 Legal Requirements</h3>
            <p>We may disclose your data if required by law, court order, or a legitimate request from Indian law enforcement or government authorities, to the extent required by applicable law.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              5. Data We Do NOT Collect or Share
            </h2>
            <div className="p-4 rounded-lg mb-4" style={{ backgroundColor: 'var(--success-light)', borderLeft: '4px solid var(--success)' }}>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>We do <strong>NOT</strong> sell your personal data to any third party</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>We do <strong>NOT</strong> share your data with advertisers or advertising networks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>We do <strong>NOT</strong> build or sell user profiles for marketing purposes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>We do <strong>NOT</strong> permanently store your audio recordings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span style={{ color: 'var(--success)' }}>✓</span>
                  <span>We do <strong>NOT</strong> permanently store images you upload beyond your active session</span>
                </li>
              </ul>
            </div>
            <p style={{ color: 'var(--foreground-muted)' }}>
              <strong>Important note regarding AI training:</strong> We do not use your data to train our own AI models. However, third-party AI providers (Groq, Google) may process your inputs according to their own terms and privacy policies. We encourage you to review those policies directly.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              6. Data Retention
            </h2>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr style={{ backgroundColor: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--foreground)' }}>Data Type</th>
                    <th className="text-left p-3 font-semibold" style={{ color: 'var(--foreground)' }}>Retention Period</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ['Account data (name, email)', 'Until you delete your account'],
                    ['Activity logs and usage history', '12 months from creation'],
                    ['Practice test results and scores', 'Until you delete your account'],
                    ['Saved files and documents', 'Until you delete your account or the file'],
                    ['Audio recordings (voice interviews)', 'Not stored — processed in real time only'],
                    ['Uploaded images (doubt solver)', 'Not stored — processed in real time only'],
                    ['Anonymous usage analytics', 'Aggregated and anonymized after 90 days'],
                    ['Server access logs', '30 days'],
                    ['IP addresses for abuse prevention', '90 days'],
                  ].map(([type, period], i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="p-3">{type}</td>
                      <td className="p-3" style={{ color: 'var(--foreground-muted)' }}>{period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p>
              When you delete your account, we will delete or anonymize all personal data associated with your account within 30 days of your deletion request.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              7. Data Security
            </h2>
            <p className="mb-3">We implement reasonable technical and organizational measures to protect your data including:</p>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li>HTTPS encryption for all data in transit</li>
              <li>Row-level security policies in our database ensuring users can only access their own data</li>
              <li>API key security — all third-party API keys are stored as server-side environment variables and never exposed to the browser</li>
              <li>Authentication via Supabase&apos;s secure authentication system</li>
              <li>Input validation and sanitization to prevent injection attacks</li>
              <li>Rate limiting to prevent abuse</li>
            </ul>
            <p style={{ color: 'var(--foreground-muted)' }}>
              However, no system is completely secure. We cannot guarantee absolute security of your data. In the event of a data breach that affects your personal data, we will notify affected users as required by applicable Indian law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              8. Your Rights Under Indian Law
            </h2>
            <p className="mb-3">Under the Information Technology Act 2000, the IT (Reasonable Security Practices) Rules 2011, and the Digital Personal Data Protection Act 2023, you have the following rights:</p>
            <ul className="list-disc ml-6 mb-6 space-y-1">
              <li><strong>Right to Access</strong> — Request a copy of the personal data we hold about you</li>
              <li><strong>Right to Correction</strong> — Request correction of inaccurate or incomplete personal data</li>
              <li><strong>Right to Deletion</strong> — Request deletion of your personal data and account</li>
              <li><strong>Right to Data Portability</strong> — Request your data in a portable, machine-readable format</li>
              <li><strong>Right to Withdraw Consent</strong> — Withdraw consent for data processing where processing is based on consent</li>
              <li><strong>Right to Grievance Redressal</strong> — Lodge a complaint regarding our data practices</li>
            </ul>
            <p>
              To exercise any of these rights, contact us at:{' '}
              <a href="mailto:learnova.ai@gmail.com" className="hover:underline" style={{ color: 'var(--accent)' }}>
                learnova.ai@gmail.com
              </a>
            </p>
            <p className="mt-2">We will respond to your request within 30 days. We may ask you to verify your identity before processing your request.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              9. Children&apos;s Privacy
            </h2>
            <p className="mb-3"><strong>Minimum Age:</strong> You must be at least 13 years old to use Learnova AI.</p>
            <p className="mb-3">
              We recognize that many of our users are students between the ages of 13 and 18. For users under 18, we recommend parental awareness and involvement in their use of the Service.
            </p>
            <p>
              We do not knowingly collect personal data from children under 13. If we become aware that we have collected personal data from a child under 13 without verifiable parental consent, we will delete that data promptly. If you are a parent or guardian and believe your child under 13 has created an account, please contact us immediately at{' '}
              <a href="mailto:learnova.ai@gmail.com" className="hover:underline" style={{ color: 'var(--accent)' }}>
                learnova.ai@gmail.com
              </a>{' '}
              and we will delete the account within 5 business days.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              10. International Data Transfers
            </h2>
            <p>
              Learnova AI operates from India. However, the third-party services we use (Groq, Google, Vercel, Supabase) may process your data on servers located outside India including in the United States and European Union. By using Learnova, you consent to this international transfer of data as necessary to provide the Service. We ensure that such transfers are made only to services with adequate data protection policies.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              11. Changes to This Policy
            </h2>
            <p>We may update this Privacy Policy periodically. When we make material changes, we will:</p>
            <ul className="list-disc ml-6 mt-3 mb-6 space-y-1">
              <li>Post a prominent notice on our homepage</li>
              <li>Update the &quot;Last updated&quot; date at the top of this page</li>
              <li>Send an email notification to registered users where reasonably practicable</li>
            </ul>
            <p style={{ color: 'var(--foreground-muted)' }}>
              Your continued use of Learnova after changes are posted constitutes acceptance of the updated Policy. If you do not agree to the updated Policy, please stop using the Service and request deletion of your account.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              12. Contact and Grievance Officer
            </h2>
            <p className="mb-3">
              For questions, concerns, data requests, or to lodge a complaint about our privacy practices:
            </p>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="mb-1"><strong>Email:</strong>{' '}
                <a href="mailto:learnova.ai@gmail.com" className="hover:underline" style={{ color: 'var(--accent)' }}>
                  learnova.ai@gmail.com
                </a>
              </p>
              <p className="mb-1"><strong>Address:</strong> Gariyaband, Chhattisgarh, India</p>
              <p><strong>Response time:</strong> Within 30 days of receipt</p>
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
