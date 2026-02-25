import React, { useState } from 'react';

export default function CookAgainReminder({ history, onSelect }) {
  const [now] = useState(() => Date.now());
  if (!history || history.length < 5) return null;

  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;

  // Find favourites that haven't been cooked in 30+ days
  const neglected = history
    .filter(e => {
      if (!e.isFavourite) return false;
      if (!e.savedAt) return false;
      const savedAge = now - new Date(e.savedAt).getTime();
      if (savedAge < THIRTY_DAYS) return false; // saved recently — not neglected
      // Check cook count + last cook (we don't have lastCookDate, use savedAt as proxy)
      return true;
    })
    .sort((a, b) => new Date(a.savedAt) - new Date(b.savedAt)) // oldest first
    .slice(0, 3);

  if (neglected.length === 0) return null;

  return (
    <div className="space-y-2 mb-3">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">💔 Cook Again?</p>
      <p className="text-xs text-slate-600">These favourites haven't been touched in a while:</p>
      <div className="space-y-2">
        {neglected.map(entry => (
          <button
            key={entry.id}
            onClick={() => onSelect(entry)}
            className="w-full flex items-center gap-3 p-3 bg-slate-800/60 border border-white/5 hover:border-orange-500/30 rounded-2xl text-left transition-all group"
          >
            {entry.imageUrl && (
              <img
                src={entry.imageUrl}
                alt={entry.recipe?.name}
                className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-slate-200 font-medium truncate group-hover:text-orange-400 transition-colors">
                {entry.recipe?.name}
              </p>
              <p className="text-xs text-slate-600">
                Saved {Math.floor((now - new Date(entry.savedAt).getTime()) / (1000 * 60 * 60 * 24))} days ago
              </p>
            </div>
            <span className="text-orange-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">Cook →</span>
          </button>
        ))}
      </div>
    </div>
  );
}
