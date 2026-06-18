import React, { useMemo } from 'react';
import { X, CheckSquare } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

// Round 10 Kitchen Tool: a checklist of well-stocked-kitchen staples. State
// persists to localStorage so users can track what they already own and see
// what's missing at a glance.
const STAPLES = {
  'Oils & Acids': ['Olive oil', 'Vegetable oil', 'Vinegar', 'Soy sauce', 'Lemons / limes'],
  'Seasonings': ['Salt', 'Black pepper', 'Garlic', 'Onions', 'Chili flakes', 'Stock cubes'],
  'Dry Goods': ['Rice', 'Pasta', 'Flour', 'Sugar', 'Canned tomatoes', 'Canned beans', 'Lentils'],
  'Fridge': ['Eggs', 'Butter', 'Milk', 'Cheese', 'Mustard', 'Plain yogurt'],
  'Spices': ['Cumin', 'Paprika', 'Oregano', 'Cinnamon', 'Curry powder', 'Bay leaves'],
};

const ALL = Object.values(STAPLES).flat();

export default function PantryStaplesChecklist({ onClose }) {
  const [owned, setOwned] = useLocalStorage('pantry_staples', {});

  const ownedCount = useMemo(() => ALL.filter(s => owned[s]).length, [owned]);
  const pct = Math.round((ownedCount / ALL.length) * 100);

  const toggle = (item) => setOwned(prev => ({ ...prev, [item]: !prev[item] }));

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2"><CheckSquare size={18} className="text-orange-400" /> Pantry Staples</h3>
            <p className="text-xs text-slate-500 mt-0.5">{ownedCount} / {ALL.length} stocked ({pct}%)</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-all"><X size={18} /></button>
        </div>
        <div className="px-5 pt-4">
          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500" style={{ width: pct + '%' }} />
          </div>
        </div>
        <div className="overflow-y-auto p-5 space-y-5">
          {Object.entries(STAPLES).map(([cat, items]) => (
            <div key={cat}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{cat}</p>
              <div className="grid grid-cols-2 gap-1.5">
                {items.map(item => (
                  <label key={item} className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" checked={!!owned[item]} onChange={() => toggle(item)} className="accent-orange-500 cursor-pointer" />
                    <span className={(owned[item] ? 'text-slate-300' : 'text-slate-500') + ' text-sm group-hover:text-white transition-colors'}>{item}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
