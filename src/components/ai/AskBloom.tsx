// ============================================================
// BLOOM — Ask Bloom AI Chat (real async AI)
// ============================================================

import { useState, useRef, useEffect, useMemo } from 'react';
import { useBloomStore } from '../../store/useBloomStore';
import { askBloomAI, checkEmergencySymptoms } from '../../utils/aiEngine';
import { Brain, Send, Sparkles, AlertTriangle, ShieldCheck, Wifi, WifiOff, Activity, Zap, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AskBloom() {
  const { conversations, symptomLogs, addConversationMessage, isDemoMode, userProfile } = useBloomStore();
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiError, setAiError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const conv = conversations[0];
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

  const handleSend = async () => {
    if (!input.trim() || !conv) return;
    const userInput = input.trim();

    // Emergency check (client-side fast path)
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
      return;
    }

    addConversationMessage(conv.id, {
      id: `user-${Date.now()}`, role: 'user', content: userInput, timestamp: new Date().toISOString(),
    });
    setInput('');
    setIsTyping(true);
    setAiError('');

    try {
      // Real users → Edge Function; demo users → mock
      let response;
      if (isDemoMode) {
        await new Promise(r => setTimeout(r, 1200));
        const { generateBloomResponse } = await import('../../utils/aiEngine');
        response = generateBloomResponse(userInput, symptomLogs);
      } else {
        response = await askBloomAI(userInput);
      }
      addConversationMessage(conv.id, response);
    } catch (err) {
      setAiError('Bloom is temporarily unavailable. Please try again in a moment.');
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

  return (
    <div className="space-y-4 flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-display)] flex items-center gap-2">
          <Brain className="text-bloom-500" size={24} /> Ask Bloom
        </h1>
        <p className="text-warm-400 text-sm mt-1">
          AI-powered health insights {userProfile ? `personalised for ${userProfile.nickname}` : 'based on your data'}
        </p>
      </div>

      {/* Status indicator */}
      {!isDemoMode && (
        <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs ${
          isConfigured ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
        }`}>
          {isConfigured ? <Wifi size={12} /> : <WifiOff size={12} />}
          {isConfigured
            ? 'Connected to Bloom AI - responses are personalised to your profile'
            : 'Demo mode - connect Bloom services for personalised AI responses'}
        </div>
      )}

      <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
        <ShieldCheck size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <p className="text-amber-800">
          <strong>Important:</strong> Bloom provides pattern observations, not medical diagnoses.
          Always consult a healthcare professional for medical advice.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {chatIsEmpty && (
          <div className="space-y-4">
            <div className="glass-card p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <h2 className="font-semibold flex items-center gap-2">
                    <Activity size={16} className="text-bloom-500" /> Your Recent Patterns
                  </h2>
                  <p className="text-xs text-warm-400 mt-1">Last 30 days of logged symptoms</p>
                </div>
                <span className="badge badge-bloom">{recentLogs.length} logs</span>
              </div>

              {trendData.length > 0 ? (
                <div className="h-36">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendData}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={18} />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }}
                      />
                      <Area type="monotone" dataKey="severity" stroke="#a855f7" fill="#f3e8ff" strokeWidth={2} name="Avg severity" />
                      <Area type="monotone" dataKey="energy" stroke="#22c55e" fill="#dcfce7" strokeWidth={2} name="Energy" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="rounded-xl bg-warm-50 p-4 text-sm text-warm-500">
                  Log a few symptoms and Bloom will summarize your recent severity, energy, and mood patterns here.
                </div>
              )}
            </div>

            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <TrendingUp size={15} className="text-amber-500" /> Noticeable Patterns
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {noticeablePatterns.map(pattern => (
                  <div key={pattern} className="p-3 rounded-xl bg-white/70 border border-warm-100 text-sm text-warm-700">
                    {pattern}
                  </div>
                ))}
                {noticeablePatterns.length === 0 && (
                  <div className="p-3 rounded-xl bg-white/70 border border-warm-100 text-sm text-warm-500">
                    Start logging symptoms to unlock personalized pattern notes.
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-sm flex items-center gap-2 mb-2">
                <Zap size={15} className="text-sage-500" /> Suggested Prompts
              </h3>
              <div className="flex flex-wrap gap-2">
                {emptyStatePrompts.map(prompt => (
                  <button
                    key={prompt}
                    className="px-3 py-1.5 rounded-full text-xs bg-bloom-50 text-bloom-700 hover:bg-bloom-100 transition-all border border-bloom-200"
                    onClick={() => setInput(prompt)}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
        {conv?.messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={msg.isEmergency ? 'chat-assistant border-2 border-rose-300 bg-rose-50' : msg.role === 'user' ? 'chat-user' : 'chat-assistant'}>
              {msg.role === 'assistant' && (
                <div className="flex items-center gap-1 mb-2 text-bloom-600">
                  <Sparkles size={12} /> <span className="text-xs font-semibold">Bloom AI</span>
                </div>
              )}
              <div className="text-sm ai-content whitespace-pre-line">{msg.content}</div>
              {msg.disclaimer && (
                <p className="text-[10px] text-warm-400 mt-2 flex items-center gap-1">
                  <AlertTriangle size={10} /> {msg.disclaimer}
                </p>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="chat-assistant">
              <div className="flex items-center gap-2 text-bloom-400">
                <Sparkles size={14} className="animate-[pulse-soft_1.5s_ease-in-out_infinite]" />
                <span className="text-sm">Bloom is thinking...</span>
              </div>
            </div>
          </div>
        )}
        {aiError && (
          <div className="flex justify-start">
            <div className="chat-assistant border border-rose-200 bg-rose-50">
              <p className="text-sm text-rose-600">{aiError}</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {conv && !chatIsEmpty && conv.messages.length <= 2 && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map(s => (
            <button
              key={s}
              className="px-3 py-1.5 rounded-full text-xs bg-bloom-50 text-bloom-700 hover:bg-bloom-100 transition-all border border-bloom-200"
              onClick={() => setInput(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-3">
        <input
          className="bloom-input flex-1"
          placeholder="Ask Bloom anything about your health patterns..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
        />
        <button className="btn-bloom px-4" onClick={handleSend} disabled={!input.trim() || isTyping}>
          <Send size={18} />
        </button>
      </div>
    </div>
  );
}
