import React, { useState, useRef } from 'react';
import { X } from 'lucide-react';

const ROULETTE_INGREDIENTS = [
  'chicken', 'salmon', 'tofu', 'shrimp', 'beef', 'lamb', 'eggs', 'lentils',
  'pasta', 'rice', 'quinoa', 'noodles', 'potatoes', 'bread', 'couscous', 'polenta',
  'tomatoes', 'spinach', 'mushrooms', 'broccoli', 'peppers', 'zucchini', 'eggplant', 'asparagus',
  'garlic', 'ginger', 'lemon', 'lime', 'onions', 'shallots', 'leeks', 'scallions',
  'coconut milk', 'cream', 'butter', 'olive oil', 'tahini', 'soy sauce', 'miso', 'harissa',
  'basil', 'cilantro', 'parsley', 'thyme', 'rosemary', 'cumin', 'paprika', 'turmeric',
];

function getRandomIngredients(count = 8) {
  const shuffled = [...ROULETTE_INGREDIENTS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

const SLOT_EMOJIS = {
  chicken: '🍗', salmon: '🐟', tofu: '🟨', shrimp: '🍤', beef: '🥩', lamb: '🐑', eggs: '🥚', lentils: '🫘',
  pasta: '🍝', rice: '🍚', quinoa: '🌾', noodles: '🍜', potatoes: '🥔', bread: '🍞', couscous: '🫙', polenta: '🌽',
  tomatoes: '🍅', spinach: '🥬', mushrooms: '🍄', broccoli: '🥦', peppers: '🫑', zucchini: '🥒', eggplant: '🍆', asparagus: '🌿',
  garlic: '🧄', ginger: '🫚', lemon: '🍋', lime: '🟢', onions: '🧅', shallots: '🧅', leeks: '🌿', scallions: '🌿',
  'coconut milk': '🥥', cream: '🫙', butter: '🧈', 'olive oil': '🫒', tahini: '🫙', 'soy sauce': '🫙', miso: '🫙', harissa: '🌶️',
  basil: '🌿', cilantro: '🌿', parsley: '🌿', thyme: '🌿', rosemary: '🌿', cumin: '🫙', paprika: '🌶️', turmeric: '🟡',
};

export default function IngredientRoulette({ onUseIngredients, onClose }) {
  const [slots, setSlots] = useState(() => getRandomIngredients(8));
  const [spinning, setSpinning] = useState(false);
  const [selected, setSelected] = useState([]);
  const spinRef = useRef(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setSelected([]);
    let count = 0;
    spinRef.current = setInterval(() => {
      setSlots(getRandomIngredients(8));
      count++;
      if (count >= 12) {
        clearInterval(spinRef.current);
        setSpinning(false);
      }
    }, 100);
  };

  const toggleSelect = (ing) => {
    setSelected(prev =>
      prev.includes(ing) ? prev.filter(x => x !== ing) : [...prev, ing]
    );
  };

  const handleUse = () => {
    const toUse = selected.length > 0 ? selected : slots.slice(0, 3);
    onUseIngredients(toUse);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white text-lg">🎰 Ingredient Roulette</p>
            <p className="text-xs text-slate-500">Spin to discover random ingredients</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        {/* Slots */}
        <div className="grid grid-cols-4 gap-2">
          {slots.map((ing, i) => (
            <button
              key={i}
              onClick={() => !spinning && toggleSelect(ing)}
              className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border transition-all duration-200
                ${spinning ? 'animate-pulse border-white/5 bg-slate-800/40' : ''}
                ${!spinning && selected.includes(ing) ? 'border-orange-500 bg-orange-500/15 scale-105' : ''}
                ${!spinning && !selected.includes(ing) ? 'border-white/10 bg-slate-800/60 hover:border-white/20' : ''}
              `}
            >
              <span className="text-xl">{SLOT_EMOJIS[ing] || '🥘'}</span>
              <span className="text-[10px] text-slate-300 text-center leading-tight capitalize">{ing}</span>
            </button>
          ))}
        </div>

        {selected.length > 0 && (
          <p className="text-xs text-orange-400 text-center">
            {selected.length} selected: {selected.join(', ')}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={spin}
            disabled={spinning}
            className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all text-sm"
          >
            {spinning ? '🎰 Spinning...' : '🎰 Spin!'}
          </button>
          <button
            onClick={handleUse}
            disabled={spinning}
            className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold rounded-2xl transition-all text-sm"
          >
            {selected.length > 0 ? `Use ${selected.length} Selected` : 'Use Top 3'}
          </button>
        </div>
      </div>
    </div>
  );
}
