import React, { useState } from 'react';
import { Heart, Trash2, Clock, Search, Download, SortAsc, X, FolderPlus } from 'lucide-react';
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

// Simple activity heatmap: last 35 days
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

function MonthlyChallenges({ history, favourites }) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const thisMonth = history.filter(e => new Date(e.savedAt) >= monthStart);
  const recipesThisMonth = thisMonth.length;
  const cuisinesThisMonth = [...new Set(thisMonth.map(e => e.recipe?.cuisine).filter(Boolean))].length;
  const savedThisMonth = favourites.filter(e => new Date(e.savedAt) >= monthStart).length;
  const uniqueIngredientsThisMonth = [...new Set(thisMonth.flatMap(e => e.ingredients || []))].length;

  const challenges = [
    { label: 'Cook 10 recipes', icon: '🍳', current: recipesThisMonth, goal: 10, color: '#f97316' },
    { label: 'Try 5 cuisines', icon: '🌍', current: cuisinesThisMonth, goal: 5, color: '#8b5cf6' },
    { label: 'Save 5 favourites', icon: '❤️', current: savedThisMonth, goal: 5, color: '#ec4899' },
    { label: 'Use 20 ingredients', icon: '🥕', current: uniqueIngredientsThisMonth, goal: 20, color: '#22c55e' },
  ];

  const monthName = now.toLocaleString('default', { month: 'long' });

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{monthName} Challenges</p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {challenges.map(c => {
          const pct = Math.min(100, Math.round((c.current / c.goal) * 100));
          const done = c.current >= c.goal;
          return (
            <div key={c.label} className={`p-3 rounded-2xl border ${done ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-900 border-white/5'} space-y-2`}>
              <div className="flex items-center justify-between">
                <span className="text-lg">{c.icon}</span>
                {done && <span className="text-xs text-green-400 font-bold">✓ Done!</span>}
              </div>
              <p className="text-xs text-slate-400 leading-tight">{c.label}</p>
              <div className="space-y-1">
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, backgroundColor: done ? '#22c55e' : c.color }}
                  />
                </div>
                <p className="text-xs text-slate-500">{c.current} / {c.goal}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CollectionDropdown({ entry, collections, onSetEntryCollection, onCreateCollection }) {
  const [open, setOpen] = useState(false);
  const [newName, setNewName] = useState('');
  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-400 transition-all"
        title="Add to collection"
      >
        <FolderPlus size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 bottom-full mb-1 w-44 bg-slate-800 border border-white/10 rounded-xl p-2 z-20 shadow-xl space-y-1">
            <p className="text-xs text-slate-500 px-2 pb-1 font-bold">Add to collection</p>
            {entry.collectionId && (
              <button
                onClick={() => { onSetEntryCollection(entry.id, null); setOpen(false); }}
                className="w-full text-left text-xs px-3 py-1.5 rounded-lg text-red-400 hover:bg-white/5 transition-all"
              >
                Remove from collection
              </button>
            )}
            {(collections || []).map(col => (
              <button
                key={col.id}
                onClick={() => { onSetEntryCollection(entry.id, col.id); setOpen(false); }}
                className={`w-full text-left text-xs px-3 py-1.5 rounded-lg transition-all ${entry.collectionId === col.id ? 'text-orange-400 bg-orange-500/10' : 'text-slate-300 hover:bg-white/5'}`}
              >
                {entry.collectionId === col.id ? '✓ ' : ''}{col.name}
              </button>
            ))}
            <div className="border-t border-white/5 pt-1">
              <input
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && newName.trim()) {
                    const id = onCreateCollection(newName);
                    if (id) { onSetEntryCollection(entry.id, id); setNewName(''); setOpen(false); }
                  }
                }}
                placeholder="New collection..."
                className="w-full bg-transparent text-xs text-slate-400 outline-none px-2 py-1 placeholder:text-slate-600"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function RecipeHistory({
  history,
  favourites,
  collections,
  onToggleFavourite,
  onDelete,
  onSelect,
  onAddTag,
  onRemoveTag,
  onSetNotes,
  onCreateCollection,
  onDeleteCollection,
  onSetEntryCollection,
  bestStreak,
  currentStreak,
}) {
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date');
  const [showVersionsFor, setShowVersionsFor] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');

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
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'all' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              All ({history.length})
            </button>
            <button
              onClick={() => setTab('favourites')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'favourites' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Saved ({favourites.length})
            </button>
            <button
              onClick={() => setTab('collections')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'collections' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              📁 ({(collections || []).length})
            </button>
          </div>
        </div>
      </div>

      {/* Monthly challenges */}
      {history.length > 0 && <MonthlyChallenges history={history} favourites={favourites} />}

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

      {/* Collections view */}
      {tab === 'collections' ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              value={newCollectionName}
              onChange={e => setNewCollectionName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && newCollectionName.trim()) { onCreateCollection(newCollectionName); setNewCollectionName(''); } }}
              placeholder="New collection name..."
              className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-4 py-2 text-sm outline-none focus:border-orange-500/50 text-slate-300 placeholder:text-slate-600 transition-all"
            />
            <button
              onClick={() => { if (newCollectionName.trim()) { onCreateCollection(newCollectionName); setNewCollectionName(''); } }}
              className="px-4 py-2 bg-orange-500/20 border border-orange-500/30 text-orange-400 rounded-xl text-sm hover:bg-orange-500/30 transition-all"
            >
              Create
            </button>
          </div>
          {(collections || []).length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">No collections yet. Create one above to organise your recipes.</div>
          ) : (
            (collections || []).map(col => {
              const colRecipes = history.filter(e => e.collectionId === col.id);
              return (
                <div key={col.id} className="bg-slate-900 border border-white/5 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base">📁 {col.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">{colRecipes.length} recipe{colRecipes.length !== 1 ? 's' : ''}</span>
                      <button onClick={() => onDeleteCollection(col.id)} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                  {colRecipes.length === 0 ? (
                    <p className="text-xs text-slate-600">No recipes yet. Use the 📁 icon on any recipe card to add it here.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {colRecipes.map(e => (
                        <button
                          key={e.id}
                          onClick={() => onSelect(e)}
                          className="px-3 py-1.5 bg-slate-800 border border-white/5 rounded-xl text-xs text-slate-300 hover:border-orange-500/30 hover:text-orange-400 transition-all"
                        >
                          {e.recipe.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      ) : (
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
                  {entry.versions && entry.versions.length > 0 && (
                    <button
                      onClick={() => setShowVersionsFor(showVersionsFor === entry.id ? null : entry.id)}
                      className="px-1.5 py-0.5 bg-slate-800 rounded-full hover:text-orange-400 transition-colors"
                      title="Version history"
                    >
                      v{entry.versions.length + 1}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {entry.rating === 'up' && <span className="text-green-400 text-xs">👍</span>}
                  {entry.rating === 'down' && <span className="text-red-400 text-xs">👎</span>}
                  <CollectionDropdown
                    entry={entry}
                    collections={collections}
                    onSetEntryCollection={onSetEntryCollection}
                    onCreateCollection={onCreateCollection}
                  />
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

              {/* Version history */}
              {showVersionsFor === entry.id && entry.versions && entry.versions.length > 0 && (
                <div className="pt-2 border-t border-white/5 space-y-1.5">
                  <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">Previous versions</p>
                  {[...entry.versions].reverse().map((v, vi) => (
                    <div key={vi} className="flex items-center justify-between text-xs text-slate-500">
                      <span>{new Date(v.savedAt).toLocaleDateString()}: {v.recipe.name}</span>
                      <button
                        onClick={() => onSelect({ ...entry, recipe: v.recipe, imageUrl: v.imageUrl })}
                        className="text-orange-400 hover:text-orange-300 transition-colors"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
