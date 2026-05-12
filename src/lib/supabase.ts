// ============================================================
// BLOOM — Supabase Client
// Single shared instance used across the entire app
// ============================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const isConfigured = !!(supabaseUrl && supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') && supabaseUrl.startsWith('https://'));

export const isSupabaseConfigured = isConfigured;

if (!isConfigured) {
  console.warn(
    '[BLOOM] Supabase credentials not found in .env.local. ' +
    'Running in demo-only mode — real auth and DB unavailable. ' +
    'See SETUP.md to configure.'
  );
}

// Use a real-looking URL so @supabase/supabase-js does not throw during URL validation
export const supabase = createClient(
  isConfigured ? supabaseUrl : 'https://xyzcompanybloom.supabase.co',
  isConfigured ? supabaseAnonKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxva2FsIn0.demo',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// ---- Typed DB helpers ----

export type Tables = {
  users: {
    id: string;
    email: string;
    onboarding_complete: boolean;
    communication_style: string;
    created_at: string;
    updated_at: string;
  };
  user_profiles: {
    id: string;
    user_id: string;
    nickname: string;
    date_of_birth: string;
    pronouns: string;
    life_stage: string;
    cycle_status: string;
    cycle_length: number;
    symptom_duration: string;
    dismissal_history: string[];
    urgency_score: number;
    has_doctor: boolean;
    reminder_preferences: string[];
    is_minor: boolean;
    created_at: string;
    updated_at: string;
  };
  user_conditions: {
    id: string;
    user_id: string;
    condition_name: string;
    is_diagnosed: boolean;
    is_family_history: boolean;
    created_at: string;
  };
  user_symptoms: {
    id: string;
    user_id: string;
    symptom_name: string;
    source: 'onboarding' | 'daily_log';
    severity: number | null;
    created_at: string;
  };
  user_goals: {
    id: string;
    user_id: string;
    goal_text: string;
    created_at: string;
  };
  symptom_logs: {
    id: string;
    user_id: string;
    date: string;
    cycle_day: number | null;
    symptoms: object;
    mood: object | null;
    energy: number;
    sleep: object | null;
    notes: string;
    tags: string[];
    source: string;
    created_at: string;
  };
};
