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
        <h3 className="text-xl font-bold mb-1" style={{fontFamily:'var(--font-heading)'}}>Your health journey</h3>
        <p className="text-sm" style={{color:'var(--bloom-muted)'}}>This helps Bloom show you the most relevant insights for where you are in life.</p>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{color:'var(--bloom-muted)'}}>What life stage are you in?</label>
        <div className="grid grid-cols-1 gap-2">
          {LIFE_STAGES.map(ls => (
            <button
              key={ls.value}
              className="p-4 rounded-2xl text-left transition-all border-2"
              style={data.lifeStage === ls.value
                ? {borderColor:'var(--bloom-glow)', background:'var(--bloom-lift)', color:'var(--bloom-text)'}
                : {borderColor:'transparent', background:'var(--bloom-surface)', color:'var(--bloom-text)'}
              }
              onClick={() => onUpdate({ lifeStage: ls.value })}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{ls.emoji}</span>
                <div>
                  <p className="font-semibold text-sm">{ls.label}</p>
                  <p className="text-xs" style={{color:'var(--bloom-muted)'}}>{ls.desc}</p>
                </div>
                {data.lifeStage === ls.value && (
                  <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))'}}>
                    <span className="text-white text-xs">✓</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{color:'var(--bloom-muted)'}}>Current cycle status</label>
        <div className="flex flex-wrap gap-2">
          {CYCLE_STATUSES.map(s => (
            <button
              key={s}
              className="px-4 py-2 rounded-full text-sm transition-all font-medium"
              style={data.cycleStatus === s
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', color:'#fff', boxShadow:'0 0 15px rgba(124,58,237,0.3)'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', color:'var(--bloom-text)'}
              }
              onClick={() => onUpdate({ cycleStatus: s })}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="cycle-length" className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{color:'var(--bloom-muted)'}}>Average cycle length</label>
        <input
          id="cycle-length"
          style={{background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:12, color:'var(--bloom-text)', padding:'12px 16px', width:'100%', outline:'none'}}
          type="number"
          min={15}
          max={90}
          value={data.cycleLength}
          onChange={e => onUpdate({ cycleLength: Number(e.target.value) })}
        />
        <p className="text-xs mt-1" style={{color:'var(--bloom-muted)'}}>Typical cycles are often 21-35 days, but Bloom will use your average.</p>
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
