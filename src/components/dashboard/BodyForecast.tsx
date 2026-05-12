import { useState } from 'react';
import { useBloomStore } from '../../store/useBloomStore';
import { CloudSun, RefreshCw, AlertTriangle, Info, Zap, Brain, Moon } from 'lucide-react';

const riskColors: Record<string, { dot: string; bg: string; border: string; label: string }> = {
  low: { dot: 'bg-sage-400', bg: 'bg-sage-50', border: 'border-sage-300', label: 'Low' },
  moderate: { dot: 'bg-amber-400', bg: 'bg-amber-50', border: 'border-amber-300', label: 'Moderate' },
  high: { dot: 'bg-rose-400', bg: 'bg-rose-50', border: 'border-rose-300', label: 'High' },
  severe: { dot: 'bg-red-500', bg: 'bg-red-50', border: 'border-red-400', label: 'Severe' },
};

function getSeverityIcon(risk: string) {
  switch (risk) {
    case 'severe': return <AlertTriangle size={14} className="text-red-500" />;
    case 'high': return <AlertTriangle size={14} className="text-rose-500" />;
    case 'moderate': return <Info size={14} className="text-amber-500" />;
    default: return <CloudSun size={14} className="text-sage-500" />;
  }
}

function EnergyBar({ value }: { value: number }) {
  const pct = (value / 10) * 100;
  const color = value >= 7 ? 'bg-sage-400' : value >= 4 ? 'bg-amber-400' : 'bg-rose-400';
  return (
    <div className="flex items-center gap-1.5 mt-1">
      <Zap size={10} className="text-warm-400" />
      <div className="flex-1 h-1.5 rounded-full bg-warm-200 overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-[10px] font-medium text-warm-500">{value}</span>
    </div>
  );
}

export default function BodyForecast() {
  const { bodyForecast, generateBodyForecast } = useBloomStore();
  const [loading, setLoading] = useState(false);

  if (!bodyForecast) {
    return (
      <div className="glass-card p-6 text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-full bg-bloom-50 flex items-center justify-center">
            <CloudSun size={28} className="text-bloom-400" />
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-lg">Your Body Forecast</h3>
          <p className="text-sm text-warm-400 mt-1">Predict the upcoming week based on your tracked patterns.</p>
        </div>
        <button
          className="btn-bloom text-sm flex items-center gap-2 mx-auto"
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
      <div className="glass-card p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-3">
          <CloudSun size={16} className="text-bloom-400" /> Your Body Forecast
        </h3>
        <div className="text-center py-6 text-warm-400">
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

  const warnColors: Record<string, string> = {
    low: 'border-l-sage-400 bg-sage-50/50',
    moderate: 'border-l-amber-400 bg-amber-50/50',
    high: 'border-l-rose-400 bg-rose-50/50',
    severe: 'border-l-red-500 bg-red-50/50',
  };

  const warnIcons: Record<string, string> = {
    low: '🌤',
    moderate: '⛅',
    high: '⚠️',
    severe: '🔴',
  };

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <CloudSun size={18} className="text-bloom-400" /> Your Body Forecast: Next 7 Days
        </h2>
        <button
          type="button"
          className="text-xs text-bloom-500 font-medium flex items-center gap-1 hover:text-bloom-600 transition-colors"
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

      <div className={`p-3 rounded-lg border-l-4 text-sm ${warnColors[maxRisk]}`}>
        <div className="flex items-start gap-2">
          <span className="text-base mt-0.5">{warnIcons[maxRisk]}</span>
          <div>
            <p className="font-medium text-warm-700">{bodyForecast.overallWarning}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {bodyForecast.days.map(day => {
          const colors = riskColors[day.riskLevel] || riskColors.low;
          const topSymptoms = day.predictedSymptoms.slice(0, 3);
          return (
            <div
              key={day.date}
              className={`rounded-xl border ${colors.border} ${colors.bg} p-3 flex flex-col gap-1.5`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-warm-700">{day.dayName}</span>
                <span className="flex items-center gap-1">
                  {getSeverityIcon(day.riskLevel)}
                  <span className="text-[10px] font-medium text-warm-500">{colors.label}</span>
                </span>
              </div>

              <div className="flex-1 space-y-1">
                {topSymptoms.map(sx => (
                  <div key={sx.name} className="flex items-center justify-between">
                    <span className="text-[10px] text-warm-600 truncate max-w-[80px]">{sx.name}</span>
                    <span className="text-[9px] font-medium text-warm-400">
                      {(sx.probability * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
                {topSymptoms.length === 0 && (
                  <span className="text-[10px] text-warm-400 italic">Clear day</span>
                )}
              </div>

              <EnergyBar value={day.energyPrediction} />

              <span className="text-[9px] text-warm-400 italic leading-tight mt-0.5">
                {day.recommendation}
              </span>
            </div>
          );
        })}
      </div>

      {bodyForecast.keyRecommendations.length > 0 && (
        <div className="rounded-lg bg-warm-50 p-3">
          <h4 className="text-xs font-semibold text-warm-600 mb-2 flex items-center gap-1.5">
            <Brain size={12} /> Key Recommendations
          </h4>
          <ul className="space-y-1">
            {bodyForecast.keyRecommendations.map((rec, i) => (
              <li key={i} className="text-xs text-warm-600 flex items-start gap-2">
                <span className="text-bloom-400 mt-0.5 shrink-0">•</span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-1.5 text-[10px] text-warm-400">
        <Moon size={10} />
        <span>{bodyForecast.disclaimer}</span>
      </div>
    </div>
  );
}
