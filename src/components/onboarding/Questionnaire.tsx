// ============================================================
// BLOOM — Multi-Step Onboarding Questionnaire
// Premium UI with step-by-step flow, glassmorphism, animations
// ============================================================

import { useState } from 'react';
import { useBloomStore } from '../../store/useBloomStore';
import type { QuestionnaireData } from '../../types';
import {
  Flower2, User, Calendar, Heart, Activity, Target,
  ChevronRight, ChevronLeft, Check, Sparkles, X
} from 'lucide-react';

const TOTAL_STEPS = 5;

const INITIAL_DATA: QuestionnaireData = {
  name: '',
  dateOfBirth: '',
  gender: '',
  pronouns: '',
  lastPeriodStart: '',
  avgCycleLength: 28,
  avgPeriodDuration: 5,
  cycleRegularity: '',
  flowIntensity: '',
  experiencePms: '',
  commonSymptoms: [],
  painLevel: 5,
  diagnosedConditions: [],
  currentBirthControl: '',
  tryingToConceive: '',
  avgSleepHours: 7,
  exerciseFrequency: '',
  stressLevel: '',
  dietaryPreference: '',
  primaryGoal: '',
  trackedBefore: '',
  doctorSummaries: '',
  heardAbout: '',
};

const stepMeta = [
  { icon: User, title: 'About You', subtitle: 'Let\'s get to know you' },
  { icon: Calendar, title: 'Your Cycle', subtitle: 'Tell us about your menstrual cycle' },
  { icon: Heart, title: 'Health & Symptoms', subtitle: 'Help us understand your body' },
  { icon: Activity, title: 'Lifestyle', subtitle: 'Your daily habits matter' },
  { icon: Target, title: 'Your Goals', subtitle: 'How can Bloom help you?' },
];

export default function Questionnaire() {
  const { saveQuestionnaire, skipQuestionnaire } = useBloomStore();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<QuestionnaireData>(INITIAL_DATA);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const update = (field: keyof QuestionnaireData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: keyof QuestionnaireData, item: string) => {
    setData(prev => {
      const arr = prev[field] as string[];
      return {
        ...prev,
        [field]: arr.includes(item) ? arr.filter(i => i !== item) : [...arr, item]
      };
    });
  };

  const nextStep = () => {
    if (step < TOTAL_STEPS - 1) setStep(s => s + 1);
  };

  const prevStep = () => {
    if (step > 0) setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      await saveQuestionnaire(data);
      // On success, the store will set showQuestionnaire to false, 
      // causing this component to unmount.
    } catch (err: any) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="questionnaire-overlay">
      <div className="questionnaire-container">
        {/* Skip button */}
        <button
          onClick={skipQuestionnaire}
          className="q-skip-btn"
          title="Skip for now"
        >
          <X size={18} />
        </button>

        {/* Header with bloom icon */}
        <div className="q-header">
          <div className="q-bloom-icon">
            <Flower2 size={24} />
          </div>
          <h2 className="q-title">Welcome to BLOOM</h2>
          <p className="q-subtitle">
            {stepMeta[step].subtitle}
          </p>
        </div>

        {/* Progress bar */}
        <div className="q-progress-container">
          <div className="q-progress-bar" style={{ width: `${progress}%` }} />
        </div>

        {/* Step indicator */}
        <div className="q-steps">
          {stepMeta.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className={`q-step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
                onClick={() => i <= step && setStep(i)}
              >
                {i < step ? <Check size={12} /> : <Icon size={14} />}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="q-content" key={step}>
          {step === 0 && <StepPersonal data={data} update={update} />}
          {step === 1 && <StepCycle data={data} update={update} />}
          {step === 2 && <StepHealth data={data} update={update} toggleArrayItem={toggleArrayItem} />}
          {step === 3 && <StepLifestyle data={data} update={update} />}
          {step === 4 && <StepGoals data={data} update={update} />}
        </div>

        {/* Error */}
        {error && <p className="q-error">{error}</p>}

        {/* Navigation */}
        <div className="q-nav">
          {step > 0 && (
            <button onClick={prevStep} className="q-btn-secondary">
              <ChevronLeft size={16} /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < TOTAL_STEPS - 1 ? (
            <button onClick={nextStep} className="q-btn-primary">
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} className="q-btn-submit" disabled={saving}>
              {saving ? (
                <span className="q-spinner" />
              ) : (
                <>
                  <Sparkles size={16} /> Complete Setup
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Step Components
// ============================================================

function StepPersonal({ data, update }: {
  data: QuestionnaireData;
  update: (field: keyof QuestionnaireData, value: any) => void;
}) {
  return (
    <div className="q-fields">
      <div className="q-field">
        <label>Name</label>
        <input
          type="text"
          value={data.name}
          onChange={e => update('name', e.target.value)}
          placeholder="Your name"
          className="bloom-input"
        />
      </div>

      <div className="q-field">
        <label>Date of Birth</label>
        <input
          type="date"
          value={data.dateOfBirth}
          onChange={e => update('dateOfBirth', e.target.value)}
          className="bloom-input"
        />
      </div>

      <div className="q-field">
        <label>Gender</label>
        <div className="q-chips">
          {['Female', 'Non-binary', 'Transgender', 'Prefer not to say', 'Other'].map(g => (
            <button
              key={g}
              className={`q-chip ${data.gender === g ? 'selected' : ''}`}
              onClick={() => update('gender', g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label>Pronouns <span className="q-optional">(optional)</span></label>
        <div className="q-chips">
          {['She/her', 'They/them', 'He/him', 'Other'].map(p => (
            <button
              key={p}
              className={`q-chip ${data.pronouns === p ? 'selected' : ''}`}
              onClick={() => update('pronouns', p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepCycle({ data, update }: {
  data: QuestionnaireData;
  update: (field: keyof QuestionnaireData, value: any) => void;
}) {
  return (
    <div className="q-fields">
      <div className="q-field">
        <label>When did your last period start?</label>
        <input
          type="date"
          value={data.lastPeriodStart}
          onChange={e => update('lastPeriodStart', e.target.value)}
          className="bloom-input"
        />
      </div>

      <div className="q-field-row">
        <div className="q-field">
          <label>Average cycle length (days)</label>
          <div className="q-range-display">
            <input
              type="range"
              min={18}
              max={45}
              value={data.avgCycleLength}
              onChange={e => update('avgCycleLength', parseInt(e.target.value))}
              className="q-range"
            />
            <span className="q-range-value">{data.avgCycleLength} days</span>
          </div>
        </div>

        <div className="q-field">
          <label>Average period duration (days)</label>
          <div className="q-range-display">
            <input
              type="range"
              min={1}
              max={14}
              value={data.avgPeriodDuration}
              onChange={e => update('avgPeriodDuration', parseInt(e.target.value))}
              className="q-range"
            />
            <span className="q-range-value">{data.avgPeriodDuration} days</span>
          </div>
        </div>
      </div>

      <div className="q-field">
        <label>How regular are your cycles?</label>
        <div className="q-chips">
          {['Very regular', 'Mostly regular', 'Somewhat irregular', 'Very irregular', 'Not sure'].map(r => (
            <button
              key={r}
              className={`q-chip ${data.cycleRegularity === r ? 'selected' : ''}`}
              onClick={() => update('cycleRegularity', r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label>Typical flow intensity</label>
        <div className="q-chips">
          {['Light', 'Moderate', 'Heavy', 'Very heavy'].map(f => (
            <button
              key={f}
              className={`q-chip ${data.flowIntensity === f ? 'selected' : ''}`}
              onClick={() => update('flowIntensity', f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepHealth({ data, update, toggleArrayItem }: {
  data: QuestionnaireData;
  update: (field: keyof QuestionnaireData, value: any) => void;
  toggleArrayItem: (field: keyof QuestionnaireData, item: string) => void;
}) {
  return (
    <div className="q-fields">
      <div className="q-field">
        <label>Do you experience PMS?</label>
        <div className="q-chips">
          {['Yes, often', 'Sometimes', 'Rarely', 'No'].map(p => (
            <button
              key={p}
              className={`q-chip ${data.experiencePms === p ? 'selected' : ''}`}
              onClick={() => update('experiencePms', p)}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label>Common symptoms <span className="q-optional">(select all that apply)</span></label>
        <div className="q-chips">
          {['Cramps', 'Headaches', 'Bloating', 'Mood swings', 'Fatigue', 'Acne', 'Breast tenderness', 'Back pain', 'Nausea'].map(s => (
            <button
              key={s}
              className={`q-chip multi ${data.commonSymptoms.includes(s) ? 'selected' : ''}`}
              onClick={() => toggleArrayItem('commonSymptoms', s)}
            >
              {data.commonSymptoms.includes(s) && <Check size={12} />} {s}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label>Pain level during your period</label>
        <div className="q-pain-slider">
          <input
            type="range"
            min={1}
            max={10}
            value={data.painLevel}
            onChange={e => update('painLevel', parseInt(e.target.value))}
            className="q-range"
          />
          <div className="q-pain-labels">
            <span>1 — Mild</span>
            <span className="q-pain-current">{data.painLevel}</span>
            <span>10 — Severe</span>
          </div>
        </div>
      </div>

      <div className="q-field">
        <label>Diagnosed conditions <span className="q-optional">(select all that apply)</span></label>
        <div className="q-chips">
          {['PCOS', 'Endometriosis', 'Uterine fibroids', 'Adenomyosis', 'None of the above', 'Prefer not to say'].map(c => (
            <button
              key={c}
              className={`q-chip multi ${data.diagnosedConditions.includes(c) ? 'selected' : ''}`}
              onClick={() => toggleArrayItem('diagnosedConditions', c)}
            >
              {data.diagnosedConditions.includes(c) && <Check size={12} />} {c}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label>Current birth control</label>
        <div className="q-chips">
          {['None', 'Pill', 'Hormonal IUD', 'Copper IUD', 'Implant', 'Patch / Ring', 'Condoms', 'Other'].map(b => (
            <button
              key={b}
              className={`q-chip ${data.currentBirthControl === b ? 'selected' : ''}`}
              onClick={() => update('currentBirthControl', b)}
            >
              {b}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepLifestyle({ data, update }: {
  data: QuestionnaireData;
  update: (field: keyof QuestionnaireData, value: any) => void;
}) {
  return (
    <div className="q-fields">
      <div className="q-field">
        <label>Are you trying to conceive?</label>
        <div className="q-chips">
          {['Yes', 'No', 'Not applicable'].map(t => (
            <button
              key={t}
              className={`q-chip ${data.tryingToConceive === t ? 'selected' : ''}`}
              onClick={() => update('tryingToConceive', t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label>Average sleep per night</label>
        <div className="q-range-display">
          <input
            type="range"
            min={3}
            max={12}
            step={0.5}
            value={data.avgSleepHours}
            onChange={e => update('avgSleepHours', parseFloat(e.target.value))}
            className="q-range"
          />
          <span className="q-range-value">{data.avgSleepHours} hours</span>
        </div>
      </div>

      <div className="q-field">
        <label>How often do you exercise?</label>
        <div className="q-chips">
          {['Daily', '3 times a week', 'Once a week', 'Rarely', 'Never'].map(e => (
            <button
              key={e}
              className={`q-chip ${data.exerciseFrequency === e ? 'selected' : ''}`}
              onClick={() => update('exerciseFrequency', e)}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label>General stress level</label>
        <div className="q-chips">
          {['Low', 'Moderate', 'High', 'Very high'].map(s => (
            <button
              key={s}
              className={`q-chip ${data.stressLevel === s ? 'selected' : ''}`}
              onClick={() => update('stressLevel', s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label>Dietary preference <span className="q-optional">(optional)</span></label>
        <div className="q-chips">
          {['Omnivore', 'Vegetarian', 'Vegan', 'Other'].map(d => (
            <button
              key={d}
              className={`q-chip ${data.dietaryPreference === d ? 'selected' : ''}`}
              onClick={() => update('dietaryPreference', d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepGoals({ data, update }: {
  data: QuestionnaireData;
  update: (field: keyof QuestionnaireData, value: any) => void;
}) {
  return (
    <div className="q-fields">
      <div className="q-field">
        <label>Primary goal for using Bloom</label>
        <div className="q-chips">
          {['Track my cycle', 'Understand symptoms', 'Try to conceive', 'Avoid pregnancy', 'Manage a condition', 'General wellness'].map(g => (
            <button
              key={g}
              className={`q-chip ${data.primaryGoal === g ? 'selected' : ''}`}
              onClick={() => update('primaryGoal', g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label>Have you tracked your period before?</label>
        <div className="q-chips">
          {['Yes, with an app', 'Yes, manually', 'No, this is my first time'].map(t => (
            <button
              key={t}
              className={`q-chip ${data.trackedBefore === t ? 'selected' : ''}`}
              onClick={() => update('trackedBefore', t)}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label>Would you like doctor-ready summaries?</label>
        <div className="q-chips">
          {['Yes, definitely!', 'Maybe later', 'No thanks'].map(d => (
            <button
              key={d}
              className={`q-chip ${data.doctorSummaries === d ? 'selected' : ''}`}
              onClick={() => update('doctorSummaries', d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label>How did you hear about Bloom? <span className="q-optional">(optional)</span></label>
        <div className="q-chips">
          {['Social media', 'Friend or family', 'Search engine', 'Healthcare provider', 'Other'].map(h => (
            <button
              key={h}
              className={`q-chip ${data.heardAbout === h ? 'selected' : ''}`}
              onClick={() => update('heardAbout', h)}
            >
              {h}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
