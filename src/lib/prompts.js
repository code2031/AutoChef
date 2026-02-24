import { getSeasonalHint } from './seasonal.js';

export function buildRecipePrompt({
  ingredients, diet, vibe, cuisine, allergies, spice, servings,
  language, mood, leftover, kidFriendly, banned, maxCalories,
  persona, maxTime, gutHealth, rootToStem, customPrompt,
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
  const spiceText = kidFriendly ? 'Spice level: mild (kid-friendly).' : (spice ? `Spice level: ${spice}.` : '');
  const servingsText = servings ? `Servings: ${servings}.` : 'Servings: 2.';
  const moodText = mood ? `Mood/occasion: ${mood}.` : '';
  const leftoverText = leftover
    ? `LEFTOVER MODE: You MUST use every single ingredient listed — this is zero-waste cooking from what's on hand.
Do NOT suggest buying anything new. Every ingredient must appear in the recipe.
Prioritise techniques that transform leftovers (stir-fries, frittatas, grain bowls, soups, fried rice, hash, wraps).
The recipe name should reflect that it is a creative leftover dish.`
    : '';
  const kidText = kidFriendly ? 'This recipe MUST be kid-friendly: mild flavors only, simple techniques, no alcohol, no exotic spices, fun presentation appealing to children.' : '';
  const calorieText = maxCalories ? `Keep calories under ${maxCalories} per serving.` : '';
  const personaInstructions = {
    home: 'Write this recipe like a friendly home cook sharing a family favourite: approachable language, comfort-focused, practical tips.',
    pro: 'Write this recipe like a professional restaurant chef: precise measurements, technical terminology, focus on technique and presentation.',
    street: 'Write this recipe in the spirit of street food: bold flavours, quick techniques, punchy descriptions, emphasis on spice and character.',
    michelin: 'Write this recipe in Michelin fine-dining style: refined techniques, exquisite plating notes, sophisticated flavour pairings, elegant language.',
  };
  const personaText = persona && personaInstructions[persona] ? personaInstructions[persona] : '';
  const maxTimeText = maxTime ? `Total cooking time must be under ${maxTime} minutes. Choose quick techniques (sauté, stir-fry, one-pan) accordingly.` : '';
  const gutHealthText = gutHealth ? 'Prioritise gut-health: include fermented foods (yogurt, kimchi, kefir, miso), prebiotic-rich ingredients (garlic, onion, oats, bananas), and fibre-dense vegetables.' : '';
  const rootToStemText = rootToStem ? 'Zero-waste root-to-stem cooking: use every part of each vegetable — stems, leaves, peels, tops. Minimise food waste. Suggest what to do with scraps.' : '';
  const customText = customPrompt ? customPrompt.trim() : '';

  return `You are AutoChef, a world-class AI culinary assistant.
${personaText}
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
${calorieText}
${maxTimeText}
${gutHealthText}
${rootToStemText}
${customText}
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

export function buildDishPrompt({ dishName, diet, vibe, cuisine, allergies, spice, servings, kidFriendly, banned, maxCalories, persona, maxTime, gutHealth, rootToStem, customPrompt }) {
  const allergyText = allergies && allergies.length > 0
    ? `Strictly avoid these allergens: ${allergies.join(', ')}.`
    : '';
  const bannedText = banned && banned.length > 0
    ? `Do not use these ingredients: ${banned.join(', ')}.`
    : '';
  const cuisineText = cuisine && cuisine !== 'any' ? `Cuisine style: ${cuisine}.` : '';
  const spiceText = kidFriendly ? 'Spice level: mild (kid-friendly).' : (spice ? `Spice level: ${spice}.` : '');
  const kidText = kidFriendly ? 'This recipe MUST be kid-friendly: mild flavors only, simple techniques, no alcohol, no exotic spices, fun presentation appealing to children.' : '';
  const calorieText = maxCalories ? `Keep calories under ${maxCalories} per serving.` : '';
  const personaInstructions = {
    home: 'Write this recipe like a friendly home cook sharing a family favourite: approachable language, comfort-focused, practical tips.',
    pro: 'Write this recipe like a professional restaurant chef: precise measurements, technical terminology, focus on technique and presentation.',
    street: 'Write this recipe in the spirit of street food: bold flavours, quick techniques, punchy descriptions, emphasis on spice and character.',
    michelin: 'Write this recipe in Michelin fine-dining style: refined techniques, exquisite plating notes, sophisticated flavour pairings, elegant language.',
  };
  const personaText = persona && personaInstructions[persona] ? personaInstructions[persona] : '';
  const maxTimeText = maxTime ? `Total cooking time must be under ${maxTime} minutes. Choose quick techniques (sauté, stir-fry, one-pan) accordingly.` : '';
  const gutHealthText = gutHealth ? 'Prioritise gut-health: include fermented foods (yogurt, kimchi, kefir, miso), prebiotic-rich ingredients (garlic, onion, oats, bananas), and fibre-dense vegetables.' : '';
  const rootToStemText = rootToStem ? 'Zero-waste root-to-stem cooking: use every part of each vegetable — stems, leaves, peels, tops. Minimise food waste. Suggest what to do with scraps.' : '';
  const customText = customPrompt ? customPrompt.trim() : '';

  return `You are AutoChef, a world-class AI culinary assistant.
${personaText}
Generate a complete, authentic recipe for: "${dishName}".
Dietary preference: ${diet}.
Cooking vibe: ${vibe}.
${cuisineText}
${allergyText}
${bannedText}
${spiceText}
Servings: ${servings || 2}.
${kidText}
${calorieText}
${maxTimeText}
${gutHealthText}
${rootToStemText}
${customText}

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

export function buildSuggestionsPrompt({ ingredients, diet, vibe, cuisine, kidFriendly, leftover }) {
  const kidNote = kidFriendly ? ' All suggestions must be kid-friendly (mild, simple, fun for children).' : '';
  const leftoverNote = leftover ? ' These are LEFTOVER ingredients — all 3 suggestions must use every ingredient listed, no new purchases.' : '';
  return `You are AutoChef, a world-class AI culinary assistant.
Given these ingredients: ${ingredients.join(', ')}.
Dietary preference: ${diet}. Cooking vibe: ${vibe}. ${cuisine !== 'any' ? `Cuisine: ${cuisine}.` : ''}${kidNote}${leftoverNote}

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

export function buildSimilarPrompt(recipe) {
  return `You are AutoChef, a world-class AI culinary assistant.
Generate a recipe similar in style and cuisine to "${recipe.name}" but with different main ingredients and a different dish name. Same difficulty level (${recipe.difficulty || 'Medium'}). Keep the same general cooking style.

Return a JSON object with this exact structure (no markdown):
{
  "name": "Recipe Name",
  "prepTime": "Prep time e.g. 10 minutes",
  "cookTime": "Cook time e.g. 20 minutes",
  "time": "Total time e.g. 30 minutes",
  "difficulty": "${recipe.difficulty || 'Medium'}",
  "calories": "Estimated per serving",
  "servings": ${recipe.servings || 2},
  "description": "Short mouth-watering description",
  "ingredients": ["item 1 with quantity", "item 2 with quantity"],
  "instructions": ["step 1", "step 2"],
  "nutrition": { "protein": "Xg", "carbs": "Xg", "fat": "Xg", "fiber": "Xg" },
  "winePairing": "A wine or drink suggestion",
  "chefTip": "A pro tip to elevate the dish",
  "smartSub": "One smart ingredient substitution"
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
    easier: 'Simplify this recipe for beginner cooks: reduce the number of steps, replace advanced techniques (julienne, deglaze, temper, etc.) with simpler ones, shorten total time if possible. Keep the dish recognisable and delicious.',
    harder: 'Elevate this recipe for experienced cooks: add advanced techniques (searing, deglazing, emulsifying, reducing sauces), refine presentation, add complexity to flavors. Keep the same core dish.',
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

export function buildRemixPrompt(recipeA, recipeB) {
  return `You are AutoChef. Fuse these two recipes into one creative dish that combines elements of both:

Recipe A: ${recipeA.name} — ${recipeA.description || ''}
Key ingredients A: ${(recipeA.ingredients || []).slice(0, 5).join(', ')}

Recipe B: ${recipeB.name} — ${recipeB.description || ''}
Key ingredients B: ${(recipeB.ingredients || []).slice(0, 5).join(', ')}

Create a NEW fusion recipe that creatively merges both dishes. Give it a clever fusion name. The result should be genuinely interesting, not just a mix of the two names.

Return a JSON object with this exact structure (no markdown):
{
  "name": "Fusion Recipe Name",
  "prepTime": "10 minutes",
  "cookTime": "20 minutes",
  "time": "30 minutes",
  "difficulty": "Medium",
  "calories": "Estimated per serving",
  "servings": 2,
  "description": "Short mouth-watering description of the fusion",
  "ingredients": ["item 1 with quantity"],
  "instructions": ["step 1", "step 2"],
  "nutrition": { "protein": "Xg", "carbs": "Xg", "fat": "Xg", "fiber": "Xg" },
  "winePairing": "A wine or drink suggestion",
  "chefTip": "A pro tip about the fusion",
  "smartSub": "One smart substitution"
}`;
}

export function buildHistoricalPrompt({ dishName, era, diet, allergies, banned, customPrompt }) {
  const allergyText = allergies && allergies.length > 0 ? `Strictly avoid these allergens: ${allergies.join(', ')}.` : '';
  const bannedText = banned && banned.length > 0 ? `Do not use these ingredients: ${banned.join(', ')}.` : '';
  const customText = customPrompt ? customPrompt.trim() : '';
  return `You are AutoChef. Imagine how "${dishName}" would have been cooked in ${era}. Use ingredients, techniques, and cooking methods that were available in that era. The recipe should feel authentic to the historical period.
Dietary preference: ${diet || 'none'}.
${allergyText}
${bannedText}
${customText}

Return a JSON object with this exact structure (no markdown):
{
  "name": "${dishName} (${era} style)",
  "prepTime": "Prep time",
  "cookTime": "Cook time",
  "time": "Total time",
  "difficulty": "Easy/Medium/Hard",
  "calories": "Estimated per serving",
  "servings": 4,
  "description": "A brief description noting the historical context",
  "ingredients": ["period-appropriate item 1 with quantity"],
  "instructions": ["step 1", "step 2"],
  "nutrition": { "protein": "Xg", "carbs": "Xg", "fat": "Xg", "fiber": "Xg" },
  "winePairing": "A period-appropriate drink",
  "chefTip": "A historical fun fact or tip",
  "smartSub": "A modern substitute for a hard-to-find historical ingredient"
}`;
}

export function buildImportPrompt(text) {
  return `Parse the following recipe content (may be copied text, a URL description, or any format) into a structured JSON recipe. Use reasonable estimates for any missing fields.

Content to parse:
${text}

Return ONLY a JSON object (no markdown) with this exact structure:
{
  "name": "Recipe Name",
  "prepTime": "10 minutes",
  "cookTime": "20 minutes",
  "time": "30 minutes",
  "difficulty": "Easy/Medium/Hard",
  "calories": "400 per serving",
  "servings": 2,
  "description": "Short appetizing description",
  "ingredients": ["item 1 with quantity"],
  "instructions": ["step 1", "step 2"],
  "nutrition": { "protein": "20g", "carbs": "30g", "fat": "10g", "fiber": "5g" },
  "winePairing": "A wine or drink suggestion",
  "chefTip": "A pro tip",
  "smartSub": "One smart substitution"
}`;
}

export function buildRestaurantPrompt({ restaurant, dish, diet, allergies, banned, customPrompt }) {
  const allergyText = allergies && allergies.length > 0 ? `Strictly avoid these allergens: ${allergies.join(', ')}.` : '';
  const bannedText = banned && banned.length > 0 ? `Do not use these ingredients: ${banned.join(', ')}.` : '';
  const customText = customPrompt ? customPrompt.trim() : '';
  return `You are AutoChef. Recreate the home-cook version of "${dish}" as served at ${restaurant} (or in the style of that restaurant). Research the likely flavor profile, key techniques, and signature elements of that dish, and create an authentic recreation a home cook can make.
Dietary preference: ${diet || 'none'}.
${allergyText}
${bannedText}
${customText}

Return a JSON object with this exact structure (no markdown):
{
  "name": "${dish} (${restaurant}-style)",
  "prepTime": "Prep time",
  "cookTime": "Cook time",
  "time": "Total time",
  "difficulty": "Easy/Medium/Hard",
  "calories": "Estimated per serving",
  "servings": 2,
  "description": "Brief appetizing description noting it's a home recreation of the restaurant classic",
  "ingredients": ["item 1 with quantity"],
  "instructions": ["step 1", "step 2"],
  "nutrition": { "protein": "Xg", "carbs": "Xg", "fat": "Xg", "fiber": "Xg" },
  "winePairing": "A drink that complements the dish",
  "chefTip": "The key secret to nailing this restaurant-style at home",
  "smartSub": "One smart ingredient substitution"
}`;
}
