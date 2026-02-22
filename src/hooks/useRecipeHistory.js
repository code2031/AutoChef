import { useLocalStorage } from './useLocalStorage.js';

export function useRecipeHistory() {
  const [history, setHistory] = useLocalStorage('recipe_history', []);

  const saveRecipe = (recipe, imageUrl, ingredients) => {
    const entry = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      recipe,
      imageUrl,
      ingredients,
      isFavourite: false,
      rating: null,
    };
    setHistory(prev => [entry, ...prev].slice(0, 50));
    return entry.id;
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

  const favourites = history.filter(e => e.isFavourite);

  return { history, favourites, saveRecipe, toggleFavourite, setRating, deleteEntry };
}
