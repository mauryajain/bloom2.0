-- ============================================================
-- BLOOM — Full Database Schema + RLS Policies
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ---- 1. users (extends auth.users) ----
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  communication_style TEXT NOT NULL DEFAULT 'balanced',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own row" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own row" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own row" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create user row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ---- 2. user_profiles ----
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  nickname TEXT,
  date_of_birth DATE,
  pronouns TEXT,
  life_stage TEXT,
  cycle_status TEXT,
  cycle_length INTEGER NOT NULL DEFAULT 28 CHECK (cycle_length BETWEEN 15 AND 90),
  symptom_duration TEXT,
  dismissal_history TEXT[] DEFAULT '{}',
  urgency_score INTEGER CHECK (urgency_score BETWEEN 1 AND 5),
  has_doctor BOOLEAN DEFAULT FALSE,
  reminder_preferences TEXT[] DEFAULT '{}',
  is_minor BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own profile" ON public.user_profiles
  FOR ALL USING (auth.uid() = user_id);


-- ---- 3. user_conditions ----
CREATE TABLE IF NOT EXISTS public.user_conditions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  condition_name TEXT NOT NULL,
  is_diagnosed BOOLEAN NOT NULL DEFAULT FALSE,
  is_family_history BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_conditions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own conditions" ON public.user_conditions
  FOR ALL USING (auth.uid() = user_id);


-- ---- 4. user_symptoms (onboarding baseline) ----
CREATE TABLE IF NOT EXISTS public.user_symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  symptom_name TEXT NOT NULL,
  source TEXT NOT NULL DEFAULT 'onboarding',
  severity INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own symptoms" ON public.user_symptoms
  FOR ALL USING (auth.uid() = user_id);


-- ---- 5. user_goals ----
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own goals" ON public.user_goals
  FOR ALL USING (auth.uid() = user_id);


-- ---- 6. symptom_logs (daily logging) ----
CREATE TABLE IF NOT EXISTS public.symptom_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  cycle_day INTEGER,
  symptoms JSONB NOT NULL DEFAULT '[]',
  mood JSONB,
  energy INTEGER,
  sleep JSONB,
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  source TEXT NOT NULL DEFAULT 'daily_log',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, date)
);

ALTER TABLE public.symptom_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own logs" ON public.symptom_logs
  FOR ALL USING (auth.uid() = user_id);

-- Index for fast date-range queries
CREATE INDEX IF NOT EXISTS idx_symptom_logs_user_date
  ON public.symptom_logs(user_id, date DESC);

-- ============================================================
-- Done! All 6 tables created with RLS enabled.
-- ============================================================
