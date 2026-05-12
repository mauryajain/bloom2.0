// Step 4 — Diagnosed Conditions & Family History
import type { OnboardingData } from '../../../types';
interface Props { data: OnboardingData; onUpdate: (u: Partial<OnboardingData>) => void; onNext: () => void; onBack: () => void; }
const CONDITIONS = ['Endometriosis','PCOS (Polycystic Ovary Syndrome)','Fibroids (Uterine)','Adenomyosis','PMDD','Hypothyroidism','Hyperthyroidism','Iron Deficiency Anemia','Vulvodynia','Fibromyalgia','Lupus','Rheumatoid Arthritis','Breast Cancer','Ovarian Cancer','Cervical Cancer','Osteoporosis','Cardiovascular Disease','Type 2 Diabetes','Depression','Anxiety Disorder'];

export default function Step4Conditions({ data, onUpdate, onNext, onBack }: Props) {
  const toggleDiagnosed = (name: string) => {
    if (name === 'None') { onUpdate({ diagnosedConditions: [] }); return; }
    const c = data.diagnosedConditions.filter(x => x !== 'None');
    onUpdate({ diagnosedConditions: c.includes(name) ? c.filter(x => x !== name) : [...c, name] });
  };
  const toggleFamily = (name: string) => {
    if (name === 'None') { onUpdate({ familyHistory: [] }); return; }
    const c = data.familyHistory.filter(x => x !== 'None');
    onUpdate({ familyHistory: c.includes(name) ? c.filter(x => x !== name) : [...c, name] });
  };
  const Pill = ({ label, selected, color, onClick }: { label: string; selected: boolean; color: string; onClick: () => void }) => (
    <button onClick={onClick} className={`p-2.5 rounded-xl text-left text-xs transition-all border-2 ${selected ? `border-${color}-400 bg-${color}-50 font-semibold` : 'border-transparent bg-white/60 hover:border-warm-200'}`}>
      {selected ? '✓ ' : ''}{label}
    </button>
  );
  return (
    <div className="space-y-6">
      <div><h3 className="text-xl font-bold mb-1">Conditions & family history</h3><p className="text-warm-400 text-sm">Optional — select only what you're comfortable sharing.</p></div>
      <div>
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-2 block">Diagnosed conditions</label>
        <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
          {[...CONDITIONS,'None of the above'].map(c => {
            const isNone = c === 'None of the above';
            const sel = isNone ? data.diagnosedConditions.length === 0 : data.diagnosedConditions.includes(c);
            return <Pill key={c} label={c} selected={sel} color="bloom" onClick={() => toggleDiagnosed(isNone ? 'None' : c)} />;
          })}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-2 block">Family history</label>
        <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
          {[...CONDITIONS,'None of the above'].map(c => {
            const isNone = c === 'None of the above';
            const sel = isNone ? data.familyHistory.length === 0 : data.familyHistory.includes(c);
            return <Pill key={c} label={c} selected={sel} color="rose" onClick={() => toggleFamily(isNone ? 'None' : c)} />;
          })}
        </div>
      </div>
      <div className="flex gap-3">
        <button className="btn-bloom-outline" onClick={onBack}>← Back</button>
        <button className="btn-bloom flex-1" onClick={onNext}>Continue →</button>
      </div>
    </div>
  );
}
