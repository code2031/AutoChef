import React, { useState, useEffect, useRef } from 'react';
import { Timer, X, Play, Pause, RotateCcw, Plus } from 'lucide-react';

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);
  } catch {
    // Audio not available
  }
}

function parseDuration(input) {
  // Accept: "5:30", "5m30s", "90s", "5m", "90", "1h30m"
  const trimmed = input.trim();
  const colonMatch = trimmed.match(/^(\d+):(\d{1,2})$/);
  if (colonMatch) return parseInt(colonMatch[1]) * 60 + parseInt(colonMatch[2]);
  const hMatch = trimmed.match(/(\d+)h(?:(\d+)m?)?/i);
  if (hMatch) return parseInt(hMatch[1]) * 3600 + (hMatch[2] ? parseInt(hMatch[2]) * 60 : 0);
  const mMatch = trimmed.match(/^(\d+)m(?:(\d+)s?)?$/i);
  if (mMatch) return parseInt(mMatch[1]) * 60 + (mMatch[2] ? parseInt(mMatch[2]) : 0);
  const sMatch = trimmed.match(/^(\d+)s$/i);
  if (sMatch) return parseInt(sMatch[1]);
  const numOnly = parseInt(trimmed);
  if (!isNaN(numOnly) && numOnly > 0) return numOnly * 60; // bare number = minutes
  return null;
}

function fmt(s) {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

let nextId = 1;

export default function KitchenTimer({ onClose }) {
  const [timers, setTimers] = useState([]);
  const [newLabel, setNewLabel] = useState('');
  const [newDuration, setNewDuration] = useState('');
  const [addError, setAddError] = useState('');
  const tickRef = useRef(null);
  const beeped = useRef(new Set());

  // Single interval ticking all running timers
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setTimers(prev => {
        let changed = false;
        const next = prev.map(t => {
          if (!t.running) return t;
          changed = true;
          if (t.timeLeft <= 1) {
            if (!beeped.current.has(t.id)) {
              beeped.current.add(t.id);
              playBeep();
            }
            return { ...t, timeLeft: 0, running: false, done: true };
          }
          return { ...t, timeLeft: t.timeLeft - 1 };
        });
        return changed ? next : prev;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  const handleAdd = () => {
    const secs = parseDuration(newDuration);
    if (!secs) {
      setAddError('Use formats like 5, 5m, 1:30, 1h30m');
      return;
    }
    setAddError('');
    const id = nextId++;
    setTimers(prev => [...prev, {
      id,
      label: newLabel.trim() || `Timer ${id}`,
      seconds: secs,
      timeLeft: secs,
      running: false,
      done: false,
    }]);
    setNewLabel('');
    setNewDuration('');
  };

  const toggle = (id) => {
    setTimers(prev => prev.map(t => {
      if (t.id !== id) return t;
      if (t.done) return t;
      return { ...t, running: !t.running };
    }));
    beeped.current.delete(id);
  };

  const reset = (id) => {
    setTimers(prev => prev.map(t =>
      t.id === id ? { ...t, timeLeft: t.seconds, running: false, done: false } : t
    ));
    beeped.current.delete(id);
  };

  const remove = (id) => {
    setTimers(prev => prev.filter(t => t.id !== id));
    beeped.current.delete(id);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="w-72 max-w-[calc(100vw-2rem)] bg-slate-900 border border-white/10 rounded-2xl shadow-2xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-orange-400">
          <Timer size={16} />
          <span className="font-bold text-sm">Kitchen Timers</span>
        </div>
        <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition-all">
          <X size={16} />
        </button>
      </div>

      {/* Add timer row */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Label (optional)"
            className="flex-1 min-w-0 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-orange-500/50 placeholder:text-slate-600"
          />
          <input
            value={newDuration}
            onChange={e => { setNewDuration(e.target.value); setAddError(''); }}
            onKeyDown={handleKeyDown}
            placeholder="5m"
            className="w-16 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-orange-500/50 placeholder:text-slate-600 text-center"
          />
          <button
            onClick={handleAdd}
            className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all shrink-0"
          >
            <Plus size={16} />
          </button>
        </div>
        {addError && <p className="text-xs text-red-400">{addError}</p>}
        <p className="text-xs text-slate-600">Duration: 5, 5m, 1:30, 1h30m, 90s</p>
      </div>

      {/* Timer list */}
      {timers.length === 0 ? (
        <p className="text-xs text-slate-600 text-center py-2">No timers yet</p>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {timers.map(t => (
            <div
              key={t.id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                t.done
                  ? 'bg-orange-500/10 border-orange-500/30'
                  : t.running
                  ? 'bg-slate-800 border-white/10'
                  : 'bg-slate-800/50 border-white/5'
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-300 truncate">{t.label}</p>
                <p className={`text-xl font-mono font-bold leading-none mt-0.5 ${t.done ? 'text-orange-400' : 'text-white'}`}>
                  {t.done ? 'Done!' : fmt(t.timeLeft)}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => toggle(t.id)}
                  disabled={t.done}
                  className="p-1.5 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all disabled:opacity-40"
                >
                  {t.running ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <button
                  onClick={() => reset(t.id)}
                  className="p-1.5 rounded-lg bg-slate-700 text-slate-400 hover:text-white transition-all"
                >
                  <RotateCcw size={14} />
                </button>
                <button
                  onClick={() => remove(t.id)}
                  className="p-1.5 rounded-lg bg-slate-700 text-slate-500 hover:text-red-400 transition-all"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
