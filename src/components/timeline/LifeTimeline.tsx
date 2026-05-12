import { useState } from 'react';
import { Heart, ShieldCheck, Sparkles, X } from 'lucide-react';
import { lifeStages } from '../../data/lifeStages';
import { useBloomStore } from '../../store/useBloomStore';
import type { LifeStageInfo } from '../../types';

const stageLabel = (stage: string) =>
  stage
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const roadPath = 'M -50 95 C 70 55, 150 70, 138 180 C 126 300, 255 330, 305 226 C 356 120, 456 112, 478 222 C 506 360, 642 350, 668 224 C 696 90, 814 64, 836 174 C 862 304, 944 318, 970 205 C 1002 72, 1075 88, 1170 120';

const markerPositions = [
  { x: 126, y: 186, labelX: 32, labelY: 22 },
  { x: 292, y: 292, labelX: 206, labelY: 372 },
  { x: 462, y: 172, labelX: 378, labelY: 24 },
  { x: 612, y: 306, labelX: 526, labelY: 372 },
  { x: 812, y: 148, labelX: 716, labelY: 24 },
  { x: 922, y: 282, labelX: 838, labelY: 372 },
  { x: 1030, y: 136, labelX: 946, labelY: 24 },
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

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-warm-400">Life stage</p>
        <h2 className="text-2xl font-bold font-[var(--font-display)]" style={{ color: stage.uiTheme.primary }}>
          {stageLabel(stage.stage)}
        </h2>
        <p className="text-sm text-warm-400">{stage.ageRange}</p>
      </div>

      <p className="text-warm-600 leading-relaxed">{stage.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <section className="rounded-2xl border border-warm-100 bg-white/70 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Sparkles size={16} style={{ color: stage.uiTheme.primary }} /> Body changes
          </h3>
          <ul className="space-y-2">
            {stage.commonExperiences.map(item => (
              <li key={item} className="text-sm text-warm-500 leading-relaxed">- {item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-warm-100 bg-white/70 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <Heart size={16} style={{ color: stage.uiTheme.primary }} /> Desire and connection
          </h3>
          <ul className="space-y-2">
            {stage.bodySignals.map(item => (
              <li key={item} className="text-sm text-warm-500 leading-relaxed">- {item}</li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-warm-100 bg-white/70 p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <ShieldCheck size={16} style={{ color: stage.uiTheme.primary }} /> Care notes
          </h3>
          <ul className="space-y-2">
            {stage.intimacyAndRelationships.map(item => (
              <li key={item} className="text-sm text-warm-500 leading-relaxed">- {item}</li>
            ))}
          </ul>
        </section>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Symptoms to watch in this stage</h3>
        <div className="flex flex-wrap gap-2">
          {stage.prioritySymptoms.map(symptom => (
            <span key={symptom} className="badge badge-bloom">
              {symptom}
            </span>
          ))}
        </div>
      </div>

      {isFuture && (
        <p className="rounded-2xl bg-warm-50 p-4 text-sm italic text-warm-500">
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

  const openStage = (stage: LifeStageInfo) => {
    setSelectedStage(stage);
    setModalStage(stage);
  };

  return (
    <div className="space-y-6">
      <section
        className="relative overflow-hidden rounded-3xl px-6 py-8 md:px-8 md:py-10 text-white"
        style={{ background: `linear-gradient(135deg, ${currentStage.uiTheme.primary}, ${currentStage.uiTheme.accent})` }}
      >
        <div className="max-w-3xl">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70">My Journey</p>
          <h1 className="text-3xl md:text-4xl font-bold font-[var(--font-display)] mt-2">
            Your body is not one fixed story.
          </h1>
          <p className="text-white/85 mt-3 leading-relaxed">
            Explore each stage of female health, including symptoms, body signals, desire, partnership, boundaries, and the care conversations that help you navigate change.
          </p>
        </div>
      </section>

      <section className="glass-card p-3 md:p-5 overflow-x-auto">
        <div className="min-w-[1120px]">
          <div className="relative h-[560px] rounded-3xl bg-gradient-to-b from-white via-warm-50 to-bloom-50/60 overflow-hidden">
            <svg className="absolute left-0 top-52 h-[280px] w-full -translate-y-1/2" viewBox="0 0 1120 390" preserveAspectRatio="none" aria-hidden="true">
              <path d={roadPath} fill="none" stroke="#d8d3cf" strokeWidth="72" strokeLinecap="round" strokeLinejoin="round" />
              <path d={roadPath} fill="none" stroke="#2f3033" strokeWidth="58" strokeLinecap="round" strokeLinejoin="round" />
              <path d={roadPath} fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeDasharray="14 16" opacity="0.9" />
            </svg>

            {lifeStages.map((stage, index) => {
              const marker = markerPositions[index];
              const isActive = index === currentIndex;
              const isSelected = selectedStage.stage === stage.stage;
              const isPast = index < currentIndex;
              const isFuture = index > currentIndex;

              return (
                <div key={stage.stage}>
                  <button
                    type="button"
                    className={`absolute z-20 w-[154px] rounded-2xl border bg-white/95 px-3 py-3 text-left shadow-sm backdrop-blur transition-all hover:-translate-y-1 hover:shadow-lg ${
                      isActive
                        ? 'border-bloom-300 ring-4 ring-bloom-100 shadow-lg'
                        : isSelected
                          ? 'border-bloom-200 ring-2 ring-bloom-100'
                          : 'border-white'
                    }`}
                    style={{ left: `${marker.labelX}px`, top: `${marker.labelY}px` }}
                    onClick={() => openStage(stage)}
                  >
                    <span className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wide text-warm-400">
                      <span>Part {index + 1}</span>
                      {isActive && (
                        <span className="rounded-full bg-bloom-100 px-2 py-0.5 text-[10px] tracking-normal text-bloom-700">
                          You are here
                        </span>
                      )}
                    </span>
                    <span className="mt-1 block text-[15px] font-semibold leading-tight" style={{ color: stage.uiTheme.primary }}>
                      {stageLabel(stage.stage)}
                    </span>
                    <span className="mt-1 block text-xs leading-snug text-warm-500">{stage.ageRange}</span>
                  </button>
                  <button
                    type="button"
                    className={`group absolute z-30 flex h-[4.8rem] w-[4.8rem] items-start justify-center pt-3 text-white transition-transform hover:scale-110 ${
                      isSelected ? 'scale-110' : ''
                    } ${isActive ? 'animate-[pulse-soft_3s_ease-in-out_infinite]' : ''} ${isPast ? 'opacity-90' : ''} ${isFuture ? 'opacity-95' : ''}`}
                    style={{
                      left: `${marker.x}px`,
                      top: `${marker.y}px`,
                      transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.1)' : ''}`,
                    }}
                    onClick={() => openStage(stage)}
                    aria-label={`Open ${stageLabel(stage.stage)} details`}
                  >
                    <span
                      className="absolute inset-x-2 top-0 h-14 rounded-full shadow-xl"
                      style={{
                        backgroundColor: stage.uiTheme.primary,
                        boxShadow: isActive
                          ? `0 0 0 10px ${stage.uiTheme.primary}2e, 0 0 0 20px ${stage.uiTheme.primary}16, 0 20px 38px ${stage.uiTheme.primary}55`
                          : isSelected
                            ? `0 0 0 8px ${stage.uiTheme.primary}26, 0 18px 32px ${stage.uiTheme.primary}44`
                            : undefined,
                      }}
                    />
                    <span
                      className="absolute bottom-2 left-1/2 h-8 w-8 -translate-x-1/2 rotate-45 rounded-br-[0.9rem]"
                      style={{ backgroundColor: stage.uiTheme.primary }}
                    />
                    <span className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/80 bg-white/15 text-lg font-bold">
                      {index + 1}
                    </span>
                    {isActive && (
                      <span className="absolute -bottom-8 left-1/2 w-28 -translate-x-1/2 rounded-full bg-white px-3 py-1 text-center text-xs font-semibold shadow-md" style={{ color: stage.uiTheme.primary }}>
                        You are here
                      </span>
                    )}
                  </button>
                </div>
              );
            })}

            <div className="absolute bottom-5 left-6 right-6 flex items-center justify-between gap-4 rounded-2xl bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-warm-400">Current stop</p>
                <p className="font-semibold" style={{ color: currentStage.uiTheme.primary }}>
                  {stageLabel(currentStage.stage)}
                </p>
              </div>
              <p className="max-w-xl text-right text-sm leading-relaxed text-warm-500">
                Select any pin to explore symptoms, body signals, desire, relationships, and care notes for that stage.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="glass-card p-5 md:p-6">
        <StageDetails stage={selectedStage} currentIndex={currentIndex} />
      </section>

      {modalStage && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end" onClick={() => setModalStage(null)}>
          <div
            className="w-full max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white p-6 md:p-8 animate-[slide-up_0.4s_ease-out]"
            onClick={event => event.stopPropagation()}
          >
            <div className="max-w-5xl mx-auto">
              <div className="flex justify-end mb-4">
                <button
                  type="button"
                  aria-label="Close life stage details"
                  className="p-2 rounded-xl text-warm-400 hover:text-bloom-500"
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
