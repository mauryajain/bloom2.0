// ============================================================
// BLOOM — Global State Store (Zustand + persist)
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserProfile, SymptomLog, PatternAlert, AskBloomConversation, DoctorPrepReport, OnboardingData } from '../types';
import { demoUsers } from '../data/demoData';
import { loadUserProfile, loadSymptomLogs } from '../lib/authService';
import { submitOnboarding as submitOnboardingToDB } from '../lib/onboardingService';
import { detectPatterns } from '../utils/aiEngine';

const DOCTOR_PREP_MIN_LOG_DAYS = 21;
const DOCTOR_PREP_REFRESH_DAYS = 15;

const profileCacheKey = (userId: string) => `bloom-profile:${userId}`;

const loadCachedProfile = (userId: string): (UserProfile & { email?: string }) | null => {
  try {
    const raw = localStorage.getItem(profileCacheKey(userId));
    return raw ? JSON.parse(raw) as UserProfile & { email?: string } : null;
  } catch {
    return null;
  }
};

const saveCachedProfile = (profile: UserProfile & { email?: string }) => {
  try {
    localStorage.setItem(profileCacheKey(profile.userId), JSON.stringify(profile));
  } catch {
    // Persistence is best-effort; Zustand still keeps the active session populated.
  }
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const shouldGenerateDoctorPrep = (
  logs: SymptomLog[],
  report: DoctorPrepReport | null,
  userId: string
) => {
  if (logs.length < DOCTOR_PREP_MIN_LOG_DAYS) return false;
  if (!report || report.userId !== userId) return true;
  return addDays(new Date(report.generatedAt), DOCTOR_PREP_REFRESH_DAYS) <= new Date();
};

const buildDoctorPrepReport = (
  user: User,
  logs: SymptomLog[],
  existingPatterns: PatternAlert[]
): DoctorPrepReport => {
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const symptomStats = new Map<string, { frequency: number; severity: number }>();

  sortedLogs.forEach(log => {
    log.symptoms.forEach(symptom => {
      const current = symptomStats.get(symptom.name) ?? { frequency: 0, severity: 0 };
      current.frequency += 1;
      current.severity += symptom.severity;
      symptomStats.set(symptom.name, current);
    });
  });

  const topSymptoms = [...symptomStats.entries()]
    .map(([name, stat]) => ({
      name,
      frequency: stat.frequency,
      avgSeverity: Number((stat.severity / stat.frequency).toFixed(1)),
    }))
    .sort((a, b) => b.frequency - a.frequency || b.avgSeverity - a.avgSeverity)
    .slice(0, 5);

  const generatedPatterns = detectPatterns(sortedLogs, user.id);
  const reportPatterns = existingPatterns.length > 0 ? existingPatterns : generatedPatterns;
  const notableLogs = sortedLogs
    .filter(log => log.symptoms.length > 0)
    .slice(-6)
    .map(log => ({
      date: log.date,
      event: log.symptoms
        .slice(0, 2)
        .map(symptom => `${symptom.name} (${symptom.severity}/5)`)
        .join(', '),
    }));

  const cycleDays = sortedLogs
    .map(log => log.cycleDay)
    .filter((day): day is number => typeof day === 'number' && day > 0);

  const avgCycleLength = user.cycleLength || 28;
  const cycleIrregularities = cycleDays.length === 0
    ? ['No cycle-day entries logged yet']
    : [];

  return {
    id: `prep-${user.id}-${Date.now()}`,
    userId: user.id,
    generatedAt: new Date().toISOString(),
    dateRange: {
      start: sortedLogs[0]?.date ?? new Date().toISOString().split('T')[0],
      end: sortedLogs[sortedLogs.length - 1]?.date ?? new Date().toISOString().split('T')[0],
    },
    summary: `${sortedLogs.length} symptom logs reviewed for ${user.name || 'this patient'} (age ${user.age || 'not specified'}, ${user.lifeStage}). Top tracked symptoms include ${
      topSymptoms.length > 0 ? topSymptoms.map(symptom => symptom.name).join(', ') : 'no recurring symptoms yet'
    }. This summary is intended to support a focused healthcare conversation, not to diagnose.`,
    topSymptoms,
    patterns: reportPatterns,
    questions: [
      'Do these symptom patterns suggest any conditions or tests worth discussing?',
      'Are the timing and severity of these symptoms typical for my life stage?',
      'What changes should prompt an earlier follow-up or urgent care?',
      'What treatment or tracking steps would you recommend before my next visit?',
    ],
    timeline: notableLogs,
    cycleData: {
      avgLength: avgCycleLength,
      irregularities: cycleIrregularities,
    },
  };
};

interface BloomState {
  // Auth
  isAuthenticated: boolean;
  currentUser: User | null;
  userProfile: UserProfile | null;
  isDemoMode: boolean;
  authLoading: boolean;

  // Data
  symptomLogs: SymptomLog[];
  patterns: PatternAlert[];
  conversations: AskBloomConversation[];
  doctorPrep: DoctorPrepReport | null;

  // UI
  sidebarOpen: boolean;
  currentView: string;
  onboardingComplete: boolean;

  // Auth Actions
  loginAsDemo: (userId: string) => void;
  loginAsReal: (userId: string, email: string) => Promise<void>;
  logout: () => void;
  setAuthLoading: (loading: boolean) => void;

  // Onboarding
  submitOnboarding: (userId: string, data: OnboardingData) => Promise<void>;
  setOnboardingComplete: (complete: boolean) => void;

  // Data Actions
  addSymptomLog: (log: SymptomLog) => void;
  refreshDoctorPrep: () => void;
  markPatternRead: (id: string) => void;
  addConversationMessage: (convId: string, message: AskBloomConversation['messages'][number]) => void;
  addConversation: (conv: AskBloomConversation) => void;

  // UI Actions
  setSidebarOpen: (open: boolean) => void;
  setCurrentView: (view: string) => void;
}

export const useBloomStore = create<BloomState>()(
  persist(
    (set, get) => ({
      // Initial state
      isAuthenticated: false,
      currentUser: null,
      userProfile: null,
      isDemoMode: false,
      authLoading: true,
      symptomLogs: [],
      patterns: [],
      conversations: [],
      doctorPrep: null,
      sidebarOpen: false,
      currentView: 'dashboard',
      onboardingComplete: false,

      // ---- Auth ----

      loginAsDemo: (userId) => {
        const demo = demoUsers.find(d => d.user.id === userId);
        if (demo) {
          // Build a minimal UserProfile from demo user for AI compatibility
          const demoProfile: UserProfile = {
            userId: demo.user.id,
            nickname: demo.user.name.split(' ')[0],
            dateOfBirth: '',
            age: demo.user.age,
            pronouns: 'she/her',
            lifeStage: demo.user.lifeStage,
            cycleStatus: 'regular',
            cycleLength: demo.user.cycleLength,
            symptoms: demo.symptomLogs[0]?.symptoms.map(s => s.name) ?? [],
            symptomDuration: '3-12 months',
            dismissalHistory: [],
            diagnosedConditions: [],
            familyHistory: [],
            goals: ['understand my body', 'prepare for doctor visits'],
            urgencyScore: 3,
            communicationStyle: 'balanced',
            reminderPreferences: [],
            hasDoctor: true,
            isMinor: false,
            onboardingComplete: true,
          };
          set({
            isAuthenticated: true,
            currentUser: demo.user,
            userProfile: demoProfile,
            isDemoMode: true,
            symptomLogs: demo.symptomLogs,
            patterns: demo.patterns,
            conversations: demo.conversations,
            doctorPrep: demo.doctorPrep,
            onboardingComplete: true,
            authLoading: false,
          });
        }
      },

      loginAsReal: async (userId, email) => {
        set({ authLoading: true });
        try {
          const cachedProfile = loadCachedProfile(userId);
          const existingDoctorPrep = get().doctorPrep?.userId === userId ? get().doctorPrep : null;
          const [profile, logs] = await Promise.all([
            loadUserProfile(userId),
            loadSymptomLogs(userId),
          ]);
          const mergedProfile = profile
            ? {
                ...cachedProfile,
                ...profile,
                cycleLength: cachedProfile?.cycleLength ?? profile.cycleLength ?? 28,
              }
            : cachedProfile;

          const user: User = {
            id: userId,
            name: mergedProfile?.nickname || email.split('@')[0],
            email: email || cachedProfile?.email || '',
            age: mergedProfile?.age ?? 0,
            lifeStage: (mergedProfile?.lifeStage as User['lifeStage']) ?? 'reproductive',
            cycleLength: mergedProfile?.cycleLength ?? 28,
            preferences: { theme: 'auto', notifications: true, dataSharing: false, lifeStageAdaptive: true },
            createdAt: new Date().toISOString(),
          };
          const detectedPatterns = detectPatterns(logs, userId);
          const doctorPrep = shouldGenerateDoctorPrep(logs, existingDoctorPrep, userId)
            ? buildDoctorPrepReport(user, logs, detectedPatterns)
            : existingDoctorPrep;

          set({
            isAuthenticated: true,
            currentUser: user,
            userProfile: mergedProfile ?? null,
            isDemoMode: false,
            symptomLogs: logs,
            patterns: detectedPatterns,
            conversations: mergedProfile ? [{
              id: `conv-${userId}`,
              userId,
              topic: 'Your health journey',
              messages: [],
              createdAt: new Date().toISOString(),
            }] : [],
            doctorPrep,
            onboardingComplete: mergedProfile?.onboardingComplete ?? false,
            authLoading: false,
          });
        } catch (err) {
          console.error('[loginAsReal]', err);
          set({ authLoading: false });
        }
      },

      logout: () => set({
        isAuthenticated: false,
        currentUser: null,
        userProfile: null,
        isDemoMode: false,
        symptomLogs: [],
        patterns: [],
        conversations: [],
        doctorPrep: null,
        onboardingComplete: false,
        currentView: 'dashboard',
      }),

      setAuthLoading: (loading) => set({ authLoading: loading }),

      // ---- Onboarding ----

      submitOnboarding: async (userId, data) => {
        await submitOnboardingToDB(userId, data);

        // Calculate age from DOB
        const dob = new Date(data.dateOfBirth);
        const age = Math.floor((Date.now() - dob.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        const isMinor = age < 18;

        const profile: UserProfile = {
          userId,
          nickname: data.nickname,
          dateOfBirth: data.dateOfBirth,
          age,
          pronouns: data.pronouns,
          lifeStage: data.lifeStage as UserProfile['lifeStage'],
          cycleStatus: data.cycleStatus,
          cycleLength: data.cycleLength,
          symptoms: data.symptoms,
          symptomDuration: data.symptomDuration,
          dismissalHistory: data.dismissalHistory,
          diagnosedConditions: data.diagnosedConditions,
          familyHistory: data.familyHistory,
          goals: data.goals,
          urgencyScore: data.urgencyScore,
          communicationStyle: data.communicationStyle,
          reminderPreferences: data.reminderPreferences,
          hasDoctor: data.hasDoctor,
          isMinor,
          onboardingComplete: true,
        };

        const { currentUser } = get();
        saveCachedProfile({ ...profile, email: currentUser?.email });

        set({
          userProfile: profile,
          onboardingComplete: true,
          currentUser: currentUser
            ? { ...currentUser, name: data.nickname, age, lifeStage: data.lifeStage as User['lifeStage'], cycleLength: data.cycleLength }
            : currentUser,
          conversations: [{
            id: `conv-${userId}`,
            userId,
            topic: 'Your health journey',
            messages: [],
            createdAt: new Date().toISOString(),
          }],
        });
      },

      setOnboardingComplete: (complete) => set({ onboardingComplete: complete }),

      // ---- Data ----

      addSymptomLog: (log) => set(s => {
        const symptomLogs = [log, ...s.symptomLogs];
        const patterns = s.currentUser ? detectPatterns(symptomLogs, s.currentUser.id) : s.patterns;
        const doctorPrep = s.currentUser && shouldGenerateDoctorPrep(symptomLogs, s.doctorPrep, s.currentUser.id)
          ? buildDoctorPrepReport(s.currentUser, symptomLogs, patterns)
          : s.doctorPrep;

        return { symptomLogs, patterns, doctorPrep };
      }),

      refreshDoctorPrep: () => set(s => {
        if (!s.currentUser || !shouldGenerateDoctorPrep(s.symptomLogs, s.doctorPrep, s.currentUser.id)) {
          return {};
        }

        const patterns = detectPatterns(s.symptomLogs, s.currentUser.id);
        return {
          patterns,
          doctorPrep: buildDoctorPrepReport(s.currentUser, s.symptomLogs, patterns),
        };
      }),

      markPatternRead: (id) => set(s => ({
        patterns: s.patterns.map(p => p.id === id ? { ...p, isRead: true } : p),
      })),

      addConversationMessage: (convId, message) => set(s => ({
        conversations: s.conversations.map(c =>
          c.id === convId ? { ...c, messages: [...c.messages, message] } : c
        ),
      })),

      addConversation: (conv) => set(s => ({
        conversations: [...s.conversations, conv],
      })),

      // ---- UI ----

      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setCurrentView: (view) => set({ currentView: view }),
    }),
    {
      name: 'bloom-session',
      // Only persist auth state + view, not large data arrays (those are re-fetched from Supabase)
      partialize: (s) => ({
        isAuthenticated: s.isAuthenticated,
        currentUser: s.currentUser,
        userProfile: s.userProfile,
        isDemoMode: s.isDemoMode,
        onboardingComplete: s.onboardingComplete,
        currentView: s.currentView,
        // Demo users persist their data (no DB to re-fetch from)
        symptomLogs: s.isDemoMode ? s.symptomLogs : [],
        patterns: s.isDemoMode ? s.patterns : [],
        conversations: s.isDemoMode ? s.conversations : [],
        doctorPrep: s.doctorPrep,
      }),
    }
  )
);
