import React, { useState, useRef } from 'react';
import { X, Loader2, Copy, Check } from 'lucide-react';
import { generateSubstitutionMatrix } from '../lib/groq.js';

const FILTERS = [
  { value: null, label: 'All' },
  { value: 'vegan', label: '🌱 Vegan' },
  { value: 'gluten-free', label: '🌾 Gluten-Free' },
  { value: 'dairy-free', label: '🥛 Dairy-Free' },
  { value: 'nut-free', label: '🥜 Nut-Free' },
];

export default function SubstitutionMatrix({ recipe, onClose }) {
  const [activeFilter, setActiveFilter] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const cacheRef = useRef(new Map()); // filter → matrix data
  const [matrix, setMatrix] = useState(null);

  const load = async (filter) => {
    const cacheKey = filter ?? '__all__';
    if (cacheRef.current.has(cacheKey)) {
      setMatrix(cacheRef.current.get(cacheKey));
      return;
    }
    setIsLoading(true);
    setMatrix(null);
    try {
      const result = await generateSubstitutionMatrix(recipe, filter);
      cacheRef.current.set(cacheKey, result);
      setMatrix(result);
    } catch {
      setMatrix([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
    load(filter);
  };

  const handleCopyAll = async () => {
    if (!matrix || matrix.length === 0) return;
    const lines = matrix.map(row => {
      const subs = row.subs.map(s => `${s.name} (${s.notes})`).join('; ');
      return `${row.original}: ${subs}`;
    });
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Auto-load on first render
  React.useEffect(() => {
    load(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="fixed inset-0 z-[250] flex flex-col bg-slate-950/98 backdrop-blur-md animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">
        <div>
          <h2 className="font-bold text-lg flex items-center gap-2">🔄 Substitution Matrix</h2>
          <p className="text-xs text-slate-500 mt-0.5">{recipe.name}</p>
        </div>
        <div className="flex items-center gap-2">
          {matrix && matrix.length > 0 && (
            <button
              onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 border border-white/10 text-slate-400 hover:text-white rounded-xl text-xs transition-all"
            >
              {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy All'}
            </button>
          )}
          <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-white/5 overflow-x-auto shrink-0">
        {FILTERS.map(f => (
          <button
            key={String(f.value)}
            onClick={() => handleFilterClick(f.value)}
            className={`shrink-0 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${activeFilter === f.value ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5">
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 size={28} className="animate-spin text-orange-500" />
            <p className="text-slate-400 text-sm">Building substitution matrix…</p>
          </div>
        )}

        {!isLoading && matrix && matrix.length === 0 && (
          <div className="text-center py-16 text-slate-500">No substitutions found.</div>
        )}

        {!isLoading && matrix && matrix.length > 0 && (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-2 pr-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Original</th>
                    <th className="text-left py-2 pr-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Sub 1</th>
                    <th className="text-left py-2 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Sub 2</th>
                  </tr>
                </thead>
                <tbody>
                  {matrix.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? 'bg-slate-800/20' : ''}>
                      <td className="py-3 pr-4 align-top">
                        <span className="text-slate-300 font-medium">{row.original}</span>
                      </td>
                      {(row.subs || []).slice(0, 2).map((sub, j) => (
                        <td key={j} className="py-3 pr-4 align-top">
                          <span className="text-orange-400 font-semibold block">{sub.name}</span>
                          <span className="text-xs text-slate-500 leading-snug">{sub.notes}</span>
                        </td>
                      ))}
                      {(row.subs || []).length < 2 && <td className="py-3" />}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden space-y-3">
              {matrix.map((row, i) => (
                <div key={i} className="bg-slate-900 border border-white/5 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-semibold text-slate-300">{row.original}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {(row.subs || []).slice(0, 2).map((sub, j) => (
                      <div key={j} className="bg-slate-800/50 rounded-lg p-2.5 space-y-1">
                        <p className="text-xs font-bold text-orange-400">{sub.name}</p>
                        <p className="text-[11px] text-slate-500 leading-snug">{sub.notes}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
