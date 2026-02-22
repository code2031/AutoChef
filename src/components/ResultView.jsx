import React, { useEffect, useRef } from 'react';
import { Flame, BookOpen, Timer, Sparkles, Image as ImageIcon, Loader2, ChefHat } from 'lucide-react';
import confetti from 'canvas-confetti';
import StatsBar from './StatsBar.jsx';
import RecipeActions from './RecipeActions.jsx';
import CookingMode from './CookingMode.jsx';

export default function ResultView({
  recipe,
  recipeImage,
  isGenerating,
  isGeneratingImage,
  diet,
  isSaved,
  rating,
  totalLikes,
  totalDislikes,
  showCookingMode,
  setShowCookingMode,
  isRegenerating,
  isRegeneratingImage,
  onSave,
  onRegenerate,
  onRegenerateImage,
  onRate,
  onReset,
}) {
  const confettiFired = useRef(false);

  // Fire confetti when recipe + image both load
  useEffect(() => {
    if (recipe && !isGenerating && !isGeneratingImage && !confettiFired.current) {
      confettiFired.current = true;
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.4 },
        colors: ['#f97316', '#ef4444', '#fbbf24', '#ffffff'],
      });
    }
  }, [recipe, isGenerating, isGeneratingImage]);

  // Reset confetti flag when recipe changes (new generation)
  useEffect(() => {
    confettiFired.current = false;
  }, [recipe?.name]);

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Flame className="text-orange-500 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold">Groq is thinking...</h3>
          <p className="text-slate-400">Creating a masterpiece from your ingredients.</p>
        </div>
      </div>
    );
  }

  if (!recipe) return null;

  return (
    <>
      {showCookingMode && (
        <CookingMode recipe={recipe} onExit={() => setShowCookingMode(false)} />
      )}

      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Hero image */}
        <div className="recipe-hero w-full h-64 md:h-96 rounded-3xl overflow-hidden relative bg-slate-900 border border-white/10">
          {recipeImage && (
            <img
              src={recipeImage}
              alt={recipe.name}
              className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000"
            />
          )}
          {isGeneratingImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 space-y-4 no-print">
              <div className="text-orange-500 animate-bounce"><ImageIcon size={32} /></div>
              <p className="text-slate-400 font-medium flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Rendering your dish...
              </p>
            </div>
          )}
          {!recipeImage && !isGeneratingImage && (
            <div className="absolute inset-0 flex items-center justify-center no-print">
              <ImageIcon size={48} className="text-slate-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none no-print" />
          <div className="absolute bottom-6 left-6 right-6 no-print">
            <h2 className="text-4xl md:text-5xl font-black text-white drop-shadow-lg">{recipe.name}</h2>
          </div>
        </div>
        {/* Recipe name shown in print (replaces overlay) */}
        <h2 className="hidden print-only text-3xl font-black text-black">{recipe.name}</h2>

        {/* Actions */}
        <RecipeActions
          recipe={recipe}
          recipeImage={recipeImage}
          isSaved={isSaved}
          rating={rating}
          totalLikes={totalLikes}
          totalDislikes={totalDislikes}
          onSave={onSave}
          onRegenerate={onRegenerate}
          onRegenerateImage={onRegenerateImage}
          onRate={onRate}
          isRegenerating={isRegenerating}
          isRegeneratingImage={isRegeneratingImage}
        />

        {/* Description */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '100ms' }}>
          <p className="text-slate-300 italic text-lg leading-relaxed">{recipe.description}</p>
          <button
            onClick={() => setShowCookingMode(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20"
          >
            <ChefHat size={16} />
            Start Cooking Mode
          </button>
        </div>

        {/* Stats */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '150ms' }}>
          <StatsBar recipe={recipe} diet={diet} />
        </div>

        {/* Recipe grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Ingredients */}
          <div className="md:col-span-1 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '200ms' }}>
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-4">
              <h4 className="flex items-center gap-2 font-bold text-lg border-b border-white/5 pb-2">
                <BookOpen size={18} className="text-orange-500" />
                Ingredients
              </h4>
              <ul className="space-y-3">
                {(recipe.ingredients || []).map((ing, i) => (
                  <li key={i} className="flex gap-2 text-sm text-slate-300">
                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 shrink-0" />
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-orange-500/5 border border-orange-500/20 p-5 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-orange-400">Smart Substitution</h4>
              <p className="text-sm text-slate-300">{recipe.smartSub}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="md:col-span-2 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '250ms' }}>
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-6">
              <h4 className="flex items-center gap-2 font-bold text-lg border-b border-white/5 pb-2">
                <Timer size={18} className="text-orange-500" />
                Instructions
              </h4>
              <div className="space-y-5">
                {(recipe.instructions || []).map((step, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-500 text-sm border border-white/5">
                      {i + 1}
                    </span>
                    <p className="text-slate-300 leading-relaxed pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '300ms' }}>
              <Sparkles className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="font-bold text-sm text-blue-400">Chef's Pro Tip</h4>
                <p className="text-sm text-slate-300 italic">{recipe.chefTip}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back button */}
        <button
          onClick={onReset}
          className="text-slate-500 text-sm hover:text-white transition-colors"
        >
          ← Cook something else
        </button>
      </div>
    </>
  );
}
