// ============================================================
// BLOOM — Life Stage Engine
// Agent 4 (Content Lead) — Life stage content & UI themes
// ============================================================

import { LifeStageInfo } from '../types';

export const lifeStages: LifeStageInfo[] = [
  {
    stage: 'puberty',
    ageRange: '8-17',
    description: 'The beginning of your menstrual journey. Your body is developing and cycles may be irregular — this is completely normal.',
    commonExperiences: [
      'Irregular cycles (21-45 days is normal in the first few years)',
      'Cramping and PMS are common as your body adjusts',
      'Skin changes including acne',
      'Mood fluctuations related to hormonal changes',
      'Breast development and body composition changes'
    ],
    prioritySymptoms: ['Cycle irregularity', 'Cramping severity', 'Acne', 'Mood changes', 'Growth patterns'],
    uiTheme: { primary: '#a78bfa', secondary: '#c4b5fd', accent: '#7c3aed' }
  },
  {
    stage: 'reproductive',
    ageRange: '18-39',
    description: 'Your reproductive years — cycles typically become more regular. This is a key time for understanding your unique patterns.',
    commonExperiences: [
      'More predictable cycles (typically 21-35 days)',
      'Ovulation symptoms become recognizable',
      'Fertility awareness becomes relevant',
      'PMS/PMDD symptoms may intensify',
      'Hormonal contraception may affect cycle patterns'
    ],
    prioritySymptoms: ['Cycle regularity', 'Ovulation signs', 'PMS severity', 'Pain patterns', 'Fertility indicators'],
    uiTheme: { primary: '#a855f7', secondary: '#d8b4fe', accent: '#9333ea' }
  },
  {
    stage: 'pregnancy',
    ageRange: 'Variable',
    description: 'A transformative time for your body. Tracking symptoms helps you and your healthcare provider monitor your wellbeing.',
    commonExperiences: [
      'Morning sickness (nausea may occur any time of day)',
      'Fatigue, especially in first and third trimesters',
      'Mood changes and emotional sensitivity',
      'Physical changes (back pain, swelling, skin changes)',
      'Sleep disruptions'
    ],
    prioritySymptoms: ['Nausea', 'Blood pressure', 'Swelling', 'Mood', 'Sleep quality', 'Fetal movement'],
    uiTheme: { primary: '#ec4899', secondary: '#f9a8d4', accent: '#db2777' }
  },
  {
    stage: 'postpartum',
    ageRange: 'Variable (0-12 months post-birth)',
    description: 'Recovery and adjustment after birth. Your body is healing and your hormones are recalibrating.',
    commonExperiences: [
      'Hormonal fluctuations as body recovers',
      'Breastfeeding-related symptoms',
      'Sleep deprivation and its effects',
      'Mood changes — monitor for postpartum depression',
      'Gradual return of menstrual cycle'
    ],
    prioritySymptoms: ['Mood tracking', 'Sleep quality', 'Bleeding patterns', 'Energy levels', 'Pain recovery'],
    uiTheme: { primary: '#f472b6', secondary: '#fbcfe8', accent: '#ec4899' }
  },
  {
    stage: 'perimenopause',
    ageRange: '35-55 (avg onset ~47)',
    description: 'The transition to menopause. Hormone levels fluctuate more widely, causing new and varied symptoms.',
    commonExperiences: [
      'Cycle length changes (shorter or longer)',
      'Hot flashes and night sweats begin',
      'Sleep disruptions become more common',
      'Mood changes and brain fog',
      'Changes in flow (heavier or lighter)',
      'Joint pain and muscle aches'
    ],
    prioritySymptoms: ['Hot flashes', 'Night sweats', 'Cycle changes', 'Sleep quality', 'Mood', 'Brain fog', 'Joint pain'],
    uiTheme: { primary: '#8b5cf6', secondary: '#c4b5fd', accent: '#7c3aed' }
  },
  {
    stage: 'menopause',
    ageRange: '45-58 (avg ~51)',
    description: 'Defined as 12 consecutive months without a period. A new chapter with its own experiences and health considerations.',
    commonExperiences: [
      'No menstrual periods for 12+ months',
      'Hot flashes may continue',
      'Vaginal and urinary changes',
      'Bone density changes',
      'Cardiovascular health becomes a focus',
      'Sleep patterns may shift'
    ],
    prioritySymptoms: ['Hot flashes', 'Bone health indicators', 'Heart health', 'Vaginal health', 'Sleep', 'Mood'],
    uiTheme: { primary: '#7c3aed', secondary: '#a78bfa', accent: '#6d28d9' }
  },
  {
    stage: 'post-menopause',
    ageRange: '55+',
    description: 'Life after menopause. Many symptoms ease, but ongoing health monitoring remains important.',
    commonExperiences: [
      'Most vasomotor symptoms reduce over time',
      'Focus shifts to bone and heart health',
      'Vaginal atrophy may continue',
      'Cognitive health monitoring',
      'Renewed energy for many women'
    ],
    prioritySymptoms: ['Bone health', 'Heart health', 'Cognitive function', 'Joint pain', 'Urinary health', 'Energy'],
    uiTheme: { primary: '#6d28d9', secondary: '#8b5cf6', accent: '#5b21b6' }
  }
];

export const getLifeStageInfo = (stage: string): LifeStageInfo | undefined =>
  lifeStages.find(ls => ls.stage === stage);
