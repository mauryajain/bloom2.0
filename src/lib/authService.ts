// ============================================================
// BLOOM — Auth Service (Supabase Auth operations)
// ============================================================

import { supabase, isSupabaseConfigured } from './supabase';
import type { Severity, SymptomLog } from '../types';

export interface AuthError {
  message: string;
}

const toSeverity = (value: unknown): Severity => {
  const severity = Number(value);
  return severity >= 1 && severity <= 5 ? severity as Severity : 3;
};

export async function signUp(email: string, password: string, name?: string): Promise<{ userId: string; hasSession: boolean } | AuthError> {
  if (!isSupabaseConfigured) return { message: 'Supabase is not configured. See SETUP.md to add your credentials and enable real auth.' };
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: name ? { data: { name } } : undefined,
  });
  if (error) return { message: error.message };
  if (!data.user) return { message: 'Signup failed — no user returned.' };
  return { userId: data.user.id, hasSession: !!data.session };
}

export async function signIn(email: string, password: string): Promise<{ userId: string } | AuthError> {
  if (!isSupabaseConfigured) return { message: 'Supabase is not configured. See SETUP.md to add your credentials and enable real auth.' };
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { message: error.message };
  if (!data.user) return { message: 'Login failed — no user returned.' };
  return { userId: data.user.id };
}

export async function signOut(): Promise<void> {
  await supabase.auth.signOut();
}

export async function getOnboardingStatus(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('users')
    .select('onboarding_complete')
    .eq('id', userId)
    .single();
  return data?.onboarding_complete ?? false;
}

export async function loadUserProfile(userId: string) {
  const [profileRes, conditionsRes, symptomsRes, goalsRes, userRes] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('user_id', userId).single(),
    supabase.from('user_conditions').select('*').eq('user_id', userId),
    supabase.from('user_symptoms').select('*').eq('user_id', userId).eq('source', 'onboarding'),
    supabase.from('user_goals').select('*').eq('user_id', userId),
    supabase.from('users').select('*').eq('id', userId).single(),
  ]);

  if (!profileRes.data || !userRes.data) return null;

  const profile = profileRes.data;
  const conditions = conditionsRes.data ?? [];
  const symptoms = symptomsRes.data ?? [];
  const goals = goalsRes.data ?? [];
  const user = userRes.data;

  const dob = profile.date_of_birth ? new Date(profile.date_of_birth) : null;
  const age = dob ? Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000)) : 0;

  return {
    userId,
    nickname: profile.nickname ?? '',
    dateOfBirth: profile.date_of_birth ?? '',
    age,
    pronouns: profile.pronouns ?? '',
    lifeStage: profile.life_stage ?? 'reproductive',
    cycleStatus: profile.cycle_status ?? '',
    cycleLength: profile.cycle_length ?? 28,
    symptoms: symptoms.map((s: { symptom_name: string }) => s.symptom_name),
    symptomDuration: profile.symptom_duration ?? '',
    dismissalHistory: profile.dismissal_history ?? [],
    diagnosedConditions: conditions.filter((c: { is_diagnosed: boolean }) => c.is_diagnosed).map((c: { condition_name: string }) => c.condition_name),
    familyHistory: conditions.filter((c: { is_family_history: boolean }) => c.is_family_history).map((c: { condition_name: string }) => c.condition_name),
    goals: goals.map((g: { goal_text: string }) => g.goal_text),
    urgencyScore: profile.urgency_score ?? 3,
    communicationStyle: user.communication_style ?? 'balanced',
    reminderPreferences: profile.reminder_preferences ?? [],
    hasDoctor: profile.has_doctor ?? false,
    isMinor: profile.is_minor ?? false,
    onboardingComplete: user.onboarding_complete ?? false,
  };
}

export async function loadSymptomLogs(userId: string): Promise<SymptomLog[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);
  const cutoffStr = cutoff.toISOString().split('T')[0];

  const { data } = await supabase
    .from('symptom_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('date', cutoffStr)
    .order('date', { ascending: false });

  return (data ?? []).map((log: {
    id: string; user_id: string; date: string; cycle_day: number | null;
    symptoms: unknown; mood: unknown; energy: number; sleep: unknown;
    notes: string; tags: string[]; created_at: string;
  }) => {
    const sleep = log.sleep as { hours: number; quality: unknown; disturbances: string[] } | null;

    return {
      id: log.id,
      userId: log.user_id,
      date: log.date,
      cycleDay: log.cycle_day,
      symptoms: Array.isArray(log.symptoms) ? log.symptoms : [],
      mood: log.mood as { primary: string; secondary: string[]; score: number } | null,
      energy: log.energy,
      sleep: sleep ? { ...sleep, quality: toSeverity(sleep.quality) } : null,
      notes: log.notes ?? '',
      tags: log.tags ?? [],
      createdAt: log.created_at,
    };
  });
}
