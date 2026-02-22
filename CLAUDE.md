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

There is no router — `view` is just `useState`.

### File layout

```
src/
  App.jsx                  — Root orchestrator: view routing, all event handlers, top-level state
  index.css                — Tailwind v4 import + light-theme CSS overrides + print stylesheet
  hooks/
    useLocalStorage.js     — Generic JSON-serialized localStorage hook
    usePreferences.js      — diet, vibe, cuisine, allergies, spice, servings, theme (all persisted)
    useRecipeHistory.js    — Save/favourite/rate/delete recipe entries (up to 50, persisted)
    useGamification.js     — Points, streak, badges, per-action stats (all persisted)
  lib/
    groq.js                — All Groq API calls (vision scan, recipe generate, suggestions)
    pollinations.js        — Builds Pollinations.ai image URL (URL-based GET, no SDK)
    prompts.js             — LLM prompt builders for recipe and suggestions endpoints
    ingredients.js         — Autocomplete list, emoji map, 10 hardcoded surprise combos
    achievements.js        — 10 badge definitions with check(stats) predicates
    seasonal.js            — Month-indexed seasonal ingredient sets + hint string
  components/
    Navbar.jsx             — Fixed top bar: theme toggle, History button, points/streak display
    LandingView.jsx        — Hero page with seasonal chip
    GenerateView.jsx       — Full ingredient input form (all selectors, pantry, seasonal chips)
    ResultView.jsx         — Recipe display: confetti, cooking mode, actions, stats, instructions
    IngredientInput.jsx    — Text input with inline autocomplete, voice (Web Speech API), drag-reorder
    SelectorGroup.jsx      — Reusable single/multi-select button group
    RecipeSuggestions.jsx  — 3-option name picker shown between generate and result
    CookingMode.jsx        — Full-screen step-by-step overlay with regex-detected countdown timer
    RecipeActions.jsx      — Save, share, print, QR code, regenerate recipe/image, thumbs rating
    StatsBar.jsx           — Stats grid + nutrition macros from recipe JSON
    RecipeHistory.jsx      — Saved recipes grid with thumbnail, favourite tab, delete
    PantryDrawer.jsx       — Slide-in drawer; persists pantry items independently in localStorage
    ProgressBar.jsx        — Fake 0→90% progress bar during generation, jumps to 100% on complete
    BadgePopup.jsx         — Toast notification for newly unlocked gamification badges
```

### API integrations

All API keys are read from `import.meta.env` — set in `.env.local` locally, and as GitHub repository secrets for CI.

| Integration | File | Model / endpoint |
|---|---|---|
| Groq vision | `lib/groq.js` → `scanImageForIngredients()` | `meta-llama/llama-4-scout-17b-16e-instruct` |
| Groq recipe | `lib/groq.js` → `generateRecipe()` | `llama-3.3-70b-versatile`, `response_format: json_object` |
| Groq suggestions | `lib/groq.js` → `generateSuggestions()` | `llama-3.3-70b-versatile`, `response_format: json_object` |
| Pollinations image | `lib/pollinations.js` → `buildImageUrl()` | `flux` model, URL-based GET |

### Recipe JSON schema

The recipe prompt (`lib/prompts.js`) requests this exact shape from Groq:

```json
{
  "name", "time", "difficulty", "calories", "servings", "description",
  "ingredients": ["item with quantity"],
  "instructions": ["step"],
  "nutrition": { "protein", "carbs", "fat", "fiber" },
  "winePairing", "chefTip", "smartSub"
}
```

### Generation flow

1. User clicks Generate → `handleGenerate()` → calls `generateSuggestions()` → shows `RecipeSuggestions` view
2. User picks a suggestion (or skips for random) → `handlePickSuggestion()` → calls `generateRecipe()` → shows `ResultView`
3. Pollinations image URL is set immediately after recipe loads; `useEffect` in `App.jsx` watches the URL and resolves `isGeneratingImage` when the `Image` object fires `onload`/`onerror`
4. `canvas-confetti` fires once per recipe (guarded by a `useRef` flag) when both recipe and image are done loading

### Persistence

All `localStorage` keys:

| Key | Hook |
|---|---|
| `pref_diet`, `pref_vibe`, `pref_cuisine`, `pref_allergies`, `pref_spice`, `pref_servings`, `pref_theme` | `usePreferences` |
| `recipe_history` | `useRecipeHistory` (max 50 entries) |
| `game_points`, `game_streak`, `game_last_cook_date`, `game_badges`, `game_stats` | `useGamification` |
| `pantry_items` | `PantryDrawer` (uses `useLocalStorage` directly) |

### Styling

Tailwind CSS v4 via `@tailwindcss/vite` plugin. `tailwind.config.js` at the root is a v3 remnant — **it is ignored by v4**. Do not add to it.

Light theme is implemented with a `.light-theme` class on the root `<div>` (not on `<html>`), overriding specific Tailwind colour classes via CSS in `index.css`. The `@media print` block in `index.css` hides `.no-print` elements and resets colours.

### ESLint gotchas

- `no-unused-vars` allows vars matching `/^[A-Z_]/` — use an uppercase name to suppress when needed
- `react-hooks/set-state-in-effect` is enforced — avoid calling `setState` directly in `useEffect` body; use `setTimeout(..., 0)` to defer
- `eslint-plugin-react-refresh` is active — all component files must export a single component as default

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) deploys to GitHub Pages on every push to `main`. Uses `npm install --legacy-peer-deps` (required because `canvas-confetti` peer deps conflict with React 19).

- Vite `base` is `/AutoChef/` — must match the repo name exactly (GitHub Pages is case-sensitive)
- Both `VITE_GROQ_API_KEY` and `VITE_POLLINATIONS_API_KEY` must exist as repository secrets
