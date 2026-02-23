import React from 'react';
import { X } from 'lucide-react';

const PLATING_TIPS = [
  { title: 'Odd Numbers Rule', tip: 'Plate in groups of 3 or 5 — odd numbers look more natural and dynamic than even numbers.' },
  { title: 'The Clock Method', tip: "Position protein at 6 o'clock, starch at 10 o'clock, and vegetables at 2 o'clock for a classic presentation." },
  { title: 'Height and Layers', tip: 'Add height by stacking or leaning components. A flat plate is boring — give your food dimension.' },
  { title: 'Sauce Smearing', tip: 'Use the back of a spoon to smear sauce across the plate before placing food on top for a chef-style look.' },
  { title: 'Garnish Purposefully', tip: 'Only garnish with ingredients that are in the dish. A sprig of herb used in cooking makes the most sense.' },
  { title: 'Negative Space', tip: 'Leave some of the plate empty. White space draws the eye to the food and makes the plate look professional.' },
  { title: 'Wipe the Rim', tip: 'Always wipe sauce or smudges off the plate rim with a clean cloth before serving.' },
];

export default function PlatingGuide({ recipe, onClose }) {
  return (
    <div className='fixed inset-0 z-[300] flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/70 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl shadow-2xl flex flex-col max-h-[80vh]'>
        <div className='flex items-center justify-between p-5 border-b border-white/5'>
          <div>
            <p className='text-xs text-orange-400 font-bold uppercase tracking-widest'>Plating Guide</p>
            <h3 className='font-bold text-xl mt-0.5'>{recipe.name}</h3>
          </div>
          <button onClick={onClose} className='p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all'>
            <X size={20} />
          </button>
        </div>
        <div className='flex-1 overflow-y-auto p-5 space-y-3'>
          {PLATING_TIPS.map((item, i) => (
            <div key={i} className='p-4 bg-slate-800/50 border border-white/5 rounded-2xl space-y-1'>
              <p className='text-sm font-bold text-orange-400'>{i + 1}. {item.title}</p>
              <p className='text-sm text-slate-300 leading-relaxed'>{item.tip}</p>
            </div>
          ))}
          <div className='p-4 bg-orange-500/5 border border-orange-500/20 rounded-2xl'>
            <p className='text-xs font-bold text-orange-400 uppercase tracking-widest mb-2'>For {recipe.name}</p>
            <p className='text-sm text-slate-300'>Consider the color palette of your dish. If the main components are brown or beige, add a pop of green (herbs, peas) or red (tomato, pepper) to create visual contrast.</p>
          </div>
        </div>
      </div>
    </div>
  );
}