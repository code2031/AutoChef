import React, { useEffect, useRef, useState } from 'react';
import { Flame, BookOpen, Timer, Sparkles, Image as ImageIcon, Loader2, ChefHat, Copy, Download, Check, Play, Pause } from 'lucide-react';
import confetti from 'canvas-confetti';
import StatsBar from './StatsBar.jsx';
import RecipeActions from './RecipeActions.jsx';
import CookingMode from './CookingMode.jsx';

function detectTimerSeconds(step) {
  const patterns = [
    /for\s+(\d+)-(\d+)\s+min/i,
    /for\s+(\d+)\s+min/i,
    /(\d+)-(\d+)\s+minutes?/i,
    /(\d+)\s+minutes?/i,
    /(\d+)\s+hour/i,
  ];
  for (const p of patterns) {
    const m = step.match(p);
    if (m) {
      const mins = parseInt(m[2] || m[1]);
      return (p.source.includes('hour') ? mins * 60 : mins) * 60;
    }
  }
  return null;
}

function InlineTimer({ seconds }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(intervalRef.current); setRunning(false); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <span
      onClick={() => setRunning(v => !v)}
      className={`inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-lg text-xs font-mono cursor-pointer transition-all select-none ${running ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
    >
      {running ? <Pause size={10} /> : <Play size={10} />}
      {fmt(timeLeft)}
    </span>
  );
}

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
  isRegeneratingImage,
  onSave,
  onRegenerate,
  onRegenerateImage,
  onRate,
  onReset,
  onVariantReady,
  ingredients,
  allergies,
  tempUnit,
}) {
  const confettiFired = useRef(false);
  const [checked, setChecked] = useState({});
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [copiedIngredients, setCopiedIngredients] = useState(false);

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

  // Reset confetti flag when recipe changes
  useEffect(() => {
    confettiFired.current = false;
    setTimeout(() => {
      setChecked({});
      setServingMultiplier(1);
    }, 0);
  }, [recipe?.name]);

  const toggleCheck = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));

  const copyIngredients = async () => {
    if (!recipe) return;
    const text = (recipe.ingredients || []).join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedIngredients(true);
    setTimeout(() => setCopiedIngredients(false), 2000);
  };

  const downloadRecipe = () => {
    if (!recipe) return;
    const lines = [
      recipe.name,
      '='.repeat(recipe.name.length),
      '',
      recipe.description,
      '',
      `Time: ${recipe.time} | Difficulty: ${recipe.difficulty} | Calories: ${recipe.calories} | Servings: ${recipe.servings}`,
      '',
      'INGREDIENTS',
      '-----------',
      ...(recipe.ingredients || []).map(i => `• ${i}`),
      '',
      'INSTRUCTIONS',
      '------------',
      ...(recipe.instructions || []).map((s, i) => `${i + 1}. ${s}`),
      '',
      `Chef's Tip: ${recipe.chefTip || ''}`,
      `Smart Sub: ${recipe.smartSub || ''}`,
      `Wine Pairing: ${recipe.winePairing || ''}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.name.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Highlight allergen words in an ingredient string
  const highlightAllergens = (text) => {
    if (!allergies || allergies.length === 0) return text;
    const allergenMap = {
      nuts: ['nut', 'almond', 'peanut', 'walnut', 'cashew', 'pecan', 'pistachio', 'hazelnut'],
      dairy: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'lactose'],
      eggs: ['egg', 'yolk'],
      shellfish: ['shrimp', 'crab', 'lobster', 'prawn', 'scallop', 'oyster', 'clam'],
      soy: ['soy', 'tofu', 'tempeh', 'miso', 'edamame'],
      gluten: ['wheat', 'flour', 'bread', 'pasta', 'barley', 'rye', 'oat'],
    };
    let lower = text.toLowerCase();
    for (const allergy of allergies) {
      const words = allergenMap[allergy] || [allergy];
      for (const w of words) {
        if (lower.includes(w)) {
          return { text, allergen: allergy };
        }
      }
    }
    return text;
  };

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

  if (!recipe) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const multiplierOptions = [0.5, 1, 2, 3];

  return (
    <>
      {showCookingMode && (
        <CookingMode recipe={recipe} onExit={() => setShowCookingMode(false)} />
      )}

      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Hero image */}
        <div className="recipe-hero w-full h-48 sm:h-64 md:h-96 rounded-3xl overflow-hidden relative bg-slate-900 border border-white/10">
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
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-lg">{recipe.name}</h2>
          </div>
        </div>
        {/* Recipe name shown in print */}
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
          onDownload={downloadRecipe}
          onVariantReady={onVariantReady}
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
          <StatsBar recipe={recipe} diet={diet} ingredients={ingredients} tempUnit={tempUnit} />
        </div>

        {/* Recipe grid */}
        <div className="grid md:grid-cols-3 gap-5 md:gap-8">
          {/* Ingredients */}
          <div className="md:col-span-1 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '200ms' }}>
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h4 className="flex items-center gap-2 font-bold text-lg">
                  <BookOpen size={18} className="text-orange-500" />
                  Ingredients
                </h4>
                <div className="flex items-center gap-2">
                  {/* Serving scaler */}
                  <div className="flex items-center gap-1">
                    {multiplierOptions.map(m => (
                      <button
                        key={m}
                        onClick={() => setServingMultiplier(m)}
                        className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${servingMultiplier === m ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-white'}`}
                      >
                        {m === 0.5 ? '½x' : `${m}x`}
                      </button>
                    ))}
                  </div>
                  {/* Copy button */}
                  <button
                    onClick={copyIngredients}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-all"
                    title="Copy ingredients"
                  >
                    {copiedIngredients ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              {servingMultiplier !== 1 && (
                <p className="text-xs text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg">
                  Showing {servingMultiplier}x quantities (recipe: {recipe.servings} servings)
                </p>
              )}
              <ul className="space-y-3">
                {(recipe.ingredients || []).map((ing, i) => {
                  const highlighted = highlightAllergens(ing);
                  const isHighlighted = typeof highlighted === 'object';
                  return (
                    <li
                      key={i}
                      onClick={() => toggleCheck(i)}
                      className={`flex gap-2 text-sm cursor-pointer transition-all select-none ${checked[i] ? 'line-through text-slate-600' : 'text-slate-300'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${checked[i] ? 'bg-slate-600' : 'bg-orange-500'}`} />
                      <span>
                        {isHighlighted ? (
                          <>
                            <span className="bg-red-500/20 text-red-300 px-1 rounded">{ing}</span>
                            <span className="ml-1 text-xs text-red-400">({highlighted.allergen})</span>
                          </>
                        ) : ing}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {Object.values(checked).some(Boolean) && (
                <p className="text-xs text-slate-500">
                  {Object.values(checked).filter(Boolean).length} / {(recipe.ingredients || []).length} checked
                </p>
              )}
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
                {(recipe.instructions || []).map((step, i) => {
                  const timerSecs = detectTimerSeconds(step);
                  return (
                    <div key={i} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-500 text-sm border border-white/5">
                        {i + 1}
                      </span>
                      <p className="text-slate-300 leading-relaxed pt-1">
                        {step}
                        {timerSecs && <InlineTimer key={`${recipe.name}-${i}`} seconds={timerSecs} />}
                      </p>
                    </div>
                  );
                })}
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
          &larr; Cook something else
        </button>
      </div>
    </>
  );
}
