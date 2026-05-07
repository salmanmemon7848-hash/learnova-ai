# 🚀 Quick Start - Thinkior AI

## Get Running in 3 Steps

### Step 1: Set Up Database

**Easiest Option - Use Supabase (Free):**

1. Go to https://supabase.com
2. Click "New Project"
3. Choose a name and password
4. Wait for it to create (~2 minutes)
5. Go to Project Settings → Database
6. Under "Connection string", select "URI" tab
7. Copy the connection string
8. Open `.env.local` and paste it as `DATABASE_URL`

Replace `[YOUR-PASSWORD]` with your actual database password.

### Step 2: Add Your API Keys

Open `.env.local` and add:

**Required:**
```env
DATABASE_URL="postgresql://..."  # From Step 1
NEXTAUTH_SECRET="any-random-string-here"
OPENAI_API_KEY="sk-..."  # Get from https://platform.openai.com/api-keys
```

**Optional (can add later):**
```env
STRIPE_SECRET_KEY="sk_test_..."
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."
```

### Step 3: Run the App

```bash
# Install dependencies
npm install

# Set up database
npx prisma generate
npx prisma db push

# Start the app
npm run dev
```

Open **http://localhost:3000** in your browser!

---

## 🎯 What You Can Do Now

1. **Sign up** - Create an account at `/signup`
2. **Complete onboarding** - Choose your preferences
3. **Start chatting** - Try the Smart Chat feature
4. **Explore features** - Exam Simulator, Business Validator, AI Writer, Smart Planner

---

## ❓ Common Issues

**"Can't connect to database"**
- Make sure your `DATABASE_URL` is correct
- Check if your Supabase project is active

**"OpenAI API error"**
- Verify your API key is correct
- Make sure you have credits in your OpenAI account

**"Port 3000 already in use"**
- Stop other apps using port 3000, or
- Run: `npm run dev -- -p 3001`

---

## 📚 Need More Help?

- Full documentation: `README.md`
- Setup guide: `SETUP.md`
- Project summary: `PROJECT_SUMMARY.md`

---

**Ready to build something amazing? Let's go! 🌟**
