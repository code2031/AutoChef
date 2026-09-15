import React, { useState } from 'react';
import { FlaskConical, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { generateCookingScience } from '../lib/groq.js';

// Round 10: lazy AI card explaining the food science behind a recipe's key
// steps (Maillard, emulsification, gluten, etc.). Opt-in / button-triggered.
export default function CookingScienceCard({ recipe }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState(null);

  const load = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (insights || loading) return;
    setLoading(true);
    try {
      const r = await generateCookingScience(recipe);
      setInsights(Array.isArray(r) ? r : []);
    } catch { setInsights([]); } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-violet-500/5 border border-violet-500/20 rounded-2xl overflow-hidden">
      <button onClick={load} className="w-full flex items-center justify-between p-4 text-sm font-bold text-violet-400">
        <span className="flex items-center gap-2"><FlaskConical size={16} /> The Science Behind It</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {loading && <div className="flex items-center gap-2 text-xs text-slate-500"><Loader2 size={12} className="animate-spin" /> Consulting the lab…</div>}
          {insights && !loading && insights.length > 0 && insights.map((s, i) => (
            <div key={i} className="bg-slate-800/40 border border-white/5 rounded-xl p-3 space-y-1">
              <p className="text-sm font-bold text-violet-300">{s.title}</p>
              <p className="text-xs text-slate-300">{s.science}</p>
              {s.tip && <p className="text-xs text-slate-500 italic">💡 {s.tip}</p>}
            </div>
          ))}
          {insights && !loading && insights.length === 0 && <p className="text-xs text-slate-500">No insights available.</p>}
        </div>
      )}
    </div>
  );
}
