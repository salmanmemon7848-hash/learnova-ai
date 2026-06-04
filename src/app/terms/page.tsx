import Link from 'next/link'

export default function TermsPage() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8 font-heading" style={{ color: 'var(--foreground)' }}>
          Terms of Service
        </h1>
        <p className="text-sm mb-10" style={{ color: 'var(--foreground-muted)' }}>
          Last updated: May 9, 2026
        </p>

        <div className="space-y-10" style={{ color: 'var(--foreground-secondary)' }}>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              1. Acceptance of Terms
            </h2>
            <p className="mb-3">
              By accessing or using Learnova AI (&quot;the Service,&quot; &quot;Learnova,&quot; &quot;we,&quot; &quot;our,&quot; or &quot;us&quot;), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use the Service. Your continued use of Learnova constitutes your acceptance of these terms.
            </p>
            <p>
              These Terms constitute a legally binding agreement between you and the individual developer operating Learnova AI, located in Gariyaband, Chhattisgarh, India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              2. What Learnova AI Is
            </h2>
            <p className="mb-3">
              Learnova AI is an AI-powered educational and business intelligence platform built exclusively for Indian students and entrepreneurs. The Service includes:
            </p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>AI-powered study assistance and doubt solving</li>
              <li>Exam practice and simulation for competitive exams including JEE, NEET, UPSC, CAT, CLAT, and board examinations</li>
              <li>Business idea validation and competitor research</li>
              <li>Mock interview practice including voice-based interview simulation</li>
              <li>Personalized study planning</li>
              <li>Career guidance and counseling</li>
              <li>AI writing assistance</li>
              <li>Institution discovery (EduFinder)</li>
              <li>Any additional features we may introduce over time</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              3. Eligibility and Age Requirements
            </h2>
            <p className="mb-3">You must be at least 13 years of age to use Learnova AI.</p>
            <p className="mb-3">
              If you are between 13 and 18 years of age, you represent that your parent or legal guardian has reviewed and agreed to these Terms on your behalf. By using this Service, you confirm that either you are 18 or older, or that you have obtained parental or guardian consent.
            </p>
            <p>
              We do not knowingly collect personal data from children under 13. If we discover that a user is under 13, we will delete their account and all associated data immediately. If you believe a child under 13 has created an account, please notify us at{' '}
              <a href="mailto:learnova.ai@gmail.com" className="hover:underline" style={{ color: 'var(--accent)' }}>learnova.ai@gmail.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              4. Acceptable Use
            </h2>
            <p className="mb-3">You may use Learnova for:</p>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li>Studying, exam preparation, and academic learning</li>
              <li>Business idea validation and startup planning</li>
              <li>Interview preparation and career development</li>
              <li>Personal skill development and learning</li>
              <li>Any lawful educational or entrepreneurial purpose</li>
            </ul>
            <p className="mb-3 mt-6">You may NOT:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Use the Service for any illegal, harmful, or fraudulent purpose</li>
              <li>Attempt to reverse engineer, decompile, disassemble, or exploit the Service or its underlying systems</li>
              <li>Use automated systems, bots, scripts, or scrapers to access the Service without prior written permission</li>
              <li>Share your account credentials with others or create accounts for third parties without authorization</li>
              <li>Use the AI to generate harmful, defamatory, misleading, threatening, or sexually explicit content</li>
              <li>Attempt to extract, copy, or replicate our AI system prompts, algorithms, or proprietary logic</li>
              <li>Deliberately overload the Service with excessive requests in excess of your permitted usage limits</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
              <li>Upload or transmit viruses, malware, or any malicious code</li>
              <li>Use the Service in any way that violates any applicable Indian or international law or regulation</li>
            </ul>
            <p className="mt-4">Violation of these terms may result in immediate termination of your account without notice.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              5. AI-Generated Content — Important Limitations
            </h2>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--error-light)', borderLeft: '4px solid var(--error)' }}>
              <p className="font-semibold mb-2" style={{ color: 'var(--foreground)' }}>
                AI-generated content is not professional advice.
              </p>
            </div>
            <p className="mt-4 mb-3">
              Learnova uses third-party artificial intelligence models to generate responses, study plans, business analyses, interview questions, career guidance, and other content. You acknowledge and agree that:
            </p>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li>AI systems can and do make mistakes, produce inaccurate information, and generate content that may not be suitable for your specific situation</li>
              <li>Content generated by Learnova AI is not a substitute for professional legal, financial, medical, academic, or career advice</li>
              <li>Exam questions, syllabus information, and study recommendations should be verified against official sources such as NTA, CBSE, NCERT, and relevant examination authorities</li>
              <li>Business analyses and competitor research are based on AI interpretation of available data and should not be the sole basis for financial or business decisions</li>
              <li>Career guidance is informational only and does not constitute professional counseling</li>
              <li>Mock interview feedback is AI-generated and should be supplemented with guidance from human mentors and career professionals</li>
              <li>Voice transcription and analysis in Mock Interview mode may contain errors due to audio quality, accent variation, or technical limitations</li>
            </ul>
            <p>You use AI-generated content entirely at your own risk. We strongly encourage you to verify all important information independently from authoritative sources.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              6. Voice and Image Features
            </h2>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Mock Interview — Voice Mode:</h3>
            <p className="mb-4">
              When you use the voice interview feature, your audio is recorded in your browser and transmitted to third-party AI services (including Groq Whisper API and/or Google Gemini API) for transcription and processing. By using this feature, you consent to this audio processing. We do not permanently store your audio recordings.
            </p>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--foreground)' }}>Doubt Solver — Image Upload:</h3>
            <p>
              When you upload or capture an image in the Doubt Solver feature, that image is transmitted to Google Gemini API for visual analysis. By using this feature, you consent to your images being processed by Google&apos;s AI systems. We do not permanently store your uploaded images beyond the duration of your session.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              7. Intellectual Property
            </h2>
            <p className="mb-3">
              <strong>Your content:</strong> Content you create using Learnova — including study plans, business analyses, generated documents, and saved files — belongs to you. You grant us a limited, non-exclusive, royalty-free license to process and store this content solely to provide the Service to you.
            </p>
            <p className="mb-3"><strong>Our content:</strong> The following are protected intellectual property of Learnova AI and may not be reproduced, copied, or distributed without written permission:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Learnova&apos;s codebase, algorithms, AI prompt systems, and technical infrastructure</li>
              <li>Learnova&apos;s branding, name, logo, design, and visual identity</li>
              <li>The overall structure, organization, and presentation of the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              8. Account Termination
            </h2>
            <p className="mb-3">
              You may terminate your account at any time by contacting us at{' '}
              <a href="mailto:learnova.ai@gmail.com" className="hover:underline" style={{ color: 'var(--accent)' }}>learnova.ai@gmail.com</a>{' '}
              or by using the account deletion option in Settings.
            </p>
            <p className="mb-3">We reserve the right to suspend or permanently terminate your access to the Service if:</p>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li>You violate any provision of these Terms of Service</li>
              <li>You engage in abusive, harmful, threatening, or illegal behavior toward us, other users, or third parties</li>
              <li>You attempt to exploit, reverse engineer, or abuse the Service or its systems</li>
              <li>We are required to do so by law, court order, or a request from a law enforcement authority</li>
              <li>Your account shows signs of unauthorized access or fraudulent activity</li>
            </ul>
            <p>We will make reasonable efforts to notify you of termination via email except in cases of severe violations, security threats, or legal requirements where immediate action is necessary.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              9. Limitation of Liability
            </h2>
            <p className="mb-3">To the maximum extent permitted by applicable Indian law:</p>
            <ul className="list-disc ml-6 mb-4 space-y-1">
              <li>Learnova AI and its developer make no warranties, express or implied, regarding the Service&apos;s accuracy, reliability, availability, or fitness for any particular purpose</li>
              <li>We are not liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of or inability to use the Service</li>
              <li>We are not responsible for any exam results, academic outcomes, business outcomes, financial losses, or decisions made based on AI-generated content</li>
              <li>We are not liable for service interruptions, data loss, security breaches caused by third-party services, or technical failures beyond our reasonable control</li>
              <li>Our total aggregate liability to you for any claim arising from these Terms or your use of the Service shall not exceed the total amount you have paid us in the 12 months preceding the claim</li>
            </ul>
            <p style={{ color: 'var(--foreground-muted)' }}>Nothing in this section limits liability for fraud, willful misconduct, or death or personal injury caused by our negligence.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              10. Indemnification
            </h2>
            <p className="mb-3">You agree to indemnify, defend, and hold harmless Learnova AI and its developer from and against any claims, damages, losses, liabilities, costs, and expenses (including reasonable legal fees) arising from:</p>
            <ul className="list-disc ml-6 space-y-1">
              <li>Your violation of these Terms of Service</li>
              <li>Your use of the Service in a manner not authorized by these Terms</li>
              <li>Your violation of any third-party rights, including intellectual property rights</li>
              <li>Any content you submit, upload, or transmit through the Service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              11. Third-Party Services
            </h2>
            <p>
              The Service integrates with third-party services including but not limited to Groq API, Google AI (Gemini), Supabase, Vercel, and SearXNG. These services have their own terms of service and privacy policies. Your use of these services through Learnova is subject to their respective terms. We are not responsible for the availability, accuracy, or content of third-party services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              12. Modifications to the Service
            </h2>
            <p>
              We reserve the right to modify, suspend, or discontinue any part of the Service at any time with or without notice. We will make reasonable efforts to notify users of significant changes. We are not liable to you or any third party for any modification, suspension, or discontinuation of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              13. Governing Law and Dispute Resolution
            </h2>
            <p className="mb-3">
              These Terms are governed by and construed in accordance with the laws of India, without regard to its conflict of law principles.
            </p>
            <p>
              Any dispute, claim, or controversy arising from these Terms or your use of the Service shall first be attempted to be resolved through good-faith negotiation between the parties. If negotiation fails within 30 days, disputes shall be subject to the exclusive jurisdiction of the competent courts in Chhattisgarh, India.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              14. Changes to These Terms
            </h2>
            <p>We may modify these Terms at any time. We will notify users of material changes by:</p>
            <ul className="list-disc ml-6 mt-3 mb-6 space-y-1">
              <li>Posting a prominent announcement on the homepage</li>
              <li>Updating the &quot;Last updated&quot; date at the top of this page</li>
              <li>Sending an email notification to registered users where reasonably practicable</li>
            </ul>
            <p>Your continued use of the Service after changes are posted constitutes your acceptance of the updated Terms. If you do not agree to the updated Terms, you must stop using the Service.</p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              15. Severability
            </h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid under applicable law, that provision will be limited or eliminated to the minimum extent necessary, and the remaining provisions will continue in full force and effect.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              16. Entire Agreement
            </h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you and Learnova AI regarding the Service and supersede all prior agreements, representations, and understandings.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-4 font-heading" style={{ color: 'var(--foreground)' }}>
              17. Contact Us
            </h2>
            <p className="mb-3">For questions, concerns, or legal matters related to these Terms of Service:</p>
            <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)' }}>
              <p className="mb-1"><strong>Email:</strong>{' '}
                <a href="mailto:learnova.ai@gmail.com" className="hover:underline" style={{ color: 'var(--accent)' }}>
                  learnova.ai@gmail.com
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
