import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronLeft, ChevronRight, Timer, Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

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

function speakText(text) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.9;
  window.speechSynthesis.speak(utt);
}

export default function CookingMode({ recipe, onExit, onCookDone }) {
  const [step, setStep] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [stepNotes, setStepNotes] = useState({});
  const [showNoteFor, setShowNoteFor] = useState(null);
  // timers: { [stepIdx]: { seconds, timeLeft, running } }
  const [timers, setTimers] = useState(() => {
    const initial = {};
    (recipe.instructions || []).forEach((s, i) => {
      const secs = detectTimerSeconds(s);
      if (secs) initial[i] = { seconds: secs, timeLeft: secs, running: false };
    });
    return initial;
  });
  const tickRef = useRef(null);
  const touchStartX = useRef(null);
  const steps = recipe.instructions || [];

  // Single interval that ticks all running timers
  useEffect(() => {
    tickRef.current = setInterval(() => {
      setTimers(prev => {
        const next = { ...prev };
        let anyRunning = false;
        Object.keys(next).forEach(k => {
          if (next[k].running) {
            anyRunning = true;
            if (next[k].timeLeft <= 1) {
              next[k] = { ...next[k], timeLeft: 0, running: false };
              playBeep();
            } else {
              next[k] = { ...next[k], timeLeft: next[k].timeLeft - 1 };
            }
          }
        });
        return anyRunning ? next : prev;
      });
    }, 1000);
    return () => clearInterval(tickRef.current);
  }, []);

  useEffect(() => {
    if (voiceEnabled && steps[step]) {
      speakText(`Step ${step + 1}. ${steps[step]}`);
    }
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTimer = (idx) => {
    setTimers(prev => ({
      ...prev,
      [idx]: { ...prev[idx], running: !prev[idx].running },
    }));
  };

  const resetTimer = (idx) => {
    setTimers(prev => ({
      ...prev,
      [idx]: { ...prev[idx], timeLeft: prev[idx].seconds, running: false },
    }));
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const goNext = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else { onCookDone?.(); onExit(stepNotes); }
  };
  const goPrev = () => setStep(s => Math.max(0, s - 1));

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 60) { dx < 0 ? goNext() : goPrev(); }
    touchStartX.current = null;
  };

  const handleVoiceToggle = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    if (next && steps[step]) speakText(`Step ${step + 1}. ${steps[step]}`);
    else window.speechSynthesis?.cancel();
  };

  // Other running timers (not current step)
  const otherRunning = Object.entries(timers).filter(([k, t]) => parseInt(k) !== step && t.running);

  const currentTimer = timers[step];

  return (
    <div
      className="fixed inset-0 z-[200] bg-slate-950 flex flex-col animate-in fade-in duration-300"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/5">
        <div>
          <p className="text-xs text-orange-400 font-bold uppercase tracking-widest">Cooking Mode</p>
          <h2 className="text-xl font-bold">{recipe.name}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleVoiceToggle}
            className={`p-2 rounded-xl transition-all ${voiceEnabled ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            title={voiceEnabled ? 'Disable voice readout' : 'Enable voice readout'}
          >
            {voiceEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          <button onClick={() => onExit(stepNotes)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Other running timers banner */}
      {otherRunning.length > 0 && (
        <div className="flex flex-wrap gap-2 px-4 sm:px-6 pt-3">
          {otherRunning.map(([k, t]) => (
            <div key={k} className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-xl text-xs text-orange-400">
              <Timer size={12} />
              Step {parseInt(k) + 1}: {formatTime(t.timeLeft)}
              <button onClick={() => toggleTimer(parseInt(k))} className="hover:text-white transition-colors"><Pause size={12} /></button>
            </div>
          ))}
        </div>
      )}

      <div className="px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <span className="font-bold text-orange-400">Step {step + 1}</span>
          <span>of {steps.length}</span>
        </div>
        <div className="mt-2 flex gap-1">
          {steps.map((_, i) => (
            <div
              key={i}
              onClick={() => setStep(i)}
              className={`h-1 flex-1 rounded-full transition-all cursor-pointer ${i <= step ? 'bg-orange-500' : 'bg-slate-800 hover:bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 flex items-center px-4 sm:px-6">
        <p className="text-xl sm:text-2xl md:text-3xl leading-relaxed font-medium text-white">
          {steps[step]}
        </p>
      </div>

      {/* Step note */}
      <div className="px-4 sm:px-6 pb-2">
        {showNoteFor === step ? (
          <div className="flex gap-2 items-start">
            <textarea
              value={stepNotes[step] || ''}
              onChange={e => setStepNotes(prev => ({ ...prev, [step]: e.target.value }))}
              onBlur={() => setShowNoteFor(null)}
              placeholder="Add a note for this step..."
              className="flex-1 bg-slate-900 border border-white/10 rounded-xl p-2.5 text-sm text-slate-300 outline-none focus:border-orange-500/50 resize-none h-20"
              autoFocus
            />
            <button onClick={() => setShowNoteFor(null)} className="p-2 text-slate-400 hover:text-white transition-colors mt-0.5">
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowNoteFor(step)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            📝 {stepNotes[step] ? `Note: ${stepNotes[step].slice(0, 40)}${stepNotes[step].length > 40 ? '...' : ''}` : 'Add note'}
          </button>
        )}
      </div>

      {currentTimer && (
        <div className="px-4 sm:px-6 py-4 flex items-center gap-4 bg-slate-900/60 mx-4 sm:mx-6 mb-4 rounded-2xl border border-white/5">
          <Timer size={20} className="text-orange-400" />
          <span className="text-2xl font-mono font-bold text-orange-400">
            {formatTime(currentTimer.timeLeft)}
          </span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => toggleTimer(step)}
              className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 hover:bg-orange-500/20 transition-all"
            >
              {currentTimer.running ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <button
              onClick={() => resetTimer(step)}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-all"
            >
              <RotateCcw size={18} />
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-3 sm:gap-4 p-4 sm:p-6 border-t border-white/5">
        <button
          onClick={goPrev}
          disabled={step === 0}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 border border-white/5 text-slate-400 disabled:opacity-30 hover:border-white/20 transition-all"
        >
          <ChevronLeft size={20} /> Previous
        </button>
        <button
          onClick={goNext}
          className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all"
        >
          {step < steps.length - 1 ? <>Next <ChevronRight size={20} /></> : 'Done! 🎉'}
        </button>
      </div>

      <p className="text-center text-slate-600 text-xs pb-3">Swipe left/right to navigate steps</p>
    </div>
  );
}
