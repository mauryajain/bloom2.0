// ============================================================
// BLOOM — AI Symptom Extractor
// Sends natural-language voice transcript to Gemini to extract
// structured symptom data for automatic logging
// ============================================================

import { GoogleGenerativeAI } from '@google/generative-ai';
import { SymptomEntry, Severity, SymptomCategory } from '../types';
import { getGeminiKey } from '../lib/geminiKeyManager';

export interface ExtractedSymptomData {
  symptoms: {
    name: string;
    category: SymptomCategory;
    severity: Severity;
    location?: string;
  }[];
  mood: string | null;
  energy: number;      // 1–10
  sleepHours: number | null;
  notes: string;
}

// Known symptom presets so the AI can match them
const KNOWN_SYMPTOMS = [
  'Cramps', 'Headache', 'Pelvic Pain', 'Lower Back Pain',
  'Bloating', 'Nausea', 'Fatigue', 'Brain Fog',
  'Mood Swings', 'Anxiety', 'Irritability', 'Insomnia',
  'Hot Flash', 'Night Sweats', 'Breast Tenderness',
  'Acne', 'Joint Pain', 'Dizziness',
];

const KNOWN_MOODS = ['Happy', 'Calm', 'Anxious', 'Sad', 'Irritable', 'Overwhelmed', 'Content', 'Energetic'];

const EXTRACTION_PROMPT = `You are a medical data extraction AI for a women's health app called Bloom.

The user just described how they feel using their voice. Extract structured data from their natural language input.

RULES:
1. Match symptoms to these known names when possible: ${KNOWN_SYMPTOMS.join(', ')}
2. If a symptom doesn't match any known name, use a short descriptive name (2-3 words max).
3. Assign each symptom a category from: pain, mood, energy, digestive, sleep, reproductive, skin, cognitive, other
4. Severity is 1-5 scale: 1=Minimal, 2=Mild, 3=Moderate, 4=Severe, 5=Extreme
5. If the user mentions a number out of 10, convert: 1-2→1, 3-4→2, 5-6→3, 7-8→4, 9-10→5
6. Energy is 1-10 scale. Default to 5 if not mentioned.
7. Match mood to these options when possible: ${KNOWN_MOODS.join(', ')}
8. Extract sleep hours if mentioned, otherwise null.
9. Put any contextual notes (triggers, medication, food, etc.) in notes.

Respond ONLY with valid JSON matching this schema (no markdown, no code fences):
{
  "symptoms": [{"name": "string", "category": "string", "severity": 1, "location": "string or null"}],
  "mood": "string or null",
  "energy": 5,
  "sleepHours": null,
  "notes": "string"
}

USER SAID: `;

export async function extractSymptomsFromVoice(transcript: string): Promise<ExtractedSymptomData> {
  const geminiKey = getGeminiKey();

  if (!geminiKey) {
    // Fallback: basic keyword extraction if no Gemini key
    return fallbackExtraction(transcript);
  }

  try {
    const genAI = new GoogleGenerativeAI(geminiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const result = await model.generateContent(EXTRACTION_PROMPT + transcript);
    const text = result.response.text().trim();

    // Strip markdown code fences if Gemini wraps the response
    const cleaned = text.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/i, '').trim();

    const parsed = JSON.parse(cleaned) as ExtractedSymptomData;

    // Validate and clamp values
    return {
      symptoms: (parsed.symptoms || []).map(s => ({
        name: s.name || 'Unknown',
        category: validateCategory(s.category),
        severity: clampSeverity(s.severity),
        location: s.location || undefined,
      })),
      mood: parsed.mood || null,
      energy: Math.min(10, Math.max(1, parsed.energy || 5)),
      sleepHours: parsed.sleepHours ? Math.min(24, Math.max(0, parsed.sleepHours)) : null,
      notes: parsed.notes || '',
    };
  } catch (err) {
    console.error('[extractSymptomsFromVoice] Gemini extraction failed, using fallback:', err);
    return fallbackExtraction(transcript);
  }
}

// ---- Helpers ----

function clampSeverity(val: number): Severity {
  const n = Math.round(Math.min(5, Math.max(1, val || 3)));
  return n as Severity;
}

function validateCategory(cat: string): SymptomCategory {
  const valid: SymptomCategory[] = ['pain', 'mood', 'energy', 'digestive', 'sleep', 'reproductive', 'skin', 'cognitive', 'other'];
  return valid.includes(cat as SymptomCategory) ? (cat as SymptomCategory) : 'other';
}

// ---- Fallback extraction without AI ----

function fallbackExtraction(transcript: string): ExtractedSymptomData {
  const lower = transcript.toLowerCase();
  const symptoms: ExtractedSymptomData['symptoms'] = [];

  const keywordMap: Record<string, { category: SymptomCategory; name: string }> = {
    'cramp': { category: 'pain', name: 'Cramps' },
    'headache': { category: 'pain', name: 'Headache' },
    'pelvic': { category: 'pain', name: 'Pelvic Pain' },
    'back pain': { category: 'pain', name: 'Lower Back Pain' },
    'bloat': { category: 'digestive', name: 'Bloating' },
    'nausea': { category: 'digestive', name: 'Nausea' },
    'nauseous': { category: 'digestive', name: 'Nausea' },
    'fatigue': { category: 'energy', name: 'Fatigue' },
    'exhausted': { category: 'energy', name: 'Fatigue' },
    'tired': { category: 'energy', name: 'Fatigue' },
    'brain fog': { category: 'cognitive', name: 'Brain Fog' },
    'foggy': { category: 'cognitive', name: 'Brain Fog' },
    'mood swing': { category: 'mood', name: 'Mood Swings' },
    'anxious': { category: 'mood', name: 'Anxiety' },
    'anxiety': { category: 'mood', name: 'Anxiety' },
    'irritable': { category: 'mood', name: 'Irritability' },
    'insomnia': { category: 'sleep', name: 'Insomnia' },
    'hot flash': { category: 'other', name: 'Hot Flash' },
    'night sweat': { category: 'sleep', name: 'Night Sweats' },
    'dizzy': { category: 'other', name: 'Dizziness' },
    'dizziness': { category: 'other', name: 'Dizziness' },
    'joint pain': { category: 'pain', name: 'Joint Pain' },
    'acne': { category: 'skin', name: 'Acne' },
  };

  // Detect severity from numbers
  let detectedSeverity: Severity = 3;
  const severityMatch = lower.match(/(\d+)\s*(?:out of\s*)?(?:\/\s*)?10/);
  if (severityMatch) {
    const n = parseInt(severityMatch[1]);
    if (n <= 2) detectedSeverity = 1;
    else if (n <= 4) detectedSeverity = 2;
    else if (n <= 6) detectedSeverity = 3;
    else if (n <= 8) detectedSeverity = 4;
    else detectedSeverity = 5;
  }

  for (const [keyword, data] of Object.entries(keywordMap)) {
    if (lower.includes(keyword)) {
      symptoms.push({
        name: data.name,
        category: data.category,
        severity: detectedSeverity,
      });
    }
  }

  // Detect energy
  let energy = 5;
  if (lower.includes('exhausted') || lower.includes('no energy') || lower.includes('drained')) energy = 2;
  else if (lower.includes('low energy') || lower.includes('tired')) energy = 3;
  else if (lower.includes('good energy') || lower.includes('energetic')) energy = 8;

  // Detect mood
  let mood: string | null = null;
  if (lower.includes('happy') || lower.includes('good')) mood = 'Happy';
  else if (lower.includes('sad') || lower.includes('down') || lower.includes('depressed')) mood = 'Sad';
  else if (lower.includes('anxious') || lower.includes('worried') || lower.includes('nervous')) mood = 'Anxious';
  else if (lower.includes('irritable') || lower.includes('angry') || lower.includes('frustrated')) mood = 'Irritable';
  else if (lower.includes('overwhelmed') || lower.includes('stressed')) mood = 'Overwhelmed';

  // If no symptoms detected, add a generic one
  if (symptoms.length === 0) {
    symptoms.push({
      name: 'General Discomfort',
      category: 'other',
      severity: detectedSeverity,
    });
  }

  return {
    symptoms,
    mood,
    energy,
    sleepHours: null,
    notes: transcript,
  };
}
