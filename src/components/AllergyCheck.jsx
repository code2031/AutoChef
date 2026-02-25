import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useLocalStorage } from '../hooks/useLocalStorage.js';

const ALLERGEN_GROUPS = {
  'Gluten': ['wheat', 'flour', 'bread', 'pasta', 'barley', 'rye', 'oats', 'semolina', 'spelt', 'bulgur', 'farro', 'couscous', 'crouton', 'panko', 'breadcrumb', 'matzo', 'seitan'],
  'Dairy': ['milk', 'cream', 'butter', 'cheese', 'yogurt', 'whey', 'casein', 'lactose', 'ghee', 'kefir', 'ricotta', 'mozzarella', 'parmesan', 'cheddar', 'brie', 'feta', 'gouda'],
  'Eggs': ['egg', 'eggs', 'yolk', 'whites', 'meringue', 'mayo', 'mayonnaise', 'custard', 'aioli'],
  'Nuts': ['almond', 'cashew', 'walnut', 'pecan', 'pistachio', 'macadamia', 'hazelnut', 'brazil nut', 'pine nut', 'chestnut'],
  'Peanuts': ['peanut', 'groundnut', 'peanut butter', 'peanut oil'],
  'Soy': ['soy', 'soybean', 'tofu', 'tempeh', 'miso', 'edamame', 'tamari', 'soy sauce'],
  'Fish': ['fish', 'cod', 'salmon', 'tuna', 'tilapia', 'bass', 'flounder', 'halibut', 'mahi', 'trout', 'anchovy', 'sardine', 'herring'],
  'Shellfish': ['shrimp', 'crab', 'lobster', 'crayfish', 'scallop', 'clam', 'mussel', 'oyster', 'squid', 'prawn'],
  'Sesame': ['sesame', 'tahini', 'sesame oil', 'sesame seed'],
  'Sulfites': ['wine', 'vinegar', 'dried fruit', 'molasses', 'lemon juice', 'lime juice'],
};

export default function AllergyCheck({ ingredients }) {
  const [open, setOpen] = useState(false);
  const [pref_allergies] = useLocalStorage('pref_allergies', []);

  if (!ingredients || ingredients.length === 0) return null;

  const ingText = ingredients.join(' ').toLowerCase();

  const detected = [];
  Object.entries(ALLERGEN_GROUPS).forEach(([allergen, keywords]) => {
    const hits = keywords.filter(kw => ingText.includes(kw));
    if (hits.length > 0) detected.push({ allergen, hits: [...new Set(hits)].slice(0, 3) });
  });

  if (detected.length === 0) return null;

  // Highlight any that match user's allergy prefs
  const userAllergyHits = pref_allergies.filter(a =>
    detected.some(d => d.allergen.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(d.allergen.toLowerCase()))
  );

  const isWarning = userAllergyHits.length > 0;

  return (
    <div className={`rounded-xl border ${isWarning ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800/60 border-white/5'} overflow-hidden`}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-3 text-left"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={14} className={isWarning ? 'text-red-400' : 'text-amber-400'} />
          <span className={`text-xs font-medium ${isWarning ? 'text-red-300' : 'text-amber-300'}`}>
            {isWarning
              ? `⚠️ Contains your allergens: ${userAllergyHits.join(', ')}`
              : `Allergen Info: ${detected.map(d => d.allergen).join(', ')}`
            }
          </span>
        </div>
        {open ? <ChevronUp size={13} className="text-slate-500" /> : <ChevronDown size={13} className="text-slate-500" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {detected.map(({ allergen, hits }) => {
            const isUserAllergen = userAllergyHits.some(a =>
              allergen.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(allergen.toLowerCase())
            );
            return (
              <div key={allergen} className={`flex items-start gap-2 text-xs p-2 rounded-lg ${isUserAllergen ? 'bg-red-500/10' : 'bg-slate-800'}`}>
                <span className={`font-medium w-20 shrink-0 ${isUserAllergen ? 'text-red-400' : 'text-slate-300'}`}>{allergen}</span>
                <span className="text-slate-500">{hits.join(', ')}</span>
              </div>
            );
          })}
          <p className="text-[10px] text-slate-600 pt-1">Always verify labels if you have food allergies.</p>
        </div>
      )}
    </div>
  );
}
