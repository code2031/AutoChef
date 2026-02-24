import React, { useState } from 'react';
import { BookOpen, Trash2, Plus, X } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

export default function CookingJournal() {
  const [entries, setEntries] = useLocalStorage('cooking_journal', []);
  const [newText, setNewText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const addEntry = () => {
    const text = newText.trim();
    if (!text) return;
    const entry = {
      id: Date.now(),
      date: new Date().toISOString(),
      text,
    };
    setEntries(prev => [entry, ...prev].slice(0, 50));
    setNewText('');
    setIsAdding(false);
  };

  const deleteEntry = (id) => {
    setEntries(prev => prev.filter(e => e.id !== id));
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">📓 Cooking Journal</p>
          <p className="text-xs text-slate-500 mt-0.5">{entries.length} {entries.length === 1 ? 'entry' : 'entries'}</p>
        </div>
        <button
          onClick={() => setIsAdding(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl text-xs font-medium hover:bg-orange-500/20 transition-all"
        >
          {isAdding ? <X size={13} /> : <Plus size={13} />}
          {isAdding ? 'Cancel' : 'New Entry'}
        </button>
      </div>

      {isAdding && (
        <div className="space-y-2 p-4 bg-slate-900/60 border border-white/5 rounded-2xl animate-in fade-in duration-200">
          <p className="text-xs text-slate-400 font-medium">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <textarea
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="What did you cook today? How did it turn out? Any notes for next time..."
            className="w-full bg-slate-800 border border-white/5 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder:text-slate-600 outline-none focus:border-orange-500/40 resize-none transition-all"
            rows={4}
            autoFocus
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setIsAdding(false); setNewText(''); }}
              className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={addEntry}
              disabled={!newText.trim()}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm rounded-xl disabled:opacity-40 transition-all"
            >
              Save Entry
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 && !isAdding && (
        <div className="py-10 text-center space-y-2">
          <BookOpen size={32} className="mx-auto text-slate-600" />
          <p className="text-slate-500 text-sm">Your cooking journal is empty.</p>
          <p className="text-slate-600 text-xs">Write about what you cooked, what worked, and what to try next.</p>
        </div>
      )}

      <div className="space-y-3">
        {entries.map(entry => (
          <div key={entry.id} className="p-4 bg-slate-900/40 border border-white/5 rounded-2xl space-y-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-medium text-orange-400">{formatDate(entry.date)}</p>
              <button
                onClick={() => deleteEntry(entry.id)}
                className="p-1 text-slate-600 hover:text-red-400 transition-colors shrink-0"
              >
                <Trash2 size={13} />
              </button>
            </div>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{entry.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
