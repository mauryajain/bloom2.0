import { useMemo, useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { useBloomStore } from '../../store/useBloomStore';
import { getGeminiKey } from '../../lib/geminiKeyManager';

const stageInsight: Record<string, string> = {
  puberty: 'For puberty, the most useful thing is separating what is common in early cycles from what is disruptive enough to deserve support.',
  reproductive: 'In the reproductive years, timing matters: where symptoms land in the cycle can make doctor conversations much sharper.',
  pregnancy: 'During pregnancy, small changes can feel loud; tracking helps you bring specifics to prenatal care instead of relying on memory.',
  postpartum: 'Postpartum recovery is not just about the baby; sleep, mood, pelvic comfort, feeding, and pain all belong in your care story.',
  perimenopause: 'In perimenopause, symptoms can look scattered until sleep, temperature, mood, focus, and cycle changes are viewed together.',
  menopause: 'In menopause, symptom relief and prevention can sit side by side: sleep, hot flashes, vaginal health, bones, and heart health all count.',
  'post-menopause': 'After menopause, your notes can support prevention and comfort: urinary, joint, sleep, heart, bone, and energy changes are worth naming.',
};

const joinList = (items: string[]) => {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
};

export default function BloomLetter() {
  const { currentUser, userProfile, symptomLogs, patterns, doctorPrep, isDemoMode } = useBloomStore();
  const now = new Date();
  const monthName = format(now, 'MMMM');
  const cacheKey = `bloom_letter_v2_${format(now, 'yyyy_MM')}_${currentUser?.id ?? 'guest'}`;
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
    const noteSamples: string[] = [];
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
      if (log.notes && noteSamples.length < 3) noteSamples.push(log.notes);
      log.symptoms.forEach(symptom => {
        symptomCounts.set(symptom.name, (symptomCounts.get(symptom.name) ?? 0) + 1);
        severityTotal += symptom.severity;
        severityCount += 1;
      });
    });

    const topSymptoms = [...symptomCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name, count]) => ({ name, count }));
    const mostCommonSymptom = topSymptoms[0]?.name ?? 'None logged yet';
    const mostCommonCount = topSymptoms[0]?.count ?? 0;

    return {
      count: monthlyLogs.length,
      topSymptoms,
      mostCommonSymptom,
      mostCommonCount,
      averageSeverity: severityCount ? (severityTotal / severityCount).toFixed(1) : '0.0',
      averageEnergy: monthlyLogs.length ? (energyTotal / monthlyLogs.length).toFixed(1) : '0.0',
      averageSleep: sleepCount ? (sleepTotal / sleepCount).toFixed(1) : '0.0',
      noteSamples,
    };
  }, [symptomLogs]);

  const letterContext = useMemo(() => {
    const strongestPattern = [...patterns].sort((a, b) => b.confidence - a.confidence)[0];
    const goals = userProfile?.goals?.slice(0, 2) ?? [];
    const questions = doctorPrep?.questions?.slice(0, 2) ?? [];
    const conditions = [
      ...(userProfile?.diagnosedConditions ?? []),
      ...(strongestPattern?.conditionsFlagged ?? []),
    ].filter(Boolean).slice(0, 3);

    return { strongestPattern, goals, questions, conditions };
  }, [doctorPrep, patterns, userProfile]);

  const buildLocalLetter = () => {
    const stage = currentUser?.lifeStage ?? 'reproductive';
    const topSymptoms = monthStats.topSymptoms.length > 0
      ? monthStats.topSymptoms.map(symptom => `${symptom.name} (${symptom.count}x)`).join(', ')
      : doctorPrep?.topSymptoms.slice(0, 3).map(symptom => symptom.name).join(', ') || 'your tracked symptoms';
    const pattern = letterContext.strongestPattern;
    const goals = joinList(letterContext.goals);
    const questions = joinList(letterContext.questions);
    const conditions = joinList(letterContext.conditions);
    const note = monthStats.noteSamples[0] ? ` One note that stands out: "${monthStats.noteSamples[0]}".` : '';

    return `${nickname}, your ${monthName} letter is built from your actual ${stage.replace('-', ' ')} profile. You logged ${monthStats.count} check-ins this month. The clearest symptoms in your record are ${topSymptoms}, with average severity at ${monthStats.averageSeverity}/5, energy at ${monthStats.averageEnergy}/10, and sleep around ${monthStats.averageSleep} hours.${note}

The pattern Bloom would carry into your next care conversation is ${pattern ? pattern.title.toLowerCase() : `${monthStats.mostCommonSymptom.toLowerCase()} repeating enough to watch`}. ${pattern ? pattern.description : 'Your symptoms, energy, mood, and sleep are starting to form a more useful picture together.'}${conditions ? ` This connects most closely with: ${conditions}.` : ''}${goals ? ` That fits your goals to ${goals}.` : ''}

${stageInsight[stage] ?? stageInsight.reproductive} ${questions ? `Two questions worth keeping close are: ${questions}.` : 'The next best step is to keep logging the moments that affect daily life, sleep, school, work, intimacy, or confidence.'}

You are not being dramatic by paying attention. You are building evidence, language, and self-trust, one entry at a time.`;
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
      const apiKey = getGeminiKey();
      if (!apiKey) {
        saveLetter(buildLocalLetter());
        return;
      }

      const prompt = `You are Bloom, a women's health companion. Write a warm, deeply personalised monthly health brief for ${nickname}, a ${currentUser.age}-year-old in the ${currentUser.lifeStage} life stage.

Her actual profile and data:
- Total logs this month: ${monthStats.count}
- Top symptoms: ${monthStats.topSymptoms.map(symptom => `${symptom.name} (${symptom.count}x)`).join(', ') || 'none logged this month'}
- Most common symptom: ${monthStats.mostCommonSymptom} (${monthStats.mostCommonCount} times)
- Average severity: ${monthStats.averageSeverity}/5
- Average energy: ${monthStats.averageEnergy}/10
- Average sleep: ${monthStats.averageSleep} hours
- Profile goals: ${letterContext.goals.join(', ') || 'not specified'}
- Diagnosed/flagged conditions or concerns: ${letterContext.conditions.join(', ') || 'none specified'}
- Strongest detected pattern: ${letterContext.strongestPattern ? `${letterContext.strongestPattern.title}: ${letterContext.strongestPattern.description}` : 'none yet'}
- Doctor-prep questions: ${letterContext.questions.join(' | ') || 'none yet'}
- Recent notes from logs: ${monthStats.noteSamples.join(' | ') || 'none'}

Write exactly 3 short paragraphs:
1. What her body has been doing this month, using exact symptoms and stats
2. One pattern worth noting, connected to her goals or doctor-prep questions
3. One encouraging insight about her life stage (${currentUser.lifeStage}), without sounding generic

Tone: like a knowledgeable friend who completely believes her. No diagnosis. Do not use generic wellness phrases. Keep total response under 220 words.`;

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
    <div
      className="p-6 space-y-4"
      style={{ background: 'var(--bloom-surface)', border: '1px solid var(--bloom-border)', borderRadius: 20 }}
    >
      <div>
        <h2
          className="text-xl font-bold font-[var(--font-display)]"
          style={{ color: 'var(--bloom-glow)' }}
        >
          Your {monthName} Letter from Bloom
        </h2>
        <p className="text-xs mt-1" style={{ color: 'var(--bloom-muted)' }}>A personal reflection built from your symptoms, patterns, goals, and care questions.</p>
      </div>

      {letter ? (
        <>
          <p className="leading-relaxed text-sm whitespace-pre-wrap" style={{ color: 'var(--bloom-text)' }}>{letter}</p>
          <p className="italic text-sm" style={{ color: 'var(--bloom-muted)' }}>From Bloom, with care</p>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="text-sm flex items-center gap-2 px-4 py-2.5 font-medium"
              style={{ background: 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', color: 'white', borderRadius: 14 }}
              onClick={downloadLetter}
            >
              <Download size={16} /> Download letter
            </button>
            <button
              type="button"
              className="text-sm font-medium"
              style={{ color: 'var(--bloom-glow)' }}
              onClick={generateLetter}
              disabled={loading}
            >
              {loading ? 'Regenerating...' : 'Regenerate'}
            </button>
          </div>
          {isDemoMode && <p className="text-xs" style={{ color: 'var(--bloom-muted)' }}>Tailored from this demo profile's symptoms, patterns, goals, and doctor-prep report.</p>}
          {error && <p className="text-xs" style={{ color: 'var(--bloom-muted)' }}>{error}</p>}
        </>
      ) : (
        <div className="space-y-3">
          {error && <p className="leading-relaxed text-sm" style={{ color: 'var(--bloom-text)' }}>{error}</p>}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="px-5 py-2.5 font-medium"
              style={{ background: 'linear-gradient(135deg, var(--bloom-glow), var(--bloom-rose))', color: 'white', borderRadius: 14 }}
              onClick={generateLetter}
              disabled={loading || !currentUser}
            >
              {loading ? 'Writing your letter...' : `Generate your ${monthName} letter`}
            </button>
            <button
              type="button"
              className="text-sm font-medium flex items-center gap-2"
              style={{ color: 'var(--bloom-glow)' }}
              onClick={downloadLetter}
              disabled={!currentUser}
            >
              <Download size={16} /> Download
            </button>
          </div>
          {isDemoMode && <p className="text-xs" style={{ color: 'var(--bloom-muted)' }}>Demo letters use the selected profile's symptoms, patterns, goals, and doctor-prep report.</p>}
        </div>
      )}
    </div>
  );
}
