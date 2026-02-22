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
'history'  (accessible from Navbar at any point)
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
| Pollinations image | `lib/pollinations.js` → `buildImageUrl()` | `flux` model, URL-based GET, **random seed per call** |

`buildImageUrl()` uses a random seed, so two calls for the same recipe produce different images. The image URL must be preserved explicitly when sharing (see below).

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

### Generation flow

1. User clicks Generate → `handleGenerate()` in `App.jsx` → saves ingredients to `recent_ingredients`, calls `generateSuggestions()` → shows `RecipeSuggestions` view
2. User picks a suggestion (or skips) → `handlePickSuggestion()` → calls `generateRecipe()` with full prefs (diet, vibe, cuisine, allergies, spice, servings, mood, leftover, kidFriendly, banned) → shows `ResultView`
3. `buildImageUrl()` is called immediately after recipe loads; a `useEffect` in `App.jsx` resolves `isGeneratingImage` when the `Image` object fires `onload`/`onerror`
4. `canvas-confetti` fires once per recipe (guarded by a `useRef` flag) when both recipe and image are done
5. "New Recipe" button calls `reset()` — navigates to generate view, does **not** regenerate in place
6. **Variant flow**: "More" panel in `RecipeActions` → calls `generateVariant()` with a prompt from `buildVariantPrompt()` → `onVariantReady()` callback replaces the current recipe in `App.jsx` and triggers a new image

### Prompt options (`lib/prompts.js`)

`buildRecipePrompt()` accepts these fields beyond the basics:
- `mood` — occasion string (e.g. `"dinner party"`, `"meal prep"`, `"quick lunch"`)
- `leftover` — boolean, emphasises zero-waste cooking
- `kidFriendly` — boolean, mild flavours and simple techniques
- `banned` — string array, excluded from all recipes

`buildVariantPrompt(recipe, variantType)` handles `"healthier"`, `"cheaper"`, and `"translate:<language>"`.

### Recipe sharing / QR code

`RecipeActions.jsx` handles sharing. When a recipe is displayed:

1. `buildLongUrl(recipe, imageUrl)` compresses `{ r: recipe, i: imageUrl }` with `CompressionStream('deflate-raw')`, base64-encodes it with `encodeURIComponent`, and produces `<base>?rc=<data>`
2. The long URL is shortened via `https://is.gd/create.php?format=json&url=...` (free, no key, CORS-friendly) → `https://is.gd/AbCdEf`
3. QR code encodes only the short URL (22 chars → tiny, scannable); falls back to the long URL if is.gd is unavailable
4. `window.history.replaceState` is called with the long URL so each recipe has its own bookmarkable URL in the browser bar
5. `reset()` calls `window.history.replaceState(null, '', window.location.pathname)` to clear the URL

**Decoding** (on page load in `App.jsx`): reads `?rc=` (compressed) or `?r=` (plain) query params, with fallback to legacy `#rc=`/`#r=` hash fragments. Decoded payload is `{ r: recipe, i: imageUrl }` (new) or a plain recipe object (legacy). If `imageUrl` is present, it is used directly — no image re-render needed.

### Persistence

All `localStorage` keys:

| Key | Hook / owner |
|---|---|
| `pref_diet`, `pref_vibe`, `pref_cuisine`, `pref_allergies`, `pref_spice`, `pref_servings`, `pref_theme` | `usePreferences` |
| `pref_font_sz`, `pref_high_contrast`, `pref_temp_unit` | `usePreferences` (display settings) |
| `pref_banned`, `pref_mood`, `pref_leftover`, `pref_kid_friendly` | `usePreferences` (generation modifiers) |
| `pref_servings_memory` | `usePreferences` — object keyed by cuisine name |
| `recipe_history` | `useRecipeHistory` (max 50 entries; each entry has `tags[]`, `notes`, `isFavourite`, `rating`) |
| `game_points`, `game_streak`, `game_last_cook_date`, `game_badges`, `game_stats` | `useGamification` |
| `game_best_streak` | `App.jsx` (uses `useLocalStorage` directly) |
| `recent_ingredients` | `App.jsx` (uses `useLocalStorage` directly; max 20 items) |
| `pantry_items` | `PantryDrawer` (uses `useLocalStorage` directly) |

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

**Navbar logo**: the logo image is `absolute`-positioned and scales responsively — `h-20` on mobile, `h-28` on `sm`, `h-40` on `md`. `<main>` clears it with matching responsive padding: `pt-24 sm:pt-32 md:pt-44`. The `@media print` block in `index.css` zeroes `main`'s padding (and hides `.no-print` elements) so printed recipes have no blank gap at the top.

### ESLint gotchas

- `no-unused-vars` allows vars matching `/^[A-Z_]/` — use an uppercase name to suppress when needed
- `react-hooks/set-state-in-effect` is enforced — avoid calling `setState` directly in `useEffect` body; use `setTimeout(..., 0)` to defer
- `eslint-plugin-react-refresh` is active — all component files must export a single component as default

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) deploys to GitHub Pages on every push to `main`. Uses `npm install --legacy-peer-deps` (required because `canvas-confetti` peer deps conflict with React 19).

- Vite `base` is `/AutoChef/` — must match the repo name exactly (GitHub Pages is case-sensitive)
- Both `VITE_GROQ_API_KEY` and `VITE_POLLINATIONS_API_KEY` must exist as repository secrets
