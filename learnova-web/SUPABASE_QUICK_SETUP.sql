-- =====================================================
-- THINKIOR AI - MINIMUM SQL SETUP (Run This!)
-- =====================================================
-- Go to: https://app.supabase.com
-- Click your project → SQL Editor → New Query
-- Copy ALL this SQL and paste → Click "Run"
-- =====================================================

-- 1. User Profiles Table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  user_type TEXT DEFAULT 'student',
  tone_mode TEXT DEFAULT 'balanced',
  language TEXT DEFAULT 'en',
  exam_date TIMESTAMP,
  exam_target TEXT,
  business_goal TEXT,
  streak_count INTEGER DEFAULT 0,
  xp_points INTEGER DEFAULT 0,
  user_level TEXT DEFAULT 'Beginner',
  last_study_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. User Usage Tracking Table
CREATE TABLE IF NOT EXISTS public.user_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  chats_today INTEGER DEFAULT 0,
  last_chat_date TIMESTAMP DEFAULT NOW(),
  exams_this_month INTEGER DEFAULT 0,
  validations_this_month INTEGER DEFAULT 0,
  writes_this_month INTEGER DEFAULT 0,
  last_reset_date TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 3. Subscriptions Table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  status TEXT DEFAULT 'active',
  start_date TIMESTAMP DEFAULT NOW(),
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Conversations Table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT DEFAULT 'New Conversation',
  messages JSONB,
  recap JSONB,
  mode TEXT DEFAULT 'balanced',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON public.conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_usage_user_id ON public.user_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);

-- 6. Auto-Create User Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  
  INSERT INTO public.user_usage (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Attach the Trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 8. Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- 9. RLS Policies - Users can access their own data
CREATE POLICY "Users view own profile" ON public.user_profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users view own usage" ON public.user_usage FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own subscription" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users view own conversations" ON public.conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users create own conversations" ON public.conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own conversations" ON public.conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own conversations" ON public.conversations FOR DELETE USING (auth.uid() = user_id);

-- 10. Service Role Policies (for API routes)
CREATE POLICY "Service role all profiles" ON public.user_profiles FOR ALL USING (true);
CREATE POLICY "Service role all usage" ON public.user_usage FOR ALL USING (true);
CREATE POLICY "Service role all subscriptions" ON public.subscriptions FOR ALL USING (true);
CREATE POLICY "Service role all conversations" ON public.conversations FOR ALL USING (true);

-- =====================================================
-- SYNC EXISTING USERS (Run if you already have users)
-- =====================================================
INSERT INTO public.user_profiles (id)
SELECT id FROM auth.users
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.user_usage (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- =====================================================
-- DONE! Check Table Editor to verify tables exist.
-- =====================================================
