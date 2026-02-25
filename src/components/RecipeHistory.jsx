import React, { useState } from 'react';
import { Heart, Trash2, Clock, Search, Download, SortAsc, X, FolderPlus, BarChart2, Shuffle, Bookmark, LayoutGrid, List, Pin } from 'lucide-react';
import { Image as ImageIcon } from 'lucide-react';
import CookingStats from './CookingStats.jsx';
import { useRecipeHistory } from '../hooks/useRecipeHistory.js';
import CuisinePassport from './CuisinePassport.jsx';
import CookingJournal from './CookingJournal.jsx';
import DailyFoodLog from './DailyFoodLog.jsx';
import RecipeCompare from './RecipeCompare.jsx';
import TrophyCase from './TrophyCase.jsx';
import { buildSmartShoppingList } from '../lib/shoppingList.js';
import ShoppingIntegrations from './ShoppingIntegrations.jsx';
import MasteryBadge from './RecipeMastery.jsx';
import WeeklyChallengeCard from './WeeklyChallengeCard.jsx';
import RecipeOfTheDay from './RecipeOfTheDay.jsx';
import CookingTipWidget from './CookingTipWidget.jsx';

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
  onToggleWantToCook,
  onDelete,
  onSelect,
  onAddTag,
  onRemoveTag,
  onSetNotes,
  onCreateCollection,
  onDeleteCollection,
  onSetEntryCollection,
  currentStreak,
  onRemix,
  onClone,
  onTogglePin,
  onBulkDelete,
  gamification,
  bestStreak,
  nutritionGoals,
  lastRecipe,
}) {
  const { cloneRecipe } = useRecipeHistory();
  const [tab, setTab] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('date');
  const [diffFilter, setDiffFilter] = useState('all');
  const [ratingFilter, setRatingFilter] = useState('all'); // 'all' | 'up' | 'down' | 'unrated'
  const [cuisineFilter, setCuisineFilter] = useState(''); // '' | 'Italian' | 'Asian' | etc.
  const [hasNotesFilter, setHasNotesFilter] = useState(false); // Feature 58: "has notes" filter
  const [showVersionsFor, setShowVersionsFor] = useState(null);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [remixMode, setRemixMode] = useState(false);
  const [remixSelection, setRemixSelection] = useState([]);
  const [multiSelect, setMultiSelect] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [mergedShoppingList, setMergedShoppingList] = useState(null);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'gallery'

  const wishlistItems = history.filter(e => e.wantToCook);
  const baseItems = tab === 'favourites' ? favourites : tab === 'wishlist' ? wishlistItems : history;

  const filtered = baseItems
    .filter(e => {
      // Difficulty filter
      if (diffFilter !== 'all' && e.recipe?.difficulty !== diffFilter) return false;
      // Feature 46: rating filter
      if (ratingFilter === 'up' && e.rating !== 'up') return false;
      if (ratingFilter === 'down' && e.rating !== 'down') return false;
      if (ratingFilter === 'unrated' && e.rating) return false;
      // Feature 58: has-notes filter
      if (hasNotesFilter && !e.notes?.trim()) return false;
      // Feature 59: cuisine filter
      if (cuisineFilter) {
        const cui = cuisineFilter.toLowerCase();
        const matchesTag = (e.tags || []).some(t => t.toLowerCase().includes(cui));
        const matchesName = (e.recipe?.name || '').toLowerCase().includes(cui);
        if (!matchesTag && !matchesName) return false;
      }
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        e.recipe.name.toLowerCase().includes(q) ||
        (e.tags || []).some(t => t.includes(q)) ||
        (e.notes || '').toLowerCase().includes(q) ||
        // Feature 16: search by ingredient
        (e.recipe?.ingredients || []).some(ing => ing.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      // Feature 20: pinned entries always float to top
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (sort === 'date') return new Date(b.savedAt) - new Date(a.savedAt);
      if (sort === 'name') return a.recipe.name.localeCompare(b.recipe.name);
      if (sort === 'rating') {
        const score = r => r.rating === 'up' ? 1 : r.rating === 'down' ? -1 : 0;
        return score(b) - score(a);
      }
      // Feature 13: sort by cook count
      if (sort === 'cooks') return (b.cookCount || 0) - (a.cookCount || 0);
      // Feature 14: sort by difficulty
      if (sort === 'difficulty') {
        const order = { Easy: 0, Medium: 1, Hard: 2 };
        return (order[a.recipe?.difficulty] ?? 1) - (order[b.recipe?.difficulty] ?? 1);
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

  const toggleRemixSelection = (entryId) => {
    setRemixSelection(prev => {
      if (prev.includes(entryId)) return prev.filter(id => id !== entryId);
      if (prev.length >= 2) return prev; // max 2
      return [...prev, entryId];
    });
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleCreateFusion = () => {
    if (remixSelection.length !== 2 || !onRemix) return;
    const [entry1, entry2] = remixSelection.map(id => history.find(e => e.id === id));
    if (entry1 && entry2) {
      onRemix(entry1.recipe, entry2.recipe);
      setRemixMode(false);
      setRemixSelection([]);
    }
  };

  const handleClone = (id) => {
    if (onClone) {
      onClone(id);
    } else {
      cloneRecipe(id);
    }
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
        </div>
        <div className="flex gap-2 items-center flex-wrap">
          {history.length > 0 && (
            <button
              onClick={() => { const pick = history[Math.floor(Math.random() * history.length)]; onSelect(pick); }}
              title="Load a random saved recipe"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 text-xs hover:border-orange-500/30 hover:text-orange-400 transition-all"
            >
              🎲 Random
            </button>
          )}
          {history.length >= 1 && (
            <button
              onClick={() => { setMultiSelect(v => !v); setSelectedIds([]); setMergedShoppingList(null); }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs border transition-all ${multiSelect ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-slate-800 border-white/5 text-slate-400 hover:text-white'}`}
            >
              {multiSelect ? '✕ Done' : '🛒 Multi-select'}
            </button>
          )}
          {/* Gallery / Card view toggle */}
          <div className="flex items-center bg-slate-900 border border-white/5 rounded-xl p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'cards' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Card view"
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('gallery')}
              className={`p-1.5 rounded-lg transition-all ${viewMode === 'gallery' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-slate-300'}`}
              title="Gallery view"
            >
              <LayoutGrid size={14} />
            </button>
          </div>
          <button
            onClick={exportJSON}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 text-xs hover:border-white/20 hover:text-white transition-all"
          >
            <Download size={14} />
            Export
          </button>
          <div className="flex gap-1 bg-slate-900 rounded-xl p-1 flex-wrap">
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
              onClick={() => setTab('wishlist')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'wishlist' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              🔖 ({wishlistItems.length})
            </button>
            <button
              onClick={() => setTab('collections')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'collections' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              📁 ({(collections || []).length})
            </button>
            <button
              onClick={() => setTab('stats')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'stats' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              <BarChart2 size={14} className="inline mr-1" />
              Stats
            </button>
            <button
              onClick={() => setTab('journal')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'journal' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              📓 Journal
            </button>
            <button
              onClick={() => setTab('cuisine')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'cuisine' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              🌍 Cuisine
            </button>
            <button
              onClick={() => setTab('log')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'log' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              🥗 Log
            </button>
            <button
              onClick={() => setTab('trophy')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${tab === 'trophy' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              🏆 Trophy
            </button>
          </div>
        </div>
      </div>

      {/* Stats tab */}
      {tab === 'stats' && <CookingStats history={history} />}

      {tab === 'journal' && <CookingJournal />}
      {tab === 'cuisine' && <CuisinePassport history={history} />}
      {tab === 'log' && <DailyFoodLog nutritionGoals={nutritionGoals} lastRecipe={lastRecipe} />}
      {tab === 'trophy' && (
        <TrophyCase
          badges={gamification?.badges || []}
          streak={gamification?.streak || 0}
          bestStreak={bestStreak || 0}
          stats={gamification?.stats || {}}
        />
      )}

      {tab !== 'stats' && tab !== 'journal' && tab !== 'cuisine' && tab !== 'log' && tab !== 'trophy' && (
        <>
          {/* Feature 5 wired: Weekly Challenge Card */}
          {history.length > 0 && <WeeklyChallengeCard history={history} />}

          {/* Feature 37: Recipe of the day suggestion */}
          {history.length > 0 && <RecipeOfTheDay history={history} onSelect={onSelect} />}

          {/* Feature 38: Cooking tip widget */}
          <CookingTipWidget />

          {/* Monthly challenges */}
          {history.length > 0 && <MonthlyChallenges history={history} favourites={favourites} />}

          {/* Activity heatmap */}
          {history.length > 0 && <ActivityHeatmap history={history} />}

          {/* Search + Sort + Remix toggle */}
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
                  <option value="cooks">Most Cooked</option>
                  <option value="difficulty">Difficulty</option>
                </select>
              </div>
              {/* Feature 15: difficulty filter */}
              <div className="flex items-center gap-1 bg-slate-900 border border-white/5 rounded-xl px-3">
                <select
                  value={diffFilter}
                  onChange={e => setDiffFilter(e.target.value)}
                  className="bg-transparent text-sm text-slate-400 outline-none py-2 cursor-pointer"
                >
                  <option value="all">All levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
              {/* Feature 46: rating filter */}
              <div className="flex items-center gap-1 bg-slate-900 border border-white/5 rounded-xl px-3">
                <select
                  value={ratingFilter}
                  onChange={e => setRatingFilter(e.target.value)}
                  className="bg-transparent text-sm text-slate-400 outline-none py-2 cursor-pointer"
                >
                  <option value="all">All ratings</option>
                  <option value="up">👍 Liked</option>
                  <option value="down">👎 Disliked</option>
                  <option value="unrated">Unrated</option>
                </select>
              </div>
              {/* Feature 47: clear filters button */}
              {(search || diffFilter !== 'all' || ratingFilter !== 'all' || cuisineFilter || hasNotesFilter) && (
                <button
                  onClick={() => { setSearch(''); setDiffFilter('all'); setRatingFilter('all'); setCuisineFilter(''); setHasNotesFilter(false); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-white/5 text-slate-400 text-xs hover:border-red-500/30 hover:text-red-400 transition-all"
                >
                  <X size={12} /> Clear filters
                </button>
              )}
              {history.length >= 2 && (
                <button
                  onClick={() => { setRemixMode(v => !v); setRemixSelection([]); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium transition-all border ${remixMode ? 'bg-purple-500/20 border-purple-500/40 text-purple-300' : 'bg-slate-900 border-white/5 text-slate-400 hover:border-purple-500/30 hover:text-purple-400'}`}
                >
                  <Shuffle size={14} />
                  Remix 2 Recipes
                </button>
              )}
            </div>
          )}

          {/* Feature 59: cuisine quick-filter chips */}
          {history.length > 3 && (
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-xs text-slate-600">Cuisine:</span>
              {['Italian', 'Asian', 'Mexican', 'Indian', 'French', 'Japanese'].map(c => (
                <button
                  key={c}
                  onClick={() => setCuisineFilter(cuisineFilter === c ? '' : c)}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-all ${cuisineFilter === c ? 'bg-orange-500/20 border-orange-500/40 text-orange-300' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/15'}`}
                >
                  {c}
                </button>
              ))}
              {/* Feature 58: has notes toggle */}
              <button
                onClick={() => setHasNotesFilter(v => !v)}
                className={`px-2.5 py-1 rounded-full text-xs border transition-all ${hasNotesFilter ? 'bg-blue-500/20 border-blue-500/40 text-blue-300' : 'bg-slate-900 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/15'}`}
              >
                📝 Has notes
              </button>
            </div>
          )}

          {/* Feature 48: result count */}
          {(search || diffFilter !== 'all' || ratingFilter !== 'all' || cuisineFilter || hasNotesFilter) && filtered.length > 0 && (
            <p className="text-xs text-slate-500">Showing {filtered.length} of {baseItems.length} recipes</p>
          )}

          {filtered.length === 0 && (
            <div className="py-20 text-center space-y-3">
              <p className="text-4xl">🍽️</p>
              <p className="text-slate-400 text-sm">
                {search
                  ? `No recipes match "${search}"`
                  : tab === 'favourites'
                  ? 'No saved recipes yet. Hit the heart icon on a recipe!'
                  : tab === 'wishlist'
                  ? 'No recipes in your wishlist. Tap 🔖 on any recipe card to add it!'
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
          ) : (() => {
            const effectiveViewMode = (remixMode || multiSelect) ? 'cards' : viewMode;

            if (effectiveViewMode === 'gallery') {
              return (
                <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                  {filtered.map(entry => (
                    <div
                      key={entry.id}
                      onClick={() => onSelect(entry)}
                      className="break-inside-avoid relative rounded-2xl overflow-hidden cursor-pointer group border border-white/5 hover:border-orange-500/30 transition-all mb-3"
                    >
                      {entry.imageUrl ? (
                        <img
                          src={entry.imageUrl}
                          alt={entry.recipe.name}
                          className="w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center bg-slate-800">
                          <ImageIcon size={24} className="text-slate-700" />
                        </div>
                      )}
                      {/* Mobile: always-visible name strip */}
                      <div className="sm:hidden bg-gradient-to-t from-slate-950 to-transparent p-2 absolute bottom-0 left-0 right-0">
                        <p className="text-xs font-semibold text-white leading-tight line-clamp-2">{entry.recipe.name}</p>
                      </div>
                      {/* Desktop: hover reveal overlay */}
                      <div className="hidden sm:flex absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex-col justify-end p-3 space-y-1">
                        <p className="text-sm font-bold text-white leading-tight line-clamp-2">{entry.recipe.name}</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {entry.recipe.difficulty && (
                            <span className="text-[10px] bg-black/40 text-slate-300 px-1.5 py-0.5 rounded-full">{entry.recipe.difficulty}</span>
                          )}
                          {entry.rating === 'up' && <span className="text-[10px]">👍</span>}
                          {entry.rating === 'down' && <span className="text-[10px]">👎</span>}
                          {entry.isFavourite && <span className="text-[10px]">❤️</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            return (
            <div className="grid sm:grid-cols-2 gap-4">
              {filtered.map(entry => {
                const isRemixSelected = remixSelection.includes(entry.id);
                const isMultiSelected = selectedIds.includes(entry.id);
                return (
                  <div
                    key={entry.id}
                    className={`relative bg-slate-900 border rounded-2xl overflow-hidden transition-all group ${
                      remixMode
                        ? isRemixSelected
                          ? 'border-purple-500/60 ring-2 ring-purple-500/30'
                          : 'border-white/5 hover:border-purple-500/30 cursor-pointer'
                        : multiSelect
                        ? isMultiSelected
                          ? 'border-orange-500/60 ring-2 ring-orange-500/30'
                          : 'border-white/5 hover:border-orange-500/30 cursor-pointer'
                        : 'border-white/5 hover:border-orange-500/20'
                    }`}
                    onClick={remixMode ? () => toggleRemixSelection(entry.id) : multiSelect ? () => toggleSelect(entry.id) : undefined}
                  >
                    {/* Multi-select checkbox */}
                    {multiSelect && (
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleSelect(entry.id); }}
                        className={`absolute top-2 left-2 z-10 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${isMultiSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-600 bg-slate-800'}`}
                      >
                        {isMultiSelected && '✓'}
                      </button>
                    )}

                    {/* Thumbnail */}
                    <div
                      className="h-40 relative cursor-pointer overflow-hidden bg-slate-800"
                      onClick={remixMode || multiSelect ? undefined : () => onSelect(entry)}
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
                      {remixMode && isRemixSelected && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {remixSelection.indexOf(entry.id) + 1}
                        </div>
                      )}
                    </div>

                    {/* Meta */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-500 text-xs flex-wrap">
                          <Clock size={12} />
                          {formatDate(entry.savedAt)}
                          {entry.recipe.difficulty && (
                            <span className={`px-2 py-0.5 rounded-full ${entry.recipe.difficulty === 'Hard' ? 'bg-red-500/10 text-red-400' : entry.recipe.difficulty === 'Easy' ? 'bg-green-500/10 text-green-400' : 'bg-slate-800 text-slate-400'}`}>{entry.recipe.difficulty}</span>
                          )}
                          {entry.recipe.calories && (
                            <span className="text-slate-600">{entry.recipe.calories} kcal</span>
                          )}
                          {entry.versions && entry.versions.length > 0 && (
                            <button
                              onClick={e => { e.stopPropagation(); setShowVersionsFor(showVersionsFor === entry.id ? null : entry.id); }}
                              className="px-1.5 py-0.5 bg-slate-800 rounded-full hover:text-orange-400 transition-colors"
                              title="Version history"
                            >
                              v{entry.versions.length + 1}
                            </button>
                          )}
                          {(entry.cookCount || 0) > 0 && (
                            <>
                              <span className="text-xs text-slate-500">Cooked {entry.cookCount}×</span>
                              <MasteryBadge cookCount={entry.cookCount} />
                            </>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          {entry.isPinned && <span className="text-amber-400 text-xs" title="Pinned">📌</span>}
                          {entry.rating === 'up' && <span className="text-green-400 text-xs">👍</span>}
                          {entry.rating === 'down' && <span className="text-red-400 text-xs">👎</span>}
                          {!remixMode && !multiSelect && (
                            <>
                              {/* Feature 17: cook-again button */}
                              <button
                                onClick={(e) => { e.stopPropagation(); onSelect(entry); }}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-green-400 transition-all"
                                title="Cook this again"
                              >
                                🍳
                              </button>
                              {/* Feature 20: pin/unpin */}
                              {onTogglePin && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); onTogglePin(entry.id); }}
                                  className={`p-1.5 rounded-lg transition-all ${entry.isPinned ? 'text-amber-400' : 'text-slate-600 hover:text-amber-400'}`}
                                  title={entry.isPinned ? 'Unpin' : 'Pin to top'}
                                >
                                  <Pin size={14} fill={entry.isPinned ? 'currentColor' : 'none'} />
                                </button>
                              )}
                              <button
                                onClick={(e) => { e.stopPropagation(); handleClone(entry.id); }}
                                className="p-1.5 rounded-lg text-slate-600 hover:text-orange-400 transition-all"
                                title="Clone recipe"
                              >
                                📋
                              </button>
                              <CollectionDropdown
                                entry={entry}
                                collections={collections}
                                onSetEntryCollection={onSetEntryCollection}
                                onCreateCollection={onCreateCollection}
                              />
                              {onToggleWantToCook && (
                                <button
                                  onClick={() => onToggleWantToCook(entry.id)}
                                  className={`p-1.5 rounded-lg transition-all ${entry.wantToCook ? 'text-orange-400' : 'text-slate-600 hover:text-orange-400'}`}
                                  title={entry.wantToCook ? 'Remove from wishlist' : 'Add to wishlist'}
                                >
                                  <Bookmark size={16} fill={entry.wantToCook ? 'currentColor' : 'none'} />
                                </button>
                              )}
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
                            </>
                          )}
                        </div>
                      </div>

                      {/* Tags */}
                      {!remixMode && !multiSelect && onAddTag && (
                        <TagEditor entry={entry} onAddTag={onAddTag} onRemoveTag={onRemoveTag} />
                      )}

                      {/* Notes */}
                      {!remixMode && !multiSelect && onSetNotes && (
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
                );
              })}
            </div>
            );
          })()}

          {/* Multi-select sticky action bar */}
          {multiSelect && selectedIds.length > 0 && (
            <div className="sticky bottom-4 left-0 right-0 mx-auto w-fit flex gap-2 z-10 p-3 bg-slate-800 border border-white/10 rounded-2xl shadow-2xl">
              <span className="text-sm text-slate-400 self-center">{selectedIds.length} selected</span>
              {selectedIds.length >= 2 && (
                <>
                  <button
                    onClick={() => {
                      const selectedEntries = history.filter(e => selectedIds.includes(e.id));
                      const allIngredients = selectedEntries.flatMap(e => e.recipe?.ingredients || []);
                      setMergedShoppingList(buildSmartShoppingList(allIngredients));
                    }}
                    className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-all"
                  >
                    🛒 Merge Shopping Lists
                  </button>
                  {selectedIds.length === 2 && (
                    <button
                      onClick={() => setShowCompare(true)}
                      className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 text-blue-400 text-sm font-medium rounded-xl hover:bg-blue-500/30 transition-all"
                    >
                      📊 Compare
                    </button>
                  )}
                </>
              )}
              {/* Feature 18: bulk delete */}
              {onBulkDelete && (
                <button
                  onClick={() => { if (window.confirm(`Delete ${selectedIds.length} recipes?`)) { onBulkDelete(selectedIds); setSelectedIds([]); setMultiSelect(false); } }}
                  className="px-3 py-2 bg-red-500/20 border border-red-500/30 text-red-400 text-sm rounded-xl hover:bg-red-500/30 transition-all"
                >
                  🗑️ Delete
                </button>
              )}
              <button
                onClick={() => setSelectedIds([])}
                className="px-3 py-2 bg-slate-700 text-slate-400 text-sm rounded-xl hover:text-white transition-all"
              >
                Clear
              </button>
            </div>
          )}

          {/* Remix sticky bottom bar */}
          {remixMode && (
            <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between gap-4 px-6 py-4 bg-slate-900/95 backdrop-blur-sm border-t border-purple-500/20">
              <p className="text-sm text-slate-300">
                Pick 2 recipes to remix — <span className="font-bold text-purple-400">{remixSelection.length}/2</span> selected
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => { setRemixMode(false); setRemixSelection([]); }}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-400 text-sm hover:text-white transition-all"
                >
                  Cancel
                </button>
                {remixSelection.length === 2 && (
                  <button
                    onClick={handleCreateFusion}
                    className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold transition-all"
                  >
                    Create Fusion Dish →
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Merged shopping list modal */}
      {mergedShoppingList && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <p className="font-bold text-white">🛒 Smart Shopping List</p>
              <button onClick={() => setMergedShoppingList(null)} className="text-slate-400 hover:text-white transition-colors">✕</button>
            </div>
            <div className="overflow-y-auto flex-1 p-4 space-y-4">
              {Object.entries(mergedShoppingList).map(([aisle, ings]) => (
                <div key={aisle}>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{aisle}</p>
                  {ings.map((ing, i) => (
                    <p key={i} className="text-sm text-slate-300 py-1 border-b border-white/5">· {ing}</p>
                  ))}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-white/5 space-y-3">
              <button
                onClick={() => {
                  const lines = Object.entries(mergedShoppingList).flatMap(([aisle, ings]) => [aisle + ':', ...ings.map(i => '  · ' + i), '']);
                  navigator.clipboard?.writeText(lines.join('\n'));
                }}
                className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-xl transition-all"
              >
                📋 Copy All
              </button>
              <ShoppingIntegrations items={Object.values(mergedShoppingList).flat()} />
            </div>
          </div>
        </div>
      )}

      {showCompare && selectedIds.length === 2 && (() => {
        const recipeA = history.find(e => e.id === selectedIds[0]);
        const recipeB = history.find(e => e.id === selectedIds[1]);
        if (!recipeA || !recipeB) return null;
        return <RecipeCompare recipeA={recipeA} recipeB={recipeB} imageA={recipeA.imageUrl} imageB={recipeB.imageUrl} onClose={() => setShowCompare(false)} />;
      })()}
    </div>
  );
}
