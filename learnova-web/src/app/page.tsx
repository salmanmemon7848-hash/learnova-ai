import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Learn Smarter. Build Faster.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Your intelligent AI companion for students and business builders. Get personalized guidance, exam prep, and startup advice — all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
              >
                Start Free 🚀
              </Link>
              <Link
                href="/login"
                className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Everything You Need to Succeed
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                icon: '💬',
                title: 'Smart Chat',
                description: 'Get instant, personalized answers in your preferred style — simple, balanced, or expert.',
              },
              {
                icon: '📝',
                title: 'Exam Simulator',
                description: 'Practice with mock tests, get scored, and identify weak areas to focus on.',
              },
              {
                icon: '💡',
                title: 'Business Validator',
                description: 'Validate your startup idea with market analysis, risk assessment, and actionable steps.',
              },
              {
                icon: '✍️',
                title: 'AI Writer',
                description: 'Generate essays, pitches, emails, and marketing copy in seconds.',
              },
              {
                icon: '📅',
                title: 'Smart Planner',
                description: 'Build personalized study schedules and business action plans that actually work.',
              },
              {
                icon: '🌍',
                title: 'Multi-Language',
                description: 'Communicate in English, Hindi, Hinglish, and more — naturally.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of students and builders who are already using Learnova to achieve their goals.
          </p>
          <Link
            href="/signup"
            className="inline-block px-10 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg hover:bg-blue-50 transition-colors"
          >
            Create Your Free Account 🌟
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">© 2026 Learnova. All rights reserved.</p>
          <p className="text-sm">Built with ❤️ for students and builders in India</p>
        </div>
      </footer>
    </div>
  )
}
