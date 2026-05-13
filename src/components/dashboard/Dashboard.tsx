import { useMemo, useState } from 'react';
import { useBloomStore } from '../../store/useBloomStore';
import { format, subDays, parseISO } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar,
  CartesianGrid
} from 'recharts';
import {
  Activity, TrendingUp, Calendar, AlertTriangle,
  Heart, Moon, Zap, Flower2, Plus
} from 'lucide-react';
import { getLifeStageInfo } from '../../data/lifeStages';
import BloomLetter from './BloomLetter';
import BodyForecast from './BodyForecast';

function checkApproachingTransition(
  age: number,
  lifeStage: string
): { approaching: boolean; nextStage: string; message: string } | null {
  if (lifeStage === 'puberty' && age >= 16) {
    return {
      approaching: true,
      nextStage: 'reproductive',
      message: "You're moving into your reproductive years — cycles typically become more regular now.",
    };
  }

  if (lifeStage === 'reproductive' && age >= 37) {
    return {
      approaching: true,
      nextStage: 'perimenopause',
      message: 'Perimenopause can begin earlier than most expect — around 35-45 is common.',
    };
  }

  if (lifeStage === 'perimenopause' && age >= 50) {
    return {
      approaching: true,
      nextStage: 'menopause',
      message: 'Menopause is defined as 12 months without a period — many women reach this in their early 50s.',
    };
  }

  return null;
}

function StageTransitionBanner({
  age,
  lifeStage,
  onLearn,
}: {
  age: number;
  lifeStage: string;
  onLearn: () => void;
}) {
  const transition = checkApproachingTransition(age, lifeStage);
  const storageKey = transition ? `bloom_transition_dismissed_${transition.nextStage}` : '';
  const [dismissed, setDismissed] = useState(() => Boolean(storageKey && localStorage.getItem(storageKey)));

  if (!transition || dismissed) return null;

  const dismiss = () => {
    localStorage.setItem(storageKey, 'true');
    setDismissed(true);
  };

  return (
    <div style={{
      background: 'var(--bloom-surface)',
      borderLeft: '4px solid var(--bloom-amber)',
      borderRadius: '0 16px 16px 0',
      padding: 16,
    }}>
      <div className="flex items-start gap-3">
        <span style={{ fontSize: 20, marginTop: 2 }}>🌸</span>
        <div className="flex-1">
          <p style={{ fontSize: 13, color: 'var(--bloom-text)', opacity: 0.8, margin: 0 }}>
            {transition.message}
          </p>
          <button
            onClick={onLearn}
            style={{
              fontSize: 13,
              fontFamily: 'var(--font-body)',
              background: 'none',
              border: 'none',
              color: 'var(--bloom-glow)',
              fontWeight: 500,
              cursor: 'pointer',
              padding: 0,
              marginTop: 8,
            }}
          >
            Learn what's coming &rarr;
          </button>
        </div>
        <button
          type="button"
          aria-label="Dismiss transition insight"
          onClick={dismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--bloom-muted)',
            fontSize: 18,
            lineHeight: 1,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          &times;
        </button>
      </div>
    </div>
  );
}

const GLOW_MAP: Record<string, string> = {
  'var(--bloom-teal)': 'rgba(6,214,160,0.06)',
  'var(--bloom-amber)': 'rgba(251,191,36,0.06)',
  'var(--bloom-rose)': 'rgba(232,121,160,0.06)',
  'var(--bloom-glow)': 'rgba(124,58,237,0.06)',
};

export default function Dashboard() {
  const { currentUser, symptomLogs, patterns, setCurrentView, markPatternRead } = useBloomStore();
  const lifeStageInfo = currentUser ? getLifeStageInfo(currentUser.lifeStage) : null;

  const last30Days = useMemo(() => {
    const cutoff = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    return symptomLogs.filter(l => l.date >= cutoff);
  }, [symptomLogs]);

  const severityOverTime = useMemo(() => {
    return last30Days.map(log => ({
      date: format(parseISO(log.date), 'MMM dd'),
      severity: log.symptoms.length > 0
        ? +(log.symptoms.reduce((a, s) => a + s.severity, 0) / log.symptoms.length).toFixed(1)
        : 0,
      energy: log.energy,
      mood: log.mood?.score || 5,
      symptoms: log.symptoms.length,
    }));
  }, [last30Days]);

  const topSymptoms = useMemo(() => {
    const map = new Map<string, { count: number; totalSev: number }>();
    last30Days.forEach(log => log.symptoms.forEach(s => {
      const e = map.get(s.name) || { count: 0, totalSev: 0 };
      e.count++; e.totalSev += s.severity;
      map.set(s.name, e);
    }));
    return Array.from(map.entries())
      .map(([name, d]) => ({ name, count: d.count, avgSeverity: +(d.totalSev / d.count).toFixed(1) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
  }, [last30Days]);

  const radarData = useMemo(() => {
    const categories = ['pain', 'mood', 'energy', 'digestive', 'sleep', 'cognitive'];
    return categories.map(cat => {
      const relevant = last30Days.flatMap(l => l.symptoms.filter(s => s.category === cat));
      return {
        category: cat.charAt(0).toUpperCase() + cat.slice(1),
        value: relevant.length > 0 ? +(relevant.reduce((a, s) => a + s.severity, 0) / relevant.length).toFixed(1) : 0,
        fullMark: 5
      };
    });
  }, [last30Days]);

  const todayLog = symptomLogs.find(l => l.date === format(new Date(), 'yyyy-MM-dd'));
  const unreadAlerts = patterns.filter(p => !p.isRead);

  const avgSev = severityOverTime.length > 0
    ? (severityOverTime.reduce((a, d) => a + d.severity, 0) / severityOverTime.length).toFixed(1)
    : '0';
  const avgEnergy = severityOverTime.length > 0
    ? (severityOverTime.reduce((a, d) => a + d.energy, 0) / severityOverTime.length).toFixed(1)
    : '0';

  const stats = [
    { label: 'Days Tracked', value: symptomLogs.length, icon: Calendar, accent: 'var(--bloom-teal)' },
    { label: 'Avg Severity', value: avgSev, icon: Activity, accent: 'var(--bloom-amber)' },
    { label: 'Patterns Found', value: patterns.length, icon: TrendingUp, accent: 'var(--bloom-rose)' },
    { label: 'Avg Energy', value: avgEnergy, icon: Zap, accent: 'var(--bloom-glow)' },
  ];

  return (
    <div className="space-y-6">
      {/* ===== HEADER BAR ===== */}
      <div
        className="flex items-center justify-between"
        style={{
          background: 'rgba(26,20,48,0.7)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: 16,
          padding: '16px 20px',
          borderBottom: '1px solid var(--bloom-border)',
        }}
      >
        <div>
          <p style={{ fontSize: 15, color: 'var(--bloom-muted)', margin: 0 }}>Welcome back,</p>
          <p style={{ fontSize: 28, fontFamily: 'var(--font-heading)', fontStyle: 'italic', color: 'var(--bloom-rose)', margin: 0, lineHeight: 1.15 }}>
            {currentUser?.name?.split(' ')[0] || 'there'}
          </p>
          <p style={{ fontSize: 12, color: 'var(--bloom-muted)', marginTop: 6, opacity: 0.55 }}>
            {lifeStageInfo ? `${lifeStageInfo.stage.charAt(0).toUpperCase() + lifeStageInfo.stage.slice(1)} · ` : ''}
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <button
          onClick={() => setCurrentView('journal')}
          className="flex items-center gap-2 border-none cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))',
            borderRadius: 12,
            padding: '10px 20px',
            color: '#fff',
            fontSize: 14,
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
          }}
        >
          <Plus size={16} /> Log Today's Symptoms
        </button>
      </div>

      {/* ===== LIFE STAGE BANNER ===== */}
      {lifeStageInfo && (
        <div
          style={{
            background: 'var(--bloom-surface)',
            borderLeft: '4px solid ' + lifeStageInfo.uiTheme.primary,
            borderRadius: '0 16px 16px 0',
            padding: '12px 16px',
          }}
        >
          <div className="flex items-start gap-3">
            <Flower2 size={18} style={{ color: lifeStageInfo.uiTheme.primary, marginTop: 2, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 13, fontFamily: 'var(--font-heading)', fontWeight: 600, color: lifeStageInfo.uiTheme.accent, margin: 0 }}>
                {lifeStageInfo.stage.charAt(0).toUpperCase() + lifeStageInfo.stage.slice(1).replace('-', ' ')} Insights
              </p>
              <p style={{ fontSize: 12, color: 'var(--bloom-muted)', margin: '4px 0 0 0' }}>{lifeStageInfo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* ===== STAGE TRANSITION ===== */}
      {currentUser && (
        <StageTransitionBanner
          age={currentUser.age}
          lifeStage={currentUser.lifeStage}
          onLearn={() => setCurrentView('timeline')}
        />
      )}

      {/* ===== STATS ROW — Glowing Orb Cards ===== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div
              key={s.label}
              className="flex flex-col items-center justify-center"
              style={{
                minWidth: 130,
                borderRadius: 20,
                background: `
                  radial-gradient(circle at 50% 0%, ${GLOW_MAP[s.accent]} 0%, transparent 70%),
                  var(--bloom-surface)
                `,
                padding: '20px 16px',
              }}
            >
              <Icon size={14} style={{ color: s.accent, marginBottom: 8 }} />
              <p style={{ fontSize: 36, fontFamily: 'var(--font-heading)', color: s.accent, margin: 0, lineHeight: 1 }}>
                {s.value}
              </p>
              <p style={{ fontSize: 11, fontFamily: 'var(--font-body)', color: 'var(--bloom-muted)', textTransform: 'uppercase', margin: '6px 0 0 0', letterSpacing: '0.08em' }}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ===== BODY FORECAST ===== */}
      <BodyForecast />

      {/* ===== PATTERN ALERTS — Bioluminescent Pods ===== */}
      {unreadAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2" style={{ fontSize: 18, fontFamily: 'var(--font-heading)', fontWeight: 600, margin: 0 }}>
            <AlertTriangle size={18} style={{ color: 'var(--bloom-amber)' }} /> Pattern Alerts
          </h2>
          {unreadAlerts.map(alert => (
            <div
              key={alert.id}
              onClick={() => markPatternRead(alert.id)}
              className="cursor-pointer"
              style={{
                background: 'var(--bloom-surface)',
                borderLeft: `4px solid ${alert.severity === 'high' || alert.severity === 'urgent' ? 'var(--bloom-rose)' : alert.severity === 'medium' ? 'var(--bloom-amber)' : 'var(--bloom-teal)'}`,
                borderRadius: '0 16px 16px 0',
                padding: '16px 20px',
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-block"
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--bloom-glow)',
                        animation: 'bloom-pulse 3s ease-in-out infinite',
                      }}
                    />
                    <h3 style={{ fontSize: 16, fontFamily: 'var(--font-heading)', fontWeight: 600, margin: 0 }}>
                      {alert.title}
                    </h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--bloom-muted)', margin: '6px 0 0 0' }}>{alert.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {alert.conditionsFlagged.map(c => (
                      <span
                        key={c}
                        style={{
                          padding: '2px 12px',
                          borderRadius: '50% 2px 50% 2px',
                          fontSize: 11,
                          fontFamily: 'var(--font-body)',
                          background: 'rgba(124,58,237,0.12)',
                          color: 'var(--bloom-text)',
                        }}
                      >
                        {c}
                      </span>
                    ))}
                    <span
                      style={{
                        display: 'inline-flex',
                        padding: 1,
                        borderRadius: 999,
                        background: 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))',
                      }}
                    >
                      <span
                        style={{
                          padding: '2px 10px',
                          borderRadius: 999,
                          fontSize: 10,
                          fontFamily: 'var(--font-body)',
                          background: 'var(--bloom-surface)',
                          color: 'var(--bloom-muted)',
                        }}
                      >
                        {(alert.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </span>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 12, color: 'var(--bloom-teal)', marginTop: 10, fontStyle: 'italic', opacity: 0.8 }}>
                {alert.recommendation}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ===== BLOOM LETTER ===== */}
      <BloomLetter />

      {/* ===== CHARTS ROW ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Severity Over Time */}
        <div style={{ background: 'var(--bloom-surface)', borderRadius: 16, padding: 20 }}>
          <h3 className="flex items-center gap-2" style={{ fontSize: 15, fontFamily: 'var(--font-heading)', fontWeight: 600, margin: '0 0 4px 0' }}>
            <Activity size={15} style={{ color: 'var(--bloom-glow)' }} /> Symptom Trend (30 Days)
          </h3>
          <p style={{ fontSize: 11, color: 'var(--bloom-muted)', margin: '0 0 12px 0', opacity: 0.7 }}>
            Daily average symptom severity compared with energy levels.
          </p>
          <div className="flex flex-wrap gap-3 mb-3" style={{ fontSize: 11 }}>
            <span className="flex items-center gap-1" style={{ color: 'var(--bloom-muted)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', display: 'inline-block', background: 'var(--bloom-glow)' }} /> Severity (0-5)
            </span>
            <span className="flex items-center gap-1" style={{ color: 'var(--bloom-muted)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', display: 'inline-block', background: 'var(--bloom-teal)' }} /> Energy (0-10)
            </span>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={severityOverTime}>
                <defs>
                  <linearGradient id="sevGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--bloom-glow)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--bloom-glow)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="energyGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--bloom-teal)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--bloom-teal)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--bloom-border)" strokeOpacity={0.3} strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--bloom-muted)' }} tickLine={false} axisLine={false} interval={4} />
                <YAxis yAxisId="severity" domain={[0, 5]} tick={{ fontSize: 10, fill: 'var(--bloom-muted)' }} tickLine={false} axisLine={false} />
                <YAxis yAxisId="energy" orientation="right" domain={[0, 10]} tick={{ fontSize: 10, fill: 'var(--bloom-muted)' }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid var(--bloom-border)', background: 'var(--bloom-lift)', color: 'var(--bloom-text)', fontSize: 12 }}
                />
                <Area yAxisId="severity" type="monotone" dataKey="severity" stroke="var(--bloom-glow)" fill="url(#sevGrad2)" strokeWidth={2} name="Avg severity (0-5)" />
                <Area yAxisId="energy" type="monotone" dataKey="energy" stroke="var(--bloom-teal)" fill="url(#energyGrad2)" strokeWidth={2} name="Energy (0-10)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div style={{ background: 'var(--bloom-surface)', borderRadius: 16, padding: 20 }}>
          <h3 className="flex items-center gap-2" style={{ fontSize: 15, fontFamily: 'var(--font-heading)', fontWeight: 600, margin: '0 0 4px 0' }}>
            <TrendingUp size={15} style={{ color: 'var(--bloom-rose)' }} /> Symptom Categories
          </h3>
          <p style={{ fontSize: 11, color: 'var(--bloom-muted)', margin: '0 0 12px 0', opacity: 0.7 }}>
            Average severity across symptom categories on a 0-5 scale.
          </p>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {radarData
              .filter(item => item.value > 0)
              .sort((a, b) => b.value - a.value)
              .slice(0, 4)
              .map(item => (
                <div key={item.category} style={{ background: 'rgba(124,58,237,0.08)', borderRadius: 8, padding: '6px 10px' }}>
                  <p style={{ fontSize: 10, color: 'var(--bloom-muted)', margin: 0 }}>{item.category}</p>
                  <p style={{ fontSize: 13, fontFamily: 'var(--font-heading)', color: 'var(--bloom-text)', margin: '2px 0 0 0' }}>{item.value}/5 avg</p>
                </div>
              ))}
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--bloom-border)" strokeOpacity={0.3} />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: 'var(--bloom-muted)' }} />
                <Radar dataKey="value" stroke="var(--bloom-glow)" fill="var(--bloom-glow)" fillOpacity={0.15} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ===== TOP SYMPTOMS BAR CHART ===== */}
      <div style={{ background: 'var(--bloom-surface)', borderRadius: 16, padding: 20 }}>
        <h3 className="flex items-center gap-2" style={{ fontSize: 15, fontFamily: 'var(--font-heading)', fontWeight: 600, margin: '0 0 4px 0' }}>
          <Heart size={15} style={{ color: 'var(--bloom-rose)' }} /> Top Symptoms (30 Days)
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topSymptoms} layout="vertical">
              <CartesianGrid stroke="var(--bloom-border)" strokeOpacity={0.3} strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--bloom-muted)' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: 'var(--bloom-muted)' }} axisLine={false} tickLine={false} width={100} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid var(--bloom-border)', background: 'var(--bloom-lift)', color: 'var(--bloom-text)', fontSize: 12 }}
              />
              <Bar dataKey="count" fill="var(--bloom-rose)" radius={[0, 6, 6, 0]} name="Occurrences" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ===== TODAY'S SNAPSHOT ===== */}
      <div style={{ background: 'var(--bloom-surface)', borderRadius: 16, padding: 20 }}>
        <h3 className="flex items-center gap-2" style={{ fontSize: 15, fontFamily: 'var(--font-heading)', fontWeight: 600, margin: '0 0 16px 0' }}>
          <Moon size={15} style={{ color: 'var(--bloom-teal)' }} /> Today's Snapshot
        </h3>
        {todayLog ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p style={{ fontSize: 11, color: 'var(--bloom-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Symptoms</p>
              <p style={{ fontSize: 16, fontFamily: 'var(--font-heading)', color: 'var(--bloom-text)', margin: '4px 0 0 0' }}>{todayLog.symptoms.length} logged</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--bloom-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Mood</p>
              <p style={{ fontSize: 16, fontFamily: 'var(--font-heading)', color: 'var(--bloom-text)', margin: '4px 0 0 0' }}>{todayLog.mood?.primary || 'Not set'}</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--bloom-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Energy</p>
              <p style={{ fontSize: 16, fontFamily: 'var(--font-heading)', color: 'var(--bloom-text)', margin: '4px 0 0 0' }}>{todayLog.energy}/10</p>
            </div>
            <div>
              <p style={{ fontSize: 11, color: 'var(--bloom-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>Sleep</p>
              <p style={{ fontSize: 16, fontFamily: 'var(--font-heading)', color: 'var(--bloom-text)', margin: '4px 0 0 0' }}>{todayLog.sleep?.hours || '—'}h</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p style={{ fontSize: 13, color: 'var(--bloom-muted)', margin: 0 }}>No symptoms logged today.</p>
            <button
              onClick={() => setCurrentView('journal')}
              className="border-none cursor-pointer mt-4"
              style={{
                background: 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))',
                borderRadius: 10,
                padding: '8px 18px',
                color: '#fff',
                fontSize: 13,
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
              }}
            >
              Log Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
