import React, { useState } from 'react';

// Feature 36: Daily recipe suggestion from history (deterministic pick per day)
export default function RecipeOfTheDay({ history, onSelect }) {
  const [dayIndex] = useState(() => Math.floor(Date.now() / 86400000));
  if (!history || history.length === 0) return null;

  const entry = history[dayIndex % history.length];
  if (!entry) return null;

  return (
    <div
      onClick={() => onSelect(entry)}
      className="cursor-pointer group rounded-2xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-all overflow-hidden flex items-center gap-4 p-3"
    >
      {entry.imageUrl && (
        <img
          src={entry.imageUrl}
          alt={entry.recipe?.name}
          className="w-14 h-14 rounded-xl object-cover shrink-0 group-hover:scale-105 transition-transform duration-300"
        />
      )}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400 mb-0.5">Cook Again Today</p>
        <p className="text-sm font-bold text-white truncate">{entry.recipe?.name}</p>
        {entry.recipe?.time && (
          <p className="text-xs text-slate-500 mt-0.5">⏱ {entry.recipe.time} min</p>
        )}
      </div>
      <span className="text-amber-400 text-lg shrink-0 group-hover:translate-x-0.5 transition-transform">→</span>
    </div>
  );
}
