import React, { useRef, useState } from 'react';
import { Zap, ShoppingBag, Shuffle, X, Ban, UtensilsCrossed, ListOrdered, Dices, FileText } from 'lucide-react';
import IngredientInput from './IngredientInput.jsx';
import SelectorGroup from './SelectorGroup.jsx';
import PantryDrawer from './PantryDrawer.jsx';
import { getSeasonalIngredients } from '../lib/seasonal.js';
import { getRandomSurpriseIngredients, INGREDIENT_SUGGESTIONS } from '../lib/ingredients.js';

const CUISINE_COLORS = {
  Italian: '#ef4444', Asian: '#f59e0b', Mexican: '#22c55e',
  Indian: '#f97316', French: '#8b5cf6', Mediterranean: '#0ea5e9',
  American: '#3b82f6', Japanese: '#ec4899',
};

const MOOD_OPTIONS = [
  { value: '', label: '— Any —' },
  { value: 'meal prep', label: '📦 Meal Prep' },
  { value: 'birthday', label: '🎂 Birthday' },
  { value: 'late night', label: '🌙 Late Night' },
  { value: 'summer bbq', label: '🔥 Summer BBQ' },
  { value: 'cozy winter', label: '❄️ Cozy Winter' },
  { value: 'dinner party', label: '🥂 Dinner Party' },
  { value: 'quick lunch', label: '⚡ Quick Lunch' },
];

// Ingredient of the week: derived from week number
const INGREDIENT_OF_WEEK = ['truffle', 'saffron', 'miso', 'tahini', 'sumac', 'harissa', 'yuzu', 'gochujang',
  'preserved lemon', 'tamarind', 'shiso', 'pomegranate', 'za\'atar', 'berbere', 'ras el hanout', 'smoked paprika',
  'mirin', 'fish sauce', 'black garlic', 'elderflower', 'rose water', 'cardamom', 'star anise', 'lemongrass',
  'galangal', 'makrut lime', 'wakame', 'bonito', 'dashi', 'white miso', 'mirin', 'ponzu', 'chili crisp'];

function getIngredientOfWeek() {
  const week = Math.floor(Date.now() / (7 * 24 * 3600 * 1000));
  return INGREDIENT_OF_WEEK[week % INGREDIENT_OF_WEEK.length];
}

export default function GenerateView({
  ingredients, setIngredients,
  prefs, onGenerate, onDishGenerate, onLucky, onImport, isGenerating, isScanning, onScan, error,
  recentIngredients,
}) {
  const [mode, setMode] = useState('ingredients'); // 'ingredients' | 'dish' | 'import'
  const [dishInput, setDishInput] = useState('');
  const [importText, setImportText] = useState('');
  const [showPantry, setShowPantry] = useState(false);
  const [showBanned, setShowBanned] = useState(false);
  const [bannedInput, setBannedInput] = useState('');
  const fileInputRef = useRef(null);
  const seasonal = getSeasonalIngredients();

  const {
    diet, setDiet, vibe, setVibe, cuisine, setCuisine,
    allergies, toggleAllergy, spice, setSpice, servings, setServings,
    mood, setMood, leftover, setLeftover, kidFriendly, setKidFriendly,
    banned, toggleBanned, maxCalories, setMaxCalories,
    imageStyle, setImageStyle,
  } = prefs;

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

  const handleSurpriseCuisine = () => {
    const cuisines = ['Italian', 'Asian', 'Mexican', 'Indian', 'French', 'Mediterranean', 'American', 'Japanese'];
    setCuisine(cuisines[Math.floor(Math.random() * cuisines.length)]);
  };

  const addBanned = () => {
    const clean = bannedInput.trim();
    if (clean && !banned.includes(clean)) {
      toggleBanned(clean);
      setBannedInput('');
    }
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
  const moodOptions = MOOD_OPTIONS.map(m => ({ value: m.value, label: m.label }));

  // Cuisine of the day
  const cuisineList = ['Italian', 'Asian', 'Mexican', 'Indian', 'French', 'Mediterranean', 'American', 'Japanese'];
  const cotd = cuisineList[new Date().getDate() % cuisineList.length];
  const ingredientOfWeek = getIngredientOfWeek();

  // Recipe of the Day
  const RECIPE_IDEAS = [
    'Pasta Carbonara','Beef Tacos','Chicken Tikka Masala','Sushi Rolls','French Onion Soup',
    'Pad Thai','Caesar Salad','Beef Bourguignon','Shakshuka','Ramen Bowl','Butter Chicken',
    'Peking Duck','Fish and Chips','Bibimbap','Moussaka','Paella','Pho Bo','Falafel Wrap',
    'Mushroom Risotto','Lamb Kebabs','Enchiladas','Tom Yum Soup','Beef Wellington','Naan Pizza',
    'Korean BBQ Bowl','Greek Salad','Banh Mi','Gnocchi al Pesto','Chicken Schnitzel','Miso Ramen',
  ];
  const rotd = RECIPE_IDEAS[new Date().getDate() % RECIPE_IDEAS.length];

  // Image style options
  const imageStyleOptions = [
    { value: 'plated', label: '🍽️ Plated' },
    { value: 'overhead', label: '📸 Overhead' },
    { value: 'rustic', label: '🪵 Rustic' },
    { value: 'close-up', label: '🔍 Close-up' },
  ];

  const handleDishSubmit = () => {
    const clean = dishInput.trim();
    if (clean && !isGenerating) onDishGenerate(clean);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500" style={accentStyle}>
      {/* Mode tabs */}
      <div className="flex gap-1 bg-slate-900 border border-white/5 rounded-2xl p-1 w-fit">
        <button
          onClick={() => setMode('ingredients')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === 'ingredients' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <ListOrdered size={15} />
          By Ingredients
        </button>
        <button
          onClick={() => setMode('dish')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === 'dish' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <UtensilsCrossed size={15} />
          By Dish Name
        </button>
        <button
          onClick={() => setMode('import')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === 'import' ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white'}`}
        >
          <FileText size={15} />
          Import Recipe
        </button>
      </div>

      {mode === 'dish' ? (
        <div className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold">What would you like to make?</h2>
            <p className="text-slate-400 text-sm">Type any dish name and get a full recipe instantly.</p>
          </div>
          <div className="flex gap-3">
            <input
              value={dishInput}
              onChange={e => setDishInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleDishSubmit()}
              placeholder="e.g. Beef Stroganoff, Tiramisu, Pad Thai..."
              className="flex-1 bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-base outline-none focus:border-orange-500/60 text-white placeholder:text-slate-600 transition-all"
              autoFocus
            />
            <button
              onClick={handleDishSubmit}
              disabled={!dishInput.trim() || isGenerating}
              className={`px-6 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all ${dishInput.trim() && !isGenerating ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-xl shadow-orange-500/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
            >
              <Zap size={18} fill="currentColor" />
              {isGenerating ? 'Generating...' : 'Get Recipe'}
            </button>
          </div>
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}
        </div>
      ) : mode === 'import' ? (
        <div className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-bold">Import any recipe</h2>
            <p className="text-slate-400 text-sm">Paste recipe text, ingredients and instructions, or describe a dish from memory.</p>
          </div>
          <textarea
            value={importText}
            onChange={e => setImportText(e.target.value)}
            placeholder="Paste a recipe here — ingredients, instructions, a URL description, or just describe what you want to make..."
            className="w-full bg-slate-900 border border-white/10 rounded-2xl px-5 py-4 text-sm outline-none focus:border-orange-500/60 text-white placeholder:text-slate-600 transition-all resize-none"
            rows={8}
            autoFocus
          />
          <button
            onClick={() => { if (importText.trim() && !isGenerating) onImport(importText.trim()); }}
            disabled={!importText.trim() || isGenerating}
            className={`w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${importText.trim() && !isGenerating ? 'bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/20' : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
          >
            <FileText size={20} />
            {isGenerating ? 'Importing...' : 'Import & Build Recipe'}
          </button>
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
              {error}
            </div>
          )}
        </div>
      ) : (
      <>
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl sm:text-3xl font-bold">What&apos;s in your pantry?</h2>
          <p className="text-slate-400 text-sm">Type ingredients, scan your fridge, or use Surprise Me.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowBanned(v => !v)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-slate-400 text-sm hover:border-white/20 hover:text-white transition-all shrink-0 ${showBanned ? 'bg-red-500/10 border-red-500/30 text-red-400' : 'bg-slate-900 border-white/5'}`}
            title="Banned ingredients"
          >
            <Ban size={16} />
            <span className="hidden sm:inline">Banned{banned.length > 0 ? ` (${banned.length})` : ''}</span>
          </button>
          <button
            onClick={() => setShowPantry(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 border border-white/5 text-slate-400 text-sm hover:border-white/20 hover:text-white transition-all shrink-0"
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">Pantry</span>
          </button>
        </div>
      </div>

      {/* Banned ingredients panel */}
      {showBanned && (
        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-3 animate-in fade-in duration-200">
          <p className="text-sm font-bold text-red-400">Banned Ingredients (excluded from all recipes)</p>
          <div className="flex flex-wrap gap-2">
            {banned.map(b => (
              <span key={b} className="flex items-center gap-1 px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs">
                {b}
                <X size={12} className="cursor-pointer hover:text-white" onClick={() => toggleBanned(b)} />
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={bannedInput}
              onChange={e => setBannedInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addBanned()}
              placeholder="e.g. cilantro, anchovies..."
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:border-red-500/50 text-slate-300 placeholder:text-slate-600 transition-all"
            />
            <button onClick={addBanned} className="px-4 py-2 bg-red-500/20 border border-red-500/30 text-red-400 rounded-xl text-sm hover:bg-red-500/30 transition-all">
              Add
            </button>
          </div>
        </div>
      )}

      {/* Seasonal + Cuisine of the Day + Ingredient of the Week chips */}
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
          🌟 Cuisine today: {cotd}
        </button>
        <button
          onClick={() => addIngredient(ingredientOfWeek)}
          className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full text-xs hover:bg-purple-500/20 transition-all"
        >
          ✨ Ingredient of the week: {ingredientOfWeek}
        </button>
        <button
          onClick={() => { setDishInput(rotd); setMode('dish'); }}
          className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-full text-xs hover:bg-amber-500/20 transition-all"
        >
          🗓️ Recipe today: {rotd}
        </button>
        <button
          onClick={handleSurpriseCuisine}
          className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-xs hover:bg-blue-500/20 transition-all"
        >
          <Shuffle size={10} className="inline mr-1" />
          Surprise cuisine
        </button>
      </div>

      {/* Recent ingredients */}
      {recentIngredients && recentIngredients.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-slate-500">Recent:</span>
          {recentIngredients.slice(0, 8).map(ing => (
            <button
              key={ing}
              onClick={() => addIngredient(ing)}
              disabled={ingredients.includes(ing)}
              className="px-3 py-1 bg-slate-800 border border-white/5 text-slate-400 rounded-full text-xs hover:border-white/20 hover:text-white disabled:opacity-30 transition-all"
            >
              + {ing}
            </button>
          ))}
        </div>
      )}

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

      <div className="grid md:grid-cols-2 gap-4 sm:gap-5 pt-2">
        <SelectorGroup label="Dietary Needs" options={dietOptions} value={diet} onChange={setDiet} />
        <SelectorGroup label="Cooking Vibe" options={vibeOptions} value={vibe} onChange={setVibe} />
        <SelectorGroup label="Cuisine Style" options={cuisineOptions} value={cuisine} onChange={setCuisine} />
        <SelectorGroup label="Spice Level" options={spiceOptions} value={spice} onChange={setSpice} />
        <SelectorGroup label="Servings" options={servingOptions} value={servings} onChange={setServings} />
        <SelectorGroup label="Mood / Occasion" options={moodOptions} value={mood} onChange={setMood} />

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

        {/* Max Calories filter */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Max Calories / Serving</label>
          <input
            type="number"
            value={maxCalories}
            onChange={e => setMaxCalories(e.target.value)}
            placeholder="e.g. 500 (leave blank for no limit)"
            className="w-full bg-slate-900 border border-white/5 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-500/50 text-slate-300 placeholder:text-slate-600 transition-all"
            min="100"
            max="5000"
          />
        </div>

        <SelectorGroup label="Photo Style" options={imageStyleOptions} value={imageStyle} onChange={setImageStyle} />

        {/* Mode toggles */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Mode</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLeftover(!leftover)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                leftover
                  ? 'bg-green-500/10 border-green-500/40 text-green-400'
                  : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20'
              }`}
            >
              ♻️ Leftover Mode
            </button>
            <button
              onClick={() => setKidFriendly(!kidFriendly)}
              className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
                kidFriendly
                  ? 'bg-yellow-500/10 border-yellow-500/40 text-yellow-400'
                  : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20'
              }`}
            >
              👶 Kid-Friendly
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onGenerate}
          disabled={ingredients.length === 0 || isGenerating}
          className={`flex-1 py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all ${
            ingredients.length > 0 && !isGenerating
              ? 'bg-orange-500 hover:bg-orange-600 shadow-xl shadow-orange-500/20'
              : 'bg-slate-800 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Zap size={20} fill="currentColor" />
          {isGenerating ? 'Generating...' : 'Generate Gourmet Recipe'}
        </button>
        <button
          onClick={onLucky}
          disabled={isGenerating}
          title="Skip suggestions, generate instantly"
          className={`px-5 py-5 rounded-2xl font-bold flex items-center gap-2 transition-all border ${
            !isGenerating
              ? 'bg-slate-900 border-white/10 text-slate-400 hover:border-orange-500/40 hover:text-orange-400'
              : 'bg-slate-800 border-white/5 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Dices size={20} />
          <span className="hidden sm:inline text-sm">I&apos;m Feeling Lucky</span>
        </button>
      </div>

      {showPantry && (
        <PantryDrawer
          onAddAll={(items) => {
            items.forEach(item => addIngredient(item));
          }}
          onClose={() => setShowPantry(false)}
        />
      )}
      </>
      )}
    </div>
  );
}
