import React, { useMemo } from 'react';

// Round 10: a simple word cloud of the most-used ingredients across history.
// Size and colour scale with how often each ingredient appears. Pure compute.
const STOP = new Set(['cup', 'cups', 'tbsp', 'tsp', 'oz', 'lb', 'lbs', 'g', 'kg', 'ml', 'l',
  'of', 'and', 'or', 'to', 'a', 'an', 'the', 'with', 'for', 'into', 'large', 'small',
  'medium', 'fresh', 'chopped', 'diced', 'sliced', 'minced', 'grated', 'ground', 'can',
  'cans', 'pinch', 'clove', 'cloves', 'taste', 'optional', 'finely', 'thinly']);

function normalize(ing) {
  return ing.toLowerCase()
    .replace(/\([^)]*\)/g, '')
    .replace(/[\d./]+/g, ' ')
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP.has(w));
}

const COLORS = ['#f97316', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#06b6d4', '#f59e0b', '#ef4444'];

export default function IngredientWordCloud({ history }) {
  const words = useMemo(() => {
    const counts = {};
    (history || []).forEach(entry => {
      const ings = (entry.recipe || entry).ingredients || [];
      ings.forEach(ing => {
        normalize(ing).forEach(w => { counts[w] = (counts[w] || 0) + 1; });
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 40);
  }, [history]);

  if (words.length === 0) {
    return <p className="text-sm text-slate-500 text-center py-8">Cook a few recipes to grow your ingredient cloud.</p>;
  }

  const max = words[0][1];
  const min = words[words.length - 1][1];

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Ingredient Cloud</p>
      <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 p-4 bg-slate-900/40 rounded-2xl border border-white/5">
        {words.map(([word, count], i) => {
          const t = max === min ? 1 : (count - min) / (max - min);
          const size = 0.75 + t * 1.6; // rem
          const opacity = 0.55 + t * 0.45;
          return (
            <span
              key={word}
              title={`${word} — used ${count}×`}
              className="capitalize font-bold leading-tight cursor-default"
              style={{ fontSize: `${size}rem`, color: COLORS[i % COLORS.length], opacity }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
}
