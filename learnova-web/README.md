# Learnova AI - Your Intelligent Companion

Learnova is a full-stack Next.js application that serves as an AI-powered companion for students and business builders. It provides personalized learning, exam preparation, business validation, content generation, and smart planning.

## Features

- 💬 **Smart Chat** - AI-powered conversations with multiple tone modes (Simple, Balanced, Expert, Study, Business)
- 📝 **Exam Simulator** - Generate practice tests and track performance
- 💡 **Business Idea Validator** - Validate startup ideas with market analysis
- ✍️ **AI Writer** - Generate essays, pitches, emails, and marketing copy
- 📅 **Smart Planner** - Create personalized study and business action plans
- 🌍 **Multi-Language Support** - English, Hindi, Hinglish
- 💳 **Subscription Tiers** - Free, Student (₹299/mo), Pro (₹499/mo)

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, OpenAI API (GPT-4)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (Email/Password + Google OAuth)
- **Payments**: Stripe
- **Hosting**: Vercel (recommended)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud like Supabase/Neon)
- OpenAI API key
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   cd learnova-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/learnova?schema=public"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   
   # OpenAI
   OPENAI_API_KEY="sk-your-openai-api-key"
   
   # Stripe
   STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
   STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
   STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
   STRIPE_PRO_PLAN_PRICE_ID="price_pro_plan_id"
   STRIPE_STUDENT_PLAN_PRICE_ID="price_student_plan_id"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
learnova-web/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Authentication pages (login, signup, onboarding)
│   │   ├── (dashboard)/     # Protected dashboard pages
│   │   │   ├── chat/        # Smart Chat interface
│   │   │   ├── exam/        # Exam Simulator
│   │   │   ├── validate/    # Business Idea Validator
│   │   │   ├── writer/      # AI Writer
│   │   │   ├── planner/     # Smart Planner
│   │   │   ├── pricing/     # Pricing page
│   │   │   └── settings/    # User settings
│   │   ├── (landing)/       # Public landing page
│   │   └── api/             # API routes
│   │       ├── auth/        # NextAuth endpoints
│   │       ├── chat/        # Chat with OpenAI
│   │       ├── exam/        # Exam generation
│   │       ├── validate/    # Business validation
│   │       ├── writer/      # Content generation
│   │       ├── planner/     # Plan generation
│   │       └── webhooks/    # Stripe webhooks
│   ├── components/          # Reusable UI components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   └── features/        # Feature-specific components
│   ├── lib/                 # Utilities and configurations
│   │   ├── prompts/         # AI system prompts
│   │   ├── constants.ts     # App constants
│   │   ├── openai.ts        # OpenAI client
│   │   └── prisma.ts        # Prisma client
│   └── types/               # TypeScript type definitions
├── prisma/
│   └── schema.prisma        # Database schema
└── public/                  # Static assets
```

## Subscription Plans

### Free (₹0/month)
- 20 chats per day
- 3 tone modes (Simple, Balanced, Expert)
- 5 exam attempts per month
- 2 idea validations per month
- 5 AI writes per month

### Student (₹299/month)
- 50 chats per day
- All tone modes (includes Study, Business)
- 15 exam attempts per month
- 5 idea validations per month
- 10 AI writes per month
- Smart Planner access

### Pro (₹499/month)
- 100 chats per day
- All features unlocked
- 20 exam attempts per month
- 10 idea validations per month
- 20 AI writes per month
- Priority support

## Database Schema

The application uses PostgreSQL with the following main models:

- **User** - User accounts and profile information
- **Account** - OAuth accounts (Google, etc.)
- **Session** - User sessions
- **Conversation** - Chat history with AI
- **Usage** - Track daily/monthly usage limits
- **Subscription** - Subscription plan and status
- **UserPreferences** - User settings and preferences

## API Routes

- `POST /api/auth/signup` - Create new user account
- `POST /api/chat` - Send message to AI (streaming)
- `POST /api/exam/generate` - Generate exam questions
- `POST /api/validate` - Validate business idea
- `POST /api/writer` - Generate written content
- `POST /api/planner` - Generate study/action plan
- `POST /api/user/preferences` - Save user preferences
- `POST /api/webhooks/stripe` - Handle Stripe events

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Database Hosting

Recommended PostgreSQL providers:
- **Supabase** - https://supabase.com
- **Neon** - https://neon.tech
- **Railway** - https://railway.app

## Development Tips

- Run `npx prisma studio` to view and edit database visually
- Use `npm run dev` for hot-reloading during development
- Check `.env.local` is properly configured before starting
- Make sure PostgreSQL is running locally if using local database

## Contributing

This is a personal project, but feel free to fork and customize for your needs!

## License

MIT

---

Built with ❤️ for students and builders in India 🇮🇳
