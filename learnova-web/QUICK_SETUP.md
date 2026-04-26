# 🚀 QUICK SETUP - Read This First!

## What Was Fixed

✅ **Removed Prisma/Local PostgreSQL** - No more `localhost:5432` errors
✅ **Chat API now uses Supabase** - Fully cloud-based
✅ **Google AI Package Installed** - `@google/generative-ai` is ready
✅ **API Key Configured** - Uses `GOOGLE_AI_API_KEY` correctly

---

## ⚡ YOU NEED TO DO (2 steps):

### Step 1: Run SQL Script in Supabase (5 minutes)

1. Open: https://app.supabase.com
2. Click on your project
3. Go to **SQL Editor** (left sidebar)
4. Open file: `supabase-setup.sql` (in this project folder)
5. Copy ALL the SQL code
6. Paste into Supabase SQL Editor
7. Click **Run**
8. ✅ Done! Tables are created

### Step 2: Add Your Google AI API Key

1. Open file: `.env.local`
2. Find line 14: `GOOGLE_AI_API_KEY=your_key_here`
3. Replace `your_key_here` with your actual Google AI API key
4. Save the file

---

## 🎯 Then Test It!

1. Open browser: http://localhost:3000
2. Login to your account
3. Go to **Chat**
4. Send a message like: "Hello, test the chat"
5. Watch for the response!

---

## 📊 What to Check

### In Terminal (should see NO red errors):
```
✓ Ready in 546ms
POST /api/chat 200 (not 500!)
```

### In Supabase Dashboard:
- Go to **Table Editor**
- Check `conversations` table - your chat should be there!
- Check `user_usage` table - `chats_today` should be 1

---

## 🐛 If You Get Errors

**Copy the EXACT error from terminal and share it!**

Common fixes:
- "User not found" → Run the SQL script
- "Failed to process" → Check Google AI API key is set
- "localhost:5432" → Restart dev server (shouldn't happen anymore)

---

## 📁 Files Changed

- ✅ `src/app/api/chat/route.ts` - Now uses Supabase
- ✅ `src/lib/supabase/db.ts` - NEW database helper
- ✅ `supabase-setup.sql` - NEW SQL setup script
- ✅ `@google/generative-ai` package installed

---

**Server is running on: http://localhost:3000**

Just run the SQL script, add your API key, and you're good to go! 🎉
