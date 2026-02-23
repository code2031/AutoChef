import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { generateVariant } from '../lib/groq.js';

const REGIONS = [
  { id: 'mexican', label: 'Mexican', flag: 'MX' },
  { id: 'italian', label: 'Italian', flag: 'IT' },
  { id: 'indian', label: 'Indian', flag: 'IN' },
  { id: 'japanese', label: 'Japanese', flag: 'JP' },
  { id: 'thai', label: 'Thai', flag: 'TH' },
  { id: 'french', label: 'French', flag: 'FR' },
  { id: 'american', label: 'American', flag: 'US' },
  { id: 'mediterranean', label: 'Mediterranean', flag: 'GR' },
];

export default function RegionalVariants({ recipe, onClose }) {
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [result, setResult] = useState(null);

  const handleSelect = async (region) => {
    setSelected(region.id);
    setLoading(true);
    setResult(null);
    try {
      const prompt = 'Adapt the recipe "' + recipe.name + '" into a ' + region.label + ' style version. Keep the same dish concept but use ' + region.label + ' flavors, spices, and techniques. Return the same JSON recipe schema with updated name, ingredients, and instructions.';
      const variant = await generateVariant(prompt);
      setResult(variant);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-[300] flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/70 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[85vh]'>
        <div className='flex items-center justify-between p-5 border-b border-white/5'>
          <div>
            <p className='text-xs text-teal-400 font-bold uppercase tracking-widest'>Regional Variants</p>
            <h3 className='font-bold text-xl mt-0.5'>{recipe.name}</h3>
          </div>
          <button onClick={onClose} className='p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all'>
            <X size={20} />
          </button>
        </div>
        <div className='p-5 space-y-4 overflow-y-auto flex-1'>
          <p className='text-sm text-slate-400'>Select a cuisine style to generate a regional adaptation of this recipe:</p>
          <div className='grid grid-cols-2 gap-2'>
            {REGIONS.map(r => (
              <button
                key={r.id}
                onClick={() => handleSelect(r)}
                disabled={loading}
                className={'flex items-center gap-3 p-3 rounded-xl border text-sm font-medium transition-all disabled:opacity-50 ' + (selected === r.id ? 'bg-teal-500/10 border-teal-500/30 text-teal-300' : 'bg-slate-800/50 border-white/5 text-slate-300 hover:border-white/20')}
              >
                <span className='text-base'>🌍</span>
                {r.label}
                {selected === r.id && loading && <Loader2 size={14} className='animate-spin ml-auto' />}
              </button>
            ))}
          </div>
          {result && (
            <div className='p-4 bg-teal-500/5 border border-teal-500/20 rounded-2xl space-y-3'>
              <p className='font-bold text-teal-300'>{result.name}</p>
              <p className='text-sm text-slate-300 italic'>{result.description}</p>
              {result.ingredients && (
                <div>
                  <p className='text-xs font-bold text-slate-500 uppercase tracking-widest mb-1'>Key Ingredients</p>
                  <ul className='space-y-1'>
                    {result.ingredients.slice(0, 5).map((ing, i) => (
                      <li key={i} className='text-xs text-slate-300 flex gap-2'><span className='text-teal-500'>•</span>{ing}</li>
                    ))}
                    {result.ingredients.length > 5 && <li className='text-xs text-slate-500'>+{result.ingredients.length - 5} more...</li>}
                  </ul>
                </div>
              )}
              {result.chefTip && <p className='text-xs text-slate-400 italic'>{result.chefTip}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}