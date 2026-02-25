import React, { useState } from 'react';

export default function StreakCalendar({ history }) {
  const [tooltip, setTooltip] = useState(null);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build count-by-day map
  const countByDay = {};
  history.forEach(e => {
    if (!e.savedAt) return;
    const d = new Date(e.savedAt);
    d.setHours(0, 0, 0, 0);
    const key = d.toISOString().slice(0, 10);
    countByDay[key] = (countByDay[key] || 0) + 1;
  });

  // Build 53 weeks × 7 days grid (364 days back from today + today = 365 cells)
  const WEEKS = 53;
  const cells = [];
  // Start from the Sunday that is >= 364 days ago
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 364);
  // Align to previous Sunday
  const dayOfWeek = startDate.getDay(); // 0=Sun
  startDate.setDate(startDate.getDate() - dayOfWeek);

  for (let w = 0; w < WEEKS; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + w * 7 + d);
      if (date > today) { week.push(null); continue; }
      const key = date.toISOString().slice(0, 10);
      week.push({ date, key, count: countByDay[key] || 0 });
    }
    cells.push(week);
  }

  const maxCount = Math.max(...Object.values(countByDay), 1);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  // Month labels: find first week of each month
  const monthLabels = [];
  cells.forEach((week, wi) => {
    const first = week.find(c => c);
    if (first && first.date.getDate() <= 7) {
      monthLabels.push({ wi, label: months[first.date.getMonth()] });
    }
  });

  const getColor = (count) => {
    if (count === 0) return 'bg-slate-800';
    const pct = count / maxCount;
    if (pct <= 0.25) return 'bg-orange-500/25';
    if (pct <= 0.5) return 'bg-orange-500/50';
    if (pct <= 0.75) return 'bg-orange-500/75';
    return 'bg-orange-500';
  };

  // Current streak: consecutive days with at least 1 recipe
  let streak = 0;
  const check = new Date(today);
  while (true) {
    const key = check.toISOString().slice(0, 10);
    if (countByDay[key]) { streak++; check.setDate(check.getDate() - 1); }
    else break;
  }

  // Longest streak
  let longest = 0, cur = 0;
  const allKeys = Object.keys(countByDay).sort();
  allKeys.forEach((k, i) => {
    if (i === 0) { cur = 1; return; }
    const prev = new Date(allKeys[i - 1]);
    prev.setDate(prev.getDate() + 1);
    if (prev.toISOString().slice(0, 10) === k) cur++;
    else cur = 1;
    longest = Math.max(longest, cur);
  });
  longest = Math.max(longest, cur, streak);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">365-Day Recipe Streak</p>
        <div className="flex gap-4 text-xs text-slate-400">
          <span>🔥 Current: <span className="text-orange-400 font-bold">{streak}d</span></span>
          <span>🏆 Best: <span className="text-amber-400 font-bold">{longest}d</span></span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-max">
          {/* Month labels */}
          <div className="flex mb-1 ml-6">
            {cells.map((_, wi) => {
              const ml = monthLabels.find(m => m.wi === wi);
              return (
                <div key={wi} className="w-3.5 flex-shrink-0">
                  {ml && <span className="text-[9px] text-slate-600">{ml.label}</span>}
                </div>
              );
            })}
          </div>
          <div className="flex gap-0.5">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <span key={i} className="text-[9px] text-slate-700 h-3.5 flex items-center">{i % 2 === 1 ? d : ''}</span>
              ))}
            </div>
            {/* Grid */}
            {cells.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.map((cell, di) => {
                  if (!cell) return <div key={di} className="w-3.5 h-3.5" />;
                  return (
                    <div
                      key={di}
                      className={`w-3.5 h-3.5 rounded-sm ${getColor(cell.count)} transition-all cursor-default relative`}
                      onMouseEnter={() => setTooltip({ key: cell.key, count: cell.count, x: wi, y: di })}
                      onMouseLeave={() => setTooltip(null)}
                      title={`${cell.key}: ${cell.count} recipe${cell.count !== 1 ? 's' : ''}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {tooltip && tooltip.count > 0 && (
        <p className="text-xs text-slate-400 text-center">
          {tooltip.key}: <span className="text-orange-400 font-bold">{tooltip.count}</span> recipe{tooltip.count !== 1 ? 's' : ''}
        </p>
      )}

      <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
        <span>Less</span>
        {['bg-slate-800','bg-orange-500/25','bg-orange-500/50','bg-orange-500/75','bg-orange-500'].map((c,i) => (
          <div key={i} className={`w-3 h-3 rounded-sm ${c}`} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
