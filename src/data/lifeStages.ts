// ============================================================
// BLOOM - Life Stage Engine
// ============================================================

import { LifeStageInfo } from '../types';

export const lifeStages: LifeStageInfo[] = [
  {
    stage: 'puberty',
    ageRange: '8-17',
    description: 'The beginning of your menstrual journey. Your body is developing and cycles may be irregular; this is common in the first few years.',
    commonExperiences: [
      'Irregular cycles, often 21-45 days in the first few years',
      'Cramping, PMS, acne, and mood shifts as hormones settle',
      'Breast development, body hair, sweating, and changing body shape',
      'Learning what privacy, comfort, and personal boundaries feel like',
    ],
    bodySignals: [
      'New body awareness, discharge changes, breast tenderness, body hair, sweating, and changing sleep needs',
      'Crushes or romantic curiosity may begin at different times for different people',
      'Privacy, boundaries, consent, and trusted-adult support become especially important',
    ],
    intimacyAndRelationships: [
      'At this stage, focus on understanding feelings, respecting your own pace, and knowing that you never owe anyone access to your body.',
      'If romantic attention feels confusing, pressured, or uncomfortable, talk to a trusted adult or clinician.',
    ],
    prioritySymptoms: ['Cycle irregularity', 'Cramping severity', 'Acne', 'Mood changes', 'Growth patterns'],
    uiTheme: { primary: '#a78bfa', secondary: '#c4b5fd', accent: '#7c3aed' },
  },
  {
    stage: 'reproductive',
    ageRange: '18-39',
    description: 'Your reproductive years, when cycles often become more predictable and personal patterns become easier to notice.',
    commonExperiences: [
      'More predictable cycles, typically 21-35 days',
      'Ovulation signs become more recognizable',
      'Fertility awareness, contraception, PMS, and pain patterns may become more relevant',
      'Stress, sleep, and relationships can show up clearly in cycle symptoms',
    ],
    bodySignals: [
      'Desire, cervical fluid, libido, mood, and energy can shift across the cycle',
      'Ovulation may bring more sexual interest, breast tenderness, bloating, or pelvic twinges',
      'Stress, medication, contraception, pain, and sleep can all change arousal and comfort',
    ],
    intimacyAndRelationships: [
      'Romantic and sexual needs may vary by cycle phase; this can affect communication, closeness, and boundaries with a partner.',
      'Pain with sex, bleeding after sex, low desire that feels distressing, or pressure from a partner are all worth taking seriously.',
    ],
    prioritySymptoms: ['Cycle regularity', 'Ovulation signs', 'PMS severity', 'Pain patterns', 'Fertility indicators'],
    uiTheme: { primary: '#a855f7', secondary: '#d8b4fe', accent: '#9333ea' },
  },
  {
    stage: 'pregnancy',
    ageRange: 'Variable',
    description: 'A transformative time for your body. Tracking symptoms helps you and your healthcare provider monitor your wellbeing.',
    commonExperiences: [
      'Nausea, fatigue, sleep disruption, and changing appetite',
      'Mood changes and emotional sensitivity',
      'Back pain, swelling, skin changes, pelvic pressure, and breast tenderness',
      'Appointment questions can change quickly from week to week',
    ],
    bodySignals: [
      'Desire can rise, fall, or change week to week as nausea, fatigue, body image, and comfort shift',
      'Breast tenderness, pelvic pressure, discharge changes, and heightened sensitivity are common',
      'Emotional needs around reassurance, touch, and safety may become more visible',
    ],
    intimacyAndRelationships: [
      'Partner closeness may need more communication as your body changes. Comfort, consent, and medical guidance matter more than any fixed expectation.',
      'Ask your clinician about sex or intimacy if you have pain, bleeding, placenta concerns, fluid leakage, or anxiety about what is safe.',
    ],
    prioritySymptoms: ['Nausea', 'Blood pressure', 'Swelling', 'Mood', 'Sleep quality', 'Fetal movement'],
    uiTheme: { primary: '#ec4899', secondary: '#f9a8d4', accent: '#db2777' },
  },
  {
    stage: 'postpartum',
    ageRange: 'Variable (0-12 months post-birth)',
    description: 'Recovery and adjustment after birth. Your body is healing, hormones are recalibrating, and your needs still matter.',
    commonExperiences: [
      'Hormonal fluctuations as the body recovers',
      'Bleeding changes, feeding-related symptoms, pelvic floor recovery, and sleep deprivation',
      'Mood changes that should be monitored with care',
      'Gradual return of cycles for some people',
    ],
    bodySignals: [
      'Desire may be low, absent, tender, or changed because of healing, sleep loss, feeding, hormones, and identity shifts',
      'Vaginal dryness, pelvic floor discomfort, breast sensitivity, and body image changes are common',
      'Emotional closeness may feel more important than sexual readiness for a while',
    ],
    intimacyAndRelationships: [
      'There is no single correct timeline for intimacy after birth. Healing, consent, contraception, and emotional readiness all count.',
      'Pain, fear, dryness, pressure to resume sex, or persistent mood heaviness deserve support, not silence.',
    ],
    prioritySymptoms: ['Mood tracking', 'Sleep quality', 'Bleeding patterns', 'Energy levels', 'Pain recovery'],
    uiTheme: { primary: '#f472b6', secondary: '#fbcfe8', accent: '#ec4899' },
  },
  {
    stage: 'perimenopause',
    ageRange: '35-55 (avg onset around 47)',
    description: 'The transition to menopause. Hormone levels fluctuate more widely, causing new and varied symptoms.',
    commonExperiences: [
      'Cycle length changes, shorter or longer',
      'Hot flashes, night sweats, sleep disruption, mood changes, and brain fog',
      'Flow may become heavier, lighter, or less predictable',
      'Joint pain, muscle aches, and changing stress tolerance',
    ],
    bodySignals: [
      'Desire may become more variable as sleep, hot flashes, stress, and hormone swings change',
      'Vaginal dryness, changing arousal, heavier or lighter bleeding, and breast tenderness can appear',
      'Some people feel a new clarity about boundaries, attraction, and what they want from partnership',
    ],
    intimacyAndRelationships: [
      'Changing libido or comfort can affect romantic life, but it is not a personal failure. Communication and treatment options can help.',
      'Pain with sex, dryness, bleeding after sex, or distress around desire are valid medical topics.',
    ],
    prioritySymptoms: ['Hot flashes', 'Night sweats', 'Cycle changes', 'Sleep quality', 'Mood', 'Brain fog', 'Joint pain'],
    uiTheme: { primary: '#8b5cf6', secondary: '#c4b5fd', accent: '#7c3aed' },
  },
  {
    stage: 'menopause',
    ageRange: '45-58 (avg around 51)',
    description: 'Defined as 12 consecutive months without a period. This chapter has its own symptoms and prevention priorities.',
    commonExperiences: [
      'No menstrual periods for 12 or more months',
      'Hot flashes may continue while sleep patterns shift',
      'Vaginal, urinary, bone, and cardiovascular health become more central',
      'A new baseline can emerge over time',
    ],
    bodySignals: [
      'Desire may feel steadier, lower, or newly expressive depending on sleep, comfort, relationship safety, and health',
      'Vaginal dryness, urinary urgency, and tissue sensitivity can affect sex and daily comfort',
      'Body confidence and romantic priorities may shift as periods end',
    ],
    intimacyAndRelationships: [
      'Intimacy can remain rich after menopause, but comfort may require more communication, lubrication, pelvic care, or medical support.',
      'Bleeding after menopause is not expected and should be checked by a clinician.',
    ],
    prioritySymptoms: ['Hot flashes', 'Bone health indicators', 'Heart health', 'Vaginal health', 'Sleep', 'Mood'],
    uiTheme: { primary: '#7c3aed', secondary: '#a78bfa', accent: '#6d28d9' },
  },
  {
    stage: 'post-menopause',
    ageRange: '55+',
    description: 'Life after menopause. Many symptoms ease, while ongoing heart, bone, urinary, and cognitive health remain important.',
    commonExperiences: [
      'Most vasomotor symptoms reduce over time',
      'Focus shifts to bone, heart, urinary, joint, and cognitive health',
      'Vaginal dryness or tissue sensitivity may continue',
      'Many people experience renewed energy and clearer priorities',
    ],
    bodySignals: [
      'Desire and romantic needs can stay active, change shape, or become more focused on comfort and connection',
      'Urinary symptoms, vaginal dryness, joint pain, and sleep can influence intimacy',
      'Long-term confidence often grows from knowing what support your body needs',
    ],
    intimacyAndRelationships: [
      'Sex, partnership, and affection remain part of health if they matter to you. Discomfort is treatable and worth naming.',
      'New bleeding, persistent pelvic pain, or sudden urinary changes should be discussed with a healthcare provider.',
    ],
    prioritySymptoms: ['Bone health', 'Heart health', 'Cognitive function', 'Joint pain', 'Urinary health', 'Energy'],
    uiTheme: { primary: '#6d28d9', secondary: '#8b5cf6', accent: '#5b21b6' },
  },
];

export const getLifeStageInfo = (stage: string): LifeStageInfo | undefined =>
  lifeStages.find(ls => ls.stage === stage);
