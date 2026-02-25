import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { generateCuisineDeepDive } from '../lib/groq.js';

const CUISINES = [
  { name: 'Italian', emoji: '🍝' },
  { name: 'Japanese', emoji: '🍣' },
  { name: 'Mexican', emoji: '🌮' },
  { name: 'Indian', emoji: '🍛' },
  { name: 'French', emoji: '🥐' },
  { name: 'Thai', emoji: '🍜' },
  { name: 'Mediterranean', emoji: '🫒' },
  { name: 'Chinese', emoji: '🥟' },
  { name: 'Korean', emoji: '🥘' },
  { name: 'Middle Eastern', emoji: '🧆' },
  { name: 'Greek', emoji: '🥗' },
  { name: 'Spanish', emoji: '🥘' },
];

export default function CuisineDeepDive({ onClose }) {
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = async (cuisine) => {
    if (selected === cuisine.name && result) return;
    setSelected(cuisine.name);
    setResult(null);
    setLoading(true);
    try {
      const data = await generateCuisineDeepDive(cuisine.name);
      setResult(data);
    } catch {
      setResult({ description: 'Failed to load. Please try again.', keyIngredients: [], techniques: [], tipForHome: '', funFact: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-5 border-b border-white/5 shrink-0">
          <div>
            <p className="font-bold text-white text-lg">🌍 Cuisine Deep-Dive</p>
            <p className="text-xs text-slate-500">Explore world cuisines</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all">
            <X size={16} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* Cuisine grid */}
          <div className="grid grid-cols-4 gap-2">
            {CUISINES.map(c => (
              <button
                key={c.name}
                onClick={() => handleSelect(c)}
                className={`flex flex-col items-center gap-1 p-2.5 rounded-2xl border text-center transition-all
                  ${selected === c.name ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-slate-800/60 hover:border-white/20'}
                `}
              >
                <span className="text-xl">{c.emoji}</span>
                <span className="text-[10px] text-slate-300">{c.name}</span>
              </button>
            ))}
          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 size={18} className="animate-spin text-orange-400" />
              <span className="text-slate-400 text-sm">Diving into {selected} cuisine...</span>
            </div>
          )}

          {result && !loading && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <p className="text-sm text-slate-300 leading-relaxed">{result.description}</p>

              {result.keyIngredients && result.keyIngredients.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Key Ingredients</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keyIngredients.map(ing => (
                      <span key={ing} className="px-2.5 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-xs capitalize">{ing}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.techniques && result.techniques.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Techniques</p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.techniques.map(t => (
                      <span key={t} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs">{t}</span>
                    ))}
                  </div>
                </div>
              )}

              {result.tipForHome && (
                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                  <p className="text-xs font-bold text-green-400 mb-1">💡 Home Cook Tip</p>
                  <p className="text-xs text-slate-300">{result.tipForHome}</p>
                </div>
              )}

              {result.funFact && (
                <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                  <p className="text-xs font-bold text-purple-400 mb-1">🎓 Fun Fact</p>
                  <p className="text-xs text-slate-300">{result.funFact}</p>
                </div>
              )}
            </div>
          )}

          {!selected && (
            <p className="text-center text-slate-600 text-sm py-4">Select a cuisine above to explore it</p>
          )}
        </div>
      </div>
    </div>
  );
}
