import React, { useState } from 'react';
import { Plus, X, Trash2, Droplets, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const TODAY = () => new Date().toISOString().slice(0, 10);

function getMealBalanceScore(totals) {
  const { calories, protein, carbs, fat } = totals;
  if (calories <= 0) return null;
  const proteinPct = (protein * 4 / calories) * 100;
  const carbsPct = (carbs * 4 / calories) * 100;
  const fatPct = (fat * 9 / calories) * 100;
  let score = 0;
  if (proteinPct >= 15 && proteinPct <= 35) score++;
  if (carbsPct >= 35 && carbsPct <= 65) score++;
  if (fatPct >= 20 && fatPct <= 40) score++;
  const labels = ['Imbalanced', 'Somewhat Balanced', 'Well Balanced'];
  const colors = ['text-red-400', 'text-amber-400', 'text-green-400'];
  return { label: labels[score], color: colors[score], proteinPct: Math.round(proteinPct), carbsPct: Math.round(carbsPct), fatPct: Math.round(fatPct) };
}

function MacroProgressBar({ label, value, goal, color, unit = 'g' }) {
  if (!goal || goal <= 0) return null;
  const pct = Math.min(120, Math.round((value / goal) * 100));
  const barColor = pct > 100 ? 'bg-red-500' : pct >= 80 ? 'bg-amber-400' : 'bg-green-500';
  const remaining = goal - value;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center text-xs">
        <span className={`font-medium ${color}`}>{label}</span>
        <span className="text-slate-400">
          {value}{unit} / {goal}{unit}
          <span className={`ml-1.5 font-medium ${remaining < 0 ? 'text-red-400' : 'text-slate-500'}`}>
            {remaining < 0 ? `${Math.abs(remaining)}${unit} over` : `${remaining}${unit} left`}
          </span>
        </span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

function NutritionTrendChart({ log, calorieGoal }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (13 - i));
    return d.toISOString().slice(0, 10);
  });
  const dayTotals = days.map(date => {
    const entries = log.filter(e => e.date === date);
    return { date, calories: entries.reduce((s, e) => s + (parseInt(e.calories) || 0), 0) };
  });
  const daysWithData = dayTotals.filter(d => d.calories > 0);
  if (daysWithData.length < 2) return null;
  const maxCal = Math.max(...dayTotals.map(d => d.calories), calorieGoal || 0, 1);
  const W = 320, H = 100, PAD_X = 8, PAD_Y = 12;
  const barW = Math.floor((W - PAD_X * 2) / 14) - 2;
  const chartH = H - PAD_Y * 2;
  const todayStr = today.toISOString().slice(0, 10);
  const dayLabels = ["M","T","W","T","F","S","S"];
  const getBarColor = (cal) => {
    if (!calorieGoal || calorieGoal <= 0) return "#f97316";
    const pct = cal / calorieGoal;
    if (pct < 0.9) return "#22c55e";
    if (pct <= 1.1) return "#f59e0b";
    return "#ef4444";
  };
  const avgCal = Math.round(daysWithData.reduce((s, d) => s + d.calories, 0) / daysWithData.length);
  const daysOverGoal = calorieGoal > 0 ? daysWithData.filter(d => d.calories > calorieGoal).length : 0;
  const goalY = calorieGoal > 0 ? PAD_Y + chartH - (calorieGoal / maxCal) * chartH : null;
  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/2 transition-all text-left"
      >
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">14-Day Calorie Trend</p>
        {open ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2 animate-in fade-in duration-200">
          <svg viewBox="0 0 320 100" className="w-full" aria-label="14-day calorie trend chart">
            {dayTotals.map((d, i) => {
              const x = PAD_X + i * ((W - PAD_X * 2) / 14);
              const barH = d.calories > 0 ? Math.max(3, (d.calories / maxCal) * chartH) : 0;
              const y = PAD_Y + chartH - barH;
              const isToday = d.date === todayStr;
              const color = getBarColor(d.calories);
              return (
                <g key={d.date}>
                  {d.calories > 0 && (
                    <rect x={x + 1} y={y} width={barW} height={barH} fill={color} fillOpacity={isToday ? 1 : 0.6} stroke={isToday ? "#fff" : "none"} strokeWidth={isToday ? 1 : 0} rx="2" />
                  )}
                </g>
              );
            })}
            {goalY !== null && (
              <line x1={PAD_X} y1={goalY} x2={W - PAD_X} y2={goalY} stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="4 3" />
            )}
            {dayTotals.filter((_, i) => i % 2 === 0).map((d, idx) => {
              const i = idx * 2;
              const x = PAD_X + i * ((W - PAD_X * 2) / 14) + barW / 2;
              const dow = new Date(d.date).getDay();
              return <text key={d.date} x={x} y={H - 1} textAnchor="middle" fontSize="7" fill="rgba(255,255,255,0.25)" fontFamily="system-ui,sans-serif">{dayLabels[dow]}</text>;
            })}
          </svg>
          <p className="text-[11px] text-slate-500 text-center">
            {"Avg " + avgCal.toLocaleString() + " kcal/day"}
            {calorieGoal > 0 ? " · " + daysOverGoal + " day" + (daysOverGoal !== 1 ? "s" : "") + " over goal" : " · No goal set"}
          </p>
        </div>
      )}
    </div>
  );
}


function WeeklyMiniSummary({ log }) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    return d.toISOString().slice(0, 10);
  });

  const weekEntries = log.filter(e => days.includes(e.date));
  if (weekEntries.length === 0) return null;

  const dayTotals = days.map(date => {
    const dayEntries = weekEntries.filter(e => e.date === date);
    return {
      date,
      calories: dayEntries.reduce((s, e) => s + (parseInt(e.calories) || 0), 0),
      protein: dayEntries.reduce((s, e) => s + (parseFloat(e.protein) || 0), 0),
      carbs: dayEntries.reduce((s, e) => s + (parseFloat(e.carbs) || 0), 0),
      fat: dayEntries.reduce((s, e) => s + (parseFloat(e.fat) || 0), 0),
    };
  }).filter(d => d.calories > 0);

  if (dayTotals.length === 0) return null;

  const avg = (key) => Math.round(dayTotals.reduce((s, d) => s + d[key], 0) / dayTotals.length);

  return (
    <div className="border border-white/5 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-3 hover:bg-white/2 transition-all text-left"
      >
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">7-Day Average</p>
        {open ? <ChevronUp size={14} className="text-slate-600" /> : <ChevronDown size={14} className="text-slate-600" />}
      </button>
      {open && (
        <div className="px-3 pb-3 grid grid-cols-2 sm:grid-cols-4 gap-2 animate-in fade-in duration-200">
          {[
            { label: 'Avg Calories', value: avg('calories'), unit: 'kcal', color: 'text-orange-400' },
            { label: 'Avg Protein', value: avg('protein'), unit: 'g', color: 'text-blue-400' },
            { label: 'Avg Carbs', value: avg('carbs'), unit: 'g', color: 'text-amber-400' },
            { label: 'Avg Fat', value: avg('fat'), unit: 'g', color: 'text-purple-400' },
          ].map(({ label, value, unit, color }) => (
            <div key={label} className="text-center p-2 bg-slate-900/60 rounded-xl">
              <p className={`text-lg font-bold ${color}`}>{value}</p>
              <p className="text-[10px] text-slate-500">{unit} · {label}</p>
            </div>
          ))}
          <p className="col-span-2 sm:col-span-4 text-[10px] text-slate-600 text-center pt-1">
            Based on {dayTotals.length} day{dayTotals.length !== 1 ? 's' : ''} logged this week
          </p>
        </div>
      )}
    </div>
  );
}

export default function DailyFoodLog({ nutritionGoals, lastRecipe }) {
  const [log, setLog] = useLocalStorage('daily_food_log', []);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });

  const today = TODAY();
  const todayEntries = log.filter(e => e.date === today);

  const totals = todayEntries.reduce((acc, e) => ({
    calories: acc.calories + (parseInt(e.calories) || 0),
    protein: acc.protein + (parseFloat(e.protein) || 0),
    carbs: acc.carbs + (parseFloat(e.carbs) || 0),
    fat: acc.fat + (parseFloat(e.fat) || 0),
  }), { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const hydrationGlasses = Math.min(10, Math.max(6, Math.round(totals.calories / 250)));
  const balance = getMealBalanceScore(totals);

  const addMeal = () => {
    if (!form.name.trim()) return;
    const entry = {
      id: Date.now(),
      date: today,
      name: form.name.trim(),
      calories: form.calories,
      protein: form.protein,
      carbs: form.carbs,
      fat: form.fat,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setLog(prev => [entry, ...prev].slice(0, 200));
    setForm({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    setIsAdding(false);
  };

  const removeEntry = (id) => setLog(prev => prev.filter(e => e.id !== id));

  // Quick-log from last recipe
  const handleQuickLog = () => {
    if (!lastRecipe) return;
    const entry = {
      id: Date.now(),
      date: today,
      name: lastRecipe.name,
      calories: lastRecipe.calories ? String(lastRecipe.calories) : '',
      protein: lastRecipe.nutrition?.protein ? String(lastRecipe.nutrition.protein).replace(/\D/g, '') : '',
      carbs: lastRecipe.nutrition?.carbs ? String(lastRecipe.nutrition.carbs).replace(/\D/g, '') : '',
      fat: lastRecipe.nutrition?.fat ? String(lastRecipe.nutrition.fat).replace(/\D/g, '') : '',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setLog(prev => [entry, ...prev].slice(0, 200));
  };

  const hasGoals = nutritionGoals && (
    nutritionGoals.calories > 0 || nutritionGoals.protein > 0 ||
    nutritionGoals.carbs > 0 || nutritionGoals.fat > 0
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">🥗 Daily Food Log</p>
          <p className="text-xs text-slate-500 mt-0.5">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <button
          onClick={() => setIsAdding(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl text-xs font-medium hover:bg-orange-500/20 transition-all"
        >
          {isAdding ? <X size={13} /> : <Plus size={13} />}
          {isAdding ? 'Cancel' : 'Log Meal'}
        </button>
      </div>

      {/* Quick-log chip from last recipe */}
      {lastRecipe && !isAdding && (
        <button
          onClick={handleQuickLog}
          className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-white/5 rounded-xl text-xs text-slate-400 hover:border-orange-500/30 hover:text-orange-400 transition-all w-full text-left"
        >
          <span className="text-base shrink-0">⚡</span>
          <span>Log <span className="font-medium text-slate-200">{lastRecipe.name}</span> from last recipe</span>
        </button>
      )}

      {isAdding && (
        <div className="p-4 bg-slate-900/60 border border-white/5 rounded-2xl space-y-3 animate-in fade-in duration-200">
          <input
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Meal name (e.g. Pasta Carbonara)"
            className="w-full bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-orange-500/40 transition-all"
            autoFocus
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[['calories', '⚡ Cal'], ['protein', '🥩 Protein (g)'], ['carbs', '🍞 Carbs (g)'], ['fat', '🫙 Fat (g)']].map(([field, label]) => (
              <input
                key={field}
                type="number"
                value={form[field]}
                onChange={e => setForm(p => ({ ...p, [field]: e.target.value }))}
                placeholder={label}
                className="bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-orange-500/40 transition-all"
              />
            ))}
          </div>
          <button
            onClick={addMeal}
            disabled={!form.name.trim()}
            className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl disabled:opacity-40 transition-all"
          >
            Add to Log
          </button>
        </div>
      )}

      {todayEntries.length > 0 ? (
        <div className="space-y-2">
          {todayEntries.map(entry => (
            <div key={entry.id} className="flex items-center gap-3 p-3 bg-slate-900/40 border border-white/5 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate">{entry.name}</p>
                <p className="text-xs text-slate-500">
                  {entry.time}{entry.calories ? ` · ${entry.calories} cal` : ''}{entry.protein ? ` · ${entry.protein}g protein` : ''}
                </p>
              </div>
              <button onClick={() => removeEntry(entry.id)} className="p-1 text-slate-600 hover:text-red-400 transition-colors shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-600 text-sm py-6">No meals logged today yet.</p>
      )}

      {totals.calories > 0 && (
        <div className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Today&apos;s Totals</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Calories', value: totals.calories, unit: 'kcal', color: 'text-orange-400' },
              { label: 'Protein', value: Math.round(totals.protein), unit: 'g', color: 'text-blue-400' },
              { label: 'Carbs', value: Math.round(totals.carbs), unit: 'g', color: 'text-amber-400' },
              { label: 'Fat', value: Math.round(totals.fat), unit: 'g', color: 'text-purple-400' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="text-center">
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-[10px] text-slate-500">{unit} {label}</p>
              </div>
            ))}
          </div>

          {/* Nutrition goal progress bars */}
          {hasGoals && totals.calories > 0 && (
            <div className="pt-2 border-t border-white/5 space-y-3">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Goal Progress</p>
              <MacroProgressBar label="Calories" value={totals.calories} goal={parseInt(nutritionGoals.calories) || 0} color="text-orange-400" unit=" kcal" />
              <MacroProgressBar label="Protein" value={Math.round(totals.protein)} goal={parseInt(nutritionGoals.protein) || 0} color="text-blue-400" />
              <MacroProgressBar label="Carbs" value={Math.round(totals.carbs)} goal={parseInt(nutritionGoals.carbs) || 0} color="text-amber-400" />
              <MacroProgressBar label="Fat" value={Math.round(totals.fat)} goal={parseInt(nutritionGoals.fat) || 0} color="text-purple-400" />
            </div>
          )}

          {balance && (
            <div className="pt-2 border-t border-white/5 space-y-1">
              <p className="text-xs text-slate-500">Macro split: <span className={`font-medium ${balance.color}`}>{balance.label}</span></p>
              <p className="text-[11px] text-slate-600">P: {balance.proteinPct}% · C: {balance.carbsPct}% · F: {balance.fatPct}%</p>
            </div>
          )}
        </div>
      )}

      {/* Weekly mini-summary */}
      <WeeklyMiniSummary log={log} />
      <NutritionTrendChart log={log} calorieGoal={parseInt(nutritionGoals?.calories) || 0} />

      <div className="p-4 bg-blue-500/5 border border-blue-500/15 rounded-2xl space-y-2">
        <div className="flex items-center gap-2">
          <Droplets size={16} className="text-blue-400" />
          <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Hydration Goal</p>
        </div>
        <p className="text-sm text-slate-300">Drink <span className="font-bold text-blue-300">{hydrationGlasses} glasses</span> of water today</p>
        <div className="flex gap-1.5 flex-wrap">
          {Array.from({ length: hydrationGlasses }, (_, i) => (
            <span key={i} className="text-lg">💧</span>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">
          {totals.calories > 0 ? `Based on ${totals.calories} calories logged today` : 'Minimum 6 glasses recommended daily'}
        </p>
      </div>
    </div>
  );
}
