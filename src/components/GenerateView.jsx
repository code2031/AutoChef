import React, { useRef, useState } from 'react';
import { Zap, ShoppingBag } from 'lucide-react';
import IngredientInput from './IngredientInput.jsx';
import SelectorGroup from './SelectorGroup.jsx';
import PantryDrawer from './PantryDrawer.jsx';
import { getSeasonalIngredients } from '../lib/seasonal.js';
import { getRandomSurpriseIngredients } from '../lib/ingredients.js';

const CUISINE_COLORS = {
  Italian: '#ef4444', Asian: '#f59e0b', Mexican: '#22c55e',
  Indian: '#f97316', French: '#8b5cf6', Mediterranean: '#0ea5e9',
  American: '#3b82f6', Japanese: '#ec4899',
};

export default function GenerateView({
  ingredients, setIngredients,
  prefs, onGenerate, isGenerating, isScanning, onScan, error,
}) {
  const [showPantry, setShowPantry] = useState(false);
  const fileInputRef = useRef(null);
  const seasonal = getSeasonalIngredients();

  const { diet, setDiet, vibe, setVibe, cuisine, setCuisine, allergies, toggleAllergy, spice, setSpice, servings, setServings } = prefs;

  const addIngredient = (name) => {
    const clean = name.trim();
    if (clean && !ingredients.includes(clean)) setIngredients(prev => [...prev, clean]);
  };

  const removeIngredient = (tag) => setIngredients(prev => prev.filter(i => i !== tag));

  const handleSurprise = () => {
    const random = getRandomSurpriseIngredients();
    setIngredients(random);
    if (prefs.onRecordSurprise) prefs.onRecordSurprise();
  };

  const accentColor = CUISINE_COLORS[cuisine] || null;
  const accentStyle = accentColor ? { '--cuisine-accent': accentColor } : {};

  const dietOptions = [
    { value: 'none', label: 'None' },
    { value: 'vegetarian', label: '🌿 Vegetarian' },
    { value: 'vegan', label: '🥦 Vegan' },
    { value: 'keto', label: '🥑 Keto' },
    { value: 'gluten-free', label: '🌾 Gluten-Free' },
  ];

  const vibeOptions = [
    { value: 'quick', label: '⚡ Quick' },
    { value: 'fancy', label: '✨ Fancy' },
    { value: 'healthy', label: '💚 Healthy' },
    { value: 'comfort', label: '🛋️ Comfort' },
  ];

  const cuisineOptions = [
    { value: 'any', label: '🌍 Any' },
    { value: 'Italian', label: '🍕 Italian' },
    { value: 'Asian', label: '🍜 Asian' },
    { value: 'Mexican', label: '🌮 Mexican' },
    { value: 'Indian', label: '🍛 Indian' },
    { value: 'French', label: '🥐 French' },
    { value: 'Mediterranean', label: '🫒 Mediterranean' },
    { value: 'American', label: '🍔 American' },
    { value: 'Japanese', label: '🍣 Japanese' },
  ];

  const allergyOptions = [
    { value: 'nuts', label: '🥜 Nuts' },
    { value: 'dairy', label: '🥛 Dairy' },
    { value: 'eggs', label: '🥚 Eggs' },
    { value: 'shellfish', label: '🦐 Shellfish' },
    { value: 'soy', label: 'Soy' },
    { value: 'gluten', label: '🌾 Gluten' },
  ];

  const spiceOptions = [
    { value: 'mild', label: '😌 Mild' },
    { value: 'medium', label: '🌶️ Medium' },
    { value: 'hot', label: '🔥 Hot' },
  ];

  const servingOptions = [1,2,3,4,6,8].map(n => ({ value: n, label: `${n} ${n === 1 ? 'serving' : 'servings'}` }));

  // Cuisine of the day
  const cuisineList = ['Italian', 'Asian', 'Mexican', 'Indian', 'French', 'Mediterranean', 'American', 'Japanese'];
  const cotd = cuisineList[new Date().getDate() % cuisineList.length];

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={accentStyle}>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold">What's in your pantry?</h2>
          <p className="text-slate-400 text-sm">Type ingredients, scan your fridge, or use Surprise Me.</p>
        </div>
        <button
          onClick={() => setShowPantry(true)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 text-sm hover:border-white/20 hover:text-white transition-all shrink-0"
        >
          <ShoppingBag size={16} />
          <span className="hidden sm:inline">Pantry</span>
        </button>
      </div>

      {/* Seasonal + Cuisine of the Day chips */}
      <div className="flex flex-wrap gap-2">
        <span className="text-xs text-slate-500 self-center">Seasonal:</span>
        {seasonal.ingredients.slice(0, 4).map(ing => (
          <button
            key={ing}
            onClick={() => addIngredient(ing)}
            className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs hover:bg-green-500/20 transition-all"
          >
            + {ing}
          </button>
        ))}
        <button
          onClick={() => setCuisine(cotd)}
          className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-full text-xs hover:bg-orange-500/20 transition-all"
        >
          🌟 Cuisine of the day: {cotd}
        </button>
      </div>

      <IngredientInput
        ingredients={ingredients}
        onAdd={addIngredient}
        onRemove={removeIngredient}
        onReorder={setIngredients}
        onScan={onScan}
        onSurprise={handleSurprise}
        isScanning={isScanning}
        fileInputRef={fileInputRef}
      />

      <div className="grid md:grid-cols-2 gap-5 pt-2">
        <SelectorGroup label="Dietary Needs" options={dietOptions} value={diet} onChange={setDiet} />
        <SelectorGroup label="Cooking Vibe" options={vibeOptions} value={vibe} onChange={setVibe} />
        <SelectorGroup label="Cuisine Style" options={cuisineOptions} value={cuisine} onChange={setCuisine} />
        <SelectorGroup label="Spice Level" options={spiceOptions} value={spice} onChange={setSpice} />
        <SelectorGroup label="Servings" options={servingOptions} value={servings} onChange={setServings} />
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Allergies (avoid)</label>
          <div className="flex flex-wrap gap-2">
            {allergyOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => toggleAllergy(opt.value)}
                className={`px-3 py-2 rounded-xl border text-sm transition-all ${
                  (allergies || []).includes(opt.value)
                    ? 'bg-red-500/10 border-red-500 text-red-400'
                    : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <button
        onClick={onGenerate}
        disabled={ingredients.length === 0 || isGenerating}
        className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
          ingredients.length > 0 && !isGenerating
            ? 'bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/20'
            : 'bg-slate-800 text-slate-600 cursor-not-allowed'
        }`}
      >
        <Zap size={20} fill="currentColor" />
        {isGenerating ? 'Generating...' : 'Generate Gourmet Recipe'}
      </button>

      {showPantry && (
        <PantryDrawer
          onAddAll={(items) => {
            items.forEach(item => addIngredient(item));
          }}
          onClose={() => setShowPantry(false)}
        />
      )}
    </div>
  );
}
