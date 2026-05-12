// ============================================================
// BLOOM — Onboarding Flow Master Controller
// Manages 6-step questionnaire with progress, validation, and DB submit
// ============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBloomStore } from '../../store/useBloomStore';
import type { OnboardingData } from '../../types';
import { Flower2 } from 'lucide-react';
import Step1Identity from './steps/Step1Identity';
import Step2LifeStage from './steps/Step2LifeStage';
import Step3Symptoms from './steps/Step3Symptoms';
import Step4Conditions from './steps/Step4Conditions';
import Step5Goals from './steps/Step5Goals';
import Step6Preferences from './steps/Step6Preferences';

const TOTAL_STEPS = 6;

const STEP_TITLES = [
  'About You',
  'Your Health Journey',
  'Your Symptoms',
  'Conditions & History',
  'Your Goals',
  'Preferences',
];

const emptyOnboarding: OnboardingData = {
  nickname: '',
  dateOfBirth: '',
  pronouns: '',
  lifeStage: '',
  cycleStatus: '',
  cycleLength: 28,
  symptoms: [],
  symptomDuration: '',
  dismissalHistory: [],
  diagnosedConditions: [],
  familyHistory: [],
  goals: [],
  urgencyScore: 3,
  communicationStyle: 'balanced',
  reminderPreferences: [],
  hasDoctor: false,
};

export default function OnboardingFlow() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState<OnboardingData>(emptyOnboarding);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [done, setDone] = useState(false);

  const { currentUser, submitOnboarding } = useBloomStore();
  const navigate = useNavigate();

  const progress = (step / TOTAL_STEPS) * 100;

  const update = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(s => s + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(s => s - 1);
  };

  const handleSubmit = async () => {
    if (!currentUser) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      await submitOnboarding(currentUser.id, data);
      setDone(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setSubmitError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnterBloom = () => {
    navigate('/dashboard');
  };

  // ---- "Your Bloom is ready" confirmation ----
  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
        <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-bloom-400 to-rose-400 flex items-center justify-center shadow-bloom mb-6 animate-[bloom_0.6s_ease-out]">
          <Flower2 size={56} className="text-white" />
        </div>
        <h1 className="text-3xl font-bold font-[var(--font-display)] gradient-text mb-3">
          Your Bloom is ready 🌸
        </h1>
        <p className="text-warm-500 max-w-sm mb-8 leading-relaxed">
          Welcome, {data.nickname}! Your personalised health profile has been created.
          Bloom will use this to give you insights tailored specifically to you.
        </p>
        <div className="glass-card p-5 max-w-sm w-full text-left mb-8 space-y-2">
          <p className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-3">Your profile summary</p>
          <p className="text-sm"><span className="text-warm-400">Life stage: </span><span className="font-medium">{data.lifeStage}</span></p>
          <p className="text-sm"><span className="text-warm-400">Symptoms tracked: </span><span className="font-medium">{data.symptoms.length} selected</span></p>
          <p className="text-sm"><span className="text-warm-400">Conditions: </span><span className="font-medium">{data.diagnosedConditions.length > 0 ? data.diagnosedConditions.join(', ') : 'None reported'}</span></p>
          <p className="text-sm"><span className="text-warm-400">Goals: </span><span className="font-medium">{data.goals.length} selected</span></p>
          <p className="text-sm"><span className="text-warm-400">AI style: </span><span className="font-medium capitalize">{data.communicationStyle}</span></p>
        </div>
        <button className="btn-bloom px-8 text-base" onClick={handleEnterBloom}>
          Enter Bloom →
        </button>
      </div>
    );
  }

  const stepProps = { data, onUpdate: update, onNext: handleNext, onBack: handleBack };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-xl">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-bloom-400 to-rose-400 flex items-center justify-center shadow-bloom">
            <Flower2 size={22} className="text-white" />
          </div>
          <div>
            <p className="text-xs text-warm-400 font-medium uppercase tracking-wide">Step {step} of {TOTAL_STEPS}</p>
            <h2 className="font-bold text-lg font-[var(--font-display)]">{STEP_TITLES[step - 1]}</h2>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-warm-100 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-bloom-400 to-rose-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="animate-[slide-up_0.3s_ease-out]">
          {step === 1 && <Step1Identity {...stepProps} />}
          {step === 2 && <Step2LifeStage {...stepProps} />}
          {step === 3 && <Step3Symptoms {...stepProps} />}
          {step === 4 && <Step4Conditions {...stepProps} />}
          {step === 5 && <Step5Goals {...stepProps} />}
          {step === 6 && (
            <Step6Preferences
              {...stepProps}
              onSubmit={handleSubmit}
              submitting={submitting}
              submitError={submitError}
            />
          )}
        </div>
      </div>
    </div>
  );
}
