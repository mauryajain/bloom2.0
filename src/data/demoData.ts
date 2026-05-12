// ============================================================
// BLOOM — Demo Data Generator
// Agent 4 (Content Lead) — 90-day symptom logs + patterns
// ============================================================

import { User, SymptomLog, PatternAlert, AskBloomConversation, DoctorPrepReport, DemoUser } from '../types';
import { format, subDays } from 'date-fns';

const uid = (prefix: string, i: number) => `${prefix}-${i.toString().padStart(4, '0')}`;
const today = new Date();

// ---- DEMO USER 1: Sarah — Endometriosis Case ----
const sarahUser: User = {
  id: 'demo-sarah',
  name: 'Sarah Mitchell',
  email: 'sarah@demo.bloom',
  age: 29,
  lifeStage: 'reproductive',
  cycleLength: 28,
  preferences: { theme: 'auto', notifications: true, dataSharing: false, lifeStageAdaptive: true },
  createdAt: subDays(today, 90).toISOString()
};

function generateSarahLogs(): SymptomLog[] {
  const logs: SymptomLog[] = [];
  const symptoms = [
    { name: 'Pelvic Pain', category: 'pain' as const },
    { name: 'Bloating', category: 'digestive' as const },
    { name: 'Fatigue', category: 'energy' as const },
    { name: 'Cramping', category: 'pain' as const },
    { name: 'Nausea', category: 'digestive' as const },
    { name: 'Lower Back Pain', category: 'pain' as const },
    { name: 'Headache', category: 'pain' as const },
    { name: 'Brain Fog', category: 'cognitive' as const },
    { name: 'Mood Swings', category: 'mood' as const },
  ];
  const moods = ['Calm', 'Anxious', 'Irritable', 'Happy', 'Sad', 'Overwhelmed', 'Content'];

  for (let i = 0; i < 90; i++) {
    const date = subDays(today, 90 - i);
    const cycleDay = (i % 28) + 1;
    const isLuteal = cycleDay > 14;
    const isMenstrual = cycleDay <= 5;
    const isOvulation = cycleDay >= 13 && cycleDay <= 15;

    // Determine severity based on cycle phase
    const baseSeverity = isMenstrual ? 4 : isLuteal ? 2 : isOvulation ? 3 : 1;
    const daySymptoms = symptoms
      .filter(() => Math.random() > (isMenstrual ? 0.2 : isLuteal ? 0.5 : 0.65))
      .map((s, idx) => ({
        id: uid('sym', i * 10 + idx),
        name: s.name,
        category: s.category,
        severity: Math.min(5, Math.max(1, baseSeverity + Math.floor(Math.random() * 2 - 0.5))) as 1|2|3|4|5,
        duration: isMenstrual ? 'All day' : 'Few hours',
        location: s.category === 'pain' ? 'Lower abdomen' : undefined
      }));

    const moodScore = isMenstrual ? 4 : isLuteal ? 5 : 7;
    logs.push({
      id: uid('log', i),
      userId: 'demo-sarah',
      date: format(date, 'yyyy-MM-dd'),
      cycleDay,
      symptoms: daySymptoms,
      mood: { primary: moods[i % moods.length], secondary: [], score: moodScore },
      energy: isMenstrual ? 3 : isLuteal ? 5 : 7,
      sleep: { hours: isMenstrual ? 5.5 : 7, quality: (isMenstrual ? 2 : 4) as 1|2|3|4|5, disturbances: isMenstrual ? ['Pain woke me up'] : [] },
      notes: isMenstrual && cycleDay === 1 ? 'Period started. Heavy flow, severe cramps.' : '',
      tags: isMenstrual ? ['period', 'heavy-flow'] : isOvulation ? ['ovulation'] : [],
      createdAt: date.toISOString()
    });
  }
  return logs;
}

const sarahPatterns: PatternAlert[] = [
  {
    id: 'pat-sarah-1', userId: 'demo-sarah', type: 'pattern',
    title: 'Recurring Severe Pelvic Pain During Menstruation',
    description: 'Over the past 3 cycles, pelvic pain has consistently reached severity 4-5 during days 1-5 of your cycle. This pattern has a high overlap with clinical data for reproductive conditions.',
    pattern: 'Severe pelvic pain (avg 4.2/5) consistently appears on cycle days 1-5 across 3 consecutive cycles. Matches 85% of cases in our Endometriosis research dataset.',
    conditionsFlagged: ['Endometriosis', 'Adenomyosis'],
    confidence: 0.85,
    severity: 'high',
    recommendation: 'This research-based pattern of severe cyclical pelvic pain may be worth discussing with a gynecologist. Consider requesting a pelvic exam and possibly imaging. Your data overlap is significant.',
    dataPoints: 42, dateRange: { start: format(subDays(today, 90), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') },
    isRead: false, createdAt: subDays(today, 2).toISOString()
  },
  {
    id: 'pat-sarah-2', userId: 'demo-sarah', type: 'trend',
    title: 'Increasing Fatigue in Luteal Phase',
    description: 'Your energy levels show a consistent dip during days 15-28 of your cycle, with fatigue severity trending upward over the past 3 months.',
    pattern: 'Luteal phase fatigue (days 15-28) averaging severity 3.1 with upward trend of +0.3 per cycle.',
    conditionsFlagged: ['PMDD', 'Iron Deficiency Anemia', 'Hypothyroidism'],
    confidence: 0.62,
    severity: 'medium',
    recommendation: 'The increasing fatigue pattern in your luteal phase may benefit from blood work including iron levels and thyroid panel. Track your diet and exercise alongside symptoms.',
    dataPoints: 35, dateRange: { start: format(subDays(today, 84), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') },
    isRead: true, createdAt: subDays(today, 5).toISOString()
  },
  {
    id: 'pat-sarah-3', userId: 'demo-sarah', type: 'pattern',
    title: 'Pain During Ovulation Window',
    description: 'You consistently report moderate-to-severe pelvic pain around cycle days 13-15, which may indicate mittelschmerz or could be related to other conditions.',
    pattern: 'Mid-cycle pain (days 13-15) at severity 3.0 avg, present in all 3 observed cycles.',
    conditionsFlagged: ['Ovarian Cysts', 'Endometriosis'],
    confidence: 0.55,
    severity: 'medium',
    recommendation: 'Mid-cycle pain is sometimes normal (mittelschmerz), but given your other pain patterns, it may be worth mentioning to your doctor for a comprehensive evaluation.',
    dataPoints: 9, dateRange: { start: format(subDays(today, 90), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') },
    isRead: false, createdAt: subDays(today, 1).toISOString()
  }
];

const sarahConversation: AskBloomConversation = {
  id: 'conv-sarah-1', userId: 'demo-sarah',
  topic: 'Understanding pelvic pain patterns',
  messages: [
    { id: 'm1', role: 'user', content: 'My period cramps have been getting worse over the past few months. Is this normal?', timestamp: subDays(today, 3).toISOString() },
    { id: 'm2', role: 'assistant', content: "Based on your logged data over the past 90 days compared with our clinical research datasets, I can see that your pelvic pain during menstruation has been consistently severe (averaging 4.2 out of 5). Here's the data overlap:\n\n• **Pain duration**: Your pain typically lasts all day during cycle days 1-5, which overlaps with 85% of cases in our Endometriosis dataset.\n• **Accompanying symptoms**: Bloating and fatigue consistently appear alongside the pain, forming a known clinical cluster.\n• **Trend**: Pain severity has remained stable but is statistically higher than typical menstrual discomfort baselines.\n\nWhile some cramping is common, the severity and consistency of your pattern has a high correlation with conditions like endometriosis or adenomyosis.\n\n⚠️ *I'm not providing a diagnosis — only a healthcare professional can do that. I'm sharing research-based patterns from your data that may be helpful to discuss with your doctor.*",
      timestamp: subDays(today, 3).toISOString(), sources: ['Your symptom logs (90 days)', 'WHO Endometriosis Clinical Dataset'], disclaimer: 'This is not medical advice or diagnosis.' },
    { id: 'm3', role: 'user', content: 'What should I ask my doctor about this?', timestamp: subDays(today, 3).toISOString() },
    { id: 'm4', role: 'assistant', content: "Great question! Here are some specific questions you might consider:\n\n1. **About your symptoms**: \"I've been tracking severe pelvic pain (4-5/10) consistently during my period for 3+ months. Could this indicate something beyond normal cramping?\"\n\n2. **About testing**: \"Would imaging like an ultrasound or MRI be appropriate to investigate my pain?\"\n\n3. **About management**: \"What pain management options would you recommend beyond OTC medications?\"\n\n4. **About related symptoms**: \"I also experience bloating, fatigue, and mid-cycle pain — could these be related?\"\n\n5. **About timeline**: \"What's the typical diagnostic process for investigating chronic pelvic pain?\"\n\n💡 *Tip: I can generate a Doctor Visit Prep report with all your data organized — would you like me to create one?*",
      timestamp: subDays(today, 3).toISOString(), disclaimer: 'This is not medical advice or diagnosis.' }
  ],
  createdAt: subDays(today, 3).toISOString()
};

const sarahDoctorPrep: DoctorPrepReport = {
  id: 'prep-sarah-1', userId: 'demo-sarah', generatedAt: subDays(today, 1).toISOString(),
  dateRange: { start: format(subDays(today, 90), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') },
  summary: "90-day symptom summary for Sarah Mitchell (age 29, reproductive stage). Primary concern: recurring severe pelvic pain during menstruation with associated fatigue and bloating. Pattern analysis suggests symptoms consistent with conditions such as endometriosis, though only a healthcare professional can provide a diagnosis.",
  topSymptoms: [
    { name: 'Pelvic Pain', frequency: 45, avgSeverity: 3.8 },
    { name: 'Bloating', frequency: 52, avgSeverity: 2.9 },
    { name: 'Fatigue', frequency: 61, avgSeverity: 2.7 },
    { name: 'Cramping', frequency: 38, avgSeverity: 3.5 },
    { name: 'Lower Back Pain', frequency: 28, avgSeverity: 2.4 },
    { name: 'Nausea', frequency: 18, avgSeverity: 2.1 },
  ],
  patterns: sarahPatterns,
  questions: [
    'Could the severity of my menstrual pain indicate a condition like endometriosis?',
    'Would imaging (ultrasound/MRI) help investigate the cause of my pelvic pain?',
    'My fatigue has been increasing in my luteal phase — should I get blood work done?',
    'I experience pain during my ovulation window — is this related to my menstrual pain?',
    'What pain management approaches would you recommend for cyclical pelvic pain?'
  ],
  timeline: [
    { date: format(subDays(today, 85), 'yyyy-MM-dd'), event: 'Period: Severe cramps (5/5), heavy flow' },
    { date: format(subDays(today, 72), 'yyyy-MM-dd'), event: 'Mid-cycle pain episode (3/5)' },
    { date: format(subDays(today, 57), 'yyyy-MM-dd'), event: 'Period: Severe cramps (4/5), nausea' },
    { date: format(subDays(today, 44), 'yyyy-MM-dd'), event: 'Mid-cycle pain with bloating (3/5)' },
    { date: format(subDays(today, 29), 'yyyy-MM-dd'), event: 'Period: Severe cramps (5/5), missed work' },
    { date: format(subDays(today, 16), 'yyyy-MM-dd'), event: 'Mid-cycle pain episode (3/5)' },
    { date: format(subDays(today, 1), 'yyyy-MM-dd'), event: 'Period started: Severe cramps (4/5)' },
  ],
  cycleData: { avgLength: 28, irregularities: ['Consistently heavy flow days 1-3', 'Pain severity above typical range'] }
};

// ---- DEMO USER 2: Priya — Perimenopause Case ----
const priyaUser: User = {
  id: 'demo-priya',
  name: 'Priya Sharma',
  email: 'priya@demo.bloom',
  age: 47,
  lifeStage: 'perimenopause',
  cycleLength: 35,
  preferences: { theme: 'auto', notifications: true, dataSharing: false, lifeStageAdaptive: true },
  createdAt: subDays(today, 90).toISOString()
};

function generatePriyaLogs(): SymptomLog[] {
  const logs: SymptomLog[] = [];
  const symptoms = [
    { name: 'Hot Flash', category: 'other' as const },
    { name: 'Night Sweats', category: 'sleep' as const },
    { name: 'Brain Fog', category: 'cognitive' as const },
    { name: 'Joint Pain', category: 'pain' as const },
    { name: 'Mood Swings', category: 'mood' as const },
    { name: 'Fatigue', category: 'energy' as const },
    { name: 'Insomnia', category: 'sleep' as const },
    { name: 'Anxiety', category: 'mood' as const },
  ];
  const moods = ['Anxious', 'Calm', 'Frustrated', 'Content', 'Overwhelmed', 'Hopeful'];

  for (let i = 0; i < 90; i++) {
    const date = subDays(today, 90 - i);
    const cycleDay = i < 35 ? (i % 35) + 1 : i < 70 ? ((i - 35) % 42) + 1 : null;
    const hotFlashDay = Math.random() > 0.4;
    const nightSweatDay = Math.random() > 0.5;

    const daySymptoms = symptoms
      .filter((s) => {
        if (s.name === 'Hot Flash') return hotFlashDay;
        if (s.name === 'Night Sweats') return nightSweatDay;
        return Math.random() > 0.45;
      })
      .map((s, idx) => ({
        id: uid('psym', i * 10 + idx),
        name: s.name,
        category: s.category,
        severity: Math.min(5, Math.max(1, Math.floor(Math.random() * 3) + 2)) as 1|2|3|4|5,
        duration: s.name === 'Hot Flash' ? '2-5 minutes' : 'Ongoing',
      }));

    logs.push({
      id: uid('plog', i),
      userId: 'demo-priya',
      date: format(date, 'yyyy-MM-dd'),
      cycleDay,
      symptoms: daySymptoms,
      mood: { primary: moods[i % moods.length], secondary: [], score: Math.floor(Math.random() * 3) + 4 },
      energy: Math.floor(Math.random() * 3) + 3,
      sleep: { hours: nightSweatDay ? 4.5 : 6.5, quality: (nightSweatDay ? 2 : 3) as 1|2|3|4|5, disturbances: nightSweatDay ? ['Night sweats', 'Woke up multiple times'] : [] },
      notes: '',
      tags: hotFlashDay ? ['hot-flash'] : [],
      createdAt: date.toISOString()
    });
  }
  return logs;
}

const priyaPatterns: PatternAlert[] = [
  {
    id: 'pat-priya-1', userId: 'demo-priya', type: 'pattern',
    title: 'Frequent Hot Flashes and Night Sweats',
    description: 'You are experiencing hot flashes on approximately 60% of days and night sweats on 50% of nights. This aligns with 75-80% of recorded perimenopause cases in our clinical dataset.',
    pattern: 'Hot flashes averaging 4-6 per week with night sweats disrupting sleep 3-4 nights per week. Matches research datasets for vasomotor symptoms.',
    conditionsFlagged: ['Perimenopause'],
    confidence: 0.92,
    severity: 'medium',
    recommendation: 'These symptoms overlap strongly with clinical data for perimenopause. Consider discussing evidence-based management options with your healthcare provider.',
    dataPoints: 90, dateRange: { start: format(subDays(today, 90), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') },
    isRead: false, createdAt: subDays(today, 2).toISOString()
  },
  {
    id: 'pat-priya-2', userId: 'demo-priya', type: 'trend',
    title: 'Cycle Length Increasing',
    description: 'Your cycle length has shifted from ~35 days to ~42 days over the tracking period. Increasing cycle length is a hallmark of the perimenopausal transition.',
    pattern: 'Cycle length increased from 35 to 42 days over 90-day tracking period.',
    conditionsFlagged: ['Perimenopause'],
    confidence: 0.82,
    severity: 'low',
    recommendation: 'Lengthening cycles are expected during perimenopause. Continue tracking to identify when periods become more irregular.',
    dataPoints: 3, dateRange: { start: format(subDays(today, 90), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') },
    isRead: true, createdAt: subDays(today, 10).toISOString()
  }
];

const priyaDoctorPrep: DoctorPrepReport = {
  id: 'prep-priya-1', userId: 'demo-priya', generatedAt: subDays(today, 1).toISOString(),
  dateRange: { start: format(subDays(today, 90), 'yyyy-MM-dd'), end: format(today, 'yyyy-MM-dd') },
  summary: "90-day symptom summary for Priya Sharma (age 47, perimenopause). Primary concerns: frequent hot flashes and night sweats disrupting sleep, increasing cycle length, brain fog, and joint pain. Patterns are consistent with perimenopausal transition.",
  topSymptoms: [
    { name: 'Hot Flash', frequency: 54, avgSeverity: 3.2 },
    { name: 'Night Sweats', frequency: 45, avgSeverity: 3.0 },
    { name: 'Brain Fog', frequency: 48, avgSeverity: 2.8 },
    { name: 'Fatigue', frequency: 55, avgSeverity: 2.6 },
    { name: 'Joint Pain', frequency: 40, avgSeverity: 2.5 },
    { name: 'Insomnia', frequency: 38, avgSeverity: 2.9 },
  ],
  patterns: priyaPatterns,
  questions: [
    'Are my symptoms consistent with perimenopause at age 47?',
    'What are the options for managing hot flashes and night sweats?',
    'Should I consider hormone replacement therapy (HRT)?',
    'How can I address the brain fog and cognitive changes?',
    'What health screenings should I prioritize during this transition?'
  ],
  timeline: [
    { date: format(subDays(today, 85), 'yyyy-MM-dd'), event: 'Period started (Day 1 of cycle)' },
    { date: format(subDays(today, 70), 'yyyy-MM-dd'), event: 'Multiple hot flashes in one day (4 episodes)' },
    { date: format(subDays(today, 50), 'yyyy-MM-dd'), event: 'Period started (35-day cycle)' },
    { date: format(subDays(today, 30), 'yyyy-MM-dd'), event: 'Severe night sweats (5 nights in a row)' },
    { date: format(subDays(today, 8), 'yyyy-MM-dd'), event: 'Period started (42-day cycle — longer than usual)' },
  ],
  cycleData: { avgLength: 38, irregularities: ['Cycle length increasing from 35 to 42 days', 'Flow becoming lighter'] }
};

// ---- Export Demo Users ----
export const demoUsers: DemoUser[] = [
  {
    user: sarahUser,
    symptomLogs: generateSarahLogs(),
    patterns: sarahPatterns,
    conversations: [sarahConversation],
    doctorPrep: sarahDoctorPrep
  },
  {
    user: priyaUser,
    symptomLogs: generatePriyaLogs(),
    patterns: priyaPatterns,
    conversations: [{ id: 'conv-priya-1', userId: 'demo-priya', topic: 'Understanding perimenopause symptoms', messages: [
      { id: 'pm1', role: 'user', content: 'I\'ve been having hot flashes almost every day. Is this perimenopause?', timestamp: subDays(today, 5).toISOString() },
      { id: 'pm2', role: 'assistant', content: "Based on your tracking data over the past 90 days and our clinical research datasets, your symptoms strongly align with the perimenopausal transition:\n\n• **Hot flashes**: Occurring on ~60% of tracked days (overlaps with 75% of clinical cases)\n• **Night sweats**: Present on ~50% of nights, causing statistically significant sleep disruption\n• **Cycle changes**: Your cycle has lengthened from 35 to 42 days, a hallmark indicator in NAMS guidelines\n• **Additional symptoms**: Brain fog and joint pain clusters match the research dataset profile\n\nAt age 47, these symptoms show a high correlation with the medical data for perimenopause. However, only your healthcare provider can confirm this through clinical evaluation.\n\n⚠️ *This is pattern observation based on research data, not a diagnosis. Please discuss these patterns with your healthcare provider.*",
        timestamp: subDays(today, 5).toISOString(), sources: ['Your symptom logs (90 days)', 'NAMS Clinical Guidelines Dataset'], disclaimer: 'This is not medical advice or diagnosis.' }
    ], createdAt: subDays(today, 5).toISOString() }],
    doctorPrep: priyaDoctorPrep
  }
];

export const getDemoUser = (id: string) => demoUsers.find(d => d.user.id === id);
