import React from 'react';
import { X } from 'lucide-react';

const CUT_DATA = {
  julienne: {
    description: 'Thin matchstick strips, about 3mm wide. Used for stir-fries and salads.',
    steps: ['Square off the vegetable', 'Slice into 3mm planks', 'Stack planks, cut into 3mm strips'],
    tip: 'Keep strips uniform so they cook evenly.',
  },
  brunoise: {
    description: 'Very small uniform cubes (3mm). The finest dice cut.',
    steps: ['Create julienne strips', 'Rotate 90 degrees', 'Cut across strips at 3mm intervals'],
    tip: 'Brunoise is just julienne cut again crosswise.',
  },
  chiffonade: {
    description: 'Thin ribbon strips from leafy herbs or greens.',
    steps: ['Stack leaves neatly', 'Roll tightly like a cigar', 'Slice across thinly'],
    tip: 'Use immediately — chiffonade wilts quickly.',
  },
  dice: {
    description: 'Uniform cubes: small ~6mm, medium ~12mm, large ~20mm.',
    steps: ['Cut into planks', 'Stack and cut into sticks', 'Cut sticks into cubes'],
    tip: 'Consistent size ensures even cooking.',
  },
  mince: {
    description: 'Very fine irregular pieces. Used for garlic, ginger, herbs.',
    steps: ['Make rough chops', 'Rock the knife over the pile', 'Repeat until very fine'],
    tip: 'For garlic: crush first with flat of the blade.',
  },
  'bias cut': {
    description: 'Diagonal slices at 45 degrees. Used for scallions and carrots.',
    steps: ['Hold knife at 45 degrees', 'Slice through vegetable', 'Keep cuts even in thickness'],
    tip: 'More surface area = better browning.',
  },
};

export default function KnifeCutsGuide({ cut, onClose }) {
  const key = (cut || '').toLowerCase();
  const data = CUT_DATA[key] || CUT_DATA.dice;
  const cutName = cut || 'dice';
  return (
    <div className='fixed inset-0 z-[300] flex items-center justify-center p-4'>
      <div className='absolute inset-0 bg-black/70 backdrop-blur-sm' onClick={onClose} />
      <div className='relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl p-6 space-y-4'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-xs text-orange-400 font-bold uppercase tracking-widest'>Knife Cut Guide</p>
            <h3 className='font-bold text-xl capitalize mt-0.5'>{cutName}</h3>
          </div>
          <button onClick={onClose} className='p-2 rounded-xl hover:bg-white/5 text-slate-400 transition-all'>
            <X size={20} />
          </button>
        </div>
        <p className='text-sm text-slate-300 leading-relaxed'>{data.description}</p>
        <div>
          <p className='text-xs font-bold text-slate-500 uppercase tracking-widest mb-2'>Steps</p>
          <ol className='space-y-1.5'>
            {data.steps.map((step, i) => (
              <li key={i} className='flex gap-3 text-sm text-slate-300'>
                <span className='flex-shrink-0 w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold'>{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
        <div className='p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl'>
          <p className='text-xs text-blue-400 font-bold'>Tip</p>
          <p className='text-sm text-slate-300 mt-0.5'>{data.tip}</p>
        </div>
      </div>
    </div>
  );
}