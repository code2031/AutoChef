import React, { useState } from 'react';
import { X, Sparkles } from 'lucide-react';

// Round 10 Kitchen Tool: herb & spice flavour-affinity guide. Tap an
// ingredient to see what it pairs with and a typical use. Pure static data.
const SPICES = [
  { name: 'Basil', emoji: '🌿', pairs: ['tomato', 'garlic', 'mozzarella', 'olive oil', 'lemon'], use: 'Add fresh at the end — heat destroys its aroma.' },
  { name: 'Rosemary', emoji: '🌲', pairs: ['lamb', 'potato', 'chicken', 'garlic', 'lemon'], use: 'Woody and strong — use sparingly, add early.' },
  { name: 'Thyme', emoji: '🌿', pairs: ['mushroom', 'chicken', 'beans', 'tomato', 'eggs'], use: 'Great in slow braises and roasts.' },
  { name: 'Cumin', emoji: '🟤', pairs: ['beef', 'beans', 'coriander', 'chili', 'lime'], use: 'Toast whole seeds to release nutty depth.' },
  { name: 'Coriander', emoji: '🌿', pairs: ['lime', 'cumin', 'chili', 'fish', 'coconut'], use: 'Seeds are citrusy; leaves are bright and fresh.' },
  { name: 'Cinnamon', emoji: '🟫', pairs: ['apple', 'lamb', 'chocolate', 'orange', 'chili'], use: 'Sweet and savoury — a pinch deepens stews.' },
  { name: 'Ginger', emoji: '🫚', pairs: ['garlic', 'soy', 'lime', 'honey', 'scallion'], use: 'Grate fresh for heat; bloom in oil to mellow.' },
  { name: 'Paprika', emoji: '🔴', pairs: ['chicken', 'potato', 'garlic', 'tomato', 'pork'], use: 'Smoked paprika adds BBQ depth without a grill.' },
  { name: 'Turmeric', emoji: '🟡', pairs: ['ginger', 'cumin', 'cauliflower', 'rice', 'coconut'], use: 'Earthy and bitter — needs fat and salt to shine.' },
  { name: 'Chili / Cayenne', emoji: '🌶️', pairs: ['lime', 'garlic', 'chocolate', 'mango', 'cumin'], use: 'Add gradually; a little chocolate or sugar balances it.' },
  { name: 'Oregano', emoji: '🌿', pairs: ['tomato', 'feta', 'olive oil', 'lemon', 'lamb'], use: 'Dried is stronger than fresh — Mediterranean staple.' },
  { name: 'Mint', emoji: '🌱', pairs: ['lamb', 'pea', 'yogurt', 'lime', 'chocolate'], use: 'Cooling — great raw in salads and sauces.' },
  { name: 'Cardamom', emoji: '🟢', pairs: ['coffee', 'orange', 'rice', 'cinnamon', 'cream'], use: 'Intense and floral — use 1–2 pods at a time.' },
  { name: 'Smoked salt / Soy', emoji: '🧂', pairs: ['mushroom', 'egg', 'tomato', 'cheese', 'beef'], use: 'Umami boosters — add depth without more salt.' },
  { name: 'Lemon zest', emoji: '🍋', pairs: ['fish', 'chicken', 'asparagus', 'parsley', 'cream'], use: 'Brightens rich dishes — add off the heat.' },
  { name: 'Garlic', emoji: '🧄', pairs: ['almost everything', 'ginger', 'chili', 'butter', 'herbs'], use: 'Low + slow = sweet; high heat = bitter, so don\'t burn it.' },
];

export default function SpicePairingGuide({ onClose }) {
  const [active, setActive] = useState(SPICES[0].name);
  const current = SPICES.find(s => s.name === active);

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[88vh]">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles size={18} className="text-emerald-400" /> Herb &amp; Spice Pairings</h3>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-all"><X size={18} /></button>
        </div>
        <div className="p-5 border-b border-white/5 flex flex-wrap gap-2">
          {SPICES.map(s => (
            <button
              key={s.name}
              onClick={() => setActive(s.name)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-all ${active === s.name ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' : 'bg-slate-800 border-white/10 text-slate-400 hover:text-white'}`}
            >
              {s.emoji} {s.name}
            </button>
          ))}
        </div>
        {current && (
          <div className="p-6 space-y-4 overflow-y-auto">
            <p className="text-3xl">{current.emoji} <span className="text-xl font-bold align-middle text-slate-100">{current.name}</span></p>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Pairs beautifully with</p>
              <div className="flex flex-wrap gap-2">
                {current.pairs.map(p => (
                  <span key={p} className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-full text-sm capitalize">{p}</span>
                ))}
              </div>
            </div>
            <div className="bg-slate-800/50 border border-white/5 rounded-2xl p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">How to use</p>
              <p className="text-sm text-slate-300">{current.use}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
