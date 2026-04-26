# Learnova AI - Supabase Migration Guide

## ✅ Changes Made

### 1. **Removed Prisma/Local PostgreSQL Dependency**
   - Chat API no longer requires local PostgreSQL at `localhost:5432`
   - All database operations now use Supabase

### 2. **Updated Chat API Route**
   - File: `src/app/api/chat/route.ts`
   - Now uses Supabase for:
     - User profile retrieval
     - Subscription checking
     - Usage tracking
     - Conversation storage

### 3. **Created Supabase Database Helper**
   - File: `src/lib/supabase/db.ts`
   - Contains all database operations using Supabase SDK

### 4. **Google AI API Key**
   - Already configured correctly in `src/lib/openai.ts`
   - Uses `GOOGLE_AI_API_KEY` from `.env.local`
   - Package `@google/generative-ai` is installed

---

## 🚀 Setup Instructions

### Step 1: Run Supabase SQL Setup

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Navigate to: **SQL Editor** (left sidebar)
3. Copy the contents of `supabase-setup.sql`
4. Paste and click **Run**
5. Verify all tables are created successfully

This will create:
- `user_profiles` - User data (tone_mode, user_type, etc.)
- `user_usage` - Daily usage tracking
- `subscriptions` - Plan information
- `conversations` - Chat history
- Automatic triggers for new user signup

### Step 2: Verify .env.local Configuration

Your `.env.local` should have:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://oawcqgptgnjcffzfwovi.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your_anon_key"
SUPABASE_SERVICE_ROLE_KEY="your_service_role_key"

# Google AI Studio (Gemini)
GOOGLE_AI_API_KEY=your_actual_api_key_here
```

**Important:** Replace `your_actual_api_key_here` with your real Google AI API key!

### Step 3: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test the Chat Feature

1. Open http://localhost:3000
2. Login or create an account
3. Go to the Chat page
4. Send a test message
5. Verify:
   - ✅ No errors in terminal
   - ✅ Response comes from Gemini
   - ✅ Conversation is saved in Supabase

---

## 🔍 Verify in Supabase Dashboard

After sending a test message, check:

1. **Conversations Table:**
   - Go to: Supabase Dashboard → Table Editor
   - Check `conversations` table
   - You should see your chat messages stored as JSON

2. **User Usage:**
   - Check `user_usage` table
   - `chats_today` should increment

3. **User Profile:**
   - Check `user_profiles` table
   - Should have your user data

---

## 🐛 Troubleshooting

### Error: "Can't reach database server at localhost:5432"
**Solution:** This error should no longer occur. If it does, make sure you restarted the dev server after making these changes.

### Error: "Failed to process your message. Please try again."
**Possible causes:**
1. **Google AI API Key not set** - Check `.env.local` has a valid `GOOGLE_AI_API_KEY`
2. **Supabase tables not created** - Run the `supabase-setup.sql` script
3. **User profile doesn't exist** - The SQL trigger should auto-create it on signup

### Error: "User not found"
**Solution:** Make sure the SQL trigger was created. Run this in Supabase SQL Editor:
```sql
SELECT * FROM auth.users;
```
Then verify a matching entry exists in `user_profiles`.

### Error: "Daily chat limit reached"
**Solution:** Check `user_usage` table in Supabase. You can reset by:
```sql
UPDATE user_usage SET chats_today = 0 WHERE user_id = 'your-user-id';
```

---

## 📊 Database Schema

### user_profiles
- `id` (UUID, references auth.users)
- `name`, `user_type`, `tone_mode`, `language`
- `streak_count`, `xp_points`, `user_level`
- `exam_date`, `exam_target`, `business_goal`

### user_usage
- `user_id` (UUID, unique)
- `chats_today`, `last_chat_date`
- `exams_this_month`, `validations_this_month`, `writes_this_month`

### subscriptions
- `user_id` (UUID, unique)
- `plan` (free/student/competitive/pro)
- `stripe_customer_id`, `stripe_subscription_id`
- `status`, `start_date`, `end_date`

### conversations
- `id` (UUID)
- `user_id` (UUID)
- `title`, `messages` (JSONB), `mode`
- `created_at`, `updated_at`

---

## ✨ Benefits of This Migration

1. **No Local Database Required** - Everything runs on Supabase cloud
2. **Better Scalability** - Supabase handles scaling automatically
3. **Built-in Authentication** - Integrated with Supabase Auth
4. **Row Level Security** - Users can only access their own data
5. **Auto User Creation** - New signups automatically get profile + usage records
6. **Real-time Ready** - Supabase supports real-time subscriptions if needed

---

## 🎯 Next Steps

1. Run the SQL setup script in Supabase
2. Add your actual Google AI API key to `.env.local`
3. Restart the dev server
4. Test the chat feature
5. Monitor the terminal for any errors

If you encounter any errors, share the exact terminal output and we'll fix it quickly!
