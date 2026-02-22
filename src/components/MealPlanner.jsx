import React, { useState } from 'react';
import { X, ShoppingCart, Trash2, ChevronDown, ChevronUp, GripVertical } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

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

export default function MealPlanner({ history, onClose }) {
  // plan shape: { Monday: { Breakfast: entryId | null, Lunch: entryId | null, Dinner: entryId | null }, ... }
  const [plan, setPlan] = useLocalStorage('meal_plan', {});
  const [showList, setShowList] = useState(false);
  const [dragEntry, setDragEntry] = useState(null);
  const [dragOver, setDragOver] = useState(null); // { day, meal }
  const [expandedDays, setExpandedDays] = useState(() => {
    const d = new Date();
    const idx = (d.getDay() + 6) % 7; // Mon=0 … Sun=6
    return new Set([DAYS[idx]]);
  });

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

  // Drag-and-drop
  const handleDragStart = (e, entry) => {
    setDragEntry(entry);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDrop = (e, day, meal) => {
    e.preventDefault();
    if (dragEntry) setSlot(day, meal, dragEntry.id);
    setDragEntry(null);
    setDragOver(null);
  };

  const handleDragOver = (e, day, meal) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOver({ day, meal });
  };

  const handleDragLeave = () => setDragOver(null);

  const getEntry = (entryId) => history.find(h => h.id === entryId) || null;

  const shoppingList = buildShoppingList(plan, history);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Meal Planner</h2>
          <p className="text-sm text-slate-400 mt-0.5">Drag saved recipes onto the weekly grid</p>
        </div>
        <div className="flex items-center gap-2">
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
      {showList && shoppingList.length > 0 && (
        <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
          <h3 className="font-bold text-green-400 flex items-center gap-2"><ShoppingCart size={16} /> Combined Shopping List</h3>
          {shoppingList.map(({ name, ingredients }) => (
            <div key={name} className="space-y-1.5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{name}</p>
              <ul className="space-y-1">
                {ingredients.map((ing, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                    <span className="text-slate-600 mt-0.5">•</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Saved recipes sidebar */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Saved Recipes</p>
          {history.length === 0 ? (
            <p className="text-sm text-slate-500">No saved recipes yet. Save some recipes first!</p>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {history.map(entry => (
                <div
                  key={entry.id}
                  draggable
                  onDragStart={e => handleDragStart(e, entry)}
                  className="flex items-center gap-3 p-3 bg-slate-800 border border-white/5 rounded-xl cursor-grab active:cursor-grabbing hover:border-orange-500/30 transition-all group select-none"
                >
                  <GripVertical size={14} className="text-slate-600 group-hover:text-slate-400 shrink-0" />
                  {entry.imageUrl && (
                    <img src={entry.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-200 truncate">{entry.recipe?.name}</p>
                    <p className="text-xs text-slate-500">{entry.recipe?.time || '—'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-slate-600 pt-1">Drag recipes to meal slots →</p>
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
                  <div className="grid grid-cols-3 gap-2 px-4 pb-4">
                    {MEALS.map(meal => {
                      const slotId = getSlot(day, meal);
                      const entry = slotId ? getEntry(slotId) : null;
                      const isOver = dragOver?.day === day && dragOver?.meal === meal;

                      return (
                        <div
                          key={meal}
                          onDrop={e => handleDrop(e, day, meal)}
                          onDragOver={e => handleDragOver(e, day, meal)}
                          onDragLeave={handleDragLeave}
                          className={`min-h-[80px] rounded-xl border-2 border-dashed transition-all relative ${
                            isOver
                              ? 'border-orange-500/60 bg-orange-500/10'
                              : entry
                              ? 'border-white/10 bg-slate-800/60'
                              : 'border-white/5 bg-slate-800/20 hover:border-white/10'
                          }`}
                        >
                          <p className="absolute top-1.5 left-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">{meal}</p>
                          {entry ? (
                            <div className="pt-6 px-2 pb-2">
                              {entry.imageUrl && (
                                <img src={entry.imageUrl} alt="" className="w-full h-12 object-cover rounded-lg mb-1.5" />
                              )}
                              <p className="text-xs text-slate-300 font-medium leading-tight line-clamp-2">{entry.recipe?.name}</p>
                              <button
                                onClick={() => clearSlot(day, meal)}
                                className="mt-1.5 flex items-center gap-1 text-[10px] text-slate-600 hover:text-red-400 transition-colors"
                              >
                                <Trash2 size={10} /> Remove
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full pt-5 pb-2">
                              <p className="text-xs text-slate-600">Drop here</p>
                            </div>
                          )}
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
