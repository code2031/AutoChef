import React, { useRef, useState } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

// Round 10: speak a sentence ("I have chicken, garlic and some leftover rice")
// → Web Speech API transcribes → Groq parses out individual ingredient names.
export default function VoiceIngredientInput({ onAddIngredients, parseIngredientSentence }) {
  const [listening, setListening] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const SpeechRecognition = typeof window !== 'undefined'
    ? (window.SpeechRecognition || window.webkitSpeechRecognition)
    : null;

  if (!SpeechRecognition) return null;

  const handleResult = async (text) => {
    setTranscript(text);
    if (!text.trim()) return;
    setParsing(true);
    try {
      const ings = await parseIngredientSentence(text);
      if (Array.isArray(ings) && ings.length > 0) onAddIngredients(ings);
    } catch { /* ignore */ } finally {
      setParsing(false);
    }
  };

  const toggle = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const rec = new SpeechRecognition();
    rec.lang = navigator.language || 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e) => {
      const text = e.results[0][0].transcript;
      handleResult(text);
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setTranscript('');
    setListening(true);
    rec.start();
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={toggle}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
          listening
            ? 'bg-red-500/15 border-red-500/40 text-red-400 animate-pulse'
            : 'bg-slate-900 border-white/10 text-slate-400 hover:border-orange-500/40 hover:text-orange-400'
        }`}
        title="Speak your ingredients"
      >
        {listening ? <MicOff size={15} /> : <Mic size={15} />}
        {listening ? 'Listening… tap to stop' : 'Voice add'}
      </button>
      {parsing && <span className="text-xs text-slate-500 flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Parsing…</span>}
      {transcript && !parsing && <span className="text-xs text-slate-500 italic">&ldquo;{transcript}&rdquo;</span>}
    </div>
  );
}
