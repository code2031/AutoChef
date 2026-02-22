import React, { useEffect, useRef, useState } from 'react';
import { Flame, BookOpen, Timer, Sparkles, Image as ImageIcon, Loader2, ChefHat, Copy, Download, Check, Play, Pause, ShoppingCart, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import StatsBar from './StatsBar.jsx';
import RecipeActions from './RecipeActions.jsx';
import CookingMode from './CookingMode.jsx';
import FlavorRadar from './FlavorRadar.jsx';

function detectTimerSeconds(step) {
  const patterns = [
    /for\s+(\d+)-(\d+)\s+min/i,
    /for\s+(\d+)\s+min/i,
    /(\d+)-(\d+)\s+minutes?/i,
    /(\d+)\s+minutes?/i,
    /(\d+)\s+hour/i,
  ];
  for (const p of patterns) {
    const m = step.match(p);
    if (m) {
      const mins = parseInt(m[2] || m[1]);
      return (p.source.includes('hour') ? mins * 60 : mins) * 60;
    }
  }
  return null;
}

function InlineTimer({ seconds }) {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { clearInterval(intervalRef.current); setRunning(false); return 0; }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <span
      onClick={() => setRunning(v => !v)}
      className={`inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-lg text-xs font-mono cursor-pointer transition-all select-none ${running ? 'bg-orange-500/20 text-orange-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
    >
      {running ? <Pause size={10} /> : <Play size={10} />}
      {fmt(timeLeft)}
    </span>
  );
}

// Technique glossary
const TECHNIQUES = {
  julienne: 'Cut into thin matchstick-shaped strips, usually about 3mm wide.',
  deglaze: 'Add liquid (wine, stock) to a hot pan to loosen the browned bits stuck to the bottom.',
  fold: 'Gently combine ingredients with a spatula using a cut-and-turn motion to preserve air.',
  blanch: 'Briefly boil vegetables then immediately plunge into ice water to stop cooking and set colour.',
  saute: 'Cook quickly in a small amount of hot oil or butter over medium-high heat.',
  braise: 'Brown the food first, then slow-cook in a small amount of liquid in a covered pot.',
  mince: 'Chop into very tiny, fine pieces.',
  sear: 'Cook at high heat for a short time to form a brown crust on the surface.',
  simmer: 'Cook gently just below boiling point — small bubbles rise to the surface.',
  marinate: 'Soak food in a seasoned liquid to add flavour and sometimes tenderise.',
  caramelize: 'Cook sugar or onions slowly until they turn golden-brown and develop sweetness.',
  reduce: 'Boil a liquid to evaporate water, concentrating its flavour and thickening the sauce.',
  render: 'Cook fatty meat (like bacon) slowly to melt out and release the fat.',
  temper: 'Gradually add a hot liquid to eggs to raise their temperature without scrambling them.',
  emulsify: 'Blend two liquids that do not normally mix (like oil and water) into a stable mixture.',
  baste: 'Spoon or brush pan juices, butter, or sauce over food while it cooks to keep it moist.',
  parboil: 'Partially boil food before finishing it with another cooking method.',
  dice: 'Cut into small, uniform cubes — small dice (~6mm), medium (~12mm), large (~20mm).',
  chiffonade: 'Stack leaves, roll tightly, and slice into thin ribbons.',
  zest: 'Grate the outer coloured skin of citrus fruit to collect the fragrant oils.',
  flambé: 'Pour alcohol over food and ignite briefly to burn off the alcohol and add flavour.',
  whisk: 'Beat rapidly with a whisk to incorporate air or combine ingredients smoothly.',
  steep: 'Soak an ingredient in hot liquid (without boiling) to extract its flavour.',
  debone: 'Remove bones from meat, poultry, or fish.',
  score: 'Make shallow cuts in the surface of food to help marinades penetrate or fat render.',
};

function TechniqueWord({ word, definition }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      className="relative inline"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onClick={() => setVisible(v => !v)}
    >
      <span className="underline decoration-dotted decoration-slate-500 cursor-help text-slate-200">{word}</span>
      {visible && (
        <span className="absolute z-30 bottom-full left-0 mb-2 w-56 p-2.5 bg-slate-800 border border-white/10 rounded-xl text-xs text-slate-300 shadow-2xl pointer-events-none leading-relaxed">
          <span className="font-bold text-orange-400 block mb-1">{word}</span>
          {definition}
        </span>
      )}
    </span>
  );
}

function renderStepWithTechniques(text) {
  const parts = [];
  const techKeys = Object.keys(TECHNIQUES);
  // Build a regex that matches any technique word (word boundary)
  const pattern = new RegExp(`\\b(${techKeys.map(t => t.replace(/\s+/g, '\\s+')).join('|')})\\b`, 'gi');

  let lastIndex = 0;
  let match;
  let key = 0;
  const re = new RegExp(pattern.source, 'gi');
  while ((match = re.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{text.slice(lastIndex, match.index)}</span>);
    }
    const found = match[0];
    const defKey = techKeys.find(k => k.toLowerCase() === found.toLowerCase());
    parts.push(<TechniqueWord key={key++} word={found} definition={TECHNIQUES[defKey]} />);
    lastIndex = match.index + found.length;
  }
  if (lastIndex < text.length) parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  return parts.length > 0 ? parts : text;
}

// Shopping list categories
const CATEGORY_KEYWORDS = {
  '🥩 Meat & Fish': ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'shrimp', 'prawn', 'lamb', 'turkey', 'bacon', 'sausage', 'steak', 'mince', 'ground', 'cod', 'tilapia', 'anchovy', 'sardine', 'duck', 'veal', 'ham', 'pepperoni', 'chorizo', 'crab', 'lobster', 'scallop', 'oyster', 'mussel', 'clam'],
  '🥬 Produce': ['onion', 'garlic', 'tomato', 'pepper', 'carrot', 'potato', 'spinach', 'lettuce', 'broccoli', 'celery', 'zucchini', 'eggplant', 'mushroom', 'cucumber', 'avocado', 'lemon', 'lime', 'orange', 'apple', 'banana', 'mango', 'ginger', 'leek', 'shallot', 'asparagus', 'pea', 'corn', 'bean', 'kale', 'cabbage', 'cauliflower', 'artichoke', 'pumpkin', 'squash', 'fennel', 'beet', 'radish', 'turnip'],
  '🧀 Dairy & Eggs': ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg', 'parmesan', 'cheddar', 'mozzarella', 'ricotta', 'feta', 'brie', 'ghee', 'sour cream', 'creme fraiche', 'mascarpone', 'halloumi'],
  '🌿 Herbs & Spices': ['basil', 'oregano', 'thyme', 'rosemary', 'parsley', 'cilantro', 'mint', 'dill', 'sage', 'tarragon', 'chive', 'cumin', 'paprika', 'turmeric', 'cinnamon', 'coriander', 'cardamom', 'clove', 'nutmeg', 'chili', 'cayenne', 'bay leaf', 'saffron', 'sumac', 'zaatar', 'garam masala', 'curry'],
  '🥫 Pantry': ['rice', 'pasta', 'flour', 'oil', 'olive oil', 'vinegar', 'sugar', 'honey', 'soy sauce', 'stock', 'broth', 'coconut milk', 'tomato paste', 'tomato sauce', 'canned', 'lentil', 'chickpea', 'bean', 'bread', 'noodle', 'quinoa', 'oat', 'cornstarch', 'baking', 'yeast', 'salt', 'pepper', 'mustard', 'ketchup', 'mayo', 'tahini', 'miso', 'fish sauce', 'oyster sauce', 'sriracha', 'hot sauce', 'worcestershire', 'bouillon'],
};

function categorizeIngredients(ingredients) {
  const categorized = {};
  const used = new Set();

  Object.entries(CATEGORY_KEYWORDS).forEach(([cat, keywords]) => {
    const matches = ingredients.filter(ing => {
      if (used.has(ing)) return false;
      const lower = ing.toLowerCase();
      return keywords.some(k => lower.includes(k));
    });
    if (matches.length > 0) {
      categorized[cat] = matches;
      matches.forEach(m => used.add(m));
    }
  });

  const other = ingredients.filter(i => !used.has(i));
  if (other.length > 0) categorized['📦 Other'] = other;

  return categorized;
}

function ShoppingListModal({ recipe, onClose }) {
  const [checked, setChecked] = useState({});
  const [copied, setCopied] = useState(false);
  const categories = categorizeIngredients(recipe.ingredients || []);

  const toggle = (ing) => setChecked(prev => ({ ...prev, [ing]: !prev[ing] }));

  const copyList = async () => {
    const lines = Object.entries(categories).flatMap(([cat, ings]) => [
      cat, ...ings.map(i => `  • ${i}`), ''
    ]);
    await navigator.clipboard.writeText(lines.join('\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const total = (recipe.ingredients || []).length;

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-slate-900 border border-white/10 rounded-3xl shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-2">
              <ShoppingCart size={18} className="text-green-400" />
              Shopping List
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">{recipe.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={copyList}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs hover:text-white transition-all"
            >
              {copied ? <Check size={13} className="text-green-400" /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-white transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="overflow-y-auto p-5 space-y-5">
          {Object.entries(categories).map(([cat, ings]) => (
            <div key={cat}>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{cat}</p>
              <div className="space-y-1.5">
                {ings.map(ing => (
                  <label key={ing} className="flex items-start gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={!!checked[ing]}
                      onChange={() => toggle(ing)}
                      className="mt-0.5 accent-orange-500 cursor-pointer"
                    />
                    <span className={`text-sm transition-all ${checked[ing] ? 'line-through text-slate-600' : 'text-slate-300 group-hover:text-white'}`}>
                      {ing}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        {checkedCount > 0 && (
          <div className="px-5 pb-4 text-xs text-slate-500 text-center border-t border-white/5 pt-3">
            {checkedCount} / {total} items checked
          </div>
        )}
      </div>
    </div>
  );
}

function extractMiseTasks(instructions) {
  const tasks = [];
  const verbPatterns = [
    /(?:chop|dice|mince|slice|julienne|grate|peel|shred|crush|pound|grind|zest)\s+[^.,;]{3,50}/gi,
    /(?:preheat|heat)\s+(?:oven|pan|grill|oil|water)[^.,;]{0,40}/gi,
    /(?:wash|rinse|clean|dry|trim|soak)\s+[^.,;]{3,40}/gi,
    /(?:bring\s+[^.;]+?\s+to\s+(?:a\s+)?boil)/gi,
    /(?:drain|thaw|defrost)\s+[^.,;]{3,40}/gi,
  ];
  (instructions || []).forEach(step => {
    verbPatterns.forEach(pattern => {
      pattern.lastIndex = 0;
      const matches = step.match(pattern);
      if (matches) matches.forEach(m => {
        const clean = m.trim();
        if (clean.length < 70 && !tasks.some(t => t.toLowerCase() === clean.toLowerCase())) tasks.push(clean);
      });
    });
  });
  return tasks.slice(0, 10);
}

function MiseTasks({ instructions }) {
  const [checked, setChecked] = useState({});
  const tasks = extractMiseTasks(instructions || []);
  return (
    <div className="flex-1 overflow-y-auto space-y-2">
      {tasks.length === 0 ? (
        <p className="text-slate-500 text-sm py-4 text-center">No specific prep steps detected — you&apos;re good to start!</p>
      ) : (
        tasks.map((task, i) => (
          <label key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={!!checked[i]}
              onChange={() => setChecked(prev => ({ ...prev, [i]: !prev[i] }))}
              className="mt-0.5 accent-orange-500 cursor-pointer"
            />
            <span className={`text-sm transition-all ${checked[i] ? 'line-through text-slate-600' : 'text-slate-300'}`}>{task}</span>
          </label>
        ))
      )}
    </div>
  );
}

export default function ResultView({
  recipe,
  recipeImage,
  isGenerating,
  isGeneratingImage,
  diet,
  isSaved,
  isAutoTagging,
  rating,
  totalLikes,
  totalDislikes,
  showCookingMode,
  setShowCookingMode,
  isRegeneratingImage,
  onSave,
  onRegenerate,
  onRegenerateImage,
  onRate,
  onReset,
  onVariantReady,
  onSimilar,
  onSaveCookingNotes,
  ingredients,
  allergies,
  tempUnit,
  nutritionGoals,
  pairings,
}) {
  const confettiFired = useRef(false);
  const [checked, setChecked] = useState({});
  const [servingMultiplier, setServingMultiplier] = useState(1);
  const [customMultiplier, setCustomMultiplier] = useState('');
  const [copiedIngredients, setCopiedIngredients] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showMise, setShowMise] = useState(false);

  // Fire confetti only on the very first recipe ever (persisted to localStorage)
  useEffect(() => {
    if (recipe && !isGenerating && !isGeneratingImage && !confettiFired.current) {
      confettiFired.current = true;
      if (!localStorage.getItem('confetti_done')) {
        localStorage.setItem('confetti_done', '1');
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.4 },
          colors: ['#f97316', '#ef4444', '#fbbf24', '#ffffff'],
        });
      }
    }
  }, [recipe, isGenerating, isGeneratingImage]);

  // Reset per-recipe UI state when recipe changes
  useEffect(() => {
    confettiFired.current = false;
    setTimeout(() => {
      setChecked({});
      setServingMultiplier(1);
      setCustomMultiplier('');
    }, 0);
  }, [recipe?.name]);

  const toggleCheck = (i) => setChecked(prev => ({ ...prev, [i]: !prev[i] }));

  const effectiveMultiplier = customMultiplier !== '' ? (parseFloat(customMultiplier) || 1) : servingMultiplier;

  const copyIngredients = async () => {
    if (!recipe) return;
    const text = (recipe.ingredients || []).join('\n');
    await navigator.clipboard.writeText(text);
    setCopiedIngredients(true);
    setTimeout(() => setCopiedIngredients(false), 2000);
  };

  const downloadRecipe = () => {
    if (!recipe) return;
    const lines = [
      recipe.name,
      '='.repeat(recipe.name.length),
      '',
      recipe.description,
      '',
      `Time: ${recipe.time} | Difficulty: ${recipe.difficulty} | Calories: ${recipe.calories} | Servings: ${recipe.servings}`,
      '',
      'INGREDIENTS',
      '-----------',
      ...(recipe.ingredients || []).map(i => `• ${i}`),
      '',
      'INSTRUCTIONS',
      '------------',
      ...(recipe.instructions || []).map((s, i) => `${i + 1}. ${s}`),
      '',
      `Chef's Tip: ${recipe.chefTip || ''}`,
      `Smart Sub: ${recipe.smartSub || ''}`,
      `Wine Pairing: ${recipe.winePairing || ''}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recipe.name.replace(/[^a-z0-9]/gi, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Highlight allergen words in an ingredient string
  const highlightAllergens = (text) => {
    if (!allergies || allergies.length === 0) return text;
    const allergenMap = {
      nuts: ['nut', 'almond', 'peanut', 'walnut', 'cashew', 'pecan', 'pistachio', 'hazelnut'],
      dairy: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'whey', 'lactose'],
      eggs: ['egg', 'yolk'],
      shellfish: ['shrimp', 'crab', 'lobster', 'prawn', 'scallop', 'oyster', 'clam'],
      soy: ['soy', 'tofu', 'tempeh', 'miso', 'edamame'],
      gluten: ['wheat', 'flour', 'bread', 'pasta', 'barley', 'rye', 'oat'],
    };
    const lower = text.toLowerCase();
    for (const allergy of allergies) {
      const words = allergenMap[allergy] || [allergy];
      for (const w of words) {
        if (lower.includes(w)) {
          return { text, allergen: allergy };
        }
      }
    }
    return text;
  };

  if (isGenerating) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-6 animate-in fade-in duration-500">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Flame className="text-orange-500 animate-pulse" />
          </div>
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold">Crafting your recipe...</h3>
          <p className="text-slate-400">Creating a masterpiece just for you.</p>
        </div>
      </div>
    );
  }

  if (!recipe) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-16 h-16 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin" />
      </div>
    );
  }

  const multiplierOptions = [0.5, 1, 2, 3];

  return (
    <>
      {showCookingMode && (
        <CookingMode
          recipe={recipe}
          onExit={(notes) => {
            setShowCookingMode(false);
            if (onSaveCookingNotes && notes && Object.keys(notes).length > 0) onSaveCookingNotes(notes);
          }}
        />
      )}

      {showMise && recipe && (
        <div className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-sm flex flex-col p-4 sm:p-6 animate-in fade-in duration-300">
          <div className="max-w-2xl mx-auto w-full flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-xs text-orange-400 font-bold uppercase tracking-widest">Mise en Place</p>
                <h2 className="text-xl sm:text-2xl font-bold mt-1">Prep before you cook</h2>
              </div>
              <button onClick={() => setShowMise(false)} className="p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all">
                <X size={24} />
              </button>
            </div>
            <MiseTasks instructions={recipe.instructions} />
            <button
              onClick={() => { setShowMise(false); setShowCookingMode(true); }}
              className="mt-6 w-full py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl text-lg transition-all"
            >
              Start Cooking →
            </button>
          </div>
        </div>
      )}

      {showShoppingList && (
        <ShoppingListModal recipe={recipe} onClose={() => setShowShoppingList(false)} />
      )}

      <div className="space-y-8 animate-in fade-in duration-700">
        {/* Hero image */}
        <div className="recipe-hero w-full h-48 sm:h-64 md:h-96 rounded-3xl overflow-hidden relative bg-slate-900 border border-white/10">
          {recipeImage && (
            <img
              src={recipeImage}
              alt={recipe.name}
              className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-1000"
            />
          )}
          {isGeneratingImage && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900/90 space-y-4 no-print">
              <div className="text-orange-500 animate-bounce"><ImageIcon size={32} /></div>
              <p className="text-slate-400 font-medium flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Rendering your dish...
              </p>
            </div>
          )}
          {!recipeImage && !isGeneratingImage && (
            <div className="absolute inset-0 flex items-center justify-center no-print">
              <ImageIcon size={48} className="text-slate-700" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent pointer-events-none no-print" />
          <div className="absolute bottom-6 left-6 right-6 no-print">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white drop-shadow-lg">{recipe.name}</h2>
          </div>
        </div>
        {/* Recipe name shown in print */}
        <h2 className="hidden print-only text-3xl font-black text-black">{recipe.name}</h2>

        {/* Actions */}
        <RecipeActions
          recipe={recipe}
          recipeImage={recipeImage}
          isSaved={isSaved}
          isAutoTagging={isAutoTagging}
          rating={rating}
          totalLikes={totalLikes}
          totalDislikes={totalDislikes}
          onSave={onSave}
          onRegenerate={onRegenerate}
          onRegenerateImage={onRegenerateImage}
          onRate={onRate}
          onDownload={downloadRecipe}
          onVariantReady={onVariantReady}
          onSimilar={onSimilar}
          onShoppingList={() => setShowShoppingList(true)}
          isRegeneratingImage={isRegeneratingImage}
        />

        {/* Description */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '100ms' }}>
          <p className="text-slate-300 italic text-lg leading-relaxed">{recipe.description}</p>
          <button
            onClick={() => setShowMise(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20"
          >
            <ChefHat size={16} />
            Start Cooking Mode
          </button>
        </div>

        {/* Stats */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '150ms' }}>
          <StatsBar recipe={recipe} diet={diet} ingredients={ingredients} tempUnit={tempUnit} nutritionGoals={nutritionGoals} />
        </div>

        {/* Flavor radar */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '165ms' }}>
          <FlavorRadar recipe={recipe} />
        </div>

        {/* Recipe grid */}
        <div className="grid md:grid-cols-3 gap-5 md:gap-8">
          {/* Ingredients */}
          <div className="md:col-span-1 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '200ms' }}>
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-2">
                <h4 className="flex items-center gap-2 font-bold text-lg">
                  <BookOpen size={18} className="text-orange-500" />
                  Ingredients
                </h4>
                <div className="flex items-center gap-2">
                  {/* Serving scaler presets */}
                  <div className="flex items-center gap-1">
                    {multiplierOptions.map(m => (
                      <button
                        key={m}
                        onClick={() => { setServingMultiplier(m); setCustomMultiplier(''); }}
                        className={`px-2 py-0.5 rounded text-xs font-bold transition-all ${effectiveMultiplier === m && customMultiplier === '' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:text-white'}`}
                      >
                        {m === 0.5 ? '½x' : `${m}x`}
                      </button>
                    ))}
                    {/* Custom multiplier input */}
                    <input
                      type="number"
                      value={customMultiplier}
                      onChange={e => { setCustomMultiplier(e.target.value); setServingMultiplier(1); }}
                      placeholder="?"
                      className="w-8 bg-slate-800 border border-white/10 rounded text-xs text-center text-slate-300 outline-none focus:border-orange-500/50 py-0.5 hide-arrows"
                      min="0.1"
                      max="20"
                      step="0.5"
                      title="Custom multiplier"
                    />
                  </div>
                  {/* Copy button */}
                  <button
                    onClick={copyIngredients}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-white transition-all"
                    title="Copy ingredients"
                  >
                    {copiedIngredients ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>
              {effectiveMultiplier !== 1 && (
                <p className="text-xs text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-lg">
                  Showing {effectiveMultiplier}x quantities (recipe: {recipe.servings} servings)
                </p>
              )}
              <ul className="space-y-3">
                {(recipe.ingredients || []).map((ing, i) => {
                  const highlighted = highlightAllergens(ing);
                  const isHighlighted = typeof highlighted === 'object';
                  return (
                    <li
                      key={i}
                      onClick={() => toggleCheck(i)}
                      className={`flex gap-2 text-sm cursor-pointer transition-all select-none ${checked[i] ? 'line-through text-slate-600' : 'text-slate-300'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${checked[i] ? 'bg-slate-600' : 'bg-orange-500'}`} />
                      <span>
                        {isHighlighted ? (
                          <>
                            <span className="bg-red-500/20 text-red-300 px-1 rounded">{ing}</span>
                            <span className="ml-1 text-xs text-red-400">({highlighted.allergen})</span>
                          </>
                        ) : ing}
                      </span>
                    </li>
                  );
                })}
              </ul>
              {Object.values(checked).some(Boolean) && (
                <p className="text-xs text-slate-500">
                  {Object.values(checked).filter(Boolean).length} / {(recipe.ingredients || []).length} checked
                </p>
              )}
            </div>

            <div className="bg-orange-500/5 border border-orange-500/20 p-5 rounded-2xl space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-widest text-orange-400">Smart Substitution</h4>
              <p className="text-sm text-slate-300">{recipe.smartSub}</p>
            </div>
          </div>

          {/* Instructions */}
          <div className="md:col-span-2 space-y-5 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '250ms' }}>
            <div className="bg-slate-900 border border-white/5 p-6 rounded-2xl space-y-6">
              <h4 className="flex items-center gap-2 font-bold text-lg border-b border-white/5 pb-2">
                <Timer size={18} className="text-orange-500" />
                Instructions
                <span className="text-xs font-normal text-slate-500 ml-auto">Underlined terms have tips</span>
              </h4>
              <div className="space-y-5">
                {(recipe.instructions || []).map((stepText, i) => {
                  const timerSecs = detectTimerSeconds(stepText);
                  return (
                    <div key={i} className="flex gap-4">
                      <span className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-orange-500 text-sm border border-white/5">
                        {i + 1}
                      </span>
                      <p className="text-slate-300 leading-relaxed pt-1">
                        {renderStepWithTechniques(stepText)}
                        {timerSecs && <InlineTimer key={`${recipe.name}-${i}`} seconds={timerSecs} />}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-5 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '300ms' }}>
              <Sparkles className="text-blue-400 flex-shrink-0 mt-0.5" size={18} />
              <div>
                <h4 className="font-bold text-sm text-blue-400">Chef&apos;s Pro Tip</h4>
                <p className="text-sm text-slate-300 italic">{recipe.chefTip}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pairing suggestions */}
        {pairings && pairings.length > 0 && (
          <div className="p-5 bg-slate-900 border border-white/5 rounded-2xl space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500" style={{ animationDelay: '350ms' }}>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500">Goes Well With</h4>
            <div className="grid sm:grid-cols-3 gap-3">
              {pairings.map((p, i) => (
                <div key={i} className="p-3 bg-slate-800/50 border border-white/5 rounded-xl space-y-1">
                  <span className="text-xs font-bold text-orange-400 uppercase">{p.type}</span>
                  <p className="font-bold text-sm text-white">{p.name}</p>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Back button */}
        <button
          onClick={onReset}
          className="text-slate-500 text-sm hover:text-white transition-colors"
        >
          &larr; Cook something else
        </button>
      </div>
    </>
  );
}
