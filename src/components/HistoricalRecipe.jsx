import React, { useState } from 'react';
import { Clock } from 'lucide-react';

const ERA_OPTIONS = [
  { value: 'Medieval Europe (1200s)', label: '⚔️ Medieval Europe' },
  { value: 'Victorian England (1880s)', label: '🎩 Victorian England' },
  { value: '1920s Paris', label: '🥂 1920s Paris' },
  { value: 'Ancient Rome (100 AD)', label: '🏛️ Ancient Rome' },
  { value: 'Ming Dynasty China (1400s)', label: '🐉 Ming Dynasty' },
  { value: 'Ottoman Empire (1600s)', label: '🌙 Ottoman Empire' },
];

export default function HistoricalRecipe({ onGenerate, isGenerating }) {
  const [dishName, setDishName] = useState('');
  const [era, setEra] = useState(ERA_OPTIONS[0].value);

  const handleSubmit = () => {
    const clean = dishName.trim();
    if (clean && !isGenerating) onGenerate(clean, era);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-bold">Historical Recipe</h2>
        <p className="text-slate-400 text-sm">Discover how a dish was made in a different era of history.</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Dish Name</label>
          <input
            value={dishName}
            onChange={e => setDishName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="e.g. Bread, Roast Chicken, Soup, Cake..."
            className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-base outline-none focus:border-orange-500/60 text-white placeholder:text-slate-600 transition-all"
            autoFocus
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Historical Era</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ERA_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setEra(opt.value)}
                className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all text-left ${era === opt.value ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!dishName.trim() || isGenerating}
          className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${dishName.trim() && !isGenerating ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-xl shadow-amber-600/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
        >
          <Clock size={20} />
          {isGenerating ? 'Travelling through time...' : 'Generate Historical Recipe'}
        </button>
      </div>
    </div>
  );
}
