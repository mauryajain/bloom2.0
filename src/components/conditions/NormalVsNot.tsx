import { useState } from 'react';
import { normalVsNotData } from '../../data/normalVsNot';
import { lifeStages } from '../../data/lifeStages';
import { useBloomStore } from '../../store/useBloomStore';
import type { LifeStage } from '../../types';

const stageLabel = (stage: string) =>
  stage
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export default function NormalVsNot() {
  const { currentUser } = useBloomStore();
  const currentStage = currentUser?.lifeStage ?? 'reproductive';
  const [selectedStage, setSelectedStage] = useState<LifeStage>(currentStage);
  const selectedInfo = lifeStages.find(stage => stage.stage === selectedStage);
  const guide = normalVsNotData[selectedStage] ?? normalVsNotData.reproductive;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold font-[var(--font-display)] gradient-text">What's normal for you?</h1>
          <span className="badge badge-bloom capitalize">{stageLabel(currentStage)}</span>
        </div>
        <p className="text-warm-400 text-sm mt-1">A life-stage-aware guide to what is usually expected and what deserves extra care.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <section className="glass-card p-5 border-l-4 border-l-sage-400">
          <h2 className="font-semibold mb-4">Usually normal ✓</h2>
          <ul className="space-y-3">
            {guide.normal.map(item => (
              <li key={item} className="flex gap-2 text-sm text-warm-500 leading-relaxed">
                <span className="text-sage-500 font-semibold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="glass-card p-5 border-l-4 border-l-amber-400">
          <h2 className="font-semibold mb-4">Worth mentioning to a doctor ⚑</h2>
          <ul className="space-y-3">
            {guide.seeDoctor.map(item => (
              <li key={item} className="flex gap-2 text-sm text-warm-500 leading-relaxed">
                <span className="text-amber-500 font-semibold">⚑</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="glass-card p-5 max-w-md">
        <label htmlFor="normal-stage-select" className="text-xs font-semibold text-warm-500 uppercase tracking-wide mb-2 block">
          Explore another life stage →
        </label>
        <select
          id="normal-stage-select"
          className="bloom-input"
          value={selectedStage}
          onChange={event => setSelectedStage(event.target.value as LifeStage)}
        >
          {lifeStages.map(stage => (
            <option key={stage.stage} value={stage.stage}>
              {stageLabel(stage.stage)} ({stage.ageRange})
            </option>
          ))}
        </select>
        {selectedInfo && (
          <p className="text-xs text-warm-400 mt-2">{selectedInfo.description}</p>
        )}
      </div>

      <p className="text-xs text-warm-400 italic">
        This guide is for general awareness only. Your experience is unique — always talk to your healthcare provider about your symptoms.
      </p>
    </div>
  );
}
