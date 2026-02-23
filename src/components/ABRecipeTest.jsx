import React from 'react';
import { Loader2, CheckCircle, X } from 'lucide-react';

function RecipeCard({ recipe, image, onPick, label }) {
  return (
    <div className="flex flex-col bg-slate-900 border border-white/10 rounded-3xl overflow-hidden hover:border-orange-500/30 transition-all">
      <div className="relative h-48 bg-slate-800">
        {image ? (
          <img src={image} alt={recipe?.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 size={24} className="animate-spin text-slate-600" />
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">{label}</span>
        </div>
      </div>
      <div className="p-5 flex flex-col flex-1 space-y-3">
        <h3 className="font-bold text-lg leading-tight">{recipe?.name || '—'}</h3>
        <div className="flex gap-3 text-xs text-slate-500">
          {recipe?.time && <span>⏱ {recipe.time}</span>}
          {recipe?.difficulty && <span>📊 {recipe.difficulty}</span>}
          {recipe?.calories && <span>🔥 {recipe.calories}</span>}
        </div>
        <p className="text-sm text-slate-400 leading-relaxed flex-1">{recipe?.description}</p>
        <button
          onClick={onPick}
          disabled={!recipe}
          className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <CheckCircle size={16} />
          Choose this one →
        </button>
      </div>
    </div>
  );
}

export default function ABRecipeTest({ recipeA, imageA, recipeB, imageB, isLoading, onPickA, onPickB, onClose }) {
  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">A/B Recipe Test</h2>
            <p className="text-slate-400 text-sm">Generating two recipe options for you...</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <X size={20} />
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {['Option A', 'Option B'].map(label => (
            <div key={label} className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden">
              <div className="h-48 bg-slate-800 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-6 bg-slate-800 rounded animate-pulse w-3/4" />
                <div className="h-4 bg-slate-800 rounded animate-pulse w-1/2" />
                <div className="h-16 bg-slate-800 rounded animate-pulse" />
                <div className="h-10 bg-slate-800 rounded-2xl animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">A/B Recipe Test</h2>
          <p className="text-slate-400 text-sm">Two different takes — choose your favourite.</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
          <X size={20} />
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <RecipeCard recipe={recipeA} image={imageA} onPick={onPickA} label="Option A" />
        <RecipeCard recipe={recipeB} image={imageB} onPick={onPickB} label="Option B" />
      </div>
    </div>
  );
}
