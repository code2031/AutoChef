import React from 'react';

const MASTERY_LEVELS = [
  { min: 0, label: '', color: '' },
  { min: 1, label: 'Tried', color: 'text-slate-400', icon: '🍽️' },
  { min: 2, label: 'Familiar', color: 'text-blue-400', icon: '⭐' },
  { min: 3, label: 'Mastered', color: 'text-amber-400', icon: '🏅' },
  { min: 5, label: 'Expert', color: 'text-orange-400', icon: '🌟' },
  { min: 10, label: 'Master', color: 'text-purple-400', icon: '👨‍🍳' },
];

function getMasteryLevel(cookCount) {
  const n = cookCount || 0;
  let level = MASTERY_LEVELS[0];
  for (const l of MASTERY_LEVELS) {
    if (n >= l.min) level = l;
    else break;
  }
  return level;
}

export default function MasteryBadge({ cookCount, className = '' }) {
  const level = getMasteryLevel(cookCount);
  if (!level.label) return null;
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-800/80 border border-white/10 ${level.color} ${className}`}
      title={`${level.label} — cooked ${cookCount}×`}
    >
      {level.icon} {level.label}
    </span>
  );
}
