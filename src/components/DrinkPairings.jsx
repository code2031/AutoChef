import React from 'react';
import { Loader2, X } from 'lucide-react';

const TYPE_EMOJI = { wine: '🍷', beer: '🍺', cocktail: '🍸', 'non-alcoholic': '🥤' };
const TYPE_COLOR = {
  wine: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  beer: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  cocktail: 'text-pink-400 bg-pink-500/10 border-pink-500/20',
  'non-alcoholic': 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
};

export default function DrinkPairings({ pairings, isLoading, onClose }) {
  return (
    <div className="mt-3 bg-slate-900/60 border border-white/10 rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">🍷 Drink Pairings</p>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg text-slate-600 hover:text-slate-400 transition-all">
            <X size={13} />
          </button>
        )}
      </div>
      {isLoading ? (
        <div className="flex items-center gap-2 py-2">
          <Loader2 size={14} className="animate-spin text-purple-400" />
          <span className="text-xs text-slate-500">Finding perfect drink matches...</span>
        </div>
      ) : pairings && pairings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {pairings.map((p, i) => {
            const typeKey = (p.type || '').toLowerCase().replace(/\s+/g, '-');
            const colorClass = TYPE_COLOR[typeKey] || TYPE_COLOR.wine;
            const emoji = TYPE_EMOJI[typeKey] || '🥂';
            return (
              <div key={i} className={`p-3 rounded-xl border ${colorClass} space-y-1`}>
                <div className="flex items-center gap-2">
                  <span>{emoji}</span>
                  <span className="text-sm font-semibold text-white">{p.name}</span>
                </div>
                <p className="text-xs text-slate-400 leading-snug">{p.notes}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-slate-600">No pairings found.</p>
      )}
    </div>
  );
}
