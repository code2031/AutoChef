import React from 'react';
import { Clock, Utensils, Flame, Leaf, Users, Wine } from 'lucide-react';

export default function StatsBar({ recipe, diet }) {
  const stats = [
    { icon: <Clock size={18} className="text-orange-500" />, label: 'Time', value: recipe.time },
    { icon: <Utensils size={18} className="text-orange-500" />, label: 'Difficulty', value: recipe.difficulty },
    { icon: <Flame size={18} className="text-orange-500" />, label: 'Calories', value: recipe.calories },
    { icon: <Leaf size={18} className="text-orange-500" />, label: 'Type', value: diet === 'none' ? 'Standard' : diet },
    { icon: <Users size={18} className="text-orange-500" />, label: 'Servings', value: recipe.servings || '2' },
    ...(recipe.winePairing ? [{ icon: <Wine size={18} className="text-orange-500" />, label: 'Pairs With', value: recipe.winePairing }] : []),
  ];

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-slate-900/50 p-4 rounded-2xl border border-white/5 text-center space-y-1">
            <div className="flex justify-center">{s.icon}</div>
            <span className="block text-xs uppercase text-slate-500 font-bold tracking-widest">{s.label}</span>
            <span className="text-sm font-medium capitalize leading-tight">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Nutrition macros */}
      {recipe.nutrition && (
        <div className="mt-3 grid grid-cols-4 gap-2">
          {['protein', 'carbs', 'fat', 'fiber'].map(key => (
            <div key={key} className="bg-slate-900/30 border border-white/5 rounded-xl p-3 text-center">
              <span className="block text-xs font-bold text-slate-500 uppercase tracking-widest">{key}</span>
              <span className="text-sm font-bold text-slate-300">{recipe.nutrition[key] || '—'}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
