// ============================================================
// BLOOM — AI Engine (updated)
// Real Edge Function call + fixed emergency keyword list
// ============================================================

import { SymptomLog, PatternAlert, AskBloomMessage } from '../types';
import { conditionLibrary } from '../data/conditions';
import { supabase } from '../lib/supabase';

// ---- Emergency Detection (expanded keyword list) ----
const EMERGENCY_KEYWORDS = [
  'chest pain', "can't breathe", 'cannot breathe', 'difficulty breathing',
  'severe bleeding', "can't stop bleeding", 'cannot stop bleeding',
  'fainting', 'passed out', 'loss of consciousness',
  'suicidal', 'want to die', 'want to hurt myself', 'want to kill myself',
  'self-harm', 'self harm', 'unresponsive', 'seizure',
  'sudden severe headache', 'worst headache of my life',
  'vision loss', 'sudden vision', 'miscarriage', 'ectopic',
  'overdose', 'stroke', 'heart attack', 'not breathing',
];

export function checkEmergencySymptoms(symptoms: string[]): { isEmergency: boolean; message: string } | null {
  const combined = symptoms.join(' ').toLowerCase();
  const found = EMERGENCY_KEYWORDS.some(kw => combined.includes(kw));
  if (!found) return null;
  return {
    isEmergency: true,
    message: `🚨 **This sounds like a medical emergency.**\n\nPlease contact emergency services immediately:\n- **India:** Call **102** (ambulance) or **112** (emergency)\n- **USA/Canada:** Call **911**\n- **UK:** Call **999**\n\nIf you are having thoughts of self-harm, please call:\n- **iCall India:** 9152987821\n- **Vandrevala Foundation:** 1860-2662-345 (24/7)\n\nPlease seek help immediately. 🙏`,
  };
}

// ---- Real AI call via Supabase Edge Function ----
export async function askBloomAI(userMessage: string): Promise<AskBloomMessage> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
      // Fallback to mock when Supabase is not configured
      return generateMockResponse(userMessage);
    }

    const res = await fetch(`${supabaseUrl}/functions/v1/ask-bloom`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userMessage }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error ?? `API error ${res.status}`);
    }

    const json = await res.json();
    return {
      id: `bloom-${Date.now()}`,
      role: 'assistant',
      content: json.response,
      timestamp: new Date().toISOString(),
      isEmergency: json.isEmergency,
      disclaimer: json.isEmergency ? undefined : 'This is not medical advice or diagnosis. Always consult a healthcare professional.',
    };
  } catch (err) {
    console.error('[askBloomAI]', err);
    throw err;
  }
}

// ---- Mock responses for demo/no-credentials mode ----
const MOCK_RESPONSES: Record<string, string> = {
  default: "I've looked at your symptom data and here's what I can share:\n\nBased on your recent logs, I notice some patterns that may be worth tracking. Remember, I'm here to help you understand your symptoms better, but I'm not a replacement for professional medical advice.\n\n**Questions to ask your doctor:**\n1. Are my symptom patterns consistent with any specific condition?\n2. What tests would you recommend based on my symptom history?\n3. Are there lifestyle changes that might help?\n4. When should I come back if symptoms don't improve?\n\n⚠️ *This is not medical advice or diagnosis.*",
  pain: "Looking at your pain-related symptoms:\n\n• **Frequency**: Pain symptoms appear regularly in your tracking data\n• **Pattern**: Severity tends to fluctuate with your cycle\n• **Associated symptoms**: Often co-occurs with fatigue and bloating\n\nRecurring cyclical pain is common, but severe pain that interferes with daily life deserves medical attention.\n\n**Questions to ask your doctor:**\n1. Could the severity of my pain indicate a condition beyond normal cramping?\n2. Would imaging help investigate the cause?\n3. What pain management options do you recommend?\n4. Are my symptoms consistent with endometriosis or fibroids?\n\n⚠️ *I'm not providing a diagnosis. Only a healthcare professional can evaluate your symptoms.*",
  fatigue: "Analyzing your energy and fatigue patterns:\n\n• **When it peaks**: More pronounced during certain cycle phases\n• **Sleep connection**: Low energy days correlate with poor sleep quality\n• **Possible factors**: Hormonal fluctuations, iron levels, thyroid function, sleep quality\n\n**Questions to ask your doctor:**\n1. Should I get blood work for iron levels and thyroid function?\n2. Is my fatigue pattern consistent with a hormonal issue?\n3. Are there supplements or lifestyle changes that might help?\n4. Could my fatigue be related to my menstrual cycle?\n\n⚠️ *This is pattern observation, not diagnosis.*",
};

function generateMockResponse(userMessage: string): AskBloomMessage {
  const msg = userMessage.toLowerCase();
  let key = 'default';
  if (msg.includes('pain') || msg.includes('cramp')) key = 'pain';
  else if (msg.includes('tired') || msg.includes('fatigue') || msg.includes('energy')) key = 'fatigue';
  return {
    id: `bloom-${Date.now()}`,
    role: 'assistant',
    content: MOCK_RESPONSES[key],
    timestamp: new Date().toISOString(),
    disclaimer: 'This is not medical advice. (Demo mode - personalised AI responses are unavailable.)',
  };
}

// ---- Pattern Detection Pipeline (unchanged logic) ----
export function detectPatterns(logs: SymptomLog[], userId: string): PatternAlert[] {
  if (logs.length < 21) return [];
  const alerts: PatternAlert[] = [];
  const symptomMap = new Map<string, { severity: number; count: number; dates: string[] }>();

  logs.forEach(log => {
    log.symptoms.forEach(s => {
      const existing = symptomMap.get(s.name) || { severity: 0, count: 0, dates: [] };
      existing.severity += s.severity;
      existing.count += 1;
      existing.dates.push(log.date);
      symptomMap.set(s.name, existing);
    });
  });

  symptomMap.forEach((d, name) => {
    const avgSeverity = d.severity / d.count;
    const frequency = d.count / logs.length;
    if (avgSeverity >= 3.5 && frequency >= 0.3) {
      const matched = conditionLibrary
        .filter(c => c.commonSymptoms.some(cs =>
          cs.toLowerCase().includes(name.toLowerCase()) ||
          name.toLowerCase().includes(cs.toLowerCase().split(' ')[0])
        ))
        .map(c => c.name)
        .slice(0, 3);
      if (matched.length > 0) {
        alerts.push({
          id: `detected-${Date.now()}-${name}`,
          userId,
          type: 'pattern',
          title: `Recurring ${name} Pattern Detected`,
          description: `${name} logged ${d.count} times over ${logs.length} days, avg severity ${avgSeverity.toFixed(1)}/5.`,
          pattern: `${name} at avg severity ${avgSeverity.toFixed(1)} appearing ${(frequency * 100).toFixed(0)}% of tracked days.`,
          conditionsFlagged: matched,
          confidence: Math.min(0.9, (frequency * avgSeverity) / 5),
          severity: avgSeverity >= 4 ? 'high' : avgSeverity >= 3 ? 'medium' : 'low',
          recommendation: `This pattern of ${name.toLowerCase()} may be worth discussing with a healthcare provider.`,
          dataPoints: d.count,
          dateRange: { start: logs[0].date, end: logs[logs.length - 1].date },
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    }
  });
  return alerts;
}

// Keep old sync function for demo mode compatibility
export function generateBloomResponse(userMessage: string, _logs: SymptomLog[]): AskBloomMessage {
  return generateMockResponse(userMessage);
}
