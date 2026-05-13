import { useState, useMemo } from 'react';
import { conditionLibrary } from '../../data/conditions';
import { useBloomStore } from '../../store/useBloomStore';
import { Library, Search, Clock, AlertTriangle, ChevronDown, BookOpen, Users, Star, Sparkles } from 'lucide-react';

const categoryAccent: Record<string, string> = {
  'Reproductive': 'var(--bloom-rose)',
  'Reproductive/Endocrine': 'var(--bloom-rose)',
  'Endocrine': 'var(--bloom-teal)',
  'Systemic': 'var(--bloom-teal)',
  'Digestive': 'var(--bloom-amber)',
  'Autoimmune': 'var(--bloom-teal)',
  'Neurological': 'var(--bloom-glow)',
  'Mood/Reproductive': 'var(--bloom-rose)',
  'Hematological': 'var(--bloom-rose)',
  'Life Stage/Hormonal': 'var(--bloom-teal)',
  'Urological': 'var(--bloom-amber)',
  'Pain/Gynecological': 'var(--bloom-rose)',
  'Musculoskeletal/Pain': 'var(--bloom-amber)',
  'Musculoskeletal/Urological': 'var(--bloom-amber)',
  'Mental Health': 'var(--bloom-glow)',
  'Dermatological/Gynecological': 'var(--bloom-rose)',
  'Sexual Health': 'var(--bloom-rose)',
};

export default function ConditionLibrary() {
  const { currentUser, userProfile } = useBloomStore();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'yours' | 'relevant' | 'matched'>('all');

  const diagnosedNames = useMemo(() =>
    new Set((userProfile?.diagnosedConditions ?? []).map(c => c.toLowerCase())),
    [userProfile]
  );

  const symptomMatchedIds = useMemo(() => {
    if (!userProfile?.symptoms || userProfile.symptoms.length === 0) return new Set<string>();
    return new Set(
      conditionLibrary
        .filter(c =>
          c.commonSymptoms.some(cs =>
            userProfile.symptoms.some(us =>
              cs.toLowerCase().includes(us.toLowerCase().split(' ')[0]) ||
              us.toLowerCase().includes(cs.toLowerCase().split(' ')[0])
            )
          )
        )
        .map(c => c.id)
    );
  }, [userProfile]);

  const filtered = useMemo(() => {
    let list = conditionLibrary;

    if (filter === 'yours') {
      list = list.filter(c => diagnosedNames.has(c.name.toLowerCase()));
    } else if (filter === 'relevant') {
      list = list.filter(c =>
        currentUser && c.lifeStageRelevance.includes(currentUser.lifeStage)
      );
    } else if (filter === 'matched') {
      list = list.filter(c => symptomMatchedIds.has(c.id));
    }

    if (search) {
      list = list.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.category.toLowerCase().includes(search.toLowerCase()) ||
        c.commonSymptoms.some(s => s.toLowerCase().includes(search.toLowerCase()))
      );
    }

    return [...list].sort((a, b) => {
      const aD = diagnosedNames.has(a.name.toLowerCase()) ? 0 : 1;
      const bD = diagnosedNames.has(b.name.toLowerCase()) ? 0 : 1;
      if (aD !== bD) return aD - bD;
      const aM = symptomMatchedIds.has(a.id) ? 0 : 1;
      const bM = symptomMatchedIds.has(b.id) ? 0 : 1;
      if (aM !== bM) return aM - bM;
      return a.name.localeCompare(b.name);
    });
  }, [filter, search, diagnosedNames, symptomMatchedIds, currentUser]);

  const yourCount = diagnosedNames.size;
  const matchedCount = symptomMatchedIds.size;

  const filterTabs = [
    { key: 'all' as const, label: `All (${conditionLibrary.length})` },
    { key: 'yours' as const, label: `Yours (${yourCount})`, show: yourCount > 0 },
    { key: 'matched' as const, label: `Symptom Match (${matchedCount})`, show: matchedCount > 0 },
    { key: 'relevant' as const, label: 'Relevant to You' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-heading)] flex items-center gap-2">
          <Library color="var(--bloom-glow)" size={24} /> Condition Library
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--bloom-muted)' }}>
          Research-backed information on {conditionLibrary.length} conditions affecting women's health
        </p>
      </div>

      {yourCount > 0 && (
        <div
          className="p-4 flex items-start gap-3"
          style={{
            background: 'var(--bloom-surface)',
            borderRadius: 16,
            borderLeft: '4px solid var(--bloom-glow)',
          }}
        >
          <Star size={18} color="var(--bloom-glow)" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Your conditions are pinned</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--bloom-muted)' }}>
              {Array.from(diagnosedNames).slice(0, 3).join(', ')}{yourCount > 3 ? ` +${yourCount - 3} more` : ''} — shown first below
            </p>
          </div>
        </div>
      )}

      {matchedCount > 0 && yourCount === 0 && (
        <div
          className="p-4 flex items-start gap-3"
          style={{
            background: 'var(--bloom-surface)',
            borderRadius: 16,
            borderLeft: '4px solid var(--bloom-amber)',
          }}
        >
          <Sparkles size={18} color="var(--bloom-amber)" className="shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Conditions relevant to your symptoms</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--bloom-muted)' }}>
              {matchedCount} conditions match symptoms you reported. This is not a diagnosis — always consult a healthcare provider.
            </p>
          </div>
        </div>
      )}

      <div className="relative" style={{ width: '100%' }}>
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: 56,
            background: 'var(--bloom-surface)',
            border: '1px solid var(--bloom-border)',
            borderRadius: 16,
            display: 'flex',
            alignItems: 'center',
            padding: '0 16px',
            transition: 'border-color 0.3s, box-shadow 0.3s',
          }}
          className="group"
        >
          <Search size={18} color="var(--bloom-glow)" className="shrink-0" />
          <input
            className="w-full bg-transparent border-none outline-none text-sm ml-3"
            style={{ color: 'var(--bloom-text)' }}
            placeholder="Search conditions, symptoms, or categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => {
              e.currentTarget.parentElement!.style.borderColor = 'var(--bloom-glow)';
              e.currentTarget.parentElement!.style.boxShadow = '0 0 20px rgba(124,58,237,0.2)';
            }}
            onBlur={e => {
              e.currentTarget.parentElement!.style.borderColor = 'var(--bloom-border)';
              e.currentTarget.parentElement!.style.boxShadow = 'none';
            }}
          />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {filterTabs.filter(t => t.show !== false).map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              clipPath: 'polygon(8% 0%,92% 0%,100% 50%,92% 100%,8% 100%,0% 50%)',
              padding: '8px 24px',
              fontSize: 13,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s',
              background: filter === tab.key ? 'var(--bloom-glow)' : 'var(--bloom-surface)',
              color: filter === tab.key ? '#fff' : 'var(--bloom-muted)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(condition => {
          const isDiagnosed = diagnosedNames.has(condition.name.toLowerCase());
          const isMatched = symptomMatchedIds.has(condition.id);
          const isExpanded = expanded === condition.id;
          const accent = categoryAccent[condition.category] || 'var(--bloom-glow)';

          return (
            <div
              key={condition.id}
              onClick={() => setExpanded(isExpanded ? null : condition.id)}
              className="cursor-pointer"
              style={{
                background: 'var(--bloom-surface)',
                borderRadius: 20,
                border: '1px solid var(--bloom-border)',
                overflow: 'hidden',
                position: 'relative',
                transition: 'transform 0.3s, box-shadow 0.3s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(124,58,237,0.15)';
                const stripe = e.currentTarget.querySelector('[data-stripe]') as HTMLElement;
                if (stripe) stripe.style.width = '10px';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                const stripe = e.currentTarget.querySelector('[data-stripe]') as HTMLElement;
                if (stripe) stripe.style.width = '6px';
              }}
            >
              <div
                data-stripe
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 6,
                  background: accent,
                  borderRadius: '20px 0 0 20px',
                  transition: 'width 0.3s',
                }}
              />

              <div className="p-4 flex items-start justify-between" style={{ paddingLeft: 28 }}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{condition.name}</h3>
                    <span
                      className="text-[10px] font-medium px-2.5 py-0.5"
                      style={{
                        background: `${accent}20`,
                        color: accent,
                        borderRadius: 99,
                        border: `1px solid ${accent}40`,
                      }}
                    >
                      {condition.category}
                    </span>
                    {isDiagnosed && (
                      <span
                        className="text-[10px] font-medium px-2.5 py-0.5"
                        style={{
                          background: 'rgba(124,58,237,0.15)',
                          color: 'var(--bloom-glow)',
                          borderRadius: 99,
                        }}
                      >
                        ⭐ Your condition
                      </span>
                    )}
                    {!isDiagnosed && isMatched && (
                      <span
                        className="text-[10px] font-medium px-3 py-0.5"
                        style={{
                          position: 'relative',
                          borderRadius: 99,
                          color: 'var(--bloom-amber)',
                          background: 'rgba(251,191,36,0.1)',
                          border: '1px solid transparent',
                          backgroundClip: 'padding-box',
                        }}
                      >
                        <span
                          style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: 99,
                            border: '1px solid transparent',
                            background: 'linear-gradient(135deg, var(--bloom-amber), var(--bloom-glow)) border-box',
                            WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                            WebkitMaskComposite: 'xor',
                            maskComposite: 'exclude',
                          }}
                        />
                        ✨ Matches your symptoms
                      </span>
                    )}
                    {currentUser && condition.lifeStageRelevance.includes(currentUser.lifeStage) && !isDiagnosed && !isMatched && (
                      <span
                        className="text-[10px] font-medium px-2.5 py-0.5"
                        style={{
                          background: 'rgba(6,214,160,0.15)',
                          color: 'var(--bloom-teal)',
                          borderRadius: 99,
                        }}
                      >
                        Relevant to you
                      </span>
                    )}
                  </div>
                  <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--bloom-muted)' }}>
                    {condition.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-[11px]" style={{ color: 'var(--bloom-muted)' }}>
                    <span className="flex items-center gap-1"><Users size={12} /> {condition.prevalence.split('.')[0]}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> Avg diagnosis: {condition.averageDiagnosisTime}</span>
                  </div>
                </div>
                <div
                  style={{
                    transition: 'transform 0.3s',
                    transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    marginLeft: 12,
                    flexShrink: 0,
                  }}
                >
                  <ChevronDown size={18} style={{ color: 'var(--bloom-muted)' }} />
                </div>
              </div>

              {isExpanded && (
                <div
                  className="px-4 pb-4 space-y-4"
                  style={{
                    paddingLeft: 28,
                    borderTop: '1px solid var(--bloom-border)',
                    paddingTop: 16,
                    animation: 'bloom-fade-up 0.3s ease',
                  }}
                >
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--bloom-muted)' }}>
                      Common Symptoms
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {condition.commonSymptoms.map(s => {
                        const matched = userProfile?.symptoms?.some(us =>
                          us.toLowerCase().includes(s.toLowerCase().split(' ')[0])
                        );
                        return (
                          <span
                            key={s}
                            className="px-2 py-1 rounded-lg text-xs"
                            style={{
                              background: matched ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)',
                              color: matched ? 'var(--bloom-glow)' : 'var(--bloom-muted)',
                              fontWeight: matched ? 600 : 400,
                            }}
                          >
                            {s}
                          </span>
                        );
                      })}
                    </div>
                    {isMatched && (
                      <p className="text-[11px] mt-2" style={{ color: 'var(--bloom-amber)' }}>
                        ✨ Highlighted symptoms match your profile
                      </p>
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-1" style={{ color: 'var(--bloom-muted)' }}>
                      <AlertTriangle size={12} color="var(--bloom-amber)" /> Common Misdiagnoses
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {condition.commonMisdiagnoses.map(m => (
                        <span
                          key={m}
                          className="px-2 py-1 rounded-lg text-xs"
                          style={{
                            background: 'rgba(251,191,36,0.1)',
                            color: 'var(--bloom-amber)',
                            border: '1px solid rgba(251,191,36,0.2)',
                          }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'var(--bloom-muted)' }}>
                      When to See a Doctor
                    </h4>
                    <ul className="space-y-1">
                      {condition.whenToSeeDoctor.map((w, i) => (
                        <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--bloom-muted)' }}>
                          <span style={{ color: 'var(--bloom-rose)', marginTop: 2 }}>•</span> {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide mb-1 flex items-center gap-1" style={{ color: 'var(--bloom-muted)' }}>
                      <BookOpen size={12} /> References
                    </h4>
                    <ul className="text-[11px] space-y-0.5" style={{ color: 'var(--bloom-muted)' }}>
                      {condition.references.map((r, i) => <li key={i}>• {r}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12" style={{ color: 'var(--bloom-muted)' }}>
          <Library size={40} className="mx-auto mb-3" style={{ opacity: 0.3 }} />
          <p>No conditions match your search.</p>
        </div>
      )}
    </div>
  );
}
