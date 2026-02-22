import React, { useState, useEffect } from 'react';
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
import { scanImageForIngredients, generateRecipe, generateSuggestions } from './lib/groq.js';
import { buildImageUrl } from './lib/pollinations.js';
import { buildRecipePrompt, buildSuggestionsPrompt } from './lib/prompts.js';

export default function App() {
  // View state
  const [view, setView] = useState('landing'); // landing, generate, result, history, suggestions

  // Ephemeral state
  const [ingredients, setIngredients] = useState([]);
  const [recipe, setRecipe] = useState(null);
  const [recipeImage, setRecipeImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isRegeneratingImage, setIsRegeneratingImage] = useState(false);
  const [error, setError] = useState(null);

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

  // Persistent hooks
  const prefs = usePreferences();
  const { history, favourites, totalLikes, totalDislikes, saveRecipe, toggleFavourite, setRating, deleteEntry } = useRecipeHistory();
  const gamification = useGamification();

  // Apply theme
  useEffect(() => {
    document.documentElement.classList.toggle('light-theme', prefs.theme === 'light');
  }, [prefs.theme]);

  // Restore recipe from shared URL hash (#r=<base64>)
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith('#r=')) return;
    try {
      const encoded = hash.slice(3);
      const bytes = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
      const decoded = JSON.parse(new TextDecoder().decode(bytes));
      setRecipe(decoded);
      setView('result');
      setIsGeneratingImage(true);
      setRecipeImage(buildImageUrl(decoded.name, decoded.description));
    } catch {
      // Ignore malformed hash
    }
  }, []);

  // Keyboard shortcut: Cmd/Ctrl+Enter to generate
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
      // Fall through to direct generation if suggestions fail
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
      });

      const result = await generateRecipe(prompt);
      setRecipe(result);
      setIsGenerating(false);

      gamification.recordRecipe(prefs.cuisine, prefs.diet, result.difficulty);
      triggerBadgeCheck();

      // Start image generation
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

  // --- Regenerate ---
  const handleRegenerate = async () => {
    if (!recipe) return;
    setIsRegenerating(true);
    setError(null);
    try {
      const prompt = buildRecipePrompt({
        ingredients,
        diet: prefs.diet,
        vibe: prefs.vibe,
        cuisine: prefs.cuisine,
        allergies: prefs.allergies,
        spice: prefs.spice,
        servings: prefs.servings,
        language: navigator.language,
      });
      const result = await generateRecipe(prompt);
      setRecipe(result);
      setCurrentSavedId(null);
      setCurrentRating(null);
      gamification.recordRecipe(prefs.cuisine, prefs.diet, result.difficulty);
      triggerBadgeCheck();

      setIsGeneratingImage(true);
      setRecipeImage(buildImageUrl(result.name, result.description));
    } catch (err) {
      setError(err.message || 'Regeneration failed. Please try again.');
    } finally {
      setIsRegenerating(false);
    }
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
    if (currentSavedId) return; // already saved
    const id = saveRecipe(recipe, recipeImage, ingredients);
    setCurrentSavedId(id);
    gamification.recordSave();
    triggerBadgeCheck();
  };

  const handleRate = (rating) => {
    setCurrentRating(rating);
    if (currentSavedId) setRating(currentSavedId, rating);
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

  // --- Badge checking ---
  const triggerBadgeCheck = () => {
    // Give state a tick to update before checking
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
    setView('generate');
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500/30 ${prefs.theme === 'light' ? 'light-theme' : ''}`}>
      <Navbar
        view={view}
        setView={setView}
        theme={prefs.theme}
        setTheme={prefs.setTheme}
        points={gamification.points}
        streak={gamification.streak}
        historyCount={history.length}
      />

      {/* Progress bar during generation */}
      <div className="fixed top-[73px] left-0 right-0 z-40">
        <ProgressBar active={isGenerating || isLoadingSuggestions} />
      </div>

      {/* Badge popup */}
      {newBadges.length > 0 && (
        <BadgePopup badges={newBadges} onDismiss={() => setNewBadges([])} />
      )}

      <main className="pt-28 pb-12 px-4 md:px-6 max-w-4xl mx-auto">
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
            isRegenerating={isRegenerating}
            isRegeneratingImage={isRegeneratingImage}
            onSave={handleSave}
            onRegenerate={handleRegenerate}
            onRegenerateImage={handleRegenerateImage}
            onRate={handleRate}
            onReset={reset}
          />
        )}

        {view === 'history' && (
          <RecipeHistory
            history={history}
            favourites={favourites}
            onToggleFavourite={toggleFavourite}
            onDelete={deleteEntry}
            onSelect={handleSelectHistoryEntry}
          />
        )}
      </main>
    </div>
  );
}
