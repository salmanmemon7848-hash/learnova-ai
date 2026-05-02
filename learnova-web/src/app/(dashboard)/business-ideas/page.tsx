'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// ============================================
// 8 POWERFUL MCQ QUESTIONS
// ============================================
const questions = [
  {
    id: 1,
    question: 'Which world excites you the most?',
    emoji: '🌍',
    subtitle: 'Pick the one that genuinely pulls you — not what sounds cool',
    options: [
      { label: 'Technology & Apps', value: 'tech', emoji: '💻' },
      { label: 'Education & Coaching', value: 'education', emoji: '📚' },
      { label: 'Health & Wellness', value: 'health', emoji: '🏥' },
      { label: 'Fashion & Beauty', value: 'lifestyle', emoji: '👗' },
      { label: 'Food & Agriculture', value: 'food', emoji: '🌾' },
      { label: 'Finance & Investment', value: 'finance', emoji: '💰' },
    ],
  },
  {
    id: 2,
    question: 'What do people always come to you for?',
    emoji: '💪',
    subtitle: 'Your natural strength is your biggest business asset',
    options: [
      { label: 'Advice & Talking', value: 'communication', emoji: '🗣️' },
      { label: 'Creative Work', value: 'creative', emoji: '🎨' },
      { label: 'Technical Skills', value: 'technical', emoji: '⌨️' },
      { label: 'Planning & Organizing', value: 'organizing', emoji: '📋' },
      { label: 'Teaching & Explaining', value: 'teaching', emoji: '👨🏫' },
      { label: 'Fixing Problems', value: 'problem_solving', emoji: '🧩' },
    ],
  },
  {
    id: 3,
    question: 'How many hours can you dedicate daily?',
    emoji: '⏰',
    subtitle: 'Be honest — the right idea fits your real life, not your ideal life',
    options: [
      { label: 'Less than 1 hour', value: 'minimal', emoji: '⚡' },
      { label: '1 to 3 hours', value: 'part_time', emoji: '🌙' },
      { label: '3 to 6 hours', value: 'serious', emoji: '🔥' },
      { label: 'Full time — I am all in', value: 'full_time', emoji: '🚀' },
    ],
  },
  {
    id: 4,
    question: 'What is your starting budget?',
    emoji: '💳',
    subtitle: 'Every great Indian startup began somewhere — even zero',
    options: [
      { label: 'Zero — Bootstrap only', value: 'zero', emoji: '🆓' },
      { label: 'Under ₹10,000', value: 'low', emoji: '💵' },
      { label: '₹10,000 to ₹1 Lakh', value: 'medium', emoji: '💰' },
      { label: '₹1 Lakh or more', value: 'high', emoji: '🏦' },
    ],
  },
  {
    id: 5,
    question: 'Who do you most want to serve?',
    emoji: '🎯',
    subtitle: 'The clearer your customer, the stronger your business will be',
    options: [
      { label: 'Students & Young People', value: 'students', emoji: '🎓' },
      { label: 'Working Professionals', value: 'professionals', emoji: '💼' },
      { label: 'Small Business Owners', value: 'small_business', emoji: '🏪' },
      { label: 'Rural Communities', value: 'rural', emoji: '🌾' },
      { label: 'Parents & Families', value: 'families', emoji: '👨👩👧' },
      { label: 'Everyone — Mass Market', value: 'everyone', emoji: '🌍' },
    ],
  },
  {
    id: 6,
    question: 'How do you prefer to make money?',
    emoji: '🏗️',
    subtitle: 'Different models suit different personalities and lifestyles',
    options: [
      { label: 'Sell a physical product', value: 'product', emoji: '📦' },
      { label: 'Offer a service', value: 'service', emoji: '🛠️' },
      { label: 'Build an app or platform', value: 'platform', emoji: '📱' },
      { label: 'Create content or courses', value: 'content', emoji: '🎬' },
      { label: 'Resell or franchise', value: 'resell', emoji: '🔁' },
    ],
  },
  {
    id: 7,
    question: 'What worries you most about starting?',
    emoji: '😰',
    subtitle: 'Knowing your fear helps us find an idea that works around it',
    options: [
      { label: 'Losing money', value: 'financial_risk', emoji: '😬' },
      { label: 'Not having enough time', value: 'time', emoji: '⏳' },
      { label: 'Nobody will buy it', value: 'market_risk', emoji: '🤷' },
      { label: 'I lack the right skills', value: 'skills_gap', emoji: '📖' },
      { label: 'Too much competition', value: 'competition', emoji: '⚔️' },
      { label: 'Nothing — I am ready!', value: 'fearless', emoji: '🦁' },
    ],
  },
  {
    id: 8,
    question: 'What does success look like for you in 3 years?',
    emoji: '🌟',
    subtitle: 'Your vision determines which type of idea is right for you',
    options: [
      { label: '₹20,000 to ₹50,000 side income/month', value: 'side_income', emoji: '💸' },
      { label: 'Replace my full-time salary', value: 'full_income', emoji: '🏠' },
      { label: 'Build and sell the company', value: 'exit', emoji: '🎰' },
      { label: 'Scale to 100+ crore revenue', value: 'scale', emoji: '🚀' },
      { label: 'Create real social impact', value: 'impact', emoji: '❤️' },
    ],
  },
];

// ============================================
// PROGRESS BAR
// ============================================
function ProgressBar({ current, total }: { current: number; total: number }) {
  const percent = Math.round((current / total) * 100);
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-2">
        <span className="text-gray-400 text-sm font-medium">
          Question {current} of {total}
        </span>
        <span className="text-purple-400 text-sm font-semibold">{percent}%</span>
      </div>
      <div className="w-full bg-gray-800 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-purple-600 via-purple-500 to-purple-400 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

// ============================================
// IDEA CARD
// ============================================
function IdeaCard({
  idea,
  index,
  saved,
  onSave,
  router,
}: {
  idea: any;
  index: number;
  saved: boolean;
  onSave: () => void;
  router: any;
}) {
  const [expanded, setExpanded] = useState(false);

  const difficultyStyles: Record<string, string> = {
    Easy: 'text-green-400 bg-green-500/10 border-green-500/30',
    Medium: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
    Hard: 'text-red-400 bg-red-500/10 border-red-500/30',
  };

  const scoreColor = (score: number) =>
    score >= 80 ? 'text-green-400' : score >= 60 ? 'text-yellow-400' : 'text-red-400';

  return (
    <div className={`bg-[#1A1A1E] rounded-2xl border transition-all duration-300 overflow-hidden ${
      saved ? 'border-purple-500/60' : 'border-gray-700/50 hover:border-purple-500/30'
    }`}>

      {/* Top Accent Bar */}
      <div className="h-1 bg-gradient-to-r from-purple-600 to-purple-400 w-full" />

      <div className="p-6">

        {/* Header Row */}
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600/30 to-purple-800/30 border border-purple-500/30 rounded-2xl flex items-center justify-center text-xl font-bold text-purple-300 flex-shrink-0">
              {index + 1}
            </div>
            <div>
              <h3 className="text-white font-bold text-xl leading-tight">{idea.name}</h3>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className="text-purple-400 text-xs font-medium bg-purple-500/10 px-2 py-0.5 rounded-full">
                  {idea.category}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${difficultyStyles[idea.difficulty] || difficultyStyles.Medium}`}>
                  {idea.difficulty}
                </span>
              </div>
            </div>
          </div>

          {/* Viability Score */}
          {idea.viabilityScore && (
            <div className="flex-shrink-0 text-center bg-[#0F0F10] rounded-xl p-3 min-w-[64px]">
              <div className={`text-2xl font-bold ${scoreColor(idea.viabilityScore)}`}>
                {idea.viabilityScore}
              </div>
              <div className="text-gray-500 text-xs">/ 100</div>
              <div className="text-gray-500 text-xs">Score</div>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm leading-relaxed mb-5">{idea.description}</p>

        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Monthly Revenue', value: idea.revenue, color: 'text-green-400', bg: 'bg-green-500/5 border-green-500/20' },
            { label: 'Investment', value: idea.investment, color: 'text-blue-400', bg: 'bg-blue-500/5 border-blue-500/20' },
            { label: 'Time to ₹', value: idea.timeToRevenue, color: 'text-yellow-400', bg: 'bg-yellow-500/5 border-yellow-500/20' },
          ].map((m, i) => (
            <div key={i} className={`${m.bg} border rounded-xl p-3 text-center`}>
              <p className={`${m.color} font-bold text-sm`}>{m.value}</p>
              <p className="text-gray-500 text-xs mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Score Bar if available */}
        {idea.scores && (
          <div className="bg-[#0F0F10] rounded-xl p-4 mb-5">
            <p className="text-gray-400 text-xs font-medium mb-3 uppercase tracking-wide">Idea Scorecard</p>
            <div className="space-y-2.5">
              {Object.entries(idea.scores).map(([key, val]: any) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400 capitalize">{key.replace(/_/g, ' ')}</span>
                    <span className={`font-semibold ${scoreColor(val)}`}>{val}/100</span>
                  </div>
                  <div className="w-full bg-gray-700/50 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-700 ${
                        val >= 80 ? 'bg-green-500' : val >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${val}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Expand Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full py-2.5 text-sm text-purple-400 hover:text-purple-300 border border-purple-500/20 hover:border-purple-500/40 rounded-xl transition-all duration-200 mb-4 flex items-center justify-center gap-2"
        >
          {expanded ? '▲ Show Less' : '▼ View Full Business Plan'}
        </button>

        {/* Expanded Content */}
        {expanded && (
          <div className="space-y-4">

            {/* Why Perfect For You */}
            <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-5">
              <h4 className="text-purple-300 font-semibold text-sm mb-2 flex items-center gap-2">
                🎯 Why This Is Perfect For You
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">{idea.whyPerfect}</p>
            </div>

            {/* How It Works */}
            <div className="bg-[#0F0F10] rounded-xl p-5">
              <h4 className="text-white font-semibold text-sm mb-3 flex items-center gap-2">
                ⚙️ How The Business Works
              </h4>
              <p className="text-gray-300 text-sm leading-relaxed">{idea.howItWorks}</p>
            </div>

            {/* Revenue Model */}
            <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-5">
              <h4 className="text-green-400 font-semibold text-sm mb-2">💰 How You Make Money</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{idea.revenueModel}</p>
            </div>

            {/* First 7 Steps */}
            <div className="bg-[#0F0F10] rounded-xl p-5">
              <h4 className="text-white font-semibold text-sm mb-4">🗺️ Your First 7 Action Steps</h4>
              <ol className="space-y-3">
                {idea.firstSteps?.map((step: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-gray-300 text-sm leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Indian Examples */}
            {idea.indianExamples && (
              <div className="bg-[#0F0F10] rounded-xl p-5">
                <h4 className="text-white font-semibold text-sm mb-2">🇮🇳 Indians Who Did This</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{idea.indianExamples}</p>
              </div>
            )}

            {/* Tools Needed */}
            {idea.toolsNeeded && (
              <div className="bg-[#0F0F10] rounded-xl p-5">
                <h4 className="text-white font-semibold text-sm mb-3">🛠️ Tools & Resources Needed</h4>
                <div className="flex flex-wrap gap-2">
                  {idea.toolsNeeded.map((tool: string, i: number) => (
                    <span key={i} className="bg-gray-700/60 text-gray-300 text-xs px-3 py-1.5 rounded-full">
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Risks */}
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-5">
              <h4 className="text-red-400 font-semibold text-sm mb-2">⚠️ Key Risks & How to Avoid Them</h4>
              <p className="text-gray-300 text-sm leading-relaxed">{idea.risks}</p>
            </div>

            {/* Competitive Edge */}
            {idea.competitiveEdge && (
              <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5">
                <h4 className="text-blue-400 font-semibold text-sm mb-2">⚡ Your Competitive Advantage</h4>
                <p className="text-gray-300 text-sm leading-relaxed">{idea.competitiveEdge}</p>
              </div>
            )}

          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={onSave}
            className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-200 border ${
              saved
                ? 'bg-purple-600/30 text-purple-300 border-purple-500/50'
                : 'bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border-purple-500/20 hover:border-purple-500/40'
            }`}
          >
            {saved ? '✅ Saved' : '🔖 Save Idea'}
          </button>
          <button
            onClick={() => router.push(`/chat?prompt=Help me build a detailed business plan for this idea: ${idea.name}. ${idea.description}`)}
            className="flex-1 py-3 rounded-xl text-sm font-semibold bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-500/20 hover:border-green-500/40 transition-all duration-200"
          >
            🤖 Build This with AI
          </button>
        </div>

      </div>
    </div>
  );
}

// ============================================
// FALLBACK IDEAS (If AI fails)
// ============================================
function getFallbackIdeas() {
  return [
    {
      name: 'WhatsApp Study Group Monetization',
      category: 'EdTech',
      description: 'Create paid WhatsApp or Telegram groups for students preparing for competitive exams. Charge ₹299-499/month per student. Share daily notes, MCQs, and doubt sessions.',
      difficulty: 'Easy',
      viabilityScore: 82,
      scores: { market_demand: 90, profit_potential: 78, ease_of_execution: 88, india_fit: 92 },
      revenue: '₹15,000–₹50,000/month',
      investment: '₹0 to start',
      timeToRevenue: '2–3 weeks',
      whyPerfect: 'Zero investment needed and millions of Indian students are actively looking for affordable exam prep. You can start today with your phone.',
      howItWorks: 'Create a group, post daily content, charge monthly fee via UPI. Start with 50 students at ₹299 = ₹15,000/month.',
      revenueModel: '₹299/month × 50 students = ₹14,950/month. Scale to 200 students for ₹59,800/month.',
      firstSteps: [
        'Day 1: Pick one exam (JEE/NEET/UPSC) and create WhatsApp group',
        'Day 2-3: Add 20 friends/students for free as founding members',
        'Week 1: Post daily value content to build trust',
        'Week 2: Announce ₹199 founding member price',
        'Month 1: Target 30 paid members',
        'Month 2: Raise price to ₹299 and target 75 members',
        'Month 3: Launch Telegram channel for scale',
      ],
      indianExamples: 'Unacademy started as YouTube channel. Many solo educators earn ₹1-5L/month from Telegram groups.',
      toolsNeeded: ['WhatsApp/Telegram', 'Canva (free)', 'Google Forms', 'UPI/Razorpay', 'Notion'],
      risks: 'Content consistency is the biggest challenge. Solve this by batching content creation once a week for the whole week.',
      competitiveEdge: 'Personal touch and affordable pricing beats big platforms for Tier-2 and Tier-3 city students.',
    },
    {
      name: 'Local Business Social Media Management',
      category: 'Digital Marketing',
      description: 'Manage Instagram and Facebook pages for local restaurants, salons, and shops in your city. Charge ₹3,000-8,000/month per client for content creation and posting.',
      difficulty: 'Easy',
      viabilityScore: 79,
      scores: { market_demand: 85, profit_potential: 75, ease_of_execution: 82, india_fit: 88 },
      revenue: '₹20,000–₹60,000/month',
      investment: '₹0 to ₹2,000',
      timeToRevenue: '1–2 weeks',
      whyPerfect: 'Every local business in India needs social media but has no time to manage it. You can start with just a phone and Canva.',
      howItWorks: 'Visit local businesses, show them a sample post you made for them, offer a free 1-week trial, then convert to ₹5,000/month retainer.',
      revenueModel: '5 clients × ₹5,000/month = ₹25,000/month. Scale to 12 clients for ₹60,000/month working 3-4 hours/day.',
      firstSteps: [
        'Day 1: Make 3 sample posts for a local restaurant using Canva',
        'Day 2: Walk into 5 local businesses and show your samples',
        'Day 3-5: Offer free 1 week trial to interested businesses',
        'Week 2: Convert 2-3 trials to ₹3,000/month paid clients',
        'Month 1: Get 4 paying clients',
        'Month 2: Raise rates to ₹5,000 and get 2 more clients',
        'Month 3: Hire a friend and scale to 15 clients',
      ],
      indianExamples: 'Thousands of Indian freelancers earn ₹50,000+/month managing social media for local and D2C brands.',
      toolsNeeded: ['Canva (free)', 'Instagram', 'Meta Business Suite', 'Google Drive', 'UPI'],
      risks: 'Clients may be slow to pay. Always take advance payment. Use simple contracts via WhatsApp confirmation.',
      competitiveEdge: 'Local presence and personal relationships beat outsourced agencies for small businesses.',
    },
    {
      name: 'Tiffin & Home Food Delivery',
      category: 'Food & D2C',
      description: 'Cook and deliver home-style tiffin to office workers, students, and bachelors in your area. ₹80-150 per meal, 20-50 customers to start from your own kitchen.',
      difficulty: 'Easy',
      viabilityScore: 76,
      scores: { market_demand: 88, profit_potential: 70, ease_of_execution: 80, india_fit: 95 },
      revenue: '₹18,000–₹45,000/month',
      investment: '₹2,000–₹5,000',
      timeToRevenue: '1 week',
      whyPerfect: 'Massive demand from students and working professionals in every Indian city. You can start from your home kitchen with minimal investment.',
      howItWorks: 'Take subscriptions of ₹2,000-3,000/month per customer for daily lunch and dinner. Deliver within 2km radius or use bike.',
      revenueModel: '25 customers × ₹2,500/month = ₹62,500 revenue. Cost ₹1,200/customer = ₹30,000 cost. Profit ₹32,500/month.',
      firstSteps: [
        'Day 1: Post in local WhatsApp groups offering free trial tiffin',
        'Day 2-3: Cook and deliver free samples to 10 neighbors',
        'Week 1: Get 10 paid subscribers at ₹2,000/month',
        'Week 2-3: Collect feedback and improve menu',
        'Month 1: Scale to 25 subscribers',
        'Month 2: Hire help and scale to 50 customers',
        'Month 3: List on Zomato/Swiggy for extra orders',
      ],
      indianExamples: 'Thousands of home chefs in Mumbai, Pune, Bangalore earn ₹50,000+/month from tiffin services.',
      toolsNeeded: ['WhatsApp Business', 'Google Sheets', 'Swiggy Genie for delivery', 'UPI', 'Basic kitchen equipment'],
      risks: 'Food quality consistency and delivery timing are critical. Start small and expand only when you have a reliable system.',
      competitiveEdge: 'Home-cooked taste that restaurants and cloud kitchens cannot replicate — huge emotional value for customers.',
    },
    {
      name: 'Freelance Graphic Design for Startups',
      category: 'Creative Services',
      description: 'Design logos, social media posts, pitch decks and brand kits for Indian startups and small businesses. Charge ₹5,000-25,000 per project using Canva or Figma.',
      difficulty: 'Medium',
      viabilityScore: 80,
      scores: { market_demand: 82, profit_potential: 78, ease_of_execution: 75, india_fit: 85 },
      revenue: '₹25,000–₹80,000/month',
      investment: '₹0 to ₹3,000',
      timeToRevenue: '2–3 weeks',
      whyPerfect: 'India has 100,000+ new startups registered every year, all needing design work. Canva makes professional design accessible even for beginners.',
      howItWorks: 'Create a portfolio on Behance or Instagram, get clients from LinkedIn and Internshala, deliver projects via WhatsApp and Google Drive.',
      revenueModel: '4 logo projects × ₹8,000 + 2 brand kits × ₹15,000 = ₹62,000/month working part-time.',
      firstSteps: [
        'Day 1-2: Create 5 sample logo designs using Canva for fake brands',
        'Day 3: Create Behance portfolio and Instagram design page',
        'Week 1: Apply to 20 design gigs on Internshala and Fiverr',
        'Week 2: Get first paid client at ₹3,000-5,000',
        'Month 1: Complete 3-4 projects and collect testimonials',
        'Month 2: Raise rates to ₹8,000-12,000 per project',
        'Month 3: Target recurring clients for monthly retainers',
      ],
      indianExamples: 'Many Indian designers on Fiverr earn $2,000-5,000/month. Instagram design accounts like @logosbynick inspire thousands.',
      toolsNeeded: ['Canva Pro (₹4,000/year)', 'Figma (free)', 'Behance', 'LinkedIn', 'Razorpay'],
      risks: 'Clients may request unlimited revisions. Always define revision limits in writing before starting. Use 50% advance payment.',
      competitiveEdge: 'Affordable Indian pricing with international quality — perfect sweet spot for bootstrapped Indian startups.',
    },
    {
      name: 'Online Tutor for School Students',
      category: 'EdTech',
      description: 'Teach Class 8-12 students online via Google Meet or Zoom. Charge ₹500-1,500 per session or ₹5,000-12,000/month for regular classes in Math, Science, or English.',
      difficulty: 'Easy',
      viabilityScore: 84,
      scores: { market_demand: 92, profit_potential: 80, ease_of_execution: 90, india_fit: 94 },
      revenue: '₹20,000–₹60,000/month',
      investment: '₹0',
      timeToRevenue: '1 week',
      whyPerfect: 'Every Indian parent wants their child to get better grades. Online tutoring needs zero investment — just your knowledge and a phone.',
      howItWorks: 'Post on local Facebook/WhatsApp groups, get referrals from first students, teach 4-6 hours daily, collect fees monthly via UPI.',
      revenueModel: '15 students × ₹4,000/month = ₹60,000/month teaching 4-5 hours/day, 6 days a week.',
      firstSteps: [
        'Day 1: Post in 10 local parent WhatsApp groups offering free demo class',
        'Day 2-3: Take 3-5 free demo classes to show your quality',
        'Week 1: Convert 5 students to paid at ₹3,000/month',
        'Week 2-3: Ask every student for 1 referral',
        'Month 1: Get 10 regular students',
        'Month 2: Raise fees and specialize in one exam (JEE/NEET/Board)',
        'Month 3: Start group classes to multiply income without more time',
      ],
      indianExamples: 'Byju Raveendran started as a personal tutor. Today many individual tutors earn ₹1-2L/month from online classes.',
      toolsNeeded: ['Google Meet (free)', 'WhatsApp', 'Google Classroom (free)', 'UPI', 'Canva for study materials'],
      risks: 'Student retention drops if results are not visible. Track each student\'s progress weekly and communicate updates to parents.',
      competitiveEdge: 'Personal attention and accountability that large platforms like BYJU\'S cannot provide at this price point.',
    },
  ];
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function BusinessIdeasPage() {
  const router = useRouter();
  const [stage, setStage] = useState<'intro' | 'questions' | 'loading' | 'results'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [ideas, setIdeas] = useState<any[]>([]);
  const [aiResult, setAiResult] = useState<any>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [savedIdeas, setSavedIdeas] = useState<Set<string>>(new Set());
  const [animating, setAnimating] = useState(false);
  const [loadingSeconds, setLoadingSeconds] = useState(0);

  // Loading timeout tracker
  useEffect(() => {
    if (stage !== 'loading') return;
    const interval = setInterval(() => {
      setLoadingSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [stage]);

  const handleOptionSelect = (value: string) => setSelectedOption(value);

  const handleNext = async () => {
    if (!selectedOption) return;
    const newAnswers = { ...answers, [questions[currentQuestion].id]: selectedOption };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setAnimating(true);
      setTimeout(() => {
        setCurrentQuestion(prev => prev + 1);
        setSelectedOption(null);
        setAnimating(false);
      }, 250);
    } else {
      setStage('loading');
      await generateIdeas(newAnswers, false);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setSelectedOption(answers[questions[currentQuestion - 1].id] || null);
    }
  };

  const generateIdeas = async (answersData: Record<number, string>, isMore: boolean) => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);

    const res = await fetch('/api/business-ideas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers: answersData,
        existingIdeas: isMore ? ideas.map((i: any) => i.idea_name || i.name) : [],
        count: 5,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!res.ok) throw new Error(`API returned ${res.status}`);

    const data = await res.json();
    console.log('✅ API Response:', data);

    // New API returns { result: { ideas, mentor_observation, ... } }
    const parsed = data.result || data;
    const newIdeas = parsed.ideas || data.ideas || [];

    if (newIdeas.length > 0) {
      if (isMore) {
        setIdeas(prev => [...prev, ...newIdeas]);
      } else {
        setIdeas(newIdeas);
        setAiResult(parsed);
        setStage('results');
      }
    } else {
      console.error('No ideas in response:', data);
      if (!isMore) {
        setIdeas(getFallbackIdeas());
        setStage('results');
      }
    }
  } catch (error: any) {
    console.error('❌ generateIdeas error:', error?.message || error);
    if (!isMore) {
      setIdeas(getFallbackIdeas());
      setStage('results');
    }
  } finally {
    setLoadingMore(false);
  }
};

  const handleMoreIdeas = async () => {
    setLoadingMore(true);
    await generateIdeas(answers, true);
  };

  const handleRestart = () => {
    setStage('intro');
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedOption(null);
    setIdeas([]);
    setAiResult(null);
    setSavedIdeas(new Set());
  };

  const handleRefineAnswers = () => {
    setStage('questions');
    setCurrentQuestion(questions.length - 1);
    setSelectedOption(answers[questions[questions.length - 1].id] || null);
  };

  const toggleSave = (name: string) => {
    setSavedIdeas(prev => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  // ─────────────────────────────
  // INTRO SCREEN
  // ─────────────────────────────
  if (stage === 'intro') return (
    <div className="min-h-screen bg-[#0F0F10] text-white flex items-center justify-center p-6">
      <div className="max-w-2xl w-full text-center">

        <div className="w-28 h-28 bg-gradient-to-br from-purple-600 to-purple-900 rounded-3xl flex items-center justify-center text-6xl mx-auto mb-8 shadow-2xl shadow-purple-500/30">
          💼
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Find Your Perfect<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
            Business Idea
          </span>
        </h1>

        <p className="text-gray-400 text-lg mb-4 leading-relaxed max-w-lg mx-auto">
          Your AI business coach will ask you 8 smart questions and generate 5 personalized startup ideas built around your life, strengths, and goals.
        </p>

        <p className="text-purple-400 text-sm mb-10 font-medium">
          🎯 100% personalized • 🇮🇳 India-focused • ⚡ Takes 2 minutes
        </p>

        {/* How It Works */}
        <div className="grid grid-cols-3 gap-2 px-3 lg:gap-4 lg:px-0 mb-10">
          {[
            { icon: '🎯', title: '8 Quick Questions', desc: 'Tap your answer — no typing needed' },
            { icon: '🧠', title: 'AI Coach Analyzes', desc: 'Matches ideas to your exact profile' },
            { icon: '💡', title: '5 Business Ideas', desc: 'With full plan, steps & revenue data' },
          ].map((item, i) => (
            <div key={i} className="bg-[#1A1A1E] rounded-2xl p-3 lg:p-5 border border-gray-700/40 hover:border-purple-500/30 transition-colors flex flex-col items-center min-h-0 overflow-visible">
              <div className="text-2xl lg:text-3xl mb-2">{item.icon}</div>
              <p className="text-white font-semibold text-xs lg:text-sm mb-1 text-center leading-tight">{item.title}</p>
              <p className="text-gray-500 text-[10px] lg:text-xs leading-relaxed text-center">{item.desc}</p>
            </div>
          ))}
        </div>

        <button
          onClick={() => setStage('questions')}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white px-14 py-4 rounded-2xl text-xl font-bold transition-all duration-200 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-105 active:scale-100"
        >
          Discover My Business Ideas →
        </button>

        <p className="text-gray-600 text-xs mt-5">
          Powered by Learnova AI Business Coach • Free for all users
        </p>

      </div>
    </div>
  );

  // ─────────────────────────────
  // QUESTIONS SCREEN
  // ─────────────────────────────
  if (stage === 'questions') {
    const q = questions[currentQuestion];
    return (
      <div className="min-h-screen bg-[#0F0F10] text-white p-6 flex flex-col max-w-xl mx-auto">

        <div className="pt-4">
          <ProgressBar current={currentQuestion + 1} total={questions.length} />
        </div>

        <div className={`flex-1 flex flex-col justify-center transition-all duration-250 ${animating ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}>

          <div className="mb-8">
            <span className="text-6xl block mb-5">{q.emoji}</span>
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">{q.question}</h2>
            <p className="text-gray-400 text-sm leading-relaxed">{q.subtitle}</p>
          </div>

          <div className="space-y-3 mb-8">
            {q.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleOptionSelect(opt.value)}
                className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-all duration-200 ${
                  selectedOption === opt.value
                    ? 'bg-purple-600/20 border-purple-500 shadow-lg shadow-purple-500/10 scale-[1.01]'
                    : 'bg-[#1A1A1E] border-gray-700/50 hover:border-gray-500/80 hover:bg-[#22222A]'
                }`}
              >
                <span className="text-2xl w-8 text-center">{opt.emoji}</span>
                <span className={`font-medium flex-1 ${selectedOption === opt.value ? 'text-white' : 'text-gray-300'}`}>
                  {opt.label}
                </span>
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                  selectedOption === opt.value
                    ? 'bg-purple-500 border-purple-500'
                    : 'border-gray-600'
                }`}>
                  {selectedOption === opt.value && <span className="text-white text-xs">✓</span>}
                </span>
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            {currentQuestion > 0 && (
              <button
                onClick={handleBack}
                className="px-6 py-3.5 bg-[#1A1A1E] border border-gray-700/50 text-gray-400 hover:text-white hover:border-gray-500 rounded-xl font-medium transition-all"
              >
                ← Back
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!selectedOption}
              className={`flex-1 py-3.5 rounded-xl font-bold text-base transition-all duration-200 ${
                selectedOption
                  ? 'bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] active:scale-100'
                  : 'bg-gray-800 text-gray-600 cursor-not-allowed'
              }`}
            >
              {currentQuestion === questions.length - 1 ? '🚀 Generate My Business Ideas' : 'Next Question →'}
            </button>
          </div>

        </div>
      </div>
    );
  }

  // ─────────────────────────────
  // LOADING SCREEN
  // ─────────────────────────────
  if (stage === 'loading') return (
    <div className="min-h-screen bg-[#0F0F10] text-white flex items-center justify-center p-6">
      <div className="text-center max-w-md w-full">

        <div className="w-24 h-24 bg-gradient-to-br from-purple-600/30 to-purple-900/30 border border-purple-500/30 rounded-3xl flex items-center justify-center text-5xl mx-auto mb-8 animate-pulse">
          🧠
        </div>

        <h2 className="text-2xl font-bold text-white mb-2">Your AI Coach is Thinking...</h2>
        <p className="text-gray-400 text-sm mb-10 leading-relaxed">
          Analyzing your profile and crafting 5 business ideas tailored specifically for you
        </p>

        <div className="space-y-3 text-left">
          {[
            { icon: '🎯', text: 'Understanding your interests and strengths...' },
            { icon: '🇮🇳', text: 'Scanning Indian market opportunities...' },
            { icon: '💡', text: 'Matching ideas to your budget and time...' },
            { icon: '📊', text: 'Calculating revenue and viability scores...' },
            { icon: '🗺️', text: 'Building your personalized action steps...' },
          ].map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-[#1A1A1E] border border-gray-700/30 rounded-xl px-4 py-3"
              style={{ animationDelay: `${i * 150}ms` }}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-gray-300 text-sm">{item.text}</span>
              <div className="ml-auto w-2 h-2 bg-purple-500 rounded-full animate-ping" />
            </div>
          ))}
        </div>

        {/* Timeout fallback after 15 seconds */}
        {loadingSeconds > 15 && (
          <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 text-center">
            <p className="text-yellow-400 text-sm font-medium mb-3">
              ⏳ Taking longer than usual...
            </p>
            <button
              onClick={() => { setIdeas(getFallbackIdeas()); setStage('results'); }}
              className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 border border-yellow-500/30 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Show Sample Ideas Instead
            </button>
          </div>
        )}

      </div>
    </div>
  );

  // ─────────────────────────────
  // RESULTS SCREEN
  // ─────────────────────────────
  return (
    <div className="min-h-screen bg-[#0F0F10] text-white pb-[80px] lg:pb-0">

      {/* Hero Header */}
      <div className="bg-gradient-to-b from-purple-900/20 to-transparent px-6 pt-8 pb-6 text-center mb-4">
        <div className="text-5xl mb-3">🎉</div>
        <h1 className="text-3xl font-bold text-white mb-2">Your Business Ideas Are Ready!</h1>
        <p className="text-gray-400 text-sm max-w-md mx-auto">
          {ideas.length} startup ideas personally crafted by your AI business coach based on your profile
        </p>
        <div className="flex flex-wrap gap-2 justify-center mt-4 max-w-2xl mx-auto">
          {Object.entries(answers).map(([qId, val]) => {
            const q = questions.find(q => q.id === parseInt(qId));
            const opt = q?.options.find(o => o.value === val);
            return opt ? (
              <span key={qId} className="bg-purple-500/10 text-purple-300 text-xs px-3 py-1.5 rounded-full border border-purple-500/20">
                {opt.emoji} {opt.label}
              </span>
            ) : null;
          })}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 space-y-5 mb-10">

        {/* Mentor Observation */}
        {aiResult?.mentor_observation && (
          <div className="bg-[#1A1A1E] rounded-2xl border border-purple-500/30 p-6">
            <h3 className="text-white font-bold text-lg mb-3">🧠 Your Mentor's Observation</h3>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">{aiResult.mentor_observation}</p>
            {aiResult.honest_warning && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-3 text-sm text-yellow-300">
                ⚠️ {aiResult.honest_warning}
              </div>
            )}
          </div>
        )}

        {/* Recommended Banner */}
        {aiResult?.why_recommended && (
          <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/10 border border-purple-500/40 rounded-2xl p-5">
            <span className="text-xs font-bold text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full">⭐ Recommended for You</span>
            <p className="text-gray-200 text-sm mt-3 leading-relaxed">{aiResult.why_recommended}</p>
          </div>
        )}

        {/* Idea Cards */}
        {ideas.map((idea: any, i: number) => {
          const ideaName = idea.idea_name || idea.name;
          const isRecommended = aiResult?.recommended_idea === (idea.rank || i + 1);
          const fitScore = idea.founder_fit_score;
          const fitColor = fitScore >= 80 ? 'text-green-400' : fitScore >= 60 ? 'text-yellow-400' : 'text-red-400';

          return (
            <div
              key={`${ideaName}-${i}`}
              className={`bg-[#1A1A1E] rounded-2xl border overflow-hidden transition-all duration-300 ${
                isRecommended ? 'border-purple-500/60' : 'border-gray-700/50 hover:border-purple-500/30'
              }`}
            >
              <div className="h-1 bg-gradient-to-r from-purple-600 to-purple-400 w-full" />

              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600/30 to-purple-800/30 border border-purple-500/30 rounded-xl flex items-center justify-center text-sm font-bold text-purple-300 flex-shrink-0">
                      #{idea.rank || i + 1}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg leading-tight">{ideaName}</h3>
                      {isRecommended && (
                        <span className="text-xs text-purple-400 bg-purple-500/15 px-2 py-0.5 rounded-full mt-1 inline-block">⭐ Recommended</span>
                      )}
                    </div>
                  </div>
                  {fitScore && (
                    <div className="flex-shrink-0 text-center bg-[#0F0F10] rounded-xl p-3 min-w-[64px]">
                      <div className={`text-xl font-bold ${fitColor}`}>{fitScore}%</div>
                      <div className="text-gray-500 text-xs">fit</div>
                    </div>
                  )}
                </div>

                {/* One-liner */}
                <p className="text-gray-400 text-sm italic mb-4">{idea.one_line || idea.description}</p>

                {/* Meta grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
                  {[
                    { label: '🎯 Problem', value: idea.problem_solved },
                    { label: '👤 Customer', value: idea.target_customer },
                    { label: '💰 Cost', value: idea.startup_cost || idea.investment },
                    { label: '📈 Revenue', value: idea.revenue_model || idea.revenue },
                    { label: '⏱ First Revenue', value: idea.time_to_first_revenue || idea.timeToRevenue },
                    { label: '📊 Market Size', value: idea.market_size_india },
                  ].filter(m => m.value).map((m, j) => (
                    <div key={j} className="bg-[#0F0F10] rounded-xl p-3">
                      <p className="text-gray-500 text-xs mb-1">{m.label}</p>
                      <p className="text-gray-200 text-xs font-medium leading-snug">{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Sections */}
                <div className="space-y-3 mb-4">
                  {idea.why_now && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
                      <p className="text-blue-400 text-xs font-semibold mb-1">⚡ Why Now in India</p>
                      <p className="text-gray-300 text-sm leading-relaxed">{idea.why_now}</p>
                    </div>
                  )}
                  {(idea.real_indian_example || idea.indianExamples) && (
                    <div className="bg-[#0F0F10] rounded-xl p-4">
                      <p className="text-white text-xs font-semibold mb-1">🇮🇳 Indian Success Story</p>
                      <p className="text-gray-300 text-sm leading-relaxed">{idea.real_indian_example || idea.indianExamples}</p>
                    </div>
                  )}
                  {idea.founder_fit_reason && (
                    <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                      <p className="text-green-400 text-xs font-semibold mb-1">✅ Why You're a Good Fit</p>
                      <p className="text-gray-300 text-sm leading-relaxed">{idea.founder_fit_reason}</p>
                    </div>
                  )}
                  {(idea.biggest_risk || idea.risks) && (
                    <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                      <p className="text-red-400 text-xs font-semibold mb-1">⚠️ Biggest Risk</p>
                      <p className="text-gray-300 text-sm leading-relaxed">{idea.biggest_risk || idea.risks}</p>
                    </div>
                  )}
                </div>

                {/* First 3 Steps */}
                {(idea.first_3_steps || idea.firstSteps)?.slice(0, 3).length > 0 && (
                  <div className="bg-[#0F0F10] rounded-xl p-4 mb-4">
                    <p className="text-white text-xs font-semibold mb-3">🚀 First 3 Steps to Start</p>
                    <div className="space-y-2">
                      {(idea.first_3_steps || idea.firstSteps).slice(0, 3).map((step: string, j: number) => (
                        <div key={j} className="flex items-start gap-3">
                          <span className="w-6 h-6 bg-purple-600/30 border border-purple-500/30 text-purple-300 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {j + 1}
                          </span>
                          <span className="text-gray-300 text-sm leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => toggleSave(ideaName)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 border ${
                      savedIdeas.has(ideaName)
                        ? 'bg-purple-600/30 text-purple-300 border-purple-500/50'
                        : 'bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border-purple-500/20 hover:border-purple-500/40'
                    }`}
                  >
                    {savedIdeas.has(ideaName) ? '✅ Saved' : '🔖 Save Idea'}
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/chat?prompt=Help me build a detailed business plan for: ${ideaName}. ${idea.one_line || idea.description}`)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-green-600/10 hover:bg-green-600/20 text-green-400 border border-green-500/20 hover:border-green-500/40 transition-all duration-200"
                  >
                    🤖 Build with AI
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {/* Bottom CTAs */}
        <button
          type="button"
          onClick={handleMoreIdeas}
          disabled={loadingMore}
          className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold text-lg transition-all duration-200 shadow-xl shadow-purple-500/20 hover:scale-[1.01] active:scale-100 flex items-center justify-center gap-3"
        >
          {loadingMore ? (
            <><span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />Generating 5 More Ideas...</>
          ) : '⚡ Give Me 5 More Ideas'}
        </button>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleRefineAnswers}
            className="bg-[#1A1A1E] hover:bg-[#222228] text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600 py-3.5 rounded-xl font-semibold transition-all duration-200"
          >
            ← Refine My Answers
          </button>
          <button
            type="button"
            onClick={handleRestart}
            className="bg-[#1A1A1E] hover:bg-[#222228] text-gray-300 hover:text-white border border-gray-700/50 hover:border-gray-600 py-3.5 rounded-xl font-semibold transition-all duration-200"
          >
            🔄 Retake Quiz
          </button>
        </div>

        {savedIdeas.size > 0 && (
          <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4 text-center">
            <p className="text-purple-300 text-sm font-medium">
              🔖 {savedIdeas.size} idea{savedIdeas.size > 1 ? 's' : ''} saved to your profile
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
