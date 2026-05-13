import { useState } from 'react';
import { useBloomStore } from '../../store/useBloomStore';
import type { LifeStage } from '../../types';

type GuideStep = {
  title: string;
  body: string;
  icon: string;
};

const stageGuideContent: Record<LifeStage, GuideStep[]> = {
  puberty: [
    {
      title: 'Welcome to your first chapter',
      body: "Your body is beginning an incredible journey. Everything you're feeling — the changes, the uncertainty — is part of growing into yourself.",
      icon: '🌱',
    },
    {
      title: 'Patterns take time',
      body: 'Cycles can be irregular at first, and that does not mean anything is wrong. Bloom will help you notice what is normal for you.',
      icon: '🌀',
    },
    {
      title: 'Your voice matters',
      body: 'Pain, mood shifts, and worries deserve attention. You are allowed to ask questions and be taken seriously.',
      icon: '💬',
    },
  ],
  reproductive: [
    {
      title: 'This is your rhythm chapter',
      body: 'Your body may have patterns that repeat, shift, or surprise you. Learning those rhythms can make your health feel less mysterious.',
      icon: '🌸',
    },
    {
      title: 'Small details can tell a story',
      body: 'Pain, energy, mood, sleep, and cycle changes can connect in meaningful ways. Bloom helps you gather those clues gently.',
      icon: '🔎',
    },
    {
      title: 'Support your future self',
      body: 'Tracking now can make conversations with doctors clearer later. Your notes become a record of what your body has been trying to say.',
      icon: '📝',
    },
  ],
  pregnancy: [
    {
      title: 'A deeply changing chapter',
      body: 'Your body is doing extraordinary work, and new sensations can arrive quickly. Bloom can help you notice changes and bring them into care conversations.',
      icon: '🤰',
    },
    {
      title: 'Your wellbeing belongs here too',
      body: 'Pregnancy is not only about symptoms and milestones. Your sleep, mood, energy, and comfort all deserve care.',
      icon: '💗',
    },
    {
      title: 'Track what feels important',
      body: 'Patterns can help you know what to mention at appointments. When something feels off, your observations matter.',
      icon: '📍',
    },
  ],
  postpartum: [
    {
      title: 'You are healing into a new rhythm',
      body: 'Postpartum can be tender, intense, and full of change. Your recovery deserves the same attention as everyone else\'s needs.',
      icon: '🕊️',
    },
    {
      title: 'Hormones are recalibrating',
      body: 'Mood, sleep, bleeding, feeding, pain, and energy may shift from week to week. Tracking can make the blur easier to understand.',
      icon: '🌊',
    },
    {
      title: 'You do not have to minimize it',
      body: 'If something feels heavy, painful, or frightening, it is worth naming. Bloom is here to help you put words around what is happening.',
      icon: '🤍',
    },
  ],
  perimenopause: [
    {
      title: 'A new chapter is beginning',
      body: "Your hormones are shifting into a transition phase. This can feel unfamiliar, but it's a natural part of your story.",
      icon: '🌙',
    },
    {
      title: 'Change may come in waves',
      body: 'Cycles, sleep, temperature, mood, and focus can vary more than they used to. Tracking helps you see the shape of those waves.',
      icon: '〰️',
    },
    {
      title: 'Clarity is care',
      body: 'You deserve language for what you are experiencing. Bloom can help turn scattered symptoms into a clearer picture.',
      icon: '✨',
    },
  ],
  menopause: [
    {
      title: 'You are entering a new steadiness',
      body: 'Menopause marks a real transition, not an ending. Your body is finding a new baseline with different needs and signals.',
      icon: '🌕',
    },
    {
      title: 'Your health priorities can shift',
      body: 'Sleep, hot flashes, vaginal health, heart health, and bone strength may become more central. Bloom helps keep those threads visible.',
      icon: '🧭',
    },
    {
      title: 'This chapter deserves attention',
      body: 'You do not have to push through symptoms quietly. Clear tracking can support better questions and better care.',
      icon: '💜',
    },
  ],
  'post-menopause': [
    {
      title: 'A spacious chapter is unfolding',
      body: 'Life after menopause can bring steadier rhythms and new priorities. Your body still has important stories to tell.',
      icon: '⭐',
    },
    {
      title: 'Long-term care matters',
      body: 'Bone, heart, urinary, joint, cognitive, and energy changes are worth noticing over time. Small patterns can guide stronger prevention.',
      icon: '🪷',
    },
    {
      title: 'Your wisdom belongs in the record',
      body: 'You know your body through years of experience. Bloom helps preserve that knowledge and make it easier to share when needed.',
      icon: '📖',
    },
  ],
};

export default function StageEntryGuide() {
  const { currentUser, dismissStageGuide } = useBloomStore();
  const [stepIndex, setStepIndex] = useState(0);
  const stage = currentUser?.lifeStage ?? 'reproductive';
  const steps = stageGuideContent[stage];
  const step = steps[stepIndex];
  const isFinalStep = stepIndex === steps.length - 1;

  const handleNext = () => {
    if (isFinalStep) {
      dismissStageGuide();
      return;
    }
    setStepIndex(index => index + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(10,6,18,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-md p-6 text-center animate-[slide-up_0.4s_ease-out]"
        style={{ background: 'var(--bloom-void)', border: '1px solid var(--bloom-border)', borderRadius: 24 }}
      >
        <div className="flex justify-center gap-2 mb-6">
          {steps.map((item, index) => (
            <span
              key={item.title}
              className="w-2.5 h-2.5 rounded-full"
              style={{
                background: index === stepIndex ? 'var(--bloom-glow)' : 'var(--bloom-border)',
              }}
            />
          ))}
        </div>

        <div className="text-6xl mb-5">{step.icon}</div>
        <h2
          className="font-[var(--font-display)] text-2xl font-bold mb-3"
          style={{ color: 'var(--bloom-glow)' }}
        >
          {step.title}
        </h2>
        <p className="leading-relaxed" style={{ color: 'var(--bloom-muted)' }}>{step.body}</p>

        <div className="flex items-center justify-between mt-8">
          <button
            type="button"
            className="text-sm"
            style={{ color: 'var(--bloom-muted)' }}
            onClick={dismissStageGuide}
          >
            Skip
          </button>
          <button
            type="button"
            className="px-5 py-2.5 font-medium"
            style={{ background: 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', color: 'white', borderRadius: 14 }}
            onClick={handleNext}
          >
            {isFinalStep ? 'Enter your chapter →' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  );
}
