-- ============================================================
-- Thinkior AI — Supabase Migration
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- 1. Add plan tracking fields to the profiles table
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS has_seen_pricing BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'student' CHECK (role IN ('student', 'founder', 'general')),
  ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS plan_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS razorpay_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS daily_usage JSONB DEFAULT '{}';

-- 2. Index for fast middleware lookups
CREATE INDEX IF NOT EXISTS profiles_has_seen_pricing_idx ON profiles(has_seen_pricing);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON profiles(role);

-- 3. Mark existing users as has_seen_pricing=true so they are never shown the pricing gate again
UPDATE profiles
SET has_seen_pricing = TRUE
WHERE has_seen_pricing IS FALSE OR has_seen_pricing IS NULL;

-- 4. Auto-create profile when new user signs up via Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, has_seen_pricing, role, plan)
  VALUES (
    NEW.id,
    NEW.email,
    FALSE,
    'student',
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Attach the trigger (drop first to avoid duplicate errors)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================
-- Verify the migration worked
-- ============================================================
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'profiles'
-- ORDER BY ordinal_position;
