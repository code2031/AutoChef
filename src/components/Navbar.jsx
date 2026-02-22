import React, { useState } from 'react';
import { History, Sun, Moon, Type, Contrast, Keyboard, X, Thermometer } from 'lucide-react';
import logoUrl from '../assets/AutoChef_Logo.png';

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
  view, setView, theme, setTheme, streak, historyCount,
  fontSz, setFontSz, highContrast, setHighContrast, tempUnit, setTempUnit,
}) {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
      <nav className="fixed top-0 w-full z-50 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/80 backdrop-blur-md px-4 md:px-6 py-2 flex justify-between items-center no-print relative overflow-visible">
        {/* Logo: absolute so it doesn't set navbar height; overflows below the slim bar */}
        <img
          src={logoUrl}
          alt="AutoChef"
          className="absolute left-4 md:left-6 top-0 h-40 w-auto cursor-pointer z-10"
          onClick={() => { setView('landing'); window.history.replaceState(null, '', window.location.pathname); }}
        />
        {/* Spacer reserves horizontal room for the logo */}
        <div className="w-44" />

        <div className="flex items-center gap-2">
          {/* Points & Streak */}
          {/* points display removed */}
          {streak >= 2 && (
            <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold">
              🔥 {streak}
            </div>
          )}

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
                <div className="absolute right-0 top-full mt-2 w-56 bg-slate-900 border border-white/10 rounded-2xl p-3 space-y-1 z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
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
