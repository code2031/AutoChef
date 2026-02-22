import React, { useState } from 'react';
import { Heart, Trash2, Clock, Star, Image as ImageIcon } from 'lucide-react';

export default function RecipeHistory({ history, favourites, onToggleFavourite, onDelete, onSelect }) {
  const [tab, setTab] = useState('all');

  const items = tab === 'favourites' ? favourites : history;

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Recipe History</h2>
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
            ❤️ Saved ({favourites.length})
          </button>
        </div>
      </div>

      {items.length === 0 && (
        <div className="py-20 text-center space-y-3">
          <p className="text-4xl">🍽️</p>
          <p className="text-slate-400 text-sm">
            {tab === 'favourites' ? 'No saved recipes yet. Hit the heart icon on a recipe!' : 'No recipes generated yet. Head to My Kitchen!'}
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {items.map(entry => (
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
            <div className="p-4 flex items-center justify-between">
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
          </div>
        ))}
      </div>
    </div>
  );
}
