import React, { useState } from 'react';

// Feature 39: Alert banner for pantry items expiring within 3 days
export default function PantryExpiryAlert({ onGoToPantry }) {
  const [now] = useState(() => Date.now());
  const raw = JSON.parse(localStorage.getItem('pantry_items') || '[]');
  const threeDays = 3 * 24 * 60 * 60 * 1000;

  const expiring = raw
    .filter(item => {
      if (!item || typeof item !== 'object') return false;
      if (!item.expiresAt) return false;
      const exp = new Date(item.expiresAt).getTime();
      return exp > now && exp - now <= threeDays;
    })
    .map(item => item.name || '');

  if (expiring.length === 0) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-red-500/30 bg-red-500/5">
      <span className="text-xl shrink-0">⚠️</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-red-400">Expiring Soon</p>
        <p className="text-sm text-slate-300 truncate">
          {expiring.slice(0, 3).join(', ')}
          {expiring.length > 3 ? ` +${expiring.length - 3} more` : ''}
        </p>
      </div>
      {onGoToPantry && (
        <button
          onClick={onGoToPantry}
          className="shrink-0 text-xs text-red-400 hover:text-red-300 font-medium transition-colors"
        >
          View →
        </button>
      )}
    </div>
  );
}
