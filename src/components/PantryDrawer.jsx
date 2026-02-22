import React, { useState } from 'react';
import { X, Plus, Trash2, ShoppingBag, AlertTriangle } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { getEmojiForIngredient } from '../lib/ingredients.js';

const LOW_PANTRY_THRESHOLD = 3;

export default function PantryDrawer({ onAddAll, onClose }) {
  const [pantry, setPantry] = useLocalStorage('pantry_items', []);
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    const clean = newItem.trim();
    if (clean && !pantry.includes(clean)) {
      setPantry(prev => [...prev, clean]);
      setNewItem('');
    }
  };

  const removeItem = (item) => setPantry(prev => prev.filter(i => i !== item));
  const isLow = pantry.length > 0 && pantry.length <= LOW_PANTRY_THRESHOLD;

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative w-full max-w-[92vw] sm:max-w-sm bg-slate-900 border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-orange-500" />
            <h2 className="font-bold text-lg">My Pantry</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Low pantry alert */}
        {isLow && (
          <div className="mx-4 mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-400 shrink-0" />
            <p className="text-yellow-400 text-xs">
              Running low! Only {pantry.length} item{pantry.length !== 1 ? 's' : ''} in your pantry.
            </p>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {pantry.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-8">
              Your pantry is empty. Add staples you always have on hand.
            </p>
          )}
          {pantry.map(item => (
            <div key={item} className="flex items-center justify-between px-4 py-2.5 bg-slate-800 rounded-xl group">
              <span className="flex items-center gap-2 text-sm">
                <span>{getEmojiForIngredient(item)}</span>
                {item}
              </span>
              <button
                onClick={() => removeItem(item)}
                className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-white/5 space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={newItem}
              onChange={e => setNewItem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addItem()}
              placeholder="Add pantry item..."
              className="flex-1 bg-slate-800 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 transition-all"
            />
            <button
              onClick={addItem}
              className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all"
            >
              <Plus size={18} />
            </button>
          </div>
          {pantry.length > 0 && (
            <button
              onClick={() => { onAddAll(pantry); onClose(); }}
              className="w-full py-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl text-sm font-bold hover:bg-orange-500/20 transition-all"
            >
              Add All to Recipe ({pantry.length} items)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
