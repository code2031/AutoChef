import React, { useState } from 'react';
import { X, Scale } from 'lucide-react';
import { INGREDIENT_DENSITY_G_PER_CUP, volumeToGrams, tidy } from '../lib/units.js';

const VOLUME_UNITS = ['cup', 'tbsp', 'tsp'];
const INGREDIENTS = Object.keys(INGREDIENT_DENSITY_G_PER_CUP);

// Round 10 Kitchen Tool: convert a volume measure (cups/tbsp/tsp) of a common
// ingredient into a kitchen-scale weight in grams and ounces. Baking by weight
// is far more accurate than by volume — this bridges recipes that use cups.
export default function IngredientWeightConverter({ onClose }) {
  const [amount, setAmount] = useState('1');
  const [unit, setUnit] = useState('cup');
  const [ingredient, setIngredient] = useState(INGREDIENTS[0]);

  const grams = volumeToGrams(amount, unit, ingredient);
  const ounces = grams != null ? grams / 28.3495 : null;

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 space-y-5 shadow-2xl max-h-[88vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2"><Scale size={18} className="text-orange-400" /> Cups → Grams</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-all"><X size={18} /></button>
        </div>
        <p className="text-xs text-slate-500">Baking is more accurate by weight. Pick an ingredient to convert volume into a scale weight.</p>

        <div className="flex gap-2">
          <input
            type="number"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            min="0"
            step="0.25"
            className="w-24 bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-center text-slate-200 outline-none focus:border-orange-500/50"
          />
          <select
            value={unit}
            onChange={e => setUnit(e.target.value)}
            className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-orange-500/50"
          >
            {VOLUME_UNITS.map(u => <option key={u} value={u}>{u}{amount !== '1' ? 's' : ''}</option>)}
          </select>
        </div>

        <select
          value={ingredient}
          onChange={e => setIngredient(e.target.value)}
          className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-orange-500/50 capitalize"
        >
          {INGREDIENTS.map(i => <option key={i} value={i}>{i}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-orange-400">{grams != null ? tidy(grams, 0) : '—'}</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">grams</p>
          </div>
          <div className="bg-slate-800 border border-white/10 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-slate-200">{ounces != null ? tidy(ounces, 1) : '—'}</p>
            <p className="text-xs text-slate-500 uppercase tracking-widest mt-1">ounces</p>
          </div>
        </div>
        <p className="text-[11px] text-slate-600 text-center">Density of {ingredient}: ≈{INGREDIENT_DENSITY_G_PER_CUP[ingredient]} g per cup</p>
      </div>
    </div>
  );
}
