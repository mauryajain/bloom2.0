import { useMemo, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { useBloomStore } from '../../store/useBloomStore';

export default function BloomLetter() {
  const { currentUser, userProfile, symptomLogs } = useBloomStore();
  const now = new Date();
  const monthName = format(now, 'MMMM');
  const cacheKey = `bloom_letter_${format(now, 'yyyy_MM')}_${currentUser?.id ?? 'guest'}`;
  const [letter, setLetter] = useState(() => {
    const cached = localStorage.getItem(cacheKey);
    return cached ? JSON.parse(cached) as string : '';
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const nickname = userProfile?.nickname || currentUser?.name?.split(' ')[0] || 'there';

  const monthStats = useMemo(() => {
    const monthKey = format(now, 'yyyy-MM');
    const monthlyLogs = symptomLogs.filter(log => log.date.startsWith(monthKey));
    const symptomCounts = new Map<string, number>();
    let severityTotal = 0;
    let severityCount = 0;
    let energyTotal = 0;
    let sleepTotal = 0;
    let sleepCount = 0;

    monthlyLogs.forEach(log => {
      energyTotal += log.energy;
      if (log.sleep?.hours) {
        sleepTotal += log.sleep.hours;
        sleepCount += 1;
      }
      log.symptoms.forEach(symptom => {
        symptomCounts.set(symptom.name, (symptomCounts.get(symptom.name) ?? 0) + 1);
        severityTotal += symptom.severity;
        severityCount += 1;
      });
    });

    const [mostCommonSymptom = 'None logged yet', mostCommonCount = 0] =
      [...symptomCounts.entries()].sort((a, b) => b[1] - a[1])[0] ?? [];

    return {
      count: monthlyLogs.length,
      mostCommonSymptom,
      mostCommonCount,
      averageSeverity: severityCount ? (severityTotal / severityCount).toFixed(1) : '0.0',
      averageEnergy: monthlyLogs.length ? (energyTotal / monthlyLogs.length).toFixed(1) : '0.0',
      averageSleep: sleepCount ? (sleepTotal / sleepCount).toFixed(1) : '0.0',
    };
  }, [symptomLogs]);

  const buildLocalLetter = () => {
    const stage = currentUser?.lifeStage?.replace('-', ' ') ?? 'this stage';
    return `${nickname}, your ${monthName} logs show ${monthStats.count} check-ins, with ${monthStats.mostCommonSymptom.toLowerCase()} appearing most often. Your average symptom severity is ${monthStats.averageSeverity}/5, while your energy averaged ${monthStats.averageEnergy}/10 and sleep averaged ${monthStats.averageSleep} hours.

The pattern worth noticing is how your symptoms, energy, and sleep move together. When one changes, the others can help explain what your body may be asking for, especially when you bring these notes into a care conversation.

In the ${stage} chapter, paying attention to repeated signals is powerful. You are building a record that can make your body feel less random and more understandable. Keep going gently; the pattern is becoming clearer.`;
  };

  const saveLetter = (text: string) => {
    localStorage.setItem(cacheKey, JSON.stringify(text));
    setLetter(text);
  };

  const downloadLetter = () => {
    const text = letter || buildLocalLetter();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bloom-${format(now, 'yyyy-MM')}-letter.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    if (!letter) saveLetter(text);
  };

  const generateLetter = async () => {
    if (!currentUser) return;
    setLoading(true);
    setError('');

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        saveLetter(buildLocalLetter());
        return;
      }

      const prompt = `You are Bloom, a women's health companion. Write a warm, personal monthly health brief for ${nickname}, a ${currentUser.age}-year-old in the ${currentUser.lifeStage} life stage.

Her symptom data this month:
- Total logs: ${monthStats.count}
- Most common symptom: ${monthStats.mostCommonSymptom} (${monthStats.mostCommonCount} times)
- Average severity: ${monthStats.averageSeverity}/5
- Average energy: ${monthStats.averageEnergy}/10
- Average sleep: ${monthStats.averageSleep} hours

Write exactly 3 short paragraphs:
1. What her body has been doing this month, warm and specific to her data
2. One pattern worth noting, or if data looks balanced, affirm that
3. One encouraging insight about her life stage (${currentUser.lifeStage})

Tone: like a knowledgeable friend who completely believes her. No diagnosis. End with one sentence of encouragement. Keep total response under 200 words.`;

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      saveLetter(result.response.text().trim());
    } catch (err) {
      console.error('[BloomLetter]', err);
      saveLetter(buildLocalLetter());
      setError('Generated an offline letter because Bloom AI was unavailable.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold font-[var(--font-display)] gradient-text">
          Your {monthName} Letter from Bloom
        </h2>
        <p className="text-xs text-warm-400 mt-1">A gentle monthly reflection from your recent logs.</p>
      </div>

      {letter ? (
        <>
          <p className="text-warm-600 leading-relaxed text-sm whitespace-pre-wrap">{letter}</p>
          <p className="italic text-warm-400 text-sm">From Bloom, with care</p>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-bloom text-sm flex items-center gap-2" onClick={downloadLetter}>
              <Download size={16} /> Download letter
            </button>
            <button type="button" className="text-sm text-bloom-500 font-medium" onClick={generateLetter} disabled={loading}>
              {loading ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
          {error && <p className="text-xs text-warm-400">{error}</p>}
        </>
      ) : (
        <div className="space-y-3">
          {error && <p className="text-warm-600 leading-relaxed text-sm">{error}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="btn-bloom" onClick={generateLetter} disabled={loading || !currentUser}>
              {loading ? 'Writing your letter...' : `Generate your ${monthName} letter`}
            </button>
            <button type="button" className="text-sm text-bloom-500 font-medium flex items-center gap-2" onClick={downloadLetter} disabled={!currentUser}>
              <Download size={16} /> Download
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
