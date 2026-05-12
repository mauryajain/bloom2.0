// ============================================================
// BLOOM - Demo Data
// Seven life-stage demos with full profiles, 90-day logs, alerts,
// Ask Bloom history, and doctor-ready reports.
// ============================================================

import { format, subDays } from 'date-fns';
import type {
  AskBloomConversation,
  CommunicationStyle,
  DemoUser,
  DoctorPrepReport,
  LifeStage,
  PatternAlert,
  Severity,
  SymptomCategory,
  SymptomLog,
  User,
  UserProfile,
} from '../types';

const today = new Date();
const dateRange = {
  start: format(subDays(today, 89), 'yyyy-MM-dd'),
  end: format(today, 'yyyy-MM-dd'),
};

type DemoScenario = {
  id: string;
  name: string;
  email: string;
  age: number;
  lifeStage: LifeStage;
  cycleLength: number;
  pronouns?: string;
  cycleStatus: string;
  symptomDuration: string;
  dismissalHistory: string[];
  diagnosedConditions: string[];
  familyHistory: string[];
  goals: string[];
  urgencyScore: number;
  communicationStyle: CommunicationStyle;
  reminderPreferences: string[];
  hasDoctor: boolean;
  problem: string;
  primarySymptoms: Array<{
    name: string;
    category: SymptomCategory;
    frequency: number;
    severity: [Severity, Severity];
    duration: string;
    location?: string;
  }>;
  moodCycle: string[];
  energyBase: number;
  sleepBase: number;
  cycleLengths?: number[];
  tags?: string[];
  notes: string[];
  patterns: Array<{
    title: string;
    description: string;
    pattern: string;
    conditionsFlagged: string[];
    confidence: number;
    severity: PatternAlert['severity'];
    recommendation: string;
    dataPoints: number;
  }>;
  questions: string[];
  conversation: {
    topic: string;
    user: string;
    assistant: string;
    sources: string[];
  };
  cycleIrregularities: string[];
};

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const uid = (prefix: string, i: number) => `${prefix}-${i.toString().padStart(4, '0')}`;

const shouldInclude = (day: number, symptomIndex: number, frequency: number) => {
  const wave = ((day * 17 + symptomIndex * 31) % 100) / 100;
  return wave < frequency;
};

const severityFor = (day: number, symptomIndex: number, range: [Severity, Severity]): Severity => {
  const [min, max] = range;
  const span = max - min + 1;
  return (min + ((day + symptomIndex * 2) % span)) as Severity;
};

function buildCycleDay(scenario: DemoScenario, dayIndex: number): number | null {
  if (['pregnancy', 'menopause', 'post-menopause'].includes(scenario.lifeStage)) return null;
  if (scenario.lifeStage === 'postpartum') return dayIndex > 55 ? ((dayIndex - 55) % 32) + 1 : null;

  const lengths = scenario.cycleLengths ?? [scenario.cycleLength];
  let cursor = 0;
  for (const length of lengths) {
    if (dayIndex < cursor + length) return dayIndex - cursor + 1;
    cursor += length;
  }

  const lastLength = lengths[lengths.length - 1] ?? scenario.cycleLength;
  return ((dayIndex - cursor) % lastLength) + 1;
}

function generateLogs(scenario: DemoScenario): SymptomLog[] {
  return Array.from({ length: 90 }, (_, index) => {
    const date = subDays(today, 89 - index);
    const cycleDay = buildCycleDay(scenario, index);
    const isPeriod = typeof cycleDay === 'number' && cycleDay <= 5;
    const isLuteal = typeof cycleDay === 'number' && cycleDay >= 18;
    const isOvulation = typeof cycleDay === 'number' && cycleDay >= 13 && cycleDay <= 16;

    const symptoms = scenario.primarySymptoms
      .filter((symptom, symptomIndex) => {
        const phaseBoost =
          (isPeriod && ['Cramping', 'Pelvic Pain', 'Heavy Bleeding'].includes(symptom.name)) ||
          (isLuteal && ['Mood Swings', 'Anxiety', 'Fatigue'].includes(symptom.name)) ||
          (isOvulation && ['Pelvic Pain', 'Bloating'].includes(symptom.name));
        return phaseBoost || shouldInclude(index, symptomIndex, symptom.frequency);
      })
      .map((symptom, symptomIndex) => ({
        id: uid(`${scenario.id}-sym`, index * 10 + symptomIndex),
        name: symptom.name,
        category: symptom.category,
        severity: severityFor(index, symptomIndex, symptom.severity),
        duration: symptom.duration,
        location: symptom.location,
      }));

    const lowSleep =
      symptoms.some(symptom => ['Night Sweats', 'Insomnia', 'Newborn Wakeups'].includes(symptom.name)) ||
      scenario.lifeStage === 'postpartum';
    const sleepHours = clamp(scenario.sleepBase + (lowSleep ? -1.7 : (index % 3) * 0.3), 3.5, 8.5);
    const energy = clamp(scenario.energyBase - (symptoms.length > 3 ? 2 : symptoms.length > 1 ? 1 : 0) + (index % 4 === 0 ? 1 : 0), 1, 10);
    const note = scenario.notes[index % scenario.notes.length] ?? '';

    return {
      id: uid(`${scenario.id}-log`, index),
      userId: scenario.id,
      date: format(date, 'yyyy-MM-dd'),
      cycleDay,
      symptoms,
      mood: {
        primary: scenario.moodCycle[index % scenario.moodCycle.length],
        secondary: isLuteal ? ['Sensitive'] : [],
        score: clamp(energy - (lowSleep ? 1 : 0), 1, 10),
      },
      energy,
      sleep: {
        hours: Number(sleepHours.toFixed(1)),
        quality: clamp(Math.round(sleepHours - 2), 1, 5) as Severity,
        disturbances: lowSleep ? ['Interrupted sleep'] : [],
      },
      notes: index % 9 === 0 ? note : '',
      tags: [
        ...(isPeriod ? ['period'] : []),
        ...(isOvulation ? ['ovulation'] : []),
        ...(scenario.tags ?? []).filter((_, tagIndex) => (index + tagIndex) % 13 === 0),
      ],
      createdAt: date.toISOString(),
    };
  });
}

const buildProfile = (scenario: DemoScenario): UserProfile => ({
  userId: scenario.id,
  nickname: scenario.name.split(' ')[0],
  dateOfBirth: '',
  age: scenario.age,
  pronouns: scenario.pronouns ?? 'she/her',
  lifeStage: scenario.lifeStage,
  cycleStatus: scenario.cycleStatus,
  cycleLength: scenario.cycleLength,
  symptoms: scenario.primarySymptoms.map(symptom => symptom.name),
  symptomDuration: scenario.symptomDuration,
  dismissalHistory: scenario.dismissalHistory,
  diagnosedConditions: scenario.diagnosedConditions,
  familyHistory: scenario.familyHistory,
  goals: scenario.goals,
  urgencyScore: scenario.urgencyScore,
  communicationStyle: scenario.communicationStyle,
  reminderPreferences: scenario.reminderPreferences,
  hasDoctor: scenario.hasDoctor,
  isMinor: scenario.age < 18,
  onboardingComplete: true,
});

const buildPatterns = (scenario: DemoScenario): PatternAlert[] =>
  scenario.patterns.map((pattern, index) => ({
    id: `pat-${scenario.id}-${index + 1}`,
    userId: scenario.id,
    type: index === 0 ? 'pattern' : 'trend',
    ...pattern,
    dateRange,
    isRead: index > 1,
    createdAt: subDays(today, index + 1).toISOString(),
  }));

const buildConversation = (scenario: DemoScenario): AskBloomConversation => ({
  id: `conv-${scenario.id}-1`,
  userId: scenario.id,
  topic: scenario.conversation.topic,
  messages: [
    {
      id: `msg-${scenario.id}-1`,
      role: 'user',
      content: scenario.conversation.user,
      timestamp: subDays(today, 4).toISOString(),
    },
    {
      id: `msg-${scenario.id}-2`,
      role: 'assistant',
      content: scenario.conversation.assistant,
      timestamp: subDays(today, 4).toISOString(),
      sources: scenario.conversation.sources,
      disclaimer: 'This is informational pattern support, not medical advice or a diagnosis.',
    },
  ],
  createdAt: subDays(today, 4).toISOString(),
});

const topSymptomsFromLogs = (logs: SymptomLog[]) => {
  const counts = new Map<string, { frequency: number; severity: number }>();
  logs.forEach(log => {
    log.symptoms.forEach(symptom => {
      const current = counts.get(symptom.name) ?? { frequency: 0, severity: 0 };
      current.frequency += 1;
      current.severity += symptom.severity;
      counts.set(symptom.name, current);
    });
  });

  return [...counts.entries()]
    .map(([name, stat]) => ({
      name,
      frequency: stat.frequency,
      avgSeverity: Number((stat.severity / stat.frequency).toFixed(1)),
    }))
    .sort((a, b) => b.frequency - a.frequency || b.avgSeverity - a.avgSeverity)
    .slice(0, 6);
};

const buildDoctorPrep = (
  scenario: DemoScenario,
  logs: SymptomLog[],
  patterns: PatternAlert[]
): DoctorPrepReport => ({
  id: `prep-${scenario.id}-1`,
  userId: scenario.id,
  generatedAt: subDays(today, 1).toISOString(),
  dateRange,
  summary: `90-day summary for ${scenario.name} (age ${scenario.age}, ${scenario.lifeStage.replace('-', ' ')}). Main concern: ${scenario.problem}. Bloom has grouped symptom timing, severity, sleep, mood, and cycle context so the next care conversation can be more specific.`,
  topSymptoms: topSymptomsFromLogs(logs),
  patterns,
  questions: scenario.questions,
  timeline: logs
    .filter(log => log.symptoms.length > 2 || log.notes)
    .slice(-7)
    .map(log => ({
      date: log.date,
      event: log.notes || log.symptoms.slice(0, 2).map(symptom => `${symptom.name} (${symptom.severity}/5)`).join(', '),
    })),
  cycleData: {
    avgLength: scenario.cycleLength,
    irregularities: scenario.cycleIrregularities,
  },
});

const scenarios: DemoScenario[] = [
  {
    id: 'demo-mia',
    name: 'Mia Rodriguez',
    email: 'mia@demo.bloom',
    age: 15,
    lifeStage: 'puberty',
    cycleLength: 34,
    cycleStatus: 'irregular first years',
    symptomDuration: '6-12 months',
    dismissalHistory: ['Told severe cramps are just part of growing up'],
    diagnosedConditions: [],
    familyHistory: ['Mother had heavy periods as a teen'],
    goals: ['understand what is normal', 'know when to ask for help', 'track school-impacting symptoms'],
    urgencyScore: 4,
    communicationStyle: 'warm',
    reminderPreferences: ['period reminders', 'symptom check-ins'],
    hasDoctor: true,
    problem: 'irregular early cycles with heavy cramps, acne flares, and school absences',
    primarySymptoms: [
      { name: 'Cramping', category: 'pain', frequency: 0.28, severity: [2, 5], duration: 'Few hours', location: 'Lower abdomen' },
      { name: 'Heavy Bleeding', category: 'reproductive', frequency: 0.18, severity: [3, 5], duration: '2-3 days' },
      { name: 'Acne Flare', category: 'skin', frequency: 0.36, severity: [1, 3], duration: 'Several days' },
      { name: 'Mood Swings', category: 'mood', frequency: 0.32, severity: [2, 4], duration: 'Evening' },
      { name: 'Headache', category: 'pain', frequency: 0.18, severity: [1, 3], duration: 'Few hours' },
    ],
    moodCycle: ['Curious', 'Anxious', 'Okay', 'Irritable', 'Hopeful'],
    energyBase: 7,
    sleepBase: 7.2,
    cycleLengths: [33, 41, 29],
    tags: ['school-day', 'new-cycle'],
    notes: ['Cramps were strong enough to miss practice.', 'Felt embarrassed about unexpected bleeding.', 'Skin flare started before period.'],
    patterns: [
      {
        title: 'Teen Cycle Irregularity With High-Pain Days',
        description: 'Mia has irregular cycles, which can be common in puberty, but pain and heavy bleeding cluster on days that affect school and activities.',
        pattern: 'Cycle lengths vary from 29-41 days, with cramping severity reaching 4-5/5 during bleeding days.',
        conditionsFlagged: ['Puberty transition', 'Heavy menstrual bleeding'],
        confidence: 0.78,
        severity: 'medium',
        recommendation: 'Track pad/tampon changes and missed activities. Bring the pattern to a pediatrician or gynecologist if heavy bleeding or severe pain continues.',
        dataPoints: 39,
      },
    ],
    questions: [
      'Are my cycle changes normal for the first few years of periods?',
      'How much bleeding is too much for my age?',
      'What can I do for cramps that make me miss school or practice?',
      'Could acne and mood changes be connected to my cycle?',
    ],
    conversation: {
      topic: 'Teen cycles and what is normal',
      user: 'My periods are not regular yet and sometimes the pain makes me miss school. Should I worry?',
      assistant: 'Irregular cycles can be common during puberty, especially in the first few years. What stands out in your Bloom logs is the impact: pain reaches 4-5/5 on bleeding days and has affected school or practice. That does not mean something is wrong, but it is specific enough to bring to a trusted adult and clinician.',
      sources: ['90-day symptom logs', 'Puberty life-stage guide'],
    },
    cycleIrregularities: ['Cycles vary between 29 and 41 days', 'Heavy bleeding appears in first 2-3 days'],
  },
  {
    id: 'demo-sarah',
    name: 'Sarah Mitchell',
    email: 'sarah@demo.bloom',
    age: 29,
    lifeStage: 'reproductive',
    cycleLength: 28,
    cycleStatus: 'regular',
    symptomDuration: 'More than 12 months',
    dismissalHistory: ['Told severe pain was normal period pain'],
    diagnosedConditions: [],
    familyHistory: ['Aunt diagnosed with endometriosis'],
    goals: ['identify pain patterns', 'prepare for doctor visits', 'understand possible conditions'],
    urgencyScore: 5,
    communicationStyle: 'balanced',
    reminderPreferences: ['daily symptom check-ins', 'doctor prep reminders'],
    hasDoctor: true,
    problem: 'recurring severe pelvic pain with bloating, fatigue, and ovulation-window pain',
    primarySymptoms: [
      { name: 'Pelvic Pain', category: 'pain', frequency: 0.42, severity: [3, 5], duration: 'All day', location: 'Lower abdomen' },
      { name: 'Bloating', category: 'digestive', frequency: 0.52, severity: [2, 4], duration: 'Afternoon' },
      { name: 'Fatigue', category: 'energy', frequency: 0.58, severity: [2, 4], duration: 'All day' },
      { name: 'Cramping', category: 'pain', frequency: 0.36, severity: [3, 5], duration: 'Several hours', location: 'Pelvis' },
      { name: 'Nausea', category: 'digestive', frequency: 0.22, severity: [1, 3], duration: 'Morning' },
      { name: 'Brain Fog', category: 'cognitive', frequency: 0.25, severity: [1, 3], duration: 'Workday' },
    ],
    moodCycle: ['Calm', 'Anxious', 'Irritable', 'Focused', 'Tired'],
    energyBase: 7,
    sleepBase: 7,
    cycleLengths: [28, 28, 28, 28],
    tags: ['heavy-flow', 'missed-work'],
    notes: ['Period started. Heavy flow and severe cramps.', 'Mid-cycle pain with bloating.', 'Pain made it difficult to focus at work.'],
    patterns: [
      {
        title: 'Recurring Severe Pelvic Pain During Menstruation',
        description: 'Pelvic pain consistently reaches severity 4-5 during days 1-5 of the cycle.',
        pattern: 'Severe pelvic pain appears across 3 consecutive cycles, with bloating and fatigue in the same window.',
        conditionsFlagged: ['Endometriosis', 'Adenomyosis'],
        confidence: 0.85,
        severity: 'high',
        recommendation: 'Bring this cyclical pain pattern to a gynecologist and ask whether imaging or endometriosis evaluation is appropriate.',
        dataPoints: 47,
      },
      {
        title: 'Ovulation-Window Pain',
        description: 'Moderate pelvic pain appears around cycle days 13-16.',
        pattern: 'Mid-cycle pain occurs in each observed cycle, usually alongside bloating.',
        conditionsFlagged: ['Ovarian cysts', 'Endometriosis'],
        confidence: 0.58,
        severity: 'medium',
        recommendation: 'Mention the timing and severity alongside menstrual pain so the whole pattern is reviewed.',
        dataPoints: 12,
      },
    ],
    questions: [
      'Could my cyclical pelvic pain suggest endometriosis or adenomyosis?',
      'Would ultrasound or MRI help investigate the pain?',
      'What are my options if over-the-counter medication is not enough?',
      'Could my mid-cycle pain be connected to the menstrual pain?',
    ],
    conversation: {
      topic: 'Understanding pelvic pain patterns',
      user: 'My period cramps have been getting worse over the past few months. Is this normal?',
      assistant: 'Your logs show pelvic pain clustering strongly on cycle days 1-5, with severity often at 4-5/5 and related bloating and fatigue. Some cramping is common, but the severity, repetition, and effect on daily life are worth discussing with a gynecologist.',
      sources: ['90-day symptom logs', 'Endometriosis research dataset'],
    },
    cycleIrregularities: ['Pain severity above typical range', 'Heavy flow days 1-3'],
  },
  {
    id: 'demo-elena',
    name: 'Elena Brooks',
    email: 'elena@demo.bloom',
    age: 32,
    lifeStage: 'pregnancy',
    cycleLength: 0,
    cycleStatus: 'pregnant - no cycle tracking',
    symptomDuration: 'Current pregnancy',
    dismissalHistory: [],
    diagnosedConditions: ['Pregnancy'],
    familyHistory: ['Family history of gestational diabetes'],
    goals: ['track pregnancy symptoms', 'prepare appointment questions', 'notice changes early'],
    urgencyScore: 3,
    communicationStyle: 'clinical',
    reminderPreferences: ['weekly summaries', 'appointment prep'],
    hasDoctor: true,
    problem: 'pregnancy nausea, fatigue, swelling, and sleep changes that need appointment-ready tracking',
    primarySymptoms: [
      { name: 'Nausea', category: 'digestive', frequency: 0.66, severity: [2, 4], duration: 'Morning' },
      { name: 'Fatigue', category: 'energy', frequency: 0.7, severity: [2, 4], duration: 'All day' },
      { name: 'Back Pain', category: 'pain', frequency: 0.38, severity: [1, 3], duration: 'Evening', location: 'Lower back' },
      { name: 'Swelling', category: 'other', frequency: 0.22, severity: [1, 3], duration: 'Evening', location: 'Ankles' },
      { name: 'Insomnia', category: 'sleep', frequency: 0.3, severity: [1, 3], duration: 'Night' },
      { name: 'Heartburn', category: 'digestive', frequency: 0.32, severity: [1, 3], duration: 'After meals' },
    ],
    moodCycle: ['Hopeful', 'Tired', 'Sensitive', 'Calm', 'Excited'],
    energyBase: 6,
    sleepBase: 6.8,
    tags: ['prenatal', 'appointment'],
    notes: ['Nausea worse before breakfast.', 'Swelling after standing for a long time.', 'Writing this down for prenatal visit.'],
    patterns: [
      {
        title: 'Pregnancy Nausea and Fatigue Cluster',
        description: 'Nausea and fatigue are frequent and often occur together, especially earlier in the day.',
        pattern: 'Nausea appears on roughly two-thirds of tracked days and overlaps with fatigue on high-symptom days.',
        conditionsFlagged: ['Pregnancy symptom pattern'],
        confidence: 0.81,
        severity: 'medium',
        recommendation: 'Review hydration, food timing, and medication options with the prenatal care team if nausea affects eating or daily functioning.',
        dataPoints: 74,
      },
      {
        title: 'Evening Swelling Watch',
        description: 'Mild swelling is tracked in the evening after long standing periods.',
        pattern: 'Swelling appears intermittently and is usually mild, with no severe headache logs in the same window.',
        conditionsFlagged: ['Pregnancy swelling'],
        confidence: 0.63,
        severity: 'low',
        recommendation: 'Continue monitoring swelling and contact care promptly if it becomes sudden, severe, or comes with headache or vision changes.',
        dataPoints: 20,
      },
    ],
    questions: [
      'What nausea options are safe for me during pregnancy?',
      'When is swelling normal, and when should I call urgently?',
      'Should my family history change screening plans?',
      'What sleep changes are expected at this stage?',
    ],
    conversation: {
      topic: 'Pregnancy symptoms before a prenatal visit',
      user: 'I want to know what to bring up at my next prenatal appointment.',
      assistant: 'Your most repeated logs are nausea, fatigue, heartburn, and evening swelling. For your appointment, it would help to share frequency, what affects eating or sleep, and that swelling is currently mild and later in the day. Ask what changes should trigger an urgent call.',
      sources: ['90-day symptom logs', 'Pregnancy life-stage guide'],
    },
    cycleIrregularities: ['Cycle tracking paused during pregnancy'],
  },
  {
    id: 'demo-noor',
    name: 'Noor Ahmed',
    email: 'noor@demo.bloom',
    age: 34,
    lifeStage: 'postpartum',
    cycleLength: 32,
    cycleStatus: 'cycle returning postpartum',
    symptomDuration: '0-6 months',
    dismissalHistory: ['Felt pressure to say recovery was fine'],
    diagnosedConditions: ['Postpartum recovery'],
    familyHistory: ['Family history of depression'],
    goals: ['track recovery', 'monitor mood', 'prepare postpartum checkup'],
    urgencyScore: 4,
    communicationStyle: 'warm',
    reminderPreferences: ['mood check-ins', 'sleep check-ins'],
    hasDoctor: true,
    problem: 'postpartum sleep disruption, mood dips, bleeding changes, and recovery pain',
    primarySymptoms: [
      { name: 'Newborn Wakeups', category: 'sleep', frequency: 0.82, severity: [2, 5], duration: 'Night' },
      { name: 'Mood Dips', category: 'mood', frequency: 0.42, severity: [2, 4], duration: 'Afternoon' },
      { name: 'Pelvic Floor Pain', category: 'pain', frequency: 0.36, severity: [1, 4], duration: 'After activity', location: 'Pelvis' },
      { name: 'Breast Pain', category: 'pain', frequency: 0.28, severity: [1, 3], duration: 'Feeding window' },
      { name: 'Spotting', category: 'reproductive', frequency: 0.18, severity: [1, 2], duration: 'Intermittent' },
      { name: 'Fatigue', category: 'energy', frequency: 0.76, severity: [2, 5], duration: 'All day' },
    ],
    moodCycle: ['Tender', 'Overwhelmed', 'Grateful', 'Tearful', 'Calm'],
    energyBase: 5,
    sleepBase: 5.4,
    tags: ['postpartum', 'feeding'],
    notes: ['Sleep came in short stretches.', 'Mood dipped late afternoon.', 'Pelvic pressure after longer walk.'],
    patterns: [
      {
        title: 'Sleep Disruption Driving Fatigue and Mood Dips',
        description: 'Interrupted sleep appears nearly daily and overlaps with fatigue and lower mood scores.',
        pattern: 'Newborn wakeups and fatigue co-occur on most tracked days, with mood dips more likely after nights under 5 hours.',
        conditionsFlagged: ['Postpartum recovery', 'Postpartum mood monitoring'],
        confidence: 0.86,
        severity: 'medium',
        recommendation: 'Share the sleep and mood pattern at the postpartum visit, especially with family history of depression.',
        dataPoints: 88,
      },
      {
        title: 'Activity-Linked Pelvic Floor Pain',
        description: 'Pelvic floor pain increases after longer activity windows.',
        pattern: 'Pain is usually mild to moderate and appears after activity rather than constantly.',
        conditionsFlagged: ['Postpartum pelvic floor recovery'],
        confidence: 0.67,
        severity: 'medium',
        recommendation: 'Ask whether pelvic floor physical therapy would be appropriate during recovery.',
        dataPoints: 32,
      },
    ],
    questions: [
      'Do my mood and sleep logs suggest I should screen for postpartum depression or anxiety?',
      'Is pelvic floor physical therapy appropriate for this pain pattern?',
      'What bleeding or spotting changes are not expected at this stage?',
      'How can I protect recovery while caring for a newborn?',
    ],
    conversation: {
      topic: 'Postpartum mood, sleep, and recovery',
      user: 'I am exhausted and sometimes I feel low. Is this just normal postpartum?',
      assistant: 'Postpartum can be exhausting, and your logs show a clear sleep-fatigue-mood connection. Because mood dips are recurring and you have a family history of depression, it would be wise to bring this directly to your postpartum clinician rather than minimizing it.',
      sources: ['90-day symptom logs', 'Postpartum life-stage guide'],
    },
    cycleIrregularities: ['Cycle returned after day 55', 'Spotting is intermittent'],
  },
  {
    id: 'demo-priya',
    name: 'Priya Sharma',
    email: 'priya@demo.bloom',
    age: 47,
    lifeStage: 'perimenopause',
    cycleLength: 38,
    cycleStatus: 'irregular and lengthening',
    symptomDuration: '6-12 months',
    dismissalHistory: ['Told she was too young for menopause symptoms'],
    diagnosedConditions: [],
    familyHistory: ['Mother reached menopause at 49'],
    goals: ['understand perimenopause', 'manage sleep', 'prepare treatment questions'],
    urgencyScore: 4,
    communicationStyle: 'balanced',
    reminderPreferences: ['sleep check-ins', 'cycle reminders'],
    hasDoctor: true,
    problem: 'hot flashes, night sweats, brain fog, joint pain, and lengthening cycles',
    primarySymptoms: [
      { name: 'Hot Flash', category: 'other', frequency: 0.62, severity: [2, 4], duration: '2-5 minutes' },
      { name: 'Night Sweats', category: 'sleep', frequency: 0.5, severity: [2, 4], duration: 'Night' },
      { name: 'Brain Fog', category: 'cognitive', frequency: 0.52, severity: [1, 3], duration: 'Workday' },
      { name: 'Joint Pain', category: 'pain', frequency: 0.4, severity: [1, 3], duration: 'Morning' },
      { name: 'Mood Swings', category: 'mood', frequency: 0.36, severity: [2, 4], duration: 'Evening' },
      { name: 'Insomnia', category: 'sleep', frequency: 0.42, severity: [2, 4], duration: 'Night' },
    ],
    moodCycle: ['Calm', 'Frustrated', 'Foggy', 'Hopeful', 'Tired'],
    energyBase: 6,
    sleepBase: 6.5,
    cycleLengths: [35, 42, 44],
    tags: ['hot-flash', 'sleep-disrupted'],
    notes: ['Night sweats woke me twice.', 'Forgot words during a meeting.', 'Cycle was longer than usual.'],
    patterns: [
      {
        title: 'Frequent Hot Flashes and Night Sweats',
        description: 'Hot flashes and night sweats appear frequently and disrupt sleep.',
        pattern: 'Vasomotor symptoms appear on more than half of tracked days, with sleep disturbance on many nights.',
        conditionsFlagged: ['Perimenopause'],
        confidence: 0.92,
        severity: 'medium',
        recommendation: 'Discuss evidence-based options for hot flashes, night sweats, and sleep with a healthcare provider.',
        dataPoints: 90,
      },
      {
        title: 'Cycle Length Increasing',
        description: 'Cycle length has shifted from about 35 days to more than 40 days.',
        pattern: 'Observed cycle length increased from 35 to 42-44 days during the tracking period.',
        conditionsFlagged: ['Perimenopause'],
        confidence: 0.82,
        severity: 'low',
        recommendation: 'Continue tracking cycle timing and flow changes so the transition pattern is clear.',
        dataPoints: 3,
      },
    ],
    questions: [
      'Are my symptoms consistent with perimenopause at age 47?',
      'What are the options for managing hot flashes and night sweats?',
      'Should hormone therapy be considered for my profile?',
      'What screenings should I prioritize during this transition?',
    ],
    conversation: {
      topic: 'Understanding perimenopause symptoms',
      user: 'I have hot flashes almost every day. Is this perimenopause?',
      assistant: 'Your logs show hot flashes on many days, night sweats disrupting sleep, brain fog, joint pain, and cycles lengthening from the mid-30s into the 40-day range. That pattern aligns strongly with perimenopause, though a clinician should confirm and discuss options.',
      sources: ['90-day symptom logs', 'Perimenopause life-stage guide'],
    },
    cycleIrregularities: ['Cycle length increased from 35 to 42-44 days', 'Flow becoming lighter'],
  },
  {
    id: 'demo-grace',
    name: 'Grace Chen',
    email: 'grace@demo.bloom',
    age: 52,
    lifeStage: 'menopause',
    cycleLength: 0,
    cycleStatus: '12+ months without period',
    symptomDuration: 'More than 12 months',
    dismissalHistory: ['Symptoms were framed as stress only'],
    diagnosedConditions: ['Menopause'],
    familyHistory: ['Osteoporosis in mother'],
    goals: ['manage sleep and hot flashes', 'track bone and heart health questions', 'understand menopause care'],
    urgencyScore: 3,
    communicationStyle: 'clinical',
    reminderPreferences: ['monthly report', 'screening reminders'],
    hasDoctor: true,
    problem: 'menopause hot flashes, sleep disruption, vaginal dryness, and preventive health questions',
    primarySymptoms: [
      { name: 'Hot Flash', category: 'other', frequency: 0.48, severity: [1, 4], duration: '2-5 minutes' },
      { name: 'Insomnia', category: 'sleep', frequency: 0.46, severity: [2, 4], duration: 'Night' },
      { name: 'Vaginal Dryness', category: 'reproductive', frequency: 0.34, severity: [1, 3], duration: 'Intermittent' },
      { name: 'Mood Changes', category: 'mood', frequency: 0.28, severity: [1, 3], duration: 'Evening' },
      { name: 'Joint Stiffness', category: 'pain', frequency: 0.35, severity: [1, 3], duration: 'Morning' },
      { name: 'Fatigue', category: 'energy', frequency: 0.42, severity: [1, 3], duration: 'Afternoon' },
    ],
    moodCycle: ['Steady', 'Tired', 'Focused', 'Restless', 'Calm'],
    energyBase: 6,
    sleepBase: 6.4,
    tags: ['menopause', 'sleep'],
    notes: ['Hot flash woke me before dawn.', 'Dryness is uncomfortable.', 'Want to ask about bone density screening.'],
    patterns: [
      {
        title: 'Menopause Sleep and Hot Flash Pattern',
        description: 'Hot flashes and insomnia often appear together, especially overnight.',
        pattern: 'Sleep quality drops on nights with hot flashes or insomnia logs.',
        conditionsFlagged: ['Menopause vasomotor symptoms'],
        confidence: 0.79,
        severity: 'medium',
        recommendation: 'Ask about menopause symptom management and whether treatment options fit personal risk factors.',
        dataPoints: 71,
      },
      {
        title: 'Bone Health Conversation Prompt',
        description: 'Family history and menopause stage make preventive screening worth discussing.',
        pattern: 'Joint stiffness and family history appear alongside menopause-stage preventive care priorities.',
        conditionsFlagged: ['Osteoporosis risk discussion'],
        confidence: 0.61,
        severity: 'low',
        recommendation: 'Ask when to schedule bone density screening and what lifestyle or treatment steps are appropriate.',
        dataPoints: 18,
      },
    ],
    questions: [
      'What options can help hot flashes and insomnia after menopause?',
      'Should I have bone density screening now because of family history?',
      'What can help vaginal dryness safely?',
      'What heart health checks should I prioritize after menopause?',
    ],
    conversation: {
      topic: 'Menopause symptom management',
      user: 'I have not had a period for over a year, but hot flashes and sleep issues are still affecting me.',
      assistant: 'Menopause is defined after 12 months without a period, and symptoms can continue beyond that point. Your logs show hot flashes and insomnia overlapping, plus vaginal dryness and morning stiffness. Those are concrete care topics, including symptom relief and preventive screening.',
      sources: ['90-day symptom logs', 'Menopause life-stage guide'],
    },
    cycleIrregularities: ['No period for 12+ months'],
  },
  {
    id: 'demo-lata',
    name: 'Lata Iyer',
    email: 'lata@demo.bloom',
    age: 63,
    lifeStage: 'post-menopause',
    cycleLength: 0,
    cycleStatus: 'post-menopause',
    symptomDuration: 'More than 12 months',
    dismissalHistory: ['Urinary symptoms were treated as inevitable aging'],
    diagnosedConditions: ['Post-menopause'],
    familyHistory: ['Heart disease in father', 'Osteoporosis in sister'],
    goals: ['track long-term health changes', 'prepare preventive care questions', 'monitor urinary and joint symptoms'],
    urgencyScore: 3,
    communicationStyle: 'balanced',
    reminderPreferences: ['monthly report', 'preventive care reminders'],
    hasDoctor: true,
    problem: 'post-menopause urinary symptoms, joint pain, energy changes, and prevention-focused care',
    primarySymptoms: [
      { name: 'Urinary Urgency', category: 'reproductive', frequency: 0.38, severity: [1, 3], duration: 'Intermittent' },
      { name: 'Joint Pain', category: 'pain', frequency: 0.48, severity: [1, 4], duration: 'Morning', location: 'Knees and hands' },
      { name: 'Sleep Disruption', category: 'sleep', frequency: 0.34, severity: [1, 3], duration: 'Night' },
      { name: 'Brain Fog', category: 'cognitive', frequency: 0.24, severity: [1, 3], duration: 'Afternoon' },
      { name: 'Low Energy', category: 'energy', frequency: 0.42, severity: [1, 3], duration: 'Afternoon' },
      { name: 'Vaginal Dryness', category: 'reproductive', frequency: 0.28, severity: [1, 3], duration: 'Intermittent' },
    ],
    moodCycle: ['Steady', 'Reflective', 'Tired', 'Optimistic', 'Calm'],
    energyBase: 7,
    sleepBase: 6.8,
    tags: ['preventive-care', 'post-menopause'],
    notes: ['Urgency was worse after coffee.', 'Joint stiffness eased after walking.', 'Want a concise report for annual visit.'],
    patterns: [
      {
        title: 'Urinary and Vaginal Symptom Cluster',
        description: 'Urinary urgency and vaginal dryness appear repeatedly in the same stage of life.',
        pattern: 'Genitourinary symptoms recur across the tracking period and affect comfort and planning.',
        conditionsFlagged: ['Genitourinary syndrome of menopause discussion'],
        confidence: 0.72,
        severity: 'medium',
        recommendation: 'Discuss urinary urgency and vaginal dryness directly; these symptoms are common but treatable.',
        dataPoints: 46,
      },
      {
        title: 'Joint Pain and Prevention Focus',
        description: 'Joint pain is the most frequent physical symptom, with family history relevant to bone and heart prevention.',
        pattern: 'Morning joint pain recurs, while energy improves on days with walking notes.',
        conditionsFlagged: ['Bone health', 'Heart health prevention'],
        confidence: 0.64,
        severity: 'low',
        recommendation: 'Use the doctor-prep report to ask about bone density, cardiovascular risk, and movement-friendly pain care.',
        dataPoints: 43,
      },
    ],
    questions: [
      'Are urinary urgency and dryness treatable after menopause?',
      'Should I repeat bone density screening because of family history?',
      'How should I evaluate joint pain that is worse in the morning?',
      'What heart health numbers should I track at my annual visit?',
    ],
    conversation: {
      topic: 'Post-menopause preventive care',
      user: 'I want my annual visit to cover more than just basic labs. What should I bring?',
      assistant: 'Your logs highlight urinary urgency, vaginal dryness, joint pain, sleep disruption, and family history of heart and bone concerns. A focused visit could cover genitourinary symptoms, bone density timing, cardiovascular risk, and joint-pain evaluation.',
      sources: ['90-day symptom logs', 'Post-menopause life-stage guide'],
    },
    cycleIrregularities: ['No cycle tracking after menopause'],
  },
];

const buildDemoUser = (scenario: DemoScenario): DemoUser => {
  const logs = generateLogs(scenario);
  const patterns = buildPatterns(scenario);
  return {
    user: {
      id: scenario.id,
      name: scenario.name,
      email: scenario.email,
      age: scenario.age,
      lifeStage: scenario.lifeStage,
      cycleLength: scenario.cycleLength,
      preferences: {
        theme: 'auto',
        notifications: true,
        dataSharing: false,
        lifeStageAdaptive: true,
      },
      createdAt: subDays(today, 90).toISOString(),
    },
    profile: buildProfile(scenario),
    symptomLogs: logs,
    patterns,
    conversations: [buildConversation(scenario)],
    doctorPrep: buildDoctorPrep(scenario, logs, patterns),
  };
};

export const demoUsers: DemoUser[] = scenarios.map(buildDemoUser);

export const getDemoUser = (id: string) => demoUsers.find(demo => demo.user.id === id);
