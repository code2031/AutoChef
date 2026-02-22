import React from 'react';
import { History, Sun, Moon, Zap } from 'lucide-react';
import logoUrl from '../assets/AutoChef_Logo.png';

export default function Navbar({ view, setView, theme, setTheme, points, streak, historyCount }) {
  return (
    <nav className="fixed top-0 w-full z-50 bg-slate-950/80 dark:bg-slate-950/80 light:bg-white/80 backdrop-blur-md border-b border-white/10 px-4 md:px-6 py-4 flex justify-between items-center no-print">
      <div
        className="flex items-center cursor-pointer"
        onClick={() => setView('landing')}
      >
        <img src={logoUrl} alt="AutoChef" className="h-16 w-auto" />
      </div>

      <div className="flex items-center gap-2">
        {/* Points & Streak */}
        {points > 0 && (
          <div className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
            <Zap size={12} fill="currentColor" />
            {points} pts
          </div>
        )}
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

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* My Kitchen CTA */}
        <button
          onClick={() => setView('generate')}
          className="text-sm font-medium px-4 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white transition-all shadow-lg shadow-orange-500/20"
        >
          My Kitchen
        </button>
      </div>
    </nav>
  );
}
