import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];

function parseMacro(val) {
  if (!val) return 0;
  return parseFloat(String(val).replace(/[^\d.]/g, '')) || 0;
}

export default function MealPlanNutrition({ plan, history, nutritionGoals }) {
  const [show, setShow] = useState(false);

  const dayData = useMemo(() => {
    return DAYS.map(day => {
      let cal = 0, protein = 0, carbs = 0, fat = 0, count = 0;
      MEALS.forEach(meal => {
        const entryId = plan[day]?.[meal];
        if (!entryId) return;
        const entry = history.find(h => h.id === entryId);
        const recipe = entry?.recipe;
        if (!recipe) return;
        count++;
        cal += parseMacro(recipe.calories);
        protein += parseMacro(recipe.nutrition?.protein);
        carbs += parseMacro(recipe.nutrition?.carbs);
        fat += parseMacro(recipe.nutrition?.fat);
      });
      return { day, cal, protein, carbs, fat, count };
    });
  }, [plan, history]);

  const totalAssigned = dayData.reduce((s, d) => s + d.count, 0);

  const weekly = useMemo(() => {
    const activeDays = dayData.filter(d => d.count > 0);
    if (activeDays.length === 0) return null;
    const totalCal = activeDays.reduce((s, d) => s + d.cal, 0);
    const avgProtein = activeDays.reduce((s, d) => s + d.protein, 0) / activeDays.length;
    const avgCarbs = activeDays.reduce((s, d) => s + d.carbs, 0) / activeDays.length;
    const avgFat = activeDays.reduce((s, d) => s + d.fat, 0) / activeDays.length;
    const avgCal = totalCal / activeDays.length;
    return { totalCal, avgProtein, avgCarbs, avgFat, avgCal };
  }, [dayData]);

  const maxCal = Math.max(...dayData.map(d => d.cal), nutritionGoals?.calories || 0, 1);
  const goalCal = nutritionGoals?.calories ? parseFloat(nutritionGoals.calories) : null;

  const barColor = (cal) => {
    if (!goalCal) return '#f97316';
    if (cal > goalCal * 1.1) return '#ef4444';
    if (cal > goalCal * 0.9) return '#f59e0b';
    return '#22c55e';
  };

  if (totalAssigned < 3) {
    return (
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 text-center">
        <p className="text-sm text-slate-500">📊 Assign at least 3 meals to see nutrition projections</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
      <button
        onClick={() => setShow(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/2 transition-all"
      >
        <span className="font-semibold text-sm flex items-center gap-2">📊 Nutrition Overview</span>
        {show ? <ChevronUp size={16} className="text-slate-500" /> : <ChevronDown size={16} className="text-slate-500" />}
      </button>

      {show && (
        <div className="px-5 pb-5 space-y-6 animate-in fade-in duration-200">
          {/* Weekly summary */}
          {weekly && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Total Cal', value: Math.round(weekly.totalCal), unit: 'kcal', color: 'text-orange-400' },
                { label: 'Avg Protein', value: Math.round(weekly.avgProtein), unit: 'g/day', color: 'text-blue-400' },
                { label: 'Avg Carbs', value: Math.round(weekly.avgCarbs), unit: 'g/day', color: 'text-amber-400' },
                { label: 'Avg Fat', value: Math.round(weekly.avgFat), unit: 'g/day', color: 'text-purple-400' },
              ].map(s => (
                <div key={s.label} className="bg-slate-800/50 rounded-xl p-3 text-center">
                  <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">{s.label}</p>
                  <p className="text-[10px] text-slate-600">{s.unit}</p>
                </div>
              ))}
            </div>
          )}

          {/* Per-day calorie bar chart */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Daily Calories</p>
            <div className="overflow-x-auto">
              <svg viewBox={`0 0 ${DAYS.length * 56} 120`} className="w-full min-w-[320px]" style={{ height: 120 }}>
                {/* Goal line */}
                {goalCal && (
                  <>
                    <line
                      x1={0} y1={100 - (goalCal / maxCal) * 80}
                      x2={DAYS.length * 56} y2={100 - (goalCal / maxCal) * 80}
                      stroke="#f97316" strokeWidth="1" strokeDasharray="4,3" opacity="0.6"
                    />
                    <text x={DAYS.length * 56 - 2} y={100 - (goalCal / maxCal) * 80 - 3}
                      textAnchor="end" fontSize="8" fill="#f97316" opacity="0.7">goal</text>
                  </>
                )}
                {dayData.map((d, i) => {
                  const barH = d.cal > 0 ? Math.max(4, (d.cal / maxCal) * 80) : 0;
                  const x = i * 56 + 8;
                  const color = barColor(d.cal);
                  return (
                    <g key={d.day}>
                      {/* Bar */}
                      <rect x={x} y={100 - barH} width={40} height={barH} rx={4} fill={color} opacity={d.count > 0 ? 0.85 : 0.2} />
                      {/* Cal label */}
                      {d.cal > 0 && (
                        <text x={x + 20} y={100 - barH - 4} textAnchor="middle" fontSize="8" fill={color} fontWeight="bold">
                          {d.cal > 999 ? `${(d.cal / 1000).toFixed(1)}k` : Math.round(d.cal)}
                        </text>
                      )}
                      {/* Day label */}
                      <text x={x + 20} y={114} textAnchor="middle" fontSize="9" fill="#64748b">{DAYS_SHORT[i]}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Per-day macro stacked bars */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Daily Macros</p>
            <div className="space-y-2">
              {dayData.filter(d => d.count > 0).map(d => {
                const total = d.protein + d.carbs + d.fat || 1;
                const pPct = Math.round((d.protein / total) * 100);
                const cPct = Math.round((d.carbs / total) * 100);
                const fPct = 100 - pPct - cPct;
                return (
                  <div key={d.day} className="flex items-center gap-3">
                    <span className="text-xs text-slate-500 w-8 shrink-0">{DAYS_SHORT[DAYS.indexOf(d.day)]}</span>
                    <div className="flex-1 h-4 rounded-full overflow-hidden bg-slate-800 flex">
                      <div className="h-full bg-blue-500/70" style={{ width: `${pPct}%` }} title={`Protein ${Math.round(d.protein)}g`} />
                      <div className="h-full bg-amber-500/70" style={{ width: `${cPct}%` }} title={`Carbs ${Math.round(d.carbs)}g`} />
                      <div className="h-full bg-purple-500/70" style={{ width: `${Math.max(0, fPct)}%` }} title={`Fat ${Math.round(d.fat)}g`} />
                    </div>
                    <span className="text-xs text-slate-600 w-14 shrink-0 text-right">{Math.round(d.cal)} cal</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500/70 inline-block" />Protein</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500/70 inline-block" />Carbs</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500/70 inline-block" />Fat</span>
            </div>
          </div>

          {/* Goal comparison */}
          {nutritionGoals && weekly && (
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">vs Daily Goals</p>
              <div className="space-y-2">
                {[
                  { label: 'Calories', avg: Math.round(weekly.avgCal), goal: nutritionGoals.calories, unit: 'kcal', color: 'bg-orange-500' },
                  { label: 'Protein', avg: Math.round(weekly.avgProtein), goal: nutritionGoals.protein, unit: 'g', color: 'bg-blue-500' },
                  { label: 'Carbs', avg: Math.round(weekly.avgCarbs), goal: nutritionGoals.carbs, unit: 'g', color: 'bg-amber-500' },
                  { label: 'Fat', avg: Math.round(weekly.avgFat), goal: nutritionGoals.fat, unit: 'g', color: 'bg-purple-500' },
                ].filter(r => r.goal).map(r => {
                  const pct = Math.min(100, Math.round((r.avg / parseFloat(r.goal)) * 100));
                  const barClass = pct > 110 ? 'bg-red-500' : pct > 90 ? 'bg-amber-500' : 'bg-green-500';
                  return (
                    <div key={r.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">{r.label}</span>
                        <span className={pct > 110 ? 'text-red-400' : pct > 90 ? 'text-amber-400' : 'text-green-400'}>
                          {r.avg} / {r.goal} {r.unit}
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all ${barClass}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
