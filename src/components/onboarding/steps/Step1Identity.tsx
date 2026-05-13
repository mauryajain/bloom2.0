import type { OnboardingData } from '../../../types';

interface Props {
  data: OnboardingData;
  onUpdate: (u: Partial<OnboardingData>) => void;
  onNext: () => void;
  onBack: () => void;
}

const PRONOUNS = ['She/Her', 'They/Them', 'He/Him', 'Ze/Zir', 'Prefer not to say'];

export default function Step1Identity({ data, onUpdate, onNext }: Props) {
  const today = new Date().toISOString().split('T')[0];

  const validateDOB = (dob: string): string => {
    if (!dob) return '';
    const d = new Date(dob);
    if (isNaN(d.getTime())) return 'Please enter a valid date.';
    if (d > new Date()) return 'Date of birth cannot be in the future.';
    const age = Math.floor((Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
    if (age > 120) return 'Please enter a valid date of birth.';
    return '';
  };

  const dobError = data.dateOfBirth ? validateDOB(data.dateOfBirth) : '';
  const age = data.dateOfBirth && !dobError
    ? Math.floor((Date.now() - new Date(data.dateOfBirth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;
  const isMinor = age !== null && age < 18;

  const canNext = data.nickname.trim().length > 0 && data.dateOfBirth && !dobError && data.pronouns;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold mb-1" style={{fontFamily:'var(--font-heading)'}}>What should we call you?</h3>
        <p className="text-sm" style={{color:'var(--bloom-muted)'}}>This is how Bloom will address you throughout the app.</p>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{color:'var(--bloom-muted)'}}>Your nickname or first name</label>
        <input
          className="text-lg"
          style={{background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', borderRadius:12, color:'var(--bloom-text)', padding:'12px 16px', width:'100%', outline:'none'}}
          placeholder="e.g. Priya, Alex, Sam..."
          value={data.nickname}
          onChange={e => onUpdate({ nickname: e.target.value })}
          maxLength={50}
          autoFocus
        />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{color:'var(--bloom-muted)'}}>Date of birth</label>
        <input
          style={{
            background:'var(--bloom-surface)',
            border:`1px solid ${dobError ? 'var(--bloom-rose)' : 'var(--bloom-border)'}`,
            borderRadius:12,
            color:'var(--bloom-text)',
            padding:'12px 16px',
            width:'100%',
            outline:'none'
          }}
          type="date"
          max={today}
          value={data.dateOfBirth}
          onChange={e => onUpdate({ dateOfBirth: e.target.value })}
        />
        {dobError && <p className="text-xs mt-1" style={{color:'var(--bloom-rose)'}}>{dobError}</p>}
        {isMinor && (
          <div className="mt-2 p-3 rounded-xl text-xs" style={{background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.25)', color:'var(--bloom-amber)'}}>
            <strong>Young user detected.</strong> Bloom will automatically apply age-appropriate content settings.
          </div>
        )}
        {age !== null && !isMinor && !dobError && (
          <p className="text-xs mt-1" style={{color:'var(--bloom-muted)'}}>Age: {age} years</p>
        )}
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide mb-2 block" style={{color:'var(--bloom-muted)'}}>Your pronouns</label>
        <div className="flex flex-wrap gap-2">
          {PRONOUNS.map(p => (
            <button
              key={p}
              className="px-4 py-2 rounded-full text-sm transition-all font-medium"
              style={data.pronouns === p
                ? {background:'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', border:'none', color:'#fff', boxShadow:'0 0 15px rgba(124,58,237,0.3)'}
                : {background:'var(--bloom-surface)', border:'1px solid var(--bloom-border)', color:'var(--bloom-text)'}
              }
              onClick={() => onUpdate({ pronouns: p })}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <button
        className="w-full mt-2 font-semibold py-3"
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
  );
}
