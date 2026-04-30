-- ============================================================
-- Learnova AI — Dashboard Tables Migration
-- Run this entire script in Supabase SQL Editor:
-- https://app.supabase.com/project/_/sql
-- ============================================================

-- Table 1: doubt_history
create table if not exists doubt_history (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  subject text,
  question text,
  answer text,
  created_at timestamp with time zone default now()
);

-- Table 2: practice_tests
create table if not exists practice_tests (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  exam_type text,
  subject text,
  score integer,
  total_questions integer,
  correct_answers integer,
  time_taken_seconds integer,
  created_at timestamp with time zone default now()
);

-- Table 3: interview_sessions
create table if not exists interview_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  interview_type text,
  language text,
  overall_score integer,
  communication_score integer,
  technical_score integer,
  confidence_score integer,
  feedback text,
  created_at timestamp with time zone default now()
);

-- Table 4: saved_files
create table if not exists saved_files (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  file_type text,
  title text,
  content text,
  created_at timestamp with time zone default now()
);

-- Table 5: user_streaks
create table if not exists user_streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade unique,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_active_date date default current_date,
  total_sessions integer default 0,
  updated_at timestamp with time zone default now()
);

-- Table 6: activity_log
create table if not exists activity_log (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  activity_type text,
  title text,
  metadata jsonb,
  created_at timestamp with time zone default now()
);

-- ============================================================
-- Enable Row Level Security
-- ============================================================
alter table doubt_history enable row level security;
alter table practice_tests enable row level security;
alter table interview_sessions enable row level security;
alter table saved_files enable row level security;
alter table user_streaks enable row level security;
alter table activity_log enable row level security;

-- ============================================================
-- RLS Policies — Users can only access their own data
-- ============================================================

-- doubt_history
drop policy if exists "Users can manage own doubt_history" on doubt_history;
create policy "Users can manage own doubt_history"
on doubt_history for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- practice_tests
drop policy if exists "Users can manage own practice_tests" on practice_tests;
create policy "Users can manage own practice_tests"
on practice_tests for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- interview_sessions
drop policy if exists "Users can manage own interview_sessions" on interview_sessions;
create policy "Users can manage own interview_sessions"
on interview_sessions for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- saved_files
drop policy if exists "Users can manage own saved_files" on saved_files;
create policy "Users can manage own saved_files"
on saved_files for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- user_streaks
drop policy if exists "Users can manage own user_streaks" on user_streaks;
create policy "Users can manage own user_streaks"
on user_streaks for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- activity_log
drop policy if exists "Users can manage own activity_log" on activity_log;
create policy "Users can manage own activity_log"
on activity_log for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ============================================================
-- Indexes for performance
-- ============================================================
create index if not exists idx_doubt_history_user_id on doubt_history(user_id);
create index if not exists idx_practice_tests_user_id on practice_tests(user_id);
create index if not exists idx_interview_sessions_user_id on interview_sessions(user_id);
create index if not exists idx_saved_files_user_id on saved_files(user_id);
create index if not exists idx_user_streaks_user_id on user_streaks(user_id);
create index if not exists idx_activity_log_user_id on activity_log(user_id);
create index if not exists idx_activity_log_created_at on activity_log(created_at desc);
