// ============================================================
// BLOOM — Condition Library (personalised)
// Pins user's diagnosed conditions, surfaces symptom-matched suggestions
// ============================================================

import { useState, useMemo } from 'react';
import { conditionLibrary } from '../../data/conditions';
import { useBloomStore } from '../../store/useBloomStore';
import { Library, Search, Clock, AlertTriangle, ChevronDown, ChevronUp, BookOpen, Users, Star, Sparkles } from 'lucide-react';

export default function ConditionLibrary() {
  const { currentUser, userProfile } = useBloomStore();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'yours' | 'relevant' | 'matched'>('all');

  // User's diagnosed conditions (pinned)
  const diagnosedNames = useMemo(() =>
    new Set((userProfile?.diagnosedConditions ?? []).map(c => c.toLowerCase())),
    [userProfile]
  );

  // Conditions matching user's onboarding symptoms (suggested)
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

    // Sort: user's diagnosed first, then symptom-matched, then alphabetical
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-[var(--font-display)] flex items-center gap-2">
          <Library className="text-bloom-500" size={24} /> Condition Library
        </h1>
        <p className="text-warm-400 text-sm mt-1">
          Research-backed information on {conditionLibrary.length} conditions affecting women's health
        </p>
      </div>

      {/* Personalised banners */}
      {yourCount > 0 && (
        <div className="glass-card p-4 border-l-4 border-bloom-400 flex items-start gap-3">
          <Star size={18} className="text-bloom-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Your conditions are pinned</p>
            <p className="text-xs text-warm-400 mt-0.5">
              {Array.from(diagnosedNames).slice(0, 3).join(', ')}{yourCount > 3 ? ` +${yourCount - 3} more` : ''} — shown first below
            </p>
          </div>
        </div>
      )}

      {matchedCount > 0 && yourCount === 0 && (
        <div className="glass-card p-4 border-l-4 border-amber-400 flex items-start gap-3">
          <Sparkles size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold">Conditions relevant to your symptoms</p>
            <p className="text-xs text-warm-400 mt-0.5">
              {matchedCount} conditions match symptoms you reported. This is not a diagnosis — always consult a healthcare provider.
            </p>
          </div>
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
          <input
            className="bloom-input pl-10"
            placeholder="Search conditions, symptoms, or categories..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter === 'all' ? 'bg-bloom-500 text-white' : 'bg-white/60 text-warm-600'}`} onClick={() => setFilter('all')}>All ({conditionLibrary.length})</button>
          {yourCount > 0 && <button className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter === 'yours' ? 'bg-bloom-500 text-white' : 'bg-white/60 text-warm-600'}`} onClick={() => setFilter('yours')}>⭐ Yours ({yourCount})</button>}
          {matchedCount > 0 && <button className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter === 'matched' ? 'bg-amber-500 text-white' : 'bg-white/60 text-warm-600'}`} onClick={() => setFilter('matched')}>✨ Symptom Match ({matchedCount})</button>}
          <button className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${filter === 'relevant' ? 'bg-bloom-500 text-white' : 'bg-white/60 text-warm-600'}`} onClick={() => setFilter('relevant')}>Relevant to You</button>
        </div>
      </div>

      {/* Condition Cards */}
      <div className="space-y-3">
        {filtered.map(condition => {
          const isDiagnosed = diagnosedNames.has(condition.name.toLowerCase());
          const isMatched = symptomMatchedIds.has(condition.id);

          return (
            <div
              key={condition.id}
              className={`glass-card overflow-hidden cursor-pointer ${isDiagnosed ? 'border-l-4 border-bloom-400' : isMatched ? 'border-l-4 border-amber-300' : ''}`}
              onClick={() => setExpanded(expanded === condition.id ? null : condition.id)}
            >
              <div className="p-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{condition.name}</h3>
                    <span className="badge badge-bloom text-[10px]">{condition.category}</span>
                    {isDiagnosed && <span className="badge text-[10px] bg-bloom-100 text-bloom-700">⭐ Your condition</span>}
                    {!isDiagnosed && isMatched && <span className="badge text-[10px] bg-amber-100 text-amber-700">✨ Matches your symptoms</span>}
                    {currentUser && condition.lifeStageRelevance.includes(currentUser.lifeStage) && !isDiagnosed && !isMatched && (
                      <span className="badge badge-sage text-[10px]">Relevant to you</span>
                    )}
                  </div>
                  <p className="text-xs text-warm-500 mt-1 line-clamp-2">{condition.description}</p>
                  <div className="flex items-center gap-4 mt-2 text-[11px] text-warm-400">
                    <span className="flex items-center gap-1"><Users size={12} /> {condition.prevalence.split('.')[0]}</span>
                    <span className="flex items-center gap-1"><Clock size={12} /> Avg diagnosis: {condition.averageDiagnosisTime}</span>
                  </div>
                </div>
                {expanded === condition.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              {expanded === condition.id && (
                <div className="px-4 pb-4 space-y-4 animate-[slide-up_0.3s_ease-out] border-t border-warm-100 pt-4">
                  <div>
                    <h4 className="text-xs font-semibold text-warm-600 uppercase tracking-wide mb-2">Common Symptoms</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {condition.commonSymptoms.map(s => (
                        <span key={s} className={`px-2 py-1 rounded-lg text-xs ${userProfile?.symptoms?.some(us => us.toLowerCase().includes(s.toLowerCase().split(' ')[0])) ? 'bg-bloom-100 text-bloom-700 font-semibold' : 'bg-bloom-50 text-bloom-700'}`}>{s}</span>
                      ))}
                    </div>
                    {isMatched && <p className="text-[11px] text-amber-600 mt-2">✨ Highlighted symptoms match your profile</p>}
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-warm-600 uppercase tracking-wide mb-2 flex items-center gap-1"><AlertTriangle size={12} className="text-amber-500" /> Common Misdiagnoses</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {condition.commonMisdiagnoses.map(m => (
                        <span key={m} className="px-2 py-1 rounded-lg bg-amber-50 text-xs text-amber-700 border border-amber-200">{m}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-warm-600 uppercase tracking-wide mb-2">When to See a Doctor</h4>
                    <ul className="space-y-1">
                      {condition.whenToSeeDoctor.map((w, i) => (
                        <li key={i} className="text-xs text-warm-600 flex items-start gap-2"><span className="text-rose-400 mt-0.5">•</span> {w}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-warm-600 uppercase tracking-wide mb-1 flex items-center gap-1"><BookOpen size={12} /> References</h4>
                    <ul className="text-[11px] text-warm-400 space-y-0.5">
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
        <div className="text-center py-12 text-warm-400">
          <Library size={40} className="mx-auto mb-3 opacity-30" />
          <p>No conditions match your search.</p>
        </div>
      )}
    </div>
  );
}
