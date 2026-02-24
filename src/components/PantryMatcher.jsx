import React, { useState, useMemo } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

function matchScore(recipe, pantryNames) {
  const ingredients = recipe?.ingredients || [];
  if (ingredients.length === 0) return { pct: 0, matched: [], missing: [] };
  const matched = [];
  const missing = [];
  ingredients.forEach(ing => {
    const ingLower = ing.toLowerCase();
    const firstWord = ingLower.split(/[,\s(/]/)[0].trim();
    const hasIt = pantryNames.some(name => ingLower.includes(name) || name.includes(firstWord));
    if (hasIt) matched.push(ing);
    else missing.push(ing);
  });
  return {
    pct: Math.round((matched.length / ingredients.length) * 100),
    matched,
    missing,
  };
}

function MatchCard({ entry, score, onSelect, onClose }) {
  const [showMissing, setShowMissing] = useState(false);
  const badgeColor = score.pct >= 70 ? 'bg-green-500/15 text-green-400 border-green-500/25'
    : score.pct >= 40 ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
    : 'bg-red-500/15 text-red-400 border-red-500/25';

  return (
    <div className="p-3 bg-slate-800/60 border border-white/5 rounded-2xl space-y-2">
      <div className="flex items-center gap-3">
        {entry.imageUrl && (
          <img src={entry.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate">{entry.recipe?.name}</p>
          <p className="text-xs text-slate-500">
            {entry.recipe?.time || '—'} · {(entry.recipe?.ingredients || []).length} ingredients
          </p>
        </div>
        <span className={`shrink-0 px-2 py-1 rounded-lg text-xs font-bold border ${badgeColor}`}>
          {score.pct}%
        </span>
      </div>

      {score.missing.length > 0 && (
        <div>
          <button
            onClick={() => setShowMissing(v => !v)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            {showMissing ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            {score.missing.length} missing ingredient{score.missing.length !== 1 ? 's' : ''}
          </button>
          {showMissing && (
            <div className="mt-1.5 space-y-0.5 pl-3 border-l border-white/5">
              {score.missing.slice(0, 5).map((ing, i) => (
                <p key={i} className="text-xs text-slate-500">· {ing}</p>
              ))}
              {score.missing.length > 5 && (
                <p className="text-xs text-slate-600">+{score.missing.length - 5} more</p>
              )}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => { onSelect(entry); onClose(); }}
        className="w-full py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-medium rounded-xl hover:bg-orange-500/20 transition-all"
      >
        Cook This →
      </button>
    </div>
  );
}

export default function PantryMatcher({ history, onSelect, onGenerateFromPantry, onClose }) {
  const [rawPantry] = useLocalStorage('pantry_items', []);
  const pantryNames = useMemo(() =>
    rawPantry
      .map(p => (typeof p === 'string' ? p : (p.name || '')).toLowerCase().trim())
      .filter(Boolean),
    [rawPantry]
  );

  const matches = useMemo(() => {
    if (pantryNames.length === 0) return [];
    return history
      .filter(e => e.recipe?.ingredients?.length > 0)
      .map(entry => ({ entry, score: matchScore(entry.recipe, pantryNames) }))
      .filter(({ score }) => score.pct > 0)
      .sort((a, b) => b.score.pct - a.score.pct)
      .slice(0, 10);
  }, [history, pantryNames]);

  const canMakeCount = matches.filter(m => m.score.pct >= 80).length;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <div>
            <h2 className="font-bold text-white text-lg">🧺 What Can I Make?</h2>
            {pantryNames.length > 0 ? (
              <p className="text-xs text-slate-400 mt-0.5">
                {matches.length > 0
                  ? `${matches.length} match${matches.length !== 1 ? 'es' : ''} from your pantry${canMakeCount > 0 ? ` · ${canMakeCount} you can make now` : ''}`
                  : 'No matches yet — save some recipes first'}
              </p>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">Add items to your pantry first</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-all">
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-3">
          {pantryNames.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-3xl">🧺</p>
              <p className="text-sm text-slate-400">Your pantry is empty.</p>
              <p className="text-xs text-slate-600">Add items to the Pantry drawer to see what you can cook.</p>
            </div>
          ) : matches.length === 0 ? (
            <div className="py-8 text-center space-y-2">
              <p className="text-3xl">🍳</p>
              <p className="text-sm text-slate-400">No matching saved recipes found.</p>
              <p className="text-xs text-slate-600">Generate some recipes first, or try generating from your pantry below.</p>
            </div>
          ) : (
            matches.map(({ entry, score }) => (
              <MatchCard key={entry.id} entry={entry} score={score} onSelect={onSelect} onClose={onClose} />
            ))
          )}
        </div>

        <div className="p-4 border-t border-white/5 shrink-0">
          <button
            onClick={() => {
              onGenerateFromPantry(pantryNames);
              onClose();
            }}
            disabled={pantryNames.length === 0}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-all flex items-center justify-center gap-2"
          >
            🧺 Generate New Recipe from Pantry
          </button>
        </div>
      </div>
    </div>
  );
}
