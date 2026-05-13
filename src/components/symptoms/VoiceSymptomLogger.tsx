// ============================================================
// BLOOM — Voice Symptom Logger
// Beautiful microphone UI → speech-to-text → AI extraction → auto-log
// ============================================================

import { useState, useEffect } from 'react';
import { useVoiceJournal } from '../../hooks/useVoiceJournal';
import { extractSymptomsFromVoice, ExtractedSymptomData } from '../../utils/voiceExtractor';
import { useBloomStore } from '../../store/useBloomStore';
import { SymptomLog, Severity } from '../../types';
import { format } from 'date-fns';
import { Mic, MicOff, Square, Check, X, Loader2, Sparkles, AlertCircle, Volume2 } from 'lucide-react';

interface VoiceSymptomLoggerProps {
  onClose: () => void;
  onLogged: () => void;
}

export default function VoiceSymptomLogger({ onClose, onLogged }: VoiceSymptomLoggerProps) {
  const { voiceState, transcript, error, isSupported, startListening, stopListening, resetVoice } = useVoiceJournal();
  const { addSymptomLog, currentUser, isDemoMode } = useBloomStore();
  const [extractedData, setExtractedData] = useState<ExtractedSymptomData | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractError, setExtractError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (voiceState === 'processing' && transcript.trim()) {
      runExtraction();
    }
  }, [voiceState]);

  const runExtraction = async () => {
    setIsExtracting(true);
    setExtractError('');
    try {
      const data = await extractSymptomsFromVoice(transcript);
      setExtractedData(data);
    } catch (err) {
      console.error('[VoiceLogger] Extraction failed:', err);
      setExtractError('Failed to extract symptoms. Please try again.');
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = async () => {
    if (!extractedData) return;

    const log: SymptomLog = {
      id: `log-${Date.now()}`,
      userId: currentUser?.id || '',
      date: format(new Date(), 'yyyy-MM-dd'),
      cycleDay: null,
      symptoms: extractedData.symptoms.map((s, i) => ({
        id: `sym-${Date.now()}-${i}`,
        name: s.name,
        category: s.category,
        severity: s.severity as Severity,
        duration: 'Not specified',
        location: s.location,
      })),
      mood: extractedData.mood
        ? { primary: extractedData.mood, secondary: [], score: extractedData.energy }
        : null,
      energy: extractedData.energy,
      sleep: extractedData.sleepHours
        ? { hours: extractedData.sleepHours, quality: 3 as Severity, disturbances: [] }
        : null,
      notes: extractedData.notes || `🎙️ Voice logged: "${transcript}"`,
      tags: ['voice-logged'],
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
        console.error('[VoiceLogger] Failed to save to DB:', err);
      }
    }

    setSaved(true);
    setTimeout(() => {
      onLogged();
    }, 1500);
  };

  const severityColors = ['', '#22c55e', '#84cc16', '#f59e0b', '#f97316', '#ef4444'];
  const severityLabels = ['', 'Minimal', 'Mild', 'Moderate', 'Severe', 'Extreme'];

  return (
    <div
      className="p-6 animate-[bloom_0.6s_ease-out] space-y-5"
      style={{ background: 'var(--bloom-surface)', border: '1px solid var(--bloom-border)', borderRadius: 20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-rose-400 to-bloom-500 flex items-center justify-center">
            <Mic size={16} className="text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg" style={{ color: 'var(--bloom-text)' }}>Voice Symptom Logger</h2>
            <p className="text-xs" style={{ color: 'var(--bloom-muted)' }}>Speak naturally — Bloom will understand</p>
          </div>
        </div>
        <button onClick={onClose} className="transition-colors" style={{ color: 'var(--bloom-muted)' }}>
          <X size={20} />
        </button>
      </div>

      {/* Not supported warning */}
      {!isSupported && (
        <div
          className="flex items-start gap-2 p-3 rounded-xl text-xs"
          style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.25)', color: 'var(--bloom-amber)' }}
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <p>Speech recognition is not supported in this browser. Please use Chrome or Edge for voice logging.</p>
        </div>
      )}

      {/* ===== IDLE STATE: Big Mic Button ===== */}
      {voiceState === 'idle' && !extractedData && !saved && (
        <div className="flex flex-col items-center gap-4 py-6">
          <button
            onClick={startListening}
            disabled={!isSupported}
            className="relative group"
          >
            <div className="absolute inset-0 rounded-full bg-bloom-400 opacity-20 group-hover:opacity-30 transition-opacity animate-ping" style={{ animationDuration: '2s' }} />
            <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-bloom-200 to-rose-200 opacity-40 group-hover:opacity-60 blur-md transition-opacity" />
            <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-bloom-500 to-rose-500 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all cursor-pointer disabled:opacity-50">
              <Mic size={40} className="text-white" />
            </div>
          </button>
          <div className="text-center">
            <p className="font-medium" style={{ color: 'var(--bloom-text)' }}>Tap to start speaking</p>
            <p className="text-xs mt-1 max-w-xs" style={{ color: 'var(--bloom-muted)' }}>
              Describe your symptoms naturally. Example: "I'm having terrible cramps, about 7 out of 10, and I feel really exhausted today."
            </p>
          </div>
        </div>
      )}

      {/* ===== LISTENING STATE: Waveform + Stop ===== */}
      {voiceState === 'listening' && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-rose-400 opacity-30 animate-ping" />
            <div className="absolute -inset-3 rounded-full bg-rose-300 opacity-20 animate-ping" style={{ animationDelay: '0.5s' }} />
            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg">
              <Volume2 size={32} className="text-white animate-pulse" />
            </div>
          </div>

          <div className="flex items-end gap-1 h-8">
            {Array.from({ length: 20 }, (_, i) => (
              <div
                key={i}
                className="w-1 bg-bloom-400 rounded-full"
                style={{
                  height: `${Math.random() * 100}%`,
                  animation: `waveform 0.5s ease-in-out ${i * 0.05}s infinite alternate`,
                  minHeight: '4px',
                }}
              />
            ))}
          </div>

          {transcript && (
            <div
              className="rounded-xl p-3 w-full max-h-24 overflow-y-auto"
              style={{ background: 'var(--bloom-lift)', border: '1px solid var(--bloom-border)' }}
            >
              <p className="text-sm italic" style={{ color: 'var(--bloom-text)' }}>"{transcript}"</p>
            </div>
          )}

          <button
            onClick={stopListening}
            className="flex items-center gap-2 px-6 py-3 rounded-full transition-all shadow-md"
            style={{ background: 'var(--bloom-surface)', border: '1px solid var(--bloom-border)', color: 'var(--bloom-text)' }}
          >
            <Square size={14} fill="currentColor" /> Stop Recording
          </button>
        </div>
      )}

      {/* ===== PROCESSING / EXTRACTING STATE ===== */}
      {(voiceState === 'processing' || isExtracting) && !extractedData && (
        <div className="flex flex-col items-center gap-4 py-6">
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-bloom-400 to-purple-500 flex items-center justify-center">
            <Sparkles size={28} className="text-white animate-pulse" />
            <div className="absolute inset-0 rounded-full border-2 border-bloom-300 border-t-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-medium" style={{ color: 'var(--bloom-text)' }}>Bloom is analyzing your symptoms...</p>
            <p className="text-xs mt-1" style={{ color: 'var(--bloom-muted)' }}>Extracting symptoms, severity, mood, and energy from your voice</p>
          </div>
          {transcript && (
            <div
              className="rounded-xl p-3 w-full"
              style={{ background: 'var(--bloom-lift)', border: '1px solid var(--bloom-border)' }}
            >
              <p className="text-sm italic" style={{ color: 'var(--bloom-text)' }}>"{transcript}"</p>
            </div>
          )}
        </div>
      )}

      {/* ===== ERROR STATE ===== */}
      {(voiceState === 'error' || extractError) && (
        <div className="space-y-3">
          <div
            className="flex items-start gap-2 p-3 rounded-xl text-sm"
            style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.25)', color: 'var(--bloom-rose)' }}
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>{error || extractError}</p>
          </div>
          <button
            onClick={() => { resetVoice(); setExtractError(''); setExtractedData(null); }}
            className="w-full px-4 py-2.5 font-medium"
            style={{ background: 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', color: 'white', borderRadius: 14 }}
          >
            Try Again
          </button>
        </div>
      )}

      {/* ===== EXTRACTED RESULTS: Review & Confirm ===== */}
      {extractedData && !saved && (
        <div className="space-y-4 animate-[slide-up_0.3s_ease-out]">
          <div className="rounded-xl p-3" style={{ background: 'var(--bloom-lift)' }}>
            <p className="text-xs mb-1 font-medium" style={{ color: 'var(--bloom-muted)' }}>🎙️ What you said:</p>
            <p className="text-sm italic" style={{ color: 'var(--bloom-text)' }}>"{transcript}"</p>
          </div>

          <div>
            <h3 className="font-medium text-sm mb-2 flex items-center gap-2" style={{ color: 'var(--bloom-text)' }}>
              <Sparkles size={14} className="text-bloom-500" /> Bloom Extracted:
            </h3>
            <div className="flex flex-wrap gap-2">
              {extractedData.symptoms.map((s, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium"
                  style={{
                    background: severityColors[s.severity] + '18',
                    color: severityColors[s.severity],
                    border: `1px solid ${severityColors[s.severity]}44`,
                  }}
                >
                  {s.name} · {severityLabels[s.severity]} ({s.severity}/5)
                  {s.location && ` · ${s.location}`}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {extractedData.mood && (
              <div
                className="rounded-xl p-3"
                style={{ background: 'var(--bloom-lift)', border: '1px solid var(--bloom-border)' }}
              >
                <p className="text-xs font-medium" style={{ color: 'var(--bloom-muted)' }}>Mood</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--bloom-text)' }}>{extractedData.mood}</p>
              </div>
            )}
            <div
              className="rounded-xl p-3"
              style={{ background: 'var(--bloom-lift)', border: '1px solid var(--bloom-border)' }}
            >
              <p className="text-xs font-medium" style={{ color: 'var(--bloom-muted)' }}>Energy</p>
              <p className="text-sm font-semibold" style={{ color: 'var(--bloom-text)' }}>{extractedData.energy}/10</p>
            </div>
            {extractedData.sleepHours && (
              <div
                className="rounded-xl p-3"
                style={{ background: 'var(--bloom-lift)', border: '1px solid var(--bloom-border)' }}
              >
                <p className="text-xs font-medium" style={{ color: 'var(--bloom-muted)' }}>Sleep</p>
                <p className="text-sm font-semibold" style={{ color: 'var(--bloom-text)' }}>{extractedData.sleepHours}h</p>
              </div>
            )}
          </div>

          {extractedData.notes && extractedData.notes !== transcript && (
            <div
              className="rounded-xl p-3"
              style={{ background: 'var(--bloom-lift)', border: '1px solid var(--bloom-border)' }}
            >
              <p className="text-xs font-medium" style={{ color: 'var(--bloom-muted)' }}>Notes</p>
              <p className="text-sm" style={{ color: 'var(--bloom-text)' }}>{extractedData.notes}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 font-medium"
              style={{ background: 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', color: 'white', borderRadius: 14 }}
              onClick={handleSave}
            >
              <Check size={16} /> Save Entry ({extractedData.symptoms.length} symptoms)
            </button>
            <button
              className="px-4 py-2.5 font-medium"
              style={{ background: 'transparent', border: '1px solid var(--bloom-border)', color: 'var(--bloom-text)', borderRadius: 14 }}
              onClick={() => { resetVoice(); setExtractedData(null); }}
            >
              Redo
            </button>
          </div>
        </div>
      )}

      {/* ===== SAVED SUCCESS ===== */}
      {saved && (
        <div className="flex flex-col items-center gap-3 py-6 animate-[bloom_0.6s_ease-out]">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
            <Check size={32} className="text-green-600" />
          </div>
          <p className="font-semibold text-green-700">Symptoms Logged Successfully!</p>
          <p className="text-xs" style={{ color: 'var(--bloom-muted)' }}>Your voice entry has been saved to your journal</p>
        </div>
      )}
    </div>
  );
}
