import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Timer, Play, Pause, RotateCcw } from 'lucide-react';

function detectTimerSeconds(step) {
  const patterns = [
    /for\s+(\d+)-(\d+)\s+min/i,
    /for\s+(\d+)\s+min/i,
    /(\d+)-(\d+)\s+minutes?/i,
    /(\d+)\s+minutes?/i,
    /(\d+)\s+hour/i,
  ];
  for (const p of patterns) {
    const m = step.match(p);
    if (m) {
      const mins = parseInt(m[2] || m[1]);
      const isHour = p.source.includes('hour');
      return (isHour ? mins * 60 : mins) * 60;
    }
  }
  return null;
}

function playBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.5);
  } catch {
    // Audio not available
  }
}

export default function CookingMode({ recipe, onExit }) {
  const [step, setStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);
  const steps = recipe.instructions || [];

  useEffect(() => {
    const secs = detectTimerSeconds(steps[step] || '');
    // Use setTimeout to avoid synchronous setState-in-effect
    const t = setTimeout(() => {
      setTimerSeconds(secs);
      setTimeLeft(secs);
      setRunning(false);
    }, 0);
    clearInterval(intervalRef.current);
    return () => clearTimeout(t);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setRunning(false);
            playBeep();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setRunning(false);
    setTimeLeft(timerSeconds);
  };

  return (
    <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col animate-in fade-in duration-300">
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div>
          <p className="text-xs text-orange-400 font-bold uppercase tracking-widest">Cooking Mode</p>
          <h2 className="text-xl font-bold">{recipe.name}</h2>
        </div>
        <button onClick={onExit} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
          <X size={24} />
        </button>
      </div>

      <div className="px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="font-bold text-orange-400">Step {step + 1}</span>
          <span>of {steps.length}</span>
        </div>
        <div className="mt-2 flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all ${i <= step ? 'bg-orange-500' : 'bg-slate-800'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center px-6">
        <p className="text-2xl md:text-3xl leading-relaxed font-medium text-white">
          {steps[step]}
        </p>
      </div>

      {timerSeconds && (
        <div className="px-6 py-4 flex items-center gap-4 bg-slate-900/60 mx-6 mb-4 rounded-2xl border border-white/5">
          <Timer size={20} className="text-orange-400" />
          <span className="text-2xl font-mono font-bold text-orange-400">
            {formatTime(timeLeft ?? timerSeconds)}
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => setRunning(v => !v)}
              className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all"
            >
              {running ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={resetTimer}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-4 p-6 border-t border-white/5">
        <button
          onClick={() => setStep(s => Math.max(0, s - 1))}
          disabled={step === 0}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 border border-white/5 text-slate-400 disabled:opacity-30 hover:border-white/20 transition-all"
        >
          <ChevronLeft size={20} /> Previous
        </button>
        <button
          onClick={() => step < steps.length - 1 ? setStep(s => s + 1) : onExit()}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all"
        >
          {step < steps.length - 1 ? <>Next <ChevronRight size={20} /></> : 'Done! 🎉'}
        </button>
      </div>
    </div>
  );
}
