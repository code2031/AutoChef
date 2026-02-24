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

export default function CookingMode({ recipe, onExit, onCookDone, timeLimitSeconds }) {
  const [step, setStep] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [stepNotes, setStepNotes] = useState({});
  const [showNoteFor, setShowNoteFor] = useState(null);
  const [numFriends, setNumFriends] = useState(1);
  const [myPerson, setMyPerson] = useState(0);
  const [showFriendSplit, setShowFriendSplit] = useState(false);
  const [handsFreeMic, setHandsFreeMic] = useState(false);
  const [totalTimeLeft, setTotalTimeLeft] = useState(timeLimitSeconds || null);
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
  const recognitionRef = useRef(null);
  const stepRef = useRef(step);
  const steps = recipe.instructions || [];

  // Keep stepRef in sync with step state
  useEffect(() => { stepRef.current = step; }, [step]);

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

  // Beat-the-Clock interval
  useEffect(() => {
    if (!timeLimitSeconds) return;
    const interval = setInterval(() => {
      setTotalTimeLeft(prev => {
        if (!prev || prev <= 0) return 0;
        if (prev === 1) { setTimeout(() => { playBeep(); playBeep(); playBeep(); }, 0); }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLimitSeconds]);

  // Cleanup speech recognition on unmount
  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
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

  const toggleHandsFree = () => {
    if (handsFreeMic) {
      recognitionRef.current?.stop();
      setHandsFreeMic(false);
    } else {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) { alert('Voice commands not supported in this browser.'); return; }
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = 'en-US';
      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
        if (transcript.includes('next')) {
          setStep(s => Math.min(s + 1, steps.length - 1));
        } else if (transcript.includes('previous') || transcript.includes('back') || transcript.includes('go back')) {
          setStep(s => Math.max(0, s - 1));
        } else if (transcript.includes('start timer') || transcript.includes('begin timer')) {
          setTimers(prev => {
            const s = stepRef.current;
            if (prev[s]) return { ...prev, [s]: { ...prev[s], running: true } };
            return prev;
          });
        } else if (transcript.includes('stop timer') || transcript.includes('pause timer')) {
          setTimers(prev => {
            const s = stepRef.current;
            if (prev[s]) return { ...prev, [s]: { ...prev[s], running: false } };
            return prev;
          });
        }
      };
      rec.onerror = () => { setHandsFreeMic(false); };
      rec.onend = () => { if (handsFreeMic) rec.start(); };
      recognitionRef.current = rec;
      rec.start();
      setHandsFreeMic(true);
    }
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
            onClick={toggleHandsFree}
            className={`p-2 rounded-xl transition-all ${handsFreeMic ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
            title={handsFreeMic ? 'Stop voice commands (say "next", "back", "start timer")' : 'Enable hands-free voice commands'}
          >
            🎙️
          </button>
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

      {/* Beat-the-Clock timer */}
      {timeLimitSeconds && totalTimeLeft !== null && (
        <div className={`mx-4 sm:mx-6 mt-3 flex items-center gap-3 px-4 py-2 rounded-xl border ${totalTimeLeft <= 60 ? 'bg-red-500/10 border-red-500/30 text-red-400' : totalTimeLeft <= 300 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'}`}>
          <span className="text-sm font-bold">⏱ Beat the Clock:</span>
          <span className="font-mono font-bold text-lg">{Math.floor(totalTimeLeft / 60)}:{(totalTimeLeft % 60).toString().padStart(2, '0')}</span>
          <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden ml-2">
            <div
              className={`h-full rounded-full transition-all ${totalTimeLeft <= 60 ? 'bg-red-500' : 'bg-orange-500'}`}
              style={{ width: `${(totalTimeLeft / timeLimitSeconds) * 100}%` }}
            />
          </div>
          {totalTimeLeft === 0 && <span className="text-sm font-bold">⏰ Time&apos;s Up!</span>}
        </div>
      )}

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

      {/* Cook With a Friend */}
      <div className="px-4 sm:px-6 pt-2">
        <button
          onClick={() => setShowFriendSplit(v => !v)}
          className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
        >
          👥 {showFriendSplit ? 'Hide friend split' : 'Split steps with friends'}
        </button>
        {showFriendSplit && (
          <div className="mt-2 flex flex-wrap items-center gap-3 p-3 bg-slate-800/60 rounded-xl border border-white/5">
            <span className="text-xs text-slate-400">Split with</span>
            {[2, 3, 4].map(n => (
              <button
                key={n}
                onClick={() => { setNumFriends(n); setMyPerson(0); }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${numFriends === n ? 'bg-orange-500 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
              >
                {n} people
              </button>
            ))}
            {numFriends > 1 && (
              <>
                <span className="text-xs text-slate-400">You are</span>
                {Array.from({ length: numFriends }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setMyPerson(i)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${myPerson === i ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400 hover:text-white'}`}
                  >
                    Person {i + 1}
                  </button>
                ))}
              </>
            )}
            {numFriends > 1 && (
              <span className="text-xs text-orange-400">
                Your steps: {steps.reduce((acc, _, i) => i % numFriends === myPerson ? [...acc, i + 1] : acc, []).join(', ')}
              </span>
            )}
          </div>
        )}
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
        <div>
          {numFriends > 1 && (
            <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${step % numFriends === myPerson ? 'text-orange-400' : 'text-slate-500'}`}>
              {step % numFriends === myPerson ? '✅ Your Step' : `👤 Person ${(step % numFriends) + 1}'s Step`}
            </p>
          )}
          <p className="text-xl sm:text-2xl md:text-3xl leading-relaxed font-medium text-white">
            {steps[step]}
          </p>
        </div>
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
