import { ResearchDataset } from '../types';

// ============================================================
// BLOOM — Research Datasets
// Agent 4 (Content Lead) — Curated from WHO, CDC, NIH
// ============================================================

export const researchDatasets: ResearchDataset[] = [
  {
    conditionId: 'endometriosis',
    condition: 'Endometriosis',
    symptoms: [
      { name: 'Cyclic Pelvic Pain', probability: 0.85, avg_severity: 7.2 },
      { name: 'Severe Dysmenorrhea (Cramps)', probability: 0.90, avg_severity: 8.5 },
      { name: 'Dyspareunia (Pain during intercourse)', probability: 0.65, avg_severity: 6.8 },
      { name: 'Fatigue', probability: 0.70, avg_severity: 5.5 },
      { name: 'Bloating (Endo-belly)', probability: 0.80, avg_severity: 6.0 },
      { name: 'Heavy Bleeding', probability: 0.45, avg_severity: 5.0 },
      { name: 'Pain with bowel movements', probability: 0.35, avg_severity: 6.5 }
    ],
    patterns: [
      { description: 'Pain peaking 1-2 days before menstruation and lasting through first few days.', frequency: 'Cyclic (Monthly)', cycle_phase: 'Late Luteal to Early Menstrual' },
      { description: 'Severe bloating concurrent with pelvic pain spikes.', frequency: 'Episodic', cycle_phase: 'Luteal/Menstrual' },
      { description: 'Chronic fatigue that persists regardless of sleep, worsening during pain flare-ups.', frequency: 'Daily/Chronic', cycle_phase: 'All phases' }
    ],
    misdiagnoses: ['IBS', 'Pelvic Inflammatory Disease', 'Ovarian Cysts', 'Normal Period Pain'],
    avg_diagnosis_delay: '7-10 years',
    life_stages: ['reproductive', 'perimenopause']
  },
  {
    conditionId: 'pcos',
    condition: 'Polycystic Ovary Syndrome (PCOS)',
    symptoms: [
      { name: 'Irregular or Missed Periods', probability: 0.85, avg_severity: 4.5 },
      { name: 'Hirsutism (Excess hair growth)', probability: 0.70, avg_severity: 6.0 },
      { name: 'Weight Gain / Difficulty losing weight', probability: 0.65, avg_severity: 5.5 },
      { name: 'Acne', probability: 0.60, avg_severity: 5.0 },
      { name: 'Fatigue', probability: 0.50, avg_severity: 4.5 },
      { name: 'Mood Swings', probability: 0.45, avg_severity: 5.0 },
      { name: 'Pelvic Pain (Cysts)', probability: 0.30, avg_severity: 5.5 }
    ],
    patterns: [
      { description: 'Cycles longer than 35 days or fewer than 9 cycles per year.', frequency: 'Chronic', cycle_phase: 'Irregular' },
      { description: 'Insulin resistance symptoms like energy crashes after meals.', frequency: 'Daily', cycle_phase: 'All phases' },
      { description: 'Sudden onset of severe pelvic pain if a cyst ruptures.', frequency: 'Rare/Episodic', cycle_phase: 'Variable' }
    ],
    misdiagnoses: ['Thyroid Disorders', 'Metabolic Syndrome', 'Cushing Syndrome', 'Normal Puberty Changes'],
    avg_diagnosis_delay: '2-3 years',
    life_stages: ['puberty', 'reproductive']
  },
  {
    conditionId: 'fibromyalgia',
    condition: 'Fibromyalgia',
    symptoms: [
      { name: 'Widespread Musculoskeletal Pain', probability: 0.95, avg_severity: 7.5 },
      { name: 'Extreme Fatigue', probability: 0.90, avg_severity: 8.0 },
      { name: 'Unrefreshing Sleep', probability: 0.85, avg_severity: 7.0 },
      { name: 'Brain Fog (Cognitive difficulties)', probability: 0.75, avg_severity: 6.5 },
      { name: 'Morning Stiffness', probability: 0.65, avg_severity: 6.0 },
      { name: 'Headaches/Migraines', probability: 0.55, avg_severity: 5.5 },
      { name: 'IBS Symptoms', probability: 0.45, avg_severity: 5.0 }
    ],
    patterns: [
      { description: 'Pain and fatigue worse in the morning and after exertion (Post-exertional malaise).', frequency: 'Daily', cycle_phase: 'All phases (may worsen pre-menstrually)' },
      { description: 'Sleep disturbances triggering severe pain flares the following day.', frequency: 'Episodic', cycle_phase: 'All phases' },
      { description: 'Symptoms exacerbated by stress, weather changes, and hormonal shifts.', frequency: 'Variable', cycle_phase: 'All phases' }
    ],
    misdiagnoses: ['Rheumatoid Arthritis', 'Lupus', 'Multiple Sclerosis', 'Depression/Anxiety', 'Hypothyroidism'],
    avg_diagnosis_delay: '3-5 years',
    life_stages: ['reproductive', 'perimenopause', 'menopause']
  },
  {
    conditionId: 'hashimotos',
    condition: 'Hashimoto’s Thyroiditis',
    symptoms: [
      { name: 'Fatigue and Sluggishness', probability: 0.85, avg_severity: 7.0 },
      { name: 'Increased Sensitivity to Cold', probability: 0.75, avg_severity: 5.5 },
      { name: 'Unexplained Weight Gain', probability: 0.70, avg_severity: 6.0 },
      { name: 'Dry Skin & Brittle Nails', probability: 0.65, avg_severity: 4.5 },
      { name: 'Hair Loss', probability: 0.60, avg_severity: 5.0 },
      { name: 'Muscle Aches and Weakness', probability: 0.55, avg_severity: 5.5 },
      { name: 'Depression/Mood Changes', probability: 0.50, avg_severity: 6.0 },
      { name: 'Heavy/Irregular Periods', probability: 0.40, avg_severity: 5.5 }
    ],
    patterns: [
      { description: 'Gradual onset of overwhelming fatigue that doesn\'t improve with rest.', frequency: 'Chronic/Daily', cycle_phase: 'All phases' },
      { description: 'Fluctuations between hyper- and hypo-thyroid symptoms in early stages.', frequency: 'Episodic', cycle_phase: 'Variable' },
      { description: 'Changes in menstrual cycle length and heavier flow.', frequency: 'Monthly', cycle_phase: 'Menstrual' }
    ],
    misdiagnoses: ['Depression', 'Chronic Fatigue Syndrome', 'Menopause', 'Normal Aging', 'PCOS'],
    avg_diagnosis_delay: '2-5 years',
    life_stages: ['reproductive', 'perimenopause', 'menopause']
  },
  {
    conditionId: 'perimenopause',
    condition: 'Perimenopause Transition',
    symptoms: [
      { name: 'Irregular Periods', probability: 0.90, avg_severity: 4.0 },
      { name: 'Hot Flashes', probability: 0.75, avg_severity: 6.5 },
      { name: 'Night Sweats', probability: 0.70, avg_severity: 6.0 },
      { name: 'Sleep Disturbances/Insomnia', probability: 0.65, avg_severity: 7.0 },
      { name: 'Mood Swings / Irritability', probability: 0.60, avg_severity: 6.5 },
      { name: 'Brain Fog', probability: 0.55, avg_severity: 5.5 },
      { name: 'Joint Pain', probability: 0.40, avg_severity: 5.0 }
    ],
    patterns: [
      { description: 'Cycle length varies by >7 days from typical normal; skipping cycles later in transition.', frequency: 'Monthly', cycle_phase: 'Variable' },
      { description: 'Vasomotor symptoms (hot flashes/night sweats) causing severe sleep disruption.', frequency: 'Daily/Weekly', cycle_phase: 'Often worse pre-menstrually' },
      { description: 'Sudden intense emotional shifts unconnected to clear triggers.', frequency: 'Episodic', cycle_phase: 'Variable' }
    ],
    misdiagnoses: ['Depression', 'Anxiety', 'Thyroid Disorders', 'Burnout'],
    avg_diagnosis_delay: 'Often undiagnosed/dismissed',
    life_stages: ['perimenopause']
  },
  {
    conditionId: 'postpartum-depression',
    condition: 'Postpartum Depression (PPD)',
    symptoms: [
      { name: 'Persistent Sadness / Empty Mood', probability: 0.85, avg_severity: 8.0 },
      { name: 'Severe Anxiety / Panic Attacks', probability: 0.75, avg_severity: 7.5 },
      { name: 'Overwhelming Fatigue', probability: 0.70, avg_severity: 7.0 },
      { name: 'Insomnia (even when baby sleeps)', probability: 0.65, avg_severity: 8.5 },
      { name: 'Difficulty Bonding with Baby', probability: 0.55, avg_severity: 7.5 },
      { name: 'Intrusive Thoughts', probability: 0.45, avg_severity: 8.0 },
      { name: 'Appetite Changes', probability: 0.40, avg_severity: 5.0 }
    ],
    patterns: [
      { description: 'Symptoms persisting beyond the first 2 weeks postpartum (differentiating from baby blues).', frequency: 'Daily', cycle_phase: 'Postpartum' },
      { description: 'Severe spikes in anxiety often related to baby\'s health or ability to parent.', frequency: 'Episodic/Daily', cycle_phase: 'Postpartum' },
      { description: 'Sleep deprivation compounding the severity of depressive symptoms.', frequency: 'Daily', cycle_phase: 'Postpartum' }
    ],
    misdiagnoses: ['Baby Blues', 'Adjustment Disorder', 'Normal Postpartum Fatigue', 'Thyroid Dysfunction'],
    avg_diagnosis_delay: '3-6 months (highly underdiagnosed)',
    life_stages: ['postpartum']
  }
];

export const getResearchDatasetById = (id: string): ResearchDataset | undefined => 
  researchDatasets.find(d => d.conditionId === id || d.condition === id);
