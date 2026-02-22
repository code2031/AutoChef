import { useLocalStorage } from './useLocalStorage.js';

export function usePreferences() {
  const [diet, setDiet] = useLocalStorage('pref_diet', 'none');
  const [vibe, setVibe] = useLocalStorage('pref_vibe', 'quick');
  const [cuisine, setCuisine] = useLocalStorage('pref_cuisine', 'any');
  const [allergies, setAllergies] = useLocalStorage('pref_allergies', []);
  const [spice, setSpice] = useLocalStorage('pref_spice', 'medium');
  const [servings, setServings] = useLocalStorage('pref_servings', 2);
  const [theme, setTheme] = useLocalStorage('pref_theme', 'dark');
  const [fontSz, setFontSz] = useLocalStorage('pref_font_sz', 'md');
  const [highContrast, setHighContrast] = useLocalStorage('pref_high_contrast', false);
  const [tempUnit, setTempUnit] = useLocalStorage('pref_temp_unit', 'C');
  const [banned, setBanned] = useLocalStorage('pref_banned', []);
  const [mood, setMood] = useLocalStorage('pref_mood', '');
  const [leftover, setLeftover] = useLocalStorage('pref_leftover', false);
  const [kidFriendly, setKidFriendly] = useLocalStorage('pref_kid_friendly', false);
  const [servingsMemory, setServingsMemory] = useLocalStorage('pref_servings_memory', {});

  const toggleAllergy = (allergy) => {
    setAllergies(prev =>
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  const toggleBanned = (item) => {
    setBanned(prev =>
      prev.includes(item) ? prev.filter(b => b !== item) : [...prev, item]
    );
  };

  const rememberServingsForCuisine = (cuisineName, srv) => {
    setServingsMemory(prev => ({ ...prev, [cuisineName]: srv }));
  };

  const recalledServings = (cuisineName) => servingsMemory[cuisineName] || null;

  return {
    diet, setDiet,
    vibe, setVibe,
    cuisine, setCuisine,
    allergies, setAllergies, toggleAllergy,
    spice, setSpice,
    servings, setServings,
    theme, setTheme,
    fontSz, setFontSz,
    highContrast, setHighContrast,
    tempUnit, setTempUnit,
    banned, setBanned, toggleBanned,
    mood, setMood,
    leftover, setLeftover,
    kidFriendly, setKidFriendly,
    servingsMemory, rememberServingsForCuisine, recalledServings,
  };
}
