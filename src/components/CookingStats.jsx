import React, { useState } from 'react';
import { BarChart2, Download } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { generateWeeklyDigest } from '../lib/groq.js';
import { scoreRecipe } from './FlavorRadar.jsx';
import IngredientFrequency from './IngredientFrequency.jsx';

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


// Difficulty timeline for progression chart
function getDifficultyTimeline(history) {
  const map = { Easy: 1, Medium: 2, Hard: 3 };
  return history
    .filter(e => e.recipe?.difficulty && map[e.recipe.difficulty])
    .slice(-20)
    .map((e, i) => ({ x: i, y: map[e.recipe.difficulty] || 2, name: e.recipe?.name || '', diff: e.recipe.difficulty }));
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
  const [weeklyDigest, setWeeklyDigest] = useState(null);
  const [isLoadingDigest, setIsLoadingDigest] = useState(false);
  const [weeklyBudget] = useLocalStorage('pref_weekly_budget', '');

  const cuisines = getCuisineBreakdown(history);
  const weeklyData = getWeeklyActivity(history);
  const diffData = getDifficultyBreakdown(history);

  const maxCuisine = Math.max(...cuisines.map(([, c]) => c), 1);
  const maxWeek = Math.max(...weeklyData.map(w => w.count), 1);

  // Stats summary
  const totalCooked = history.length;
  const cookedRecipes = history.filter(e => (e.cookCount || 0) > 0).length;
  const mostCooked = history.length > 0 ? [...history].sort((a, b) => (b.cookCount || 0) - (a.cookCount || 0))[0] : null;
  const avgRating = (() => {
    const rated = history.filter(e => e.rating);
    if (!rated.length) return null;
    const ups = rated.filter(e => e.rating === 'up').length;
    return Math.round((ups / rated.length) * 100);
  })();
  // Feature 49: avg calories per serving
  const avgCalories = (() => {
    const calEntries = history.filter(e => parseInt(e.recipe?.calories) > 0);
    if (!calEntries.length) return null;
    return Math.round(calEntries.reduce((s, e) => s + parseInt(e.recipe.calories || 0), 0) / calEntries.length);
  })();
  // Feature 50: total estimated cook time
  const totalCookMins = history.reduce((s, e) => s + (parseInt(e.recipe?.time || e.recipe?.cookTime || 0) || 0), 0);
  const totalCookTimeLabel = totalCookMins > 0
    ? totalCookMins >= 60 ? `${Math.floor(totalCookMins / 60)}h ${totalCookMins % 60}m` : `${totalCookMins}m`
    : null;
  // Feature 57: recipes saved this month
  const monthStart = new Date(); monthStart.setDate(1); monthStart.setHours(0,0,0,0);
  const thisMonthCount = history.filter(e => new Date(e.savedAt) >= monthStart).length;

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

      {/* Signature Dish */}
      {mostCooked && (mostCooked.cookCount || 0) >= 2 && (
        <div className="flex items-center gap-4 bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4">
          {mostCooked.imageUrl && (
            <img src={mostCooked.imageUrl} alt={mostCooked.recipe?.name} className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
          )}
          <div className="min-w-0">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest">🏆 Your Signature Dish</p>
            <p className="font-bold text-white truncate">{mostCooked.recipe?.name}</p>
            <p className="text-xs text-slate-400">Cooked {mostCooked.cookCount} times</p>
          </div>
        </div>
      )}

      {/* Summary cards — features 49, 50, 54, 57 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Saved', value: totalCooked },
          { label: 'Favourites', value: history.filter(e => e.isFavourite).length },
          { label: 'Approval Rate', value: avgRating !== null ? `${avgRating}%` : '—' },
          { label: 'Most Cooked', value: mostCooked?.cookCount > 0 ? `${mostCooked.cookCount}×` : '—' },
          cookedRecipes > 0 && { label: 'Ever Cooked', value: cookedRecipes },
          avgCalories && { label: 'Avg Cal/Serving', value: `${avgCalories}` },
          totalCookTimeLabel && { label: 'Total Cook Time', value: totalCookTimeLabel },
          thisMonthCount > 0 && { label: 'This Month', value: thisMonthCount },
        ].filter(Boolean).map(({ label, value }) => (
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
          { id: 'progression', label: 'Progression' },
          { id: 'flavor', label: 'Flavor DNA' },
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
        {/* Feature 43: IngredientFrequency component with better normalization */}
        {tab === 'ingredients' && <IngredientFrequency history={history} />}
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
        {tab === 'progression' && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Difficulty Over Time (last 20 recipes)</p>
            {(() => {
              const data = getDifficultyTimeline(history);
              if (data.length < 2) return <p className="text-xs text-slate-500">Not enough data yet.</p>;
              const W = 300, H = 80, PAD = 10;
              const points = data.map((d, i) => {
                const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
                const y = H - PAD - ((d.y - 1) / 2) * (H - PAD * 2);
                return x + "," + y;
              }).join(" ");
              return (
                <div className="space-y-2">
                  <svg viewBox={"0 0 " + W + " " + H} className="w-full h-20">
                    <polyline points={points} fill="none" stroke="#f97316" strokeWidth="2" strokeLinejoin="round" />
                    {data.map((d, i) => {
                      const x = PAD + (i / (data.length - 1)) * (W - PAD * 2);
                      const y = H - PAD - ((d.y - 1) / 2) * (H - PAD * 2);
                      return <circle key={i} cx={x} cy={y} r="3" fill={d.diff === 'Hard' ? '#ef4444' : d.diff === 'Medium' ? '#f59e0b' : '#22c55e'} />;
                    })}
                  </svg>
                  <div className="flex justify-between text-[10px] text-slate-600">
                    <span>Oldest</span>
                    <div className="flex gap-3">
                      {[['Easy','#22c55e'],['Medium','#f59e0b'],['Hard','#ef4444']].map(([l,c]) => (
                        <span key={l} style={{ color: c }}>● {l}</span>
                      ))}
                    </div>
                    <span>Newest</span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {tab === 'flavor' && (() => {
          const allScores = history
            .filter(e => e.recipe)
            .map(e => scoreRecipe(e.recipe));
          if (allScores.length === 0) return <p className="text-xs text-slate-500">Not enough data yet.</p>;

          const flavors = ['Sweet', 'Savory', 'Spicy', 'Umami', 'Tangy', 'Fresh'];
          const avgScores = flavors.map(flavor => {
            const vals = allScores.map(s => s.find(x => x.flavor === flavor)?.score || 0);
            return { flavor, score: Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) };
          });

          const cx = 80, cy = 80, R = 50, n = 6;
          const angleStep = (2 * Math.PI) / n;
          const angleOf = (i) => -Math.PI / 2 + i * angleStep;
          const pointAt = (i, r) => ({ x: cx + r * Math.cos(angleOf(i)), y: cy + r * Math.sin(angleOf(i)) });
          const hexPath = (r) => {
            const pts = Array.from({ length: n }, (_, i) => pointAt(i, r));
            return pts.map((p, i) => (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ') + ' Z';
          };
          const dataPath = avgScores.map((s, i) => {
            const p = pointAt(i, (s.score / 10) * R);
            return (i === 0 ? 'M' : 'L') + p.x.toFixed(1) + ',' + p.y.toFixed(1);
          }).join(' ') + ' Z';

          const sorted = [...avgScores].sort((a, b) => b.score - a.score);
          const dominant = sorted.slice(0, 3);
          const blindSpots = sorted.filter(s => s.score < 3).slice(-2);

          const mean = avgScores.reduce((s, x) => s + x.score, 0) / n;
          const stdDev = Math.sqrt(avgScores.reduce((s, x) => s + Math.pow(x.score - mean, 2), 0) / n);
          const diversityLabel = stdDev < 1.5 ? 'Diverse' : stdDev < 2.5 ? 'Balanced' : 'Specialized';
          const diversityColor = stdDev < 1.5 ? 'text-green-400' : stdDev < 2.5 ? 'text-amber-400' : 'text-orange-400';

          return (
            <div className="space-y-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Your Flavor DNA ({history.length} recipes)</p>
              <div className="flex items-center justify-center">
                <svg viewBox="0 0 160 160" className="w-40 h-40" aria-label="Flavor DNA radar">
                  {[0.33, 0.66, 1].map((pct, ri) => (
                    <path key={ri} d={hexPath(R * pct)} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                  ))}
                  {avgScores.map((_, i) => {
                    const p = pointAt(i, R);
                    return <line key={i} x1={cx} y1={cy} x2={p.x.toFixed(1)} y2={p.y.toFixed(1)} stroke="rgba(255,255,255,0.12)" strokeWidth="1" />;
                  })}
                  <path d={dataPath} fill="rgba(249,115,22,0.15)" stroke="rgba(249,115,22,0.7)" strokeWidth="2" strokeLinejoin="round" />
                  {avgScores.map((s, i) => {
                    const p = pointAt(i, (s.score / 10) * R);
                    return <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="3" fill="#f97316" />;
                  })}
                  {avgScores.map((s, i) => {
                    const angle = angleOf(i);
                    const labelR = R + 16;
                    const lx = cx + labelR * Math.cos(angle);
                    const ly = cy + labelR * Math.sin(angle);
                    const anchor = lx < cx - 4 ? 'end' : lx > cx + 4 ? 'start' : 'middle';
                    return (
                      <g key={i}>
                        <text x={lx.toFixed(1)} y={(ly - 2).toFixed(1)} textAnchor={anchor} fontSize="6.5" fill="rgba(255,255,255,0.5)" fontFamily="system-ui,sans-serif">{s.flavor}</text>
                        <text x={lx.toFixed(1)} y={(ly + 6).toFixed(1)} textAnchor={anchor} fontSize="6.5" fill="#f97316" fontFamily="system-ui,sans-serif" fontWeight="bold">{s.score}/10</text>
                      </g>
                    );
                  })}
                </svg>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Dominant Flavors</p>
                  <div className="flex flex-wrap gap-2">
                    {dominant.map(({ flavor, score }) => (
                      <span key={flavor} className="px-2.5 py-1 bg-orange-500/15 border border-orange-500/25 text-orange-300 rounded-full text-xs font-medium">{flavor} &#183; {score}/10</span>
                    ))}
                  </div>
                </div>

                {blindSpots.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Flavor Blind Spots</p>
                    <div className="flex flex-wrap gap-2">
                      {blindSpots.map(({ flavor, score }) => (
                        <span key={flavor} className="px-2.5 py-1 bg-slate-800 border border-white/5 text-slate-400 rounded-full text-xs">
                          {flavor} &#183; {score}/10 — try more {flavor.toLowerCase()} dishes!
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Flavor Diversity:</span>
                  <span className={`text-xs font-bold ${diversityColor}`}>{diversityLabel}</span>
                  <span className="text-xs text-slate-600">(&#963;={stdDev.toFixed(1)})</span>
                </div>
              </div>
            </div>
          );
        })()}
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

      {/* Weekly Digest */}
      {(() => {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        weekStart.setHours(0, 0, 0, 0);
        const weekRecipes = history.filter(e => new Date(e.savedAt) >= weekStart);
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Weekly Digest</p>
              <span className="text-xs text-slate-500">{weekRecipes.length} this week</span>
            </div>
            {weeklyDigest ? (
              <div className="p-4 bg-slate-800/60 border border-white/5 rounded-2xl space-y-2">
                <p className="text-sm text-slate-200 leading-relaxed">{weeklyDigest.summary}</p>
                {weeklyDigest.highlight && <p className="text-xs text-orange-400">{weeklyDigest.highlight}</p>}
                {weeklyDigest.encouragement && <p className="text-xs text-slate-400 italic">{weeklyDigest.encouragement}</p>}
              </div>
            ) : (
              <button
                onClick={async () => {
                  setIsLoadingDigest(true);
                  try {
                    const result = await generateWeeklyDigest(weekRecipes);
                    setWeeklyDigest(result);
                  } catch { /* ignore */ } finally {
                    setIsLoadingDigest(false);
                  }
                }}
                disabled={isLoadingDigest}
                className="w-full py-3 bg-slate-800 border border-white/5 text-slate-400 rounded-xl text-sm transition-all flex items-center justify-center gap-2"
              >
                {isLoadingDigest ? (
                  <><span className="w-4 h-4 border-2 border-slate-400/30 border-t-slate-400 rounded-full animate-spin" /> Generating...</>
                ) : (
                  "Generate My Weekly Digest"
                )}
              </button>
            )}
          </div>
        );
      })()}

      {/* Budget tracker */}
      {weeklyBudget && (
        <div className="p-4 bg-slate-800/40 border border-white/5 rounded-2xl space-y-2">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Weekly Budget</p>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Weekly budget</span>
            <span className="font-bold text-green-400">{weeklyBudget}</span>
          </div>
          <p className="text-xs text-slate-500">Set in Settings. Compare against Shopping List costs.</p>
        </div>
      )}
    </div>
  );
}
