import React, { useState } from 'react';

// Feature 37: Daily rotating cooking tip widget
const TIPS = [
  { emoji: '🔥', tip: 'Always preheat your pan before adding oil — a hot pan prevents sticking.' },
  { emoji: '🧂', tip: 'Salt your pasta water generously; it should taste like the sea.' },
  { emoji: '🥩', tip: 'Let meat rest after cooking — 5 min for steaks, 15+ for roasts.' },
  { emoji: '🌿', tip: 'Add delicate herbs (basil, parsley) at the very end to preserve flavour.' },
  { emoji: '🍳', tip: 'Pat proteins dry with paper towel before searing for a better crust.' },
  { emoji: '🧅', tip: 'For truly caramelised onions, cook on very low heat for at least 45 minutes.' },
  { emoji: '🌡️', tip: 'Use a meat thermometer — guessing doneness is the #1 cooking mistake.' },
  { emoji: '🫙', tip: 'Acid (lemon, vinegar) added at the end brightens every dish.' },
  { emoji: '🥚', tip: 'Room-temperature eggs incorporate better into batters and cook more evenly.' },
  { emoji: '🍷', tip: 'Only cook with wine you\'d drink. Bad wine = bad sauce.' },
  { emoji: '🫒', tip: 'Olive oil has a lower smoke point — use neutral oil for high-heat cooking.' },
  { emoji: '🍋', tip: 'Zest citrus before juicing — the zest contains the most flavour.' },
  { emoji: '🧄', tip: 'Let crushed garlic sit for 10 minutes before cooking to maximise allicin.' },
  { emoji: '🌶️', tip: 'Add chilli early for deeper heat; late for brighter, sharper heat.' },
  { emoji: '🥦', tip: 'Blanch vegetables in salted water, then shock in ice water to keep them vivid.' },
  { emoji: '🍞', tip: 'Scoring bread dough just before baking controls where it expands.' },
  { emoji: '🥗', tip: 'Dress salads just before serving — acid wilts greens quickly.' },
  { emoji: '🫕', tip: 'Braising liquid should come halfway up the meat, not cover it.' },
  { emoji: '🔪', tip: 'A sharp knife is safer than a dull one — it requires less pressure.' },
  { emoji: '🧊', tip: 'Chill your fat and bowl when making pastry for flakier results.' },
];

export default function CookingTipWidget() {
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Date.now() / 86400000) % TIPS.length);
  const tip = TIPS[tipIndex];

  const next = () => setTipIndex(i => (i + 1) % TIPS.length);

  return (
    <div className="rounded-xl border border-blue-500/15 bg-blue-500/5 px-4 py-3 flex items-start gap-3">
      <span className="text-xl shrink-0 mt-0.5">{tip.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-0.5">Chef's Tip</p>
        <p className="text-sm text-slate-300 leading-snug">{tip.tip}</p>
      </div>
      <button
        onClick={next}
        className="shrink-0 text-xs text-slate-600 hover:text-blue-400 transition-colors mt-0.5"
        title="Next tip"
      >
        ↻
      </button>
    </div>
  );
}
