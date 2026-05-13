// ============================================================
// BLOOM — Ask Bloom AI Chat (real async AI)
// ============================================================

import { useState, useRef, useEffect, useMemo } from 'react';
import { useBloomStore } from '../../store/useBloomStore';
import { askBloomAI, checkEmergencySymptoms } from '../../utils/aiEngine';
import { ArrowUp, AlertTriangle, Wifi, WifiOff, Activity, TrendingUp, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useVoiceJournal } from '../../hooks/useVoiceJournal';
import { getGeminiKey, hasCustomGeminiKey } from '../../lib/geminiKeyManager';

function BloomPetalFlower({ size = 36, isTyping = false }: { size?: number; isTyping?: boolean }) {
  const cx = size / 2;
  const cy = size / 2;
  const petalRx = size * 0.12;
  const petalRy = size * 0.32;
  const offset = size * 0.24;

  const petals = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 * Math.PI) / 180;
    const petalCx = cx + Math.sin(angle) * offset;
    const petalCy = cy - Math.cos(angle) * offset;
    return (
      <ellipse
        key={i}
        cx={petalCx}
        cy={petalCy}
        rx={petalRx}
        ry={petalRy}
        transform={`rotate(${i * 60}, ${petalCx}, ${petalCy})`}
        fill="#a78bfa"
        opacity={0.85}
      />
    );
  });

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={isTyping ? 'animate-spin' : ''}
      style={isTyping ? { animationDuration: '1.5s' } : undefined}
    >
      {petals}
      <circle cx={cx} cy={cy} r={size * 0.1} fill="#14b8a6" />
    </svg>
  );
}

export default function AskBloom() {
  const { conversations, symptomLogs, addConversationMessage, isDemoMode, userProfile, currentUser } = useBloomStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiError, setAiError] = useState('');
  const [crackedPod, setCrackedPod] = useState<string | null>(null);
  const [inputFocused, setInputFocused] = useState(false);
  const [sendHovered, setSendHovered] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const hasGeminiKey = !!getGeminiKey();
  const hasCustomKey = hasCustomGeminiKey();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { voiceState, transcript, error: voiceError, startListening, stopListening, isSupported, resetVoice } = useVoiceJournal();

  const conv = conversations.find(c => c.userId === currentUser?.id) || conversations[0];
  const chatIsEmpty = !conv || conv.messages.length === 0;

  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL &&
    !import.meta.env.VITE_SUPABASE_URL?.includes('placeholder');

  const recentLogs = useMemo(() => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffDate = cutoff.toISOString().split('T')[0];
    return [...symptomLogs]
      .filter(log => log.date >= cutoffDate)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [symptomLogs]);

  const trendData = useMemo(() => {
    return recentLogs.map(log => ({
      date: new Date(`${log.date}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      severity: log.symptoms.length > 0
        ? Number((log.symptoms.reduce((sum, symptom) => sum + symptom.severity, 0) / log.symptoms.length).toFixed(1))
        : 0,
      energy: log.energy,
      symptoms: log.symptoms.length,
    }));
  }, [recentLogs]);

  const noticeablePatterns = useMemo(() => {
    const patterns: string[] = [];
    const symptomCounts = new Map<string, number>();
    const thisWeekCutoff = new Date();
    thisWeekCutoff.setDate(thisWeekCutoff.getDate() - 7);
    const thisWeek = thisWeekCutoff.toISOString().split('T')[0];
    const weeklyLogs = recentLogs.filter(log => log.date >= thisWeek);

    weeklyLogs.forEach(log => {
      log.symptoms.forEach(symptom => {
        symptomCounts.set(symptom.name, (symptomCounts.get(symptom.name) ?? 0) + 1);
      });
    });

    const topWeeklySymptom = [...symptomCounts.entries()].sort((a, b) => b[1] - a[1])[0];
    if (topWeeklySymptom) {
      patterns.push(`${topWeeklySymptom[0]} logged ${topWeeklySymptom[1]}x this week`);
    }

    const cycleLogs = recentLogs.filter(log => typeof log.cycleDay === 'number');
    const midCycleLogs = cycleLogs.filter(log => (log.cycleDay ?? 0) >= 10 && (log.cycleDay ?? 0) <= 18);
    const avgEnergy = (logs: typeof recentLogs) => logs.length > 0
      ? logs.reduce((sum, log) => sum + log.energy, 0) / logs.length
      : null;
    const midCycleEnergy = avgEnergy(midCycleLogs);
    const overallEnergy = avgEnergy(cycleLogs);
    if (midCycleEnergy !== null && overallEnergy !== null && midCycleLogs.length >= 2 && midCycleEnergy < overallEnergy) {
      patterns.push('Your energy tends to dip mid-cycle');
    }

    const moodLogs = recentLogs.filter(log => log.mood);
    if (moodLogs.length >= 3) {
      const lowMoodLogs = moodLogs.filter(log => (log.mood?.score ?? 5) <= 4);
      if (lowMoodLogs.length >= 2) patterns.push('Lower mood has appeared on multiple recent logs');
    }

    if (patterns.length === 0 && recentLogs.length > 0) {
      patterns.push(`${recentLogs.length} symptom logs captured in the last 30 days`);
      patterns.push('Bloom can compare severity, energy, mood, and cycle timing');
    }

    return patterns.slice(0, 3);
  }, [recentLogs]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conv?.messages]);

  useEffect(() => {
    if (voiceState === 'listening') {
      setInput(transcript);
    } else if (voiceState === 'processing' && transcript.trim()) {
      void handleSend(transcript);
      resetVoice();
    }
  }, [transcript, voiceState]);

  useEffect(() => {
    return () => window.speechSynthesis?.cancel();
  }, []);

  const speak = (text: string) => {
    if (!isVoiceMode || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*_#]/g, ''));
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v =>
      v.name.includes('Female') ||
      v.name.includes('Samantha') ||
      v.name.includes('Victoria') ||
      v.name.includes('Karen') ||
      v.name.includes('Google UK English Female') ||
      v.name.includes('Microsoft Zira') ||
      v.name.includes('Microsoft Hazel')
    );

    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async (overrideInput?: string) => {
    const userInput = (overrideInput ?? input).trim();
    if (!userInput || !conv) return;

    const emergency = checkEmergencySymptoms([userInput]);
    if (emergency) {
      addConversationMessage(conv.id, {
        id: `user-${Date.now()}`, role: 'user', content: userInput, timestamp: new Date().toISOString(),
      });
      addConversationMessage(conv.id, {
        id: `emg-${Date.now()}`, role: 'assistant', content: emergency.message,
        timestamp: new Date().toISOString(), isEmergency: true,
      });
      setInput('');
      speak(emergency.message);
      return;
    }

    addConversationMessage(conv.id, {
      id: `user-${Date.now()}`, role: 'user', content: userInput, timestamp: new Date().toISOString(),
    });
    setInput('');
    setIsTyping(true);
    setAiError('');

    try {
      let response;
      if (isDemoMode && !hasGeminiKey) {
        await new Promise(r => setTimeout(r, 1200));
        const { generateBloomResponse } = await import('../../utils/aiEngine');
        response = generateBloomResponse(userInput, symptomLogs);
      } else {
        response = await askBloomAI(userInput, userProfile);
      }
      addConversationMessage(conv.id, response);
      speak(response.content);
    } catch (err) {
      const message = err instanceof Error ? err.message : '';
      if (/API key|permission|quota|rate|403|429|400/i.test(message)) {
        setAiError('Gemini could not use that API key. Check that it is valid, enabled for the Gemini API, and not restricted from this site.');
      } else {
        setAiError('Bloom is temporarily unavailable. Please try again in a moment.');
      }
      console.error('[AskBloom]', err);
    } finally {
      setIsTyping(false);
    }
  };

  const suggestions = userProfile
    ? [
        `Why might I be experiencing ${userProfile.symptoms[0] ?? 'fatigue'}?`,
        'What patterns do you see in my symptoms?',
        'What should I ask my doctor?',
        `What does ${userProfile.lifeStage} stage mean for my health?`,
      ]
    : [
        'Why is my pelvic pain getting worse?',
        'Tell me about my fatigue patterns',
        'What should I ask my doctor?',
        'Explain my cycle patterns',
      ];

  const emptyStatePrompts = [
    'What do my symptoms suggest?',
    'Why am I feeling fatigued?',
    'How does my cycle affect my mood?',
    ...suggestions,
  ].slice(0, 5);

  const handlePodClick = (text: string) => {
    setCrackedPod(text);
    setTimeout(() => {
      setCrackedPod(null);
      setInput(text);
    }, 300);
  };

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <BloomPetalFlower size={48} />
        <div className="flex-1">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold font-[var(--font-display)]" style={{ color: 'var(--bloom-text)' }}>
                Ask Bloom
              </h1>
              <p className="text-sm mt-1" style={{ color: 'var(--bloom-muted)' }}>
                AI-powered health insights {userProfile ? `personalised for ${userProfile.nickname}` : 'based on your data'}
              </p>
            </div>
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all"
              style={{
                backgroundColor: isVoiceMode ? 'var(--bloom-lift)' : 'var(--bloom-surface)',
                border: `1px solid ${isVoiceMode ? 'var(--bloom-glow)' : 'var(--bloom-border)'}`,
                color: isVoiceMode ? 'var(--bloom-text)' : 'var(--bloom-muted)',
              }}
              onClick={() => {
                setIsVoiceMode(prev => {
                  if (prev) window.speechSynthesis?.cancel();
                  return !prev;
                });
              }}
              title={isVoiceMode ? 'Mute voice responses' : 'Enable voice responses'}
              aria-label={isVoiceMode ? 'Mute voice responses' : 'Enable voice responses'}
            >
              {isVoiceMode ? <Volume2 size={18} /> : <VolumeX size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Status indicator */}
      {(hasGeminiKey || !isDemoMode) && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs mb-3"
          style={{
            backgroundColor: (hasGeminiKey || isConfigured) ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)',
            color: 'var(--bloom-text)',
            border: (hasGeminiKey || isConfigured) ? '1px solid rgba(34,197,94,0.3)' : '1px solid rgba(245,158,11,0.3)',
          }}
        >
          {(hasGeminiKey || isConfigured) ? <Wifi size={12} /> : <WifiOff size={12} />}
          {hasCustomKey
            ? 'Connected to Bloom AI with your Gemini key'
            : hasGeminiKey
              ? 'Connected to Bloom AI with the configured Gemini key'
            : isConfigured
            ? 'Connected to Bloom AI — responses are personalised to your profile'
            : 'Demo mode — connect Bloom services for personalised AI responses'}
        </div>
      )}

      {/* Disclaimer banner */}
      <div
        className="flex items-start gap-2 p-3 rounded-lg text-xs mb-3"
        style={{
          borderLeft: '2px solid var(--bloom-amber)',
          background: 'transparent',
          color: 'var(--bloom-muted)',
          fontStyle: 'italic',
        }}
      >
        <AlertTriangle size={14} style={{ color: 'var(--bloom-amber)' }} className="shrink-0 mt-0.5" />
        <p>
          <strong>Important:</strong> Bloom provides pattern observations, not medical diagnoses.
          Always consult a healthcare professional for medical advice.
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
        {chatIsEmpty && (
          <div className="space-y-4">
            {/* Recent Patterns card */}
            <div
              className="p-4 rounded-xl"
              style={{
                backgroundColor: 'var(--bloom-surface)',
                border: '1px solid var(--bloom-border)',
              }}
            >
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-semibold flex items-center gap-2" style={{ color: 'var(--bloom-text)' }}>
                    <Activity size={16} style={{ color: 'var(--bloom-amber)' }} /> Your Recent Patterns
                  </h2>
                  <p className="text-xs mt-1" style={{ color: 'var(--bloom-muted)' }}>Last 30 days of logged symptoms</p>
                </div>
                <span
                  className="text-xs font-medium px-2 py-1 rounded-full"
                  style={{
                    backgroundColor: 'var(--bloom-lift)',
                    color: 'var(--bloom-text)',
                    border: '1px solid var(--bloom-border)',
                  }}
                >
                  {recentLogs.length} logs
                </span>
              </div>

              {trendData.length > 0 ? (
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--bloom-muted)' }} axisLine={false} tickLine={false} minTickGap={18} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: 12,
                          border: '1px solid var(--bloom-border)',
                          background: 'var(--bloom-surface)',
                          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
                          fontSize: 12,
                          color: 'var(--bloom-text)',
                        }}
                      />
                      <Area type="monotone" dataKey="severity" stroke="#a855f7" fill="rgba(168,85,247,0.15)" strokeWidth={2} name="Avg severity" />
                      <Area type="monotone" dataKey="energy" stroke="#22c55e" fill="rgba(34,197,94,0.15)" strokeWidth={2} name="Energy" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div
                  className="rounded-xl p-4 text-sm"
                  style={{
                    backgroundColor: 'var(--bloom-lift)',
                    color: 'var(--bloom-muted)',
                    border: '1px solid var(--bloom-border)',
                  }}
                >
                  Log a few symptoms and Bloom will summarize your recent severity, energy, and mood patterns here.
                </div>
              )}
            </div>

            {/* Noticeable Patterns */}
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2" style={{ color: 'var(--bloom-text)' }}>
                <TrendingUp size={15} style={{ color: 'var(--bloom-amber)' }} /> Noticeable Patterns
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {noticeablePatterns.map(pattern => (
                  <div
                    key={pattern}
                    className="text-sm p-3 rounded-xl"
                    style={{
                      backgroundColor: 'var(--bloom-surface)',
                      border: '1px solid var(--bloom-border)',
                      color: 'var(--bloom-text)',
                    }}
                  >
                    {pattern}
                  </div>
                ))}
                {noticeablePatterns.length === 0 && (
                  <div
                    className="text-sm p-3 rounded-xl"
                    style={{
                      backgroundColor: 'var(--bloom-surface)',
                      border: '1px solid var(--bloom-border)',
                      color: 'var(--bloom-muted)',
                    }}
                  >
                    Start logging symptoms to unlock personalized pattern notes.
                  </div>
                )}
              </div>
            </div>

            {/* Suggested Prompts */}
            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2" style={{ color: 'var(--bloom-text)' }}>
                <TrendingUp size={15} style={{ color: 'var(--bloom-amber)' }} /> Suggested Prompts
              </h3>
              <div className="flex flex-wrap gap-2">
                {emptyStatePrompts.map(prompt => (
                  <button
                    key={prompt}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all"
                    style={{
                      backgroundColor: 'var(--bloom-lift)',
                      border: '1px solid var(--bloom-border)',
                      color: 'var(--bloom-text)',
                      transform: crackedPod === prompt ? 'scale(1.05)' : 'scale(1)',
                      opacity: crackedPod === prompt ? 0.7 : 1,
                    }}
                    onClick={() => handlePodClick(prompt)}
                  >
                    <span
                      style={{
                        display: 'inline-block',
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        backgroundColor: 'var(--bloom-amber)',
                      }}
                    />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {conv?.messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className="max-w-[80%] p-3"
              style={
                msg.role === 'user'
                  ? {
                      background: 'linear-gradient(135deg, #a78bfa, #f43f5e)',
                      color: 'white',
                      borderRadius: '20px 20px 4px 20px',
                    }
                  : {
                      backgroundColor: 'var(--bloom-surface)',
                      border: msg.isEmergency ? '2px solid #f43f5e' : '1px solid var(--bloom-border)',
                      borderRadius: '20px 20px 20px 4px',
                      color: 'var(--bloom-text)',
                    }
              }
            >
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-2 mb-2">
                  <BloomPetalFlower size={36} />
                  <span className="text-xs font-semibold" style={{ color: 'var(--bloom-amber)' }}>Bloom AI</span>
                </div>
              )}
              <div className="text-sm ai-content whitespace-pre-line">{msg.content}</div>
              {msg.disclaimer && (
                <p className="text-[10px] mt-2 flex items-center gap-1" style={{ color: 'var(--bloom-muted)', fontStyle: 'italic' }}>
                  <AlertTriangle size={10} /> {msg.disclaimer}
                </p>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-start">
            <div
              className="p-3"
              style={{
                backgroundColor: 'var(--bloom-surface)',
                border: '1px solid var(--bloom-border)',
                borderRadius: '20px 20px 20px 4px',
              }}
            >
              <div className="flex items-center gap-2">
                <BloomPetalFlower size={36} isTyping={true} />
                <span className="text-sm" style={{ color: 'var(--bloom-muted)' }}>Bloom is thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error */}
        {aiError && (
          <div className="flex justify-start">
            <div
              className="p-3 text-sm"
              style={{
                backgroundColor: 'rgba(244,63,94,0.1)',
                border: '1px solid rgba(244,63,94,0.3)',
                borderRadius: '20px 20px 20px 4px',
                color: '#f43f5e',
              }}
            >
              {aiError}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions (bottom chips / seed pods) */}
      {conv && !chatIsEmpty && conv.messages.length <= 2 && (
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3" style={{ scrollbarWidth: 'none' }}>
          {suggestions.map(s => (
            <button
              key={s}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap transition-all shrink-0"
              style={{
                backgroundColor: 'var(--bloom-lift)',
                border: '1px solid var(--bloom-border)',
                color: 'var(--bloom-text)',
                transform: crackedPod === s ? 'scale(1.05)' : 'scale(1)',
                opacity: crackedPod === s ? 0.7 : 1,
              }}
              onClick={() => handlePodClick(s)}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'var(--bloom-amber)',
                }}
              />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input bar */}
      <div
        className="flex items-center gap-2 px-3 py-2"
        style={{
          backgroundColor: 'var(--bloom-surface)',
          border: '1px solid var(--bloom-border)',
          borderRadius: 16,
          boxShadow: inputFocused ? '0 0 0 3px rgba(124,58,237,0.25)' : 'none',
          transition: 'box-shadow 0.2s ease',
        }}
      >
        <BloomPetalFlower size={20} />
        <input
          className="flex-1 bg-transparent text-sm outline-none placeholder-[var(--bloom-muted)]"
          style={{ color: 'var(--bloom-text)' }}
          placeholder={voiceState === 'listening' ? 'Listening...' : 'Ask Bloom anything about your health patterns...'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          onFocus={() => setInputFocused(true)}
          onBlur={() => setInputFocused(false)}
        />
        <button
          className="flex items-center justify-center shrink-0 transition-all"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: voiceState === 'listening' ? 'rgba(232, 121, 160, 0.18)' : 'var(--bloom-lift)',
            border: `1px solid ${voiceState === 'listening' ? 'var(--bloom-rose)' : 'var(--bloom-border)'}`,
            color: voiceState === 'listening' ? 'var(--bloom-rose)' : 'var(--bloom-muted)',
            cursor: isSupported && !isTyping ? 'pointer' : 'not-allowed',
            opacity: isSupported && !isTyping ? 1 : 0.45,
          }}
          onClick={voiceState === 'listening' ? stopListening : startListening}
          disabled={!isSupported || isTyping}
          title={isSupported ? (voiceState === 'listening' ? 'Stop listening' : 'Speak to Bloom') : 'Speech recognition is not supported in this browser'}
          aria-label={voiceState === 'listening' ? 'Stop listening' : 'Speak to Bloom'}
        >
          {voiceState === 'listening' ? <MicOff size={18} /> : <Mic size={18} />}
        </button>
        <button
          className="flex items-center justify-center shrink-0"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #a78bfa, #f43f5e)',
            border: 'none',
            cursor: input.trim() && !isTyping ? 'pointer' : 'not-allowed',
            opacity: input.trim() && !isTyping ? 1 : 0.4,
          }}
          onClick={() => handleSend()}
          disabled={!input.trim() || isTyping}
          onMouseEnter={() => setSendHovered(true)}
          onMouseLeave={() => setSendHovered(false)}
        >
          <ArrowUp
            size={18}
            color="white"
            style={{
              transform: sendHovered ? 'rotate(0deg)' : 'rotate(45deg)',
              transition: 'transform 0.2s ease',
            }}
          />
        </button>
      </div>
      {voiceError && (
        <p className="mt-2 text-xs" style={{ color: 'var(--bloom-rose)' }}>
          {voiceError}
        </p>
      )}
    </div>
  );
}
