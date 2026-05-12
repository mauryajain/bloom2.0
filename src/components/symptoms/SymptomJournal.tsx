// ============================================================
// BLOOM — Symptom Journal & Logger
// Agent 1 (Full-Stack Lead) — Symptom Tracking
// ============================================================

import { useState, useMemo } from 'react';
import { useBloomStore } from '../../store/useBloomStore';
import { SymptomLog, SymptomEntry, Severity } from '../../types';
import { format, parseISO, subDays } from 'date-fns';
import {
  Plus, Calendar, ChevronDown, ChevronUp, Search,
  Flame, CloudRain, Heart, Brain, Moon, Utensils, Eye, Mic, TrendingUp
} from 'lucide-react';
import VoiceSymptomLogger from './VoiceSymptomLogger';

const SYMPTOM_PRESETS = [
  { name: 'Cramps', category: 'pain' as const, icon: '🔥' },
  { name: 'Headache', category: 'pain' as const, icon: '🤕' },
  { name: 'Pelvic Pain', category: 'pain' as const, icon: '😣' },
  { name: 'Lower Back Pain', category: 'pain' as const, icon: '💢' },
  { name: 'Bloating', category: 'digestive' as const, icon: '🎈' },
  { name: 'Nausea', category: 'digestive' as const, icon: '🤢' },
  { name: 'Fatigue', category: 'energy' as const, icon: '😴' },
  { name: 'Brain Fog', category: 'cognitive' as const, icon: '🌫️' },
  { name: 'Mood Swings', category: 'mood' as const, icon: '🎭' },
  { name: 'Anxiety', category: 'mood' as const, icon: '😰' },
  { name: 'Irritability', category: 'mood' as const, icon: '😤' },
  { name: 'Insomnia', category: 'sleep' as const, icon: '🌙' },
  { name: 'Hot Flash', category: 'other' as const, icon: '🌡️' },
  { name: 'Night Sweats', category: 'sleep' as const, icon: '💦' },
  { name: 'Breast Tenderness', category: 'reproductive' as const, icon: '💗' },
  { name: 'Acne', category: 'skin' as const, icon: '🔴' },
  { name: 'Joint Pain', category: 'pain' as const, icon: '🦴' },
  { name: 'Dizziness', category: 'other' as const, icon: '💫' },
];

const MOODS = ['Happy', 'Calm', 'Anxious', 'Sad', 'Irritable', 'Overwhelmed', 'Content', 'Energetic'];

const severityLabels = ['', 'Minimal', 'Mild', 'Moderate', 'Severe', 'Extreme'];
const severityColors = ['', '#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];

function SymptomHeatmap({ logs }: { logs: SymptomLog[] }) {
  const days = Array.from({ length: 90 }, (_, index) => {
    const date = subDays(new Date(), 89 - index);
    const dateKey = format(date, 'yyyy-MM-dd');
    const log = logs.find(entry => entry.date === dateKey);
    const severity = log && log.symptoms.length > 0
      ? log.symptoms.reduce((sum, symptom) => sum + symptom.severity, 0) / log.symptoms.length
      : 0;

    return {
      date,
      dateKey,
      severity,
      hasSymptoms: Boolean(log && log.symptoms.length > 0),
    };
  });

  const loggedDays = days.filter(day => day.hasSymptoms).length;
  const logsByDate = new Set(logs.filter(log => log.symptoms.length > 0).map(log => log.date));
  let currentStreak = 0;

  for (let index = 0; index < 90; index += 1) {
    const dateKey = format(subDays(new Date(), index), 'yyyy-MM-dd');
    if (!logsByDate.has(dateKey)) break;
    currentStreak += 1;
  }

  const monthCutoff = format(subDays(new Date(), 30), 'yyyy-MM-dd');
  const symptomCounts = new Map<string, number>();
  logs
    .filter(log => log.date >= monthCutoff)
    .forEach(log => {
      log.symptoms.forEach(symptom => {
        symptomCounts.set(symptom.name, (symptomCounts.get(symptom.name) ?? 0) + 1);
      });
    });
  const mostLoggedSymptom = [...symptomCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'No symptoms yet';

  const severityClass = (severity: number) => {
    if (severity === 0) return 'bg-warm-100';
    if (severity <= 2) return 'bg-bloom-100';
    if (severity <= 3) return 'bg-bloom-300';
    if (severity <= 4) return 'bg-bloom-500';
    return 'bg-rose-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <span className="rounded-full bg-bloom-50 border border-bloom-100 px-3 py-1 text-xs text-bloom-700">
          {loggedDays} days logged
        </span>
        <span className="rounded-full bg-bloom-50 border border-bloom-100 px-3 py-1 text-xs text-bloom-700">
          {currentStreak} day streak
        </span>
        <span className="rounded-full bg-bloom-50 border border-bloom-100 px-3 py-1 text-xs text-bloom-700">
          Top this month: {mostLoggedSymptom}
        </span>
      </div>

      <div className="grid grid-cols-13 grid-rows-7 gap-[2px] w-fit">
        {days.map(day => (
          <div
            key={day.dateKey}
            className={`w-[10px] h-[10px] rounded-sm ${severityClass(day.severity)}`}
            title={`${format(day.date, 'MMM dd, yyyy')}: ${day.severity > 0 ? `Avg severity ${day.severity.toFixed(1)}` : 'No log'}`}
          />
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-warm-400">
        <span>Less</span>
        {['bg-warm-100', 'bg-bloom-100', 'bg-bloom-300', 'bg-bloom-500', 'bg-rose-400'].map(color => (
          <span key={color} className={`w-[10px] h-[10px] rounded-sm ${color}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}

export default function SymptomJournal() {
  const { symptomLogs, addSymptomLog, currentUser, isDemoMode } = useBloomStore();
  const [showLogger, setShowLogger] = useState(false);
  const [showVoiceLogger, setShowVoiceLogger] = useState(false);
  const [selectedSymptoms, setSelectedSymptoms] = useState<{ name: string; category: string; severity: Severity }[]>([]);
  const [mood, setMood] = useState('');
  const [energy, setEnergy] = useState(5);
  const [sleepHours, setSleepHours] = useState(7);
  const [notes, setNotes] = useState('');
  const [search, setSearch] = useState('');
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

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

    // Persist to Supabase for real (non-demo) users
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
  };

  const catIcon = (cat: string) => {
    switch (cat) {
      case 'pain': return <Flame size={12} className="text-rose-400" />;
      case 'mood': return <Heart size={12} className="text-bloom-400" />;
      case 'energy': return <Eye size={12} className="text-amber-500" />;
      case 'digestive': return <Utensils size={12} className="text-sage-500" />;
      case 'sleep': return <Moon size={12} className="text-sky-400" />;
      case 'cognitive': return <Brain size={12} className="text-bloom-500" />;
      default: return <CloudRain size={12} className="text-warm-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-display)]">Symptom Journal</h1>
          <p className="text-warm-400 text-sm mt-1">Track your daily symptoms, mood, and energy</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="relative group px-4 py-2.5 rounded-xl bg-gradient-to-br from-rose-400 to-bloom-500 text-white font-medium text-sm flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 transition-all"
            onClick={() => { setShowVoiceLogger(!showVoiceLogger); setShowLogger(false); }}
          >
            <Mic size={16} /> Voice Log
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          </button>
          <button className="btn-bloom flex items-center gap-2" onClick={() => { setShowLogger(!showLogger); setShowVoiceLogger(false); }}>
            <Plus size={16} /> Log Symptoms
          </button>
        </div>
      </div>

      {/* Voice Logger */}
      {showVoiceLogger && (
        <VoiceSymptomLogger
          onClose={() => setShowVoiceLogger(false)}
          onLogged={() => setShowVoiceLogger(false)}
        />
      )}

      {/* Logger Modal */}
      {showLogger && (
        <div className="glass-card p-6 animate-[bloom_0.6s_ease-out] space-y-5">
          <h2 className="font-semibold text-lg">How are you feeling today?</h2>

          {/* Symptom Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
            <input
              className="bloom-input pl-10"
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
                  className={`p-3 rounded-xl text-left text-sm transition-all ${
                    selected
                      ? 'bg-bloom-100 border-2 border-bloom-400 shadow-bloom'
                      : 'bg-white/60 border-2 border-transparent hover:border-bloom-200'
                  }`}
                  onClick={() => toggleSymptom(preset.name, preset.category)}
                >
                  <span className="text-lg mr-2">{preset.icon}</span>
                  {preset.name}
                </button>
              );
            })}
          </div>

          {/* Severity Sliders */}
          {selectedSymptoms.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-warm-600">Set Severity</h3>
              {selectedSymptoms.map(s => (
                <div key={s.name} className="flex items-center gap-3 bg-white/50 p-3 rounded-xl">
                  <span className="text-sm font-medium w-28 truncate">{s.name}</span>
                  <div className="flex gap-1 flex-1">
                    {([1, 2, 3, 4, 5] as Severity[]).map(sev => (
                      <button
                        key={sev}
                        className="flex-1 py-2 rounded-lg text-xs font-semibold transition-all"
                        style={{
                          background: s.severity >= sev ? severityColors[sev] + '22' : 'transparent',
                          color: s.severity >= sev ? severityColors[sev] : '#a8a29e',
                          border: `2px solid ${s.severity >= sev ? severityColors[sev] : '#e7e5e4'}`
                        }}
                        onClick={() => updateSeverity(s.name, sev)}
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
            <h3 className="font-medium text-sm text-warm-600 mb-2">Mood</h3>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(m => (
                <button
                  key={m}
                  className={`px-4 py-2 rounded-full text-sm transition-all ${
                    mood === m
                      ? 'bg-bloom-500 text-white shadow-bloom'
                      : 'bg-white/60 text-warm-600 hover:bg-bloom-50'
                  }`}
                  onClick={() => setMood(m)}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Energy */}
          <div>
            <h3 className="font-medium text-sm text-warm-600 mb-2">Energy Level: {energy}/10</h3>
            <input
              type="range" min={1} max={10} value={energy}
              onChange={e => setEnergy(+e.target.value)}
              className="w-full accent-bloom-500"
            />
          </div>

          {/* Sleep */}
          <div>
            <h3 className="font-medium text-sm text-warm-600 mb-2">Hours of Sleep: {sleepHours}h</h3>
            <input
              type="range" min={0} max={12} step={0.5} value={sleepHours}
              onChange={e => setSleepHours(+e.target.value)}
              className="w-full accent-bloom-500"
            />
          </div>

          {/* Notes */}
          <textarea
            className="bloom-input resize-none"
            rows={3}
            placeholder="Any additional notes..."
            value={notes}
            onChange={e => setNotes(e.target.value)}
          />

          {/* Submit */}
          <div className="flex gap-3">
            <button className="btn-bloom flex-1" onClick={handleSubmit}>
              Save Entry ({selectedSymptoms.length} symptoms)
            </button>
            <button className="btn-bloom-outline" onClick={() => setShowLogger(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Heatmap */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-bloom-500" /> 90-Day Overview
        </h3>
        <SymptomHeatmap logs={symptomLogs} />
      </div>

      {/* Log History */}
      <div className="space-y-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Calendar size={16} className="text-bloom-500" /> Recent Entries
        </h3>
        {sortedLogs.map(log => (
          <div
            key={log.id}
            className="glass-card p-4 cursor-pointer"
            onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <p className="text-xs text-warm-400">{format(parseISO(log.date), 'MMM')}</p>
                  <p className="text-lg font-bold">{format(parseISO(log.date), 'dd')}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">
                    {log.symptoms.length} symptoms · {log.mood?.primary || 'No mood'}
                  </p>
                  <p className="text-xs text-warm-400">
                    Energy {log.energy}/10 · Sleep {log.sleep?.hours || '—'}h
                    {log.cycleDay ? ` · Cycle day ${log.cycleDay}` : ''}
                  </p>
                </div>
              </div>
              {expandedLog === log.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </div>

            {expandedLog === log.id && (
              <div className="mt-3 pt-3 border-t border-warm-100 animate-[slide-up_0.3s_ease-out]">
                <div className="flex flex-wrap gap-2">
                  {log.symptoms.map(s => (
                    <span
                      key={s.id}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
                      style={{
                        background: severityColors[s.severity] + '18',
                        color: severityColors[s.severity],
                        border: `1px solid ${severityColors[s.severity]}44`
                      }}
                    >
                      {catIcon(s.category)} {s.name} · {s.severity}/5
                    </span>
                  ))}
                </div>
                {log.notes && (
                  <p className="text-xs text-warm-500 mt-2 italic">"{log.notes}"</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
