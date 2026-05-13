import type { OnboardingData } from '../../../types';

interface Props {
  data: OnboardingData;
  onUpdate: (u: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const ALL_SYMPTOMS = [
  { name: 'Pelvic Pain', emoji: '😣' },
  { name: 'Cramping', emoji: '🔥' },
  { name: 'Lower Back Pain', emoji: '💢' },
  { name: 'Headache / Migraine', emoji: '🤕' },
  { name: 'Joint Pain', emoji: '🦴' },
  { name: 'Bloating', emoji: '🎈' },
  { name: 'Nausea', emoji: '🤢' },
  { name: 'Constipation / Diarrhoea', emoji: '🌀' },
  { name: 'Fatigue', emoji: '😴' },
  { name: 'Brain Fog', emoji: '🌫️' },
  { name: 'Mood Swings', emoji: '🎭' },
  { name: 'Anxiety', emoji: '😰' },
  { name: 'Depression / Low Mood', emoji: '😔' },
  { name: 'Insomnia', emoji: '🌙' },
  { name: 'Hot Flashes', emoji: '🌡️' },
  { name: 'Night Sweats', emoji: '💦' },
  { name: 'Breast Tenderness', emoji: '💗' },
  { name: 'Heavy Bleeding', emoji: '🩸' },
  { name: 'Acne', emoji: '🔴' },
  { name: 'Other', emoji: '✨' },
];

const DURATIONS = [
  'Less than 3 months',
  '3–12 months',
  '1–3 years',
  '3+ years',
  "I'm not sure",
];

const DISMISSAL_OPTIONS = [
  'Yes — told it was "normal"',
  'Yes — given pain medication only',
  'Yes — referred elsewhere without explanation',
  'Yes — felt not taken seriously',
  'No — my concerns have been heard',
  "I haven't discussed with a doctor yet",
];

export default function Step3Symptoms({ data, onUpdate, onNext, onBack }: Props) {
  const toggle = (name: string) => {
    const current = data.symptoms;
    const updated = current.includes(name)
      ? current.filter(s => s !== name)
      : [...current, name];
    onUpdate({ symptoms: updated });
  };

  const toggleDismissal = (option: string) => {
    const current = data.dismissalHistory;
    const updated = current.includes(option)
      ? current.filter(d => d !== option)
      : [...current, option];
    onUpdate({ dismissalHistory: updated });
  };

  const canNext = data.symptoms.length > 0 && data.symptomDuration;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-1" style={{fontFamily:'var(--font-heading)'}}>Your symptoms</h3>
        <p className="text-sm" style={{color:'var(--bloom-muted)'}}>Select all that apply. This helps Bloom understand your health baseline.</p>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{color:'var(--bloom-muted)'}}>
          Which symptoms have you been experiencing? ({data.symptoms.length} selected)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ALL_SYMPTOMS.map(s => {
            const selected = data.symptoms.includes(s.name);
            return (
              <button
                key={s.name}
                className="p-3 rounded-xl text-left text-sm transition-all border-2"
                style={selected
                  ? {borderColor:'var(--bloom-glow)', background:'var(--bloom-lift)', color:'var(--bloom-text)'}
                  : {borderColor:'transparent', background:'var(--bloom-surface)', color:'var(--bloom-text)'}
                }
                onClick={() => toggle(s.name)}
              >
                <span className="mr-2">{s.emoji}</span>
                <span style={selected ? {fontWeight:600, color:'var(--bloom-glow)'} : {}}>{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{color:'var(--bloom-muted)'}}>How long have you been experiencing these symptoms?</label>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map(d => (
            <button
              key={d}
              className="px-4 py-2 rounded-full text-sm transition-all font-medium"
              style={data.symptomDuration === d
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', color:'#fff', boxShadow:'0 0 15px rgba(124,58,237,0.3)'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', color:'var(--bloom-text)'}
              }
              onClick={() => onUpdate({ symptomDuration: d })}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{color:'var(--bloom-muted)'}}>
          Have healthcare providers dismissed your concerns? <span className="font-normal normal-case" style={{color:'var(--bloom-muted)'}}>(optional)</span>
        </label>
        <div className="space-y-2">
          {DISMISSAL_OPTIONS.map(o => (
            <button
              key={o}
              className="w-full p-3 rounded-xl text-left text-sm transition-all border-2"
              style={data.dismissalHistory.includes(o)
                ? {borderColor:'var(--bloom-glow)', background:'var(--bloom-lift)', color:'var(--bloom-text)'}
                : {borderColor:'transparent', background:'var(--bloom-surface)', color:'var(--bloom-text)'}
              }
              onClick={() => toggleDismissal(o)}
            >
              {data.dismissalHistory.includes(o) ? '✓ ' : ''}{o}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button
          className="flex-1 font-semibold py-3"
          style={{background:'transparent', border:'1px solid var(--bloom-border)', borderRadius:14, color:'var(--bloom-text)', cursor:'pointer'}}
          onClick={onBack}
        >
          ← Back
        </button>
        <button
          className="flex-1 font-semibold py-3"
          style={{
            background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))',
            border:'none',
            borderRadius:14,
            color:'#fff',
            cursor: canNext ? 'pointer' : 'not-allowed',
            opacity: canNext ? 1 : 0.5
          }}
          onClick={onNext}
          disabled={!canNext}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
