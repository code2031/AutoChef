import React, { useMemo } from 'react';
import { X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

export default function MonthlyNutritionReport({ onClose }) {
  const [log] = useLocalStorage('daily_food_log', []);
  const [goals] = useLocalStorage('pref_nutrition_goals', {});

  const data = useMemo(() => {
    const now = new Date();
    const days = {};
    log.forEach(entry => {
      const d = new Date(entry.date || entry.id);
      if (isNaN(d)) return;
      const diff = (now - d) / (1000 * 60 * 60 * 24);
      if (diff > 30 || diff < 0) return;
      const key = (entry.date || '').slice(0, 10) || d.toISOString().slice(0, 10);
      if (!days[key]) days[key] = { calories: 0, protein: 0, carbs: 0, fat: 0, count: 0 };
      days[key].calories += parseFloat(entry.calories) || 0;
      days[key].protein += parseFloat(entry.protein) || 0;
      days[key].carbs += parseFloat(entry.carbs) || 0;
      days[key].fat += parseFloat(entry.fat) || 0;
      days[key].count++;
    });
    return days;
  }, [log]);

  const sortedDays = Object.entries(data).sort(([a], [b]) => a.localeCompare(b));
  const calGoal = parseFloat(goals.calories) || 2000;

  if (sortedDays.length === 0) {
    return (
      <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl p-6 text-center space-y-3">
          <button onClick={onClose} className="absolute top-3 right-3 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"><X size={16} /></button>
          <p className="text-4xl">📊</p>
          <p className="text-white font-bold">No food log data yet</p>
          <p className="text-slate-500 text-sm">Log meals in the Food Log tab to see your monthly report.</p>
        </div>
      </div>
    );
  }

  const avgCals = sortedDays.reduce((s, [, d]) => s + d.calories, 0) / sortedDays.length;
  const avgPro = sortedDays.reduce((s, [, d]) => s + d.protein, 0) / sortedDays.length;
  const totalDays = sortedDays.length;
  const daysOverGoal = sortedDays.filter(([, d]) => d.calories > calGoal).length;

  const maxCals = Math.max(...sortedDays.map(([, d]) => d.calories), calGoal);

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <div>
            <p className="font-bold text-white text-lg">📊 30-Day Nutrition Report</p>
            <p className="text-xs text-slate-500">{totalDays} days logged</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Avg Calories', value: Math.round(avgCals), unit: 'kcal', color: 'text-orange-400' },
              { label: 'Avg Protein', value: Math.round(avgPro), unit: 'g', color: 'text-blue-400' },
              { label: 'Days Logged', value: totalDays, unit: 'days', color: 'text-green-400' },
              { label: 'Over Goal', value: daysOverGoal, unit: 'days', color: daysOverGoal > totalDays * 0.5 ? 'text-red-400' : 'text-slate-400' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="bg-slate-800/60 border border-white/5 rounded-2xl p-3 text-center">
                <p className={`text-2xl font-bold ${color}`}>{value}</p>
                <p className="text-[10px] text-slate-600">{unit}</p>
                <p className="text-xs text-slate-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Calorie bar chart */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Daily Calories (last 30 days)</p>
            <div className="relative">
              <svg viewBox={`0 0 ${Math.max(sortedDays.length * 12, 200)} 80`} className="w-full h-20" preserveAspectRatio="none">
                {/* Goal line */}
                <line
                  x1="0" y1={80 - (calGoal / maxCals) * 70}
                  x2={sortedDays.length * 12} y2={80 - (calGoal / maxCals) * 70}
                  stroke="#f97316" strokeWidth="1" strokeDasharray="4,3" opacity="0.6"
                />
                {sortedDays.map(([key, d], i) => {
                  const h = Math.max(4, (d.calories / maxCals) * 70);
                  const isOver = d.calories > calGoal;
                  const isToday = key === new Date().toISOString().slice(0, 10);
                  return (
                    <rect
                      key={key}
                      x={i * 12 + 1} y={80 - h} width={10} height={h}
                      rx="2"
                      fill={isOver ? '#ef4444' : isToday ? '#f97316' : '#22c55e'}
                      opacity={isToday ? 1 : 0.7}
                    >
                      <title>{key}: {Math.round(d.calories)} kcal</title>
                    </rect>
                  );
                })}
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>{sortedDays[0]?.[0]}</span>
              <span className="flex items-center gap-1">
                <span className="w-4 border-t border-orange-500/60 border-dashed inline-block" /> Goal: {calGoal} kcal
              </span>
              <span>{sortedDays[sortedDays.length - 1]?.[0]}</span>
            </div>
          </div>

          {/* Macro breakdown per day (last 7) */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Last 7 Days Detail</p>
            <div className="space-y-2">
              {sortedDays.slice(-7).map(([key, d]) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-600 w-20 shrink-0">{key.slice(5)}</span>
                  <div className="flex-1 grid grid-cols-4 gap-1">
                    {[
                      { label: 'Cal', value: Math.round(d.calories), color: '#f97316' },
                      { label: 'Pro', value: Math.round(d.protein) + 'g', color: '#3b82f6' },
                      { label: 'Carb', value: Math.round(d.carbs) + 'g', color: '#f59e0b' },
                      { label: 'Fat', value: Math.round(d.fat) + 'g', color: '#8b5cf6' },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="text-center">
                        <p className="text-xs font-bold" style={{ color }}>{value}</p>
                        <p className="text-[9px] text-slate-600">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
