import React, { useState, useEffect, useRef } from 'react';
import { X, ShoppingCart, Trash2, ChevronDown, ChevronUp, Check, Plus, Copy, Loader2 } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { buildSmartShoppingList } from '../lib/shoppingList.js';
import { generateMealPrepGuide, generateSmartMealPlan } from '../lib/groq.js';
import ShoppingIntegrations from './ShoppingIntegrations.jsx';
import MealPlanNutrition from './MealPlanNutrition.jsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

function buildShoppingList(plan, history) {
  const recipeIds = new Set();
  const items = [];
  Object.values(plan).forEach(dayMeals => {
    Object.values(dayMeals).forEach(entryId => {
      if (entryId && !recipeIds.has(entryId)) {
        recipeIds.add(entryId);
        const entry = history.find(h => h.id === entryId);
        if (entry?.recipe?.ingredients) {
          items.push({ name: entry.recipe.name, ingredients: entry.recipe.ingredients });
        }
      }
    });
  });
  return items;
}

export default function MealPlanner({ history, onClose, nutritionGoals }) {
  // plan shape: { Monday: { Breakfast: entryId | null, ... }, ... }
  const [plan, setPlan] = useLocalStorage('meal_plan', {});
  const [showList, setShowList] = useState(false);
  const [listCopied, setListCopied] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null); // tap-to-assign selection
  const [prepGuide, setPrepGuide] = useState(null);
  const [isLoadingPrepGuide, setIsLoadingPrepGuide] = useState(false);
  const [showPrepGuide, setShowPrepGuide] = useState(false);
  const [expandedDays, setExpandedDays] = useState(() => {
    const d = new Date();
    const idx = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
    return new Set([DAYS[idx]]);
  });

  // AI Fill state
  const [isAIFilling, setIsAIFilling] = useState(false);
  const [aiPlanPreview, setAIPlanPreview] = useState(null);

  // Drag-and-drop state and refs
  const [highlightedSlot, setHighlightedSlot] = useState(null);
  const [draggedEntry, setDraggedEntry] = useState(null);
  const dragRef = useRef(null);
  const dragTimerRef = useRef(null);
  const ghostRef = useRef(null);

  const getSlot = (day, meal) => plan[day]?.[meal] ?? null;
  const setSlot = (day, meal, entryId) => {
    setPlan(prev => ({
      ...prev,
      [day]: { ...(prev[day] || {}), [meal]: entryId },
    }));
  };
  const clearSlot = (day, meal) => setSlot(day, meal, null);

  const toggleDay = (day) => {
    setExpandedDays(prev => {
      const next = new Set(prev);
      next.has(day) ? next.delete(day) : next.add(day);
      return next;
    });
  };

  // Tap-to-assign: click recipe → select it; click slot → assign; click same recipe → deselect
  const handleRecipeTap = (entry) => {
    setSelectedEntry(prev => prev?.id === entry.id ? null : entry);
  };

  const handleSlotTap = (day, meal) => {
    if (!selectedEntry) return;
    setSlot(day, meal, selectedEntry.id);
    setSelectedEntry(null);
  };

  const getEntry = (entryId) => history.find(h => h.id === entryId) || null;

  const totalAssigned = Object.values(plan).flatMap(d => Object.values(d)).filter(Boolean).length;

  // Reset prep guide when plan changes
  useEffect(() => {
    setTimeout(() => setPrepGuide(null), 0);
  }, [plan]);

  const handleGeneratePrepGuide = async () => {
    const meals = [];
    DAYS.forEach(day => {
      MEALS.forEach(meal => {
        const entryId = plan[day]?.[meal];
        if (entryId) {
          const entry = getEntry(entryId);
          if (entry?.recipe) {
            meals.push({
              day,
              mealType: meal,
              recipeName: entry.recipe.name,
              ingredients: entry.recipe.ingredients || [],
            });
          }
        }
      });
    });
    if (meals.length === 0) return;
    setIsLoadingPrepGuide(true);
    try {
      const guide = await generateMealPrepGuide(meals);
      setTimeout(() => setPrepGuide(guide), 0);
      setShowPrepGuide(true);
    } catch { /* ignore */ } finally {
      setIsLoadingPrepGuide(false);
    }
  };

  // AI Fill handler
  const handleAIFill = async () => {
    setIsAIFilling(true);
    try {
      const pantryItems = (() => {
        try { return JSON.parse(localStorage.getItem('pantry_items') || '[]').map(p => typeof p === 'string' ? p : (p.name || '')).filter(Boolean); }
        catch { return []; }
      })();
      const nutritionGoalsRaw = (() => { try { return JSON.parse(localStorage.getItem('pref_nutrition_goals') || 'null'); } catch { return null; } })();
      const result = await generateSmartMealPlan(pantryItems, nutritionGoalsRaw, {});
      // generateSmartMealPlan returns the plan object directly (not {plan: ...})
      if (result && Object.keys(result).length > 0) setAIPlanPreview(result);
    } catch { /* empty */ }
    setIsAIFilling(false);
  };

  const applyAIPlan = () => {
    if (!aiPlanPreview) return;
    const newPlan = { ...plan };
    Object.entries(aiPlanPreview).forEach(([day, meals]) => {
      if (!newPlan[day]) newPlan[day] = {};
      Object.entries(meals).forEach(([meal, recipeName]) => {
        if (newPlan[day][meal]) return;
        const match = history.find(e => e.recipe?.name?.toLowerCase() === recipeName?.toLowerCase());
        if (match) newPlan[day][meal] = match.id;
      });
    });
    setPlan(newPlan);
    setAIPlanPreview(null);
  };

  // Desktop drag handlers
  const handleDragStart = (e, entry) => {
    setDraggedEntry(entry);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', entry.id);
  };

  const handleDragOver = (e, day, meal) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setHighlightedSlot({ day, meal });
  };

  const handleDragLeave = () => setHighlightedSlot(null);

  const handleDrop = (e, day, meal) => {
    e.preventDefault();
    if (draggedEntry) {
      setSlot(day, meal, draggedEntry.id);
    }
    setDraggedEntry(null);
    setHighlightedSlot(null);
  };

  const handleDragEnd = () => {
    setDraggedEntry(null);
    setHighlightedSlot(null);
  };

  // Mobile touch drag handlers
  const handleTouchStart = (e, entry) => {
    const touch = e.touches[0];
    dragTimerRef.current = setTimeout(() => {
      dragRef.current = entry;
      const ghost = document.createElement('div');
      ghost.style.cssText = 'position:fixed;z-index:9999;pointer-events:none;background:rgba(249,115,22,0.15);border:2px solid rgba(249,115,22,0.5);border-radius:12px;padding:8px 12px;color:white;font-size:12px;font-weight:600;white-space:nowrap;transform:translateX(-50%)';
      ghost.textContent = (entry.recipe?.name || 'Recipe').slice(0, 25);
      ghost.style.left = touch.clientX + 'px';
      ghost.style.top = (touch.clientY - 40) + 'px';
      document.body.appendChild(ghost);
      ghostRef.current = ghost;
    }, 150);
  };

  const handleTouchMove = (e) => {
    if (!dragRef.current) return;
    e.preventDefault();
    const touch = e.touches[0];
    if (ghostRef.current) {
      ghostRef.current.style.left = touch.clientX + 'px';
      ghostRef.current.style.top = (touch.clientY - 40) + 'px';
    }
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const slot = el?.closest('[data-drop-slot]');
    if (slot) {
      const day = slot.dataset.day;
      const meal = slot.dataset.meal;
      if (day && meal) setHighlightedSlot({ day, meal });
    } else {
      setHighlightedSlot(null);
    }
  };

  const handleTouchEnd = (e) => {
    clearTimeout(dragTimerRef.current);
    if (ghostRef.current) { document.body.removeChild(ghostRef.current); ghostRef.current = null; }
    if (!dragRef.current) return;
    const touch = e.changedTouches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const slot = el?.closest('[data-drop-slot]');
    if (slot) {
      const day = slot.dataset.day;
      const meal = slot.dataset.meal;
      if (day && meal) setSlot(day, meal, dragRef.current.id);
    }
    dragRef.current = null;
    setHighlightedSlot(null);
  };

  const shoppingList = buildShoppingList(plan, history);

  return (
    <div className="space-y-6" onClick={e => {
      // Deselect if clicking outside recipe cards and slots
      if (!e.target.closest('[data-recipe-card]') && !e.target.closest('[data-drop-slot]') && !e.target.closest('[data-clear-slot]')) {
        setSelectedEntry(null);
      }
    }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meal Planner</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            {selectedEntry
              ? <span className="text-orange-400 font-medium">Tap a meal slot to assign "{selectedEntry.recipe?.name}"</span>
              : 'Tap a recipe, then tap a meal slot to assign it'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleAIFill}
            disabled={isAIFilling}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-indigo-500/20 transition-all disabled:opacity-50"
          >
            {isAIFilling ? <Loader2 size={15} className="animate-spin" /> : '🤖'}
            {isAIFilling ? 'Planning...' : 'AI Fill'}
          </button>
          {totalAssigned >= 3 && (
            <button
              onClick={handleGeneratePrepGuide}
              disabled={isLoadingPrepGuide}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-50 ${showPrepGuide && prepGuide ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'bg-slate-800 border border-white/10 text-slate-400 hover:text-white'}`}
            >
              {isLoadingPrepGuide ? <Loader2 size={15} className="animate-spin" /> : '🗓️'}
              {isLoadingPrepGuide ? 'Generating...' : 'Prep Guide'}
            </button>
          )}
          {shoppingList.length > 0 && (
            <button
              onClick={() => setShowList(v => !v)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${showList ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-slate-800 border border-white/10 text-slate-400 hover:text-white'}`}
            >
              <ShoppingCart size={16} />
              Shopping List
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Shopping List */}
      {showList && shoppingList.length > 0 && (() => {
        const allIngredients = shoppingList.flatMap(r => r.ingredients);
        const byAisle = buildSmartShoppingList(allIngredients);
        const copyAll = () => {
          const lines = Object.entries(byAisle).flatMap(([aisle, ings]) => [aisle + ':', ...ings.map(i => '  • ' + i), '']);
          navigator.clipboard?.writeText(lines.join('\n'));
          setListCopied(true);
          setTimeout(() => setListCopied(false), 2000);
        };
        return (
          <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-green-400 flex items-center gap-2"><ShoppingCart size={16} /> Smart Shopping List</h3>
              <button onClick={copyAll} className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-slate-800 rounded-xl text-slate-400 hover:text-white transition-all">
                <Copy size={12} />{listCopied ? 'Copied!' : 'Copy All'}
              </button>
            </div>
            {Object.entries(byAisle).map(([aisle, ings]) => (
              <div key={aisle} className="space-y-1.5">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{aisle}</p>
                <ul className="space-y-1">
                  {ings.map((ing, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="text-slate-600 mt-0.5">•</span>
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <ShoppingIntegrations items={allIngredients} />
          </div>
        );
      })()}

      {/* AI Plan Preview */}
      {aiPlanPreview && (
        <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-4 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <p className="text-sm font-bold text-indigo-400">🤖 AI Meal Plan Preview</p>
            <button onClick={() => setAIPlanPreview(null)} className="text-slate-500 hover:text-slate-300 text-xs">✕</button>
          </div>
          <p className="text-xs text-slate-500">Matched dishes from your saved recipes will be assigned. Empty slots won't be changed.</p>
          <div className="space-y-1">
            {Object.entries(aiPlanPreview).slice(0, 3).map(([day, meals]) => (
              <div key={day} className="text-xs text-slate-400">
                <span className="font-medium text-slate-300">{day}:</span> {Object.values(meals).join(' · ')}
              </div>
            ))}
            {Object.keys(aiPlanPreview).length > 3 && <p className="text-xs text-slate-600">+ {Object.keys(aiPlanPreview).length - 3} more days</p>}
          </div>
          <button
            onClick={applyAIPlan}
            className="w-full py-2 bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-bold rounded-xl transition-all"
          >
            Apply Plan
          </button>
        </div>
      )}

      {/* Nutrition Overview */}
      <MealPlanNutrition plan={plan} history={history} nutritionGoals={nutritionGoals} />

      {/* Prep Guide */}
      {showPrepGuide && prepGuide && (
        <div className="bg-slate-900/60 border border-purple-500/20 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-purple-400 flex items-center gap-2">🗓️ Meal Prep Guide</h3>
            <button onClick={() => setShowPrepGuide(false)} className="text-slate-400 hover:text-white text-xs transition-colors">✕</button>
          </div>
          {prepGuide.prepDays && prepGuide.prepDays.length > 0 && (
            <div className="space-y-3">
              {prepGuide.prepDays.map((dayPlan, i) => (
                <div key={i} className="space-y-1.5">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{dayPlan.day}</p>
                  <ul className="space-y-1">
                    {(dayPlan.tasks || []).map((task, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-slate-300">
                        <span className="text-slate-500 mt-0.5 shrink-0">☐</span>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
          {prepGuide.makeAheadItems && prepGuide.makeAheadItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Make Ahead</p>
              <div className="flex flex-wrap gap-2">
                {prepGuide.makeAheadItems.map((item, i) => (
                  <span key={i} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/15 text-purple-300 rounded-full text-xs">{item}</span>
                ))}
              </div>
            </div>
          )}
          {prepGuide.shoppingTip && (
            <div className="p-3 bg-slate-800/40 rounded-xl">
              <p className="text-xs text-slate-400"><span className="text-amber-400 font-medium">💡 Shopping tip:</span> {prepGuide.shoppingTip}</p>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Saved recipes sidebar */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Saved Recipes</p>
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">No saved recipes yet. Save some recipes first!</p>
          ) : (
            <div className="space-y-2 max-h-[40vh] lg:max-h-[60vh] overflow-y-auto pr-1">
              {history.map(entry => {
                const isSelected = selectedEntry?.id === entry.id;
                return (
                  <button
                    key={entry.id}
                    data-recipe-card="true"
                    draggable
                    onClick={() => handleRecipeTap(entry)}
                    onDragStart={e => handleDragStart(e, entry)}
                    onDragEnd={handleDragEnd}
                    onTouchStart={e => handleTouchStart(e, entry)}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left group select-none ${
                      isSelected
                        ? 'bg-orange-500/15 border-orange-500/50 shadow-lg shadow-orange-500/10'
                        : 'bg-slate-800 border-white/5 hover:border-orange-500/30 hover:bg-slate-700/60'
                    }`}
                  >
                    <div className={`shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      isSelected ? 'border-orange-500 bg-orange-500' : 'border-slate-600 group-hover:border-slate-400'
                    }`}>
                      {isSelected && <Check size={11} className="text-white" strokeWidth={3} />}
                    </div>
                    {entry.imageUrl && (
                      <img src={entry.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isSelected ? 'text-orange-200' : 'text-slate-200'}`}>{entry.recipe?.name}</p>
                      <p className="text-xs text-slate-500">{entry.recipe?.time || '—'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
          {selectedEntry && (
            <p className="text-xs text-orange-400 pt-1 animate-pulse">
              ↓ Tap a meal slot below to assign
            </p>
          )}
          {!selectedEntry && history.length > 0 && (
            <p className="text-xs text-slate-600 pt-1">
              Tap a recipe to select it, then tap a slot
            </p>
          )}
        </div>

        {/* Weekly grid */}
        <div className="space-y-2">
          {DAYS.map(day => {
            const expanded = expandedDays.has(day);
            const filledCount = MEALS.filter(m => getSlot(day, m)).length;
            return (
              <div key={day} className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleDay(day)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/2 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm">{day}</span>
                    {filledCount > 0 && (
                      <span className="text-xs text-orange-400 font-medium">{filledCount}/{MEALS.length} meals</span>
                    )}
                  </div>
                  {expanded ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
                </button>

                {expanded && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 px-4 pb-4">
                    {MEALS.map(meal => {
                      const slotId = getSlot(day, meal);
                      const entry = slotId ? getEntry(slotId) : null;
                      const isAssignable = !!selectedEntry;
                      const isHighlighted = highlightedSlot?.day === day && highlightedSlot?.meal === meal;

                      return (
                        <div
                          key={meal}
                          data-drop-slot="true"
                          data-day={day}
                          data-meal={meal}
                          onClick={() => handleSlotTap(day, meal)}
                          onDragOver={e => handleDragOver(e, day, meal)}
                          onDragLeave={handleDragLeave}
                          onDrop={e => handleDrop(e, day, meal)}
                          className={`min-h-[80px] rounded-xl border-2 transition-all relative ${
                            isHighlighted
                              ? 'border-indigo-500 bg-indigo-500/10'
                              : isAssignable
                              ? 'border-orange-500/50 bg-orange-500/5 cursor-pointer hover:bg-orange-500/10 hover:border-orange-500/70'
                              : entry
                              ? 'border-white/10 bg-slate-800/60'
                              : 'border-dashed border-white/5 bg-slate-800/20'
                          }`}
                        >
                          <p className="absolute top-1.5 left-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{meal}</p>
                          {isAssignable && !entry && (
                            <div className="flex items-center justify-center h-full pt-5 pb-2">
                              <Plus size={16} className="text-orange-500/60" />
                            </div>
                          )}
                          {entry ? (
                            <div className="pt-6 px-2 pb-2 flex sm:block items-center gap-3">
                              {entry.imageUrl && (
                                <img src={entry.imageUrl} alt="" className="w-16 h-16 sm:w-full sm:h-12 object-cover rounded-lg mb-0 sm:mb-1.5 shrink-0" />
                              )}
                              <div>
                                <p className="text-xs text-slate-300 font-medium leading-tight line-clamp-2">{entry.recipe?.name}</p>
                                <button
                                  data-clear-slot="true"
                                  onClick={e => { e.stopPropagation(); clearSlot(day, meal); }}
                                  className="mt-1 flex items-center gap-1 text-[10px] text-slate-600 hover:text-red-400 transition-colors"
                                >
                                  <Trash2 size={10} /> Remove
                                </button>
                              </div>
                            </div>
                          ) : !isAssignable && !isHighlighted ? (
                            <div className="flex items-center justify-center h-full pt-5 pb-2">
                              <p className="text-xs text-slate-600">Empty</p>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
