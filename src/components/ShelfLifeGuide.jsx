import React, { useState } from 'react';
import { X, Refrigerator, Search } from 'lucide-react';

// Round 10 Kitchen Tool: a searchable reference for how long common foods
// keep in the pantry, fridge, and freezer. Pure static data — no API.
const SHELF_LIFE = [
  { food: 'Raw chicken', pantry: '—', fridge: '1–2 days', freezer: '9 months', cat: 'Meat & Fish' },
  { food: 'Raw beef / pork', pantry: '—', fridge: '3–5 days', freezer: '6–12 months', cat: 'Meat & Fish' },
  { food: 'Cooked meat', pantry: '—', fridge: '3–4 days', freezer: '2–3 months', cat: 'Meat & Fish' },
  { food: 'Fresh fish', pantry: '—', fridge: '1–2 days', freezer: '3–6 months', cat: 'Meat & Fish' },
  { food: 'Bacon', pantry: '—', fridge: '1 week', freezer: '1 month', cat: 'Meat & Fish' },
  { food: 'Eggs (in shell)', pantry: '—', fridge: '3–5 weeks', freezer: 'Don\'t freeze in shell', cat: 'Dairy & Eggs' },
  { food: 'Milk', pantry: '—', fridge: '5–7 days past date', freezer: '3 months', cat: 'Dairy & Eggs' },
  { food: 'Hard cheese', pantry: '—', fridge: '3–4 weeks', freezer: '6–8 months', cat: 'Dairy & Eggs' },
  { food: 'Soft cheese', pantry: '—', fridge: '1 week', freezer: '6 months', cat: 'Dairy & Eggs' },
  { food: 'Butter', pantry: '1–2 days', fridge: '1–3 months', freezer: '6–9 months', cat: 'Dairy & Eggs' },
  { food: 'Yogurt', pantry: '—', fridge: '1–2 weeks', freezer: '1–2 months', cat: 'Dairy & Eggs' },
  { food: 'Apples', pantry: '3 weeks', fridge: '4–6 weeks', freezer: '8 months (sliced)', cat: 'Produce' },
  { food: 'Bananas', pantry: 'Until ripe', fridge: '2 days (skin darkens)', freezer: '2–3 months', cat: 'Produce' },
  { food: 'Berries', pantry: '—', fridge: '3–7 days', freezer: '6–8 months', cat: 'Produce' },
  { food: 'Leafy greens', pantry: '—', fridge: '3–7 days', freezer: '8 months (blanched)', cat: 'Produce' },
  { food: 'Carrots', pantry: '—', fridge: '3–4 weeks', freezer: '10–12 months', cat: 'Produce' },
  { food: 'Onions', pantry: '1–2 months', fridge: '2 months', freezer: '8 months (chopped)', cat: 'Produce' },
  { food: 'Potatoes', pantry: '1–2 months', fridge: 'Not ideal', freezer: '10–12 months (cooked)', cat: 'Produce' },
  { food: 'Tomatoes', pantry: 'Until ripe', fridge: '1 week', freezer: '2 months', cat: 'Produce' },
  { food: 'Garlic (bulb)', pantry: '3–5 months', fridge: '—', freezer: '—', cat: 'Produce' },
  { food: 'Bread', pantry: '5–7 days', fridge: '1–2 weeks', freezer: '3 months', cat: 'Pantry' },
  { food: 'Cooked rice / pasta', pantry: '—', fridge: '3–5 days', freezer: '1–2 months', cat: 'Pantry' },
  { food: 'Flour (white)', pantry: '6–8 months', fridge: '1 year', freezer: '1+ year', cat: 'Pantry' },
  { food: 'Dried beans / lentils', pantry: '1–2 years', fridge: '—', freezer: '—', cat: 'Pantry' },
  { food: 'Cooking oil', pantry: '6 months opened', fridge: '—', freezer: '—', cat: 'Pantry' },
  { food: 'Leftovers (cooked dish)', pantry: '—', fridge: '3–4 days', freezer: '2–3 months', cat: 'Pantry' },
  { food: 'Opened condiments', pantry: '1 month', fridge: '6 months', freezer: '—', cat: 'Pantry' },
];

const CATS = ['All', 'Meat & Fish', 'Dairy & Eggs', 'Produce', 'Pantry'];

export default function ShelfLifeGuide({ onClose }) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');

  const rows = SHELF_LIFE.filter(r =>
    (cat === 'All' || r.cat === cat) &&
    (!query || r.food.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="font-bold text-lg flex items-center gap-2"><Refrigerator size={18} className="text-cyan-400" /> Food Storage & Shelf Life</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-all"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-3 border-b border-white/5">
          <div className="flex items-center gap-2 bg-slate-800 border border-white/10 rounded-xl px-3">
            <Search size={14} className="text-slate-500" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search a food…"
              className="flex-1 bg-transparent py-2.5 text-sm text-slate-200 outline-none placeholder:text-slate-600"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATS.map(c => (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1 rounded-full text-xs border transition-all ${cat === c ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300' : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto p-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 uppercase tracking-widest text-left">
                <th className="pb-2 font-bold">Food</th>
                <th className="pb-2 font-bold">Pantry</th>
                <th className="pb-2 font-bold">Fridge</th>
                <th className="pb-2 font-bold">Freezer</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.food} className="border-t border-white/5">
                  <td className="py-2.5 pr-2 font-medium text-slate-200">{r.food}</td>
                  <td className="py-2.5 pr-2 text-slate-400">{r.pantry}</td>
                  <td className="py-2.5 pr-2 text-cyan-300">{r.fridge}</td>
                  <td className="py-2.5 text-blue-300">{r.freezer}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-slate-500 text-sm">No matches — try another search.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
