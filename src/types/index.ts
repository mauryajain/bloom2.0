// ============================================================
// BLOOM — Core Type Definitions
// ============================================================

export type LifeStage =
  | 'puberty'
  | 'reproductive'
  | 'pregnancy'
  | 'postpartum'
  | 'perimenopause'
  | 'menopause'
  | 'post-menopause';

export type SymptomCategory =
  | 'pain'
  | 'mood'
  | 'energy'
  | 'digestive'
  | 'sleep'
  | 'reproductive'
  | 'skin'
  | 'cognitive'
  | 'other';

export type Severity = 1 | 2 | 3 | 4 | 5;

export type CommunicationStyle = 'warm' | 'clinical' | 'balanced';

// ---- Auth & User ----

export interface User {
  id: string;
  name: string;
  email: string;
  age: number;
  lifeStage: LifeStage;
  cycleLength: number;
  preferences: UserPreferences;
  createdAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  dataSharing: boolean;
  lifeStageAdaptive: boolean;
}

// ---- Full User Profile (from DB) ----

export interface UserProfile {
  userId: string;
  nickname: string;
  dateOfBirth: string;
  age: number;
  pronouns: string;
  lifeStage: LifeStage;
  cycleStatus: string;
  cycleLength: number;
  symptoms: string[];
  symptomDuration: string;
  dismissalHistory: string[];
  diagnosedConditions: string[];
  familyHistory: string[];
  goals: string[];
  urgencyScore: number;
  communicationStyle: CommunicationStyle;
  reminderPreferences: string[];
  hasDoctor: boolean;
  isMinor: boolean;
  onboardingComplete: boolean;
}

// ---- Onboarding ----

export interface OnboardingData {
  // Step 1
  nickname: string;
  dateOfBirth: string;
  pronouns: string;
  // Step 2
  lifeStage: LifeStage | '';
  cycleStatus: string;
  cycleLength: number;
  // Step 3
  symptoms: string[];
  symptomDuration: string;
  dismissalHistory: string[];
  // Step 4
  diagnosedConditions: string[];
  familyHistory: string[];
  // Step 5
  goals: string[];
  urgencyScore: number;
  // Step 6
  communicationStyle: CommunicationStyle;
  reminderPreferences: string[];
  hasDoctor: boolean;
}

// ---- Symptom Tracking ----

export interface SymptomLog {
  id: string;
  userId: string;
  date: string;
  cycleDay: number | null;
  symptoms: SymptomEntry[];
  mood: MoodEntry | null;
  energy: number;
  sleep: SleepEntry | null;
  notes: string;
  tags: string[];
  createdAt: string;
}

export interface SymptomEntry {
  id: string;
  name: string;
  category: SymptomCategory;
  severity: Severity;
  duration: string;
  location?: string;
}

export interface MoodEntry {
  primary: string;
  secondary: string[];
  score: number;
}

export interface SleepEntry {
  hours: number;
  quality: Severity;
  disturbances: string[];
}

// ---- Patterns & AI ----

export interface PatternAlert {
  id: string;
  userId: string;
  type: 'pattern' | 'trend' | 'anomaly' | 'emergency';
  title: string;
  description: string;
  pattern: string;
  conditionsFlagged: string[];
  confidence: number;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  recommendation: string;
  dataPoints: number;
  dateRange: { start: string; end: string };
  isRead: boolean;
  createdAt: string;
}

export interface Condition {
  id: string;
  name: string;
  category: string;
  description: string;
  prevalence: string;
  commonSymptoms: string[];
  relatedConditions: string[];
  commonMisdiagnoses: string[];
  averageDiagnosisTime: string;
  lifeStageRelevance: LifeStage[];
  whenToSeeDoctor: string[];
  references: string[];
}

export interface ResearchSymptom {
  name: string;
  probability: number;
  avg_severity: number;
}

export interface ResearchPattern {
  description: string;
  frequency: string;
  cycle_phase: string;
}

export interface ResearchDataset {
  conditionId: string;
  condition: string;
  symptoms: ResearchSymptom[];
  patterns: ResearchPattern[];
  misdiagnoses: string[];
  avg_diagnosis_delay: string;
  life_stages: string[];
}

export interface LifeStageInfo {
  stage: LifeStage;
  ageRange: string;
  description: string;
  commonExperiences: string[];
  bodySignals: string[];
  intimacyAndRelationships: string[];
  prioritySymptoms: string[];
  uiTheme: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

export interface DoctorPrepReport {
  id: string;
  userId: string;
  generatedAt: string;
  dateRange: { start: string; end: string };
  summary: string;
  topSymptoms: { name: string; frequency: number; avgSeverity: number }[];
  patterns: PatternAlert[];
  questions: string[];
  timeline: { date: string; event: string }[];
  cycleData: { avgLength: number; irregularities: string[] };
}

// ---- Body Forecast ----

export interface DayForecast {
  date: string;
  dayName: string;
  riskLevel: 'low' | 'moderate' | 'high' | 'severe';
  predictedSymptoms: { name: string; probability: number }[];
  energyPrediction: number;
  confidence: number;
  recommendation: string;
}

export interface BodyForecast {
  id: string;
  userId: string;
  generatedAt: string;
  weekStart: string;
  weekEnd: string;
  days: DayForecast[];
  overallWarning: string;
  keyRecommendations: string[];
  disclaimer: string;
}

export interface AskBloomMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: string[];
  disclaimer?: string;
  isEmergency?: boolean;
}

export interface AskBloomConversation {
  id: string;
  userId: string;
  messages: AskBloomMessage[];
  topic: string;
  createdAt: string;
}

export interface DemoUser {
  user: User;
  profile: UserProfile;
  symptomLogs: SymptomLog[];
  patterns: PatternAlert[];
  conversations: AskBloomConversation[];
  doctorPrep: DoctorPrepReport;
}

// ---- Registration & Questionnaire ----

export interface QuestionnaireData {
  // Step 1 — Personal Info
  name: string;
  dateOfBirth: string;
  gender: string;
  pronouns: string;

  // Step 2 — Cycle Info
  lastPeriodStart: string;
  avgCycleLength: number;
  avgPeriodDuration: number;
  cycleRegularity: string;
  flowIntensity: string;

  // Step 3 — Symptoms & Health
  experiencePms: string;
  commonSymptoms: string[];
  painLevel: number;
  diagnosedConditions: string[];
  currentBirthControl: string;

  // Step 4 — Lifestyle
  tryingToConceive: string;
  avgSleepHours: number;
  exerciseFrequency: string;
  stressLevel: string;
  dietaryPreference: string;

  // Step 5 — Goals & Preferences
  primaryGoal: string;
  trackedBefore: string;
  doctorSummaries: string;
  heardAbout: string;
}

