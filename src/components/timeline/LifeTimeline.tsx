import { useState, useRef, useEffect } from 'react';
import { Sparkles, Heart, ShieldCheck, X } from 'lucide-react';
import { lifeStages } from '../../data/lifeStages';
import { useBloomStore } from '../../store/useBloomStore';
import type { LifeStageInfo } from '../../types';

const stageLabel = (stage: string) =>
  stage
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const spiralPath = 'M 100 500 C 220 520, 320 460, 300 370 C 280 280, 160 240, 200 150 C 240 60, 400 80, 460 180 C 520 280, 460 430, 320 450 C 180 470, 160 330, 260 280 C 360 230, 500 280, 540 200 C 580 120, 500 70, 420 90 C 340 110, 360 200, 460 240 C 560 280, 640 200, 660 130';

const markerPositions = [
  { x: 100, y: 490 },
  { x: 300, y: 370 },
  { x: 200, y: 150 },
  { x: 460, y: 180 },
  { x: 320, y: 450 },
  { x: 260, y: 280 },
  { x: 660, y: 130 },
];

function StageDetails({ stage, currentIndex }: { stage: LifeStageInfo; currentIndex: number }) {
  const selectedIndex = lifeStages.findIndex(item => item.stage === stage.stage);
  const isFuture = selectedIndex > currentIndex;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--bloom-muted)' }}>Life stage</p>
        <h2 className="text-2xl font-bold font-[var(--font-display)] mt-1" style={{ color: stage.uiTheme.primary }}>
          {stageLabel(stage.stage)}
        </h2>
        <p className="text-sm mt-0.5" style={{ color: 'var(--bloom-muted)' }}>{stage.ageRange}</p>
      </div>

      <p className="leading-relaxed" style={{ color: 'var(--bloom-foreground)' }}>{stage.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="rounded-2xl p-5" style={{ background: 'var(--bloom-surface)', border: '1px solid var(--bloom-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles size={40} style={{ color: stage.uiTheme.primary }} />
            <h3 className="font-[var(--font-display)] text-[17px] font-semibold" style={{ color: 'var(--bloom-foreground)' }}>Body Changes</h3>
          </div>
          <ul className="space-y-3">
            {stage.commonExperiences.map(item => (
              <li key={item} className="text-sm leading-relaxed pl-5 relative" style={{ color: 'var(--bloom-muted)' }}>
                <span className="absolute left-0 top-[5px] w-3 h-3" style={{ background: stage.uiTheme.primary, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'var(--bloom-surface)', border: '1px solid var(--bloom-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <Heart size={40} style={{ color: stage.uiTheme.secondary }} />
            <h3 className="font-[var(--font-display)] text-[17px] font-semibold" style={{ color: 'var(--bloom-foreground)' }}>Desire & Connection</h3>
          </div>
          <ul className="space-y-3">
            {stage.bodySignals.map(item => (
              <li key={item} className="text-sm leading-relaxed pl-5 relative" style={{ color: 'var(--bloom-muted)' }}>
                <span className="absolute left-0 top-[5px] w-3 h-3" style={{ background: stage.uiTheme.secondary, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl p-5" style={{ background: 'var(--bloom-surface)', border: '1px solid var(--bloom-border)' }}>
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={40} style={{ color: stage.uiTheme.accent }} />
            <h3 className="font-[var(--font-display)] text-[17px] font-semibold" style={{ color: 'var(--bloom-foreground)' }}>Care Notes</h3>
          </div>
          <ul className="space-y-3">
            {stage.intimacyAndRelationships.map(item => (
              <li key={item} className="text-sm leading-relaxed pl-5 relative" style={{ color: 'var(--bloom-muted)' }}>
                <span className="absolute left-0 top-[5px] w-3 h-3" style={{ background: stage.uiTheme.accent, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3" style={{ color: 'var(--bloom-foreground)' }}>Symptoms to watch in this stage</h3>
        <div className="flex flex-wrap gap-2">
          {stage.prioritySymptoms.map(symptom => (
            <span
              key={symptom}
              className="px-3 py-1.5 text-sm rounded-full"
              style={{
                border: '1px solid transparent',
                background: 'linear-gradient(var(--bloom-surface), var(--bloom-surface)) padding-box, linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose)) border-box',
                color: 'var(--bloom-foreground)',
              }}
            >
              {symptom}
            </span>
          ))}
        </div>
      </div>

      {isFuture && (
        <p className="rounded-2xl p-4 text-sm italic" style={{ background: 'var(--bloom-surface)', border: '1px solid var(--bloom-border)', color: 'var(--bloom-muted)' }}>
          You are not here yet, but knowing what may come next can make future changes less confusing.
        </p>
      )}
    </div>
  );
}

export default function LifeTimeline() {
  const { currentUser } = useBloomStore();
  const currentIndex = Math.max(
    0,
    lifeStages.findIndex(stage => stage.stage === currentUser?.lifeStage)
  );
  const currentStage = lifeStages[currentIndex] ?? lifeStages[1];
  const [selectedStage, setSelectedStage] = useState<LifeStageInfo>(currentStage);
  const [modalStage, setModalStage] = useState<LifeStageInfo | null>(null);
  const [animatingIndex, setAnimatingIndex] = useState<number | null>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [pathLength, setPathLength] = useState(0);

  useEffect(() => {
    if (pathRef.current) {
      setPathLength(pathRef.current.getTotalLength());
    }
  }, []);

  const openStage = (stage: LifeStageInfo) => {
    const idx = lifeStages.findIndex(s => s.stage === stage.stage);
    setSelectedStage(stage);
    setAnimatingIndex(idx);
    setTimeout(() => setAnimatingIndex(null), 1500);
    setModalStage(stage);
  };

  return (
    <div className="space-y-8">
      <section
        className="relative overflow-hidden rounded-3xl p-8 md:p-10"
        style={{ background: 'var(--bloom-surface)', border: '1px solid var(--bloom-border)' }}
      >
        <div className="max-w-3xl mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--bloom-muted)' }}>My Journey</p>
          <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] mt-2" style={{ color: 'var(--bloom-foreground)' }}>
            Your body is not one fixed story.
          </h1>
          <p className="mt-3 leading-relaxed" style={{ color: 'var(--bloom-muted)' }}>
            Explore each stage of female health, including symptoms, body signals, desire, partnership, boundaries, and the care conversations that help you navigate change.
          </p>
        </div>

        <div className="relative w-full overflow-x-auto">
          <svg className="w-full" viewBox="0 0 760 560" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ minHeight: '420px' }}>
            <defs>
              <linearGradient id="spiralGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="var(--bloom-muted)" />
                <stop offset="50%" stopColor="var(--bloom-glow)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
              {lifeStages.map((stage, i) => (
                <radialGradient key={stage.stage} id={`glow-${i}`} cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor={stage.uiTheme.primary} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={stage.uiTheme.primary} stopOpacity="0" />
                </radialGradient>
              ))}
            </defs>

            <path
              ref={pathRef}
              d={spiralPath}
              fill="none"
              stroke="url(#spiralGradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray={pathLength}
              strokeDashoffset={
                animatingIndex !== null
                  ? pathLength * (1 - (animatingIndex + 1) / lifeStages.length)
                  : 0
              }
              style={{ transition: 'stroke-dashoffset 1.2s ease-in-out' }}
            />

            {lifeStages.map((stage, index) => {
              const marker = markerPositions[index];
              const isActive = index === currentIndex;
              const isPast = index < currentIndex;
              const isSelected = selectedStage.stage === stage.stage;

              const borderColor = isActive
                ? 'var(--bloom-rose)'
                : isPast
                  ? stage.uiTheme.primary
                  : 'var(--bloom-muted)';

              const nodeSize = isActive ? 64 : 52;

              return (
                <g key={stage.stage} className="cursor-pointer" onClick={() => openStage(stage)}>
                  {isActive && (
                    <circle
                      cx={marker.x}
                      cy={marker.y}
                      r={48}
                      fill={`url(#glow-${index})`}
                      className="animate-pulse"
                    />
                  )}

                  {isActive && (
                    <circle
                      cx={marker.x}
                      cy={marker.y}
                      r={36}
                      fill="none"
                      stroke="var(--bloom-rose)"
                      strokeWidth="2"
                      opacity="0.5"
                      className="animate-ping"
                    />
                  )}

                  <circle
                    cx={marker.x}
                    cy={marker.y}
                    r={nodeSize / 2}
                    fill="var(--bloom-surface)"
                    stroke={borderColor}
                    strokeWidth="2"
                    style={{
                      transition: 'all 0.3s ease',
                      filter: isSelected ? `drop-shadow(0 0 12px ${stage.uiTheme.primary}66)` : undefined,
                    }}
                  />

                  <text
                    x={marker.x}
                    y={marker.y}
                    textAnchor="middle"
                    dominantBaseline="central"
                    className="text-sm font-bold select-none"
                    fill={isActive ? 'var(--bloom-rose)' : isPast ? stage.uiTheme.primary : 'var(--bloom-muted)'}
                  >
                    {index + 1}
                  </text>

                  {isActive && (
                    <text
                      x={marker.x}
                      y={marker.y - 42}
                      textAnchor="middle"
                      className="text-[13px] font-semibold select-none"
                      fill="var(--bloom-rose)"
                    >
                      You are here
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </section>

      <section className="rounded-3xl p-6 md:p-8" style={{ background: 'var(--bloom-surface)', border: '1px solid var(--bloom-border)' }}>
        <StageDetails stage={selectedStage} currentIndex={currentIndex} />
      </section>

      {modalStage && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end" onClick={() => setModalStage(null)}>
          <div
            className="w-full max-h-[88vh] overflow-y-auto rounded-t-3xl p-6 md:p-8 animate-[slide-up_0.4s_ease-out]"
            style={{ background: 'var(--bloom-background)', borderTop: '1px solid var(--bloom-border)' }}
            onClick={event => event.stopPropagation()}
          >
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  aria-label="Close life stage details"
                  className="p-2 rounded-xl"
                  style={{ color: 'var(--bloom-muted)' }}
                  onClick={() => setModalStage(null)}
                >
                  <X size={20} />
                </button>
              </div>
              <StageDetails stage={modalStage} currentIndex={currentIndex} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
