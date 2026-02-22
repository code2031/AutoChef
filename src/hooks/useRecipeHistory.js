import { useLocalStorage } from './useLocalStorage.js';

export function useRecipeHistory() {
  const [history, setHistory] = useLocalStorage('recipe_history', []);

  const saveRecipe = (recipe, imageUrl, ingredients) => {
    const id = Date.now();
    const entry = {
      id,
      savedAt: new Date().toISOString(),
      recipe,
      imageUrl,
      ingredients,
      isFavourite: false,
      rating: null,
      tags: [],
      notes: '',
    };
    setHistory(prev => [entry, ...prev].slice(0, 50));
    return id;
  };

  const toggleFavourite = (id) => {
    setHistory(prev =>
      prev.map(entry => entry.id === id ? { ...entry, isFavourite: !entry.isFavourite } : entry)
    );
  };

  const setRating = (id, rating) => {
    setHistory(prev =>
      prev.map(entry => entry.id === id ? { ...entry, rating } : entry)
    );
  };

  const deleteEntry = (id) => {
    setHistory(prev => prev.filter(entry => entry.id !== id));
  };

  const addTag = (id, tag) => {
    const clean = tag.trim().toLowerCase();
    if (!clean) return;
    setHistory(prev =>
      prev.map(entry =>
        entry.id === id && !(entry.tags || []).includes(clean)
          ? { ...entry, tags: [...(entry.tags || []), clean] }
          : entry
      )
    );
  };

  const removeTag = (id, tag) => {
    setHistory(prev =>
      prev.map(entry =>
        entry.id === id
          ? { ...entry, tags: (entry.tags || []).filter(t => t !== tag) }
          : entry
      )
    );
  };

  const setNotes = (id, notes) => {
    setHistory(prev =>
      prev.map(entry => entry.id === id ? { ...entry, notes } : entry)
    );
  };

  const isDuplicate = (recipeName) => {
    const name = recipeName.toLowerCase().trim();
    return history.some(e => e.recipe.name.toLowerCase().trim() === name);
  };

  const favourites = history.filter(e => e.isFavourite);
  const totalLikes = history.filter(e => e.rating === 'up').length;
  const totalDislikes = history.filter(e => e.rating === 'down').length;

  return {
    history,
    favourites,
    totalLikes,
    totalDislikes,
    saveRecipe,
    toggleFavourite,
    setRating,
    deleteEntry,
    addTag,
    removeTag,
    setNotes,
    isDuplicate,
  };
}
