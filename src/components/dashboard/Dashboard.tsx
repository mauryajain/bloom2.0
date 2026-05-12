// ============================================================
// BLOOM — Dashboard
// Agent 1 (Full-Stack) + Agent 3 (UI/UX) — Main Dashboard View
// ============================================================

import { useMemo } from 'react';
import { useBloomStore } from '../../store/useBloomStore';
import { format, subDays, parseISO } from 'date-fns';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, Radar
} from 'recharts';
import {
  Activity, TrendingUp, Calendar, AlertTriangle,
  Heart, Moon, Zap, Flower2
} from 'lucide-react';
import { getLifeStageInfo } from '../../data/lifeStages';

export default function Dashboard() {
  const { currentUser, symptomLogs, patterns, setCurrentView, markPatternRead } = useBloomStore();
  const lifeStageInfo = currentUser ? getLifeStageInfo(currentUser.lifeStage) : null;

  // Compute chart data
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

  const stats = [
    { label: 'Days Tracked', value: symptomLogs.length, icon: Calendar, color: 'text-bloom-500' },
    { label: 'Avg Severity', value: severityOverTime.length > 0 ? (severityOverTime.reduce((a, d) => a + d.severity, 0) / severityOverTime.length).toFixed(1) : '0', icon: Activity, color: 'text-rose-400' },
    { label: 'Patterns Found', value: patterns.length, icon: TrendingUp, color: 'text-amber-500' },
    { label: 'Avg Energy', value: severityOverTime.length > 0 ? (severityOverTime.reduce((a, d) => a + d.energy, 0) / severityOverTime.length).toFixed(1) : '0', icon: Zap, color: 'text-sage-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-[var(--font-display)]">
            Welcome back, <span className="gradient-text">{currentUser?.name?.split(' ')[0]}</span>
          </h1>
          <p className="text-warm-400 mt-1">
            {lifeStageInfo ? `${lifeStageInfo.stage.charAt(0).toUpperCase() + lifeStageInfo.stage.slice(1)} · ` : ''}
            {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <button
          className="btn-bloom flex items-center gap-2"
          onClick={() => setCurrentView('journal')}
        >
          <Heart size={16} /> Log Today's Symptoms
        </button>
      </div>

      {/* Life-stage adaptive banner */}
      {lifeStageInfo && (
        <div className="glass-card p-4 border-l-4" style={{ borderLeftColor: lifeStageInfo.uiTheme.primary }}>
          <div className="flex items-start gap-3">
            <Flower2 size={20} style={{ color: lifeStageInfo.uiTheme.primary }} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-sm" style={{ color: lifeStageInfo.uiTheme.accent }}>
                {lifeStageInfo.stage.charAt(0).toUpperCase() + lifeStageInfo.stage.slice(1).replace('-', ' ')} Insights
              </p>
              <p className="text-xs text-warm-500 mt-1">{lifeStageInfo.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="glass-card p-4 animate-[slide-up_0.4s_ease-out]">
              <div className="flex items-center gap-2 mb-2">
                <Icon size={16} className={s.color} />
                <span className="text-xs text-warm-400 uppercase tracking-wide">{s.label}</span>
              </div>
              <p className="text-2xl font-bold font-[var(--font-display)]">{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Pattern Alerts */}
      {unreadAlerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" /> Pattern Alerts
          </h2>
          {unreadAlerts.map(alert => (
            <div
              key={alert.id}
              className={`glass-card p-4 border-l-4 cursor-pointer ${
                alert.severity === 'high' ? 'border-l-rose-400' :
                alert.severity === 'medium' ? 'border-l-amber-400' : 'border-l-sage-400'
              }`}
              onClick={() => markPatternRead(alert.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{alert.title}</h3>
                  <p className="text-xs text-warm-500 mt-1">{alert.description}</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {alert.conditionsFlagged.map(c => (
                      <span key={c} className="badge badge-bloom">{c}</span>
                    ))}
                    <span className="badge badge-amber">
                      {(alert.confidence * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-xs text-bloom-600 mt-3 italic">{alert.recommendation}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Symptom Severity Over Time */}
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Activity size={16} className="text-bloom-500" /> Symptom Trend (30 Days)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={severityOverTime}>
                <defs>
                  <linearGradient id="sevGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a855f7" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#a855f7" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="energyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }}
                />
                <Area type="monotone" dataKey="severity" stroke="#a855f7" fill="url(#sevGrad)" strokeWidth={2} name="Avg Severity" />
                <Area type="monotone" dataKey="energy" stroke="#22c55e" fill="url(#energyGrad)" strokeWidth={2} name="Energy" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Symptom Radar */}
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-rose-400" /> Symptom Categories
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e7e5e4" />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 11, fill: '#78716c' }} />
                <Radar dataKey="value" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} strokeWidth={2} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Symptoms Bar Chart */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Heart size={16} className="text-rose-400" /> Top Symptoms (30 Days)
        </h3>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={topSymptoms} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }}
              />
              <Bar dataKey="count" fill="#a855f7" radius={[0, 6, 6, 0]} name="Occurrences" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Today's snapshot */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Moon size={16} className="text-bloom-400" /> Today's Snapshot
        </h3>
        {todayLog ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-warm-400">Symptoms</p>
              <p className="font-semibold">{todayLog.symptoms.length} logged</p>
            </div>
            <div>
              <p className="text-xs text-warm-400">Mood</p>
              <p className="font-semibold">{todayLog.mood?.primary || 'Not set'}</p>
            </div>
            <div>
              <p className="text-xs text-warm-400">Energy</p>
              <p className="font-semibold">{todayLog.energy}/10</p>
            </div>
            <div>
              <p className="text-xs text-warm-400">Sleep</p>
              <p className="font-semibold">{todayLog.sleep?.hours || '—'}h</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 text-warm-400">
            <p className="text-sm">No symptoms logged today.</p>
            <button className="btn-bloom mt-3 text-sm" onClick={() => setCurrentView('journal')}>
              Log Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
