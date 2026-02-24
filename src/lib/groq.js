const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

async function groqFetch(body) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(
    `Groq API error: ${response.status}${!GROQ_API_KEY ? ' — set VITE_GROQ_API_KEY in .env.local' : ''}`
  );
  return response.json();
}

export async function scanImageForIngredients(base64Data) {
  const data = await groqFetch({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Analyze this image of a fridge or pantry. List every edible ingredient you can see clearly. Return ONLY a valid JSON array of strings, like this: ["milk", "eggs", "carrots"]. Do not include markdown formatting or any other text.' },
          { type: 'image_url', image_url: { url: base64Data } },
        ],
      },
    ],
    temperature: 0.1,
  });
  const text = data.choices[0].message.content;
  const cleaned = text.replace(/```json|```/g, '').trim();
  return JSON.parse(cleaned);
}

export async function generateRecipe(promptText) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: promptText }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(data.choices[0].message.content);
}

export async function generateSuggestions(promptText) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: promptText }],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.suggestions || [];
}

export async function generateVariant(promptText) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: promptText }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(data.choices[0].message.content);
}

export async function importRecipe(promptText) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: promptText }],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(data.choices[0].message.content);
}

export async function generatePairingSuggestions(recipeName, recipeDescription) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Suggest 3 complementary dishes (sides, starters, or desserts) that pair perfectly with "${recipeName}". ${recipeDescription ? recipeDescription.slice(0, 150) : ''}\n\nReturn JSON: {"pairings": [{"name": "Dish Name", "type": "side/starter/dessert", "reason": "one sentence why it pairs well"}]}` }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.pairings || [];
}

export async function generateRemix(promptText) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: promptText }],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(data.choices[0].message.content);
}

export async function parseGroceryReceipt(promptText) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: promptText }],
    temperature: 0.2,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.ingredients || [];
}

export async function generateAutoTags(recipe) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Generate 4-5 short descriptive tags for this recipe: "${recipe.name}". ${recipe.description ? recipe.description.slice(0, 100) : ''}. Tags should be lowercase, 1-3 words each, describing cuisine, meal type, dietary profile, cooking method, or occasion (examples: "weeknight", "high-protein", "one-pan", "30-min", "italian", "comfort food").\n\nReturn JSON: {"tags": ["tag1", "tag2", "tag3", "tag4"]}` }],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.tags || [];
}

export async function generateSecretIngredient(recipe) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `For the recipe "${recipe.name}", suggest one surprising secret ingredient that would elevate this dish. Return JSON: {"ingredient": "ingredient name", "reason": "why it works", "howToAdd": "when/how to add it"}` }],
    temperature: 0.9,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(data.choices[0].message.content);
}

export async function generateChefLetter(recipe, persona) {
  const personaDesc = persona === 'michelin' ? 'a Michelin-star chef' : persona === 'pro' ? 'a professional chef' : persona === 'street' ? 'a street food chef' : 'a home cook';
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Write a short personal note (2-4 sentences) from ${personaDesc} about "${recipe.name}". Make it warm and personal, like a note tucked into a recipe card. Return JSON: {"letter": "the note text"}` }],
    temperature: 0.85,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.letter || '';
}

export async function generateRecipeHaiku(recipe) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Write a haiku (3 lines: 5-7-5 syllables) about the recipe "${recipe.name}". Evoke its flavors, textures, or mood. Return JSON: {"haiku": "line1\\nline2\\nline3"}` }],
    temperature: 0.9,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.haiku || '';
}

export async function generateBatchPrep(recipe, servings) {
  const orig = parseInt(recipe.servings) || 4;
  const factor = (parseInt(servings) || 20) / orig;
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Scale the recipe "${recipe.name}" from ${orig} to ${servings} servings (${factor.toFixed(1)}x). Scale ALL ingredient quantities proportionally.\n\nOriginal ingredients:\n${(recipe.ingredients || []).join('\n')}\n\nReturn JSON: {"servings": ${servings}, "ingredients": ["scaled ingredient 1"], "tip": "one practical tip for cooking at this scale"}` }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(data.choices[0].message.content);
}

export async function generateRecipeStory(recipe) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Write a 1-2 sentence origin story or fun cultural fact about "${recipe.name}". Keep it brief, interesting, and accurate. Return JSON: {"story": "the story text"}` }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.story || '';
}

export async function generateCommonMistakes(recipe) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `List 3 common mistakes people make when cooking "${recipe.name}", and how to fix each one.\n\nReturn JSON: {"mistakes": [{"mistake": "what goes wrong", "fix": "how to avoid it"}]}` }],
    temperature: 0.6,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.mistakes || [];
}

export async function generateIngredientPrepTip(ingredient) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Give a practical prep tip for "${ingredient}" in cooking. Include how to prep it and how to store it.\n\nReturn JSON: {"tip": "prep tip (1-2 sentences)", "storage": "storage advice", "shelf_life": "how long it keeps"}` }],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(data.choices[0].message.content);
}

export async function generateIngredientSubs(ingredient, recipeName) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Suggest 3 ingredient substitutions for "${ingredient}" in the recipe "${recipeName}". Return JSON: {"subs": [{"name": "substitute name", "notes": "how to use and any adjustments needed"}]}` }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.subs || [];
}

export async function generateHistoricalRecipe(promptText) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: promptText }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(data.choices[0].message.content);
}

export async function generateFlavorPairings(recipe) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `For the recipe "${recipe.name}" (main ingredients: ${(recipe.ingredients || []).slice(0, 8).join(', ')}), suggest 5 specific ingredients that would be excellent flavor pairings — things that would complement and elevate this dish.\n\nReturn JSON: {"pairings": [{"ingredient": "ingredient name", "flavor": "flavor quality it adds e.g. umami, citrus, smokiness, creaminess", "whyItWorks": "one sentence explanation"}]}` }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.pairings || [];
}

export async function generateSmartRecommendation(historyNames, pantryItems, timeOfDay) {
  const historyText = historyNames.length > 0 ? `Recently cooked: ${historyNames.slice(0, 5).join(', ')}.` : 'No recent cooking history.';
  const pantryText = pantryItems.length > 0 ? `Available pantry/fridge items: ${pantryItems.slice(0, 10).join(', ')}.` : '';
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Recommend exactly one dish to cook right now based on context. ${historyText} ${pantryText} Time of day: ${timeOfDay}. Pick something not recently cooked, practical with available ingredients, appropriate for the time of day. Return JSON: {"dishName": "Dish Name", "reason": "one short sentence why this is perfect right now"}` }],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(data.choices[0].message.content);
}

export async function generateCuisineDeepDive(cuisine) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Give a concise deep dive into ${cuisine} cuisine for a curious home cook. Return JSON: {"description": "2-sentence overview of this cuisine", "keyIngredients": ["up to 8 essential ingredients"], "techniques": ["up to 5 key cooking techniques"], "tipForHome": "one practical tip for recreating this cuisine authentically at home", "funFact": "an interesting historical or cultural fact about this cuisine"}` }],
    temperature: 0.6,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(data.choices[0].message.content);
}

export async function generateStorageTips(recipe) {
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `For the recipe "${recipe.name}", provide practical leftover storage tips for the main components of this dish. Return JSON: {"items": [{"component": "component name", "container": "best container type", "temperature": "fridge/freezer/room temp", "duration": "how long it keeps"}]}. Include 2-4 items covering the main components of the dish.` }],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.items || [];
}

export async function generateWeeklyDigest(recipes) {
  const names = (recipes || []).map(r => r.recipe?.name || '').filter(Boolean);
  if (names.length === 0) {
    return { summary: 'No recipes cooked this week yet. Get cooking!', highlight: '', encouragement: 'Every great chef starts somewhere — try something new this week!' };
  }
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `A home cook made these dishes this week: ${names.join(', ')}. Write a brief weekly cooking digest celebrating their week, noting any interesting variety, themes, or impressive choices. Keep it warm, personal, and fun. Return JSON: {"summary": "2-3 sentence digest text", "highlight": "the most interesting dish name or theme from this week", "encouragement": "short motivational line for cooking next week"}` }],
    temperature: 0.7,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(data.choices[0].message.content);
}

export async function generateMealPrepGuide(meals) {
  const mealList = meals.map(m => `${m.day} ${m.mealType}: ${m.recipeName} (${(m.ingredients || []).slice(0, 5).join(', ')}${(m.ingredients || []).length > 5 ? '...' : ''})`).join('\n');
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `You are a meal prep expert. Given this week's meal plan:\n${mealList}\n\nCreate a practical meal prep guide. Return JSON: {"prepDays": [{"day": "Sunday", "tasks": ["task1", "task2"]}, ...], "makeAheadItems": ["item1", "item2"], "shoppingTip": "one practical shopping tip"}. Include 1-3 prep days with 3-6 tasks each. Focus on what can be done ahead of time to make weekday cooking faster.` }],
    temperature: 0.4,
    response_format: { type: 'json_object' },
  });
  return JSON.parse(data.choices[0].message.content);
}

export async function generateLeftoverIdeas(recipe) {
  const ingList = (recipe.ingredients || []).slice(0, 8).join(', ');
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Given leftovers from "${recipe.name}" (main ingredients: ${ingList}), suggest 3 creative next-day dishes that repurpose these leftovers. Be inventive — transform the original into something new and exciting.\n\nReturn JSON: {"ideas": [{"name": "Dish Name", "description": "1-2 sentence description", "keyTransformation": "how leftovers are repurposed e.g. shredded and used as filling"}]}` }],
    temperature: 0.8,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.ideas || [];
}

export async function generateCookTimeline(recipe) {
  const steps = (recipe.instructions || []).map((s, i) => `Step ${i + 1}: ${s}`).join('\n');
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `Analyze these cooking steps for "${recipe.name}" and create a Gantt-style timeline identifying which steps can happen in parallel (e.g. "while X simmers, chop Y").\n\nSteps:\n${steps}\n\nTotal cook time: ${recipe.cookTime || recipe.time || '30 min'}\n\nReturn JSON: {"steps": [{"stepNumber": 1, "label": "short label (max 20 chars)", "startMinute": 0, "durationMinutes": 5, "isParallel": false}]}. Use isParallel: true for steps that can happen simultaneously with the previous main step. Ensure startMinutes are realistic and non-overlapping for the same lane (main or parallel). All steps combined should cover the full cook time.` }],
    temperature: 0.3,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.steps || [];
}

export async function generateSubstitutionMatrix(recipe, dietaryFilter) {
  const ingList = (recipe.ingredients || []).slice(0, 12);
  const filterClause = dietaryFilter ? ` All substitutions must be ${dietaryFilter}.` : '';
  const data = await groqFetch({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: `For the recipe "${recipe.name}", provide 2 substitution options for each of these ingredients:${filterClause}\n\n${ingList.map((ing, i) => `${i + 1}. ${ing}`).join('\n')}\n\nReturn JSON: {"matrix": [{"original": "ingredient name (as listed)", "subs": [{"name": "substitute", "notes": "brief adjustment note"}]}]}. Return exactly one entry per ingredient listed above.` }],
    temperature: 0.5,
    response_format: { type: 'json_object' },
  });
  const parsed = JSON.parse(data.choices[0].message.content);
  return parsed.matrix || [];
}
