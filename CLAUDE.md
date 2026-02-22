# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server with HMR (Vite, port 5173)
npm run build     # Production build → dist/
npm run preview   # Preview production build locally
npm run lint      # ESLint (flat config, eslint.config.js)
```

No test suite is configured. After any change, verify with `npm run build && npm run lint`.

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
| Pollinations image | `lib/pollinations.js` → `buildImageUrl(name, desc, imageStyle?)` | `flux` model, URL-based GET, **random seed per call** |

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

`prepTime` and `cookTime` are displayed separately in `StatsBar` when present; `time` is the fallback total.

### Generation flows

**By Ingredients (default)**
1. `handleGenerate()` → saves to `recent_ingredients`, calls `generateSuggestions()` → `RecipeSuggestions` view
2. User picks suggestion (or skips) → `handlePickSuggestion(suggestion, overrideIngredients?)` → `generateRecipe()` → `ResultView`

**By Dish Name** (`GenerateView` tab)
- `handleDishGenerate(dishName)` → `buildDishPrompt()` → `generateRecipe()` → `ResultView` (skips suggestions)

**Import** (`GenerateView` Import tab)
- `handleImport(text)` → `buildImportPrompt(text)` → `importRecipe()` → `ResultView` (skips suggestions)

**I'm Feeling Lucky**
- `handleLucky()` → uses current ingredients or picks `getRandomSurpriseIngredients()` → calls `handlePickSuggestion(null, ing)` directly (skips suggestions)

**Similar Recipe** (More panel in `RecipeActions`)
- `handleSimilarRecipe()` → `buildSimilarPrompt(recipe)` → `generateVariant()` → replaces current recipe

**Variant flow** (More panel in `RecipeActions`)
- `handleVariant(type)` → `buildVariantPrompt(recipe, type)` → `generateVariant()` → `onVariantReady()` in `App.jsx` saves old recipe as a version (via `updateRecipeWithVersion`) then replaces current recipe

All recipe flows end with: `buildImageUrl(name, desc, prefs.imageStyle)` called for image; `useEffect` in `App.jsx` resolves `isGeneratingImage` when the `Image` object fires `onload`/`onerror`. `canvas-confetti` fires only once ever (guarded by `localStorage.getItem('confetti_done')`). After each recipe loads, `generatePairingSuggestions()` is called in the background and results stored in `pairings` state.

### Prompt options (`lib/prompts.js`)

`buildRecipePrompt()` and `buildDishPrompt()` accept these fields beyond the basics:
- `mood` — occasion string (e.g. `"dinner party"`, `"quick lunch"`)
- `leftover` — boolean; **overrides spice** and forces use of all listed ingredients (zero-waste)
- `kidFriendly` — boolean; **overrides spice to mild** and restricts techniques/alcohol
- `banned` — string array, excluded from all recipes
- `maxCalories` — number string; adds a hard calorie cap to the prompt

`buildVariantPrompt(recipe, variantType)` handles `"healthier"`, `"cheaper"`, and `"translate:<language>"`.

`buildSimilarPrompt(recipe)` generates a different dish in the same style/cuisine.

`buildSuggestionsPrompt()` also accepts `kidFriendly` and `leftover` so the 3 suggestion names already reflect active modes.

`buildImportPrompt(text)` wraps arbitrary pasted recipe text/URL content in a parse request that returns the standard recipe JSON schema.

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
| `recipe_history` | `useRecipeHistory` (max 50 entries; each has `tags[]`, `notes`, `isFavourite`, `rating`, `versions[]`, `collectionId`) |
| `recipe_collections` | `useRecipeHistory` — array of `{ id, name }` cookbook objects |
| `meal_plan` | `MealPlanner` — `{ Monday: { Breakfast: entryId\|null, ... }, ... }` |
| `game_points`, `game_streak`, `game_last_cook_date`, `game_badges`, `game_stats` | `useGamification` |
| `game_best_streak` | `App.jsx` (uses `useLocalStorage` directly) |
| `recent_ingredients` | `App.jsx` (uses `useLocalStorage` directly; max 20 items) |
| `pantry_items` | `PantryDrawer` (uses `useLocalStorage` directly) |
| `confetti_done` | `ResultView` (raw `localStorage` — set once, confetti never fires again) |

`pref_theme` defaults to `getSystemTheme()` — reads `prefers-color-scheme` on first visit.

### Notable component behaviours

**`CookingMode.jsx`** — all step timers are initialized upfront from `detectTimerSeconds()` on mount and stored in a `timers` map keyed by step index. A single `setInterval` ticks all running timers simultaneously. Other running timers are shown as chips at the top while you're on a different step. Users can add per-step notes; `onExit(stepNotes)` passes the notes map back to `App.jsx` which saves them via `handleSaveCookingNotes`.

**`ResultView.jsx`** — cooking terms in instructions (julienne, deglaze, sauté, braise, fold, etc.) are detected via a regex over `TECHNIQUES` glossary and rendered as `TechniqueWord` spans with hover/tap tooltips. The serving multiplier supports both preset buttons (½x/1x/2x/3x) and a free-text number input; `effectiveMultiplier` resolves to whichever is active. Before entering Cooking Mode, a **Mise en Place** pre-screen extracts prep tasks from instructions and shows a checklist. `pairings` prop (from `App.jsx` background fetch) is displayed as a "Goes Well With" section.

**`FlavorRadar.jsx`** — pure SVG spider/radar chart, 6 flavor axes (Sweet, Savory, Spicy, Umami, Tangy, Fresh). Scores are computed from keyword matching against `recipe.ingredients`, `recipe.name`, and `recipe.description`. No external charting library.

**`KitchenTimer.jsx`** — floating multi-timer widget rendered as a dropdown from the Navbar Timer button. Accepts duration input in multiple formats: bare number (treated as minutes), `5m`, `1:30`, `1h30m`, `90s`. Multiple named timers run simultaneously via a single `setInterval`. Plays a Web Audio API beep when each timer finishes.

**`MealPlanner.jsx`** — weekly Mon–Sun grid with Breakfast/Lunch/Dinner slots. Saved recipes are dragged from a sidebar using HTML5 drag-and-drop (`draggable`, `onDragStart`, `onDrop`). Builds a combined shopping list from all assigned recipes. Plan persists in `meal_plan` localStorage key.

**`StatsBar.jsx`** — `MacroBar` accepts an optional `goal` prop. When set, the bar max is the goal value and the bar turns red if `num > goalNum`.

**`RecipeHistory.jsx`** — has three tabs: All, Favourites, and Collections. `MonthlyChallenges` computes progress from `history` and `favourites` client-side, filtered to the current calendar month. Each recipe card shows a version count badge if `entry.versions.length > 0`; clicking it expands a version history list. `CollectionDropdown` (inline component) lets users assign recipes to named collections.

**`useRecipeHistory`** — `updateRecipeWithVersion(id, newRecipe, newImageUrl)` pushes the current recipe into `entry.versions[]` before overwriting — called by `handleVariantReady` in `App.jsx` whenever a variant is applied to a saved recipe.

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

### Auto-save flow

When a recipe is saved (`handleSave` in `App.jsx`):
1. `saveRecipe()` is called immediately → `currentSavedId` is set
2. `generateAutoTags(recipe)` is called async → `isAutoTagging` is set `true` → tags are added one by one via `addTag(id, tag)` → `isAutoTagging` set `false`
3. `isAutoTagging` is passed to `ResultView` → `RecipeActions` shows an animated 🏷️ spinner on the Save button while tagging

### PWA

`public/manifest.json` + `public/sw.js` enable installable PWA with offline support. The service worker uses **network-first** strategy for HTML/JS/CSS — falls back to cache on failure, with `/AutoChef/` as the offline fallback. Registration happens in `src/main.jsx` on the `load` event. Vite's `base: '/AutoChef/'` means all SW cache paths must be prefixed with `/AutoChef/`.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) deploys to GitHub Pages on every push to `main`. Uses `npm install --legacy-peer-deps` (required because `canvas-confetti` peer deps conflict with React 19).

- Vite `base` is `/AutoChef/` — must match the repo name exactly (GitHub Pages is case-sensitive)
- Both `VITE_GROQ_API_KEY` and `VITE_POLLINATIONS_API_KEY` must exist as repository secrets
