import { GoogleGenerativeAI } from '@google/generative-ai';
import { format, addDays, parseISO, subDays } from 'date-fns';
import type { User, UserProfile, SymptomLog, PatternAlert, BodyForecast, DayForecast } from '../types';
import { buildSystemPrompt } from '../lib/buildSystemPrompt';

function getNextWeekDates(): { weekStart: string; weekEnd: string; dates: string[] } {
  const today = new Date();
  const dates: string[] = [];
  for (let i = 0; i < 7; i++) {
    dates.push(format(addDays(today, i), 'yyyy-MM-dd'));
  }
  return { weekStart: dates[0], weekEnd: dates[6], dates };
}

function compute90DayStats(logs: SymptomLog[]) {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const symptomFreq = new Map<string, { count: number; totalSev: number }>();
  let energySum = 0;
  let energyCount = 0;
  let sleepSum = 0;
  let sleepCount = 0;

  sorted.forEach(log => {
    log.symptoms.forEach(s => {
      const e = symptomFreq.get(s.name) || { count: 0, totalSev: 0 };
      e.count++;
      e.totalSev += s.severity;
      symptomFreq.set(s.name, e);
    });
    energySum += log.energy;
    energyCount++;
    if (log.sleep?.hours) {
      sleepSum += log.sleep.hours;
      sleepCount++;
    }
  });

  const total = sorted.length;
  const topSymptoms = [...symptomFreq.entries()]
    .map(([name, d]) => ({
      name,
      frequency: d.count / total,
      avgSeverity: +(d.totalSev / d.count).toFixed(1),
    }))
    .sort((a, b) => b.frequency - a.frequency);

  return {
    totalLogs: total,
    topSymptoms: topSymptoms.slice(0, 10),
    avgEnergy: energyCount ? +(energySum / energyCount).toFixed(1) : 5,
    avgSleep: sleepCount ? +(sleepSum / sleepCount).toFixed(1) : 7,
    dateRange: sorted.length > 0
      ? { start: sorted[0].date, end: sorted[sorted.length - 1].date }
      : { start: '', end: '' },
  };
}

function computeRecentTrend(logs: SymptomLog[]): { direction: 'improving' | 'worsening' | 'stable'; key: string } {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const recent = sorted.slice(-7);
  const prior = sorted.slice(-14, -7);
  if (recent.length < 3) return { direction: 'stable', key: 'Not enough recent data to determine trend.' };

  const recentAvgSev = recent.flatMap(l => l.symptoms).reduce((a, s) => a + s.severity, 0) / Math.max(recent.flatMap(l => l.symptoms).length, 1);
  const priorAvgSev = prior.flatMap(l => l.symptoms).reduce((a, s) => a + s.severity, 0) / Math.max(prior.flatMap(l => l.symptoms).length, 1);

  const recentEnergy = recent.reduce((a, l) => a + l.energy, 0) / recent.length;
  const priorEnergy = prior.reduce((a, l) => a + l.energy, 0) / Math.max(prior.length, 1);

  if (recentAvgSev > priorAvgSev + 0.5 && recentEnergy < priorEnergy - 0.5) {
    return { direction: 'worsening', key: `Symptoms increasing (${recentAvgSev.toFixed(1)} vs ${priorAvgSev.toFixed(1)}) and energy dropping (${recentEnergy.toFixed(1)} vs ${priorEnergy.toFixed(1)}).` };
  }
  if (recentAvgSev < priorAvgSev - 0.5 && recentEnergy > priorEnergy + 0.5) {
    return { direction: 'improving', key: `Symptoms decreasing and energy rising.` };
  }
  return { direction: 'stable', key: `Symptoms and energy are relatively stable.` };
}

function computeCyclePhase(logs: SymptomLog[], cycleLength: number): string {
  const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const lastLog = sorted[sorted.length - 1];
  if (!lastLog || lastLog.cycleDay == null) return 'Not applicable (no cycle data)';
  const day = lastLog.cycleDay;
  if (day <= cycleLength * 0.14) return `Menstrual phase (cycle day ${day})`;
  if (day <= cycleLength * 0.35) return `Follicular phase (cycle day ${day})`;
  if (day <= cycleLength * 0.50) return `Ovulatory phase (cycle day ${day})`;
  return `Luteal phase (cycle day ${day})`;
}

function findCoOccurrences(logs: SymptomLog[]): string {
  const pairs = new Map<string, number>();
  let totalWithMulti = 0;
  logs.forEach(log => {
    const names = log.symptoms.map(s => s.name);
    if (names.length < 2) return;
    totalWithMulti++;
    for (let i = 0; i < names.length; i++) {
      for (let j = i + 1; j < names.length; j++) {
        const key = [names[i], names[j]].sort().join(' + ');
        pairs.set(key, (pairs.get(key) || 0) + 1);
      }
    }
  });
  if (totalWithMulti === 0) return 'No symptom co-occurrence data.';
  const top = [...pairs.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([pair, count]) => `${pair} (${(count / totalWithMulti * 100).toFixed(0)}% of multi-symptom days)`)
    .join('; ');
  return top || 'No significant co-occurrence patterns.';
}

function buildForecastPrompt(
  user: User,
  profile: UserProfile | null,
  logs: SymptomLog[],
  patterns: PatternAlert[],
): string {
  const stats = compute90DayStats(logs);
  const trend = computeRecentTrend(logs);
  const cyclePhase = computeCyclePhase(logs, user.cycleLength || 28);
  const coOccurrences = findCoOccurrences(logs);
  const { weekStart, weekEnd } = getNextWeekDates();

  const topSymptomsText = stats.topSymptoms.map(s =>
    `${s.name}: ${(s.frequency * 100).toFixed(0)}% frequency, avg severity ${s.avgSeverity}/5`
  ).join('\n');

  const patternsText = patterns.filter(p => !p.isRead).slice(0, 3).map(p =>
    `${p.title}: ${p.description} (${(p.confidence * 100).toFixed(0)}% confidence)`
  ).join('\n');

  return `You are Bloom's forecasting engine. Given a user's health data, predict their next 7 days.

USER PROFILE:
- Name: ${profile?.nickname || user.name}
- Age: ${user.age}
- Life stage: ${user.lifeStage}
- Diagnosed conditions: ${profile?.diagnosedConditions?.join(', ') || 'None'}
- Cycle length: ${user.cycleLength} days

90-DAY DATA SUMMARY (${stats.dateRange.start} to ${stats.dateRange.end}):
- Total logs: ${stats.totalLogs}
- Average energy: ${stats.avgEnergy}/10
- Average sleep: ${stats.avgSleep} hours

TOP SYMPTOMS (by frequency):
${topSymptomsText}

SYMPTOM CO-OCCURRENCE:
${coOccurrences}

CURRENT CYCLE PHASE:
${cyclePhase}

RECENT TREND (last 14 days):
${trend.key}

DETECTED PATTERNS:
${patternsText || 'No significant patterns detected yet.'}

PREDICTION PERIOD: ${weekStart} (Monday) to ${weekEnd} (Sunday)

Respond ONLY with a valid JSON object (no markdown, no code fences):
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "dayName": "Monday",
      "riskLevel": "low|moderate|high|severe",
      "predictedSymptoms": [
        {"name": "Symptom Name", "probability": 0.0-1.0}
      ],
      "energyPrediction": 0-10,
      "confidence": 0.0-1.0,
      "recommendation": "Actionable tip for this day"
    }
  ],
  "overallWarning": "Single sentence with key warning (e.g. '85% chance of severe brain fog and fatigue on Thursday and Friday')",
  "keyRecommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3"]
}

Rules:
- Never diagnose — use probabilistic language
- Probability values must be between 0.0 and 1.0
- Energy predictions must be between 0 and 10
- Max 5 predicted symptoms per day
- riskLevel: low = minimal symptoms, moderate = some symptoms likely, high = significant symptoms likely, severe = debilitating symptoms likely
- Base predictions on the actual data patterns provided, not generic assumptions
- Consider cycle phase correlations in predictions
- Reflect the recent trend direction in the forecast`;
}

function generateLocalForecast(
  user: User,
  logs: SymptomLog[],
): BodyForecast {
  const stats = compute90DayStats(logs);
  const trend = computeRecentTrend(logs);
  const { weekStart, weekEnd, dates } = getNextWeekDates();
  const today = new Date();
  const last7Days = logs.filter(l => {
    const d = parseISO(l.date);
    return d >= subDays(today, 7) && d <= today;
  });

  const days: DayForecast[] = dates.map((date, i) => {
    const dayOfWeek = format(parseISO(date), 'EEEE');
    const isWeekend = dayOfWeek === 'Saturday' || dayOfWeek === 'Sunday';

    const predictedSymptoms: { name: string; probability: number }[] = [];
    let baseEnergy = stats.avgEnergy;

    stats.topSymptoms.forEach(s => {
      if (s.frequency > 0.2) {
        let prob = s.frequency;
        if (trend.direction === 'worsening') prob = Math.min(1, prob * 1.2);
        if (isWeekend) prob = Math.max(0.1, prob * 0.85);

        if (s.avgSeverity >= 3) prob = Math.min(1, prob * 1.15);

        const recentSame = last7Days.filter(l =>
          l.symptoms.some(sx => sx.name.toLowerCase() === s.name.toLowerCase())
        );
        if (recentSame.length >= 3) prob = Math.min(1, prob * 1.1);

        predictedSymptoms.push({ name: s.name, probability: +prob.toFixed(2) });
      }
    });

    const sortedSymptoms = predictedSymptoms.sort((a, b) => b.probability - a.probability);

    const symptomRisk = sortedSymptoms.reduce((max, s) => {
      if (s.probability >= 0.7) return 3;
      if (s.probability >= 0.4) return Math.max(max, 2);
      if (s.probability >= 0.2) return Math.max(max, 1);
      return max;
    }, 0);

    const riskLevel: DayForecast['riskLevel'] =
      symptomRisk >= 3 ? 'high' :
      symptomRisk >= 2 ? 'moderate' :
      symptomRisk >= 1 ? 'low' : 'low';

    if (trend.direction === 'worsening') {
      baseEnergy = Math.max(0, baseEnergy - (isWeekend ? 0.5 : 1));
    }
    if (trend.direction === 'improving') {
      baseEnergy = Math.min(10, baseEnergy + 0.5);
    }

    const highProbSymptoms = sortedSymptoms.filter(s => s.probability >= 0.5);
    const recommendation = highProbSymptoms.length > 0
      ? `Plan for ${highProbSymptoms.slice(0, 2).map(s => s.name.toLowerCase()).join(' and ')}. Consider light activities.`
      : 'A good day to be productive.';

    return {
      date,
      dayName: dayOfWeek,
      riskLevel,
      predictedSymptoms: sortedSymptoms.slice(0, 5),
      energyPrediction: Math.round(baseEnergy),
      confidence: +Math.min(0.7, 0.3 + stats.totalLogs / 180).toFixed(2),
      recommendation,
    };
  });

  const maxRisk = days.reduce((max, d) => {
    const order = ['low', 'moderate', 'high', 'severe'];
    return order.indexOf(d.riskLevel) > order.indexOf(max) ? d.riskLevel : max;
  }, 'low' as DayForecast['riskLevel']);

  const highRiskDays = days.filter(d => d.riskLevel === 'high' || d.riskLevel === 'severe');
  const overallWarning = highRiskDays.length > 0
    ? `${Math.round(highRiskDays[0].predictedSymptoms[0]?.probability * 100 || 60)}% chance of ${highRiskDays[0].predictedSymptoms.slice(0, 2).map(s => s.name.toLowerCase()).join(' and ')} on ${highRiskDays.map(d => d.dayName).join(' and ')}.`
    : `Generally calm week ahead with ${stats.avgEnergy}/10 average energy predicted.`;

  const keyRecommendations: string[] = [];
  if (highRiskDays.length > 0) {
    keyRecommendations.push(`Schedule important activities on ${days.filter(d => d.riskLevel === 'low' || d.riskLevel === 'moderate').map(d => d.dayName).slice(0, 2).join(' and ') || 'better days'}.`);
    keyRecommendations.push(`Prepare for lower energy on ${highRiskDays.map(d => d.dayName).join(' and ')}.`);
  } else {
    keyRecommendations.push(`Maintain your current routine — pattern looks stable.`);
    keyRecommendations.push(`Keep tracking daily to improve forecast accuracy.`);
  }
  if (stats.avgSleep < 6.5) keyRecommendations.push('Prioritize sleep this week — your average is below optimal.');

  return {
    id: `forecast-local-${user.id}-${Date.now()}`,
    userId: user.id,
    generatedAt: new Date().toISOString(),
    weekStart,
    weekEnd,
    days,
    overallWarning,
    keyRecommendations,
    disclaimer: 'This is an algorithmic prediction based on your tracked patterns, not medical advice. Always consult a healthcare professional.',
  };
}

export async function generateBodyForecast(
  user: User,
  profile: UserProfile | null,
  logs: SymptomLog[],
  patterns: PatternAlert[],
): Promise<BodyForecast> {
  const { weekStart, weekEnd } = getNextWeekDates();

  if (logs.length < 14) {
    return {
      id: `forecast-empty-${user.id}-${Date.now()}`,
      userId: user.id,
      generatedAt: new Date().toISOString(),
      weekStart,
      weekEnd,
      days: [],
      overallWarning: 'Not enough data yet — keep logging symptoms daily to unlock your Body Forecast.',
      keyRecommendations: ['Log symptoms daily to reach 14+ days of data'],
      disclaimer: 'More data needed for accurate predictions.',
    };
  }

  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (geminiKey) {
    try {
      const prompt = buildForecastPrompt(user, profile, logs, patterns);
      const genAI = new GoogleGenerativeAI(geminiKey);
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: 'You are Bloom, a women\'s health forecasting AI. You analyze patterns and predict symptoms. Never diagnose. Always respond with valid JSON only.',
      });

      const result = await model.generateContent(prompt);
      const text = result.response.text().trim();

      let cleaned = text;
      if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/```(json)?\s*/g, '').trim();
      }

      const parsed = JSON.parse(cleaned);

      return {
        id: `forecast-ai-${user.id}-${Date.now()}`,
        userId: user.id,
        generatedAt: new Date().toISOString(),
        weekStart,
        weekEnd,
        days: parsed.days || [],
        overallWarning: parsed.overallWarning || 'Prediction generated.',
        keyRecommendations: parsed.keyRecommendations || [],
        disclaimer: 'This is an AI prediction based on your tracked patterns, not medical advice. Always consult a healthcare professional.',
      };
    } catch (err) {
      console.error('[bodyForecastEngine] Gemini failed, falling back to local:', err);
      return generateLocalForecast(user, logs);
    }
  }

  return generateLocalForecast(user, logs);
}

export { generateLocalForecast, buildForecastPrompt, compute90DayStats };
