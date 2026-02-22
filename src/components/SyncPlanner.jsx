import React, { useState } from 'react';
import { Plus, X, Clock, ChevronRight } from 'lucide-react';

function parseMinutes(input) {
  const s = String(input).trim();
  const h = s.match(/(\d+)h/i);
  const m = s.match(/(\d+)m/i);
  if (h || m) return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
  const n = parseInt(s);
  return isNaN(n) ? null : n;
}

function fmt12(totalMins) {
  const now = new Date();
  const t = new Date(now.getTime() + totalMins * 60000);
  return t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function SyncPlanner({ onClose }) {
  const [dishes, setDishes] = useState([]);
  const [newName, setNewName] = useState('');
  const [newTime, setNewTime] = useState('');
  const [serveIn, setServeIn] = useState('60'); // minutes from now
  const [addError, setAddError] = useState('');

  const addDish = () => {
    const mins = parseMinutes(newTime);
    if (!newName.trim() || !mins) { setAddError('Enter a dish name and cook time (e.g. 30 or 1h30m)'); return; }
    setAddError('');
    setDishes(prev => [...prev, { id: Date.now(), name: newName.trim(), cookMins: mins }]);
    setNewName('');
    setNewTime('');
  };

  const removeDish = (id) => setDishes(prev => prev.filter(d => d.id !== id));

  const serveInMins = parseMinutes(serveIn) || 60;

  // For each dish, calculate start offset from now
  const schedule = dishes.map(d => ({
    ...d,
    startIn: serveInMins - d.cookMins, // minutes from now to start
  })).sort((a, b) => a.startIn - b.startIn);

  const serveTime = fmt12(serveInMins);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Multi-Dish Sync Planner</h2>
          <p className="text-sm text-slate-400 mt-0.5">Work backwards from your serve time to know when to start each dish</p>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Serve time */}
      <div className="flex items-center gap-3 p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl">
        <Clock size={20} className="text-orange-400 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">I want to serve in</p>
          <p className="text-xs text-slate-500">From right now</p>
        </div>
        <input
          type="number"
          value={serveIn}
          onChange={e => setServeIn(e.target.value)}
          min="1"
          className="w-20 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm text-center outline-none focus:border-orange-500/50"
        />
        <span className="text-sm text-slate-400">min</span>
        <span className="text-sm font-bold text-orange-400 whitespace-nowrap">→ {serveTime}</span>
      </div>

      {/* Add dish */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addDish()}
            placeholder="Dish name (e.g. Roast Chicken)"
            className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-orange-500/50 placeholder:text-slate-600"
          />
          <input
            value={newTime}
            onChange={e => { setNewTime(e.target.value); setAddError(''); }}
            onKeyDown={e => e.key === 'Enter' && addDish()}
            placeholder="Time"
            className="w-24 bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-center outline-none focus:border-orange-500/50 placeholder:text-slate-600"
          />
          <button onClick={addDish} className="p-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-all shrink-0">
            <Plus size={18} />
          </button>
        </div>
        {addError && <p className="text-xs text-red-400">{addError}</p>}
        <p className="text-xs text-slate-600">Time: 30, 45m, 1h30m</p>
      </div>

      {/* Timeline */}
      {schedule.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cooking Timeline</p>
          {schedule.map(d => {
            const isNow = d.startIn <= 0;
            const startTime = fmt12(Math.max(0, d.startIn));
            return (
              <div key={d.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${isNow ? 'bg-orange-500/10 border-orange-500/30' : 'bg-slate-800/60 border-white/5'}`}>
                <div className="shrink-0 text-center">
                  <p className={`text-lg font-bold font-mono ${isNow ? 'text-orange-400' : 'text-white'}`}>{isNow ? 'NOW' : startTime}</p>
                  <p className="text-xs text-slate-500">start</p>
                </div>
                <ChevronRight size={16} className="text-slate-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{d.name}</p>
                  <p className="text-xs text-slate-500">{d.cookMins} min cook time → ready at {serveTime}</p>
                  {d.startIn < 0 && <p className="text-xs text-red-400 mt-0.5">Should have started {Math.abs(Math.round(d.startIn))} min ago!</p>}
                </div>
                <button onClick={() => removeDish(d.id)} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors shrink-0">
                  <X size={14} />
                </button>
              </div>
            );
          })}
          <div className="p-3 bg-green-500/5 border border-green-500/20 rounded-xl text-center">
            <p className="text-sm font-bold text-green-400">Everything ready at {serveTime}</p>
          </div>
        </div>
      )}

      {dishes.length === 0 && (
        <div className="py-8 text-center text-slate-500 text-sm">
          Add dishes above to build your cooking timeline
        </div>
      )}
    </div>
  );
}
