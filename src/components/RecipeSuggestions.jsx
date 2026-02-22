import React from 'react';
import { ChefHat, ArrowRight, Loader2 } from 'lucide-react';

export default function RecipeSuggestions({ suggestions, isLoading, onSelect, onSkip }) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-4">
        <Loader2 size={32} className="animate-spin text-orange-500" />
        <p className="text-slate-400">Brainstorming recipe ideas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Pick your dish</h2>
        <p className="text-slate-400 text-sm">Choose a recipe to generate, or skip for a random one.</p>
      </div>

      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => onSelect(s)}
            className="w-full text-left p-5 bg-slate-900 border border-white/5 rounded-2xl hover:border-orange-500/40 hover:bg-orange-500/5 transition-all group flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm shrink-0">
                {i + 1}
              </div>
              <div>
                <div className="font-bold text-white group-hover:text-orange-300 transition-colors">{s.name}</div>
                <div className="text-sm text-slate-400 mt-0.5">{s.description}</div>
              </div>
            </div>
            <ArrowRight size={18} className="text-slate-600 group-hover:text-orange-400 shrink-0 transition-colors" />
          </button>
        ))}
      </div>

      <button
        onClick={onSkip}
        className="w-full py-3 text-sm text-slate-400 hover:text-white border border-white/5 rounded-xl hover:bg-white/5 transition-all"
      >
        Surprise me, pick one at random
      </button>
    </div>
  );
}
