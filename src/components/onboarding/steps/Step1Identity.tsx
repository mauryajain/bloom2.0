// Step 1 — About You (nickname, DOB, pronouns)
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
        <h3 className="text-xl font-bold mb-1">What should we call you?</h3>
        <p className="text-warm-400 text-sm">This is how Bloom will address you throughout the app.</p>
      </div>

      {/* Nickname */}
      <div>
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-2 block">Your nickname or first name</label>
        <input
          className="bloom-input text-lg"
          placeholder="e.g. Priya, Alex, Sam..."
          value={data.nickname}
          onChange={e => onUpdate({ nickname: e.target.value })}
          maxLength={50}
          autoFocus
        />
      </div>

      {/* Date of Birth */}
      <div>
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-2 block">Date of birth</label>
        <input
          className={`bloom-input ${dobError ? 'border-rose-300' : ''}`}
          type="date"
          max={today}
          value={data.dateOfBirth}
          onChange={e => onUpdate({ dateOfBirth: e.target.value })}
        />
        {dobError && <p className="text-xs text-rose-500 mt-1">{dobError}</p>}
        {isMinor && (
          <div className="mt-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            🛡️ <strong>Young user detected.</strong> Bloom will automatically apply age-appropriate content settings.
          </div>
        )}
        {age !== null && !isMinor && !dobError && (
          <p className="text-xs text-warm-400 mt-1">Age: {age} years</p>
        )}
      </div>

      {/* Pronouns */}
      <div>
        <label className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-2 block">Your pronouns</label>
        <div className="flex flex-wrap gap-2">
          {PRONOUNS.map(p => (
            <button
              key={p}
              className={`px-4 py-2 rounded-full text-sm transition-all font-medium ${
                data.pronouns === p
                  ? 'bg-bloom-500 text-white shadow-bloom'
                  : 'bg-white/60 border border-warm-200 text-warm-600 hover:border-bloom-300'
              }`}
              onClick={() => onUpdate({ pronouns: p })}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <button
        className="btn-bloom w-full mt-2"
        onClick={onNext}
        disabled={!canNext}
      >
        Continue →
      </button>
    </div>
  );
}
