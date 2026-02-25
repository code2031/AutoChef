import React, { useState } from 'react';
import { X } from 'lucide-react';

const CONVERSIONS = {
  weight: {
    label: 'Weight',
    units: ['g', 'kg', 'oz', 'lb'],
    toBase: { g: 1, kg: 1000, oz: 28.3495, lb: 453.592 },
  },
  volume: {
    label: 'Volume',
    units: ['ml', 'l', 'tsp', 'tbsp', 'fl oz', 'cup', 'pint', 'quart'],
    toBase: { ml: 1, l: 1000, tsp: 4.92892, tbsp: 14.7868, 'fl oz': 29.5735, cup: 236.588, pint: 473.176, quart: 946.353 },
  },
  temp: {
    label: 'Temperature',
    units: ['°C', '°F', 'K'],
    toBase: null, // custom
  },
  length: {
    label: 'Length',
    units: ['mm', 'cm', 'in', 'ft'],
    toBase: { mm: 1, cm: 10, in: 25.4, ft: 304.8 },
  },
};

function convertTemp(val, from, to) {
  let c;
  if (from === '°C') c = val;
  else if (from === '°F') c = (val - 32) * 5 / 9;
  else c = val - 273.15;
  if (to === '°C') return c;
  if (to === '°F') return c * 9 / 5 + 32;
  return c + 273.15;
}

function fmt(n) {
  if (!isFinite(n)) return '—';
  const r = Math.round(n * 10000) / 10000;
  return r % 1 === 0 ? String(r) : r.toFixed(4).replace(/\.?0+$/, '');
}

export default function UnitConverter({ onClose }) {
  const [category, setCategory] = useState('weight');
  const [input, setInput] = useState('');
  const [fromUnit, setFromUnit] = useState('g');

  const cat = CONVERSIONS[category];

  const convert = (to) => {
    const val = parseFloat(input);
    if (isNaN(val)) return '—';
    if (category === 'temp') return fmt(convertTemp(val, fromUnit, to));
    const base = val * cat.toBase[fromUnit];
    return fmt(base / cat.toBase[to]);
  };

  const handleCategoryChange = (c) => {
    setCategory(c);
    setFromUnit(CONVERSIONS[c].units[0]);
    setInput('');
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <h2 className="font-bold text-lg">⚖️ Unit Converter</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-all"><X size={18} /></button>
        </div>
        {/* Category tabs */}
        <div className="flex gap-1 p-3 border-b border-white/5">
          {Object.entries(CONVERSIONS).map(([key, c]) => (
            <button
              key={key}
              onClick={() => handleCategoryChange(key)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${category === key ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white bg-slate-800'}`}
            >
              {c.label}
            </button>
          ))}
        </div>
        <div className="p-6 space-y-4">
          {/* Input row */}
          <div className="flex gap-2">
            <input
              type="number"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Enter value..."
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-orange-500/60"
            />
            <select
              value={fromUnit}
              onChange={e => setFromUnit(e.target.value)}
              className="bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none"
            >
              {cat.units.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
          {/* Results grid */}
          <div className="grid grid-cols-2 gap-2">
            {cat.units.filter(u => u !== fromUnit).map(to => (
              <div key={to} className="bg-slate-800/60 border border-white/5 rounded-xl p-3">
                <p className="text-xs text-slate-500 mb-0.5">{to}</p>
                <p className="text-base font-bold text-orange-400 tabular-nums">{convert(to)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
