import type { OnboardingData } from '../../../types';
interface Props { data: OnboardingData; onUpdate: (u: Partial<OnboardingData>) => void; onNext: () => void; onBack: () => void; }
const GOALS = ['Understand my body and cycles','Identify patterns in my symptoms','Prepare better for doctor visits','Track symptoms for a specific condition','Find conditions that match my symptoms','Get support for life stage changes','Monitor mental health alongside physical health','Support a fertility journey'];
const URGENCY_LABELS = ['1 – Just curious','2 – Mild concern','3 – Moderate concern','4 – Significant concern','5 – I need answers urgently'];

export default function Step5Goals({ data, onUpdate, onNext, onBack }: Props) {
  const toggle = (g: string) => {
    const c = data.goals;
    onUpdate({ goals: c.includes(g) ? c.filter(x => x !== g) : [...c, g] });
  };
  const canNext = data.goals.length > 0;
  return (
    <div className="space-y-6">
      <div><h3 className="text-xl font-bold mb-1" style={{fontFamily:'var(--font-heading)'}}>Your goals</h3><p className="text-sm" style={{color:'var(--bloom-muted)'}}>What do you want Bloom to help you with?</p></div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{color:'var(--bloom-muted)'}}>Select all that apply ({data.goals.length} selected)</label>
        <div className="space-y-2">
          {GOALS.map(g => {
            const sel = data.goals.includes(g);
            return (
              <button key={g} onClick={() => toggle(g)} className="w-full p-4 rounded-2xl text-left text-sm transition-all border-2" style={sel ? {borderColor:'var(--bloom-glow)', background:'var(--bloom-lift)', fontWeight:600, color:'var(--bloom-text)'} : {borderColor:'transparent', background:'var(--bloom-surface)', color:'var(--bloom-text)'}}>
                {sel ? '✓ ' : ''}{g}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{color:'var(--bloom-muted)'}}>How urgently do you need support?</label>
        <div className="space-y-2">
          {URGENCY_LABELS.map((label, i) => {
            const val = i + 1;
            const sel = data.urgencyScore === val;
            const urgencyColors = [
              {bg:'rgba(6,214,160,0.12)', border:'rgba(6,214,160,0.3)', text:'var(--bloom-teal)'},
              {bg:'rgba(251,191,36,0.12)', border:'rgba(251,191,36,0.3)', text:'var(--bloom-amber)'},
              {bg:'rgba(251,191,36,0.18)', border:'rgba(251,191,36,0.4)', text:'var(--bloom-amber)'},
              {bg:'rgba(232,121,160,0.12)', border:'rgba(232,121,160,0.3)', text:'var(--bloom-rose)'},
              {bg:'rgba(232,121,160,0.2)', border:'rgba(232,121,160,0.45)', text:'var(--bloom-rose)'},
            ];
            return (
              <button key={val} onClick={() => onUpdate({ urgencyScore: val })} className="w-full p-3 rounded-xl text-left text-sm font-medium transition-all border-2" style={sel ? {borderColor:urgencyColors[i].border, background:urgencyColors[i].bg, color:urgencyColors[i].text} : {borderColor:'transparent', background:'var(--bloom-surface)', color:'var(--bloom-text)'}}>
                {label}
              </button>
            );
          })}
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
