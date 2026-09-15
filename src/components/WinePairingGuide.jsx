import React, { useState } from 'react';
import { X, Wine } from 'lucide-react';

// Round 10 Kitchen Tool: a static reference chart matching dishes/proteins to
// wine (and beer) styles, with a short "why". No API.
const PAIRINGS = [
  { dish: 'Steak & red meat', wine: 'Cabernet Sauvignon, Malbec', beer: 'Stout, Porter', why: 'Bold tannins cut through rich fat.' },
  { dish: 'Roast chicken / turkey', wine: 'Chardonnay, light Pinot Noir', beer: 'Amber ale', why: 'Medium body matches the meat without overpowering.' },
  { dish: 'Pork', wine: 'Pinot Noir, Riesling', beer: 'Bock', why: 'Fruit-forward wines complement pork\'s sweetness.' },
  { dish: 'Salmon & oily fish', wine: 'Pinot Noir, Rosé', beer: 'Saison', why: 'Light reds stand up to fatty fish.' },
  { dish: 'White fish & shellfish', wine: 'Sauvignon Blanc, Albariño', beer: 'Pilsner, Witbier', why: 'Crisp acidity refreshes delicate seafood.' },
  { dish: 'Tomato pasta', wine: 'Chianti, Sangiovese', beer: 'Italian lager', why: 'Acidity in wine mirrors the tomato.' },
  { dish: 'Creamy pasta', wine: 'Chardonnay, Pinot Grigio', beer: 'Cream ale', why: 'Buttery whites echo the sauce.' },
  { dish: 'Pizza', wine: 'Barbera, Zinfandel', beer: 'Pale ale, lager', why: 'Fruity reds handle tomato + cheese.' },
  { dish: 'Spicy Asian / Thai', wine: 'Off-dry Riesling, Gewürztraminer', beer: 'IPA, wheat beer', why: 'A touch of sweetness tames the heat.' },
  { dish: 'Indian curry', wine: 'Riesling, Rosé', beer: 'Lager, IPA', why: 'Cooling sweetness balances spice.' },
  { dish: 'Mexican / tacos', wine: 'Rosé, Grenache', beer: 'Mexican lager', why: 'Bright, easygoing styles match lively flavours.' },
  { dish: 'BBQ & smoky', wine: 'Zinfandel, Shiraz', beer: 'Brown ale, Porter', why: 'Jammy reds love char and smoke.' },
  { dish: 'Salads & vegetables', wine: 'Sauvignon Blanc, Vermentino', beer: 'Saison', why: 'Herbaceous, zippy wines lift greens.' },
  { dish: 'Mushroom & umami', wine: 'Pinot Noir, Nebbiolo', beer: 'Dunkel', why: 'Earthy reds amplify savoury depth.' },
  { dish: 'Soft cheese', wine: 'Champagne, Sauvignon Blanc', beer: 'Lambic', why: 'Bubbles and acid cut creaminess.' },
  { dish: 'Hard / aged cheese', wine: 'Cabernet, Port', beer: 'Barleywine', why: 'Bold companions for salty, nutty cheese.' },
  { dish: 'Chocolate dessert', wine: 'Port, Banyuls', beer: 'Imperial Stout', why: 'Sweet fortified wines match cocoa intensity.' },
  { dish: 'Fruit dessert', wine: 'Moscato, Sauternes', beer: 'Fruit lambic', why: 'Sweet, aromatic wines echo the fruit.' },
];

export default function WinePairingGuide({ onClose }) {
  const [query, setQuery] = useState('');
  const rows = PAIRINGS.filter(r => !query || r.dish.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="font-bold text-lg flex items-center gap-2"><Wine size={18} className="text-purple-400" /> Wine &amp; Beer Pairing Chart</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-all"><X size={18} /></button>
        </div>
        <div className="p-5 border-b border-white/5">
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search a dish or protein…"
            className="w-full bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-200 outline-none focus:border-purple-500/50 placeholder:text-slate-600"
          />
        </div>
        <div className="overflow-y-auto p-5 space-y-3">
          {rows.map(r => (
            <div key={r.dish} className="bg-slate-800/50 border border-white/5 rounded-2xl p-4 space-y-1.5">
              <p className="font-bold text-slate-100">{r.dish}</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                <span className="text-purple-300">🍷 {r.wine}</span>
                <span className="text-amber-300">🍺 {r.beer}</span>
              </div>
              <p className="text-xs text-slate-400 italic">{r.why}</p>
            </div>
          ))}
          {rows.length === 0 && <p className="py-6 text-center text-slate-500 text-sm">No matches — try another dish.</p>}
        </div>
      </div>
    </div>
  );
}
