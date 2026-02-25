import React, { useState, useRef, useCallback } from 'react';
import { Plus, X, Mic, MicOff, Camera, Loader2, Image as ImageIcon, Shuffle } from 'lucide-react';
import { INGREDIENT_SUGGESTIONS, getEmojiForIngredient } from '../lib/ingredients.js';
import { parseIngredientSentence } from '../lib/groq.js';

export default function IngredientInput({
  ingredients,
  onAdd,
  onRemove,
  onReorder,
  onScan,
  onSurprise,
  isScanning,
  fileInputRef,
}) {
  const [inputValue, setInputValue] = useState('');
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [isParsingVoice, setIsParsingVoice] = useState(false);
  const [dragOver, setDragOver] = useState(null);
  const [dragItem, setDragItem] = useState(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  // Compute suggestions inline (no useEffect needed)
  const suggestions = inputValue.trim()
    ? INGREDIENT_SUGGESTIONS.filter(
        s => s.toLowerCase().includes(inputValue.toLowerCase()) && !ingredients.includes(s)
      ).slice(0, 6)
    : [];

  const handleAdd = useCallback((val) => {
    const clean = (val || inputValue).trim();
    if (clean) {
      onAdd(clean);
      setInputValue('');
      setActiveSuggestion(-1);
      inputRef.current?.focus();
    }
  }, [inputValue, onAdd]);

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      setActiveSuggestion(i => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      setActiveSuggestion(i => Math.max(i - 1, -1));
    } else if (e.key === 'Enter') {
      if (activeSuggestion >= 0 && suggestions[activeSuggestion]) {
        handleAdd(suggestions[activeSuggestion]);
      } else {
        handleAdd();
      }
    } else if (e.key === 'Escape') {
      setActiveSuggestion(-1);
      setInputValue('');
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text');
    const parts = text.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean);
    if (parts.length > 1) {
      e.preventDefault();
      parts.forEach(p => onAdd(p));
    }
  };

  const toggleVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Speech recognition not supported in this browser.'); return; }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = navigator.language || 'en-US';
    recognition.interimResults = false;
    recognition.onresult = async (e) => {
      const transcript = e.results[0][0].transcript.trim();
      const words = transcript.split(/\s+/).length;
      const isComplexSentence = words > 3 && !/^[^,]+(?:,\s*[^,]+)+$/.test(transcript);
      if (isComplexSentence) {
        setIsParsingVoice(true);
        try {
          const parsed = await parseIngredientSentence(transcript);
          (parsed || []).forEach(ing => { const c = ing.trim(); if (c) onAdd(c); });
        } catch {
          transcript.split(/,|\band\b/i).forEach(part => { const c = part.trim(); if (c) onAdd(c); });
        } finally {
          setIsParsingVoice(false);
        }
      } else {
        transcript.split(/,|\band\b/i).forEach(part => { const c = part.trim(); if (c) onAdd(c); });
      }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => { setIsListening(false); setIsParsingVoice(false); }
    recognition.start();
    setIsListening(true);
  };

  const handleDragStart = (e, idx) => { setDragItem(idx); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragOver = (e, idx) => { e.preventDefault(); setDragOver(idx); };
  const handleDrop = (e, idx) => {
    e.preventDefault();
    if (dragItem === null || dragItem === idx) { setDragOver(null); return; }
    const newList = [...ingredients];
    const [moved] = newList.splice(dragItem, 1);
    newList.splice(idx, 0, moved);
    onReorder(newList);
    setDragItem(null);
    setDragOver(null);
  };
  const handleDragEnd = () => { setDragItem(null); setDragOver(null); };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="flex gap-2 p-2 rounded-2xl bg-slate-900 border border-white/5 focus-within:border-orange-500/50 transition-all">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="e.g. Chicken, Spinach, Garlic..."
            className="bg-transparent border-none outline-none flex-grow px-4 py-2 text-base"
            autoComplete="off"
          />
          <button
            onClick={toggleVoice}
            type="button"
            className={`p-3 rounded-xl transition-colors ${isListening ? 'bg-red-500 text-white animate-pulse' : isParsingVoice ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            title={isParsingVoice ? 'Parsing ingredients...' : 'Voice input'}
          >
            {isParsingVoice ? <Loader2 size={18} className="animate-spin" /> : isListening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button
            onClick={() => handleAdd()}
            className="p-3 bg-white text-slate-950 rounded-xl hover:bg-slate-200 transition-colors"
          >
            <Plus size={20} />
          </button>
        </div>

        {suggestions.length > 0 && (
          <ul className="absolute z-20 top-full left-0 right-0 mt-1 bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-xl">
            {suggestions.map((s, i) => (
              <li
                key={s}
                onMouseDown={() => handleAdd(s)}
                className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer text-sm transition-colors ${i === activeSuggestion ? 'bg-orange-500/20 text-orange-300' : 'text-slate-300 hover:bg-white/5'}`}
              >
                <span>{getEmojiForIngredient(s)}</span>
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={onScan}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-500/20 transition-all disabled:opacity-50"
        >
          {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Camera size={16} />}
          {isScanning ? 'Scanning...' : 'Scan Fridge'}
        </button>
        <button
          onClick={onSurprise}
          className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl text-sm font-medium hover:bg-purple-500/20 transition-all"
        >
          <Shuffle size={16} />
          Surprise Me
        </button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[40px]">
        {ingredients.map((tag, idx) => (
          <span
            key={tag}
            draggable
            onDragStart={e => handleDragStart(e, idx)}
            onDragOver={e => handleDragOver(e, idx)}
            onDrop={e => handleDrop(e, idx)}
            onDragEnd={handleDragEnd}
            className={`flex items-center gap-2 px-3 py-2 bg-slate-800 border rounded-full text-sm font-medium cursor-grab active:cursor-grabbing transition-all select-none ${dragOver === idx ? 'border-orange-500/60 scale-105' : 'border-white/5 hover:border-orange-500/30'}`}
          >
            <span>{getEmojiForIngredient(tag)}</span>
            {tag}
            <X size={13} className="text-slate-500 cursor-pointer hover:text-red-400" onClick={() => onRemove(tag)} />
          </span>
        ))}
        {ingredients.length === 0 && !isScanning && (
          <div className="flex items-center gap-2 text-slate-600 text-sm italic py-2">
            <ImageIcon size={16} />
            Add ingredients or upload a photo to start.
          </div>
        )}
        {isScanning && (
          <div className="flex items-center gap-2 text-blue-400 text-sm animate-pulse py-2">
            <Loader2 size={16} className="animate-spin" />
            Vision is analyzing your photo...
          </div>
        )}
      </div>
    </div>
  );
}
