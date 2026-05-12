// ============================================================
// BLOOM — Onboarding Service
// Writes all 6 onboarding steps to Supabase in one shot
// ============================================================

import { supabase } from './supabase';
import type { OnboardingData } from '../types';

export async function submitOnboarding(userId: string, data: OnboardingData): Promise<void> {
  // Calculate age and minor flag
  const dob = new Date(data.dateOfBirth);
  const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  const isMinor = age < 18;

  // 1. Update users table (mark onboarding complete + comm style)
  const { error: userError } = await supabase
    .from('users')
    .update({
      onboarding_complete: true,
      communication_style: data.communicationStyle,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId);

  if (userError) throw new Error(`Failed to update user: ${userError.message}`);

  // 2. Upsert user_profiles
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      nickname: data.nickname,
      date_of_birth: data.dateOfBirth,
      pronouns: data.pronouns,
      life_stage: data.lifeStage,
      cycle_status: data.cycleStatus,
      symptom_duration: data.symptomDuration,
      dismissal_history: data.dismissalHistory,
      urgency_score: data.urgencyScore,
      has_doctor: data.hasDoctor,
      reminder_preferences: data.reminderPreferences,
      is_minor: isMinor,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });

  if (profileError) throw new Error(`Failed to save profile: ${profileError.message}`);

  // 3. Delete old conditions (re-insert fresh)
  await supabase.from('user_conditions').delete().eq('user_id', userId);

  const conditionRows = [
    ...data.diagnosedConditions.map(name => ({
      user_id: userId,
      condition_name: name,
      is_diagnosed: true,
      is_family_history: false,
    })),
    ...data.familyHistory.map(name => ({
      user_id: userId,
      condition_name: name,
      is_diagnosed: false,
      is_family_history: true,
    })),
  ];

  if (conditionRows.length > 0) {
    const { error: condErr } = await supabase.from('user_conditions').insert(conditionRows);
    if (condErr) throw new Error(`Failed to save conditions: ${condErr.message}`);
  }

  // 4. Delete old onboarding symptoms + re-insert
  await supabase.from('user_symptoms').delete().eq('user_id', userId).eq('source', 'onboarding');

  if (data.symptoms.length > 0) {
    const symptomRows = data.symptoms.map(name => ({
      user_id: userId,
      symptom_name: name,
      source: 'onboarding',
      severity: null,
    }));
    const { error: symErr } = await supabase.from('user_symptoms').insert(symptomRows);
    if (symErr) throw new Error(`Failed to save symptoms: ${symErr.message}`);
  }

  // 5. Delete old goals + re-insert
  await supabase.from('user_goals').delete().eq('user_id', userId);

  if (data.goals.length > 0) {
    const goalRows = data.goals.map(goal => ({
      user_id: userId,
      goal_text: goal,
    }));
    const { error: goalErr } = await supabase.from('user_goals').insert(goalRows);
    if (goalErr) throw new Error(`Failed to save goals: ${goalErr.message}`);
  }
}

export async function saveSymptomLog(userId: string, log: {
  date: string;
  cycleDay: number | null;
  symptoms: object[];
  mood: object | null;
  energy: number;
  sleep: object | null;
  notes: string;
  tags: string[];
}): Promise<void> {
  const { error } = await supabase
    .from('symptom_logs')
    .upsert({
      user_id: userId,
      date: log.date,
      cycle_day: log.cycleDay,
      symptoms: log.symptoms,
      mood: log.mood,
      energy: log.energy,
      sleep: log.sleep,
      notes: log.notes,
      tags: log.tags,
      source: 'daily_log',
    }, { onConflict: 'user_id,date' });

  if (error) throw new Error(`Failed to save log: ${error.message}`);
}
