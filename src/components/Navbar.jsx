import React, { useState } from 'react';
import { History, Sun, Moon, Type, Contrast, Keyboard, X, Thermometer, Target, Timer, CalendarDays, UtensilsCrossed } from 'lucide-react';
import logoUrl from '../assets/AutoChef_Logo.png';
import KitchenTimer from './KitchenTimer.jsx';

function KeyboardShortcutsModal({ onClose }) {
  const shortcuts = [
    { key: 'Ctrl/Cmd + Enter', desc: 'Generate recipe (on generate page)' },
    { key: 'Escape', desc: 'Clear ingredient input' },
    { key: '?', desc: 'Open keyboard shortcuts' },
  ];
  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg">Keyboard Shortcuts</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white transition-all"><X size={18} /></button>
        </div>
        <div className="space-y-2">
          {shortcuts.map(s => (
            <div key={s.key} className="flex items-center justify-between gap-4">
              <kbd className="px-3 py-1.5 bg-slate-800 border border-white/10 rounded-lg text-xs font-mono text-slate-300 shrink-0">{s.key}</kbd>
              <span className="text-sm text-slate-400">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Navbar({
  view, setView, theme, setTheme, historyCount,
  fontSz, setFontSz, highContrast, setHighContrast, tempUnit, setTempUnit,
  nutritionGoals, setNutritionGoals,
}) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showGoals, setShowGoals] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  const updateGoal = (key, value) => {
    setNutritionGoals(prev => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/80 backdrop-blur-md px-4 md:px-6 py-2 flex justify-between items-center no-print relative overflow-visible">
        {/* Logo: absolute so it does not set navbar height; overflows below the slim bar */}
        <img
          src={logoUrl}
          alt="AutoChef"
          className="absolute left-3 md:left-6 top-0 h-20 sm:h-28 md:h-40 w-auto cursor-pointer z-10"
          onClick={() => { setView('landing'); window.history.replaceState(null, '', window.location.pathname); }}
        />
        {/* Spacer reserves horizontal room for the logo */}
        <div className="w-24 sm:w-32 md:w-44" />

        <div className="flex items-center gap-2">
          {/* Meal Planner button */}
          <button
            onClick={() => setView('planner')}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${view === 'planner' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            title="Meal Planner"
          >
            <CalendarDays size={16} />
            <span className="hidden md:inline">Planner</span>
          </button>

          {/* Sync Planner button */}
          <button
            onClick={() => setView('sync')}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${view === 'sync' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
            title="Multi-Dish Sync Planner"
          >
            <UtensilsCrossed size={16} />
            <span className="hidden md:inline">Sync</span>
          </button>

          {/* Kitchen Timer button */}
          <div className="relative">
            <button
              onClick={() => setShowTimer(v => !v)}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${showTimer ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              title="Kitchen Timers"
            >
              <Timer size={16} />
              <span className="hidden md:inline">Timer</span>
            </button>
            {showTimer && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowTimer(false)} />
                <div className="absolute right-0 top-full mt-2 z-50">
                  <KitchenTimer onClose={() => setShowTimer(false)} />
                </div>
              </>
            )}
          </div>

          {/* History button */}
          <button
            onClick={() => setView('history')}
            className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${view === 'history' ? 'bg-orange-500/20 text-orange-400' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <History size={16} />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-orange-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                {historyCount > 9 ? '9+' : historyCount}
              </span>
            )}
          </button>

          {/* Settings dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(v => !v)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
              title="Settings"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {showSettings && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowSettings(false)} />
                <div className="absolute right-0 top-full mt-2 w-64 max-w-[calc(100vw-1.5rem)] bg-slate-900 border border-white/10 rounded-2xl p-3 space-y-1 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                  {/* Theme */}
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
                    {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                  </button>

                  {/* High Contrast */}
                  <button
                    onClick={() => setHighContrast(!highContrast)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${highContrast ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <Contrast size={16} />
                    High Contrast {highContrast ? 'On' : 'Off'}
                  </button>

                  {/* Font size */}
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <Type size={16} className="text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-400 flex-1">Font Size</span>
                    {['sm', 'md', 'lg'].map(sz => (
                      <button
                        key={sz}
                        onClick={() => setFontSz(sz)}
                        className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${fontSz === sz ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-white'}`}
                      >
                        {sz.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {/* Temperature unit */}
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <Thermometer size={16} className="text-slate-400 shrink-0" />
                    <span className="text-sm text-slate-400 flex-1">Temp Unit</span>
                    {['C', 'F'].map(u => (
                      <button
                        key={u}
                        onClick={() => setTempUnit(u)}
                        className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${tempUnit === u ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-white'}`}
                      >
                        °{u}
                      </button>
                    ))}
                  </div>

                  <div className="border-t border-white/5 my-1" />

                  {/* Nutrition Goals */}
                  <button
                    onClick={() => setShowGoals(v => !v)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${showGoals ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                  >
                    <Target size={16} />
                    Daily Nutrition Goals
                  </button>

                  {showGoals && nutritionGoals && (
                    <div className="px-3 pb-2 space-y-2">
                      {[
                        { key: 'calories', label: 'Calories', unit: 'kcal' },
                        { key: 'protein', label: 'Protein', unit: 'g' },
                        { key: 'carbs', label: 'Carbs', unit: 'g' },
                        { key: 'fat', label: 'Fat', unit: 'g' },
                      ].map(({ key, label, unit }) => (
                        <div key={key} className="flex items-center gap-2">
                          <span className="text-xs text-slate-500 w-14">{label}</span>
                          <input
                            type="number"
                            value={nutritionGoals[key] || ''}
                            onChange={e => updateGoal(key, e.target.value)}
                            placeholder="—"
                            className="flex-1 bg-slate-800 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-300 outline-none focus:border-orange-500/50 text-center"
                            min="0"
                          />
                          <span className="text-xs text-slate-600 w-6">{unit}</span>
                        </div>
                      ))}
                      <p className="text-xs text-slate-600">Shows vs. recipe in macro bars</p>
                    </div>
                  )}

                  <div className="border-t border-white/5 my-1" />

                  {/* Keyboard shortcuts */}
                  <button
                    onClick={() => { setShowSettings(false); setShowShortcuts(true); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <Keyboard size={16} />
                    Keyboard Shortcuts
                  </button>
                </div>
              </>
            )}
          </div>

          {/* My Kitchen CTA */}
          <button
            onClick={() => setView('generate')}
            className="text-sm font-medium px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-lg shadow-orange-500/20"
          >
            My Kitchen
          </button>
        </div>
      </nav>
    </>
  );
}
