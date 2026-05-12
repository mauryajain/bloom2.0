// Step 6 — Communication Preferences & Submit
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
      <div><h3 className="text-xl font-bold mb-1">Your preferences</h3><p className="text-warm-400 text-sm">Almost done! Set how you'd like Bloom to communicate with you.</p></div>
      <div>
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-3 block">How should Bloom talk to you?</label>
        <div className="space-y-2">
          {STYLES.map(s => {
            const sel = data.communicationStyle === s.value;
            return (
              <button key={s.value} onClick={() => onUpdate({ communicationStyle: s.value })} className={`w-full p-4 rounded-2xl text-left transition-all border-2 ${sel ? 'border-bloom-400 bg-bloom-50 shadow-bloom' : 'border-transparent bg-white/60 hover:border-bloom-200'}`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <p className="font-semibold text-sm">{s.label}</p>
                    <p className="text-xs text-warm-400">{s.desc}</p>
                  </div>
                  {sel && <div className="ml-auto w-5 h-5 rounded-full bg-bloom-500 flex items-center justify-center"><span className="text-white text-xs">✓</span></div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-2 block">Reminder preferences <span className="font-normal text-warm-400 normal-case">(optional)</span></label>
        <div className="space-y-2">
          {REMINDERS.map(r => {
            const sel = data.reminderPreferences.includes(r);
            return (
              <button key={r} onClick={() => toggleReminder(r)} className={`w-full p-3 rounded-xl text-left text-sm transition-all border-2 ${sel ? 'border-bloom-400 bg-bloom-50' : 'border-transparent bg-white/60 hover:border-warm-200'}`}>
                {sel ? '✓ ' : ''}{r}
              </button>
            );
          })}
        </div>
      </div>
      <div>
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-2 block">Do you have a regular doctor?</label>
        <div className="flex gap-3">
          <button onClick={() => onUpdate({ hasDoctor: true })} className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all border-2 ${data.hasDoctor ? 'border-bloom-400 bg-bloom-50' : 'border-transparent bg-white/60 hover:border-bloom-200'}`}>✓ Yes</button>
          <button onClick={() => onUpdate({ hasDoctor: false })} className={`flex-1 p-3 rounded-xl text-sm font-medium transition-all border-2 ${!data.hasDoctor ? 'border-warm-400 bg-warm-50' : 'border-transparent bg-white/60 hover:border-warm-200'}`}>Not currently</button>
        </div>
      </div>
      {submitError && <p className="text-xs text-rose-500 bg-rose-50 p-3 rounded-xl border border-rose-200">{submitError}</p>}
      <div className="flex gap-3">
        <button className="btn-bloom-outline" onClick={onBack} disabled={submitting}>← Back</button>
        <button className="btn-bloom flex-1 flex items-center justify-center gap-2" onClick={onSubmit} disabled={!canSubmit || submitting}>
          {submitting ? <><Loader2 size={16} className="animate-spin" /> Creating your Bloom...</> : '🌸 Create My Bloom'}
        </button>
      </div>
    </div>
  );
}
