import React, { useState } from 'react';
import { Heart, X } from 'lucide-react';

const MOOD_CHIPS = ['cozy & comforting', 'light & fresh', 'something indulgent', 'need energy', 'sad day', 'celebrating', 'lazy & quick'];

const VIBE_STYLES = {
  comfort: 'bg-orange-500/10 border-orange-500/30 text-orange-300',
  fresh: 'bg-green-500/10 border-green-500/30 text-green-300',
  indulgent: 'bg-pink-500/10 border-pink-500/30 text-pink-300',
  energizing: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
  cozy: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
};

// Round 10: "How are you feeling?" → AI suggests a dish that matches the mood.
export default function MoodFoodFinder({ onUseDish, generateMoodFood }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const find = async (mood) => {
    const m = (mood || input).trim();
    if (!m || loading) return;
    setLoading(true);
    setResult(null);
    try {
      const r = await generateMoodFood(m);
      setResult(r);
    } catch { /* ignore */ } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm hover:bg-rose-500/20 transition-all"
      >
        <Heart size={14} /> Mood Food — what should I cook for how I feel?
      </button>
    );
  }

  return (
    <div className="p-4 bg-rose-500/5 border border-rose-500/20 rounded-2xl space-y-3 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-rose-400 flex items-center gap-2"><Heart size={14} /> How are you feeling?</p>
        <button onClick={() => { setOpen(false); setResult(null); }} className="text-slate-600 hover:text-slate-400"><X size={14} /></button>
      </div>
      <div className="flex flex-wrap gap-2">
        {MOOD_CHIPS.map(c => (
          <button
            key={c}
            onClick={() => find(c)}
            className="px-3 py-1 bg-slate-800 border border-white/10 text-slate-300 rounded-full text-xs hover:border-rose-500/40 hover:text-rose-300 transition-all"
          >
            {c}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && find()}
          placeholder="…or describe your mood/craving"
          className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-500/50 text-slate-300 placeholder:text-slate-600"
        />
        <button onClick={() => find()} disabled={loading} className="px-4 py-2 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-sm hover:bg-rose-500/30 transition-all disabled:opacity-50">
          {loading ? '…' : 'Find'}
        </button>
      </div>
      {loading && <p className="text-xs text-slate-500">Reading the vibes…</p>}
      {result && result.dishName && (
        <div className={`flex items-center gap-2 flex-wrap px-3 py-2 rounded-xl border ${VIBE_STYLES[result.vibe] || 'bg-slate-800 border-white/10 text-slate-300'}`}>
          <span className="text-sm font-bold">🍽️ {result.dishName}</span>
          <span className="text-xs opacity-80">— {result.reason}</span>
          <button
            onClick={() => { onUseDish(result.dishName); setOpen(false); setResult(null); }}
            className="ml-auto text-xs px-2 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-all"
          >
            → Make it
          </button>
        </div>
      )}
    </div>
  );
}
