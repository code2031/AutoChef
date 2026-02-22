import { getSeasonalHint } from './seasonal.js';

export function buildRecipePrompt({
  ingredients, diet, vibe, cuisine, allergies, spice, servings,
  language, mood, leftover, kidFriendly, banned,
}) {
  const seasonalHint = getSeasonalHint();
  const allergyText = allergies && allergies.length > 0
    ? `Strictly avoid these allergens: ${allergies.join(', ')}.`
    : '';
  const bannedText = banned && banned.length > 0
    ? `Do not use these ingredients: ${banned.join(', ')}.`
    : '';
  const languageInstruction = language && language !== 'en'
    ? `Respond in ${getLanguageName(language)}.`
    : '';
  const cuisineText = cuisine && cuisine !== 'any' ? `Cuisine style: ${cuisine}.` : '';
  const spiceText = spice ? `Spice level: ${spice}.` : '';
  const servingsText = servings ? `Servings: ${servings}.` : 'Servings: 2.';
  const moodText = mood ? `Mood/occasion: ${mood}.` : '';
  const leftoverText = leftover ? 'Focus on using up all the ingredients as leftovers — minimal waste.' : '';
  const kidText = kidFriendly ? 'Make this kid-friendly: mild flavors, simple presentation, no complex techniques.' : '';

  return `You are AutoChef, a world-class AI culinary assistant.
Generate a recipe using ONLY or mostly these ingredients: ${ingredients.join(', ')}.
Dietary preference: ${diet}.
Cooking vibe: ${vibe}.
${cuisineText}
${allergyText}
${bannedText}
${spiceText}
${servingsText}
${moodText}
${leftoverText}
${kidText}
${seasonalHint}
${languageInstruction}

Return a JSON object with this exact structure (no markdown):
{
  "name": "Recipe Name",
  "prepTime": "Prep time e.g. 10 minutes",
  "cookTime": "Cook time e.g. 20 minutes",
  "time": "Total time e.g. 30 minutes",
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

export function buildVariantPrompt(recipe, variantType) {
  if (variantType.startsWith('translate:')) {
    const lang = variantType.split(':')[1];
    return `Translate the following recipe JSON into ${lang}. Keep all field names in English, only translate the string values (name, description, ingredients, instructions, winePairing, chefTip, smartSub). Return the full JSON object:
${JSON.stringify(recipe)}`;
  }
  const variantInstructions = {
    healthier: 'Make this recipe healthier: reduce fat/sugar/calories, swap refined carbs for whole grains, increase vegetables, reduce salt. Keep similar flavors.',
    cheaper: 'Make this recipe more budget-friendly: replace expensive ingredients with cheaper alternatives, simplify where possible. Keep the dish satisfying.',
  };
  return `You are AutoChef. Here is an existing recipe:
${JSON.stringify(recipe)}

${variantInstructions[variantType] || 'Improve this recipe.'}

Return a modified version as a JSON object with the same structure. Only change what is necessary to fulfill the request.`;
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
