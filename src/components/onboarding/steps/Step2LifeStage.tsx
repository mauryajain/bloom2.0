// Step 2 — Life Stage & Cycle Status
import type { OnboardingData, LifeStage } from '../../../types';

interface Props {
  data: OnboardingData;
  onUpdate: (u: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const LIFE_STAGES: { value: LifeStage; label: string; emoji: string; desc: string }[] = [
  { value: 'puberty', label: 'Puberty / Adolescence', emoji: '🌱', desc: 'Ages 8–17, first menstrual years' },
  { value: 'reproductive', label: 'Reproductive Years', emoji: '🌸', desc: 'Ages 18–39, regular cycles' },
  { value: 'pregnancy', label: 'Pregnant', emoji: '🤰', desc: 'Currently pregnant' },
  { value: 'postpartum', label: 'Postpartum', emoji: '🍼', desc: '0–12 months after birth' },
  { value: 'perimenopause', label: 'Perimenopause', emoji: '🌀', desc: 'Transition to menopause, avg onset 47' },
  { value: 'menopause', label: 'Menopause', emoji: '🌙', desc: '12+ months without a period' },
  { value: 'post-menopause', label: 'Post-Menopause', emoji: '⭐', desc: 'Life after menopause' },
];

const CYCLE_STATUSES = [
  'Regular cycles (21–35 days)',
  'Irregular cycles',
  'Absent / Amenorrhea',
  'On hormonal contraception',
  'Not currently tracking',
  'Not applicable',
];

export default function Step2LifeStage({ data, onUpdate, onNext, onBack }: Props) {
  const canNext = data.lifeStage && data.cycleStatus && data.cycleLength >= 15 && data.cycleLength <= 90;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-1">Your health journey</h3>
        <p className="text-warm-400 text-sm">This helps Bloom show you the most relevant insights for where you are in life.</p>
      </div>

      {/* Life Stage */}
      <div>
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-3 block">What life stage are you in?</label>
        <div className="grid grid-cols-1 gap-2">
          {LIFE_STAGES.map(ls => (
            <button
              key={ls.value}
              className={`p-4 rounded-2xl text-left transition-all border-2 ${
                data.lifeStage === ls.value
                  ? 'border-bloom-400 bg-bloom-50 shadow-bloom'
                  : 'border-transparent bg-white/60 hover:border-bloom-200'
              }`}
              onClick={() => onUpdate({ lifeStage: ls.value })}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ls.emoji}</span>
                <div>
                  <p className="font-semibold text-sm">{ls.label}</p>
                  <p className="text-xs text-warm-400">{ls.desc}</p>
                </div>
                {data.lifeStage === ls.value && (
                  <div className="ml-auto w-5 h-5 rounded-full bg-bloom-500 flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cycle Status */}
      <div>
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-2 block">Current cycle status</label>
        <div className="flex flex-wrap gap-2">
          {CYCLE_STATUSES.map(s => (
            <button
              key={s}
              className={`px-4 py-2 rounded-full text-sm transition-all font-medium ${
                data.cycleStatus === s
                  ? 'bg-bloom-500 text-white shadow-bloom'
                  : 'bg-white/60 border border-warm-200 text-warm-600 hover:border-bloom-300'
              }`}
              onClick={() => onUpdate({ cycleStatus: s })}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="cycle-length" className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-2 block">Average cycle length</label>
        <input
          id="cycle-length"
          className="bloom-input"
          type="number"
          min={15}
          max={90}
          value={data.cycleLength}
          onChange={e => onUpdate({ cycleLength: Number(e.target.value) })}
        />
        <p className="text-xs text-warm-400 mt-1">Typical cycles are often 21-35 days, but Bloom will use your average.</p>
      </div>

      <div className="flex gap-3">
        <button className="btn-bloom-outline" onClick={onBack}>← Back</button>
        <button className="btn-bloom flex-1" onClick={onNext} disabled={!canNext}>Continue →</button>
      </div>
    </div>
  );
}
