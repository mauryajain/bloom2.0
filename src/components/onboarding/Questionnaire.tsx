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
    } catch (err: any) {
      setError(err.message || 'Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  return (
    <div className="questionnaire-overlay" style={{background:'var(--bloom-void)', color:'var(--bloom-text)'}}>
      <div className="questionnaire-container" style={{background:'var(--bloom-deep)', border:'1px solid var(--bloom-border)', borderRadius:20}}>
        <button
          onClick={skipQuestionnaire}
          className="q-skip-btn"
          title="Skip for now"
          style={{color:'var(--bloom-muted)'}}
        >
          <X size={18} />
        </button>

        <div className="q-header">
          <div className="q-bloom-icon" style={{background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))'}}>
            <Flower2 size={24} style={{color:'#fff'}} />
          </div>
          <h2 className="q-title" style={{color:'var(--bloom-text)', fontFamily:'var(--font-heading)'}}>Welcome to BLOOM</h2>
          <p className="q-subtitle" style={{color:'var(--bloom-muted)'}}>
            {stepMeta[step].subtitle}
          </p>
        </div>

        <div className="q-progress-container" style={{background:'var(--bloom-lift)', borderRadius:99, overflow:'hidden'}}>
          <div className="q-progress-bar" style={{width: `${progress}%`, background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', borderRadius:99, height:'100%'}} />
        </div>

        <div className="q-steps">
          {stepMeta.map((s, i) => {
            const Icon = s.icon;
            return (
              <div
                key={i}
                className={`q-step-dot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}`}
                onClick={() => i <= step && setStep(i)}
                style={i === step
                  ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', color:'#fff'}
                  : i < step
                    ? {background:'var(--bloom-glow)', color:'#fff'}
                    : {background:'var(--bloom-surface)', color:'var(--bloom-muted)', border:'1px solid var(--bloom-border)'}
                }
              >
                {i < step ? <Check size={12} /> : <Icon size={14} />}
              </div>
            );
          })}
        </div>

        <div className="q-content" key={step}>
          {step === 0 && <StepPersonal data={data} update={update} />}
          {step === 1 && <StepCycle data={data} update={update} />}
          {step === 2 && <StepHealth data={data} update={update} toggleArrayItem={toggleArrayItem} />}
          {step === 3 && <StepLifestyle data={data} update={update} />}
          {step === 4 && <StepGoals data={data} update={update} />}
        </div>

        {error && <p className="q-error" style={{color:'var(--bloom-rose)'}}>{error}</p>}

        <div className="q-nav">
          {step > 0 && (
            <button onClick={prevStep} className="q-btn-secondary" style={{background:'transparent', border:'1px solid var(--bloom-border)', borderRadius:14, color:'var(--bloom-text)', padding:'10px 20px', cursor:'pointer'}}>
              <ChevronLeft size={16} /> Back
            </button>
          )}
          <div style={{ flex: 1 }} />
          {step < TOTAL_STEPS - 1 ? (
            <button onClick={nextStep} className="q-btn-primary" style={{background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:14, color:'#fff', padding:'10px 20px', cursor:'pointer'}}>
              Continue <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} className="q-btn-submit" disabled={saving} style={{background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:14, color:'#fff', padding:'10px 20px', cursor: saving ? 'not-allowed' : 'pointer'}}>
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

function StepPersonal({ data, update }: {
  data: QuestionnaireData;
  update: (field: keyof QuestionnaireData, value: any) => void;
}) {
  return (
    <div className="q-fields">
      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>Name</label>
        <input
          type="text"
          value={data.name}
          onChange={e => update('name', e.target.value)}
          placeholder="Your name"
          style={{background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:12, color:'var(--bloom-text)', padding:'12px 16px', width:'100%', outline:'none'}}
        />
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>Date of Birth</label>
        <input
          type="date"
          value={data.dateOfBirth}
          onChange={e => update('dateOfBirth', e.target.value)}
          style={{background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:12, color:'var(--bloom-text)', padding:'12px 16px', width:'100%', outline:'none'}}
        />
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>Gender</label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['Female', 'Non-binary', 'Transgender', 'Prefer not to say', 'Other'].map(g => (
            <button
              key={g}
              className={`q-chip ${data.gender === g ? 'selected' : ''}`}
              onClick={() => update('gender', g)}
              style={data.gender === g
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer'}
              }
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>Pronouns <span className="q-optional" style={{color:'var(--bloom-muted)'}}>(optional)</span></label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['She/her', 'They/them', 'He/him', 'Other'].map(p => (
            <button
              key={p}
              className={`q-chip ${data.pronouns === p ? 'selected' : ''}`}
              onClick={() => update('pronouns', p)}
              style={data.pronouns === p
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer'}
              }
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
        <label style={{color:'var(--bloom-muted)'}}>When did your last period start?</label>
        <input
          type="date"
          value={data.lastPeriodStart}
          onChange={e => update('lastPeriodStart', e.target.value)}
          style={{background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:12, color:'var(--bloom-text)', padding:'12px 16px', width:'100%', outline:'none'}}
        />
      </div>

      <div className="q-field-row" style={{display:'flex', gap:16}}>
        <div className="q-field" style={{flex:1}}>
          <label style={{color:'var(--bloom-muted)'}}>Average cycle length (days)</label>
          <div className="q-range-display">
            <input
              type="range"
              min={18}
              max={45}
              value={data.avgCycleLength}
              onChange={e => update('avgCycleLength', parseInt(e.target.value))}
              className="q-range"
              style={{width:'100%', accentColor:'var(--bloom-glow)'}}
            />
            <span className="q-range-value" style={{color:'var(--bloom-text)'}}>{data.avgCycleLength} days</span>
          </div>
        </div>

        <div className="q-field" style={{flex:1}}>
          <label style={{color:'var(--bloom-muted)'}}>Average period duration (days)</label>
          <div className="q-range-display">
            <input
              type="range"
              min={1}
              max={14}
              value={data.avgPeriodDuration}
              onChange={e => update('avgPeriodDuration', parseInt(e.target.value))}
              className="q-range"
              style={{width:'100%', accentColor:'var(--bloom-glow)'}}
            />
            <span className="q-range-value" style={{color:'var(--bloom-text)'}}>{data.avgPeriodDuration} days</span>
          </div>
        </div>
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>How regular are your cycles?</label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['Very regular', 'Mostly regular', 'Somewhat irregular', 'Very irregular', 'Not sure'].map(r => (
            <button
              key={r}
              className={`q-chip ${data.cycleRegularity === r ? 'selected' : ''}`}
              onClick={() => update('cycleRegularity', r)}
              style={data.cycleRegularity === r
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer'}
              }
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>Typical flow intensity</label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['Light', 'Moderate', 'Heavy', 'Very heavy'].map(f => (
            <button
              key={f}
              className={`q-chip ${data.flowIntensity === f ? 'selected' : ''}`}
              onClick={() => update('flowIntensity', f)}
              style={data.flowIntensity === f
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer'}
              }
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
        <label style={{color:'var(--bloom-muted)'}}>Do you experience PMS?</label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['Yes, often', 'Sometimes', 'Rarely', 'No'].map(p => (
            <button
              key={p}
              className={`q-chip ${data.experiencePms === p ? 'selected' : ''}`}
              onClick={() => update('experiencePms', p)}
              style={data.experiencePms === p
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer'}
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>Common symptoms <span className="q-optional" style={{color:'var(--bloom-muted)'}}>(select all that apply)</span></label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['Cramps', 'Headaches', 'Bloating', 'Mood swings', 'Fatigue', 'Acne', 'Breast tenderness', 'Back pain', 'Nausea'].map(s => (
            <button
              key={s}
              className={`q-chip multi ${data.commonSymptoms.includes(s) ? 'selected' : ''}`}
              onClick={() => toggleArrayItem('commonSymptoms', s)}
              style={data.commonSymptoms.includes(s)
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:4}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:4}
              }
            >
              {data.commonSymptoms.includes(s) && <Check size={12} />} {s}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>Pain level during your period</label>
        <div className="q-pain-slider">
          <input
            type="range"
            min={1}
            max={10}
            value={data.painLevel}
            onChange={e => update('painLevel', parseInt(e.target.value))}
            className="q-range"
            style={{width:'100%', accentColor:'var(--bloom-glow)'}}
          />
          <div className="q-pain-labels" style={{display:'flex', justifyContent:'space-between', color:'var(--bloom-muted)'}}>
            <span>1 — Mild</span>
            <span className="q-pain-current" style={{color:'var(--bloom-text)', fontWeight:600}}>{data.painLevel}</span>
            <span>10 — Severe</span>
          </div>
        </div>
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>Diagnosed conditions <span className="q-optional" style={{color:'var(--bloom-muted)'}}>(select all that apply)</span></label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['PCOS', 'Endometriosis', 'Uterine fibroids', 'Adenomyosis', 'None of the above', 'Prefer not to say'].map(c => (
            <button
              key={c}
              className={`q-chip multi ${data.diagnosedConditions.includes(c) ? 'selected' : ''}`}
              onClick={() => toggleArrayItem('diagnosedConditions', c)}
              style={data.diagnosedConditions.includes(c)
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:4}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:4}
              }
            >
              {data.diagnosedConditions.includes(c) && <Check size={12} />} {c}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>Current birth control</label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['None', 'Pill', 'Hormonal IUD', 'Copper IUD', 'Implant', 'Patch / Ring', 'Condoms', 'Other'].map(b => (
            <button
              key={b}
              className={`q-chip ${data.currentBirthControl === b ? 'selected' : ''}`}
              onClick={() => update('currentBirthControl', b)}
              style={data.currentBirthControl === b
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer'}
              }
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
        <label style={{color:'var(--bloom-muted)'}}>Are you trying to conceive?</label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['Yes', 'No', 'Not applicable'].map(t => (
            <button
              key={t}
              className={`q-chip ${data.tryingToConceive === t ? 'selected' : ''}`}
              onClick={() => update('tryingToConceive', t)}
              style={data.tryingToConceive === t
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer'}
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>Average sleep per night</label>
        <div className="q-range-display">
          <input
            type="range"
            min={3}
            max={12}
            step={0.5}
            value={data.avgSleepHours}
            onChange={e => update('avgSleepHours', parseFloat(e.target.value))}
            className="q-range"
            style={{width:'100%', accentColor:'var(--bloom-glow)'}}
          />
          <span className="q-range-value" style={{color:'var(--bloom-text)'}}>{data.avgSleepHours} hours</span>
        </div>
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>How often do you exercise?</label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['Daily', '3 times a week', 'Once a week', 'Rarely', 'Never'].map(e => (
            <button
              key={e}
              className={`q-chip ${data.exerciseFrequency === e ? 'selected' : ''}`}
              onClick={() => update('exerciseFrequency', e)}
              style={data.exerciseFrequency === e
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer'}
              }
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>General stress level</label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['Low', 'Moderate', 'High', 'Very high'].map(s => (
            <button
              key={s}
              className={`q-chip ${data.stressLevel === s ? 'selected' : ''}`}
              onClick={() => update('stressLevel', s)}
              style={data.stressLevel === s
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer'}
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>Dietary preference <span className="q-optional" style={{color:'var(--bloom-muted)'}}>(optional)</span></label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['Omnivore', 'Vegetarian', 'Vegan', 'Other'].map(d => (
            <button
              key={d}
              className={`q-chip ${data.dietaryPreference === d ? 'selected' : ''}`}
              onClick={() => update('dietaryPreference', d)}
              style={data.dietaryPreference === d
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer'}
              }
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
        <label style={{color:'var(--bloom-muted)'}}>Primary goal for using Bloom</label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['Track my cycle', 'Understand symptoms', 'Try to conceive', 'Avoid pregnancy', 'Manage a condition', 'General wellness'].map(g => (
            <button
              key={g}
              className={`q-chip ${data.primaryGoal === g ? 'selected' : ''}`}
              onClick={() => update('primaryGoal', g)}
              style={data.primaryGoal === g
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer'}
              }
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>Have you tracked your period before?</label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['Yes, with an app', 'Yes, manually', 'No, this is my first time'].map(t => (
            <button
              key={t}
              className={`q-chip ${data.trackedBefore === t ? 'selected' : ''}`}
              onClick={() => update('trackedBefore', t)}
              style={data.trackedBefore === t
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer'}
              }
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>Would you like doctor-ready summaries?</label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['Yes, definitely!', 'Maybe later', 'No thanks'].map(d => (
            <button
              key={d}
              className={`q-chip ${data.doctorSummaries === d ? 'selected' : ''}`}
              onClick={() => update('doctorSummaries', d)}
              style={data.doctorSummaries === d
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer'}
              }
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="q-field">
        <label style={{color:'var(--bloom-muted)'}}>How did you hear about Bloom? <span className="q-optional" style={{color:'var(--bloom-muted)'}}>(optional)</span></label>
        <div className="q-chips" style={{display:'flex', flexWrap:'wrap', gap:8}}>
          {['Social media', 'Friend or family', 'Search engine', 'Healthcare provider', 'Other'].map(h => (
            <button
              key={h}
              className={`q-chip ${data.heardAbout === h ? 'selected' : ''}`}
              onClick={() => update('heardAbout', h)}
              style={data.heardAbout === h
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:99, color:'#fff', padding:'8px 16px', cursor:'pointer'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:99, color:'var(--bloom-text)', padding:'8px 16px', cursor:'pointer'}
              }
            >
              {h}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
