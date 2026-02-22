import { useLocalStorage } from './useLocalStorage.js';

export function usePreferences() {
  const [diet, setDiet] = useLocalStorage('pref_diet', 'none');
  const [vibe, setVibe] = useLocalStorage('pref_vibe', 'quick');
  const [cuisine, setCuisine] = useLocalStorage('pref_cuisine', 'any');
  const [allergies, setAllergies] = useLocalStorage('pref_allergies', []);
  const [spice, setSpice] = useLocalStorage('pref_spice', 'medium');
  const [servings, setServings] = useLocalStorage('pref_servings', 2);
  const [theme, setTheme] = useLocalStorage('pref_theme', 'dark');

  const toggleAllergy = (allergy) => {
    setAllergies(prev =>
      prev.includes(allergy) ? prev.filter(a => a !== allergy) : [...prev, allergy]
    );
  };

  return {
    diet, setDiet,
    vibe, setVibe,
    cuisine, setCuisine,
    allergies, setAllergies, toggleAllergy,
    spice, setSpice,
    servings, setServings,
    theme, setTheme,
  };
}
