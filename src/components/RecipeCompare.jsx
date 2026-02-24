import React from 'react';
import { X } from 'lucide-react';

function CompareRow({ label, a, b }) {
  const same = a === b;
  return (
    <tr className="border-b border-white/5">
      <td className="py-2.5 px-3 text-xs font-bold text-slate-500 uppercase tracking-wide w-24 shrink-0">{label}</td>
      <td className={`py-2.5 px-3 text-sm ${same ? 'text-slate-300' : 'text-orange-300'}`}>{a || '—'}</td>
      <td className={`py-2.5 px-3 text-sm ${same ? 'text-slate-300' : 'text-orange-300'}`}>{b || '—'}</td>
    </tr>
  );
}

export default function RecipeCompare({ recipeA, recipeB, imageA, imageB, onClose }) {
  const rA = recipeA?.recipe || recipeA;
  const rB = recipeB?.recipe || recipeB;
  const imgA = imageA || recipeA?.imageUrl;
  const imgB = imageB || recipeB?.imageUrl;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center overflow-y-auto p-4">
      <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-4xl my-4 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">📊 Recipe Comparison</p>
            <p className="text-sm text-slate-400 mt-0.5">Side-by-side breakdown</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-px bg-white/5">
          {[[rA, imgA], [rB, imgB]].map(([r, img], i) => (
            <div key={i} className="bg-slate-900 p-4 space-y-2">
              {img && <img src={img} alt={r?.name} className="w-full h-32 object-cover rounded-xl" />}
              <h3 className="font-bold text-white text-sm leading-tight">{r?.name}</h3>
              <p className="text-xs text-slate-400 line-clamp-2">{r?.description}</p>
            </div>
          ))}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <tbody>
              <CompareRow label="Difficulty" a={rA?.difficulty} b={rB?.difficulty} />
              <CompareRow label="Calories" a={rA?.calories ? `${rA.calories}/serving` : null} b={rB?.calories ? `${rB.calories}/serving` : null} />
              <CompareRow label="Prep Time" a={rA?.prepTime} b={rB?.prepTime} />
              <CompareRow label="Cook Time" a={rA?.cookTime} b={rB?.cookTime} />
              <CompareRow label="Total Time" a={rA?.time} b={rB?.time} />
              <CompareRow label="Servings" a={rA?.servings?.toString()} b={rB?.servings?.toString()} />
              <CompareRow label="Protein" a={rA?.nutrition?.protein} b={rB?.nutrition?.protein} />
              <CompareRow label="Carbs" a={rA?.nutrition?.carbs} b={rB?.nutrition?.carbs} />
              <CompareRow label="Fat" a={rA?.nutrition?.fat} b={rB?.nutrition?.fat} />
              <CompareRow label="Wine" a={rA?.winePairing} b={rB?.winePairing} />
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-2 gap-px bg-white/5">
          {[rA, rB].map((r, i) => (
            <div key={i} className="bg-slate-900 p-4">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Ingredients ({(r?.ingredients || []).length})</p>
              <ul className="space-y-1">
                {(r?.ingredients || []).slice(0, 6).map((ing, j) => (
                  <li key={j} className="text-xs text-slate-400 flex gap-1.5">
                    <span className="text-orange-500 shrink-0">·</span>
                    <span className="line-clamp-1">{ing}</span>
                  </li>
                ))}
                {(r?.ingredients || []).length > 6 && (
                  <li className="text-xs text-slate-600">+{(r?.ingredients || []).length - 6} more</li>
                )}
              </ul>
            </div>
          ))}
        </div>

        {(rA?.chefTip || rB?.chefTip) && (
          <div className="grid grid-cols-2 gap-px bg-white/5">
            {[rA, rB].map((r, i) => (
              <div key={i} className="bg-slate-900 p-4">
                {r?.chefTip && (
                  <>
                    <p className="text-xs font-bold text-amber-500 uppercase tracking-wide mb-1">Chef&apos;s Tip</p>
                    <p className="text-xs text-slate-400">{r.chefTip}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="p-4 flex justify-center">
          <button onClick={onClose} className="px-6 py-2.5 bg-slate-800 border border-white/10 text-slate-400 rounded-xl text-sm hover:text-white transition-all">
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
}
