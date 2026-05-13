import { Loader2 } from 'lucide-react';
import type { OnboardingData, CommunicationStyle } from '../../../types';
interface Props { data: OnboardingData; onUpdate: (u: Partial<OnboardingData>) => void; onNext: () => void; onBack: () => void; onSubmit: () => void; submitting: boolean; submitError: string; }
const STYLES: { value: CommunicationStyle; label: string; desc: string; emoji: string }[] = [
  { value: 'warm', label: 'Warm & Supportive', desc: 'Empathetic, conversational, like a knowledgeable friend', emoji: '🤗' },
  { value: 'balanced', label: 'Balanced', desc: 'Mix of warmth and clear information', emoji: '⚖️' },
  { value: 'clinical', label: 'Direct & Clinical', desc: 'Structured, factual, concise — no fluff', emoji: '📋' },
];
const REMINDERS = ['Daily symptom log reminder','Weekly pattern summary','Doctor visit prep alerts','Screening & health calendar reminders'];

export default function Step6Preferences({ data, onUpdate, onBack, onSubmit, submitting, submitError }: Props) {
  const toggleReminder = (r: string) => {
    const c = data.reminderPreferences;
    onUpdate({ reminderPreferences: c.includes(r) ? c.filter(x => x !== r) : [...c, r] });
  };
  const canSubmit = data.communicationStyle;
  return (
    <div className="space-y-6">
      <div><h3 className="text-xl font-bold mb-1" style={{fontFamily:'var(--font-heading)'}}>Your preferences</h3><p className="text-sm" style={{color:'var(--bloom-muted)'}}>Almost done! Set how you'd like Bloom to communicate with you.</p></div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide mb-3 block" style={{color:'var(--bloom-muted)'}}>How should Bloom talk to you?</label>
        <div className="space-y-2">
          {STYLES.map(s => {
            const sel = data.communicationStyle === s.value;
            return (
              <button key={s.value} onClick={() => onUpdate({ communicationStyle: s.value })} className="w-full p-4 rounded-2xl text-left transition-all border-2" style={sel ? {borderColor:'var(--bloom-glow)', background:'var(--bloom-lift)', color:'var(--bloom-text)'} : {borderColor:'transparent', background:'var(--bloom-surface)', color:'var(--bloom-text)'}}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{s.label}</p>
                    <p className="text-xs" style={{color:'var(--bloom-muted)'}}>{s.desc}</p>
                  </div>
                  {sel && <div className="ml-auto w-5 h-5 rounded-full flex items-center justify-center" style={{background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))'}}><span className="text-white text-xs">✓</span></div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{color:'var(--bloom-muted)'}}>Reminder preferences <span className="font-normal normal-case" style={{color:'var(--bloom-muted)'}}>(optional)</span></label>
        <div className="space-y-2">
          {REMINDERS.map(r => {
            const sel = data.reminderPreferences.includes(r);
            return (
              <button key={r} onClick={() => toggleReminder(r)} className="w-full p-3 rounded-xl text-left text-sm transition-all border-2" style={sel ? {borderColor:'var(--bloom-glow)', background:'var(--bloom-lift)', color:'var(--bloom-text)'} : {borderColor:'transparent', background:'var(--bloom-surface)', color:'var(--bloom-text)'}}>
                {sel ? '✓ ' : ''}{r}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{color:'var(--bloom-muted)'}}>Do you have a regular doctor?</label>
        <div className="flex gap-3">
          <button onClick={() => onUpdate({ hasDoctor: true })} className="flex-1 p-3 rounded-xl text-sm font-medium transition-all border-2" style={data.hasDoctor ? {borderColor:'var(--bloom-glow)', background:'var(--bloom-lift)', color:'var(--bloom-text)'} : {borderColor:'transparent', background:'var(--bloom-surface)', color:'var(--bloom-text)'}}>✓ Yes</button>
          <button onClick={() => onUpdate({ hasDoctor: false })} className="flex-1 p-3 rounded-xl text-sm font-medium transition-all border-2" style={!data.hasDoctor ? {borderColor:'rgba(124,58,237,0.3)', background:'var(--bloom-lift)', color:'var(--bloom-text)'} : {borderColor:'transparent', background:'var(--bloom-surface)', color:'var(--bloom-text)'}}>Not currently</button>
        </div>
      </div>
      {submitError && <p className="text-xs p-3 rounded-xl border" style={{color:'var(--bloom-rose)', background:'rgba(232,121,160,0.1)', borderColor:'rgba(232,121,160,0.25)'}}>{submitError}</p>}
      <div className="flex gap-3">
        <button className="flex-1 font-semibold py-3" style={{background:'transparent', border:'1px solid var(--bloom-border)', borderRadius:14, color:'var(--bloom-text)', cursor: submitting ? 'not-allowed' : 'pointer'}} onClick={onBack} disabled={submitting}>← Back</button>
        <button className="flex-1 font-semibold py-3 flex items-center justify-center gap-2" style={{background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', borderRadius:14, color:'#fff', cursor: canSubmit && !submitting ? 'pointer' : 'not-allowed', opacity: canSubmit && !submitting ? 1 : 0.5}} onClick={onSubmit} disabled={!canSubmit || submitting}>
          {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating your Bloom...</> : '🌸 Create My Bloom'}
        </button>
      </div>
    </div>
  );
}
