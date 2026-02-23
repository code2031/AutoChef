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
- Playwright `.or()` locator chains resolve to all matching elements and trigger strict-mode violations if >1 matches. Always append `.first()` to any `.or()` chain before `toBeVisible()`.
- The Navbar has `backdrop-filter` which creates a CSS stacking context — children of the nav are in the nav's stacking context. The `fixed inset-0 z-40` overlay rendered inside the nav (for Timer/Settings dropdowns) is above other nav children (z-auto) within that stacking context, so clicking nav buttons while a dropdown is open may be blocked. Close the dropdown via its overlay div click instead.

Local dev requires a `.env.local` file with `VITE_GROQ_API_KEY` and `VITE_POLLINATIONS_API_KEY`.

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
| Pollinations image | `lib/pollinations.js` → `buildImageUrl(name, desc, imageStyle?)` | `flux` model, URL-based GET, **random seed per call** |

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

All recipe flows end with: `buildImageUrl(name, desc, prefs.imageStyle)` called for image; `useEffect` in `App.jsx` resolves `isGeneratingImage` when the `Image` object fires `onload`/`onerror`. `canvas-confetti` fires only once ever (guarded by `localStorage.getItem('confetti_done')`). After each recipe loads, `generatePairingSuggestions()` is called in the background and results stored in `pairings` state. On result load, `generateRecipeStory()` and `generateCommonMistakes()` are also called in parallel (auto-loaded, results stored in `ResultView` state).

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
| `recipe_history` | `useRecipeHistory` (max 50 entries; each has `tags[]`, `notes`, `isFavourite`, `rating`, `versions[]`, `collectionId`, `cookCount`) |
| `recipe_collections` | `useRecipeHistory` — array of `{ id, name }` cookbook objects |
| `meal_plan` | `MealPlanner` — `{ Monday: { Breakfast: entryId\|null, ... }, ... }` |
| `long_cook_timers` | `KitchenTimer` — `[{ id, label, startedAt, durationMs }]` persisted for multi-day timers |
| `game_points`, `game_streak`, `game_last_cook_date`, `game_badges`, `game_stats` | `useGamification` |
| `game_best_streak` | `App.jsx` (uses `useLocalStorage` directly) |
| `recent_ingredients` | `App.jsx` (uses `useLocalStorage` directly; max 20 items) |
| `pantry_items` | `PantryDrawer` (uses `useLocalStorage` directly) |
| `confetti_done` | `ResultView` (raw `localStorage` — set once, confetti never fires again) |

`pref_theme` defaults to `getSystemTheme()` — reads `prefers-color-scheme` on first visit.

### Notable component behaviours

**`CookingMode.jsx`** — all step timers are initialized upfront from `detectTimerSeconds()` on mount and stored in a `timers` map keyed by step index. A single `setInterval` ticks all running timers simultaneously. Other running timers are shown as chips at the top while you're on a different step. Users can add per-step notes; `onExit(stepNotes)` passes the notes map back to `App.jsx` which saves them via `handleSaveCookingNotes`. Accepts an `onCookDone` callback that fires when the user taps Done on the final step — **`ResultView` must forward this prop to `CookingMode`** (it is passed down from `App.jsx` via `ResultView`).

**`ResultView.jsx`** — cooking terms in instructions are detected via `TECHNIQUES` glossary and rendered as `TechniqueWord` spans with hover tooltips. Cut techniques (julienne, brunoise, chiffonade, dice, mince) also show a "see diagram →" link that opens `KnifeCutsGuide`. Ingredients are clickable — tapping calls `generateIngredientPrepTip()` and shows an `IngPrepPopover`. Seasonal ingredients show a 🌱 badge (via `GET_SEASONAL_BADGE` / `lib/seasonal.js`). On recipe load, `generateRecipeStory()` and `generateCommonMistakes()` are called in parallel — story renders as a blockquote, mistakes as a collapsible section. The serving multiplier supports preset buttons (½x/1x/2x/3x) and free-text input; `scaleIngredient(text, multiplier)` (defined inline) uses a regex to replace all numbers in each ingredient string with the scaled value, converting common decimals to Unicode fractions (½, ¼, ¾). Before Cooking Mode a **Mise en Place** checklist is shown. `SAFE_TEMPS` + `getSafeTempForStep()` render inline 🌡️ temperature badges in instructions. `PlatingGuide` and `RegionalVariants` modals are triggered from `RecipeActions` via `onShowPlating` / `onShowRegional` callbacks.

**`StatsBar.jsx`** — displays a grid of stat badges: Prep/Cook time, Difficulty (with tooltip), Calories (per serving — shown as subLabel), Type, Servings, Wine Pairing, Est. Cost (~$X, uses `recipe.ingredients` not the input prop), Carbon score, Anti-inflammatory score (keyword scoring: good vs bad ingredients), GI estimate (Low/Medium/High GI from keyword matching), Hydration badge (≥2 high-water ingredients). Below the grid: MacroBar rows for protein/carbs/fat/fiber (each accepts optional `goal` — bar turns red if over). Collapsible **Equipment Needed** section scans `recipe.instructions` for kitchen equipment keywords.

**`RecipeActions.jsx`** — More panel includes: variant buttons (healthier/cheaper/easier/harder/translate), Similar Recipe, Export Card (canvas), QR code, Embed code, and on-demand AI buttons: 🎲 Secret Ingredient, ✉️ Chef's Letter, 🎋 Recipe Haiku, 👥 Batch Prep, 🍽️ Plating Guide, 🌍 Regional Variants. Each shows a result card below the button. Accepts `persona` prop (passed through to `generateChefLetter`), `onShowPlating` and `onShowRegional` callbacks. **Export Card** (`handleExportCard`) produces an 800×1160px PNG with two panels: front (800×500, photo + name + description + stat chips + branding) and back (800×660, ingredients column left / numbered steps column right), separated by an orange divider — styled like a HelloFresh recipe card. `roundRect` and a local `wrapText` helper are used (no external deps).

**`FlavorRadar.jsx`** — pure SVG spider/radar chart, 6 flavor axes (Sweet, Savory, Spicy, Umami, Tangy, Fresh). Scores are computed from keyword matching against `recipe.ingredients`, `recipe.name`, and `recipe.description`. No external charting library.

**`KitchenTimer.jsx`** — floating multi-timer widget rendered as a dropdown from the Navbar Timer button. Accepts duration input in multiple formats: bare number (treated as minutes), `5m`, `1:30`, `1h30m`, `90s`. Multiple named timers run simultaneously via a single `setInterval`. Plays a Web Audio API beep when each timer finishes. **Long Cook mode** (toggle in header) uses `useLongCookTimers` hook which persists `[{ id, label, startedAt, durationMs }]` to `long_cook_timers` in localStorage; accepts `24h`, `2d`, `3d12h` formats; shows elapsed + remaining time computed from `Date.now() - startedAt`.

**`MealPlanner.jsx`** — weekly Mon–Sun grid with Breakfast/Lunch/Dinner slots. Uses **tap-to-assign** UX (works on both mobile and desktop): tap a recipe card in the sidebar to select it (orange highlight + checkmark circle), then tap any meal slot to assign it; click anywhere outside to deselect. Slots show an orange dashed border with a `+` icon while a recipe is selected. The status subtitle updates to say which recipe is pending assignment. Builds a combined shopping list from all assigned recipes. Plan persists in `meal_plan` localStorage key.

**`GenerateView.jsx`** — four mode tabs: Ingredients, By Dish Name, Import, Historical. Historical tab renders `HistoricalRecipe.jsx` (era selector: Medieval Europe, Victorian England, 1920s Paris, Ancient Rome, Ming Dynasty, Ottoman Empire). Mode section also has 🦠 Gut Health and 🌿 Zero-Waste toggles. "Generate Two" button triggers A/B test via `onABGenerate` prop.

**`ABRecipeTest.jsx`** — shown at `view === 'abtest'`. Props: `{ recipeA, imageA, recipeB, imageB, isLoading, onPickA, onPickB, onClose }`. Two recipe cards side-by-side (stacked on mobile) with loading skeleton. "Choose this one →" calls `handlePickAB` in `App.jsx`.

**`KnifeCutsGuide.jsx`** — static modal, no API. Tabbed diagrams for julienne, brunoise, chiffonade, dice, mince, bias cut. Each tab shows technique name, description, typical size, and step-by-step instructions.

**`PlatingGuide.jsx`** — static modal. 7 professional plating tips (Odd Numbers Rule, Clock Method, Height & Layers, Sauce Smearing, Garnish Purposefully, Negative Space, Wipe the Rim) plus a recipe-specific colour note.

**`RegionalVariants.jsx`** — modal that calls `generateVariant` with a regional adaptation prompt. 8 region tabs: Mexican, Italian, Indian, Japanese, Thai, French, American, Mediterranean.

**`CookingStats.jsx`** — Stats tab content. Summary cards (total saved, favourites, approval rate, most-cooked count). Tab-based charts: Top Ingredients, Cuisine Breakdown, Weekly Activity (last 8 weeks column chart), Difficulty Distribution. **Export CSV** button downloads a CSV with columns: Name, Date, Difficulty, Calories, Protein, Carbs, Fat, Fiber, Rating, Cook Count, Tags.

**`PantryDrawer.jsx`** — pantry items are objects `{ name, expiresAt, zone }`. `zone` is `'pantry'` / `'fridge'` / `'freezer'` (defaults to `'pantry'` for legacy items). `normalise()` migrates legacy string items and adds missing `zone`. Zone selector dropdown shown when adding items; zone filter tabs at top filter the list. `ExpiryBadge` renders red/orange/green. **Reorder List** section appears when any items are expired — collapsible, shows expired items with a "Copy list" button. Receipt import adds items to the currently selected zone.

**`PantryAnalytics.jsx`** — inline analytics (toggled in PantryDrawer). Shows total/expiring/fresh counts, freshness distribution bar, and category breakdown by ingredient type.

**`SyncPlanner.jsx`** — Multi-dish timing calculator (`view === 'sync'`, Navbar "Sync" button). User enters dishes with cook times + a serve-in minutes value; component calculates `startIn = serveInMins - cookMins` for each dish and renders a timeline sorted by start time. Shows "NOW" for dishes that should already be started; warns if `startIn < 0`.

**`useRecipeHistory`** — `updateRecipeWithVersion(id, newRecipe, newImageUrl)` pushes the current recipe into `entry.versions[]` before overwriting. `incrementCookCount(id)` increments `entry.cookCount`; called by `handleCookDone` in `App.jsx` when CookingMode fires `onCookDone` (the Done button on the last step).

**`RecipeHistory.jsx`** — has four tabs: All, Favourites, Collections, and Stats. `MonthlyChallenges` computes progress from `history` and `favourites` client-side, filtered to the current calendar month. Each recipe card shows a version count badge (`entry.versions.length > 0`) and cook count (`entry.cookCount > 0`). `CollectionDropdown` (inline component) lets users assign recipes to named collections. **Remix mode** (🔀 toggle): clicking cards selects up to 2; a sticky bottom bar shows a "Create Fusion Dish →" button that calls `onRemix(recipeA, recipeB)`.

**`Navbar.jsx`** — Settings dropdown includes: theme toggle, high contrast, font size (SM/MD/LG), temperature unit (°C/°F), Daily Nutrition Goals (calorie/protein/carbs/fat targets), **Custom Prompt** textarea (appended to every generation), and Keyboard Shortcuts modal. Timer, Planner, Sync, History buttons in the main bar. The History button has no badge/count indicator.

### Utility libraries

- `lib/costs.js` — `estimateCost(ingredients[])` returns `{ total, matched }` — rough USD estimate per batch
- `lib/carbon.js` — `getCarbonScore(ingredients[])` returns `{ total, label, color, icon }` — CO₂e footprint rating
- `lib/seasonal.js` — `getSeasonalIngredients()` / `getSeasonalHint()` — month-based seasonal produce
- `lib/ingredients.js` — `INGREDIENT_SUGGESTIONS`, `getEmojiForIngredient()`, `getRandomSurpriseIngredients()`
- `lib/achievements.js` — badge definitions and `checkNewBadges(stats, unlockedIds[])`

### Styling

Tailwind CSS v4 via `@tailwindcss/vite` plugin. `tailwind.config.js` at the root is a v3 remnant — **it is ignored by v4**. Do not add to it.

Theme and display classes are applied on the root `<div id="app-root">` in `App.jsx`:
- `.light-theme` — light mode (overrides specific Tailwind colour classes via CSS in `index.css`)
- `.high-contrast` — high-contrast mode (stronger borders, white text)
- `.font-sz-sm` / `.font-sz-md` / `.font-sz-lg` — font size scale

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
- Both `VITE_GROQ_API_KEY` and `VITE_POLLINATIONS_API_KEY` must exist as repository secrets
