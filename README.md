# AutoChef

An AI-powered recipe generator. Type in what's in your pantry, snap a photo of your fridge, paste a recipe URL, or search by dish name — AutoChef generates a gourmet recipe, renders a photorealistic image, and gives you everything you need to cook it.

## Features

### Recipe Generation
- **Fridge Scanner** — Upload a photo and AI vision identifies every visible ingredient
- **By Ingredients** — Enter what you have; pick from 3 AI-suggested recipe names before full generation
- **By Dish Name** — Type any dish (e.g. "Tiramisu", "Pad Thai") and get a complete recipe instantly
- **Import Recipe** — Paste a URL or any raw recipe text; AI parses it into the full recipe format
- **I'm Feeling Lucky** — Skip suggestions entirely; generates a recipe from your ingredients in one click
- **Gourmet Recipes** — Full recipe with ingredients, instructions, nutrition macros, wine pairing, chef's tip, and a smart substitution
- **Dish Visualization** — Pollinations.ai renders a photorealistic food photo with selectable style (plated / overhead / rustic / close-up)
- **Surprise Me** — Picks a random curated set of ingredients and generates a recipe instantly
- **Recipe of the Day** — Date-derived dish suggestion appears as a quick chip in the generate view
- **Similar Recipe** — Generate a different dish in the same style as the current recipe
- **Variants** — Regenerate any recipe as a healthier version, a cheaper version, or translated to Spanish
- **Pairing Suggestions** — After each recipe loads, AI suggests 3 complementary sides, starters, or desserts

### Customization
- **Dietary filters** — Vegetarian, vegan, keto, gluten-free, plus cuisine style, spice level, and serving size
- **Allergy exclusions** — Nuts, dairy, eggs, shellfish, soy, gluten
- **Banned Ingredients** — Permanently exclude any ingredient from all recipes
- **Calorie Cap** — Set a maximum calories-per-serving target enforced during generation
- **Mood / Occasion** — Dinner party, meal prep, quick lunch, BBQ, and more
- **Leftover Mode** — Forces every listed ingredient to appear; zero-waste cooking
- **Kid-Friendly Mode** — Overrides spice to mild; simple techniques, no alcohol
- **Persistent Pantry** — Save staple ingredients and add them all to any recipe in one click

### Cooking Experience
- **Mise en Place** — Pre-cooking prep checklist extracted from the instructions; check off tasks before starting
- **Cooking Mode** — Full-screen step-by-step overlay with simultaneous countdown timers per step and audio beep when done
- **Cooking Notes** — Add notes to individual steps during cooking mode; saved back to recipe history when you exit
- **Voice Readout** — Cooking mode reads each step aloud via Web Speech API
- **Swipe Gestures** — Swipe left/right in cooking mode to navigate steps
- **Kitchen Timer** — Floating multi-timer widget accessible from anywhere via the Navbar; supports multiple named timers simultaneously
- **Inline Step Timers** — Tap any time-mentioned step to start a countdown directly in the recipe view
- **Technique Explainer** — Hover or tap underlined cooking terms (julienne, deglaze, braise, etc.) for plain-English definitions
- **Ingredient Checklist** — Tap ingredients to cross them off as you cook
- **Serving Scaler** — Scale ingredient quantities ½x, 1x, 2x, 3x, or any custom number

### Input
- **Voice Input** — Dictate ingredients using the browser's Web Speech API
- **Paste to Split** — Paste a comma- or newline-separated ingredient list and it auto-splits into tags
- **Ingredient Autocomplete** — Inline suggestions as you type, with emoji per ingredient; drag to reorder tags
- **Recent Ingredients** — Quick-add chips from your last 20 used ingredients
- **Ingredient of the Week** — A rotating featured ingredient chip to inspire new dishes
- **Surprise Cuisine** — Randomly picks a cuisine style for you

### Recipe Details
- **Flavor Profile Radar** — SVG spider chart showing sweet, savory, spicy, umami, tangy, and fresh scores
- **Nutrition Bars** — Visual macro bars for protein, carbs, fat, and fiber; turn red when a bar exceeds your daily goal
- **Nutrition Goals** — Set personal daily targets (calories, protein, carbs, fat) in settings
- **Prep/Cook Time Split** — Separate prep and cook times when provided
- **Estimated Cost** — Rough per-batch ingredient cost estimate
- **Carbon Footprint** — Colour-coded environmental impact score
- **Allergen Highlights** — Flagged ingredients that match your allergy settings
- **Difficulty Tooltip** — Hover the difficulty badge for a plain-language explanation

### History & Saving
- **Recipe History** — All generated recipes saved to localStorage with thumbnail, rating, and favourite toggle
- **Auto-Tags** — On save, AI generates 4–5 descriptive tags (e.g. `weeknight`, `high-protein`, `one-pan`) automatically
- **Recipe Versioning** — When you apply a variant (Make Healthier, etc.), the previous version is preserved in history
- **Recipe Collections** — Organise saved recipes into named cookbooks / folders
- **Meal Planner** — Drag saved recipes onto a Mon–Sun weekly grid with Breakfast / Lunch / Dinner slots; generates a combined shopping list for the whole week
- **Monthly Challenges** — Track four monthly goals: cook 10 recipes, try 5 cuisines, save 5 favourites, use 20 unique ingredients
- **Search & Sort** — Search history by name, tags, or notes; sort by date, name, or rating
- **Tags & Notes** — Add custom tags and personal notes to any saved recipe
- **Export** — Download your full recipe history as a JSON file
- **Activity Heatmap** — 5-week grid showing your cooking frequency
- **Streak Tracking** — Daily streak counter with personal best

### Sharing & Output
- **Share & QR** — Every recipe gets its own shareable URL (compressed, shortened via is.gd); QR code links directly to the exact recipe including its image — no re-render needed on the recipient's end
- **Shopping List** — One-click grocery list with ingredients grouped by category (meat, produce, dairy, herbs, pantry); checkboxes and copy to clipboard
- **Print** — Print-optimised stylesheet renders the recipe with the AI-generated image, clean layout, and no UI chrome
- **Download as Text** — Save any recipe as a plain `.txt` file
- **Copy Ingredients** — One-click copy of the full ingredient list
- **Social Caption** — Auto-generated caption ready to paste into Instagram, X, etc.
- **Embed Code** — `<iframe>` snippet to embed any recipe on a website
- **Cook Tonight Notification** — Request a browser notification reminder to cook the current recipe

### Accessibility & Appearance
- **Installable PWA** — Install AutoChef to your home screen; works offline with cached assets
- **Responsive Design** — Fully mobile-friendly layout that adapts for phone, tablet, and desktop
- **System Dark Mode** — Automatically follows your OS preference on first visit
- **Dark / Light theme** — Override and persist via settings
- **Font Size** — SM / MD / LG scale, persisted
- **High-Contrast Mode** — Stronger borders and white text for readability
- **Temperature Unit** — Toggle between °C and °F
- **Keyboard Shortcuts** — Cmd/Ctrl+Enter to generate; panel lists all shortcuts
- **Scroll to Top** — Floating button appears after scrolling down

## Tech Stack

- **React 19** + **Vite 7**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin)
- **Groq API** — LLM text generation and vision
- **Pollinations.ai** — Image generation (free, no account required)
- **canvas-confetti** — Celebration animation on first recipe
- **is.gd** — Free URL shortening for scannable QR codes (no API key required)

## Getting Started

### 1. Install dependencies

```bash
npm install --legacy-peer-deps
```

(`--legacy-peer-deps` is required due to a peer dependency conflict between `canvas-confetti` and React 19.)

### 2. Set up API keys

Create a `.env.local` file in the project root:

```
VITE_GROQ_API_KEY=your_groq_api_key
VITE_POLLINATIONS_API_KEY=your_pollinations_api_key
```

Get a free Groq API key at [console.groq.com](https://console.groq.com). The Pollinations key is optional but gives higher rate limits — get one at [enter.pollinations.ai](https://enter.pollinations.ai).

### 3. Run the dev server

```bash
npm run dev
```

## Deployment (GitHub Pages)

The project deploys automatically to GitHub Pages on every push to `main` via GitHub Actions.

Add `VITE_GROQ_API_KEY` and `VITE_POLLINATIONS_API_KEY` as repository secrets — both are wired into the build step in `.github/workflows/deploy.yml`.

The `base` in `vite.config.js` is set to `/AutoChef/` — update this to match your repository name exactly (GitHub Pages is case-sensitive).
