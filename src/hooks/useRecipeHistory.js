import { useLocalStorage } from './useLocalStorage.js';

export function useRecipeHistory() {
  const [history, setHistory] = useLocalStorage('recipe_history', []);
  const [collections, setCollections] = useLocalStorage('recipe_collections', []);

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
      versions: [],
      collectionId: null,
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

  // Save old version before updating recipe in-place (for variant/similar flows)
  const updateRecipeWithVersion = (id, newRecipe, newImageUrl) => {
    setHistory(prev => prev.map(entry => {
      if (entry.id !== id) return entry;
      const oldVersion = { recipe: entry.recipe, imageUrl: entry.imageUrl, savedAt: entry.savedAt };
      const versions = [...(entry.versions || []), oldVersion];
      return { ...entry, recipe: newRecipe, imageUrl: newImageUrl || entry.imageUrl, savedAt: new Date().toISOString(), versions };
    }));
  };

  // Collections
  const createCollection = (name) => {
    if (!name.trim()) return null;
    const id = Date.now();
    setCollections(prev => [...prev, { id, name: name.trim() }]);
    return id;
  };

  const deleteCollection = (id) => {
    setCollections(prev => prev.filter(c => c.id !== id));
    setHistory(prev => prev.map(e => e.collectionId === id ? { ...e, collectionId: null } : e));
  };

  const setEntryCollection = (entryId, collectionId) => {
    setHistory(prev => prev.map(e => e.id === entryId ? { ...e, collectionId } : e));
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
    updateRecipeWithVersion,
    collections,
    createCollection,
    deleteCollection,
    setEntryCollection,
  };
}
