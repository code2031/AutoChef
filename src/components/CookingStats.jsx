import React, { useState } from 'react';
import { BarChart2, Download } from 'lucide-react';

function exportCSV(history) {
  const headers = ['Name', 'Date', 'Difficulty', 'Calories', 'Protein', 'Carbs', 'Fat', 'Fiber', 'Rating', 'Cook Count', 'Tags'];
  const rows = history.map(e => [
    e.recipe?.name || '',
    e.savedAt ? new Date(e.savedAt).toLocaleDateString() : '',
    e.recipe?.difficulty || '',
    e.recipe?.calories || '',
    e.recipe?.nutrition?.protein || '',
    e.recipe?.nutrition?.carbs || '',
    e.recipe?.nutrition?.fat || '',
    e.recipe?.nutrition?.fiber || '',
    e.rating || '',
    e.cookCount || 0,
    (e.tags || []).join('; '),
  ]);
  const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'autochef-history.csv';
  a.click();
  URL.revokeObjectURL(url);
}

// Top N ingredients across all recipes
function getTopIngredients(history, n = 10) {
  const counts = {};
  history.forEach(entry => {
    (entry.recipe?.ingredients || []).forEach(ing => {
      // Extract the base ingredient name (first 1-2 words, lowercase)
      const base = ing.toLowerCase().replace(/^\d+[\s\w/]*\s/, '').split(/[,\s(]/)[0].trim();
      if (base.length > 2) counts[base] = (counts[base] || 0) + 1;
    });
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, n);
}

// Cuisine breakdown
function getCuisineBreakdown(history) {
  const counts = {};
  history.forEach(entry => {
    const tags = entry.tags || [];
    const cuisines = ['italian', 'asian', 'mexican', 'indian', 'french', 'japanese', 'mediterranean', 'american'];
    const found = cuisines.find(c => tags.includes(c) || (entry.recipe?.name || '').toLowerCase().includes(c));
    const key = found || 'other';
    counts[key] = (counts[key] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

// Recipes per week (last 8 weeks)
function getWeeklyActivity(history) {
  const weeks = Array.from({ length: 8 }, (_, i) => {
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    end.setDate(end.getDate() - i * 7);
    const start = new Date(end);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { label: `W-${i}`, start, end, count: 0 };
  }).reverse();
  history.forEach(entry => {
    const d = new Date(entry.savedAt);
    const w = weeks.find(wk => d >= wk.start && d <= wk.end);
    if (w) w.count++;
  });
  return weeks;
}

// Difficulty distribution
function getDifficultyBreakdown(history) {
  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  history.forEach(e => {
    const d = e.recipe?.difficulty;
    if (d && counts[d] !== undefined) counts[d]++;
  });
  return Object.entries(counts);
}

// Simple horizontal bar chart (SVG)
function BarChart({ data, maxVal, color = '#f97316' }) {
  if (!data.length) return <p className="text-xs text-slate-500">Not enough data yet.</p>;
  return (
    <div className="space-y-1.5">
      {data.map(([label, count]) => (
        <div key={label} className="flex items-center gap-2">
          <span className="text-xs text-slate-400 w-24 truncate shrink-0">{label}</span>
          <div className="flex-1 bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.max(4, (count / maxVal) * 100)}%`, background: color }}
            />
          </div>
          <span className="text-xs text-slate-500 w-6 text-right shrink-0">{count}</span>
        </div>
      ))}
    </div>
  );
}

export default function CookingStats({ history }) {
  const [tab, setTab] = useState('ingredients');

  const topIngredients = getTopIngredients(history);
  const cuisines = getCuisineBreakdown(history);
  const weeklyData = getWeeklyActivity(history);
  const diffData = getDifficultyBreakdown(history);

  const maxIng = Math.max(...topIngredients.map(([, c]) => c), 1);
  const maxCuisine = Math.max(...cuisines.map(([, c]) => c), 1);
  const maxWeek = Math.max(...weeklyData.map(w => w.count), 1);

  // Stats summary
  const totalCooked = history.length;
  const mostCooked = history.length > 0 ? [...history].sort((a, b) => (b.cookCount || 0) - (a.cookCount || 0))[0] : null;
  const avgRating = (() => {
    const rated = history.filter(e => e.rating);
    if (!rated.length) return null;
    const ups = rated.filter(e => e.rating === 'up').length;
    return Math.round((ups / rated.length) * 100);
  })();

  if (history.length === 0) {
    return (
      <div className="py-12 text-center text-slate-500 space-y-2">
        <BarChart2 size={32} className="mx-auto opacity-30" />
        <p>No recipes yet. Start cooking to see your stats!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with CSV export */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cooking Statistics</p>
        <button
          onClick={() => exportCSV(history)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 border border-white/10 text-slate-400 hover:text-white hover:border-white/20 text-xs transition-all"
          title="Export to CSV"
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Saved', value: totalCooked },
          { label: 'Favourites', value: history.filter(e => e.isFavourite).length },
          { label: 'Approval Rate', value: avgRating !== null ? `${avgRating}%` : '—' },
          { label: 'Most Cooked', value: mostCooked?.cookCount > 0 ? `${mostCooked.cookCount}×` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-slate-800/60 border border-white/5 rounded-2xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Chart tabs */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'ingredients', label: 'Top Ingredients' },
          { id: 'cuisine', label: 'Cuisines' },
          { id: 'weekly', label: 'Weekly' },
          { id: 'difficulty', label: 'Difficulty' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === t.id ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5">
        {tab === 'ingredients' && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Most Used Ingredients</p>
            <BarChart data={topIngredients} maxVal={maxIng} color="#f97316" />
          </div>
        )}
        {tab === 'cuisine' && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cuisine Breakdown</p>
            <BarChart data={cuisines} maxVal={maxCuisine} color="#8b5cf6" />
          </div>
        )}
        {tab === 'weekly' && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Recipes per Week (last 8 weeks)</p>
            <div className="flex items-end gap-2 h-32">
              {weeklyData.map((w, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-orange-500 rounded-t-sm transition-all"
                    style={{ height: `${Math.max(4, (w.count / maxWeek) * 100)}%` }}
                    title={`${w.count} recipes`}
                  />
                  <span className="text-[10px] text-slate-600">{w.count > 0 ? w.count : ''}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-600">
              <span>8 weeks ago</span><span>This week</span>
            </div>
          </div>
        )}
        {tab === 'difficulty' && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Difficulty Distribution</p>
            <BarChart
              data={diffData}
              maxVal={Math.max(...diffData.map(([, c]) => c), 1)}
              color="#22c55e"
            />
          </div>
        )}
      </div>

      {mostCooked && mostCooked.cookCount > 0 && (
        <div className="p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl flex items-center gap-3">
          {mostCooked.imageUrl && <img src={mostCooked.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />}
          <div>
            <p className="text-xs text-orange-400 font-bold uppercase tracking-widest">Most Cooked</p>
            <p className="font-medium">{mostCooked.recipe?.name}</p>
            <p className="text-xs text-slate-500">Cooked {mostCooked.cookCount} time{mostCooked.cookCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      )}
    </div>
  );
}
