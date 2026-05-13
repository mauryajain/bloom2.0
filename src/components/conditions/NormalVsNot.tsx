import { useState } from 'react';
import { normalVsNotData } from '../../data/normalVsNot';
import { lifeStages } from '../../data/lifeStages';
import { useBloomStore } from '../../store/useBloomStore';
import { CheckCircle, AlertTriangle, CircleDot, ChevronRight } from 'lucide-react';
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
  const [transitioning, setTransitioning] = useState(false);
  const selectedInfo = lifeStages.find(stage => stage.stage === selectedStage);
  const guide = normalVsNotData[selectedStage] ?? normalVsNotData.reproductive;

  const handleStageChange = (stage: LifeStage) => {
    if (stage === selectedStage) return;
    setTransitioning(true);
    setTimeout(() => {
      setSelectedStage(stage);
      setTransitioning(false);
    }, 300);
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold font-[var(--font-heading)]" style={{ background: 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose), var(--bloom-amber))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            What's normal for you?
          </h1>
          <span
            className="text-xs font-medium capitalize px-3 py-1"
            style={{
              background: 'rgba(124,58,237,0.15)',
              color: 'var(--bloom-glow)',
              borderRadius: 99,
            }}
          >
            {stageLabel(currentStage)}
          </span>
        </div>
        <p className="text-sm mt-1" style={{ color: 'var(--bloom-muted)' }}>
          A life-stage-aware guide to what is usually expected and what deserves extra care.
        </p>
      </div>

      <div
        className="grid grid-cols-1 md:grid-cols-2 gap-0"
        style={{
          position: 'relative',
          borderRadius: 20,
          overflow: 'hidden',
          transition: 'opacity 0.3s, transform 0.3s',
          opacity: transitioning ? 0 : 1,
          transform: transitioning ? 'translateY(10px)' : 'translateY(0)',
        }}
      >
        <div
          className="p-6"
          style={{
            background: 'var(--bloom-surface)',
            borderRadius: 20,
            border: '1px solid var(--bloom-border)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle size={48} style={{ color: 'var(--bloom-teal)' }} />
            <h2 className="text-lg font-semibold font-[var(--font-heading)]">Usually normal</h2>
          </div>
          <ul className="space-y-3">
            {guide.normal.map((item, i) => (
              <li key={item} className="flex gap-2 text-sm leading-relaxed" style={{ color: 'var(--bloom-muted)' }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  className="shrink-0 mt-0.5"
                  style={{ stroke: 'var(--bloom-teal)', strokeWidth: 3, strokeLinecap: 'round', strokeLinejoin: 'round' }}
                >
                  <polyline
                    points="20 6 9 17 4 12"
                    style={{
                      strokeDasharray: 100,
                      strokeDashoffset: 100,
                      animation: `draw-in 0.5s ease ${i * 0.1}s forwards`,
                    }}
                  />
                </svg>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          className="p-6"
          style={{
            background: 'rgba(251,191,36,0.04)',
            borderRadius: 20,
            border: '1px solid var(--bloom-border)',
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle size={48} style={{ color: 'var(--bloom-amber)' }} />
            <h2 className="text-lg font-semibold font-[var(--font-heading)]">Worth mentioning to a doctor</h2>
          </div>
          <ul className="space-y-3">
            {guide.seeDoctor.map(item => (
              <li
                key={item}
                className="flex gap-2 text-sm leading-relaxed items-start p-1 -mx-1 rounded-lg transition-colors"
                style={{ color: 'var(--bloom-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(251,191,36,0.05)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
              >
                <CircleDot size={16} style={{ color: 'var(--bloom-amber)' }} className="shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '10%',
            bottom: '10%',
            width: 1,
            background: 'linear-gradient(to bottom, transparent, var(--bloom-border), transparent)',
          }}
        />
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'var(--bloom-muted)' }}>
          Explore Another Stage →
        </p>
        <div
          className="flex gap-2 overflow-x-auto pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          <style>{`
            .stage-pills::-webkit-scrollbar { display: none; }
          `}</style>
          {lifeStages.map(stage => {
            const isActive = selectedStage === stage.stage;
            return (
              <button
                key={stage.stage}
                onClick={() => handleStageChange(stage.stage as LifeStage)}
                className="whitespace-nowrap stage-pills"
                style={{
                  padding: '8px 20px',
                  borderRadius: 99,
                  fontSize: 13,
                  fontWeight: 500,
                  border: '1px solid var(--bloom-border)',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  background: isActive
                    ? 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))'
                    : 'var(--bloom-surface)',
                  color: isActive ? '#fff' : 'var(--bloom-text)',
                  flexShrink: 0,
                }}
              >
                {stageLabel(stage.stage)}{' '}
                <span style={{ opacity: 0.6, fontSize: 11 }}>({stage.ageRange})</span>
              </button>
            );
          })}
        </div>
        {selectedInfo && (
          <p className="text-xs mt-3" style={{ color: 'var(--bloom-muted)' }}>
            {selectedInfo.description}
          </p>
        )}
      </div>

      <p className="text-xs italic" style={{ color: 'var(--bloom-muted)' }}>
        This guide is for general awareness only. Your experience is unique — always talk to your healthcare provider about your symptoms.
      </p>
    </div>
  );
}
