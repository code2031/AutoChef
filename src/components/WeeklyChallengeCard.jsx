import React from 'react';

const WEEKLY_CHALLENGES = [
  { type: 'cuisine', label: 'Cook an Italian dish this week', check: (history) => history.some(e => (e.recipe?.description || '').toLowerCase().includes('italian') || (e.tags || []).includes('italian')) },
  { type: 'time', label: 'Make a recipe under 20 minutes', check: (history) => history.some(e => { const t = parseInt(e.recipe?.time); return t && t <= 20; }) },
  { type: 'vegan', label: 'Cook a vegan recipe', check: (history) => history.some(e => (e.tags || []).some(t => t.includes('vegan'))) },
  { type: 'hard', label: 'Tackle a Hard-difficulty recipe', check: (history) => history.some(e => e.recipe?.difficulty === 'Hard') },
  { type: 'new-cuisine', label: 'Try a cuisine you\'ve never cooked', check: () => false },
  { type: 'healthy', label: 'Cook 3 recipes under 400 cal', check: (history) => history.filter(e => parseInt(e.recipe?.calories) < 400).length >= 3 },
  { type: 'asian', label: 'Make an Asian-inspired dish', check: (history) => history.some(e => (e.recipe?.description || '').toLowerCase().includes('asian') || (e.tags || []).some(t => ['asian','japanese','korean','thai','chinese'].includes(t))) },
  { type: 'one-pan', label: 'Make a one-pan meal', check: (history) => history.some(e => (e.tags || []).includes('one-pan')) },
];

function getWeeklyChallenge() {
  const week = Math.floor(Date.now() / (7 * 86400000));
  return WEEKLY_CHALLENGES[week % WEEKLY_CHALLENGES.length];
}

function getWeekHistory(history) {
  const weekAgo = Date.now() - 7 * 86400000;
  return history.filter(e => e.savedAt && e.savedAt > weekAgo);
}

export default function WeeklyChallengeCard({ history }) {
  const challenge = getWeeklyChallenge();
  const weekHistory = getWeekHistory(history);
  const completed = challenge.check(weekHistory);

  return (
    <div className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${completed ? 'border-green-500/30 bg-green-500/5' : 'border-purple-500/20 bg-purple-500/5'}`}>
      <span className="text-xl shrink-0">{completed ? '✅' : '🗓️'}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-0.5">Weekly Challenge</p>
        <p className="text-sm text-slate-300 leading-snug">{challenge.label}</p>
      </div>
      {completed && <span className="text-xs font-bold text-green-400 shrink-0">Done!</span>}
    </div>
  );
}
