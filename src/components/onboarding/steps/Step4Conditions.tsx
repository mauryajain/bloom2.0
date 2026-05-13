import type { OnboardingData } from '../../../types';
interface Props { data: OnboardingData; onUpdate: (u: Partial<OnboardingData>) => void; onNext: () => void; onBack: () => void; }
const CONDITIONS = ['Endometriosis','PCOS (Polycystic Ovary Syndrome)','Fibroids (Uterine)','Adenomyosis','PMDD','Hypothyroidism','Hyperthyroidism','Iron Deficiency Anemia','Vulvodynia','Fibromyalgia','Lupus','Rheumatoid Arthritis','Breast Cancer','Ovarian Cancer','Cervical Cancer','Osteoporosis','Cardiovascular Disease','Type 2 Diabetes','Depression','Anxiety Disorder'];

const TOOLTIPS: Record<string, string> = {
  'Endometriosis': 'Tissue similar to uterus lining grows outside the uterus, causing pain and sometimes fertility issues.',
  'PCOS (Polycystic Ovary Syndrome)': 'A hormonal imbalance causing irregular periods, excess hair growth, acne, and metabolic changes.',
  'Fibroids (Uterine)': 'Noncancerous growths in the uterus that can cause heavy bleeding, pressure, and discomfort.',
  'Adenomyosis': 'Uterus lining grows into the muscular wall, leading to heavy, painful periods and an enlarged uterus.',
  'PMDD': 'A severe form of PMS causing extreme mood swings, irritability, and depression before each period.',
  'Hypothyroidism': 'An underactive thyroid that slows your metabolism, causing fatigue, weight gain, and cold sensitivity.',
  'Hyperthyroidism': 'An overactive thyroid that speeds up your metabolism, causing weight loss, anxiety, and rapid heartbeat.',
  'Iron Deficiency Anemia': 'Low iron levels in your blood, leaving you exhausted, pale, dizzy, and short of breath.',
  'Vulvodynia': 'Chronic pain or burning in the vulvar area lasting 3+ months with no identifiable cause.',
  'Fibromyalgia': 'Widespread muscle pain accompanied by fatigue, brain fog, poor sleep, and tender points.',
  'Lupus': 'An autoimmune condition where the immune system attacks healthy tissues, causing joint pain, rash, and fatigue.',
  'Rheumatoid Arthritis': 'An autoimmune condition causing painful, swollen joints, often in hands and feet symmetrically.',
  'Breast Cancer': 'Uncontrolled growth of abnormal cells in breast tissue that can form a lump or spread.',
  'Ovarian Cancer': 'Abnormal cell growth in the ovaries, often detected at later stages due to vague symptoms.',
  'Cervical Cancer': 'Abnormal cell growth in the cervix, often linked to HPV, detectable through regular screenings.',
  'Osteoporosis': 'Bones become weak and brittle, making them fracture easily — often called "brittle bone disease."',
  'Cardiovascular Disease': 'A group of heart and blood vessel conditions including heart attacks, strokes, and high blood pressure.',
  'Type 2 Diabetes': 'The body becomes resistant to insulin, causing high blood sugar that affects energy and organ health.',
  'Depression': 'A mental health condition marked by persistent sadness, loss of interest, low energy, and hopelessness lasting weeks+.',
  'Anxiety Disorder': 'Excessive, persistent worry or fear that interferes with daily life, often with physical symptoms like rapid heartbeat.',
};

function Tooltip({ content, children }: { content: string; children: React.ReactNode }) {
  return (
    <div className="relative group">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-[11px] leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 w-56 text-center" style={{background:'var(--bloom-lift)', border:'1px solid var(--bloom-border)', color:'var(--bloom-text)', boxShadow:'0 4px 20px rgba(0,0,0,0.4)'}}>
        {content}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent" style={{borderTopColor:'var(--bloom-lift)'}} />
      </div>
    </div>
  );
}

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
  const Pill = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => {
    const isNone = label.startsWith('None');
    return (
      <button onClick={onClick} className="p-2.5 rounded-xl text-left text-xs transition-all border-2" style={selected ? {borderColor:'var(--bloom-glow)', background:'var(--bloom-lift)', fontWeight:600, color:'var(--bloom-text)'} : {borderColor:'transparent', background:'var(--bloom-surface)', color:'var(--bloom-text)'}}>
        {selected ? '✓ ' : ''}
        {isNone ? label : (
          <Tooltip content={TOOLTIPS[label] || ''}>{label}</Tooltip>
        )}
      </button>
    );
  };
  return (
    <div className="space-y-6">
      <div><h3 className="text-xl font-bold mb-1" style={{fontFamily:'var(--font-heading)'}}>Conditions & family history</h3><p className="text-sm" style={{color:'var(--bloom-muted)'}}>Optional — select only what you're comfortable sharing. Hover over any condition to learn more.</p></div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{color:'var(--bloom-muted)'}}>Diagnosed conditions</label>
        <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
          {[...CONDITIONS,'None of the above'].map(c => {
            const isNone = c === 'None of the above';
            const sel = isNone ? data.diagnosedConditions.length === 0 : data.diagnosedConditions.includes(c);
            return <Pill key={c} label={c} selected={sel} onClick={() => toggleDiagnosed(isNone ? 'None' : c)} />;
          })}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{color:'var(--bloom-muted)'}}>Family history</label>
        <div className="grid grid-cols-2 gap-1.5 max-h-52 overflow-y-auto pr-1">
          {[...CONDITIONS,'None of the above'].map(c => {
            const isNone = c === 'None of the above';
            const sel = isNone ? data.familyHistory.length === 0 : data.familyHistory.includes(c);
            return <Pill key={c} label={c} selected={sel} onClick={() => toggleFamily(isNone ? 'None' : c)} />;
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
          style={{background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:14, color:'#fff', cursor:'pointer'}}
          onClick={onNext}
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
