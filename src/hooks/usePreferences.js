import { useLocalStorage } from './useLocalStorage.js';

const getSystemTheme = () => {
  try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch { return 'dark'; }
};

export function usePreferences() {
  const [diet, setDiet] = useLocalStorage('pref_diet', 'none');
  const [vibe, setVibe] = useLocalStorage('pref_vibe', 'quick');
  const [cuisine, setCuisine] = useLocalStorage('pref_cuisine', 'any');
  const [allergies, setAllergies] = useLocalStorage('pref_allergies', []);
  const [spice, setSpice] = useLocalStorage('pref_spice', 'medium');
  const [servings, setServings] = useLocalStorage('pref_servings', 2);
  const [theme, setTheme] = useLocalStorage('pref_theme', getSystemTheme());
  const [fontSz, setFontSz] = useLocalStorage('pref_font_sz', 'md');
  const [highContrast, setHighContrast] = useLocalStorage('pref_high_contrast', false);
  const [tempUnit, setTempUnit] = useLocalStorage('pref_temp_unit', 'C');
  const [banned, setBanned] = useLocalStorage('pref_banned', []);
  const [mood, setMood] = useLocalStorage('pref_mood', '');
  const [leftover, setLeftover] = useLocalStorage('pref_leftover', false);
  const [kidFriendly, setKidFriendly] = useLocalStorage('pref_kid_friendly', false);
  const [servingsMemory, setServingsMemory] = useLocalStorage('pref_servings_memory', {});
  const [maxCalories, setMaxCalories] = useLocalStorage('pref_max_calories', '');
  const [nutritionGoals, setNutritionGoals] = useLocalStorage('pref_nutrition_goals', { calories: '', protein: '', carbs: '', fat: '' });
  const [imageStyle, setImageStyle] = useLocalStorage('pref_image_style', 'plated');
  const [persona, setPersona] = useLocalStorage('pref_persona', '');
  const [maxTime, setMaxTime] = useLocalStorage('pref_max_time', '');
  const [gutHealth, setGutHealth] = useLocalStorage('pref_gut_health', false);
  const [rootToStem, setRootToStem] = useLocalStorage('pref_root_to_stem', false);
  const [customPrompt, setCustomPrompt] = useLocalStorage('pref_custom_prompt', '');
  const [weeklyBudget, setWeeklyBudget] = useLocalStorage('pref_weekly_budget', '');
  // Round 10 generation modes + display prefs
  const [highProtein, setHighProtein] = useLocalStorage('pref_high_protein', false);
  const [budget, setBudget] = useLocalStorage('pref_budget_mode', false);
  const [onePan, setOnePan] = useLocalStorage('pref_one_pan', false);
  const [skillLevel, setSkillLevel] = useLocalStorage('pref_skill_level', '');
  const [reducedMotion, setReducedMotion] = useLocalStorage('pref_reduced_motion', false);

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
    maxCalories, setMaxCalories,
    nutritionGoals, setNutritionGoals,
    imageStyle, setImageStyle,
    persona, setPersona,
    maxTime, setMaxTime,
    gutHealth, setGutHealth,
    rootToStem, setRootToStem,
    customPrompt, setCustomPrompt,
    weeklyBudget, setWeeklyBudget,
    highProtein, setHighProtein,
    budget, setBudget,
    onePan, setOnePan,
    skillLevel, setSkillLevel,
    reducedMotion, setReducedMotion,
  };
}
