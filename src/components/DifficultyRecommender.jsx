import React from 'react';

export default function DifficultyRecommender({ history }) {
  if (!history || history.length < 3) return null;

  const counts = { Easy: 0, Medium: 0, Hard: 0 };
  history.slice(-20).forEach(e => {
    const d = e.recipe?.difficulty;
    if (d && counts[d] !== undefined) counts[d]++;
  });

  const total = counts.Easy + counts.Medium + counts.Hard;
  if (total === 0) return null;

  // Determine recommendation
  let rec = null;
  const easyPct = counts.Easy / total;
  const medPct = counts.Medium / total;

  if (easyPct > 0.6) {
    rec = { level: 'Medium', emoji: '📈', msg: "You're an Easy recipe pro! Ready for a Medium challenge?" };
  } else if (medPct > 0.6 && counts.Hard === 0) {
    rec = { level: 'Hard', emoji: '🔥', msg: "Crushing Medium recipes! Try a Hard one this time?" };
  } else if (counts.Hard > 2 && easyPct < 0.2) {
    rec = { level: 'Easy', emoji: '🧘', msg: "You've been cooking hard lately — a quick Easy recipe might be refreshing." };
  }

  if (!rec) return null;

  return (
    <div className="flex items-start gap-2.5 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs">
      <span className="text-base mt-0.5">{rec.emoji}</span>
      <div>
        <p className="text-amber-300 font-medium">{rec.msg}</p>
        <p className="text-slate-500 mt-0.5">Based on your last {total} recipes.</p>
      </div>
    </div>
  );
}
