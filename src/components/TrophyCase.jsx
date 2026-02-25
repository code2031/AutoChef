import React, { useState } from 'react';
import { BADGES } from '../lib/achievements.js';

function StatCard({ icon, label, value, sub }) {
  return (
    <div className="bg-slate-900 border border-white/5 rounded-2xl p-4 text-center space-y-1">
      <p className="text-2xl">{icon}</p>
      <p className="text-xl font-bold text-white">{value ?? 0}</p>
      <p className="text-xs font-bold text-slate-400">{label}</p>
      {sub && <p className="text-[10px] text-slate-600">{sub}</p>}
    </div>
  );
}

export default function TrophyCase({ badges: unlockedIds, streak, bestStreak, stats }) {
  const [selectedBadge, setSelectedBadge] = useState(null);

  const handleBadgeTap = (badge) => {
    setSelectedBadge(prev => prev?.id === badge.id ? null : badge);
  };

  const isUnlocked = (id) => (unlockedIds || []).includes(id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard icon="🔥" label="Streak" value={streak || 0} sub="current days" />
        <StatCard icon="⚡" label="Best Streak" value={bestStreak || 0} sub="all time" />
        <StatCard icon="🍳" label="Recipes" value={stats?.totalRecipes || 0} sub="generated" />
      </div>

      {/* Badge grid */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
          Badges — {(unlockedIds || []).length} / {BADGES.length} unlocked
        </p>
        <div className="grid grid-cols-5 gap-2">
          {BADGES.map(badge => {
            const unlocked = isUnlocked(badge.id);
            return (
              <button
                key={badge.id}
                onClick={() => handleBadgeTap(badge)}
                className={`flex flex-col items-center gap-1 p-2 rounded-2xl border transition-all ${
                  unlocked
                    ? selectedBadge?.id === badge.id
                      ? 'bg-orange-500/15 border-orange-500/50 scale-105'
                      : 'bg-slate-900 border-white/10 hover:border-orange-500/30 hover:scale-105'
                    : 'bg-slate-900/40 border-white/5 opacity-50 hover:opacity-70'
                }`}
                title={unlocked ? badge.description : badge.hint}
              >
                <span className={`text-2xl ${unlocked ? '' : 'grayscale'}`}>
                  {unlocked ? badge.icon : '?'}
                </span>
                <p className={`text-[9px] leading-tight text-center font-medium ${unlocked ? 'text-slate-300' : 'text-slate-600'}`}>
                  {unlocked ? badge.name : '???'}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected badge detail */}
      {selectedBadge && (
        <div className={`p-4 rounded-2xl border animate-in fade-in duration-200 ${
          isUnlocked(selectedBadge.id)
            ? 'bg-orange-500/5 border-orange-500/20'
            : 'bg-slate-900 border-white/5'
        }`}>
          <div className="flex items-start gap-3">
            <span className={`text-4xl ${isUnlocked(selectedBadge.id) ? '' : 'grayscale opacity-50'}`}>
              {isUnlocked(selectedBadge.id) ? selectedBadge.icon : '🔒'}
            </span>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-white">{selectedBadge.name}</p>
                {isUnlocked(selectedBadge.id) && (
                  <span className="text-[10px] bg-green-500/15 text-green-400 border border-green-500/20 px-2 py-0.5 rounded-full font-bold">Unlocked</span>
                )}
              </div>
              <p className="text-sm text-slate-300">{selectedBadge.description}</p>
              {!isUnlocked(selectedBadge.id) && (
                <p className="text-xs text-slate-500 mt-1">
                  <span className="text-amber-400 font-medium">How to unlock:</span> {selectedBadge.hint}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
