import React, { useState } from 'react';
import { Clock, Utensils, Flame, Leaf, Users, Wine, DollarSign, Leaf as LeafIcon } from 'lucide-react';
import { estimateCost } from '../lib/costs.js';
import { getCarbonScore } from '../lib/carbon.js';

const DIFFICULTY_INFO = {
  Easy: 'Beginner-friendly. Simple techniques, few steps, forgiving timing.',
  Medium: 'Some experience helpful. Requires attention to timing and technique.',
  Hard: 'Advanced skills needed. Complex techniques, precise timing, more steps.',
};

function Tooltip({ text, children }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-block" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <span className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-52 p-2 bg-slate-800 border border-white/10 rounded-lg text-xs text-slate-300 shadow-xl pointer-events-none">
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </span>
      )}
    </span>
  );
}

function MacroBar({ label, value, color }) {
  const num = parseInt(value) || 0;
  const max = label === 'carbs' ? 80 : label === 'protein' ? 60 : label === 'fat' ? 50 : 30;
  const pct = Math.min(100, Math.round((num / max) * 100));
  return (
    <div className="bg-slate-900/30 border border-white/5 rounded-xl p-3">
      <div className="flex justify-between mb-1.5">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
        <span className="text-xs font-bold text-slate-300">{value || '—'}</span>
      </div>
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export default function StatsBar({ recipe, diet, ingredients }) {
  const costInfo = ingredients ? estimateCost(ingredients) : null;
  const carbonInfo = ingredients ? getCarbonScore(ingredients) : null;

  const stats = [
    recipe.prepTime && { icon: <Clock size={16} className="text-blue-400" />, label: 'Prep', value: recipe.prepTime },
    recipe.cookTime && { icon: <Clock size={16} className="text-orange-500" />, label: 'Cook', value: recipe.cookTime },
    !recipe.prepTime && { icon: <Clock size={18} className="text-orange-500" />, label: 'Time', value: recipe.time },
    {
      icon: <Utensils size={18} className="text-orange-500" />,
      label: 'Difficulty',
      value: recipe.difficulty,
      tooltip: DIFFICULTY_INFO[recipe.difficulty],
    },
    { icon: <Flame size={18} className="text-orange-500" />, label: 'Calories', value: recipe.calories },
    { icon: <Leaf size={18} className="text-orange-500" />, label: 'Type', value: diet === 'none' ? 'Standard' : diet },
    { icon: <Users size={18} className="text-orange-500" />, label: 'Servings', value: recipe.servings || '2' },
    recipe.winePairing && { icon: <Wine size={18} className="text-orange-500" />, label: 'Pairs With', value: recipe.winePairing },
    costInfo && {
      icon: <DollarSign size={18} className="text-green-400" />,
      label: 'Est. Cost',
      value: `~$${costInfo.total}`,
      tooltip: 'Estimated ingredient cost per batch (varies by location)',
    },
    carbonInfo && {
      icon: <span className="text-base leading-none">{carbonInfo.icon}</span>,
      label: 'Carbon',
      value: carbonInfo.label,
      tooltip: `Approx. ${Math.round(carbonInfo.total / 1000)} kg CO₂e`,
      valueColor: carbonInfo.color,
    },
  ].filter(Boolean);

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-center space-y-1">
            <div className="flex justify-center">{s.icon}</div>
            <span className="block text-xs uppercase text-slate-500 font-bold tracking-widest">{s.label}</span>
            {s.tooltip ? (
              <Tooltip text={s.tooltip}>
                <span
                  className="text-sm font-medium capitalize leading-tight underline decoration-dotted cursor-help"
                  style={s.valueColor ? { color: s.valueColor } : {}}
                >
                  {s.value}
                </span>
              </Tooltip>
            ) : (
              <span
                className="text-sm font-medium capitalize leading-tight block"
                style={s.valueColor ? { color: s.valueColor } : {}}
              >
                {s.value}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Nutrition macro bars */}
      {recipe.nutrition && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          <MacroBar label="protein" value={recipe.nutrition.protein} color="#22c55e" />
          <MacroBar label="carbs" value={recipe.nutrition.carbs} color="#f59e0b" />
          <MacroBar label="fat" value={recipe.nutrition.fat} color="#f97316" />
          <MacroBar label="fiber" value={recipe.nutrition.fiber} color="#06b6d4" />
        </div>
      )}
    </div>
  );
}
