import React, { useState } from 'react';
import { BADGES, getLevel } from '../lib/achievements.js';

function LevelBanner({ points, levelInfo }) {
  const { level, title, pointsForNext, progress, currentMin } = levelInfo;

  const gradients = [
    'from-slate-600 to-slate-500',   // 1
    'from-amber-800 to-amber-700',   // 2
    'from-amber-700 to-amber-600',   // 3
    'from-lime-700 to-lime-600',     // 4
    'from-green-700 to-green-600',   // 5
    'from-teal-700 to-teal-600',     // 6
    'from-cyan-700 to-cyan-600',     // 7
    'from-sky-700 to-sky-600',       // 8
    'from-blue-700 to-blue-600',     // 9
    'from-indigo-700 to-indigo-600', // 10
    'from-violet-700 to-violet-600', // 11
    'from-purple-700 to-purple-600', // 12
    'from-fuchsia-700 to-fuchsia-600',// 13
    'from-pink-700 to-pink-600',     // 14
    'from-rose-700 to-rose-600',     // 15
    'from-red-700 to-red-600',       // 16
    'from-orange-700 to-orange-600', // 17
    'from-orange-600 to-orange-500', // 18
    'from-amber-600 to-yellow-500',  // 19
    'from-yellow-500 to-amber-400',  // 20
    'from-amber-400 to-yellow-300',  // 21
  ];
  const grad = gradients[Math.min(level - 1, gradients.length - 1)];

  return (
    <div className={`bg-gradient-to-r ${grad} rounded-2xl p-5 space-y-3`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-white/20 leading-none">LV</span>
            <span className="text-5xl font-black text-white leading-none">{level}</span>
          </div>
          <p className="text-white font-bold text-lg mt-1">{title}</p>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-xs uppercase tracking-widest">Total XP</p>
          <p className="text-white font-bold text-2xl">{points?.toLocaleString() || 0}</p>
        </div>
      </div>

      {pointsForNext && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-white/70">
            <span>{currentMin} XP</span>
            <span>{pointsForNext} XP</span>
          </div>
          <div className="h-2.5 bg-black/20 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/40 rounded-full transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-white/60 text-right">
            {pointsForNext - (points || 0)} XP to {(() => {
              const LEVEL_THRESHOLDS = [
                { level: 1, title: 'Apprentice' }, { level: 2, title: 'Kitchen Helper' },
                { level: 3, title: 'Home Cook' }, { level: 4, title: 'Line Cook' },
                { level: 5, title: 'Prep Chef' }, { level: 6, title: 'Sauté Chef' },
                { level: 7, title: 'Pastry Chef' }, { level: 8, title: 'Station Chef' },
                { level: 9, title: 'Sous Chef' }, { level: 10, title: 'Chef de Partie' },
              ];
              return LEVEL_THRESHOLDS.find(l => l.level === level + 1)?.title || 'next level';
            })()}
          </p>
        </div>
      )}
      {!pointsForNext && (
        <p className="text-xs text-white/70 text-center font-medium">Maximum level reached! 🏅</p>
      )}
    </div>
  );
}

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

export default function TrophyCase({ points, badges: unlockedIds, streak, bestStreak, stats }) {
  const [selectedBadge, setSelectedBadge] = useState(null);
  const levelInfo = getLevel(points || 0);

  const handleBadgeTap = (badge) => {
    setSelectedBadge(prev => prev?.id === badge.id ? null : badge);
  };

  const isUnlocked = (id) => (unlockedIds || []).includes(id);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Level Banner */}
      <LevelBanner points={points || 0} levelInfo={levelInfo} />

      {/* Streak + stats row */}
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
