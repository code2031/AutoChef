import React, { useState } from 'react';

const DIFF_COLOR = {
  Easy: '#22c55e',
  Medium: '#f59e0b',
  Hard: '#ef4444',
};

export default function DifficultyHeatMap({ history }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth()); // 0-indexed

  // Map date → dominant difficulty
  const diffByDay = {};
  history.forEach(e => {
    if (!e.savedAt || !e.recipe?.difficulty) return;
    const d = new Date(e.savedAt);
    if (d.getFullYear() !== year || d.getMonth() !== month) return;
    const day = d.getDate();
    diffByDay[day] = diffByDay[day] || [];
    diffByDay[day].push(e.recipe.difficulty);
  });

  // Dominant difficulty per day (most frequent)
  const getDominant = (diffs) => {
    if (!diffs || !diffs.length) return null;
    const counts = {};
    diffs.forEach(d => counts[d] = (counts[d] || 0) + 1);
    return Object.entries(counts).sort((a,b) => b[1]-a[1])[0][0];
  };

  const firstDay = new Date(year, month, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };
  const isNextDisabled = year === now.getFullYear() && month === now.getMonth();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const totalRecipes = history.filter(e => {
    if (!e.savedAt) return false;
    const d = new Date(e.savedAt);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Difficulty Calendar</p>
        <span className="text-xs text-slate-500">{totalRecipes} recipes this month</span>
      </div>

      <div className="flex items-center justify-between mb-2">
        <button onClick={prevMonth} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-all text-sm">←</button>
        <p className="text-sm font-semibold text-slate-200">{monthNames[month]} {year}</p>
        <button onClick={nextMonth} disabled={isNextDisabled} className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white disabled:opacity-30 transition-all text-sm">→</button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <div key={d} className="text-[10px] text-slate-600 font-medium pb-1">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={i} />;
          const diffs = diffByDay[day];
          const dominant = getDominant(diffs);
          const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
          return (
            <div
              key={i}
              title={dominant ? `${diffs.length} recipe${diffs.length !== 1 ? 's' : ''} — ${dominant}` : `${day}`}
              className={`aspect-square flex items-center justify-center rounded-lg text-xs font-medium transition-all cursor-default
                ${isToday ? 'ring-1 ring-orange-500' : ''}
                ${dominant ? 'text-white' : 'text-slate-600 bg-slate-800/50'}
              `}
              style={dominant ? { backgroundColor: DIFF_COLOR[dominant] + '60', color: DIFF_COLOR[dominant] } : {}}
            >
              {day}
            </div>
          );
        })}
      </div>

      <div className="flex gap-3 text-xs">
        {Object.entries(DIFF_COLOR).map(([diff, color]) => (
          <div key={diff} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color + '80' }} />
            <span className="text-slate-400">{diff}</span>
          </div>
        ))}
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-slate-800" />
          <span className="text-slate-400">None</span>
        </div>
      </div>
    </div>
  );
}
