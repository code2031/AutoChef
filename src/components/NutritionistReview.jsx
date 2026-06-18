import React, { useState } from 'react';
import { Stethoscope, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import { generateNutritionistReview } from '../lib/groq.js';

// Round 10: lazy AI "dietitian review" card. Button-triggered so it only
// fires when the user opts in. Reset by key={recipe.name} in ResultView.
export default function NutritionistReview({ recipe }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);

  const load = async () => {
    if (open) { setOpen(false); return; }
    setOpen(true);
    if (data || loading) return;
    setLoading(true);
    try {
      const r = await generateNutritionistReview(recipe);
      setData(r);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  const score = data && Number(data.score);
  const scoreColor = score >= 8 ? 'text-green-400' : score >= 5 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl overflow-hidden">
      <button onClick={load} className="w-full flex items-center justify-between p-4 text-sm font-bold text-emerald-400">
        <span className="flex items-center gap-2"><Stethoscope size={16} /> Dietitian&apos;s Review</span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3">
          {loading && <div className="flex items-center gap-2 text-xs text-slate-500"><Loader2 size={12} className="animate-spin" /> Reviewing nutrition…</div>}
          {data && !loading && (
            <>
              <div className="flex items-center gap-3">
                {Number.isFinite(score) && (
                  <div className="shrink-0 w-12 h-12 rounded-full border-2 border-emerald-500/40 flex items-center justify-center">
                    <span className={`text-lg font-black ${scoreColor}`}>{score}</span>
                  </div>
                )}
                <p className="text-sm text-slate-300 italic">{data.verdict}</p>
              </div>
              {Array.isArray(data.positives) && data.positives.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-green-400 mb-1">Strengths</p>
                  <ul className="space-y-1">
                    {data.positives.map((p, i) => <li key={i} className="text-xs text-slate-400 flex gap-2"><span className="text-green-500 shrink-0">✓</span>{p}</li>)}
                  </ul>
                </div>
              )}
              {Array.isArray(data.improvements) && data.improvements.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-amber-400 mb-1">To make it healthier</p>
                  <ul className="space-y-1">
                    {data.improvements.map((p, i) => <li key={i} className="text-xs text-slate-400 flex gap-2"><span className="text-amber-500 shrink-0">→</span>{p}</li>)}
                  </ul>
                </div>
              )}
              {!data.verdict && <p className="text-xs text-slate-500">No review available.</p>}
            </>
          )}
        </div>
      )}
    </div>
  );
}
