# AutoChef

An AI-powered recipe generator. Type in what's in your pantry, snap a photo of your fridge, or hit **Surprise Me** — AutoChef identifies your ingredients, generates a gourmet recipe, and renders a photorealistic image of the finished dish.

## Features

- **Fridge Scanner** — Upload a photo and Groq Vision (Llama 4 Scout) identifies every visible ingredient
- **Recipe Suggestions** — Pick from 3 AI-generated recipe ideas before committing to a full generation
- **Gourmet Recipes** — Groq (Llama 3.3 70B) returns a full recipe: ingredients, instructions, nutrition macros, wine pairing, chef's tip, and a smart substitution
- **Dish Visualization** — Pollinations.ai renders a photorealistic food photo of the result
- **Cooking Mode** — Step-by-step full-screen overlay with auto-detected countdown timers and an audio beep when done
- **Voice Input** — Dictate ingredients using the browser's Web Speech API
- **Ingredient Autocomplete** — Inline suggestions as you type, with emoji per ingredient; drag to reorder tags
- **Surprise Me** — Picks a random curated set of ingredients and generates a recipe instantly
- **Persistent Pantry** — Save your staple ingredients and add them all to any recipe in one click
- **Recipe History** — All generated recipes saved to localStorage with thumbnail, rating, and favourite toggle
- **Dietary filters** — Vegetarian, vegan, keto, gluten-free, plus cuisine style, spice level, servings, and allergy exclusions
- **Gamification** — Earn points, maintain a daily streak, and unlock badges as you cook
- **Dark / Light theme** — Persisted preference, toggled from the navbar
- **Share & QR** — Every recipe gets its own shareable URL (compressed, shortened via is.gd); QR code links directly to the exact recipe including its image — no re-render needed on the recipient's end
- **Print** — Print-optimised stylesheet renders the recipe with the AI-generated image, clean layout, and no UI chrome

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
