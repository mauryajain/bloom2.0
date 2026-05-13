import { useState, useMemo, useRef, useEffect } from 'react';
import { useBloomStore } from '../../store/useBloomStore';
import { SymptomLog, SymptomEntry, Severity } from '../../types';
import { format, parseISO, subDays, getDaysInMonth } from 'date-fns';
import {
  Plus, Calendar, ChevronDown, ChevronUp, Search, Mic,
  Flame, CloudRain, Heart, Brain, Moon, Utensils, Eye, TrendingUp, X,
  Smile, Frown, Meh, Zap, CheckCircle, AlertCircle, Cloud,
  Wind, Activity
} from 'lucide-react';
import VoiceSymptomLogger from './VoiceSymptomLogger';

const SYMPTOM_PRESETS: { name: string; category: string; icon: string }[] = [
  { name: 'Cramps', category: 'pain', icon: '\u{1F525}' },
  { name: 'Headache', category: 'pain', icon: '\u{1F915}' },
  { name: 'Pelvic Pain', category: 'pain', icon: '\u{1F623}' },
  { name: 'Lower Back Pain', category: 'pain', icon: '\u{1F4A2}' },
  { name: 'Bloating', category: 'digestive', icon: '\u{1F388}' },
  { name: 'Nausea', category: 'digestive', icon: '\u{1F922}' },
  { name: 'Fatigue', category: 'energy', icon: '\u{1F634}' },
  { name: 'Brain Fog', category: 'cognitive', icon: '\u{1F32B}\uFE0F' },
  { name: 'Mood Swings', category: 'mood', icon: '\u{1F3AD}' },
  { name: 'Anxiety', category: 'mood', icon: '\u{1F630}' },
  { name: 'Irritability', category: 'mood', icon: '\u{1F624}' },
  { name: 'Insomnia', category: 'sleep', icon: '\u{1F319}' },
  { name: 'Hot Flash', category: 'other', icon: '\u{1F321}\uFE0F' },
  { name: 'Night Sweats', category: 'sleep', icon: '\u{1F4A6}' },
  { name: 'Breast Tenderness', category: 'reproductive', icon: '\u{1F497}' },
  { name: 'Acne', category: 'skin', icon: '\u{1F534}' },
  { name: 'Joint Pain', category: 'pain', icon: '\u{1F9B4}' },
  { name: 'Dizziness', category: 'other', icon: '\u{1F4AB}' },
];

const MOODS = ['Happy', 'Calm', 'Anxious', 'Sad', 'Irritable', 'Overwhelmed', 'Content', 'Energetic'];

const severityLabels = ['', 'Minimal', 'Mild', 'Moderate', 'Severe', 'Extreme'];
const severityColors = ['', '#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];

const moodColorMap: Record<string, string> = {
  Happy: '#2dd4bf',
  Calm: '#4ade80',
  Anxious: '#7c3aed',
  Sad: '#60a5fa',
  Irritable: '#e879a0',
  Overwhelmed: '#f59e0b',
  Content: '#2dd4bf',
  Energetic: '#f59e0b',
};

const moodIconMap: Record<string, typeof Smile> = {
  Happy: Smile,
  Calm: Heart,
  Anxious: AlertCircle,
  Sad: Frown,
  Irritable: Zap,
  Overwhelmed: Cloud,
  Content: CheckCircle,
  Energetic: Activity,
};

function arcPath(cx: number, cy: number, r1: number, r2: number, a1: number, a2: number): string {
  const sRad = (a1 * Math.PI) / 180;
  const eRad = (a2 * Math.PI) / 180;
  const x1 = cx + r1 * Math.cos(sRad);
  const y1 = cy + r1 * Math.sin(sRad);
  const x2 = cx + r1 * Math.cos(eRad);
  const y2 = cy + r1 * Math.sin(eRad);
  const x3 = cx + r2 * Math.cos(eRad);
  const y3 = cy + r2 * Math.sin(eRad);
  const x4 = cx + r2 * Math.cos(sRad);
  const y4 = cy + r2 * Math.sin(sRad);
  const large = Math.abs(eRad - sRad) > Math.PI ? 1 : 0;
  const fmt = (v: number) => v.toFixed(2);
  return `M ${fmt(x1)} ${fmt(y1)} A ${r1} ${r1} 0 ${large} 1 ${fmt(x2)} ${fmt(y2)} L ${fmt(x3)} ${fmt(y3)} A ${r2} ${r2} 0 ${large} 0 ${fmt(x4)} ${fmt(y4)} Z`;
}

function segmentColor(severity: number): string {
  if (severity === 0) return '#0a0612';
  if (severity <= 0.5) return '#1a1040';
  if (severity <= 1) return '#2d1a5e';
  if (severity <= 1.5) return '#3d2270';
  if (severity <= 2) return '#4e2b80';
  if (severity <= 2.5) return '#603498';
  if (severity <= 3) return '#7c3aed';
  if (severity <= 3.5) return '#9353d3';
  if (severity <= 4) return '#b05c8a';
  return '#e879a0';
}

function CircularHeatmap({ logs }: { logs: SymptomLog[] }) {
  const [hovered, setHovered] = useState<{ dateKey: string; severity: number; x: number; y: number } | null>(null);

  const cx = 220;
  const cy = 220;
  const innerMost = 40;
  const ringH = 10;
  const ringStep = 12;

  const dateSeverityMap = useMemo(() => {
    const map = new Map<string, number>();
    logs.forEach(log => {
      if (log.symptoms.length > 0) {
        const avg = log.symptoms.reduce((s, sym) => s + sym.severity, 0) / log.symptoms.length;
        map.set(log.date, avg);
      }
    });
    return map;
  }, [logs]);

  const monthsData = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
      const daysIn = getDaysInMonth(d);
      const days = Array.from({ length: daysIn }, (_, idx) => {
        const date = new Date(d.getFullYear(), d.getMonth(), idx + 1);
        const dateKey = format(date, 'yyyy-MM-dd');
        return {
          day: idx + 1,
          dateKey,
          severity: dateSeverityMap.get(dateKey) ?? 0,
        };
      });
      months.push({ label: format(d, 'MMM'), days, monthDate: d });
    }
    return months;
  }, [dateSeverityMap]);

  const loggedDays = logs.filter(l => l.symptoms.length > 0).length;
  const logsByDate = new Set(logs.filter(l => l.symptoms.length > 0).map(l => l.date));
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    if (!logsByDate.has(format(subDays(new Date(), i), 'yyyy-MM-dd'))) break;
    streak++;
  }

  const handleMouseEnter = (e: React.MouseEvent, dateKey: string, severity: number) => {
    setHovered({ dateKey, severity, x: e.clientX, y: e.clientY });
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    setHovered(prev => prev ? { ...prev, x: e.clientX, y: e.clientY } : null);
  };
  const handleMouseLeave = () => setHovered(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span
          style={{
            background: 'rgba(124, 58, 237, 0.12)',
            border: '1px solid var(--bloom-border)',
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          {loggedDays} days logged
        </span>
        <span
          style={{
            background: 'rgba(124, 58, 237, 0.12)',
            border: '1px solid var(--bloom-border)',
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.7)',
          }}
        >
          {streak} day streak
        </span>
      </div>

      <div className="relative" style={{ maxWidth: '460px' }}>
        <svg viewBox="0 0 440 440" width="100%" style={{ display: 'block' }}>
          {monthsData.map((m, monthIdx) => {
            const r1 = innerMost + monthIdx * ringStep;
            const r2 = r1 + ringH;
            return m.days.map((day, dayIdx) => {
              const segAngle = 360 / m.days.length;
              const a1 = -90 + dayIdx * segAngle;
              const a2 = a1 + segAngle;
              const path = arcPath(cx, cy, r1, r2, a1, a2);
              return (
                <path
                  key={day.dateKey}
                  d={path}
                  fill={segmentColor(day.severity)}
                  onMouseEnter={e => handleMouseEnter(e, day.dateKey, day.severity)}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  style={{ cursor: 'pointer' }}
                />
              );
            });
          })}
          {monthsData.map((m, idx) => {
            const angle = -90 + idx * 30 + 15;
            const rad = (angle * Math.PI) / 180;
            const r = 30;
            const x = cx + r * Math.cos(rad);
            const y = cy + r * Math.sin(rad);
            return (
              <text
                key={`label-${m.label}`}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="central"
                fill="rgba(124, 58, 237, 0.4)"
                fontSize="9"
                fontFamily="DM Sans, sans-serif"
                style={{ pointerEvents: 'none', userSelect: 'none' }}
              >
                {m.label}
              </text>
            );
          })}
          <circle cx={cx} cy={cy} r={innerMost - 4} fill="none" stroke="rgba(124,58,237,0.08)" strokeWidth="1" strokeDasharray="2 2" />
        </svg>

        {hovered && (
          <div
            style={{
              position: 'fixed',
              left: hovered.x + 14,
              top: hovered.y - 14,
              background: 'var(--bloom-lift)',
              border: '1px solid var(--bloom-border)',
              borderRadius: '8px',
              padding: '8px 12px',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.9)',
              pointerEvents: 'none',
              zIndex: 9999,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              lineHeight: 1.4,
            }}
          >
            <p style={{ fontWeight: 600 }}>{format(parseISO(hovered.dateKey), 'MMM dd, yyyy')}</p>
            <p style={{ color: 'rgba(255,255,255,0.6)' }}>
              {hovered.severity > 0 ? `Avg severity: ${hovered.severity.toFixed(1)}` : 'No entry'}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
        <span>None</span>
        {['#0a0612', '#2d1a5e', '#4e2b80', '#7c3aed', '#b05c8a', '#e879a0'].map(c => (
          <span key={c} style={{ width: 10, height: 10, borderRadius: 2, background: c, display: 'inline-block' }} />
        ))}
        <span>Intense</span>
      </div>
    </div>
  );
}

function CycleArc({ day, cycleLength }: { day: number | null; cycleLength: number }) {
  const fraction = Math.min((day ?? 1) / cycleLength, 1);
  const angle = fraction * 360;
  const r = 9;
  const cx = 12;
  const cy = 12;
  const startRad = (-90 * Math.PI) / 180;
  const endRad = ((-90 + angle) * Math.PI) / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const large = angle > 180 ? 1 : 0;
  const path = `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;

  return (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(124,58,237,0.15)" strokeWidth="2" />
      {day && (
        <path d={path} fill="none" stroke="var(--bloom-glow)" strokeWidth="2" strokeLinecap="round" />
      )}
      <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="central" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="DM Sans, sans-serif">
        {day ?? '--'}
      </text>
    </svg>
  );
}

function catIcon(cat: string) {
  switch (cat) {
    case 'pain': return <Flame size={12} style={{ color: '#e879a0' }} />;
    case 'mood': return <Heart size={12} style={{ color: '#7c3aed' }} />;
    case 'energy': return <Eye size={12} style={{ color: '#f59e0b' }} />;
    case 'digestive': return <Utensils size={12} style={{ color: '#4ade80' }} />;
    case 'sleep': return <Moon size={12} style={{ color: '#38bdf8' }} />;
    case 'cognitive': return <Brain size={12} style={{ color: '#7c3aed' }} />;
    default: return <CloudRain size={12} style={{ color: 'rgba(255,255,255,0.4)' }} />;
  }
}

export default function SymptomJournal() {
  const { symptomLogs, addSymptomLog, currentUser, isDemoMode } = useBloomStore();
  const [showLogger, setShowLogger] = useState(false);
  const [showVoiceLogger, setShowVoiceLogger] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<{ name: string; category: string; severity: Severity }[]>([]);
  const [mood, setMood] = useState('');
  const [energy, setEnergy] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);
  const loggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const styleId = 'bloom-journal-keyframes';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes pulse-ring { 0% { transform: scale(1); opacity: 0.5; } 100% { transform: scale(2.2); opacity: 0; } }
      @keyframes bloom-fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes bloom-slide-down { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  useEffect(() => {
    if (showLogger && loggerRef.current) {
      loggerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [showLogger]);

  const filteredPresets = SYMPTOM_PRESETS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const sortedLogs = useMemo(() =>
    [...symptomLogs].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 30),
    [symptomLogs]
  );

  const toggleSymptom = (name: string, category: string) => {
    setSelectedSymptoms(prev => {
      const exists = prev.find(s => s.name === name);
      if (exists) return prev.filter(s => s.name !== name);
      return [...prev, { name, category, severity: 3 as Severity }];
    });
  };

  const updateSeverity = (name: string, severity: Severity) => {
    setSelectedSymptoms(prev =>
      prev.map(s => s.name === name ? { ...s, severity } : s)
    );
  };

  const handleSubmit = async () => {
    if (selectedSymptoms.length === 0) return;

    const log: SymptomLog = {
      id: `log-${Date.now()}`,
      userId: currentUser?.id || '',
      date: format(new Date(), 'yyyy-MM-dd'),
      cycleDay: null,
      symptoms: selectedSymptoms.map((s, i) => ({
        id: `sym-${Date.now()}-${i}`,
        name: s.name,
        category: s.category as any,
        severity: s.severity,
        duration: 'Not specified',
      })),
      mood: mood ? { primary: mood, secondary: [], score: energy } : null,
      energy,
      sleep: { hours: sleepHours, quality: 3 as Severity, disturbances: [] },
      notes,
      tags: [],
      createdAt: new Date().toISOString(),
    };

    addSymptomLog(log);

    if (!isDemoMode && currentUser) {
      try {
        const { saveSymptomLog } = await import('../../lib/onboardingService');
        await saveSymptomLog(currentUser.id, {
          date: log.date,
          cycleDay: log.cycleDay,
          symptoms: log.symptoms,
          mood: log.mood,
          energy: log.energy,
          sleep: log.sleep,
          notes: log.notes,
          tags: log.tags,
        });
      } catch (err) {
        console.error('[SymptomJournal] Failed to save to DB:', err);
      }
    }

    setShowLogger(false);
    setSelectedSymptoms([]);
    setMood('');
    setEnergy(5);
    setNotes('');
    setSearch('');
  };

  const severityGradients: Record<number, string> = {
    1: 'linear-gradient(135deg, #22c55e, #4ade80)',
    2: 'linear-gradient(135deg, #84cc16, #a3e635)',
    3: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    4: 'linear-gradient(135deg, #f97316, #fb923c)',
    5: 'linear-gradient(135deg, #ef4444, #f87171)',
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1
            style={{
              fontSize: '28px',
              fontWeight: 700,
              fontFamily: 'var(--font-display), Fraunces, serif',
              background: 'linear-gradient(135deg, #e879a0 0%, #7c3aed 50%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1.2,
            }}
          >
            Symptom Journal
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', marginTop: '2px' }}>
            Track your daily symptoms, mood, and energy
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Circular Voice Button */}
          <div className="relative" style={{ width: 56, height: 56 }}>
            {isRecording && (
              <>
                {[0, 1, 2].map(i => (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '50%',
                      border: '2px solid var(--bloom-glow)',
                      animation: `pulse-ring 1.5s ${i * 0.3}s ease-out infinite`,
                    }}
                  />
                ))}
              </>
            )}
            <button
              onClick={() => {
                setShowVoiceLogger(!showVoiceLogger);
                setShowLogger(false);
                setIsRecording(!showVoiceLogger);
              }}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #7c3aed, #e879a0)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                zIndex: 1,
                transition: 'box-shadow 0.3s, transform 0.3s',
                boxShadow: isRecording ? '0 0 24px rgba(124,58,237,0.5)' : '0 4px 16px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <Mic size={22} color="white" />
            </button>
          </div>

          {/* Log Symptoms Button */}
          <button
            onClick={() => { setShowLogger(!showLogger); setShowVoiceLogger(false); setIsRecording(false); }}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(232,121,160,0.15))',
              border: '1px solid rgba(124, 58, 237, 0.3)',
              color: 'white',
              fontWeight: 600,
              fontSize: '14px',
              fontFamily: 'DM Sans, sans-serif',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.3s',
              backdropFilter: 'blur(8px)',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.35), rgba(232,121,160,0.25))';
              e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.5)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(232,121,160,0.15))';
              e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
            }}
          >
            <Plus size={18} />
            Log Symptoms
          </button>
        </div>
      </div>

      {/* Voice Logger */}
      {showVoiceLogger && (
        <div style={{
          animation: 'bloom-fade-in 0.4s ease-out',
          background: 'var(--bloom-surface)',
          border: '1px solid var(--bloom-border)',
          borderRadius: '20px',
          padding: '24px',
        }}>
          <VoiceSymptomLogger
            onClose={() => { setShowVoiceLogger(false); setIsRecording(false); }}
            onLogged={() => { setShowVoiceLogger(false); setIsRecording(false); }}
          />
        </div>
      )}

      {/* Logger Modal */}
      {showLogger && (
        <div
          ref={loggerRef}
          style={{
            animation: 'bloom-fade-in 0.4s ease-out',
            background: 'var(--bloom-surface)',
            border: '1px solid var(--bloom-border)',
            borderRadius: '20px',
            padding: '28px',
          }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 style={{
              fontFamily: 'var(--font-display), Fraunces, serif',
              fontSize: '20px',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.95)',
            }}>
              How are you feeling today?
            </h2>
            <button
              onClick={() => setShowLogger(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'rgba(255,255,255,0.4)',
                cursor: 'pointer',
                padding: 4,
                borderRadius: 8,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <X size={20} />
            </button>
          </div>

          <div className="space-y-6">
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(255,255,255,0.3)',
                  pointerEvents: 'none',
                }}
              />
              <input
                style={{
                  width: '100%',
                  background: 'var(--bloom-lift)',
                  border: '1px solid var(--bloom-border)',
                  borderRadius: '12px',
                  padding: '12px 12px 12px 40px',
                  color: 'rgba(255,255,255,0.9)',
                  fontSize: '14px',
                  fontFamily: 'DM Sans, sans-serif',
                  outline: 'none',
                }}
                placeholder="Search symptoms..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Symptom Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {filteredPresets.map(preset => {
                const selected = selectedSymptoms.find(s => s.name === preset.name);
                return (
                  <button
                    key={preset.name}
                    onClick={() => toggleSymptom(preset.name, preset.category)}
                    style={{
                      padding: '12px',
                      borderRadius: '12px',
                      textAlign: 'left',
                      fontSize: '13px',
                      fontFamily: 'DM Sans, sans-serif',
                      cursor: 'pointer',
                      border: selected ? '1px solid var(--bloom-glow)' : '1px solid transparent',
                      background: selected ? 'var(--bloom-glow)' : 'var(--bloom-lift)',
                      color: selected ? 'white' : 'rgba(255,255,255,0.8)',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      lineHeight: 1.2,
                    }}
                    onMouseEnter={e => {
                      if (!selected) {
                        e.currentTarget.style.background = 'rgba(124, 58, 237, 0.15)';
                        e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!selected) {
                        e.currentTarget.style.background = 'var(--bloom-lift)';
                        e.currentTarget.style.borderColor = 'transparent';
                      }
                    }}
                  >
                    <span style={{ fontSize: 16 }}>{preset.icon}</span>
                    {preset.name}
                  </button>
                );
              })}
            </div>

            {/* Severity */}
            {selectedSymptoms.length > 0 && (
              <div className="space-y-3">
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Set Severity</h3>
                {selectedSymptoms.map(s => (
                  <div
                    key={s.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: 'var(--bloom-lift)',
                      borderRadius: '12px',
                      padding: '12px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 500,
                        width: 100,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        color: 'rgba(255,255,255,0.85)',
                        flexShrink: 0,
                      }}
                    >
                      {s.name}
                    </span>
                    <div className="flex gap-1.5" style={{ flex: 1 }}>
                      {([1, 2, 3, 4, 5] as Severity[]).map(sev => (
                        <button
                          key={sev}
                          onClick={() => updateSeverity(s.name, sev)}
                          style={{
                            flex: 1,
                            padding: '8px 4px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: 600,
                            fontFamily: 'DM Sans, sans-serif',
                            cursor: 'pointer',
                            border: s.severity === sev ? 'none' : '1px solid rgba(255,255,255,0.1)',
                            background: s.severity === sev
                              ? severityGradients[sev]
                              : 'transparent',
                            color: s.severity === sev ? 'white' : 'rgba(255,255,255,0.4)',
                            transition: 'all 0.2s',
                          }}
                          onMouseEnter={e => {
                            if (s.severity !== sev) {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                            }
                          }}
                          onMouseLeave={e => {
                            if (s.severity !== sev) {
                              e.currentTarget.style.background = 'transparent';
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            }
                          }}
                        >
                          {severityLabels[sev]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mood */}
            <div>
              <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>Mood</h3>
              <div className="flex flex-wrap gap-2">
                {MOODS.map(m => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '999px',
                      fontSize: '13px',
                      fontFamily: 'DM Sans, sans-serif',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: mood === m ? 'rgba(124, 58, 237, 0.2)' : 'transparent',
                      border: mood === m
                        ? '1px solid var(--bloom-glow)'
                        : '1px solid var(--bloom-border)',
                      color: mood === m ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)',
                    }}
                    onMouseEnter={e => {
                      if (mood !== m) {
                        e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                        e.currentTarget.style.background = 'rgba(124, 58, 237, 0.05)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (mood !== m) {
                        e.currentTarget.style.borderColor = 'var(--bloom-border)';
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Energy Level</h3>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#7c3aed' }}>{energy}/10</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                value={energy}
                onChange={e => setEnergy(+e.target.value)}
                style={{
                  width: '100%',
                  height: 6,
                  borderRadius: 3,
                  appearance: 'none',
                  background: `linear-gradient(to right, #7c3aed ${(energy - 1) / 9 * 100}%, var(--bloom-lift) ${(energy - 1) / 9 * 100}%)`,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Sleep Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.6)' }}>Hours of Sleep</h3>
                <span style={{ fontSize: '14px', fontWeight: 700, color: '#7c3aed' }}>{sleepHours}h</span>
              </div>
              <input
                type="range"
                min={0}
                max={12}
                step={0.5}
                value={sleepHours}
                onChange={e => setSleepHours(+e.target.value)}
                style={{
                  width: '100%',
                  height: 6,
                  borderRadius: 3,
                  appearance: 'none',
                  background: `linear-gradient(to right, #7c3aed ${sleepHours / 12 * 100}%, var(--bloom-lift) ${sleepHours / 12 * 100}%)`,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              />
            </div>

            {/* Notes */}
            <textarea
              style={{
                width: '100%',
                background: 'var(--bloom-lift)',
                border: '1px solid var(--bloom-border)',
                borderRadius: '12px',
                padding: '12px',
                color: 'rgba(255,255,255,0.9)',
                fontSize: '13px',
                fontFamily: 'DM Sans, sans-serif',
                outline: 'none',
                resize: 'none',
                minHeight: 80,
              }}
              rows={3}
              placeholder="Any additional notes..."
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />

            {/* Submit */}
            <div className="flex gap-3">
              <button
                onClick={handleSubmit}
                disabled={selectedSymptoms.length === 0}
                style={{
                  flex: 1,
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: selectedSymptoms.length === 0 ? 'not-allowed' : 'pointer',
                  opacity: selectedSymptoms.length === 0 ? 0.4 : 1,
                  background: 'linear-gradient(135deg, #7c3aed, #e879a0)',
                  color: 'white',
                  transition: 'all 0.3s',
                }}
                onMouseEnter={e => {
                  if (selectedSymptoms.length > 0) {
                    e.currentTarget.style.boxShadow = '0 8px 32px rgba(124, 58, 237, 0.4)';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                Save Entry ({selectedSymptoms.length} symptoms)
              </button>
              <button
                onClick={() => setShowLogger(false)}
                style={{
                  padding: '14px 24px',
                  borderRadius: '12px',
                  border: '1px solid var(--bloom-border)',
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.6)',
                  fontWeight: 500,
                  fontSize: '14px',
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.3)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.borderColor = 'var(--bloom-border)';
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div
        style={{
          background: 'var(--bloom-surface)',
          border: '1px solid var(--bloom-border)',
          borderRadius: '20px',
          padding: '24px',
        }}
      >
        <h3
          className="flex items-center gap-2"
          style={{
            fontSize: '16px',
            fontWeight: 600,
            fontFamily: 'var(--font-display), Fraunces, serif',
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 16,
          }}
        >
          <TrendingUp size={18} style={{ color: '#7c3aed' }} />
          12-Month Overview
        </h3>
        <CircularHeatmap logs={symptomLogs} />
      </div>

      {/* Recent Entries */}
      <div className="space-y-4">
        <h3
          className="flex items-center gap-2"
          style={{
            fontSize: '16px',
            fontWeight: 600,
            fontFamily: 'var(--font-display), Fraunces, serif',
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          <Calendar size={18} style={{ color: '#7c3aed' }} />
          Recent Entries
        </h3>

        {sortedLogs.length === 0 && (
          <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', padding: '24px 0' }}>
            No entries yet. Start logging your symptoms above.
          </p>
        )}

        {sortedLogs.map(log => {
          const MoodIconComp = log.mood?.primary ? moodIconMap[log.mood.primary] || Heart : null;
          const isExpanded = expandedLog === log.id;

          return (
            <div
              key={log.id}
              className="flex items-start gap-3"
              style={{ animation: 'bloom-fade-in 0.3s ease-out' }}
            >
              {/* Glowing Date Badge */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'var(--bloom-surface)',
                  border: '1px solid var(--bloom-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  position: 'relative',
                }}
              >
                <span
                  style={{
                    fontSize: '10px',
                    fontFamily: 'DM Sans, sans-serif',
                    color: 'rgba(255,255,255,0.4)',
                    lineHeight: 1,
                    marginBottom: 1,
                  }}
                >
                  {format(parseISO(log.date), 'MMM').toUpperCase()}
                </span>
                <span
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-display), Fraunces, serif',
                    color: 'rgba(255,255,255,0.9)',
                    lineHeight: 1,
                  }}
                >
                  {format(parseISO(log.date), 'dd')}
                </span>
              </div>

              {/* Entry Card */}
              <div
                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                style={{
                  flex: 1,
                  background: 'var(--bloom-surface)',
                  border: '1px solid var(--bloom-border)',
                  borderRadius: '16px',
                  padding: isExpanded ? '16px' : '0 16px',
                  minHeight: isExpanded ? 'auto' : 56,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.35)';
                  e.currentTarget.style.background = 'rgba(26, 20, 48, 0.9)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--bloom-border)';
                  e.currentTarget.style.background = 'var(--bloom-surface)';
                }}
              >
                {!isExpanded ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {MoodIconComp && (
                        <div style={{ color: log.mood?.primary ? moodColorMap[log.mood.primary] || '#7c3aed' : '#7c3aed' }}>
                          <MoodIconComp size={18} />
                        </div>
                      )}
                      <div>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
                          {log.symptoms.length} symptom{log.symptoms.length !== 1 ? 's' : ''}
                          {log.mood?.primary ? ` \u00B7 ${log.mood.primary}` : ''}
                        </span>
                        <div className="flex items-center gap-2" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                          <span>Energy {log.energy}/10</span>
                          <span>\u00B7</span>
                          <span>Sleep {log.sleep?.hours || '\u2014'}h</span>
                          {log.cycleDay ? (
                            <>
                              <span>\u00B7</span>
                              <CycleArc day={log.cycleDay} cycleLength={28} />
                            </>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <ChevronDown size={16} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {MoodIconComp && (
                          <div style={{ color: log.mood?.primary ? moodColorMap[log.mood.primary] || '#7c3aed' : '#7c3aed' }}>
                            <MoodIconComp size={18} />
                          </div>
                        )}
                        <div>
                          <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(255,255,255,0.85)' }}>
                            {log.symptoms.length} symptom{log.symptoms.length !== 1 ? 's' : ''}
                            {log.mood?.primary ? ` \u00B7 ${log.mood.primary}` : ''}
                          </span>
                          <div className="flex items-center gap-2" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>
                            <span>Energy {log.energy}/10</span>
                            <span>\u00B7</span>
                            <span>Sleep {log.sleep?.hours || '\u2014'}h</span>
                            {log.cycleDay ? (
                              <>
                                <span>\u00B7</span>
                                <CycleArc day={log.cycleDay} cycleLength={28} />
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>
                      <ChevronUp size={16} style={{ color: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
                    </div>

                    {/* Symptom Chips */}
                    <div className="flex flex-wrap gap-2 mt-3 pt-3" style={{ borderTop: '1px solid var(--bloom-border)' }}>
                      {log.symptoms.map(s => (
                        <span
                          key={s.id}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '4px 12px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 500,
                            fontFamily: 'DM Sans, sans-serif',
                            background: severityColors[s.severity] + '20',
                            color: severityColors[s.severity],
                            border: `1px solid ${severityColors[s.severity]}40`,
                          }}
                        >
                          {catIcon(s.category)}
                          {s.name}
                          <span style={{ opacity: 0.6 }}>\u00B7 {s.severity}/5</span>
                        </span>
                      ))}
                    </div>

                    {log.notes && (
                      <p
                        style={{
                          fontSize: '12px',
                          color: 'rgba(255,255,255,0.5)',
                          fontStyle: 'italic',
                          marginTop: 10,
                          lineHeight: 1.5,
                        }}
                      >
                        "{log.notes}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Range slider custom styles */}
      <style>{`
        input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #e879a0);
          cursor: pointer;
          border: 2px solid var(--bloom-surface);
          box-shadow: 0 0 12px rgba(124, 58, 237, 0.4);
        }
        input[type=range]::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: linear-gradient(135deg, #7c3aed, #e879a0);
          cursor: pointer;
          border: 2px solid var(--bloom-surface);
          box-shadow: 0 0 12px rgba(124, 58, 237, 0.4);
        }
      `}</style>
    </div>
  );
}
