import { useBloomStore } from '../../store/useBloomStore';
import { FileText, Printer, Shield, Stethoscope, Check, AlertCircle, MessageCircle, Calendar, Clock, AlertTriangle, Clipboard, ClipboardCheck, ListChecks } from 'lucide-react';
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

type ClinicalShieldResult = {
  clinicalPhrase: string;
  structuredNote: string;
  evidencePoints: string[];
  missingDetails: string[];
  visitScript: string;
  urgencyNote: string;
};

const estimateSeverity = (text: string) => {
  const numeric = text.match(/\b(10|[1-9])\s*\/\s*10\b/);
  if (numeric) return `${numeric[1]}/10`;
  if (/\b(unbearable|worst|can't stand|cannot stand|excruciating)\b/i.test(text)) return 'described as severe or near-intolerable; exact 0-10 rating not documented';
  if (/\b(so bad|severe|intense|really bad)\b/i.test(text)) return 'described as severe; exact 0-10 rating not documented';
  if (/\b(moderate|pretty bad)\b/i.test(text)) return 'described as moderate; exact 0-10 rating not documented';
  if (/\b(mild|slight|little)\b/i.test(text)) return 'described as mild; exact 0-10 rating not documented';
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

const extractFunctionalImpact = (text: string) => {
  const impacts = [
    { pattern: /\b(missed|missing)\s+(work|school|class)\b/i, label: 'missed work/school' },
    { pattern: /\b(can't|cannot|unable to)\s+(walk|stand|sleep|eat|work|focus|move)\b/i, label: 'interferes with daily functioning' },
    { pattern: /\b(woke me up|waking me up|can't sleep|cannot sleep)\b/i, label: 'disrupts sleep' },
    { pattern: /\b(lying down|staying in bed|bedridden)\b/i, label: 'requires rest or lying down' },
    { pattern: /\b(vomit|vomiting|throwing up)\b/i, label: 'associated with vomiting' },
  ];
  return impacts.filter(({ pattern }) => pattern.test(text)).map(({ label }) => label);
};

const extractAssociatedSymptoms = (text: string) => {
  const lower = text.toLowerCase();
  return Object.entries(symptomTerms)
    .filter(([key]) => lower.includes(key))
    .map(([, label]) => label)
    .filter(label => label !== extractLocationOrSymptom(text));
};

const extractCycleTiming = (text: string) => {
  if (/\b(period|menstrual|bleeding|flow|cycle day|day \d+)\b/i.test(text)) return 'menstrual/cycle timing mentioned';
  if (/\bovulation|midcycle|mid-cycle\b/i.test(text)) return 'possible ovulation or mid-cycle timing mentioned';
  if (/\bbefore my period|pms|premenstrual\b/i.test(text)) return 'premenstrual timing mentioned';
  return '';
};

const extractTriggers = (text: string) => {
  const triggers = [
    { pattern: /\b(after|during)\s+(sex|intercourse)\b/i, label: 'sex/intercourse' },
    { pattern: /\b(after|during)\s+(exercise|running|walking|workout)\b/i, label: 'movement or exercise' },
    { pattern: /\b(after|during)\s+(eating|meals|food)\b/i, label: 'meals or food' },
    { pattern: /\bwhen\s+(urinating|peeing|pooping|having a bowel movement)\b/i, label: 'urination or bowel movements' },
  ];
  return triggers.filter(({ pattern }) => pattern.test(text)).map(({ label }) => label);
};

const detectUrgencyNote = (text: string) => {
  const redFlags = [
    /\b(chest pain|shortness of breath|trouble breathing)\b/i,
    /\b(fainting|passed out|loss of consciousness)\b/i,
    /\b(heavy bleeding|soaking.*pad|soaking.*tampon)\b/i,
    /\b(positive pregnancy test|pregnant)\b/i,
    /\b(fever|stiff neck)\b/i,
    /\b(sudden|sharp).*(pelvic|abdominal|chest)\b/i,
  ];
  if (redFlags.some(pattern => pattern.test(text))) {
    return 'This includes details that may need urgent medical advice, especially if symptoms are sudden, severe, worsening, or unusual for you.';
  }
  return 'No urgent red-flag wording was detected here, but seek timely medical help for sudden, severe, worsening, or unusual symptoms.';
};

const buildClinicalShield = (input: string): ClinicalShieldResult | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const severity = estimateSeverity(trimmed);
  const duration = extractDuration(trimmed);
  const symptom = extractLocationOrSymptom(trimmed);
  const medication = extractMedication(trimmed);
  const functionalImpacts = extractFunctionalImpact(trimmed);
  const associatedSymptoms = extractAssociatedSymptoms(trimmed);
  const cycleTiming = extractCycleTiming(trimmed);
  const triggers = extractTriggers(trimmed);
  const unresponsive = /\b(doesn't do anything|does not do anything|not helping|no relief|unresponsive|doesn't help|does not help)\b/i.test(trimmed);
  const persistent = duration !== 'duration not specified' ? 'persistent ' : '';
  const acute = /\b(sudden|started|new|acute)\b/i.test(trimmed) || duration !== 'duration not specified' ? 'acute, ' : '';
  const painPhrase = symptom.includes('pain') || symptom.includes('cramping') || /\bhurt|pain|ache|aching|cramp/i.test(trimmed)
    ? `${acute}${persistent}${symptom.includes('pain') || symptom.includes('cramping') ? symptom : `${symptom} pain`}`
    : `${persistent}${symptom}`;

  const parts = [
    `Patient reports ${painPhrase}`,
    duration !== 'duration not specified' ? `for ${duration}` : '',
    severity !== 'not quantified' ? `with severity ${severity}` : 'with severity not yet quantified',
  ].filter(Boolean);

  let sentence = `${parts.join(', ')}.`;
  if (medication) {
    sentence += ` Symptoms are ${unresponsive ? 'unresponsive' : 'partially characterized in relation'} to ${medication}.`;
  } else {
    sentence += ' Medication response not specified.';
  }
  if (functionalImpacts.length > 0) sentence += ` Functional impact: ${functionalImpacts.join(', ')}.`;
  if (associatedSymptoms.length > 0) sentence += ` Associated symptoms include ${associatedSymptoms.join(', ')}.`;
  if (cycleTiming) sentence += ` ${cycleTiming}.`;
  if (triggers.length > 0) sentence += ` Reported trigger/context: ${triggers.join(', ')}.`;

  const missingDetails = [
    severity === 'not quantified' || severity.includes('exact 0-10 rating not documented') ? 'Exact severity on a 0-10 scale' : '',
    duration === 'duration not specified' ? 'When it started and how long each episode lasts' : '',
    !cycleTiming ? 'Cycle day or relation to period/ovulation, if relevant' : '',
    medication ? 'Dose timing and amount of relief' : 'Medication, heat, rest, or other relief attempts',
    functionalImpacts.length === 0 ? 'Impact on sleep, work/school, movement, eating, or caregiving' : '',
    associatedSymptoms.length === 0 ? 'Associated symptoms such as nausea, fever, dizziness, bowel/bladder changes, bleeding, or discharge' : '',
  ].filter(Boolean);

  const evidencePoints = [
    `Symptom focus: ${painPhrase}`,
    duration !== 'duration not specified' ? `Duration: ${duration}` : 'Duration: not yet specified',
    severity !== 'not quantified' ? `Severity: ${severity}` : 'Severity: not yet quantified',
    medication ? `Relief attempted: ${medication}${unresponsive ? ' with no relief reported' : ''}` : 'Relief attempted: not yet specified',
    functionalImpacts.length > 0 ? `Functional impact: ${functionalImpacts.join(', ')}` : 'Functional impact: not yet specified',
  ];

  const structuredNote = [
    sentence,
    '',
    'Details to confirm:',
    ...missingDetails.map(detail => `- ${detail}`),
  ].join('\n');

  const visitScript = [
    `I am concerned about ${painPhrase}.`,
    severity !== 'not quantified' ? `I would describe the severity as ${severity}.` : 'I need help quantifying and evaluating the severity.',
    duration !== 'duration not specified' ? `It has been happening for ${duration}.` : 'I can clarify the start date and episode duration.',
    medication ? `${medication} ${unresponsive ? 'has not relieved it' : 'is part of what I have tried'}.` : 'I can share what I have tried for relief.',
    'What would you recommend evaluating next, and what symptoms should prompt urgent care?',
  ].join(' ');

  return {
    clinicalPhrase: sentence,
    structuredNote,
    evidencePoints,
    missingDetails,
    visitScript,
    urgencyNote: detectUrgencyNote(trimmed),
  };
};

const severityColor = (severity: string) => {
  switch (severity) {
    case 'high': return '#e879a0';
    case 'medium': return '#fbbf24';
    case 'low': return '#06d6a0';
    default: return '#7c3aed';
  }
};

export default function DoctorPrep() {
  const { doctorPrep, currentUser, symptomLogs, refreshDoctorPrep } = useBloomStore();
  const [plainLanguage, setPlainLanguage] = useState('');
  const [copiedTarget, setCopiedTarget] = useState<'note' | 'script' | null>(null);

  useEffect(() => {
    refreshDoctorPrep();
  }, [refreshDoctorPrep]);

  const latestSymptomNote = useMemo(() => (
    symptomLogs.find(log => log.notes.trim().length > 0)?.notes ?? ''
  ), [symptomLogs]);

  const clinicalShield = useMemo(
    () => buildClinicalShield(plainLanguage || latestSymptomNote),
    [plainLanguage, latestSymptomNote]
  );

  const handlePrint = () => {
    window.print();
  };

  const handleCopyShield = async (target: 'note' | 'script') => {
    if (!clinicalShield) return;
    await navigator.clipboard.writeText(target === 'note' ? clinicalShield.structuredNote : clinicalShield.visitScript);
    setCopiedTarget(target);
    window.setTimeout(() => setCopiedTarget(null), 1500);
  };

  const clinicalShieldSection = (
    <div
      style={{
        background: 'linear-gradient(135deg, var(--bloom-void), var(--bloom-deep))',
        border: '1px solid rgba(232, 121, 160, 0.5)',
        borderRadius: '20px',
        padding: '24px',
      }}
      className="space-y-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '20px',
              color: 'var(--bloom-rose)',
            }}
            className="flex items-center gap-2 font-semibold"
          >
            <Shield size={20} style={{ color: 'var(--bloom-rose)' }} />
            Medical Gaslighting Shield
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--bloom-muted)' }}>
            Turn symptom language into a clear note, missing-detail checklist, and appointment script.
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2 shrink-0">
          <button
            onClick={() => handleCopyShield('note')}
            disabled={!clinicalShield}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-opacity disabled:opacity-40"
            style={{
              border: '1px solid var(--bloom-border)',
              color: 'var(--bloom-text)',
              background: 'transparent',
            }}
          >
            <Clipboard size={14} /> {copiedTarget === 'note' ? 'Copied' : 'Copy note'}
          </button>
          <button
            onClick={() => handleCopyShield('script')}
            disabled={!clinicalShield}
            className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg transition-opacity disabled:opacity-40"
            style={{
              border: '1px solid var(--bloom-border)',
              color: 'var(--bloom-text)',
              background: 'transparent',
            }}
          >
            <ClipboardCheck size={14} /> {copiedTarget === 'script' ? 'Copied' : 'Script'}
          </button>
        </div>
      </div>

      <textarea
        value={plainLanguage}
        onChange={(event) => setPlainLanguage(event.target.value)}
        placeholder={latestSymptomNote || 'Example: My stomach has been hurting so bad for a week and ibuprofen does not help.'}
        style={{
          background: 'var(--bloom-surface)',
          border: '1px solid var(--bloom-border)',
          borderRadius: '12px',
          fontFamily: 'var(--font-body)',
          fontSize: '14px',
          color: 'var(--bloom-text)',
          padding: '12px 16px',
          width: '100%',
          minHeight: '96px',
          resize: 'none',
          outline: 'none',
        }}
      />

      {clinicalShield ? (
        <div className="grid md:grid-cols-2 gap-4">
          <div
            className="md:col-span-2"
            style={{
              background: 'rgba(6, 214, 160, 0.06)',
              borderLeft: '3px solid var(--bloom-teal)',
              borderRadius: '8px',
              padding: '16px',
            }}
          >
            <p
              className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-2"
              style={{ color: 'var(--bloom-teal)' }}
            >
              <Stethoscope size={14} /> Doctor-ready phrasing
            </p>
            <p
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                color: 'var(--bloom-text)',
                lineHeight: '1.6',
              }}
            >
              {clinicalShield.clinicalPhrase}
            </p>
          </div>

          <div
            style={{
              background: 'var(--bloom-surface)',
              borderRadius: '20px',
              padding: '16px',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: 'var(--bloom-muted)' }}>
              <Check size={14} style={{ color: 'var(--bloom-teal)' }} /> Evidence to bring
            </p>
            <ul className="space-y-2">
              {clinicalShield.evidencePoints.map(point => (
                <li key={point} className="text-xs flex gap-2" style={{ color: 'var(--bloom-text)' }}>
                  <Check size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--bloom-teal)' }} />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </div>

          <div
            style={{
              background: 'var(--bloom-surface)',
              borderRadius: '20px',
              padding: '16px',
            }}
          >
            <p className="text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-2" style={{ color: 'var(--bloom-muted)' }}>
              <AlertCircle size={14} style={{ color: 'var(--bloom-amber)' }} /> Missing details
            </p>
            <ul className="space-y-2">
              {clinicalShield.missingDetails.length > 0 ? clinicalShield.missingDetails.map(detail => (
                <li key={detail} className="text-xs flex gap-2" style={{ color: 'var(--bloom-text)' }}>
                  <AlertCircle size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--bloom-amber)' }} />
                  <span>{detail}</span>
                </li>
              )) : (
                <li className="text-xs" style={{ color: 'var(--bloom-muted)' }}>Core symptom details are covered. Bring dates or logs if you have them.</li>
              )}
            </ul>
          </div>

          <div className="md:col-span-2 relative" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: '8px',
                left: '16px',
                fontFamily: 'var(--font-heading)',
                fontSize: '80px',
                color: 'var(--bloom-glow)',
                opacity: 0.15,
                lineHeight: 1,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              &ldquo;
            </div>
            <div
              style={{
                background: 'var(--bloom-surface)',
                borderRadius: '20px',
                padding: '20px 20px 20px 40px',
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--bloom-muted)' }}>
                Appointment script
              </p>
              <p
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '15px',
                  fontStyle: 'italic',
                  color: 'var(--bloom-text)',
                  lineHeight: '1.7',
                }}
              >
                {clinicalShield.visitScript}
              </p>
            </div>
          </div>

          <div
            className="md:col-span-2"
            style={{
              background: 'transparent',
              borderLeft: '3px solid var(--bloom-amber)',
              borderRadius: '12px',
              padding: '12px 16px',
              fontStyle: 'italic',
              fontSize: '12px',
              color: 'var(--bloom-muted)',
              lineHeight: '1.5',
            }}
          >
            {clinicalShield.urgencyNote}
          </div>
        </div>
      ) : (
        <div
          style={{
            background: 'var(--bloom-surface)',
            borderRadius: '20px',
            padding: '16px',
          }}
        >
          <p className="text-sm" style={{ color: 'var(--bloom-muted)' }}>
            Enter a symptom description to generate clinical phrasing.
          </p>
        </div>
      )}

      <p className="text-xs" style={{ color: 'var(--bloom-muted)' }}>
        This does not diagnose you; it helps make your symptoms harder to dismiss by separating facts, unknowns, and the question you want answered.
      </p>
    </div>
  );

  if (!doctorPrep) {
    const remainingLogs = Math.max(21 - symptomLogs.length, 0);

    return (
      <div className="space-y-6 max-w-4xl">
        {clinicalShieldSection}
        <div className="text-center py-16">
          <FileText size={48} className="mx-auto mb-4" style={{ color: 'var(--bloom-muted)' }} />
          <h2
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '22px',
              color: 'var(--bloom-text)',
            }}
            className="mb-2 font-semibold"
          >
            No Report Available
          </h2>
          <p className="text-sm" style={{ color: 'var(--bloom-muted)' }}>
            Log at least 3 weeks of symptoms to generate your report.
          </p>
          {remainingLogs > 0 && (
            <p className="text-xs mt-2" style={{ color: 'var(--bloom-muted)' }}>
              {symptomLogs.length}/21 symptom logs recorded. {remainingLogs} more to go.
            </p>
          )}
        </div>
      </div>
    );
  }

  const generatedDate = new Date(doctorPrep.generatedAt);
  const nextUpdateDate = addDays(generatedDate, 15);

  const gradientBar = (color: string, pct: number) => (
    <div
      style={{
        height: '8px',
        borderRadius: '99px',
        background: `linear-gradient(90deg, ${color}, transparent)`,
        width: `${Math.min(pct, 100)}%`,
      }}
    />
  );

  return (
    <div className="space-y-8 max-w-4xl">
      <style>{`
        @keyframes stethoscope-swing {
          0%, 100% { transform: rotate(-15deg); }
          50% { transform: rotate(15deg); }
        }
      `}</style>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1
            style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '30px',
              color: 'var(--bloom-text)',
            }}
            className="flex items-center gap-3 font-semibold"
          >
            <span
              style={{
                display: 'inline-block',
                animation: 'stethoscope-swing 1s ease-in-out infinite alternate',
              }}
            >
              <Stethoscope size={28} style={{ color: 'var(--bloom-teal)' }} />
            </span>
            Doctor Visit Prep
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--bloom-muted)' }}>
            AI-generated summary of your symptom data for your healthcare provider
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--bloom-muted)' }}>
            Last generated: {generatedDate.toLocaleDateString()} &middot; Next update due: {nextUpdateDate.toLocaleDateString()}
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all"
          style={{
            border: '1px solid var(--bloom-border)',
            color: 'var(--bloom-text)',
            background: 'transparent',
            fontFamily: 'var(--font-body)',
            fontSize: '14px',
          }}
        >
          <Printer size={16} /> Print / Save PDF
        </button>
      </div>

      {clinicalShieldSection}

      <div
        style={{
          background: 'var(--bloom-surface)',
          borderRadius: '20px',
          padding: '28px',
        }}
        className="space-y-7"
      >
        <div className="flex items-start justify-between gap-4" style={{ borderBottom: '1px solid var(--bloom-border)', paddingBottom: '16px' }}>
          <div>
            <h2
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '20px',
                color: 'var(--bloom-text)',
              }}
              className="font-semibold"
            >
              BLOOM Health Report
            </h2>
            <p className="text-sm mt-1" style={{ color: 'var(--bloom-muted)' }}>
              Patient: {currentUser?.name} &middot; Age {currentUser?.age} &middot; {currentUser?.lifeStage}
            </p>
          </div>
          <div className="text-right text-xs shrink-0" style={{ color: 'var(--bloom-muted)' }}>
            <p>Report Period: {doctorPrep.dateRange.start} to {doctorPrep.dateRange.end}</p>
            <p>Generated: {generatedDate.toLocaleDateString()}</p>
            <p>Next update: {nextUpdateDate.toLocaleDateString()}</p>
          </div>
        </div>

        <div>
          <h3 className="font-semibold flex items-center gap-2 mb-2 text-sm" style={{ color: 'var(--bloom-text)' }}>
            <AlertCircle size={16} style={{ color: 'var(--bloom-rose)' }} /> Summary
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: 'var(--bloom-muted)' }}>{doctorPrep.summary}</p>
        </div>

        <div className="relative">
          <div style={{ borderTop: '1px solid var(--bloom-border)', position: 'relative' }} className="mb-6">
            <div
              style={{
                position: 'absolute',
                top: '-5px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: '8px',
                height: '8px',
                background: 'var(--bloom-glow)',
                borderRadius: '1px',
              }}
            />
          </div>

          <h3 className="font-semibold flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--bloom-text)' }}>
            <ListChecks size={16} style={{ color: 'var(--bloom-rose)' }} /> Top Symptoms
          </h3>
          <div className="space-y-4">
            {doctorPrep.topSymptoms.map(s => {
              const freqPct = (s.frequency / Math.max(...doctorPrep.topSymptoms.map(x => x.frequency))) * 100;
              return (
                <div key={s.name} className="flex items-center gap-4">
                  <div className="text-sm shrink-0 w-28" style={{ color: 'var(--bloom-text)' }}>{s.name}</div>
                  <div className="flex-1">
                    {gradientBar('#7c3aed', freqPct)}
                  </div>
                  <div className="text-xs shrink-0 text-right" style={{ color: 'var(--bloom-muted)', minWidth: '80px' }}>
                    {s.frequency} days &middot; <span style={{ color: 'var(--bloom-teal)' }}>{s.avgSeverity}/5</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative">
          <div style={{ borderTop: '1px solid var(--bloom-border)', position: 'relative' }} className="mb-6">
            <div
              style={{
                position: 'absolute',
                top: '-5px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: '8px',
                height: '8px',
                background: 'var(--bloom-glow)',
                borderRadius: '1px',
              }}
            />
          </div>

          <h3 className="font-semibold flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--bloom-text)' }}>
            <AlertCircle size={16} style={{ color: 'var(--bloom-amber)' }} /> Detected Patterns
          </h3>
          <div className="space-y-3">
            {doctorPrep.patterns.map(p => (
              <div
                key={p.id}
                style={{
                  background: `linear-gradient(135deg, ${severityColor(p.severity)}08, transparent)`,
                  border: `1px solid ${severityColor(p.severity)}30`,
                  borderRadius: '16px',
                  padding: '16px',
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: severityColor(p.severity),
                      boxShadow: `0 0 8px ${severityColor(p.severity)}60`,
                    }}
                  />
                  <p className="font-semibold text-sm" style={{ color: 'var(--bloom-text)' }}>{p.title}</p>
                </div>
                <p className="text-xs mt-1" style={{ color: 'var(--bloom-muted)' }}>{p.pattern}</p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {p.conditionsFlagged.map(c => (
                    <span
                      key={c}
                      style={{
                        background: 'rgba(124, 58, 237, 0.15)',
                        color: 'var(--bloom-glow)',
                        border: '1px solid rgba(124, 58, 237, 0.25)',
                        borderRadius: '99px',
                        padding: '2px 10px',
                        fontSize: '11px',
                      }}
                    >
                      {c}
                    </span>
                  ))}
                  <span
                    style={{
                      background: 'rgba(251, 191, 36, 0.12)',
                      color: 'var(--bloom-amber)',
                      border: '1px solid rgba(251, 191, 36, 0.2)',
                      borderRadius: '99px',
                      padding: '2px 10px',
                      fontSize: '11px',
                    }}
                  >
                    {(p.confidence * 100).toFixed(0)}% confidence
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div style={{ borderTop: '1px solid var(--bloom-border)', position: 'relative' }} className="mb-6">
            <div
              style={{
                position: 'absolute',
                top: '-5px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: '8px',
                height: '8px',
                background: 'var(--bloom-glow)',
                borderRadius: '1px',
              }}
            />
          </div>

          <h3 className="font-semibold flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--bloom-text)' }}>
            <Clock size={16} style={{ color: 'var(--bloom-teal)' }} /> Key Events Timeline
          </h3>
          <div className="relative ml-4" style={{ borderLeft: '2px solid rgba(6, 214, 160, 0.3)' }}>
            <div className="space-y-5 pl-6 pb-1">
              {doctorPrep.timeline.map((t, i) => (
                <div key={i} className="relative">
                  <div
                    style={{
                      position: 'absolute',
                      left: '-30px',
                      top: '4px',
                      width: '10px',
                      height: '10px',
                      borderRadius: '50%',
                      background: 'var(--bloom-teal)',
                      boxShadow: '0 0 8px rgba(6, 214, 160, 0.5)',
                    }}
                  />
                  <p className="text-xs" style={{ color: 'var(--bloom-muted)' }}>{t.date}</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--bloom-text)' }}>{t.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <div style={{ borderTop: '1px solid var(--bloom-border)', position: 'relative' }} className="mb-6">
            <div
              style={{
                position: 'absolute',
                top: '-5px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: '8px',
                height: '8px',
                background: 'var(--bloom-glow)',
                borderRadius: '1px',
              }}
            />
          </div>

          <h3 className="font-semibold flex items-center gap-2 mb-4 text-sm" style={{ color: 'var(--bloom-text)' }}>
            <MessageCircle size={16} style={{ color: 'var(--bloom-teal)' }} /> Questions for Your Doctor
          </h3>
          <ol className="space-y-2">
            {doctorPrep.questions.map((q, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-sm"
                style={{ color: 'var(--bloom-text)' }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    background: 'rgba(124, 58, 237, 0.2)',
                    color: 'var(--bloom-glow)',
                    fontSize: '11px',
                    fontWeight: 600,
                    fontFamily: 'var(--font-heading)',
                    flexShrink: 0,
                  }}
                >
                  {i + 1}
                </span>
                <span className="leading-relaxed">{q}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="relative">
          <div style={{ borderTop: '1px solid var(--bloom-border)', position: 'relative' }} className="mb-6">
            <div
              style={{
                position: 'absolute',
                top: '-5px',
                left: '50%',
                transform: 'translateX(-50%) rotate(45deg)',
                width: '8px',
                height: '8px',
                background: 'var(--bloom-glow)',
                borderRadius: '1px',
              }}
            />
          </div>

          <div
            style={{
              background: 'linear-gradient(135deg, rgba(232, 121, 160, 0.08), transparent)',
              border: '1px solid rgba(232, 121, 160, 0.2)',
              borderRadius: '16px',
              padding: '16px',
            }}
          >
            <h3 className="font-semibold flex items-center gap-2 mb-2 text-sm" style={{ color: 'var(--bloom-text)' }}>
              <Calendar size={16} style={{ color: 'var(--bloom-rose)' }} /> Cycle Summary
            </h3>
            <p className="text-sm" style={{ color: 'var(--bloom-muted)' }}>
              Average cycle length:{' '}
              <strong style={{ color: 'var(--bloom-text)' }}>
                {doctorPrep.cycleData.avgLength > 0
                  ? `${doctorPrep.cycleData.avgLength} days`
                  : 'Not currently tracking cycles'}
              </strong>
            </p>
            {doctorPrep.cycleData.irregularities.length > 0 && (
              <ul className="mt-2 space-y-1">
                {doctorPrep.cycleData.irregularities.map((ir, i) => (
                  <li key={i} className="text-xs flex items-center gap-2" style={{ color: 'var(--bloom-muted)' }}>
                    <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--bloom-amber)', display: 'inline-block' }} />
                    {ir}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div
          style={{
            background: 'transparent',
            borderLeft: '3px solid var(--bloom-amber)',
            borderRadius: '12px',
            padding: '12px 16px',
            fontStyle: 'italic',
            fontSize: '12px',
            color: 'var(--bloom-muted)',
            lineHeight: '1.6',
          }}
        >
          <p className="font-semibold not-italic" style={{ color: 'var(--bloom-amber)' }}>Important Disclaimer</p>
          <p className="mt-1 italic">
            This report is generated by BLOOM AI based on self-reported symptom data. It does not constitute a medical diagnosis.
            Pattern observations are provided to facilitate more informed conversations with healthcare providers.
            All clinical decisions should be made by qualified healthcare professionals.
          </p>
        </div>
      </div>
    </div>
  );
}
