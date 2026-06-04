# Learnova AI - Quick Setup Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Database

**Option A: Using Local PostgreSQL**
1. Install PostgreSQL on your machine
2. Create a database named `learnova`
3. Update `DATABASE_URL` in `.env.local`

**Option B: Using Supabase (Recommended for beginners)**
1. Go to https://supabase.com
2. Create a new project (free tier available)
3. Go to Project Settings → Database
4. Copy the connection string
5. Update `DATABASE_URL` in `.env.local`

### Step 3: Configure Environment Variables

1. Copy the example env file:
   ```bash
   # .env.local is already created, just edit it
   ```

2. Generate a secure secret for NextAuth:
   ```bash
   # On Mac/Linux:
   openssl rand -base64 32
   
   # On Windows (PowerShell):
   [System.Convert]::ToBase64String([System.Security.Cryptography.RNGCryptoServiceProvider]::new().GetBytes(32))
   ```

3. Get your API keys:
   - **OpenAI**: https://platform.openai.com/api-keys
   - **Stripe** (optional for now): https://dashboard.stripe.com/apikeys

### Step 4: Initialize Database
```bash
npx prisma generate
npx prisma db push
```

### Step 5: Start Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser!

## 📋 Pre-Launch Checklist

Before deploying to production:

- [ ] Set up production PostgreSQL database (Supabase/Neon)
- [ ] Add all environment variables to Vercel
- [ ] Create Stripe products and add price IDs
- [ ] Set up Stripe webhook endpoint
- [ ] Configure custom domain (optional)
- [ ] Test signup flow
- [ ] Test chat functionality
- [ ] Test payment flow (use Stripe test mode first)

## 🐛 Troubleshooting

### "Database connection failed"
- Check if PostgreSQL is running
- Verify `DATABASE_URL` is correct
- Make sure database exists

### "OpenAI API error"
- Verify `OPENAI_API_KEY` is correct
- Check if you have credits in your OpenAI account

### "NextAuth error"
- Make sure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain

### "Prisma errors"
- Run `npx prisma generate` again
- Try `npx prisma db push --force-reset` (warning: deletes all data)

## 🎯 Next Steps

1. **Customize the branding**: Edit colors in Tailwind config
2. **Add Google OAuth**: Set up Google Cloud credentials
3. **Configure Stripe**: Create products and test payments
4. **Deploy to Vercel**: Push to GitHub and import to Vercel
5. **Add analytics**: Integrate Vercel Analytics or PostHog

## 📚 Resources

- Next.js Docs: https://nextjs.org/docs
- Prisma Docs: https://www.prisma.io/docs
- NextAuth Docs: https://next-auth.js.org
- OpenAI API: https://platform.openai.com/docs
- Stripe Docs: https://stripe.com/docs

---

Need help? Check the full README.md for detailed documentation!
