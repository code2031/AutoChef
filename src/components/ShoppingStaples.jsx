import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

function normalizeIngredient(text) {
  return text
    .toLowerCase()
    .replace(/^\d[\d./\s]*/, '') // strip leading numbers
    .replace(/\b(cup|cups|tbsp|tsp|oz|lb|lbs|g|kg|ml|l|clove|cloves|piece|pieces|slice|slices|bunch|can|cans|jar|jars|pinch|handful|medium|large|small|fresh|dried|chopped|minced|sliced|diced|grated|peeled|cooked)\b/g, '')
    .replace(/[^a-z\s]/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .join(' ');
}

export default function ShoppingStaples({ history }) {
  const [copied, setCopied] = useState(false);

  const counts = {};
  history.forEach(e => {
    (e.recipe?.ingredients || []).forEach(ing => {
      const name = normalizeIngredient(ing);
      if (name.length < 2) return;
      counts[name] = (counts[name] || 0) + 1;
    });
  });

  const staples = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  if (staples.length === 0) return null;

  const handleCopy = async () => {
    const text = staples.map(s => `• ${s.name}`).join('\n');
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Shopping Staples</p>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs transition-all"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />}
          {copied ? 'Copied!' : 'Copy List'}
        </button>
      </div>
      <p className="text-xs text-slate-600">Your most-used ingredients — always keep these stocked.</p>
      <div className="grid grid-cols-2 gap-2">
        {staples.map(({ name, count }, i) => (
          <div key={name} className="flex items-center gap-2 p-2 bg-slate-800/60 border border-white/5 rounded-xl">
            <span className="text-xs text-slate-600 w-4 text-center font-bold">#{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-200 capitalize truncate">{name}</p>
              <p className="text-[10px] text-slate-600">{count} recipe{count !== 1 ? 's' : ''}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
