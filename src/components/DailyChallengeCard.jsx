import React from 'react';
import { getDailyChallengeIngredient, getChallengeState, isChallengeCompletedToday } from '../lib/challenges.js';

export default function DailyChallengeCard({ onUseIngredient }) {
  const ingredient = getDailyChallengeIngredient();
  const state = getChallengeState();
  const completed = isChallengeCompletedToday(state);

  return (
    <div className={`relative rounded-2xl border overflow-hidden ${completed ? 'border-green-500/30 bg-green-500/5' : 'border-orange-500/30 bg-orange-500/5'}`}>
      {/* Background glow */}
      {!completed && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-transparent pointer-events-none" />
      )}
      <div className="relative p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Left: info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 text-lg">🔥</span>
            <p className="text-xs font-bold uppercase tracking-widest text-orange-400">Today's Challenge</p>
            {state.streak > 1 && (
              <span className="text-xs px-2 py-0.5 bg-orange-500/20 text-orange-300 rounded-full font-medium">
                {state.streak} days in a row!
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xl font-black ${completed ? 'text-green-300' : 'text-white'} capitalize`}>{ingredient}</span>
          </div>
          <p className="text-xs text-slate-400">
            {completed
              ? '✅ Challenge complete! Come back tomorrow for a new ingredient.'
              : 'Use this ingredient in today\'s recipe to complete the challenge.'}
          </p>
        </div>

        {/* Right: action */}
        {!completed ? (
          <button
            onClick={() => onUseIngredient(ingredient)}
            className="shrink-0 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-orange-500/20 animate-pulse hover:animate-none"
          >
            Use it! →
          </button>
        ) : (
          <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-green-500/20 border border-green-500/30 text-green-400 font-bold rounded-xl text-sm">
            <span>✅</span> Complete!
          </div>
        )}
      </div>
    </div>
  );
}
