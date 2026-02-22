import { getSeasonalHint } from './seasonal.js';

export function buildRecipePrompt({ ingredients, diet, vibe, cuisine, allergies, spice, servings, language }) {
  const seasonalHint = getSeasonalHint();
  const allergyText = allergies && allergies.length > 0
    ? `Strictly avoid these allergens: ${allergies.join(', ')}.`
    : '';
  const languageInstruction = language && language !== 'en'
    ? `Respond in ${getLanguageName(language)}.`
    : '';
  const cuisineText = cuisine && cuisine !== 'any' ? `Cuisine style: ${cuisine}.` : '';
  const spiceText = spice ? `Spice level: ${spice}.` : '';
  const servingsText = servings ? `Servings: ${servings}.` : 'Servings: 2.';

  return `You are AutoChef, a world-class AI culinary assistant.
Generate a recipe using ONLY or mostly these ingredients: ${ingredients.join(', ')}.
Dietary preference: ${diet}.
Cooking vibe: ${vibe}.
${cuisineText}
${allergyText}
${spiceText}
${servingsText}
${seasonalHint}
${languageInstruction}

Return a JSON object with this exact structure (no markdown):
{
  "name": "Recipe Name",
  "time": "Total time e.g. 25 minutes",
  "difficulty": "Easy/Medium/Hard",
  "calories": "Estimated per serving",
  "servings": ${servings || 2},
  "description": "Short mouth-watering description",
  "ingredients": ["item 1 with quantity", "item 2 with quantity"],
  "instructions": ["step 1", "step 2"],
  "nutrition": { "protein": "Xg", "carbs": "Xg", "fat": "Xg", "fiber": "Xg" },
  "winePairing": "A wine or drink suggestion",
  "chefTip": "A pro tip to elevate the dish",
  "smartSub": "One smart ingredient substitution"
}`;
}

export function buildSuggestionsPrompt({ ingredients, diet, vibe, cuisine }) {
  return `You are AutoChef, a world-class AI culinary assistant.
Given these ingredients: ${ingredients.join(', ')}.
Dietary preference: ${diet}. Cooking vibe: ${vibe}. ${cuisine !== 'any' ? `Cuisine: ${cuisine}.` : ''}

Suggest exactly 3 distinct recipe names with one-line descriptions.
Return a JSON object (no markdown):
{
  "suggestions": [
    { "name": "Recipe Name 1", "description": "One-line description" },
    { "name": "Recipe Name 2", "description": "One-line description" },
    { "name": "Recipe Name 3", "description": "One-line description" }
  ]
}`;
}

function getLanguageName(langCode) {
  const map = {
    'es': 'Spanish', 'fr': 'French', 'de': 'German', 'it': 'Italian',
    'pt': 'Portuguese', 'ja': 'Japanese', 'ko': 'Korean', 'zh': 'Chinese',
    'hi': 'Hindi', 'ar': 'Arabic',
  };
  const code = langCode.split('-')[0];
  return map[code] || 'English';
}
