import React, { useState, useEffect } from 'react';
import { X, Star, Clock, Package, Loader2, Check } from 'lucide-react';
import { generateStorageTips } from '../lib/groq.js';

export default function PostCookingSummary({ recipe, recipeImage, cookingDurationMs, onRate, onLogMeal, onClose }) {
  const [stars, setStars] = useState(0);
  const [hoverStar, setHoverStar] = useState(0);
  const [storageTips, setStorageTips] = useState(null);
  const [loadingTips, setLoadingTips] = useState(true);
  const [logged, setLogged] = useState(false);
  const [pantryChecked, setPantryChecked] = useState({});
  const [pantryRemoved, setPantryRemoved] = useState(false);

  // Find matching pantry items
  const rawPantryStr = typeof window !== 'undefined' ? localStorage.getItem('pantry_items') : null;
  const rawPantry = rawPantryStr ? (() => { try { return JSON.parse(rawPantryStr); } catch { return []; } })() : [];
  const pantryNames = rawPantry.map(p => typeof p === 'string' ? p : (p.name || '')).filter(Boolean);
  const matchedPantry = recipe ? pantryNames.filter(name =>
    (recipe.ingredients || []).some(ing => ing.toLowerCase().includes(name.toLowerCase()))
  ) : [];

  const handleRemoveUsed = () => {
    const toRemove = matchedPantry.filter(name => pantryChecked[name] !== false);
    const remaining = rawPantry.filter(p => {
      const name = typeof p === 'string' ? p : (p.name || '');
      return !toRemove.includes(name);
    });
    localStorage.setItem('pantry_items', JSON.stringify(remaining));
    setPantryRemoved(true);
  };

  useEffect(() => {
    if (!recipe) return;
    setTimeout(() => setLoadingTips(true), 0);
    generateStorageTips(recipe)
      .then(tips => setStorageTips(tips))
      .catch(() => setStorageTips([]))
      .finally(() => setLoadingTips(false));
  }, [recipe?.name]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDuration = (ms) => {
    if (!ms) return null;
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const handleStarClick = (n) => {
    setStars(n);
    if (onRate) {
      onRate(n >= 4 ? 'up' : 'down');
    }
  };

  const handleLogMeal = () => {
    if (!recipe || logged) return;
    const mealData = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      name: recipe.name,
      calories: recipe.calories ? String(recipe.calories) : '',
      protein: recipe.nutrition?.protein ? String(recipe.nutrition.protein).replace(/\D/g, '') : '',
      carbs: recipe.nutrition?.carbs ? String(recipe.nutrition.carbs).replace(/\D/g, '') : '',
      fat: recipe.nutrition?.fat ? String(recipe.nutrition.fat).replace(/\D/g, '') : '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    if (onLogMeal) onLogMeal(mealData);
    setLogged(true);
  };

  const duration = formatDuration(cookingDurationMs);

  if (!recipe) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        {/* Header image */}
        {recipeImage && (
          <div className="h-40 relative overflow-hidden">
            <img src={recipeImage} alt={recipe.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🎉</span>
                <p className="font-bold text-white text-lg leading-tight">{recipe.name}</p>
              </div>
            </div>
          </div>
        )}

        {!recipeImage && (
          <div className="p-5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎉</span>
              <p className="font-bold text-white text-lg">{recipe.name}</p>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 p-1.5 bg-slate-900/80 rounded-full text-slate-400 hover:text-white transition-all"
        >
          <X size={16} />
        </button>

        <div className="p-5 space-y-5 overflow-y-auto max-h-[55vh]">
          {/* Congratulations + duration */}
          <div className="text-center space-y-1">
            <p className="text-slate-300 text-sm font-medium">You nailed it! Dish complete.</p>
            {duration && (
              <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
                <Clock size={12} />
                <span>Took you <span className="text-orange-400 font-medium">{duration}</span></span>
              </div>
            )}
          </div>

          {/* Star rating */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest text-center">How did it turn out?</p>
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map(n => (
                <button
                  key={n}
                  onMouseEnter={() => setHoverStar(n)}
                  onMouseLeave={() => setHoverStar(0)}
                  onClick={() => handleStarClick(n)}
                  className="transition-transform hover:scale-125"
                >
                  <Star
                    size={28}
                    className={`transition-colors ${(hoverStar || stars) >= n ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`}
                  />
                </button>
              ))}
            </div>
            {stars > 0 && (
              <p className="text-center text-xs text-slate-400 animate-in fade-in duration-200">
                {stars === 5 ? 'Perfect! Restaurant worthy!' : stars === 4 ? 'Really good!' : stars === 3 ? 'Solid cook!' : stars === 2 ? 'Room to improve.' : 'Better luck next time!'}
              </p>
            )}
          </div>

          {/* Log meal */}
          <button
            onClick={handleLogMeal}
            disabled={logged}
            className={`w-full py-2.5 rounded-xl text-sm font-medium transition-all border ${logged ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'}`}
          >
            {logged ? '✓ Logged to Food Log' : `📋 Log "${recipe.name}" to Food Log`}
          </button>

          {/* Pantry Depletion */}
          {matchedPantry.length > 0 && !pantryRemoved && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">🧺 Used from Pantry?</p>
              <p className="text-xs text-slate-500">Remove items you used from your pantry:</p>
              <div className="space-y-1.5">
                {matchedPantry.map(name => (
                  <label key={name} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      defaultChecked
                      onChange={e => setPantryChecked(prev => ({ ...prev, [name]: e.target.checked }))}
                      className="w-4 h-4 rounded accent-orange-500"
                    />
                    <span className="text-xs text-slate-300 capitalize">{name}</span>
                  </label>
                ))}
              </div>
              <button
                onClick={handleRemoveUsed}
                className="w-full py-2 bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 rounded-xl text-xs font-medium transition-all"
              >
                Remove Used Items from Pantry
              </button>
            </div>
          )}
          {pantryRemoved && (
            <div className="flex items-center gap-2 py-1">
              <Check size={13} className="text-green-400" />
              <span className="text-xs text-green-400">Pantry updated!</span>
            </div>
          )}

          {/* Storage tips */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package size={14} className="text-slate-400" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Leftover Storage Tips</p>
            </div>
            {loadingTips ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 size={13} className="animate-spin text-orange-400" />
                <span className="text-xs text-slate-500">Getting storage tips...</span>
              </div>
            ) : storageTips && storageTips.length > 0 ? (
              <div className="space-y-2">
                {storageTips.map((tip, i) => (
                  <div key={i} className="p-3 bg-slate-800/60 border border-white/5 rounded-xl space-y-1">
                    <p className="text-sm font-medium text-slate-200">{tip.component}</p>
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5">
                      <span className="text-xs text-slate-400">📦 {tip.container}</span>
                      <span className="text-xs text-slate-400">🌡️ {tip.temperature}</span>
                      <span className="text-xs text-orange-400">⏱ {tip.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600">Store in an airtight container in the fridge for up to 3 days.</p>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-white/5">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium rounded-xl transition-all"
          >
            Back to Recipe
          </button>
        </div>
      </div>
    </div>
  );
}
