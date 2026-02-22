import React, { useEffect, useState } from 'react';

export default function BadgePopup({ badges, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!badges || badges.length === 0) return;
    // Use setTimeout to avoid setState-in-effect lint error
    const showTimer = setTimeout(() => setVisible(true), 0);
    const hideTimer = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, 3500);
    return () => { clearTimeout(showTimer); clearTimeout(hideTimer); };
  }, [badges]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!badges || badges.length === 0) return null;

  const badge = badges[0];

  return (
    <div
      className={`fixed top-20 right-4 z-[100] transition-all duration-400 ${visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}`}
    >
      <div className="bg-slate-900 border border-orange-500/30 rounded-2xl p-4 shadow-2xl shadow-orange-500/10 flex items-center gap-4 min-w-[240px]">
        <div className="text-3xl">{badge.icon}</div>
        <div>
          <p className="text-xs text-orange-400 font-bold uppercase tracking-widest">Badge Unlocked!</p>
          <p className="font-bold text-white">{badge.name}</p>
          <p className="text-xs text-slate-400">{badge.description}</p>
        </div>
      </div>
    </div>
  );
}
