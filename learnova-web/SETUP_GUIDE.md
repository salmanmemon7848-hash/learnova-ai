# Thinkior AI - Setup & Run Guide

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- OpenAI API key
- Google OAuth credentials (optional, for Google sign-in)

### Step 1: Install Dependencies
```bash
cd learnova-web
npm install
```

### Step 2: Set Up Environment Variables
1. Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

2. Update the following required variables in `.env.local`:

**Required:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_SECRET` - Generate with: `openssl rand -base64 32`
- `OPENAI_API_KEY` - Your OpenAI API key from https://platform.openai.com

**Optional:**
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET` - For Google OAuth (get from Google Cloud Console)
- Stripe keys - For payment processing

### Step 3: Set Up Database
```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma db push

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

### Step 4: Run the Development Server
```bash
npm run dev
```

The app will be available at: **http://localhost:3000**

## 📁 Project Structure

```
learnova-web/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Authentication pages (login, signup, onboarding)
│   │   ├── (dashboard)/     # Protected dashboard pages
│   │   │   ├── chat/        # AI Chat interface
│   │   │   ├── exam/        # Exam simulator
│   │   │   ├── validate/    # Business idea validator
│   │   │   ├── writer/      # AI content writer
│   │   │   ├── planner/     # Smart study/business planner
│   │   │   ├── pricing/     # Subscription pricing
│   │   │   ├── billing/     # Billing management
│   │   │   └── settings/    # User settings
│   │   ├── api/             # API routes
│   │   └── (landing)/       # Landing page
│   ├── components/          # React components
│   ├── lib/                 # Utilities and configurations
│   └── types/               # TypeScript type definitions
├── prisma/
│   └── schema.prisma        # Database schema
└── public/                  # Static assets
```

## ✨ Features

1. **Smart Chat** - AI-powered conversations with multiple tone modes
2. **Exam Simulator** - Generate practice tests with AI
3. **Business Validator** - Validate startup ideas with market analysis
4. **AI Writer** - Generate essays, pitches, emails, and more
5. **Smart Planner** - Create personalized study or business plans
6. **Multi-language Support** - English, Hindi, Hinglish
7. **Subscription Management** - Free, Student, and Pro plans

## 🔧 Common Issues & Solutions

### Issue: "Database connection error"
**Solution:** 
- Ensure PostgreSQL is running
- Check `DATABASE_URL` in `.env.local`
- Run `npx prisma db push` to create tables

### Issue: "NextAuth configuration error"
**Solution:**
- Generate a new secret: `openssl rand -base64 32`
- Add it to `NEXTAUTH_SECRET` in `.env.local`

### Issue: "Google sign-in not working"
**Solution:**
- Create OAuth credentials in Google Cloud Console
- Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
- Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env.local`

### Issue: "OpenAI API error"
**Solution:**
- Get API key from https://platform.openai.com
- Add credits to your OpenAI account
- Update `OPENAI_API_KEY` in `.env.local`

## 📝 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npx prisma studio    # Open database GUI
```

## 🎨 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** NextAuth.js v4
- **AI:** OpenAI GPT-4
- **State Management:** Zustand
- **UI Components:** Lucide Icons

## 🔐 Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `NEXTAUTH_URL` | ✅ | App URL (http://localhost:3000 for dev) |
| `NEXTAUTH_SECRET` | ✅ | Secret for session encryption |
| `OPENAI_API_KEY` | ✅ | OpenAI API key |
| `GOOGLE_CLIENT_ID` | ❌ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ❌ | Google OAuth client secret |
| `STRIPE_SECRET_KEY` | ❌ | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | ❌ | Stripe publishable key |

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/getting-started/introduction)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## 🤝 Support

For issues or questions, please check:
1. The troubleshooting section above
2. Browser console for client-side errors
3. Terminal output for server-side errors
4. `.next/dev/logs/next-development.log` for detailed logs

---

**Ready to build!** 🚀 Visit http://localhost:3000 after following the setup steps.
