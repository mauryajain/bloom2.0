// Step 5 — Goals & Urgency
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
      <div><h3 className="text-xl font-bold mb-1">Your goals</h3><p className="text-warm-400 text-sm">What do you want Bloom to help you with?</p></div>
      <div>
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-3 block">Select all that apply ({data.goals.length} selected)</label>
        <div className="space-y-2">
          {GOALS.map(g => {
            const sel = data.goals.includes(g);
            return (
              <button key={g} onClick={() => toggle(g)} className={`w-full p-4 rounded-2xl text-left text-sm transition-all border-2 ${sel ? 'border-bloom-400 bg-bloom-50 font-semibold' : 'border-transparent bg-white/60 hover:border-bloom-200'}`}>
                {sel ? '✓ ' : ''}{g}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-3 block">How urgently do you need support?</label>
        <div className="space-y-2">
          {URGENCY_LABELS.map((label, i) => {
            const val = i + 1;
            const sel = data.urgencyScore === val;
            const colors = ['text-green-600 border-green-300 bg-green-50','text-lime-600 border-lime-300 bg-lime-50','text-amber-600 border-amber-300 bg-amber-50','text-orange-600 border-orange-300 bg-orange-50','text-rose-600 border-rose-300 bg-rose-50'];
            return (
              <button key={val} onClick={() => onUpdate({ urgencyScore: val })} className={`w-full p-3 rounded-xl text-left text-sm font-medium transition-all border-2 ${sel ? colors[i] : 'border-transparent bg-white/60 hover:border-warm-200 text-warm-600'}`}>
                {label}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex gap-3">
        <button className="btn-bloom-outline" onClick={onBack}>← Back</button>
        <button className="btn-bloom flex-1" onClick={onNext} disabled={!canNext}>Continue →</button>
      </div>
    </div>
  );
}
