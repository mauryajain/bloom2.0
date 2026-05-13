import { useState } from 'react';
import { useBloomStore } from '../../store/useBloomStore';
import { CloudSun, RefreshCw, AlertTriangle, Info, Zap, Moon } from 'lucide-react';

const riskColorMap: Record<string, string> = {
  low: 'var(--bloom-teal)',
  moderate: 'var(--bloom-amber)',
  high: 'var(--bloom-rose)',
  severe: '#ef4444',
};

const riskDotClass: Record<string, string> = {
  low: 'from-bloom-teal to-emerald-400',
  moderate: 'from-bloom-amber to-amber-400',
  high: 'from-bloom-rose to-rose-400',
  severe: 'from-red-500 to-red-400',
};

function getSeverityIcon(risk: string) {
  switch (risk) {
    case 'severe': return <AlertTriangle size={14} className="text-red-500" />;
    case 'high': return <AlertTriangle size={14} style={{ color: 'var(--bloom-rose)' }} />;
    case 'moderate': return <Info size={14} style={{ color: 'var(--bloom-amber)' }} />;
    default: return <CloudSun size={14} style={{ color: 'var(--bloom-teal)' }} />;
  }
}

function getRiskLabel(risk: string) {
  switch (risk) {
    case 'severe': return 'Severe';
    case 'high': return 'High';
    case 'moderate': return 'Moderate';
    default: return 'Low';
  }
}

export default function BodyForecast() {
  const { bodyForecast, generateBodyForecast } = useBloomStore();
  const [loading, setLoading] = useState(false);
  const [hoveredDay, setHoveredDay] = useState<string | null>(null);

  if (!bodyForecast) {
    return (
      <div
        className="p-6 text-center space-y-4"
        style={{ background: 'var(--bloom-surface)', border: '1px solid var(--bloom-border)', borderRadius: 20 }}
      >
        <div className="flex justify-center">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: 'var(--bloom-lift)' }}
          >
            <CloudSun size={28} style={{ color: 'var(--bloom-glow)' }} />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg" style={{ color: 'var(--bloom-text)' }}>Your Body Forecast</h3>
          <p className="text-sm mt-1" style={{ color: 'var(--bloom-muted)' }}>Predict the upcoming week based on your tracked patterns.</p>
        </div>
        <button
          className="text-sm flex items-center gap-2 mx-auto px-5 py-2.5 font-medium"
          style={{ background: 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', color: 'white', borderRadius: 14 }}
          onClick={async () => {
            setLoading(true);
            await generateBodyForecast();
            setLoading(false);
          }}
          disabled={loading}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Analyzing your data...' : 'Generate Your Body Forecast'}
        </button>
      </div>
    );
  }

  if (bodyForecast.days.length === 0) {
    return (
      <div className="p-6" style={{ background: 'var(--bloom-surface)', border: '1px solid var(--bloom-border)', borderRadius: 20 }}>
        <h3 className="font-semibold flex items-center gap-2 mb-3" style={{ color: 'var(--bloom-text)' }}>
          <CloudSun size={16} style={{ color: 'var(--bloom-glow)' }} /> Your Body Forecast
        </h3>
        <div className="text-center py-6" style={{ color: 'var(--bloom-muted)' }}>
          <p className="text-sm">{bodyForecast.overallWarning}</p>
          <p className="text-xs mt-2">{bodyForecast.disclaimer}</p>
        </div>
      </div>
    );
  }

  const maxRisk = bodyForecast.days.reduce((max, d) => {
    const order = ['low', 'moderate', 'high', 'severe'];
    return order.indexOf(d.riskLevel) > order.indexOf(max) ? d.riskLevel : max;
  }, 'low');

  return (
    <div className="p-5 space-y-4" style={{ background: 'var(--bloom-surface)', border: '1px solid var(--bloom-border)', borderRadius: 20 }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2" style={{ color: 'var(--bloom-text)' }}>
          <CloudSun size={18} style={{ color: 'var(--bloom-glow)' }} /> Your Body Forecast: Next 7 Days
        </h2>
        <button
          type="button"
          className="text-xs font-medium flex items-center gap-1 transition-colors"
          style={{ color: 'var(--bloom-glow)' }}
          onClick={async () => {
            setLoading(true);
            await generateBodyForecast();
            setLoading(false);
          }}
          disabled={loading}
        >
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Updating...' : 'Refresh'}
        </button>
      </div>

      {/* Overall warning banner */}
      <div
        className="p-3 rounded-lg text-sm flex items-start gap-2"
        style={{
          background: `color-mix(in srgb, ${riskColorMap[maxRisk]} 15%, transparent)`,
          borderLeft: `3px solid ${riskColorMap[maxRisk]}`,
        }}
      >
        <span className="text-base mt-0.5 shrink-0">
          {maxRisk === 'severe' || maxRisk === 'high' ? '⚠️' : maxRisk === 'moderate' ? '⛅' : '🌤'}
        </span>
        <div>
          <p className="font-medium" style={{ color: 'var(--bloom-text)' }}>{bodyForecast.overallWarning}</p>
        </div>
      </div>

      {/* 7-Day Plant Stem Forecast */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {bodyForecast.days.map(day => {
          const isHighest = day.riskLevel === maxRisk;
          const riskColor = riskColorMap[day.riskLevel] || riskColorMap.low;
          const topSymptoms = day.predictedSymptoms.slice(0, 4);
          const isEmpty = topSymptoms.length === 0;

          return (
            <div
              key={day.date}
              onMouseEnter={() => setHoveredDay(day.date)}
              onMouseLeave={() => setHoveredDay(null)}
              className="flex flex-col items-center py-3 px-1.5 cursor-pointer transition-all duration-300"
              style={{
                background: 'var(--bloom-surface)',
                border: '1px solid var(--bloom-border)',
                borderRadius: 16,
                minHeight: hoveredDay === day.date ? '220px' : '130px',
                transition: 'min-height 0.3s ease, box-shadow 0.3s ease',
                ...(isHighest && {
                  boxShadow: '0 0 24px rgba(244,63,94,0.25)',
                }),
              }}
            >
              {/* Day name + risk */}
              <div className="flex items-center gap-1 mb-2">
                <span className="text-[11px] font-semibold" style={{ color: 'var(--bloom-text)' }}>
                  {day.dayName}
                </span>
                <span className="text-[9px] font-medium" style={{ color: riskColor }}>
                  {getRiskLabel(day.riskLevel)}
                </span>
              </div>

              {/* Vertical stem with symptom bubbles */}
              <div className="relative flex flex-col items-center flex-1 w-full pt-1">
                {/* Stem line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 rounded-full"
                  style={{ background: 'var(--bloom-border)' }}
                />

                {isEmpty ? (
                  <span className="text-[9px] italic z-10" style={{ color: 'var(--bloom-muted)' }}>
                    Clear day
                  </span>
                ) : (
                  topSymptoms.map((sx) => (
                    <div
                      key={sx.name}
                      className="flex items-center gap-1.5 py-1 z-10"
                      style={{ minHeight: 16 }}
                    >
                      {/* Bubble on stem */}
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 bg-gradient-to-b"
                        style={{
                          background: riskColor,
                          opacity: Math.max(0.4, sx.probability + 0.2),
                          boxShadow: hoveredDay === day.date ? `0 0 6px ${riskColor}` : 'none',
                        }}
                      />
                      {/* Label on hover */}
                      {hoveredDay === day.date && (
                        <span
                          className="text-[9px] whitespace-nowrap"
                          style={{ color: 'var(--bloom-text)' }}
                        >
                          {sx.name}
                          <span className="ml-0.5" style={{ color: 'var(--bloom-muted)' }}>
                            {(sx.probability * 100).toFixed(0)}%
                          </span>
                        </span>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Energy bar - always visible */}
              <div className="w-full mt-auto pt-2">
                <div className="flex items-center gap-1">
                  <Zap size={10} style={{ color: 'var(--bloom-muted)' }} />
                  <div
                    className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'var(--bloom-lift)' }}
                  >
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(day.energyPrediction / 10) * 100}%`,
                        background:
                          day.energyPrediction >= 7
                            ? 'var(--bloom-teal)'
                            : day.energyPrediction >= 4
                              ? 'var(--bloom-amber)'
                              : 'var(--bloom-rose)',
                      }}
                    />
                  </div>
                  <span className="text-[9px] font-medium" style={{ color: 'var(--bloom-muted)' }}>
                    {day.energyPrediction}
                  </span>
                </div>
              </div>

              {/* Recommendation on hover */}
              {hoveredDay === day.date && (
                <span
                  className="text-[8px] italic leading-tight text-center mt-1.5 px-1"
                  style={{ color: 'var(--bloom-muted)' }}
                >
                  {day.recommendation}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Key Recommendations */}
      {bodyForecast.keyRecommendations.length > 0 && (
        <div className="rounded-lg p-3" style={{ background: 'var(--bloom-lift)' }}>
          <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5" style={{ color: 'var(--bloom-text)' }}>
            Key Recommendations
          </h4>
          <ul className="space-y-1">
            {bodyForecast.keyRecommendations.map((rec, i) => (
              <li
                key={i}
                className="text-xs flex items-start gap-2"
                style={{ color: 'var(--bloom-muted)' }}
              >
                <span style={{ color: 'var(--bloom-glow)', marginTop: 2, flexShrink: 0 }}>•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Disclaimer */}
      <div
        className="flex items-center gap-1.5 text-[10px]"
        style={{ color: 'var(--bloom-muted)' }}
      >
        <Moon size={10} />
        <span>{bodyForecast.disclaimer}</span>
      </div>
    </div>
  );
}
