import React, { useState } from 'react';
import { Heart, Trash2, Clock, Search, Download, SortAsc, Tag, FileText, X } from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';

function TagEditor({ entry, onAddTag, onRemoveTag }) {
  const [inputVal, setInputVal] = useState('');
  return (
    <div className="flex flex-wrap gap-1 items-center">
      {(entry.tags || []).map(t => (
        <span key={t} className="flex items-center gap-1 px-2 py-0.5 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-xs">
          {t}
          <X size={10} className="cursor-pointer hover:text-red-400" onClick={() => onRemoveTag(entry.id, t)} />
        </span>
      ))}
      <input
        value={inputVal}
        onChange={e => setInputVal(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' && inputVal.trim()) {
            onAddTag(entry.id, inputVal.trim());
            setInputVal('');
          }
        }}
        placeholder="+ tag"
        className="bg-transparent text-xs text-slate-400 outline-none w-14 placeholder:text-slate-600"
      />
    </div>
  );
}

function NoteEditor({ entry, onSetNotes }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(entry.notes || '');
  if (editing) {
    return (
      <textarea
        value={val}
        onChange={e => setVal(e.target.value)}
        onBlur={() => { onSetNotes(entry.id, val); setEditing(false); }}
        autoFocus
        className="w-full bg-slate-800 border border-white/10 rounded-lg p-2 text-xs text-slate-300 outline-none resize-none h-16"
        placeholder="Add a note..."
      />
    );
  }
  return (
    <p
      onClick={() => setEditing(true)}
      className="text-xs text-slate-500 cursor-pointer hover:text-slate-400 transition-colors line-clamp-1"
    >
      {entry.notes ? entry.notes : '+ Add note'}
    </p>
  );
}

// Simple activity heatmap: last 30 days
function ActivityHeatmap({ history }) {
  const days = 35;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const countByDay = {};
  history.forEach(e => {
    const d = new Date(e.savedAt);
    d.setHours(0, 0, 0, 0);
    const key = d.toDateString();
    countByDay[key] = (countByDay[key] || 0) + 1;
  });

  const cells = Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (days - 1 - i));
    const key = d.toDateString();
    const count = countByDay[key] || 0;
    return { date: d, count };
  });

  const maxCount = Math.max(...cells.map(c => c.count), 1);

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Activity (last 5 weeks)</p>
      <div className="flex flex-wrap gap-1">
        {cells.map((c, i) => {
          const intensity = c.count === 0 ? 0 : Math.ceil((c.count / maxCount) * 4);
          const colors = ['bg-slate-800', 'bg-orange-500/20', 'bg-orange-500/40', 'bg-orange-500/70', 'bg-orange-500'];
          return (
            <div
              key={i}
              title={`${c.date.toLocaleDateString()}: ${c.count} recipe${c.count !== 1 ? 's' : ''}`}
              className={`w-4 h-4 rounded-sm ${colors[intensity]} transition-all cursor-default`}
            />
          );
        })}
      </div>
    </div>
  );
}

export default function RecipeHistory({
  history,
  favourites,
  onToggleFavourite,
  onDelete,
  onSelect,
  onAddTag,
  onRemoveTag,
  onSetNotes,
  bestStreak,
  currentStreak,
}) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date');

  const baseItems = tab === 'favourites' ? favourites : history;

  const filtered = baseItems
    .filter(e => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        e.recipe.name.toLowerCase().includes(q) ||
        (e.tags || []).some(t => t.includes(q)) ||
        (e.notes || '').toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sort === 'date') return new Date(b.savedAt) - new Date(a.savedAt);
      if (sort === 'name') return a.recipe.name.localeCompare(b.recipe.name);
      if (sort === 'rating') {
        const score = r => r.rating === 'up' ? 1 : r.rating === 'down' ? -1 : 0;
        return score(b) - score(a);
      }
      return 0;
    });

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `autochef_history_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold">Recipe History</h2>
          {currentStreak >= 2 && (
            <span className="text-sm font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full">
              🔥 {currentStreak} day streak
            </span>
          )}
          {bestStreak > 0 && (
            <span className="text-xs text-slate-500 bg-slate-900 px-2 py-1 rounded-full">
              Best: {bestStreak}
            </span>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 text-xs hover:border-white/20 hover:text-white transition-all"
          >
            <Download size={14} />
            Export
          </button>
          <div className="flex gap-1 bg-slate-900 rounded-xl p-1">
            <button
              onClick={() => setTab('all')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'all' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All ({history.length})
            </button>
            <button
              onClick={() => setTab('favourites')}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'favourites' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Saved ({favourites.length})
            </button>
          </div>
        </div>
      </div>

      {/* Activity heatmap */}
      {history.length > 0 && <ActivityHeatmap history={history} />}

      {/* Search + Sort */}
      {history.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-0 w-full sm:min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search recipes, tags, notes..."
              className="w-full bg-slate-900 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-orange-500/50 text-slate-300 placeholder:text-slate-600 transition-all"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-900 border border-white/5 rounded-xl px-3">
            <SortAsc size={14} className="text-slate-500" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value)}
              className="bg-transparent text-sm text-slate-400 outline-none py-2 cursor-pointer"
            >
              <option value="date">Newest</option>
              <option value="name">Name</option>
              <option value="rating">Rating</option>
            </select>
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="py-20 text-center space-y-3">
          <p className="text-4xl">🍽️</p>
          <p className="text-slate-400 text-sm">
            {search
              ? `No recipes match "${search}"`
              : tab === 'favourites'
              ? 'No saved recipes yet. Hit the heart icon on a recipe!'
              : 'No recipes generated yet. Head to My Kitchen!'}
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map(entry => (
          <div
            key={entry.id}
            className="bg-slate-900 border border-white/5 rounded-2xl overflow-hidden hover:border-orange-500/20 transition-all group"
          >
            {/* Thumbnail */}
            <div
              className="h-40 relative cursor-pointer overflow-hidden bg-slate-800"
              onClick={() => onSelect(entry)}
            >
              {entry.imageUrl ? (
                <img
                  src={entry.imageUrl}
                  alt={entry.recipe.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={32} className="text-slate-700" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
              <p className="absolute bottom-3 left-3 right-3 font-bold text-white text-sm leading-tight">{entry.recipe.name}</p>
            </div>

            {/* Meta */}
            <div className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-500 text-xs">
                  <Clock size={12} />
                  {formatDate(entry.savedAt)}
                  {entry.recipe.difficulty && (
                    <span className="px-2 py-0.5 bg-slate-800 rounded-full">{entry.recipe.difficulty}</span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {entry.rating === 'up' && <span className="text-green-400 text-xs">👍</span>}
                  {entry.rating === 'down' && <span className="text-red-400 text-xs">👎</span>}
                  <button
                    onClick={() => onToggleFavourite(entry.id)}
                    className={`p-1.5 rounded-lg transition-all ${entry.isFavourite ? 'text-pink-400' : 'text-slate-600 hover:text-pink-400'}`}
                  >
                    <Heart size={16} fill={entry.isFavourite ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    onClick={() => onDelete(entry.id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Tags */}
              {onAddTag && (
                <TagEditor entry={entry} onAddTag={onAddTag} onRemoveTag={onRemoveTag} />
              )}

              {/* Notes */}
              {onSetNotes && (
                <NoteEditor entry={entry} onSetNotes={onSetNotes} />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
