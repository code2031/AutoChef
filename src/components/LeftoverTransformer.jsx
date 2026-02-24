import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { generateLeftoverIdeas } from '../lib/groq.js';

export default function LeftoverTransformer({ recipe, onGenerateLeftover }) {
  const [open, setOpen] = useState(false);
  const [ideas, setIdeas] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLoad = async () => {
    if (ideas !== null || isLoading) return;
    setIsLoading(true);
    try {
      const result = await generateLeftoverIdeas(recipe);
      setIdeas(result || []);
    } catch {
      setIdeas([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !open;
    setOpen(next);
    if (next && ideas === null && !isLoading) handleLoad();
  };

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/2 transition-all"
      >
        <span className="font-semibold text-sm flex items-center gap-2">
          ♻️ Leftover Ideas
          <span className="text-xs text-slate-500 font-normal">Turn tonight's dinner into tomorrow's lunch</span>
        </span>
        {open ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>

      {open && (
        <div className="px-5 pb-5 animate-in fade-in duration-200">
          {isLoading && (
            <div className="flex items-center gap-2 py-4 text-slate-400 text-sm">
              <Loader2 size={16} className="animate-spin text-orange-400" />
              Finding creative leftover ideas…
            </div>
          )}

          {!isLoading && ideas && ideas.length === 0 && (
            <p className="text-sm text-slate-500 py-4">No ideas found. Try regenerating.</p>
          )}

          {!isLoading && ideas && ideas.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-3 pt-1">
              {ideas.map((idea, i) => (
                <div key={i} className="bg-slate-800/60 border border-white/5 rounded-xl p-4 space-y-2 flex flex-col">
                  <p className="font-bold text-sm text-white">{idea.name}</p>
                  <p className="text-xs text-slate-400 italic leading-relaxed flex-1">{idea.description}</p>
                  {idea.keyTransformation && (
                    <p className="text-xs text-orange-400/80 border-t border-white/5 pt-2 mt-auto">
                      🔄 {idea.keyTransformation}
                    </p>
                  )}
                  <button
                    onClick={() => onGenerateLeftover(idea.name, recipe)}
                    className="mt-2 w-full py-2 bg-orange-500/15 hover:bg-orange-500/25 border border-orange-500/20 text-orange-400 text-xs font-bold rounded-lg transition-all"
                  >
                    Cook This →
                  </button>
                </div>
              ))}
            </div>
          )}

          {!isLoading && ideas === null && (
            <button
              onClick={handleLoad}
              className="mt-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-slate-300 text-sm rounded-xl transition-all"
            >
              Generate Ideas
            </button>
          )}
        </div>
      )}
    </div>
  );
}
