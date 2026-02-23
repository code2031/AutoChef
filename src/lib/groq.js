const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || '';

async function groqFetch(body) {
  if (!GROQ_API_KEY) throw new Error('API Key missing. Ensure GitHub Actions secrets are mapped correctly.');
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`Groq API error: ${response.status}`);
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
