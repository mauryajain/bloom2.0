// Step 3 — Symptoms & Duration
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
        <h3 className="text-xl font-bold mb-1">Your symptoms</h3>
        <p className="text-warm-400 text-sm">Select all that apply. This helps Bloom understand your health baseline.</p>
      </div>

      {/* Symptom Grid */}
      <div>
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-3 block">
          Which symptoms have you been experiencing? ({data.symptoms.length} selected)
        </label>
        <div className="grid grid-cols-2 gap-2">
          {ALL_SYMPTOMS.map(s => {
            const selected = data.symptoms.includes(s.name);
            return (
              <button
                key={s.name}
                className={`p-3 rounded-xl text-left text-sm transition-all border-2 ${
                  selected
                    ? 'border-bloom-400 bg-bloom-50 shadow-sm'
                    : 'border-transparent bg-white/60 hover:border-bloom-200'
                }`}
                onClick={() => toggle(s.name)}
              >
                <span className="mr-2">{s.emoji}</span>
                <span className={selected ? 'font-semibold text-bloom-700' : 'text-warm-700'}>{s.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Duration */}
      <div>
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-2 block">How long have you been experiencing these symptoms?</label>
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map(d => (
            <button
              key={d}
              className={`px-4 py-2 rounded-full text-sm transition-all font-medium ${
                data.symptomDuration === d
                  ? 'bg-bloom-500 text-white shadow-bloom'
                  : 'bg-white/60 border border-warm-200 text-warm-600 hover:border-bloom-300'
              }`}
              onClick={() => onUpdate({ symptomDuration: d })}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Dismissal History */}
      <div>
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-2 block">
          Have healthcare providers dismissed your concerns? <span className="font-normal normal-case text-warm-400">(optional)</span>
        </label>
        <div className="space-y-2">
          {DISMISSAL_OPTIONS.map(o => (
            <button
              key={o}
              className={`w-full p-3 rounded-xl text-left text-sm transition-all border-2 ${
                data.dismissalHistory.includes(o)
                  ? 'border-bloom-400 bg-bloom-50'
                  : 'border-transparent bg-white/60 hover:border-warm-200'
              }`}
              onClick={() => toggleDismissal(o)}
            >
              {data.dismissalHistory.includes(o) ? '✓ ' : ''}{o}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <button className="btn-bloom-outline" onClick={onBack}>← Back</button>
        <button className="btn-bloom flex-1" onClick={onNext} disabled={!canNext}>Continue →</button>
      </div>
    </div>
  );
}
