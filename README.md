# AutoChef

An AI-powered recipe generator. Type in what's in your pantry, snap a photo of your fridge, or hit **Surprise Me** — AutoChef identifies your ingredients, generates a gourmet recipe, and renders a photorealistic image of the finished dish.

## Features

### Recipe Generation
- **Fridge Scanner** — Upload a photo and AI vision identifies every visible ingredient
- **Recipe Suggestions** — Pick from 3 AI-generated recipe ideas before committing to a full generation
- **Gourmet Recipes** — Full recipe with ingredients, instructions, nutrition macros, wine pairing, chef's tip, and a smart substitution
- **Dish Visualization** — Pollinations.ai renders a photorealistic food photo of the result
- **Surprise Me** — Picks a random curated set of ingredients and generates a recipe instantly
- **Variants** — Regenerate any recipe as a healthier version, a cheaper version, or translated to Spanish

### Customization
- **Dietary filters** — Vegetarian, vegan, keto, gluten-free, plus cuisine style, spice level, and serving size
- **Allergy exclusions** — Nuts, dairy, eggs, shellfish, soy, gluten
- **Banned Ingredients** — Permanently exclude any ingredient from all recipes
- **Mood / Occasion** — Dinner party, meal prep, quick lunch, BBQ, and more
- **Leftover Mode** — Emphasises zero-waste cooking from what's on hand
- **Kid-Friendly Mode** — Mild flavours and simple techniques
- **Persistent Pantry** — Save staple ingredients and add them all to any recipe in one click

### Cooking Experience
- **Cooking Mode** — Full-screen step-by-step overlay with auto-detected countdown timers and audio beep when done
- **Voice Readout** — Cooking mode reads each step aloud via Web Speech API
- **Swipe Gestures** — Swipe left/right in cooking mode to navigate steps
- **Inline Step Timers** — Tap any time-mentioned step to start a countdown directly in the recipe view
- **Ingredient Checklist** — Tap ingredients to cross them off as you cook
- **Serving Scaler** — Scale ingredient quantities ½x, 1x, 2x, or 3x

### Input
- **Voice Input** — Dictate ingredients using the browser's Web Speech API
- **Ingredient Autocomplete** — Inline suggestions as you type, with emoji per ingredient; drag to reorder tags
- **Recent Ingredients** — Quick-add chips from your last 20 used ingredients
- **Ingredient of the Week** — A rotating featured ingredient chip to inspire new dishes
- **Surprise Cuisine** — Randomly picks a cuisine style for you

### Recipe Details
- **Nutrition Bars** — Visual macro bars for protein, carbs, fat, and fiber
- **Prep/Cook Time Split** — Separate prep and cook times when provided
- **Estimated Cost** — Rough per-batch ingredient cost estimate
- **Carbon Footprint** — Colour-coded environmental impact score
- **Allergen Highlights** — Flagged ingredients that match your allergy settings
- **Difficulty Tooltip** — Hover the difficulty badge for a plain-language explanation

### History & Saving
- **Recipe History** — All generated recipes saved to localStorage with thumbnail, rating, and favourite toggle
- **Search & Sort** — Search history by name, tags, or notes; sort by date, name, or rating
- **Tags & Notes** — Add custom tags and personal notes to any saved recipe
- **Export** — Download your full recipe history as a JSON file
- **Activity Heatmap** — 5-week grid showing your cooking frequency
- **Streak Tracking** — Daily streak counter with personal best

### Sharing & Output
- **Share & QR** — Every recipe gets its own shareable URL (compressed, shortened via is.gd); QR code links directly to the exact recipe including its image — no re-render needed on the recipient's end
- **Print** — Print-optimised stylesheet renders the recipe with the AI-generated image, clean layout, and no UI chrome
- **Download as Text** — Save any recipe as a plain `.txt` file
- **Copy Ingredients** — One-click copy of the full ingredient list
- **Social Caption** — Auto-generated caption ready to paste into Instagram, X, etc.
- **Embed Code** — `<iframe>` snippet to embed any recipe on a website
- **Cook Tonight Notification** — Request a browser notification reminder to cook the current recipe

### Accessibility & Appearance
- **Responsive Design** — Fully mobile-friendly layout that adapts for phone, tablet, and desktop
- **Dark / Light theme** — Persisted preference, toggled from settings
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
- **canvas-confetti** — Celebration animation on recipe completion
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
