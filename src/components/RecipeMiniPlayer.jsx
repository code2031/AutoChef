import React from 'react';
import { X, ChevronRight } from 'lucide-react';

export default function RecipeMiniPlayer({ recipe, recipeImage, onGoToRecipe, onDismiss }) {
  if (!recipe) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[150] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="flex items-center gap-3 bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-2.5 pr-3 max-w-[260px]">
        {recipeImage && (
          <img
            src={recipeImage}
            alt={recipe.name}
            className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">{recipe.name}</p>
          <p className="text-[10px] text-slate-500">
            {recipe.time || recipe.cookTime || '?'} · {recipe.difficulty || 'Recipe'}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onGoToRecipe}
            className="p-1.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-white transition-all"
            title="Go to recipe"
          >
            <ChevronRight size={13} />
          </button>
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            title="Dismiss"
          >
            <X size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
