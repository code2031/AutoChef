import React, { useState } from 'react';
import PantryAnalytics from './PantryAnalytics.jsx';
import { X, Plus, Trash2, ShoppingBag, AlertTriangle, ClipboardList } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';
import { getEmojiForIngredient } from '../lib/ingredients.js';
import { parseGroceryReceipt } from '../lib/groq.js';

const LOW_PANTRY_THRESHOLD = 3;

const ZONES = ['pantry', 'fridge', 'freezer'];
const ZONE_COLORS = { pantry: 'text-amber-400 bg-amber-500/10 border-amber-500/20', fridge: 'text-blue-400 bg-blue-500/10 border-blue-500/20', freezer: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' };

const normalise = (items) => items.map(i =>
  typeof i === 'string' ? { name: i, expiresAt: null, zone: 'pantry' } :
  { zone: 'pantry', ...i }
);

function ExpiryBadge({ expiresAt }) {
  if (!expiresAt) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiresAt);
  expiry.setHours(0, 0, 0, 0);
  const diffDays = Math.round((expiry - today) / 86400000);

  if (diffDays < 0) {
    return (
      <span className="text-xs px-1.5 py-0.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded-full">
        Expired
      </span>
    );
  }
  if (diffDays <= 3) {
    return (
      <span className="text-xs px-1.5 py-0.5 bg-orange-500/15 border border-orange-500/30 text-orange-400 rounded-full">
        Expires in {diffDays}d
      </span>
    );
  }
  return (
    <span className="text-xs px-1.5 py-0.5 bg-green-500/15 border border-green-500/30 text-green-400 rounded-full">
      {expiry.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
    </span>
  );
}

function ZoneBadge({ zone }) {
  const cls = ZONE_COLORS[zone] || ZONE_COLORS.pantry;
  const icons = { pantry: '🗄️', fridge: '🧊', freezer: '❄️' };
  return (
    <span className={`text-[10px] px-1.5 py-0.5 border rounded-full ${cls}`}>
      {icons[zone] || '🗄️'} {zone}
    </span>
  );
}

export default function PantryDrawer({ onAddAll, onClose }) {
  const [rawPantry, setPantryRaw] = useLocalStorage('pantry_items', []);
  const pantry = normalise(rawPantry);
  const setPantry = (updater) => {
    if (typeof updater === 'function') {
      setPantryRaw(prev => updater(normalise(prev)));
    } else {
      setPantryRaw(updater);
    }
  };

  const [newItem, setNewItem] = useState('');
  const [newExpiry, setNewExpiry] = useState('');
  const [newZone, setNewZone] = useState('pantry');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showReceiptImport, setShowReceiptImport] = useState(false);
  const [showReorder, setShowReorder] = useState(false);
  const [receiptText, setReceiptText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [filterZone, setFilterZone] = useState('all');

  const addItem = () => {
    const clean = newItem.trim().toLowerCase();
    if (clean && !pantry.some(p => p.name === clean)) {
      setPantry(prev => [...prev, { name: clean, expiresAt: newExpiry || null, zone: newZone }]);
      setNewItem('');
      setNewExpiry('');
    }
  };

  const removeItem = (name) => setPantry(prev => prev.filter(i => i.name !== name));

  const handleReceiptImport = async () => {
    if (!receiptText.trim()) return;
    setIsImporting(true);
    try {
      const prompt = `Extract all food/ingredient items from this grocery receipt or shopping list. Return only actual food items (not household products, cleaning supplies, etc.).\n\nReceipt/list:\n${receiptText}\n\nReturn JSON: {"ingredients": ["item1", "item2", ...]}`;
      const items = await parseGroceryReceipt(prompt);
      items.forEach(name => {
        const clean = name.trim().toLowerCase();
        if (clean && !pantry.some(p => p.name === clean)) {
          setPantry(prev => [...prev, { name: clean, expiresAt: null, zone: newZone }]);
        }
      });
      setReceiptText('');
      setShowReceiptImport(false);
    } catch {
      // ignore
    } finally {
      setIsImporting(false);
    }
  };

  // Compute expiry stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const getExpiryDays = (item) => {
    if (!item.expiresAt) return null;
    const expiry = new Date(item.expiresAt);
    expiry.setHours(0, 0, 0, 0);
    return Math.round((expiry - today) / 86400000);
  };

  const urgentItems = pantry.filter(item => {
    const d = getExpiryDays(item);
    return d !== null && d <= 3;
  });
  const urgentCount = urgentItems.length;
  const isLow = pantry.length > 0 && pantry.length <= LOW_PANTRY_THRESHOLD;

  // Reorder list: expired + expiring soon + items explicitly marked
  const reorderList = pantry.filter(item => {
    const d = getExpiryDays(item);
    return d !== null && d < 0; // expired only for reorder
  });

  // Filtered pantry list
  const visiblePantry = filterZone === 'all' ? pantry : pantry.filter(p => p.zone === filterZone);

  // Copy reorder list to clipboard
  const copyReorder = () => {
    const text = reorderList.map(i => `• ${i.name}`).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-[150] flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-[92vw] sm:max-w-sm bg-slate-900 border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-orange-500" />
            <h2 className="font-bold text-lg">My Pantry</h2>
            <span className="text-xs text-slate-500">{pantry.length} items</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        {/* Analytics toggle */}
        <button
          onClick={() => setShowAnalytics(v => !v)}
          className={(showAnalytics ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' : 'border-white/5 text-slate-500 hover:text-slate-400') + ' mx-4 mt-3 w-[calc(100%-2rem)] py-2 text-xs font-bold rounded-xl border transition-all'}
        >
          {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
        </button>
        {showAnalytics && <PantryAnalytics pantryItems={pantry} />}

        {/* Alerts */}
        {isLow && (
          <div className="mx-4 mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-2">
            <AlertTriangle size={16} className="text-yellow-400 shrink-0" />
            <p className="text-yellow-400 text-xs">Running low! Only {pantry.length} item{pantry.length !== 1 ? 's' : ''} in your pantry.</p>
          </div>
        )}
        {urgentCount > 0 && (
          <div className="mx-4 mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2">
            <AlertTriangle size={16} className="text-red-400 shrink-0" />
            <p className="text-red-400 text-xs">{urgentCount} item{urgentCount !== 1 ? 's' : ''} expired or expiring within 3 days!</p>
          </div>
        )}

        {/* Reorder list */}
        {reorderList.length > 0 && (
          <div className="mx-4 mt-3 rounded-xl border border-white/5 overflow-hidden">
            <button
              onClick={() => setShowReorder(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-800/60 text-xs font-bold text-slate-400 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2"><ClipboardList size={13} className="text-orange-400" />Reorder List ({reorderList.length})</span>
              <span className="text-slate-600">{showReorder ? '▲' : '▼'}</span>
            </button>
            {showReorder && (
              <div className="px-3 pb-3 pt-1 space-y-1">
                {reorderList.map(item => (
                  <div key={item.name} className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{getEmojiForIngredient(item.name)}</span>
                    <span className="flex-1 capitalize">{item.name}</span>
                    <span className="text-red-400 text-[10px]">expired</span>
                  </div>
                ))}
                <button
                  onClick={copyReorder}
                  className="mt-2 w-full py-1.5 text-xs text-orange-400 border border-orange-500/20 rounded-lg hover:bg-orange-500/5 transition-all"
                >
                  Copy list
                </button>
              </div>
            )}
          </div>
        )}

        {/* Zone filter tabs */}
        <div className="flex gap-1.5 px-4 mt-3">
          {['all', ...ZONES].map(z => (
            <button
              key={z}
              onClick={() => setFilterZone(z)}
              className={(filterZone === z ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-500 hover:text-white') + ' px-2.5 py-1 rounded-lg text-xs font-medium transition-all capitalize'}
            >
              {z === 'all' ? 'All' : { pantry: '🗄️', fridge: '🧊', freezer: '❄️' }[z] + ' ' + z}
            </button>
          ))}
        </div>

        {/* Item list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {visiblePantry.length === 0 && (
            <p className="text-slate-500 text-sm text-center py-8">
              {filterZone === 'all' ? 'Your pantry is empty. Add staples you always have on hand.' : `No items in ${filterZone}.`}
            </p>
          )}
          {visiblePantry.map(item => (
            <div key={item.name} className="flex items-center justify-between px-3 py-2.5 bg-slate-800 rounded-xl group">
              <span className="flex items-center gap-2 text-sm min-w-0 flex-wrap">
                <span>{getEmojiForIngredient(item.name)}</span>
                <span className="truncate">{item.name}</span>
                <ZoneBadge zone={item.zone} />
                <ExpiryBadge expiresAt={item.expiresAt} />
              </span>
              <button
                onClick={() => removeItem(item.name)}
                className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0 ml-2"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add item form */}
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
            <button onClick={addItem} className="p-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all shrink-0">
              <Plus size={18} />
            </button>
          </div>

          {/* Zone + expiry selectors */}
          <div className="flex gap-2">
            <select
              value={newZone}
              onChange={e => setNewZone(e.target.value)}
              className="flex-1 bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-sm text-slate-300 outline-none focus:border-orange-500/50 transition-all"
            >
              <option value="pantry">🗄️ Pantry</option>
              <option value="fridge">🧊 Fridge</option>
              <option value="freezer">❄️ Freezer</option>
            </select>
            <input
              type="date"
              value={newExpiry}
              onChange={e => setNewExpiry(e.target.value)}
              className="flex-1 bg-slate-800 border border-white/5 rounded-xl px-3 py-2 text-sm outline-none focus:border-orange-500/50 transition-all text-slate-400"
              title="Expiry date (optional)"
            />
          </div>

          {/* Receipt import */}
          {showReceiptImport ? (
            <div className="space-y-2">
              <textarea
                value={receiptText}
                onChange={e => setReceiptText(e.target.value)}
                placeholder="Paste grocery receipt or ingredient list..."
                className="w-full bg-slate-800 border border-white/10 rounded-xl p-3 text-sm text-slate-300 outline-none focus:border-orange-500/50 resize-none h-24 placeholder:text-slate-600"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleReceiptImport}
                  disabled={!receiptText.trim() || isImporting}
                  className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-all disabled:opacity-50"
                >
                  {isImporting ? 'Importing...' : 'Import Items'}
                </button>
                <button onClick={() => { setShowReceiptImport(false); setReceiptText(''); }} className="px-3 py-2 bg-slate-800 text-slate-400 rounded-xl text-sm">Cancel</button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowReceiptImport(true)}
              className="w-full py-2.5 border border-white/5 text-slate-500 rounded-xl text-sm hover:border-white/10 hover:text-slate-400 transition-all"
            >
              Import from receipt / list
            </button>
          )}

          {pantry.length > 0 && (
            <button
              onClick={() => { onAddAll(pantry.map(p => p.name)); onClose(); }}
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
