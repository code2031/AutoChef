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

export default function CookingMode({ recipe, onExit }) {
  const [step, setStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [running, setRunning] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const intervalRef = useRef(null);
  const touchStartX = useRef(null);
  const steps = recipe.instructions || [];

  useEffect(() => {
    const secs = detectTimerSeconds(steps[step] || '');
    const t = setTimeout(() => {
      setTimerSeconds(secs);
      setTimeLeft(secs);
      setRunning(false);
    }, 0);
    clearInterval(intervalRef.current);
    if (voiceEnabled && steps[step]) {
      speakText(`Step ${step + 1}. ${steps[step]}`);
    }
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

  const goNext = () => {
    if (step < steps.length - 1) setStep(s => s + 1);
    else onExit();
  };

  const goPrev = () => setStep(s => Math.max(0, s - 1));

  // Swipe gestures
  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 60) {
      if (dx < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
  };

  const handleVoiceToggle = () => {
    const next = !voiceEnabled;
    setVoiceEnabled(next);
    if (next && steps[step]) speakText(`Step ${step + 1}. ${steps[step]}`);
    else window.speechSynthesis?.cancel();
  };

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
          <button onClick={onExit} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <X size={24} />
          </button>
        </div>
      </div>

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

      {timerSeconds && (
        <div className="px-4 sm:px-6 py-4 flex items-center gap-4 bg-slate-900/60 mx-4 sm:mx-6 mb-4 rounded-2xl border border-white/5">
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
