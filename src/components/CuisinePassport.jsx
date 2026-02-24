import React from 'react';

const CUISINES = [
  { name: 'Italian', emoji: '🍕', color: 'bg-red-500/20 border-red-500/40 text-red-400' },
  { name: 'Asian', emoji: '🍜', color: 'bg-amber-500/20 border-amber-500/40 text-amber-400' },
  { name: 'Mexican', emoji: '🌮', color: 'bg-green-500/20 border-green-500/40 text-green-400' },
  { name: 'Indian', emoji: '🍛', color: 'bg-orange-500/20 border-orange-500/40 text-orange-400' },
  { name: 'French', emoji: '🥐', color: 'bg-purple-500/20 border-purple-500/40 text-purple-400' },
  { name: 'Mediterranean', emoji: '🫒', color: 'bg-sky-500/20 border-sky-500/40 text-sky-400' },
  { name: 'American', emoji: '🍔', color: 'bg-blue-500/20 border-blue-500/40 text-blue-400' },
  { name: 'Japanese', emoji: '🍣', color: 'bg-pink-500/20 border-pink-500/40 text-pink-400' },
];

function getCuisineCounts(history) {
  const counts = {};
  CUISINES.forEach(c => { counts[c.name] = 0; });
  history.forEach(entry => {
    const tags = entry.tags || [];
    const name = (entry.recipe?.name || '').toLowerCase();
    const desc = (entry.recipe?.description || '').toLowerCase();
    CUISINES.forEach(c => {
      const key = c.name.toLowerCase();
      if (tags.includes(key) || name.includes(key) || desc.includes(key)) {
        counts[c.name] = (counts[c.name] || 0) + 1;
      }
    });
  });
  return counts;
}

export default function CuisinePassport({ history }) {
  const counts = getCuisineCounts(history);
  const unlocked = CUISINES.filter(c => counts[c.name] > 0);
  const total = unlocked.length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">🌍 Cuisine Passport</p>
          <p className="text-sm text-slate-400 mt-1">{total} of {CUISINES.length} cuisines explored</p>
        </div>
        <div className="text-3xl font-bold text-orange-400">{total}/{CUISINES.length}</div>
      </div>

      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all"
          style={{ width: `${(total / CUISINES.length) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {CUISINES.map(c => {
          const count = counts[c.name] || 0;
          const earned = count > 0;
          return (
            <div
              key={c.name}
              className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                earned ? c.color : 'bg-slate-900 border-white/5 opacity-40'
              }`}
            >
              <span className="text-3xl">{c.emoji}</span>
              <span className={`text-xs font-bold ${earned ? '' : 'text-slate-600'}`}>{c.name}</span>
              {earned && (
                <span className="text-[10px] text-slate-400">{count} recipe{count !== 1 ? 's' : ''}</span>
              )}
              {earned && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-[8px] text-white font-bold">✓</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {total === 0 && (
        <p className="text-center text-slate-500 text-sm py-4">
          Cook your first recipe to earn your first passport stamp!
        </p>
      )}
      {total === CUISINES.length && (
        <div className="p-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl text-center">
          <p className="text-orange-400 font-bold">🏆 World Cuisine Explorer!</p>
          <p className="text-xs text-slate-400 mt-1">You&apos;ve cooked all 8 cuisine styles. Incredible!</p>
        </div>
      )}
    </div>
  );
}
