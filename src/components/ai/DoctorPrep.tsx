// ============================================================
// BLOOM — Doctor Visit Prep Report
// Agent 2 (AI Lead) + Agent 3 (UI/UX)
// ============================================================

import { useBloomStore } from '../../store/useBloomStore';
import { FileText, Download, Calendar, TrendingUp, MessageCircle, Clock, AlertCircle, ShieldCheck, Clipboard } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useMemo, useState } from 'react';

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const durationPatterns = [
  { pattern: /\bfor\s+(?:the\s+past\s+)?(\d+)\s*(day|days|week|weeks|month|months)\b/i, unitIndex: 2 },
  { pattern: /\b(\d+)\s*(day|days|week|weeks|month|months)\s+(?:straight|consecutive|in a row)\b/i, unitIndex: 2 },
];

const painLocationMap: Record<string, string> = {
  stomach: 'abdominal',
  belly: 'abdominal',
  tummy: 'abdominal',
  pelvis: 'pelvic',
  pelvic: 'pelvic',
  cramps: 'pelvic cramping',
  cramping: 'cramping',
  back: 'back',
  head: 'headache',
  migraine: 'migraine',
  breast: 'breast',
  chest: 'chest',
};

const symptomTerms: Record<string, string> = {
  dizzy: 'dizziness',
  faint: 'presyncope or faintness',
  bloated: 'abdominal bloating',
  nausea: 'nausea',
  nauseous: 'nausea',
  tired: 'fatigue',
  exhausted: 'fatigue',
  bleeding: 'bleeding',
  spotting: 'spotting',
  discharge: 'vaginal discharge',
  fever: 'fever',
  vomit: 'vomiting',
  vomiting: 'vomiting',
};

const medicationPatterns = [
  /\b(ibuprofen|advil|motrin|tylenol|acetaminophen|paracetamol|naproxen|aleve|midol|aspirin)\b/i,
  /\b(\d+\s?mg)\s+(ibuprofen|advil|motrin|tylenol|acetaminophen|paracetamol|naproxen|aleve|midol|aspirin)\b/i,
  /\b(ibuprofen|advil|motrin|tylenol|acetaminophen|paracetamol|naproxen|aleve|midol|aspirin)\s+(\d+\s?mg)\b/i,
];

const estimateSeverity = (text: string) => {
  const numeric = text.match(/\b(10|[1-9])\s*\/\s*10\b/);
  if (numeric) return `${numeric[1]}/10`;
  if (/\b(unbearable|worst|can't stand|cannot stand|excruciating)\b/i.test(text)) return '9/10';
  if (/\b(so bad|severe|intense|really bad)\b/i.test(text)) return '8/10';
  if (/\b(moderate|pretty bad)\b/i.test(text)) return '5-6/10';
  if (/\b(mild|slight|little)\b/i.test(text)) return '2-3/10';
  return 'not quantified';
};

const extractDuration = (text: string) => {
  for (const { pattern, unitIndex } of durationPatterns) {
    const match = text.match(pattern);
    if (match) return `${match[1]} ${match[unitIndex]}`;
  }
  if (/\ball week\b/i.test(text)) return 'approximately 1 week';
  if (/\btoday\b/i.test(text)) return 'less than 24 hours';
  if (/\byesterday\b/i.test(text)) return 'approximately 1 day';
  return 'duration not specified';
};

const extractLocationOrSymptom = (text: string) => {
  const lower = text.toLowerCase();
  const location = Object.entries(painLocationMap).find(([key]) => lower.includes(key));
  if (location) return location[1];
  const symptom = Object.entries(symptomTerms).find(([key]) => lower.includes(key));
  if (symptom) return symptom[1];
  if (/\bhurt|pain|ache|aching\b/i.test(text)) return 'pain';
  return 'symptoms';
};

const extractMedication = (text: string) => {
  for (const pattern of medicationPatterns) {
    const match = text.match(pattern);
    if (!match) continue;
    const dose = match.find(part => /\d+\s?mg/i.test(part));
    const medication = match.find(part => /ibuprofen|advil|motrin|tylenol|acetaminophen|paracetamol|naproxen|aleve|midol|aspirin/i.test(part));
    if (medication && dose) return `${dose.replace(/\s+/g, '')} ${medication}`;
    if (medication) return medication;
  }
  return '';
};

const buildClinicalTranslation = (input: string) => {
  const trimmed = input.trim();
  if (!trimmed) return '';

  const severity = estimateSeverity(trimmed);
  const duration = extractDuration(trimmed);
  const symptom = extractLocationOrSymptom(trimmed);
  const medication = extractMedication(trimmed);
  const unresponsive = /\b(doesn't do anything|does not do anything|not helping|no relief|unresponsive|doesn't help|does not help)\b/i.test(trimmed);
  const persistent = duration !== 'duration not specified' ? 'persistent ' : '';
  const acute = /\b(sudden|started|new|acute)\b/i.test(trimmed) || duration !== 'duration not specified' ? 'acute, ' : '';
  const painPhrase = symptom.includes('pain') || symptom.includes('cramping') || /\bhurt|pain|ache|aching|cramp/i.test(trimmed)
    ? `${acute}${persistent}${symptom.includes('pain') || symptom.includes('cramping') ? symptom : `${symptom} pain`}`
    : `${persistent}${symptom}`;

  const parts = [
    `Patient reports ${painPhrase}`,
    duration !== 'duration not specified' ? `for ${duration}` : '',
    severity !== 'not quantified' ? `with reported severity of ${severity} on the numeric pain scale` : 'with severity not yet quantified',
  ].filter(Boolean);

  let sentence = `${parts.join(', ')}.`;
  if (medication) {
    sentence += ` Symptoms are ${unresponsive ? 'unresponsive' : 'partially characterized in relation'} to ${medication}.`;
  } else {
    sentence += ' Medication response not specified.';
  }
  sentence += ' Recommend documenting associated symptoms, triggers, menstrual/cycle timing, and functional impact.';
  return sentence;
};

export default function DoctorPrep() {
  const { doctorPrep, currentUser, symptomLogs, refreshDoctorPrep } = useBloomStore();
  const [plainLanguage, setPlainLanguage] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    refreshDoctorPrep();
  }, [refreshDoctorPrep]);

  const latestSymptomNote = useMemo(() => (
    symptomLogs.find(log => log.notes.trim().length > 0)?.notes ?? ''
  ), [symptomLogs]);

  const clinicalTranslation = useMemo(
    () => buildClinicalTranslation(plainLanguage || latestSymptomNote),
    [plainLanguage, latestSymptomNote]
  );

  const handlePrint = () => {
    window.print();
  };

  const handleCopyTranslation = async () => {
    if (!clinicalTranslation) return;
    await navigator.clipboard.writeText(clinicalTranslation);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  const clinicalTranslatorPanel = (
    <div className="glass-card p-5 space-y-4 border-l-4 border-l-bloom-400">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-semibold flex items-center gap-2">
            <ShieldCheck size={18} className="text-bloom-500" /> Medical Gaslighting Shield
          </h2>
          <p className="text-sm text-warm-400 mt-1">
            Translate everyday symptom language into objective wording for your clinician.
          </p>
        </div>
        <button
          className="btn-bloom flex items-center gap-2 text-sm"
          onClick={handleCopyTranslation}
          disabled={!clinicalTranslation}
        >
          <Clipboard size={14} /> {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <textarea
        className="bloom-input min-h-24 resize-none"
        value={plainLanguage}
        onChange={(event) => setPlainLanguage(event.target.value)}
        placeholder={latestSymptomNote || 'Example: My stomach has been hurting so bad for a week and ibuprofen does not help.'}
      />
      <div className="rounded-xl bg-warm-50 border border-warm-100 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-warm-400 mb-2">Doctor-ready phrasing</p>
        <p className="text-sm text-warm-700 leading-relaxed">
          {clinicalTranslation || 'Enter a symptom description to generate clinical phrasing.'}
        </p>
      </div>
      <p className="text-xs text-warm-400">
        This does not diagnose you; it helps describe your experience clearly with duration, severity, medication response, and functional impact.
      </p>
    </div>
  );

  if (!doctorPrep) {
    const remainingLogs = Math.max(21 - symptomLogs.length, 0);

    return (
      <div className="space-y-6 max-w-4xl">
        {clinicalTranslatorPanel}
        <div className="text-center py-16">
          <FileText size={48} className="text-warm-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Report Available</h2>
          <p className="text-warm-400 text-sm">Log at least 3 weeks of symptoms to generate your report.</p>
          {remainingLogs > 0 && (
            <p className="text-xs text-warm-400 mt-2">
              {symptomLogs.length}/21 symptom logs recorded. {remainingLogs} more to go.
            </p>
          )}
        </div>
      </div>
    );
  }

  const generatedDate = new Date(doctorPrep.generatedAt);
  const nextUpdateDate = addDays(generatedDate, 15);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-[var(--font-display)] flex items-center gap-2">
            <FileText className="text-bloom-500" size={24} /> Doctor Visit Prep
          </h1>
          <p className="text-warm-400 text-sm mt-1">
            AI-generated summary of your symptom data for your healthcare provider
          </p>
          <p className="text-xs text-warm-400 mt-2">
            Last generated: {generatedDate.toLocaleDateString()} · Next update due: {nextUpdateDate.toLocaleDateString()}
          </p>
        </div>
        <button className="btn-bloom flex items-center gap-2" onClick={handlePrint}>
          <Download size={16} /> Print / Save PDF
        </button>
      </div>

      {clinicalTranslatorPanel}

      {/* Report Card */}
      <div className="glass-card p-6 space-y-6">
        {/* Patient Info */}
        <div className="flex items-start justify-between border-b border-warm-100 pb-4">
          <div>
            <h2 className="text-lg font-bold gradient-text">BLOOM Health Report</h2>
            <p className="text-sm text-warm-500 mt-1">
              Patient: {currentUser?.name} · Age {currentUser?.age} · {currentUser?.lifeStage}
            </p>
          </div>
          <div className="text-right text-xs text-warm-400">
            <p>Report Period: {doctorPrep.dateRange.start} to {doctorPrep.dateRange.end}</p>
            <p>Generated: {generatedDate.toLocaleDateString()}</p>
            <p>Next update: {nextUpdateDate.toLocaleDateString()}</p>
          </div>
        </div>

        {/* Summary */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <AlertCircle size={16} className="text-bloom-500" /> Summary
          </h3>
          <p className="text-sm text-warm-600 leading-relaxed">{doctorPrep.summary}</p>
        </div>

        {/* Top Symptoms Chart */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-rose-400" /> Top Symptoms
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doctorPrep.topSymptoms} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={110} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.1)', fontSize: 12 }}
                  formatter={(value: any, name: any) => [name === 'frequency' ? `${value} days` : `${value}/5`, name === 'frequency' ? 'Frequency' : 'Avg Severity']}
                />
                <Bar dataKey="frequency" fill="#a855f7" radius={[0, 6, 6, 0]} name="frequency" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
            {doctorPrep.topSymptoms.map(s => (
              <div key={s.name} className="p-3 rounded-xl bg-warm-50 text-xs">
                <p className="font-semibold">{s.name}</p>
                <p className="text-warm-500">{s.frequency} occurrences · Avg severity {s.avgSeverity}/5</p>
              </div>
            ))}
          </div>
        </div>

        {/* Detected Patterns */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <TrendingUp size={16} className="text-amber-500" /> Detected Patterns
          </h3>
          <div className="space-y-3">
            {doctorPrep.patterns.map(p => (
              <div
                key={p.id}
                className={`p-4 rounded-xl border-l-4 bg-warm-50 ${
                  p.severity === 'high' ? 'border-l-rose-400' :
                  p.severity === 'medium' ? 'border-l-amber-400' : 'border-l-sage-400'
                }`}
              >
                <p className="font-semibold text-sm">{p.title}</p>
                <p className="text-xs text-warm-500 mt-1">{p.pattern}</p>
                <div className="flex gap-2 mt-2">
                  {p.conditionsFlagged.map(c => (
                    <span key={c} className="badge badge-bloom">{c}</span>
                  ))}
                  <span className="badge badge-amber">{(p.confidence * 100).toFixed(0)}% confidence</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <Clock size={16} className="text-bloom-500" /> Key Events Timeline
          </h3>
          <div className="relative ml-4 border-l-2 border-bloom-200 space-y-4 pl-6">
            {doctorPrep.timeline.map((t, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-8 top-0.5 w-3 h-3 rounded-full bg-bloom-400 border-2 border-white" />
                <p className="text-xs text-warm-400">{t.date}</p>
                <p className="text-sm font-medium">{t.event}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Suggested Questions */}
        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-3">
            <MessageCircle size={16} className="text-sage-500" /> Questions for Your Doctor
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-warm-600">
            {doctorPrep.questions.map((q, i) => (
              <li key={i} className="leading-relaxed">{q}</li>
            ))}
          </ol>
        </div>

        {/* Cycle Data */}
        <div className="p-4 rounded-xl bg-bloom-50 border border-bloom-100">
          <h3 className="font-semibold flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-bloom-600" /> Cycle Summary
          </h3>
          <p className="text-sm text-warm-600">
            Average cycle length:{' '}
            <strong>
              {doctorPrep.cycleData.avgLength > 0
                ? `${doctorPrep.cycleData.avgLength} days`
                : 'Not currently tracking cycles'}
            </strong>
          </p>
          {doctorPrep.cycleData.irregularities.length > 0 && (
            <ul className="mt-2 text-xs text-warm-500 space-y-1">
              {doctorPrep.cycleData.irregularities.map((ir, i) => (
                <li key={i}>• {ir}</li>
              ))}
            </ul>
          )}
        </div>

        {/* Disclaimer */}
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
          <p className="font-semibold">⚠️ Important Disclaimer</p>
          <p className="mt-1">
            This report is generated by BLOOM AI based on self-reported symptom data. It does not constitute a medical diagnosis.
            Pattern observations are provided to facilitate more informed conversations with healthcare providers.
            All clinical decisions should be made by qualified healthcare professionals.
          </p>
        </div>
      </div>
    </div>
  );
}
