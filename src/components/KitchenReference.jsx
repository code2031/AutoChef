import React, { useState } from 'react';
import { X } from 'lucide-react';

const TABS = ['Temps', 'Measures', 'Timings', 'Doneness'];

const TEMPS = [
  { item: 'Beef (medium-rare)', c: 57, f: 135 },
  { item: 'Beef (medium)', c: 63, f: 145 },
  { item: 'Beef (well-done)', c: 71, f: 160 },
  { item: 'Chicken / Turkey', c: 74, f: 165 },
  { item: 'Pork', c: 63, f: 145 },
  { item: 'Ground meat', c: 71, f: 160 },
  { item: 'Fish & Seafood', c: 63, f: 145 },
  { item: 'Eggs (fully set)', c: 71, f: 160 },
  { item: 'Oil: deep fry', c: 175, f: 350 },
  { item: 'Oil: pan fry', c: 190, f: 375 },
  { item: 'Bread (done)', c: 93, f: 200 },
  { item: 'Candy: soft ball', c: 113, f: 235 },
  { item: 'Candy: hard crack', c: 149, f: 300 },
  { item: 'Oven: low (slow cook)', c: 120, f: 250 },
  { item: 'Oven: moderate', c: 175, f: 350 },
  { item: 'Oven: hot', c: 220, f: 425 },
];

const MEASURES = [
  { from: '1 cup', to: '240 ml / 16 tbsp / 48 tsp' },
  { from: '1 tbsp', to: '15 ml / 3 tsp' },
  { from: '1 tsp', to: '5 ml' },
  { from: '1 fl oz', to: '30 ml' },
  { from: '1 pint', to: '480 ml / 2 cups' },
  { from: '1 quart', to: '960 ml / 4 cups' },
  { from: '1 gallon', to: '3.8 L / 16 cups' },
  { from: '1 oz (weight)', to: '28.35 g' },
  { from: '1 lb', to: '453.6 g / 16 oz' },
  { from: '1 stick butter', to: '115 g / ½ cup / 8 tbsp' },
  { from: '1 cup flour', to: '≈ 125 g (spooned)' },
  { from: '1 cup sugar', to: '≈ 200 g' },
  { from: '1 cup rice (raw)', to: '≈ 185 g' },
];

const TIMINGS = [
  { item: 'Pasta (al dente)', time: '8–10 min boiling' },
  { item: 'White rice', time: '18 min (1:2 ratio)' },
  { item: 'Brown rice', time: '45 min (1:2.5 ratio)' },
  { item: 'Quinoa', time: '15 min (1:2 ratio)' },
  { item: 'Lentils (red)', time: '20–25 min' },
  { item: 'Lentils (green)', time: '30–40 min' },
  { item: 'Dried chickpeas', time: '1.5–2 hrs' },
  { item: 'Potatoes (boil)', time: '15–20 min' },
  { item: 'Chicken breast (roast)', time: '25–30 min @ 200°C' },
  { item: 'Whole chicken (roast)', time: '20 min per 500g + 20 min' },
  { item: 'Pork loin (roast)', time: '30 min per 500g @ 180°C' },
  { item: 'Beef (medium-rare)', time: '20 min per 500g @ 200°C' },
  { item: 'Eggs (soft boiled)', time: '6 min' },
  { item: 'Eggs (hard boiled)', time: '10–12 min' },
  { item: 'Bread (basic loaf)', time: '30–35 min @ 200°C' },
];

const DONENESS = [
  { check: 'Steak', method: 'Finger test or thermometer: 57°C rare → 71°C well' },
  { check: 'Chicken', method: 'Juices run clear; no pink at the bone; 74°C internal' },
  { check: 'Fish', method: 'Flakes easily with a fork; opaque throughout' },
  { check: 'Pork', method: 'Light pink center OK (USDA 63°C); no red' },
  { check: 'Pasta', method: 'Bite test: slightly firm at the very center (al dente)' },
  { check: 'Vegetables (roast)', method: 'Fork-tender, golden edges, slight caramelization' },
  { check: 'Cake', method: 'Skewer comes out clean; springs back when pressed' },
  { check: 'Bread', method: 'Hollow sound when tapped underneath; 93°C internal' },
  { check: 'Custard / Crème', method: 'Set at edges, slight wobble in center' },
  { check: 'Caramel', method: 'Amber color (not dark brown); nutty aroma; 170°C' },
  { check: 'Onions (caramelized)', method: 'Deep golden, jammy texture; ~45 min low & slow' },
];

export default function KitchenReference({ onClose }) {
  const [tab, setTab] = useState('Temps');
  const [unit, setUnit] = useState('C');

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <h2 className="font-bold text-lg">📖 Kitchen Reference</h2>
          <div className="flex items-center gap-2">
            {tab === 'Temps' && (
              <button
                onClick={() => setUnit(u => u === 'C' ? 'F' : 'C')}
                className="text-xs px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
              >
                Show °{unit === 'C' ? 'F' : 'C'}
              </button>
            )}
            <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-all"><X size={18} /></button>
          </div>
        </div>
        <div className="flex gap-1 p-3 border-b border-white/5 shrink-0">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${tab === t ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white bg-slate-800'}`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="overflow-y-auto p-4 space-y-2">
          {tab === 'Temps' && TEMPS.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-sm text-slate-300">{r.item}</span>
              <span className="text-sm font-bold text-orange-400 tabular-nums shrink-0 ml-4">
                {unit === 'C' ? `${r.c}°C` : `${r.f}°F`}
              </span>
            </div>
          ))}
          {tab === 'Measures' && MEASURES.map((r, i) => (
            <div key={i} className="py-2 border-b border-white/5 last:border-0">
              <span className="text-sm font-bold text-orange-400">{r.from}</span>
              <span className="text-sm text-slate-400 ml-2">= {r.to}</span>
            </div>
          ))}
          {tab === 'Timings' && TIMINGS.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-sm text-slate-300">{r.item}</span>
              <span className="text-xs text-blue-400 font-medium shrink-0 ml-4">{r.time}</span>
            </div>
          ))}
          {tab === 'Doneness' && DONENESS.map((r, i) => (
            <div key={i} className="py-2 border-b border-white/5 last:border-0">
              <p className="text-sm font-bold text-green-400">{r.check}</p>
              <p className="text-xs text-slate-400 leading-relaxed mt-0.5">{r.method}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
