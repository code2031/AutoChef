import React from 'react';

// Feature 40: Top most-used ingredients chart from recipe history
export default function IngredientFrequency({ history }) {
  if (!history || history.length === 0) return null;

  const freq = {};
  history.forEach(entry => {
    (entry.recipe?.ingredients || []).forEach(ing => {
      // Normalise: strip quantity/unit prefix, lowercase, take first word group
      const name = ing
        .toLowerCase()
        .replace(/^[\d./\s]+(cup|tsp|tbsp|oz|lb|g|ml|kg|l|clove|slice|piece|bunch|head)s?\s+/i, '')
        .replace(/,.*/, '')
        .trim()
        .split(/\s+/)
        .slice(0, 3)
        .join(' ');
      if (name.length > 2) freq[name] = (freq[name] || 0) + 1;
    });
  });

  const top = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  if (top.length === 0) return null;

  const max = top[0][1];

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Top Ingredients</p>
      <div className="space-y-2">
        {top.map(([name, count]) => (
          <div key={name} className="flex items-center gap-3">
            <span className="text-xs text-slate-400 w-32 shrink-0 truncate capitalize">{name}</span>
            <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-orange-500 rounded-full transition-all duration-700"
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
            <span className="text-xs text-slate-500 w-6 text-right shrink-0">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
