import { useEffect, useRef, useState } from 'react';
import { Heart, ShieldCheck, Sparkles } from 'lucide-react';
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

function StageDetails({
  stage,
  currentIndex,
}: {
  stage: LifeStageInfo;
  currentIndex: number;
}) {
  const selectedIndex = lifeStages.findIndex(item => item.stage === stage.stage);
  const isFuture = selectedIndex > currentIndex;
  const bodyChanges = stage.commonExperiences.slice(0, 3);
  const bodySignals = stage.bodySignals.slice(0, 2);
  const careNotes = stage.intimacyAndRelationships.slice(0, 2);

  const detailGroups = [
    { title: 'Body Changes', icon: Sparkles, color: stage.uiTheme.primary, items: bodyChanges },
    { title: 'Desire & Connection', icon: Heart, color: stage.uiTheme.secondary, items: bodySignals },
    { title: 'Care Notes', icon: ShieldCheck, color: stage.uiTheme.accent, items: careNotes },
  ];

  return (
    <aside
      className="rounded-3xl p-5 md:p-6"
      style={{
        background: 'var(--bloom-surface)',
        border: '1px solid var(--bloom-border)',
        boxShadow: `0 0 24px ${stage.uiTheme.primary}1f`,
      }}
    >
      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--bloom-muted)' }}>
          Selected stage
        </p>
        <h2 className="mt-1 text-2xl font-bold font-[var(--font-display)]" style={{ color: stage.uiTheme.primary }}>
          {stageLabel(stage.stage)}
        </h2>
        <p className="mt-0.5 text-sm" style={{ color: 'var(--bloom-muted)' }}>{stage.ageRange}</p>
      </div>

      <p className="text-sm leading-relaxed" style={{ color: 'var(--bloom-foreground)' }}>
        {stage.description}
      </p>

      <div className="mt-5 space-y-3">
        {detailGroups.map(group => {
          const Icon = group.icon;
          return (
            <section
              key={group.title}
              className="rounded-2xl p-4"
              style={{ background: 'var(--bloom-background)', border: '1px solid var(--bloom-border)' }}
            >
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold" style={{ color: 'var(--bloom-foreground)' }}>
                <Icon size={16} style={{ color: group.color }} />
                {group.title}
              </h3>
              <ul className="space-y-1.5">
                {group.items.map(item => (
                  <li key={item} className="relative pl-4 text-xs leading-relaxed" style={{ color: 'var(--bloom-muted)' }}>
                    <span
                      className="absolute left-0 top-[6px] h-2 w-2"
                      style={{ background: group.color, clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      <div className="mt-5">
        <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--bloom-foreground)' }}>
          Symptoms to watch
        </h3>
        <div className="flex flex-wrap gap-2">
          {stage.prioritySymptoms.map(symptom => (
            <span
              key={symptom}
              className="rounded-full px-2.5 py-1 text-[11px]"
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
        <p
          className="mt-4 rounded-2xl p-3 text-xs italic"
          style={{ background: 'var(--bloom-background)', border: '1px solid var(--bloom-border)', color: 'var(--bloom-muted)' }}
        >
          You are not here yet, but knowing what may come next can make future changes less confusing.
        </p>
      )}
    </aside>
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
    window.setTimeout(() => setAnimatingIndex(null), 1200);
  };

  return (
    <div className="space-y-8">
      <section
        className="relative overflow-hidden rounded-3xl p-6 md:p-8"
        style={{ background: 'var(--bloom-surface)', border: '1px solid var(--bloom-border)' }}
      >
        <div className="mb-5 max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--bloom-muted)' }}>My Journey</p>
          <h1 className="mt-2 text-3xl font-bold font-[var(--font-display)] md:text-4xl" style={{ color: 'var(--bloom-foreground)' }}>
            Your body is not one fixed story.
          </h1>
          <p className="mt-3 leading-relaxed" style={{ color: 'var(--bloom-muted)' }}>
            Explore each stage of female health, including symptoms, body signals, desire, partnership, boundaries, and the care conversations that help you navigate change.
          </p>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.85fr)]">
          <div
            className="relative rounded-3xl p-4"
            style={{ background: 'var(--bloom-background)', border: '1px solid var(--bloom-border)' }}
          >
            <div
              className="absolute left-5 top-5 z-10 rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wide"
              style={{ background: 'var(--bloom-surface)', color: 'var(--bloom-muted)', border: '1px solid var(--bloom-border)' }}
            >
              Roadmap
            </div>

            <svg className="h-[420px] w-full" viewBox="0 0 760 560" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
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
                  : isPast || isSelected
                    ? stage.uiTheme.primary
                    : 'var(--bloom-muted)';
                const nodeSize = isActive || isSelected ? 64 : 52;

                return (
                  <g key={stage.stage} className="cursor-pointer" onClick={() => openStage(stage)}>
                    {(isActive || isSelected) && (
                      <circle
                        cx={marker.x}
                        cy={marker.y}
                        r={48}
                        fill={`url(#glow-${index})`}
                        className={isActive ? 'animate-pulse' : undefined}
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
                      className="select-none text-sm font-bold"
                      fill={isActive ? 'var(--bloom-rose)' : isPast || isSelected ? stage.uiTheme.primary : 'var(--bloom-muted)'}
                    >
                      {index + 1}
                    </text>

                    {isActive && (
                      <text
                        x={marker.x}
                        y={marker.y - 48}
                        textAnchor="middle"
                        className="select-none text-[13px] font-semibold"
                        fill="var(--bloom-rose)"
                      >
                        You are here
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            <div className="grid grid-cols-2 gap-2 px-1 pb-1 md:grid-cols-4">
              {lifeStages.map((stage, index) => {
                const isActive = index === currentIndex;
                const isSelected = selectedStage.stage === stage.stage;

                return (
                  <button
                    key={stage.stage}
                    type="button"
                    onClick={() => openStage(stage)}
                    className="flex min-h-[52px] items-center gap-2 rounded-2xl px-3 py-2 text-left transition-transform hover:-translate-y-0.5"
                    style={{
                      background: isSelected ? `${stage.uiTheme.primary}20` : 'var(--bloom-surface)',
                      border: `1px solid ${isSelected ? stage.uiTheme.primary : 'var(--bloom-border)'}`,
                    }}
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{
                        background: isSelected ? stage.uiTheme.primary : 'var(--bloom-background)',
                        color: isSelected ? '#ffffff' : 'var(--bloom-muted)',
                        border: `1px solid ${isSelected ? stage.uiTheme.primary : 'var(--bloom-border)'}`,
                      }}
                    >
                      {index + 1}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-semibold" style={{ color: isSelected ? stage.uiTheme.primary : 'var(--bloom-foreground)' }}>
                        {stageLabel(stage.stage)}
                      </span>
                      {isActive && (
                        <span className="block text-[10px] font-semibold" style={{ color: 'var(--bloom-rose)' }}>
                          You are here
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <StageDetails stage={selectedStage} currentIndex={currentIndex} />
        </div>
      </section>
    </div>
  );
}
