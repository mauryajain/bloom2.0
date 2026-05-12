-- ============================================================
-- BLOOM - Onboarding profile field backfill
-- Run in Supabase SQL Editor if your existing database predates
-- the current onboarding/profile schema.
-- ============================================================

-- public.users fields used by onboarding/auth:
--   onboarding_complete: marks onboarding done
--   communication_style: AI response tone preference
--   updated_at: touched when onboarding is completed
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS communication_style TEXT NOT NULL DEFAULT 'balanced',
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- public.user_profiles fields saved from the onboarding form:
--   id/user_id: profile row identity and link to public.users
--   nickname/date_of_birth/pronouns: identity
--   life_stage/cycle_status/cycle_length: health journey
--   symptom_duration/dismissal_history: symptom context
--   urgency_score: support urgency, 1-5
--   has_doctor: regular doctor preference
--   reminder_preferences: selected reminder options
--   is_minor: derived from date_of_birth
ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS id UUID DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS user_id UUID,
  ADD COLUMN IF NOT EXISTS nickname TEXT,
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS pronouns TEXT,
  ADD COLUMN IF NOT EXISTS life_stage TEXT,
  ADD COLUMN IF NOT EXISTS cycle_status TEXT,
  ADD COLUMN IF NOT EXISTS cycle_length INTEGER NOT NULL DEFAULT 28,
  ADD COLUMN IF NOT EXISTS symptom_duration TEXT,
  ADD COLUMN IF NOT EXISTS dismissal_history TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS urgency_score INTEGER,
  ADD COLUMN IF NOT EXISTS has_doctor BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS reminder_preferences TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS is_minor BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE public.user_profiles
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS user_profiles_id_fkey;

UPDATE public.user_profiles
SET id = gen_random_uuid()
WHERE id IS NULL;

-- Some older prototype schemas had email directly on user_profiles.
-- The current app stores email on public.users, so keep the old column
-- compatible if it exists without requiring onboarding inserts to send it.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'user_profiles'
      AND column_name = 'email'
  ) THEN
    UPDATE public.user_profiles profile
    SET email = users.email
    FROM public.users users
    WHERE profile.user_id = users.id
      AND profile.email IS NULL;

    ALTER TABLE public.user_profiles
      ALTER COLUMN email DROP NOT NULL;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_profiles_pkey'
      AND conrelid = 'public.user_profiles'::regclass
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_pkey PRIMARY KEY (id);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_profiles_user_id_fkey'
      AND conrelid = 'public.user_profiles'::regclass
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_profiles_user_id_key'
      AND conrelid = 'public.user_profiles'::regclass
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Keep allowed ranges aligned with the UI.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_profiles_urgency_score_check'
      AND conrelid = 'public.user_profiles'::regclass
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_urgency_score_check
      CHECK (urgency_score IS NULL OR urgency_score BETWEEN 1 AND 5);
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'user_profiles_cycle_length_check'
      AND conrelid = 'public.user_profiles'::regclass
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT user_profiles_cycle_length_check
      CHECK (cycle_length BETWEEN 15 AND 90);
  END IF;
END $$;

-- Optional compatibility aliases if any older code or manual reports look
-- for these values on public.users. The active app uses user_profiles.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS reminder_preferences TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS has_regular_doctor BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cycle_length INTEGER NOT NULL DEFAULT 28,
  ADD COLUMN IF NOT EXISTS life_stage TEXT;

-- Repair RLS policies for existing projects that created the table before
-- the current "manage own profile" policy existed.
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.user_profiles;

CREATE POLICY "Users can read own profile" ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own profile" ON public.user_profiles
  FOR DELETE
  USING (auth.uid() = user_id);
