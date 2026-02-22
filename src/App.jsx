import React, { useState, useEffect } from 'react';
import { ArrowUp, Bell } from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import LandingView from './components/LandingView.jsx';
import GenerateView from './components/GenerateView.jsx';
import ResultView from './components/ResultView.jsx';
import RecipeHistory from './components/RecipeHistory.jsx';
import RecipeSuggestions from './components/RecipeSuggestions.jsx';
import ProgressBar from './components/ProgressBar.jsx';
import BadgePopup from './components/BadgePopup.jsx';
import { usePreferences } from './hooks/usePreferences.js';
import { useRecipeHistory } from './hooks/useRecipeHistory.js';
import { useGamification } from './hooks/useGamification.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { scanImageForIngredients, generateRecipe, generateSuggestions } from './lib/groq.js';
import { buildImageUrl } from './lib/pollinations.js';
import { buildRecipePrompt, buildSuggestionsPrompt } from './lib/prompts.js';

export default function App() {
  // View state — start on 'result' immediately if URL carries a recipe
  const [view, setView] = useState(() => {
    const p = new URLSearchParams(window.location.search);
    const h = window.location.hash;
    return (p.has('rc') || p.has('r') || h.startsWith('#rc=') || h.startsWith('#r='))
      ? 'result'
      : 'landing';
  });

  // Ephemeral state
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [recipeImage, setRecipeImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [error, setError] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [dupWarning, setDupWarning] = useState('');

  // Suggestions flow
  const [suggestions, setSuggestions] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // Cooking mode
  const [showCookingMode, setShowCookingMode] = useState(false);

  // Current recipe saved state
  const [currentSavedId, setCurrentSavedId] = useState(null);
  const [currentRating, setCurrentRating] = useState(null);

  // Badge popup
  const [newBadges, setNewBadges] = useState([]);

  // Recent ingredients
  const [recentIngredients, setRecentIngredients] = useLocalStorage('recent_ingredients', []);

  // Persistent hooks
  const prefs = usePreferences();
  const {
    history, favourites, totalLikes, totalDislikes,
    saveRecipe, toggleFavourite, setRating, deleteEntry,
    addTag, removeTag, setNotes, isDuplicate,
  } = useRecipeHistory();
  const gamification = useGamification();

  // Best streak tracking
  const [bestStreak, setBestStreak] = useLocalStorage('game_best_streak', 0);
  useEffect(() => {
    if (gamification.streak > bestStreak) setBestStreak(gamification.streak);
  }, [gamification.streak]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply theme + font size + high contrast
  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', prefs.theme === 'light');
  }, [prefs.theme]);

  useEffect(() => {
    const root = document.getElementById('app-root');
    if (!root) return;
    root.classList.remove('font-sz-sm', 'font-sz-md', 'font-sz-lg');
    root.classList.add(`font-sz-${prefs.fontSz}`);
    root.classList.toggle('high-contrast', prefs.highContrast);
  }, [prefs.fontSz, prefs.highContrast]);

  // Scroll to top button
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Restore recipe from shared URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const qEncoded = params.get('rc') || params.get('r');
    const qCompressed = params.has('rc');
    const hCompressed = hash.startsWith('#rc=');
    const hPlain = hash.startsWith('#r=');
    const encoded = qEncoded ?? (hCompressed ? hash.slice(4) : hPlain ? hash.slice(3) : null);
    const compressed = qEncoded ? qCompressed : hCompressed;
    if (!encoded) return;
    (async () => {
      try {
        const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
        let raw;
        if (compressed) {
          const ds = new DecompressionStream('deflate-raw');
          const writer = ds.writable.getWriter();
          writer.write(bytes);
          writer.close();
          const buf = await new Response(ds.readable).arrayBuffer();
          raw = JSON.parse(new TextDecoder().decode(buf));
        } else {
          raw = JSON.parse(new TextDecoder().decode(bytes));
        }
        const decodedRecipe = raw.r ?? raw;
        const decodedImage = raw.i || null;
        setTimeout(() => {
          setRecipe(decodedRecipe);
          setView('result');
          if (decodedImage) {
            setRecipeImage(decodedImage);
            setIsGeneratingImage(false);
          } else {
            setIsGeneratingImage(true);
            setRecipeImage(buildImageUrl(decodedRecipe.name, decodedRecipe.description));
          }
        }, 0);
      } catch {
        // Ignore malformed URL
      }
    })();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && view === 'generate' && ingredients.length > 0) {
        handleGenerate();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [view, ingredients]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- Image scan ---
  const handleScan = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIsScanning(true);
    setError(null);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const detected = await scanImageForIngredients(reader.result);
        if (Array.isArray(detected)) {
          setIngredients(prev => {
            const unique = detected.filter(i => !prev.includes(i));
            return [...prev, ...unique];
          });
          gamification.recordPhotoScan();
          triggerBadgeCheck();
        }
      } catch (err) {
        setError(err.message || "Couldn't read that photo. Try typing ingredients instead.");
      } finally {
        setIsScanning(false);
        if (e.target) e.target.value = '';
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Suggestions flow ---
  const handleGenerate = async () => {
    if (ingredients.length === 0) {
      setError('Please add or scan some ingredients first.');
      return;
    }
    setError(null);

    // Track recent ingredients
    setRecentIngredients(prev => {
      const merged = [...ingredients, ...prev.filter(i => !ingredients.includes(i))];
      return merged.slice(0, 20);
    });

    setIsLoadingSuggestions(true);
    setSuggestions([]);
    setView('suggestions');

    try {
      const prompt = buildSuggestionsPrompt({
        ingredients,
        diet: prefs.diet,
        vibe: prefs.vibe,
        cuisine: prefs.cuisine,
      });
      const result = await generateSuggestions(prompt);
      setSuggestions(result);
    } catch {
      setSuggestions([]);
      handlePickSuggestion(null);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handlePickSuggestion = async (suggestion) => {
    setView('result');
    setRecipe(null);
    setRecipeImage(null);
    setCurrentSavedId(null);
    setCurrentRating(null);
    setDupWarning('');
    setIsGenerating(true);

    try {
      const prompt = buildRecipePrompt({
        ingredients: suggestion
          ? [`Focus on making: ${suggestion.name} — ${suggestion.description}`, ...ingredients]
          : ingredients,
        diet: prefs.diet,
        vibe: prefs.vibe,
        cuisine: prefs.cuisine,
        allergies: prefs.allergies,
        spice: prefs.spice,
        servings: prefs.servings,
        language: navigator.language,
        mood: prefs.mood,
        leftover: prefs.leftover,
        kidFriendly: prefs.kidFriendly,
        banned: prefs.banned,
      });

      const result = await generateRecipe(prompt);
      setRecipe(result);
      setIsGenerating(false);

      // Duplicate detection
      if (isDuplicate(result.name)) {
        setDupWarning(`You've made "${result.name}" before! Try different ingredients for variety.`);
      }

      // Remember servings for this cuisine
      if (prefs.cuisine && prefs.cuisine !== 'any') {
        prefs.rememberServingsForCuisine(prefs.cuisine, prefs.servings);
      }

      gamification.recordRecipe(prefs.cuisine, prefs.diet, result.difficulty);
      triggerBadgeCheck();

      setIsGeneratingImage(true);
      const imgUrl = buildImageUrl(result.name, result.description);
      setRecipeImage(imgUrl);
    } catch (err) {
      setError(err.message || "The chef's kitchen is backed up. Check your API key and try again.");
      setIsGenerating(false);
      setView('generate');
    }
  };

  const handleSkipSuggestions = () => {
    const random = suggestions[Math.floor(Math.random() * suggestions.length)];
    handlePickSuggestion(random || null);
  };

  const handleRegenerateImage = () => {
    if (!recipe) return;
    setIsRegeneratingImage(true);
    setRecipeImage(null);
    setTimeout(() => {
      setRecipeImage(buildImageUrl(recipe.name, recipe.description));
    }, 100);
  };

  // Track when image finishes loading
  useEffect(() => {
    if (!recipeImage) return;
    const img = new Image();
    img.onload = () => { setIsGeneratingImage(false); setIsRegeneratingImage(false); };
    img.onerror = () => { setIsGeneratingImage(false); setIsRegeneratingImage(false); };
    img.src = recipeImage;
  }, [recipeImage]);

  // --- Save / Favourite ---
  const handleSave = () => {
    if (!recipe) return;
    if (currentSavedId) return;
    const id = saveRecipe(recipe, recipeImage, ingredients);
    setCurrentSavedId(id);
    gamification.recordSave();
    triggerBadgeCheck();
  };

  const handleRate = (rating) => {
    setCurrentRating(rating);
    if (currentSavedId) setRating(currentSavedId, rating);
  };

  // --- Variant (healthier/cheaper/translate) ---
  const handleVariantReady = (variantRecipe) => {
    setRecipe(variantRecipe);
    setCurrentSavedId(null);
    setCurrentRating(null);
    setIsGeneratingImage(true);
    const imgUrl = buildImageUrl(variantRecipe.name, variantRecipe.description);
    setRecipeImage(imgUrl);
  };

  // --- History selection ---
  const handleSelectHistoryEntry = (entry) => {
    setRecipe(entry.recipe);
    setRecipeImage(entry.imageUrl);
    setIngredients(entry.ingredients || []);
    setCurrentSavedId(entry.id);
    setCurrentRating(entry.rating);
    setIsGenerating(false);
    setIsGeneratingImage(false);
    setView('result');
  };

  // --- Cook Tonight notification ---
  const handleCookTonightNotification = async () => {
    if (!('Notification' in window)) return;
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setTimeout(() => {
        new Notification('AutoChef: Time to cook!', {
          body: recipe ? `Cook tonight: ${recipe.name}` : 'Open AutoChef and pick a recipe!',
          icon: '/AutoChef/favicon.png',
        });
      }, 5000); // 5 second demo delay
    }
  };

  // --- Badge checking ---
  const triggerBadgeCheck = () => {
    setTimeout(() => {
      const newlyUnlocked = gamification.checkAndUnlockBadges(gamification.stats, gamification.streak);
      if (newlyUnlocked.length > 0) {
        setNewBadges(newlyUnlocked);
      }
    }, 300);
  };

  const reset = () => {
    setIngredients([]);
    setRecipe(null);
    setRecipeImage(null);
    setCurrentSavedId(null);
    setCurrentRating(null);
    setError(null);
    setDupWarning('');
    setView('generate');
    window.history.replaceState(null, '', window.location.pathname);
  };

  return (
    <div
      id="app-root"
      className={`min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500/30 font-sz-${prefs.fontSz} ${prefs.theme === 'light' ? 'light-theme' : ''} ${prefs.highContrast ? 'high-contrast' : ''}`}
    >
      <Navbar
        view={view}
        setView={setView}
        theme={prefs.theme}
        setTheme={prefs.setTheme}
        historyCount={history.length}
        fontSz={prefs.fontSz}
        setFontSz={prefs.setFontSz}
        highContrast={prefs.highContrast}
        setHighContrast={prefs.setHighContrast}
        tempUnit={prefs.tempUnit}
        setTempUnit={prefs.setTempUnit}
      />

      {/* Progress bar during generation */}
      <div className="fixed top-[73px] left-0 right-0 z-40">
        <ProgressBar active={isGenerating || isLoadingSuggestions} />
      </div>

      {/* Badge popup */}
      {newBadges.length > 0 && (
        <BadgePopup badges={newBadges} onDismiss={() => setNewBadges([])} />
      )}

      {/* Scroll to top button */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="scroll-top-btn fixed bottom-6 right-6 z-40 p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-lg shadow-orange-500/30 transition-all no-print"
          title="Scroll to top"
        >
          <ArrowUp size={20} />
        </button>
      )}

      <main className="pt-24 sm:pt-32 md:pt-44 pb-12 px-4 sm:px-5 md:px-6 max-w-4xl mx-auto">
        {view === 'landing' && <LandingView setView={setView} />}

        {view === 'generate' && (
          <GenerateView
            ingredients={ingredients}
            setIngredients={setIngredients}
            prefs={{ ...prefs, onRecordSurprise: gamification.recordSurprise }}
            onGenerate={handleGenerate}
            isGenerating={isGenerating || isLoadingSuggestions}
            isScanning={isScanning}
            onScan={handleScan}
            error={error}
            recentIngredients={recentIngredients}
          />
        )}

        {view === 'suggestions' && (
          <RecipeSuggestions
            suggestions={suggestions}
            isLoading={isLoadingSuggestions}
            onSelect={handlePickSuggestion}
            onSkip={handleSkipSuggestions}
          />
        )}

        {view === 'result' && (
          <>
            {dupWarning && (
              <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl text-yellow-400 text-sm flex items-center gap-2">
                <span>🔄</span> {dupWarning}
              </div>
            )}
            <ResultView
              recipe={recipe}
              recipeImage={recipeImage}
              isGenerating={isGenerating}
              isGeneratingImage={isGeneratingImage}
              diet={prefs.diet}
              isSaved={!!currentSavedId}
              rating={currentRating}
              totalLikes={totalLikes}
              totalDislikes={totalDislikes}
              showCookingMode={showCookingMode}
              setShowCookingMode={setShowCookingMode}
              isRegeneratingImage={isRegeneratingImage}
              onSave={handleSave}
              onRegenerate={reset}
              onRegenerateImage={handleRegenerateImage}
              onRate={handleRate}
              onReset={reset}
              onVariantReady={handleVariantReady}
              ingredients={ingredients}
              allergies={prefs.allergies}
              tempUnit={prefs.tempUnit}
            />
            {/* Cook Tonight notification button */}
            {recipe && !isGenerating && (
              <button
                onClick={handleCookTonightNotification}
                className="mt-4 flex items-center gap-2 text-xs text-slate-500 hover:text-orange-400 transition-colors no-print"
              >
                <Bell size={13} />
                Remind me to cook this tonight
              </button>
            )}
          </>
        )}

        {view === 'history' && (
          <RecipeHistory
            history={history}
            favourites={favourites}
            onToggleFavourite={toggleFavourite}
            onDelete={deleteEntry}
            onSelect={handleSelectHistoryEntry}
            onAddTag={addTag}
            onRemoveTag={removeTag}
            onSetNotes={setNotes}
            bestStreak={bestStreak}
            currentStreak={gamification.streak}
          />
        )}
      </main>
    </div>
  );
}
