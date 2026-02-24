# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server with HMR (Vite, port 5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint (flat config, eslint.config.js)
```

After any change, verify with `npm run build && npm run lint`.

Playwright E2E tests live in `tests/autochef.spec.js`:

```bash
npx playwright test                         # run all tests
npx playwright test --grep "Recipe Gen"     # run one describe block
npx playwright test tests/autochef.spec.js:271  # run one test by line
npx playwright show-report                  # view last HTML report
```

Tests use `mockGroq(page)` to intercept `**/openai/v1/chat/completions` and return a single `UNIVERSAL_MOCK_RESPONSE` JSON that contains fields for every Groq function (recipe fields, `suggestions[]`, `story`, `mistakes[]`, `haiku`, `letter`, `ingredient`, `variants[]`, etc.) — no routing logic needed. Pollinations and is.gd are also mocked. Run `npx playwright install chromium` once to install the browser.

**Important test gotchas:**
- `groqFetch` in `lib/groq.js` does **not** throw before making the fetch request (even if `VITE_GROQ_API_KEY` is empty) — this allows Playwright to intercept via `page.route()`. The error message on non-OK responses includes a hint about the missing key.
- Playwright `.or()` locator chains resolve to all matching elements and trigger strict-mode violations if >1 matches. Always append `.first()` to any `.or()` chain before `toBeVisible()`. Also use `.first()` when a pantry item text may appear in multiple zone tabs.
- The Navbar has `backdrop-filter` which creates a CSS stacking context — children of the nav are in the nav's stacking context. The `fixed inset-0 z-40` overlay rendered inside the nav (for Timer/Settings dropdowns) is above other nav children (z-auto) within that stacking context, so clicking nav buttons while a dropdown is open may be blocked. Close the dropdown via its overlay div click instead.

Local dev requires a `.env.local` file with `VITE_GROQ_API_KEY`. Pollinations.ai needs no API key. Google Tasks integration optionally uses `VITE_GOOGLE_CLIENT_ID`.

## Architecture

AutoChef is a client-side-only React SPA (no backend). All state is either ephemeral React state in `App.jsx` or persisted to `localStorage` via custom hooks.

### View state machine

`App.jsx` owns a single `view` string that drives all top-level rendering:

```
'landing' → 'generate' → 'suggestions' → 'result'
                ↑                              |
                └──────── reset() ────────────┘
'history'   (accessible from Navbar at any point)
'planner'   (Meal Planner — accessible from Navbar at any point)
'sync'      (Multi-Dish Sync Planner — accessible from Navbar at any point)
'abtest'    (A/B Recipe Test — triggered from GenerateView)
```

There is no router — `view` is just `useState`. The initial value is computed synchronously: if the URL has `?rc=` or `?r=` query params (or legacy `#rc=`/`#r=` hash), the app starts on `'result'` immediately to avoid a landing-page flash when opening a shared recipe link.

### API integrations

All API keys are read from `import.meta.env` — set in `.env.local` locally, and as GitHub repository secrets for CI.

| Integration | File | Model / endpoint |
|---|---|---|
| Groq vision | `lib/groq.js` → `scanImageForIngredients()` | `meta-llama/llama-4-scout-17b-16e-instruct` |
| Groq recipe | `lib/groq.js` → `generateRecipe()` | `llama-3.3-70b-versatile`, `response_format: json_object` |
| Groq suggestions | `lib/groq.js` → `generateSuggestions()` | `llama-3.3-70b-versatile`, `response_format: json_object` |
| Groq variant | `lib/groq.js` → `generateVariant()` | `llama-3.3-70b-versatile`, `response_format: json_object` |
| Groq import | `lib/groq.js` → `importRecipe()` | `llama-3.3-70b-versatile`, low temp (0.2) |
| Groq pairings | `lib/groq.js` → `generatePairingSuggestions()` | `llama-3.3-70b-versatile`, returns `[{name, type, reason}]` |
| Groq auto-tags | `lib/groq.js` → `generateAutoTags()` | `llama-3.3-70b-versatile`, returns `string[]` |
| Groq remix | `lib/groq.js` → `generateRemix()` | `llama-3.3-70b-versatile`, temp 0.8, returns full recipe JSON |
| Groq receipt | `lib/groq.js` → `parseGroceryReceipt()` | `llama-3.3-70b-versatile`, low temp (0.2), returns `string[]` |
| Groq on-demand | `lib/groq.js` → various | `llama-3.3-70b-versatile`, temp 0.7–0.8 (see below) |
| Pollinations image | `lib/pollinations.js` → `buildImageUrl(name, desc, imageStyle?)` | `flux` model, URL-based GET, **no API key required**, random seed per call |
| Home Assistant | `lib/homeAssistant.js` → `addToHAShoppingList(items, haUrl, haToken)` | HA REST API `POST /api/shopping_list/items` |
| Google Tasks | `lib/googleTasks.js` → `loadGIS()`, `getGoogleAccessToken(clientId)`, `addToGoogleTasks(items, accessToken)` | GIS OAuth + Tasks REST API |

**On-demand Groq functions** (all in `lib/groq.js`, all use `llama-3.3-70b-versatile`, `response_format: json_object`):

| Function | Returns | Temp |
|---|---|---|
| `generateCommonMistakes(recipe)` | `[{mistake, fix}]` (3 items) | 0.7 |
| `generateRecipeStory(recipe)` | `string` (2–3 sentence cultural story) | 0.7 |
| `generateSecretIngredient(recipe)` | `{ingredient, reason, howToAdd}` | 0.8 |
| `generateChefLetter(recipe, persona)` | `{letter: string}` | 0.7 |
| `generateRecipeHaiku(recipe)` | `{haiku: string}` (5-7-5) | 0.8 |
| `generateBatchPrep(recipe, servings)` | `{servings, ingredients[], instructions[], tip}` | 0.3 |
| `generateIngredientPrepTip(ingredient)` | `{tip, storage, shelf_life}` | 0.5 |
| `generateIngredientSubs(ingredient, recipeName)` | `{subs: [{name, notes}]}` (3 subs) | 0.7 |
| `generateHistoricalRecipe(promptText)` | full recipe JSON (standard schema) | 0.7 |
| `generateFlavorPairings(recipe)` | `{pairings: [{ingredient, flavor, whyItWorks}]}` (4 items) | 0.7 |
| `generateSmartRecommendation(historyNames, pantryItems, timeOfDay)` | `{dishName, reason}` | 0.7 |
| `generateCuisineDeepDive(cuisine)` | `{description, keyIngredients, techniques, tipForHome, funFact}` | 0.7 |
| `generateWeeklyDigest(recipes)` | `{summary, highlight, encouragement}` | 0.7 |
| `generateStorageTips(recipe)` | `{items: [{component, container, temperature, duration}]}` | 0.4 |
| `generateMealPrepGuide(meals)` | `{prepDays: [{day, tasks[]}], makeAheadItems[], shoppingTip}` | 0.4 |

`buildImageUrl()` accepts an optional `imageStyle` (`'plated'` / `'overhead'` / `'rustic'` / `'close-up'`) that is injected into the Pollinations prompt. It uses a random seed, so two calls produce different images — the URL must be preserved explicitly when sharing.

### Recipe JSON schema

The recipe prompt (`lib/prompts.js`) requests this exact shape from Groq:

```json
{
  "name", "prepTime", "cookTime", "time", "difficulty", "calories", "servings",
  "description",
  "ingredients": ["item with quantity"],
  "instructions": ["step"],
  "nutrition": { "protein", "carbs", "fat", "fiber" },
  "winePairing", "chefTip", "smartSub"
}
```

`prepTime` and `cookTime` are displayed separately in `StatsBar` when present; `time` is the fallback total. `calories` is **per serving** (the prompt explicitly requests this).

### Generation flows

**By Ingredients (default)**
1. `handleGenerate()` → saves to `recent_ingredients`, calls `generateSuggestions()` → `RecipeSuggestions` view
2. User picks suggestion (or skips) → `handlePickSuggestion(suggestion, overrideIngredients?)` → `generateRecipe()` → `ResultView`

**By Dish Name** (`GenerateView` tab)
- `handleDishGenerate(dishName)` → `buildDishPrompt()` → `generateRecipe()` → `ResultView` (skips suggestions)

**Import** (`GenerateView` Import tab)
- `handleImport(text)` → `buildImportPrompt(text)` → `importRecipe()` → `ResultView` (skips suggestions)

**Historical Recipe** (`GenerateView` tab 4)
- `handleHistoricalGenerate(dishName, era)` → `buildHistoricalPrompt({dishName, era, ...prefs})` → `generateHistoricalRecipe(prompt)` → `ResultView`

**Restaurant Recreator** (`GenerateView` tab 5 "Recreate")
- `handleRestaurantGenerate(restaurant, dish)` → `buildRestaurantPrompt({restaurant, dish, ...prefs})` → `generateRecipe(prompt)` → `ResultView`
- Recipe name is `"${dish} (${restaurant}-style)"`

**I'm Feeling Lucky**
- `handleLucky()` → uses current ingredients or picks `getRandomSurpriseIngredients()` → calls `handlePickSuggestion(null, ing)` directly (skips suggestions)

**A/B Recipe Test** (GenerateView "Generate Two" button)
- `handleABGenerate()` → calls `buildRecipePrompt` twice with slight variation → `Promise.all([generateRecipe(promptA), generateRecipe(promptB)])` → builds images for both → sets `view='abtest'`
- `handlePickAB(recipe, image)` → sets recipe from chosen option → `view='result'`
- `ABRecipeTest.jsx` renders two recipe cards side-by-side with "Choose this one →" buttons

**Similar Recipe** (More panel in `RecipeActions`)
- `handleSimilarRecipe()` → `buildSimilarPrompt(recipe)` → `generateVariant()` → replaces current recipe

**Variant flow** (More panel in `RecipeActions`)
- `handleVariant(type)` → `buildVariantPrompt(recipe, type)` → `generateVariant()` → `onVariantReady()` in `App.jsx` saves old recipe as a version (via `updateRecipeWithVersion`) then replaces current recipe
- Supported variant types: `'healthier'`, `'cheaper'`, `'easier'`, `'harder'`, `'translate:<language>'`

**Remix flow** (History remix mode)
- `handleRemix(recipeA, recipeB)` → `buildRemixPrompt(recipeA, recipeB)` → `generateRemix()` → `ResultView`

**Pantry Generate** (PantryMatcher "Generate New Recipe from Pantry")
- `onGenerateFromPantry(pantryNames)` in `App.jsx` → `setIngredients(pantryNames)` + `handlePickSuggestion(null, pantryNames)` → skips suggestions, goes straight to recipe generation

All recipe flows end with: `buildImageUrl(name, desc, prefs.imageStyle)` called for image; `useEffect` in `App.jsx` resolves `isGeneratingImage` when the `Image` object fires `onload`/`onerror`. `canvas-confetti` fires only once ever (guarded by `localStorage.getItem('confetti_done')`). After each recipe loads, `generatePairingSuggestions()` is called in the background and results stored in `pairings` state. On result load, `generateRecipeStory()` and `generateCommonMistakes()` are also called in parallel (auto-loaded, results stored in `ResultView` state).

**Post-cooking flow** — when the user taps Done on the last CookingMode step, `onCookDone` fires → `handleCookDone` in `App.jsx` increments cook count, closes CookingMode, and sets `showPostCooking = true`. `PostCookingSummary` modal appears with elapsed time (from `cookingStartTime` recorded when `handleSetCookingMode(true)` was called), a 5-star rating widget (maps ≥4 stars → `'up'`, <4 → `'down'`), a "Log to Food Log" button that writes directly to `daily_food_log` localStorage, and AI storage tips from `generateStorageTips(recipe)`. The `setShowCookingMode` prop passed to `ResultView` is actually `handleSetCookingMode` — a wrapper that records the start timestamp before delegating to the real setter.

### Prompt options (`lib/prompts.js`)

`buildRecipePrompt()` and `buildDishPrompt()` accept these fields beyond the basics:
- `mood` — occasion string (e.g. `"dinner party"`, `"quick lunch"`)
- `leftover` — boolean; **overrides spice** and forces use of all listed ingredients (zero-waste)
- `kidFriendly` — boolean; **overrides spice to mild** and restricts techniques/alcohol
- `banned` — string array, excluded from all recipes
- `maxCalories` — number string; adds a hard calorie cap to the prompt
- `persona` — `'home'` / `'pro'` / `'street'` / `'michelin'`; injects a chef-style instruction paragraph
- `maxTime` — number string (minutes); adds a hard total-time cap to the prompt
- `gutHealth` — boolean; adds gut-health-friendly instruction (fermented foods, fibre, probiotics)
- `rootToStem` — boolean; adds zero-waste instruction (use whole vegetable including peels/stems)
- `customPrompt` — string; appended verbatim to every generation prompt

`buildHistoricalPrompt({ dishName, era, diet, allergies, banned, customPrompt })` returns a full recipe JSON prompt requesting a historical-era version of a dish. Era options: Medieval Europe, Victorian England, 1920s Paris, Ancient Rome, Ming Dynasty, Ottoman Empire.

`buildVariantPrompt(recipe, variantType)` handles `"healthier"`, `"cheaper"`, `"easier"`, `"harder"`, and `"translate:<language>"`.

`buildSimilarPrompt(recipe)` generates a different dish in the same style/cuisine.

`buildSuggestionsPrompt()` also accepts `kidFriendly` and `leftover` so the 3 suggestion names already reflect active modes.

`buildImportPrompt(text)` wraps arbitrary pasted recipe text/URL content in a parse request that returns the standard recipe JSON schema.

`buildRemixPrompt(recipeA, recipeB)` fuses two recipes into a creative fusion dish.

### Recipe sharing / QR code

`RecipeActions.jsx` handles sharing. When a recipe is displayed:

1. `buildLongUrl(recipe, imageUrl)` compresses `{ r: recipe, i: imageUrl }` with `CompressionStream('deflate-raw')`, base64-encodes it, and produces `<base>?rc=<data>`
2. The long URL is shortened via `https://is.gd/create.php?format=json&url=...` (free, no key, CORS-friendly) → `https://is.gd/AbCdEf`
3. QR code encodes only the short URL; falls back to the long URL if is.gd is unavailable
4. `window.history.replaceState` is called with the long URL so each recipe has its own bookmarkable URL
5. `reset()` clears the URL back to the base path

**Decoding** (on page load in `App.jsx`): reads `?rc=` (compressed) or `?r=` (plain) params, with fallback to legacy `#rc=`/`#r=` hash fragments. Decoded payload is `{ r: recipe, i: imageUrl }` (new) or a plain recipe object (legacy). If `imageUrl` is present it is used directly — no re-render needed.

### Persistence

All `localStorage` keys:

| Key | Hook / owner |
|---|---|
| `pref_diet`, `pref_vibe`, `pref_cuisine`, `pref_allergies`, `pref_spice`, `pref_servings`, `pref_theme` | `usePreferences` |
| `pref_font_sz`, `pref_high_contrast`, `pref_temp_unit` | `usePreferences` (display settings) |
| `pref_banned`, `pref_mood`, `pref_leftover`, `pref_kid_friendly` | `usePreferences` (generation modifiers) |
| `pref_max_calories` | `usePreferences` — calorie cap per serving |
| `pref_nutrition_goals` | `usePreferences` — `{ calories, protein, carbs, fat }` daily targets |
| `pref_servings_memory` | `usePreferences` — object keyed by cuisine name |
| `pref_image_style` | `usePreferences` — Pollinations photo style (`'plated'` / `'overhead'` / `'rustic'` / `'close-up'`) |
| `pref_persona` | `usePreferences` — chef style (`''` / `'home'` / `'pro'` / `'street'` / `'michelin'`) |
| `pref_max_time` | `usePreferences` — time cap in minutes (string); empty = no limit |
| `pref_gut_health` | `usePreferences` — boolean; injects gut-health instruction into prompts |
| `pref_root_to_stem` | `usePreferences` — boolean; injects zero-waste/root-to-stem instruction |
| `pref_custom_prompt` | `usePreferences` — string appended verbatim to every generation |
| `pref_weekly_budget` | `usePreferences` — string; weekly grocery budget target displayed in Cooking Stats |
| `pref_ha_url` | `Navbar.jsx` (via `useLocalStorage`) — Home Assistant base URL |
| `pref_ha_token` | `Navbar.jsx` (via `useLocalStorage`) — Home Assistant long-lived access token |
| `pref_google_client_id` | `Navbar.jsx` (via `useLocalStorage`) — Google OAuth client ID for Tasks integration |
| `recipe_history` | `useRecipeHistory` (max 50 entries; each has `tags[]`, `notes`, `isFavourite`, `wantToCook`, `rating`, `versions[]`, `collectionId`, `cookCount`) |
| `recipe_collections` | `useRecipeHistory` — array of `{ id, name }` cookbook objects |
| `meal_plan` | `MealPlanner` — `{ Monday: { Breakfast: entryId\|null, ... }, ... }` |
| `long_cook_timers` | `KitchenTimer` — `[{ id, label, startedAt, durationMs }]` persisted for multi-day timers |
| `game_points`, `game_streak`, `game_last_cook_date`, `game_badges`, `game_stats` | `useGamification` |
| `game_best_streak` | `App.jsx` (uses `useLocalStorage` directly) |
| `recent_ingredients` | `App.jsx` (uses `useLocalStorage` directly; max 20 items) |
| `pantry_items` | `PantryDrawer` (uses `useLocalStorage` directly) |
| `cooking_journal` | `CookingJournal` — `[{ id, date, text }]`, max 50 entries |
| `daily_food_log` | `DailyFoodLog` — `[{ id, date, name, calories, protein, carbs, fat, time }]`, max 200 entries |
| `confetti_done` | `ResultView` (raw `localStorage` — set once, confetti never fires again) |

`pref_theme` defaults to `getSystemTheme()` — reads `prefers-color-scheme` on first visit.

### Notable component behaviours

**`CookingMode.jsx`** — all step timers are initialized upfront from `detectTimerSeconds()` on mount and stored in a `timers` map keyed by step index. A single `setInterval` ticks all running timers simultaneously. Other running timers are shown as chips at the top while you're on a different step. Users can add per-step notes; `onExit(stepNotes)` passes the notes map back to `App.jsx` which saves them via `handleSaveCookingNotes`. Accepts an `onCookDone` callback that fires when the user taps Done on the final step — **`ResultView` must forward this prop to `CookingMode`** (it is passed down from `App.jsx` via `ResultView`). **Beat-the-Clock**: accepts `timeLimitSeconds` prop; countdown bar is orange → amber → red as deadline approaches; "Time's Up!" at 0. **Hands-Free Voice**: 🎙️ toggle calls `window.SpeechRecognition`; listens for "next", "back/previous", "start/stop timer" commands using `stepRef.current` to avoid stale closures. **Cook-with-a-Friend**: collapsible section in header; select 2–4 people and choose your person; steps are partitioned round-robin (person 1 gets steps 1, 4, 7…) and highlighted; non-assigned steps show the person's name.

**`ResultView.jsx`** — cooking terms in instructions are detected via `TECHNIQUES` glossary and rendered as `TechniqueWord` spans with hover tooltips. Cut techniques (julienne, brunoise, chiffonade, dice, mince) also show a "see diagram →" link that opens `KnifeCutsGuide`. Ingredients are clickable — tapping calls `generateIngredientPrepTip()` and shows an `IngPrepPopover`. The popover shows a prep tip (tip/storage/shelf_life) and a lazy-loaded **Substitutes** section (calls `generateIngredientSubs(ingName, recipeName)` when tapped; `ingName` is stored in `activeIngTip.ingName`). Seasonal ingredients show a 🌱 badge (via `GET_SEASONAL_BADGE` / `lib/seasonal.js`). On recipe load, `generateRecipeStory()` and `generateCommonMistakes()` are called in parallel — story renders as a blockquote, mistakes as a collapsible section. The serving multiplier supports preset buttons (½x/1x/2x/3x) and free-text input; `scaleIngredient(text, multiplier)` (defined inline) uses a regex to replace all numbers in each ingredient string with the scaled value, converting common decimals to Unicode fractions (½, ¼, ¾). Before Cooking Mode a **Mise en Place** checklist is shown. `SAFE_TEMPS` + `getSafeTempForStep()` render inline 🌡️ temperature badges in instructions. `PlatingGuide` and `RegionalVariants` modals are triggered from `RecipeActions` via `onShowPlating` / `onShowRegional` callbacks. **Read Aloud** button (shown only when `window.speechSynthesis` is available) reads recipe name, ingredients, and steps via Web Speech API — cancelled on recipe change via `useEffect`. **🧺 Pantry** button in ingredient header reads `pantry_items` from localStorage, normalises to name strings, then shows a have/need breakdown inline below the header. **Metric ↔ Imperial toggle** (🌍/📏 button in ingredient header): `showImperial` state; `convertIngredient(text, toImperial)` converts g→oz, ml→fl oz, kg→lbs, l→fl oz, cm→in. **Banned ingredient detection**: reads `pref_banned` from localStorage; `isBanned(ingText)` keyword-matches; matching ingredients show a red ⚠️ "banned" badge. **ShoppingListModal** includes `<ShoppingIntegrations items={recipe.ingredients} />` — shows HA/Google Tasks send buttons when integrations are configured.

**`StatsBar.jsx`** — displays a grid of stat badges: Prep/Cook time, Difficulty (with tooltip), Calories (per serving — shown as subLabel), Type, Servings, Wine Pairing, Est. Cost (~$X, uses `recipe.ingredients` not the input prop), Carbon score, Anti-inflammatory score (keyword scoring: good vs bad ingredients), GI estimate (Low/Medium/High GI from keyword matching), Hydration badge (≥2 high-water ingredients), **Complexity Score** (Simple/Moderate/Complex/Expert computed from ingredient count × 2 + step count × 2 + equipment count × 4, capped at 100). Below the grid: MacroBar rows for protein/carbs/fat/fiber (each accepts optional `goal` — bar turns red if over). Collapsible **Equipment Needed** section scans `recipe.instructions` for kitchen equipment keywords. Collapsible **Calorie Burn** section shows minutes to burn via walking (cal/4.3), cycling (cal/7.4), and running (cal/9.8), assuming 70 kg body weight.

**`RecipeActions.jsx`** — More panel includes: variant buttons (healthier/cheaper/easier/harder/translate), Similar Recipe, Export Card (canvas), QR code, Embed code, and on-demand AI buttons: 🎲 Secret Ingredient, ✉️ Chef's Letter, 🎋 Recipe Haiku, 👥 Batch Prep, 🍽️ Plating Guide, 🌍 Regional Variants, **🍷 Flavor Pairing Explorer** (calls `generateFlavorPairings(recipe)`), **📋 Clone** (calls `onClone()`), **⬇️ Save as HTML** (generates self-contained `.html` offline file with inline styles). Each AI button shows a result card below. Accepts `persona` prop (passed through to `generateChefLetter`), `onShowPlating` and `onShowRegional` callbacks, and `onClone` callback. **Export Card** (`handleExportCard`) produces an 800×1160px PNG; **Card Theme** picker (orange/blue/green/purple/red) is shown above the Export Card button — `cardTheme` state controls the header colour in the PNG. `roundRect` and a local `wrapText` helper are used (no external deps).

**`FlavorRadar.jsx`** — pure SVG spider/radar chart, 6 flavor axes (Sweet, Savory, Spicy, Umami, Tangy, Fresh). Scores computed from keyword matching. `scoreRecipe(recipe)` is **exported** so `CookingStats.jsx` can import it for aggregate analysis. No external charting library.

**`KitchenTimer.jsx`** — floating multi-timer widget rendered as a dropdown from the Navbar Timer button. Accepts duration input in multiple formats: bare number (treated as minutes), `5m`, `1:30`, `1h30m`, `90s`. Multiple named timers run simultaneously via a single `setInterval`. Plays a Web Audio API beep when each timer finishes. **Long Cook mode** (toggle in header) uses `useLongCookTimers` hook which persists `[{ id, label, startedAt, durationMs }]` to `long_cook_timers` in localStorage; accepts `24h`, `2d`, `3d12h` formats; shows elapsed + remaining time computed from `Date.now() - startedAt`.

**`MealPlanner.jsx`** — weekly Mon–Sun grid with Breakfast/Lunch/Dinner slots. Uses **tap-to-assign** UX (works on both mobile and desktop): tap a recipe card in the sidebar to select it (orange highlight + checkmark circle), then tap any meal slot to assign it; click anywhere outside to deselect. Slots show an orange dashed border with a `+` icon while a recipe is selected. The status subtitle updates to say which recipe is pending assignment. Shopping list uses `buildSmartShoppingList()` from `lib/shoppingList.js` — deduplicates and groups by aisle; includes `<ShoppingIntegrations>` for HA/Google Tasks. **AI Prep Guide**: "🗓️ Prep Guide" button visible when ≥3 meals assigned; calls `generateMealPrepGuide(meals)` with `{ day, mealType, recipeName, ingredients[], instructions[] }` per meal; displays collapsible sections for each prep day's task checklist, make-ahead items, and a shopping tip; `prepGuide` resets to null whenever `plan` changes (via `useEffect` with `setTimeout(..., 0)`). Plan persists in `meal_plan` localStorage key.

**`GenerateView.jsx`** — five mode tabs: Ingredients, By Dish Name, Import, Historical, Recreate. Historical tab renders `HistoricalRecipe.jsx`. Recreate tab takes a restaurant name + dish name and calls `onRestaurantGenerate` → `buildRestaurantPrompt`. Mode section also has 🦠 Gut Health and 🌿 Zero-Waste toggles. "Generate Two" button triggers A/B test via `onABGenerate` prop. "🤔 What should I cook?" button calls `generateSmartRecommendation(historyNames, pantryItems, timeOfDay)` and shows the suggested dish as a chip. **"🧺 What Can I Make?"** button (shown when `history.length > 0`) opens `PantryMatcher` modal — accepts `history`, `onSelectHistoryEntry`, `onGenerateFromPantry` props from `App.jsx`.

**`PantryMatcher.jsx`** — modal (`z-[200]`). Props: `{ history, onSelect, onGenerateFromPantry, onClose }`. Reads `pantry_items` from localStorage, normalizes names to lowercase. `matchScore(recipe, pantryNames)` does substring matching against each ingredient string — returns `{ pct, matched[], missing[] }`. Shows top 10 history entries sorted by match %, with badge colors: green ≥70%, amber ≥40%, red <40%. Each card has a collapsible missing-ingredients list and "Cook This →" button. Footer: "Generate New Recipe from Pantry" calls `onGenerateFromPantry(pantryNames)`.

**`ShoppingIntegrations.jsx`** — shared button component. Props: `{ items }` (flat `string[]`). Reads `pref_ha_url` + `pref_ha_token` from localStorage and `VITE_GOOGLE_CLIENT_ID` env var (or `pref_google_client_id` from localStorage) to decide which buttons to show. "🏠 Home Assistant" calls `addToHAShoppingList()`; "📋 Google Tasks" calls `getGoogleAccessToken()` then `addToGoogleTasks()`; Google access token stored in component state (expires ~1h). Returns `null` if neither integration is configured. Used inside shopping list modals in `ResultView`, `MealPlanner`, and `RecipeHistory`.

**`ABRecipeTest.jsx`** — shown at `view === 'abtest'`. Props: `{ recipeA, imageA, recipeB, imageB, isLoading, onPickA, onPickB, onClose }`. Two recipe cards side-by-side (stacked on mobile) with loading skeleton. "Choose this one →" calls `handlePickAB` in `App.jsx`.

**`KnifeCutsGuide.jsx`** — static modal, no API. Tabbed diagrams for julienne, brunoise, chiffonade, dice, mince, bias cut. Each tab shows technique name, description, typical size, and step-by-step instructions.

**`PlatingGuide.jsx`** — static modal. 7 professional plating tips (Odd Numbers Rule, Clock Method, Height & Layers, Sauce Smearing, Garnish Purposefully, Negative Space, Wipe the Rim) plus a recipe-specific colour note.

**`RegionalVariants.jsx`** — modal that calls `generateVariant` with a regional adaptation prompt. 8 region tabs: Mexican, Italian, Indian, Japanese, Thai, French, American, Mediterranean.

**`CookingStats.jsx`** — Stats tab content. **Signature Dish** banner (shown when `mostCooked.cookCount >= 2`) displays recipe image + name + cook count prominently above the stats. Summary cards (total saved, favourites, approval rate, most-cooked count). Tab-based charts: Top Ingredients, Cuisine Breakdown, Weekly Activity (last 8 weeks column chart), Difficulty Distribution, **Progression** (SVG polyline of last 20 recipes plotted by difficulty Easy=1/Medium=2/Hard=3, colour-coded dots), **Flavor DNA**. **Flavor DNA tab**: imports `scoreRecipe` from `FlavorRadar.jsx`; aggregates all history entries' flavor scores; renders a mini hexagonal SVG radar (viewBox `0 0 160 160`, R=50); below: "Your Dominant Flavors" (top 3 by avg score), "Flavor Blind Spots" (bottom 2 with score < 3 + suggestion), "Flavor Diversity Score" (std dev of 6 avg scores → Diverse/Balanced/Specialized). **Export CSV** button. **Weekly Digest** section calls `generateWeeklyDigest(recipesThisWeek)`. If `weeklyBudget` pref is set, shows it in the summary cards.

**`PantryDrawer.jsx`** — pantry items are objects `{ name, expiresAt, zone }`. `zone` is `'pantry'` / `'fridge'` / `'freezer'` (defaults to `'pantry'` for legacy items). `normalise()` migrates legacy string items and adds missing `zone`. Zone selector dropdown shown when adding items; zone filter tabs at top filter the list. `ExpiryBadge` renders red/orange/green. **Reorder List** section appears when any items are expired — collapsible, shows expired items with a "Copy list" button. Receipt import adds items to the currently selected zone. **🚨 Expiry Rush** button (shown when ≥1 item expires within 3 days) calls `onAddAll(expiringItems.map(p => p.name))` then `onClose()` to rush all about-to-expire items into the ingredient input.

**`PantryAnalytics.jsx`** — inline analytics (toggled in PantryDrawer). Shows total/expiring/fresh counts, freshness distribution bar, and category breakdown by ingredient type.

**`CuisinePassport.jsx`** — props: `{ history }`. Shows 8 cuisine stamps (Italian, Asian, Mexican, Indian, French, Mediterranean, American, Japanese). Detects cuisines via keyword matching against each entry's tags, recipe name, and description. Unlocked stamps are coloured; locked stamps are grey. Shows count of recipes per cuisine under each stamp. Progress bar shows X/8 cuisines explored.

**`CookingJournal.jsx`** — standalone, uses `useLocalStorage('cooking_journal', [])`. Add free-text diary entries with date + time stamp (max 50). Past entries shown in reverse order with a delete button.

**`DailyFoodLog.jsx`** — accepts optional `nutritionGoals` and `lastRecipe` props (passed from `RecipeHistory` ← `App.jsx`). Uses `useLocalStorage('daily_food_log', [])`. Log meals with name, calories, protein, carbs, fat. Shows today's entries with totals grid. **Goal Progress**: when `nutritionGoals` is set, renders color-coded progress bars per macro (green <80%, amber 80–100%, red >100% of goal). **Quick-log chip**: when `lastRecipe` is provided, a chip auto-fills an entry from the recipe's macros. **7-day average**: collapsible `WeeklyMiniSummary` shows average calories/protein/carbs/fat across days logged this week. **14-Day Calorie Trend**: collapsible `NutritionTrendChart` (SVG, `viewBox="0 0 320 100"`) — 14 bars one per day; bar color green if under calorie goal, amber within 10%, red over; dashed orange goal line when goal is set; today's bar highlighted; one-line avg + days-over-goal summary below. Shows only when ≥2 days have data. **Meal Balance Score**: protein 15–35%, carbs 35–65%, fat 20–40% each add 1 point → `Imbalanced / Somewhat Balanced / Well Balanced`. **Hydration Goal**: `Math.min(10, Math.max(6, round(calories/250)))` glasses shown as 💧 icons.

**`RecipeCompare.jsx`** — props: `{ recipeA, recipeB, imageA, imageB, onClose }`. Full-screen modal table comparing two recipes across all stats. `CompareRow` highlights differing values in orange. Handles both raw recipe objects and history entry objects via `recipeA?.recipe || recipeA`.

**`SeasonalCalendar.jsx`** — props: `{ onClose, onSelectIngredient }`. Modal with monthly navigator. Static `MONTHLY_PRODUCE` object with 8 seasonal items + tip per month. Ingredient chips call `onSelectIngredient?.(item)` when tapped. Used from GenerateView and anywhere a seasonal ingredient picker is needed.

**`PostCookingSummary.jsx`** — modal overlay (`z-[300]`) shown after `onCookDone` fires. Props: `{ recipe, recipeImage, cookingDurationMs, onRate, onLogMeal, onClose }`. Displays recipe image with gradient overlay, elapsed cook time, 5-star rating (hover + click; maps ≥4 → `'up'`, <4 → `'down'` via `onRate`), a "Log to Food Log" button that calls `onLogMeal(mealData)` (extracts name + macros from recipe), and leftover storage tips loaded from `generateStorageTips(recipe)`. Uses `setTimeout(..., 0)` to defer `setLoadingTips(true)` inside `useEffect` (ESLint `react-hooks/set-state-in-effect` rule).

**`TrophyCase.jsx`** — shown in RecipeHistory "🏆 Trophy" tab. Props: `{ points, badges, streak, bestStreak, stats }`. `LevelBanner` shows level number + title + XP total + progress bar using a gradient that shifts from grey (L1) through colours to gold (L21) based on `getLevel(points)`. Three `StatCard` tiles show current streak, best streak, and total recipes. Badge grid is 5-column: unlocked badges show icon + name in full colour; locked show grey `?` and dim text. Tapping any badge opens a detail panel below the grid — shows description for unlocked, or `hint` for locked with "How to unlock:" prefix.

**`SyncPlanner.jsx`** — Multi-dish timing calculator (`view === 'sync'`, Navbar "Sync" button). User enters dishes with cook times + a serve-in minutes value; component calculates `startIn = serveInMins - cookMins` for each dish and renders a timeline sorted by start time. Shows "NOW" for dishes that should already be started; warns if `startIn < 0`.

**`useRecipeHistory`** — `updateRecipeWithVersion(id, newRecipe, newImageUrl)` pushes the current recipe into `entry.versions[]` before overwriting. `incrementCookCount(id)` increments `entry.cookCount`; called by `handleCookDone` in `App.jsx` when CookingMode fires `onCookDone` (the Done button on the last step). `cloneRecipe(id)` deep-copies an entry, appends `" (Copy)"` to the name, resets `cookCount` and `versions`, and prepends to history; returns the new entry's `id`.

**`RecipeHistory.jsx`** — tabs: All, Saved, Wishlist, Collections, Stats, Journal, Cuisine Passport, Food Log, and **🏆 Trophy**. Accepts `gamification`, `bestStreak`, `nutritionGoals`, `lastRecipe` props from `App.jsx` and forwards the latter two to `DailyFoodLog`, and the former two to `TrophyCase`. **🎲 Random** button in header picks a random history entry and calls `onSelect`. **View toggle** (☰ / ⊞ buttons): `viewMode` state switches between `'cards'` (2-column grid) and `'gallery'` (CSS `columns-2 sm:columns-3` masonry); gallery auto-reverts to cards during remix or multi-select. Gallery shows name strip on mobile always; desktop hover reveals name + difficulty + rating overlay. `MonthlyChallenges` tracks monthly goals. Each card shows version + cook count badges, plus a **Clone** button (calls `onClone(entry.id)`). **Multi-select** toggle (🛒) enables selecting multiple cards; "Merge Shopping Lists" calls `buildSmartShoppingList()`, renders by aisle in the modal, and includes `<ShoppingIntegrations>` for HA/Google Tasks; when exactly 2 selected: "Compare" button opens `<RecipeCompare>` modal. **Remix mode** (🔀 toggle): select up to 2 → "Create Fusion Dish →" calls `onRemix(recipeA, recipeB)`.

**`Navbar.jsx`** — Settings dropdown includes: theme toggle, high contrast, font size (SM/MD/LG), temperature unit (°C/°F), Daily Nutrition Goals (calorie/protein/carbs/fat targets), **Custom Prompt** textarea (appended to every generation), **Integrations** section (collapsible) with Home Assistant URL + token inputs and Google Tasks Client ID input. Timer, Planner, Sync, History buttons in the main bar.

### Utility libraries

- `lib/costs.js` — `estimateCost(ingredients[])` returns `{ total, matched }` — rough USD estimate per batch
- `lib/carbon.js` — `getCarbonScore(ingredients[])` returns `{ total, label, color, icon }` — CO₂e footprint rating
- `lib/seasonal.js` — `getSeasonalIngredients()` / `getSeasonalHint()` — month-based seasonal produce
- `lib/ingredients.js` — `INGREDIENT_SUGGESTIONS`, `getEmojiForIngredient()`, `getRandomSurpriseIngredients()`
- `lib/achievements.js` — `BADGES` (10 badges, each with `hint` for locked state), `checkNewBadges(stats, unlockedIds[])`, `LEVEL_THRESHOLDS` (21 levels: Apprentice → Grand Maître), `getLevel(points)` → `{ level, title, pointsForNext, progress, currentMin }`
- `lib/shoppingList.js` — `parseIngredient(text)` → `{ qty, unit, name, original }`; `deduplicateIngredients(ingredients[])` groups by normalized name and sums matching units; `categorizeByAisle(ingredients[])` → `{ aisleLabel: [...] }` (9 aisles); `buildSmartShoppingList(ingredients[])` runs the full deduplicate → categorize pipeline. Used by `MealPlanner`, `RecipeHistory` merged list, and `ResultView`'s `ShoppingListModal`.
- `lib/homeAssistant.js` — `addToHAShoppingList(items, haUrl, haToken)` — POSTs each item to HA REST API; returns `{ success, failed }`. Handles CORS errors gracefully.
- `lib/googleTasks.js` — `loadGIS()` dynamically loads GIS script; `getGoogleAccessToken(clientId)` initiates OAuth popup (scope: `https://www.googleapis.com/auth/tasks`); `addToGoogleTasks(items, accessToken)` finds or creates "AutoChef Shopping" task list, then adds each item. Returns `{ success, failed }`.

### Styling

Tailwind CSS v4 via `@tailwindcss/vite` plugin. `tailwind.config.js` at the root is a v3 remnant — **it is ignored by v4**. Do not add to it.

Theme and display classes are applied on the root `<div id="app-root">` in `App.jsx`:
- `.light-theme` — light mode (overrides specific Tailwind colour classes via CSS in `index.css`)
- `.high-contrast` — high-contrast mode (stronger borders, white text)
- `.font-sz-sm` / `.font-sz-md` / `.font-sz-lg` — font size scale

**Light mode CSS gotcha**: Tailwind v4 does not expose CSS custom properties for opacity modifiers, so `.light-theme .bg-slate-900` is overridden but `.light-theme .bg-slate-900\/60` is not automatically covered. `index.css` must explicitly list every opacity variant used (e.g. `bg-slate-900/60`, `/50`, `/40`, `bg-slate-800/50`, `/60`, etc.). When adding new dark-background elements using opacity variants, add a matching `.light-theme .bg-*\/XX` rule in `index.css`. Modal backdrops (`bg-black/50`–`/70`) are intentionally left dark — only panel/card backgrounds need light overrides.

**Navbar logo**: `absolute`-positioned, scales `h-20 sm:h-28 md:h-40`. `<main>` clears it with `pt-24 sm:pt-32 md:pt-44`. The `@media print` block in `index.css` zeroes `main`'s padding and hides `.no-print` elements.

### ESLint gotchas

- `no-unused-vars` allows vars matching `/^[A-Z_]/` — use an uppercase name to suppress when needed
- `react-hooks/set-state-in-effect` is enforced — avoid calling `setState` directly in `useEffect` body; use `setTimeout(..., 0)` to defer
- `eslint-plugin-react-refresh` is active — all component files must export a single component as default
- Empty `catch` blocks must use `catch { /* comment */ }` (no binding) — `catch (e) {}` triggers `no-empty`

### Auto-save flow

When a recipe is saved (`handleSave` in `App.jsx`):
1. `saveRecipe()` is called immediately → `currentSavedId` is set
2. `generateAutoTags(recipe)` is called async → `isAutoTagging` is set `true` → tags are added one by one via `addTag(id, tag)` → `isAutoTagging` set `false`
3. `isAutoTagging` is passed to `ResultView` → `RecipeActions` shows an animated 🏷️ spinner on the Save button while tagging

### PWA

`public/manifest.json` + `public/sw.js` enable installable PWA with offline support. The service worker uses **network-first** strategy for HTML/JS/CSS — falls back to cache on failure, with `/` as the offline fallback. Registration happens in `src/main.jsx` on the `load` event (`/sw.js`). Cache name is `autochef-v3`; bump the version in `sw.js` whenever cached asset paths change (e.g. if switching the `base` between `/` and `/AutoChef/`).

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) deploys to GitHub Pages on every push to `main`. Uses `npm install --legacy-peer-deps` (required because `canvas-confetti` peer deps conflict with React 19).

- Vite `base` is `/` — custom domain `autochef.online` serves from root (if switching back to a subdirectory GitHub Pages URL, change this to the repo name e.g. `/AutoChef/` and update `public/sw.js` and `src/main.jsx` SW paths accordingly)
- `public/CNAME` contains `autochef.online` — GitHub Pages reads this on each deploy to configure the custom domain
- `VITE_GROQ_API_KEY` must exist as a repository secret. `VITE_GOOGLE_CLIENT_ID` is optional (enables Google Tasks integration). Pollinations.ai requires no key.
