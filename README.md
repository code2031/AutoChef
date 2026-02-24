# AutoChef

An AI-powered recipe generator. Type in what's in your pantry, snap a photo of your fridge, paste a recipe URL, or search by dish name — AutoChef generates a gourmet recipe, renders a photorealistic image, and gives you everything you need to cook it.

## Features

### Recipe Generation
- **Fridge Scanner** — Upload a photo and AI vision identifies every visible ingredient
- **By Ingredients** — Enter what you have; pick from 3 AI-suggested recipe names before full generation
- **By Dish Name** — Type any dish (e.g. "Tiramisu", "Pad Thai") and get a complete recipe instantly
- **Import Recipe** — Paste a URL or any raw recipe text; AI parses it into the full recipe format
- **Historical Recipe** — Generate any dish as it would have been cooked in a chosen era: Medieval Europe, Victorian England, 1920s Paris, Ancient Rome, Ming Dynasty, or Ottoman Empire
- **A/B Recipe Test** — Generate two variations of a recipe side by side and pick your favourite
- **I'm Feeling Lucky** — Skip suggestions entirely; generates a recipe from your ingredients in one click
- **Gourmet Recipes** — Full recipe with ingredients, instructions, nutrition macros, wine pairing, chef's tip, and a smart substitution
- **Dish Visualization** — Pollinations.ai renders a photorealistic food photo with selectable style (plated / overhead / rustic / close-up)
- **Surprise Me** — Picks a random curated set of ingredients and generates a recipe instantly
- **Recipe of the Day** — Date-derived dish suggestion appears as a quick chip in the generate view
- **Similar Recipe** — Generate a different dish in the same style as the current recipe
- **Variants** — Make any recipe Healthier, Cheaper, Easier (beginner-friendly), Harder (advanced techniques), or translated to another language
- **Recipe Remix** — Pick any two saved recipes and AI fuses them into a new creative fusion dish
- **Pairing Suggestions** — After each recipe loads, AI suggests 3 complementary sides, starters, or desserts
- **Restaurant Dish Recreator** — Enter a restaurant name and dish (e.g. "Noma, Celeriac shawarma") and AI recreates the recipe in that restaurant's style
- **Flavor Pairing Explorer** — AI identifies complementary flavors for a recipe with explanations of why each pairing works
- **Smart Recommender** — "What should I cook?" button suggests a dish based on your recipe history, pantry contents, and time of day

### Customization
- **Dietary filters** — Vegetarian, vegan, keto, gluten-free, plus cuisine style, spice level, and serving size
- **Allergy exclusions** — Nuts, dairy, eggs, shellfish, soy, gluten
- **Banned Ingredients** — Permanently exclude any ingredient from all recipes
- **Calorie Cap** — Set a maximum calories-per-serving target enforced during generation
- **Time Limit** — "Ready in X min" cap forces quick techniques and shorter recipes
- **Chef Persona** — Home Cook, Pro Kitchen, Street Food, or Michelin style shapes recipe tone and technique
- **Mood / Occasion** — Dinner party, meal prep, quick lunch, BBQ, and more
- **Leftover Mode** — Forces every listed ingredient to appear; zero-waste cooking
- **Kid-Friendly Mode** — Overrides spice to mild; simple techniques, no alcohol
- **Gut Health Mode** — Steers recipes toward fermented foods, high-fibre ingredients, and probiotics
- **Zero-Waste / Root-to-Stem Mode** — Encourages use of the whole vegetable including peels, stems, and tops
- **Custom Prompt** — Append your own instruction to every recipe generation (e.g. "always include a vegan variation")
- **Persistent Pantry** — Save staple ingredients with optional expiry dates and storage zone (🗄️ Pantry / 🧊 Fridge / ❄️ Freezer); colour-coded freshness badges; zone filter tabs; add all to any recipe in one click
- **Auto-Reorder List** — Expired pantry items are automatically collected into a collapsible reorder list with one-click copy
- **Grocery Receipt Import** — Paste a receipt or ingredient list in the Pantry drawer; AI extracts food items and bulk-adds them

### Cooking Experience
- **Mise en Place** — Pre-cooking prep checklist extracted from the instructions; check off tasks before starting
- **Cooking Mode** — Full-screen step-by-step overlay with simultaneous countdown timers per step and audio beep when done
- **Cooking Notes** — Add notes to individual steps during cooking mode; saved back to recipe history when you exit
- **Voice Readout** — Cooking mode reads each step aloud via Web Speech API; a separate **Read Aloud** button on the recipe view reads the full recipe (ingredients + all steps) outside of cooking mode
- **Hands-Free Voice Commands** — Enable mic in Cooking Mode to say "next", "back", or "start/stop timer" without touching the screen
- **Beat-the-Clock Mode** — Start Cooking Mode with a countdown timer; bar turns amber then red as the deadline approaches
- **Cook-with-a-Friend** — Split steps between 2–4 people in Cooking Mode; each person sees only their assigned steps highlighted
- **Swipe Gestures** — Swipe left/right in cooking mode to navigate steps
- **Kitchen Timer** — Floating multi-timer widget from the Navbar; multiple named timers simultaneously; Long Cook mode for multi-day timers (sourdough, brining) persisted across reloads
- **Multi-Dish Sync Planner** — Enter dishes with cook times, set a serve time, and get a backwards-calculated start schedule so everything finishes together
- **Batch Prep Scaling** — AI scales any recipe to a custom number of servings (e.g. 20 for meal prep), with adjusted quantities and tips
- **Inline Step Timers** — Tap any time-mentioned step to start a countdown directly in the recipe view
- **Safe Temperature Guide** — Inline 🌡️ badge on steps containing meat or fish showing the safe internal temp; respects °C/°F setting
- **Technique Explainer** — Hover or tap underlined cooking terms (julienne, deglaze, braise, etc.) for plain-English definitions
- **Knife Cuts Guide** — Tap any cut technique (julienne, brunoise, chiffonade, dice, mince, bias cut) to open a step-by-step diagram modal
- **Ingredient Checklist** — Tap ingredients to cross them off as you cook
- **Serving Scaler** — Scale ingredient quantities ½x, 1x, 2x, 3x, or any custom number; all numeric quantities in the ingredient list are automatically recalculated

### Input
- **Voice Input** — Dictate ingredients using the browser's Web Speech API
- **Paste to Split** — Paste a comma- or newline-separated ingredient list and it auto-splits into tags
- **Ingredient Autocomplete** — Inline suggestions as you type, with emoji per ingredient; drag to reorder tags
- **Recent Ingredients** — Quick-add chips from your last 20 used ingredients
- **Ingredient of the Week** — A rotating featured ingredient chip to inspire new dishes
- **Surprise Cuisine** — Randomly picks a cuisine style for you

### Recipe Details
- **Recipe Story** — AI-generated 2–3 sentence cultural or historical background, auto-loaded with each recipe
- **Common Mistakes** — AI lists 3 common pitfalls and fixes for the dish, auto-loaded and shown in a collapsible section
- **Ingredient Prep Tips** — Tap any ingredient to get an AI tip on how to prep, store, and its shelf life; tap "See substitutes →" in the popover to load 3 AI-suggested alternatives
- **Seasonal Availability** — 🌱 badge on ingredients that are currently in season
- **Plating Guide** — 7 professional plating tips (odd numbers, clock method, height, sauce smearing, etc.) with recipe-specific colour advice
- **Regional Variants** — Adapt the recipe to 8 cuisine styles (Mexican, Italian, Indian, Japanese, Thai, French, American, Mediterranean) via AI
- **Secret Ingredient** — AI suggests one surprising ingredient to elevate the dish, with reasoning and instructions
- **Chef's Letter** — AI writes a personal note from the chosen chef persona about the recipe
- **Recipe Haiku** — AI generates a 5-7-5 haiku about the dish
- **Flavor Profile Radar** — SVG spider chart showing sweet, savory, spicy, umami, tangy, and fresh scores
- **Recipe Card Export** — Save a styled two-panel PNG card (800×1160px): front shows dish photo, stats, and description; back shows full ingredients list and numbered steps — HelloFresh style, via the native Canvas API
- **Nutrition Bars** — Visual macro bars for protein, carbs, fat, and fiber; turn red when a bar exceeds your daily goal; calories shown per serving
- **Nutrition Goals** — Set personal daily targets (calories, protein, carbs, fat) in settings
- **Anti-Inflammatory Score** — Keyword-based badge showing whether the recipe is anti-inflammatory, moderate, or pro-inflammatory
- **GI Estimate** — Glycemic index estimate badge (Low / Medium / High GI) based on key ingredient detection
- **Hydration Badge** — Shown when the recipe contains 2+ high-water ingredients (cucumber, broth, watermelon, etc.)
- **Equipment List** — Collapsible list of kitchen tools needed, auto-detected from the instructions
- **Prep/Cook Time Split** — Separate prep and cook times when provided
- **Estimated Cost** — Rough per-batch ingredient cost estimate (uses recipe ingredients, not input tags)
- **Carbon Footprint** — Colour-coded environmental impact score
- **Allergen Highlights** — Flagged ingredients that match your allergy settings
- **Difficulty Tooltip** — Hover the difficulty badge for a plain-language explanation
- **Recipe Complexity Score** — Simple / Moderate / Complex / Expert badge computed from ingredient count, step count, and equipment
- **Calorie Burn Estimator** — Collapsible panel showing minutes of walking, cycling, and running needed to burn the meal's calories (assumes avg 70 kg)
- **Pantry Match Checker** — 🧺 Pantry button in the ingredient list cross-references recipe ingredients against your saved pantry items and shows a have / need-to-buy breakdown instantly
- **Read Aloud** — Reads the full recipe (name → ingredients → steps) via the Web Speech API; toggle to stop mid-read
- **Metric ↔ Imperial Toggle** — Switch any recipe's ingredient quantities between grams/ml and oz/fl oz/lbs with one tap
- **Banned Ingredient Warning** — Ingredients matching your banned list are highlighted with a red ⚠️ badge directly in the recipe
- **Save as HTML** — Download a fully self-contained offline recipe card as a `.html` file (no internet required to view)
- **Recipe Card Theme** — Choose from 5 colour themes (orange, blue, green, purple, red) before exporting the recipe card PNG

### History & Saving
- **Recipe History** — All generated recipes saved to localStorage with thumbnail, rating, and favourite toggle
- **Auto-Tags** — On save, AI generates 4–5 descriptive tags (e.g. `weeknight`, `high-protein`, `one-pan`) automatically
- **Recipe Versioning** — When you apply a variant (Make Healthier, etc.), the previous version is preserved in history
- **Recipe Collections** — Organise saved recipes into named cookbooks / folders
- **Recipe Remix** — Select 2 recipes from history; AI fuses them into a creative fusion dish
- **Cook Count** — "Done!" in Cooking Mode increments a per-recipe counter shown on history cards; Stats highlights your most-cooked dish
- **Cooking Stats Dashboard** — Stats tab in History: **Signature Dish** banner (most-cooked recipe with image, shown when cooked ≥2×), summary cards, top ingredients chart, cuisine breakdown, weekly activity, difficulty distribution, **Flavor DNA** tab (aggregate radar chart of all cooked recipes, dominant flavors, blind spots, and a diversity score); **Export CSV** downloads all data as a spreadsheet
- **Difficulty Progression Chart** — SVG polyline showing your last 20 recipes plotted by difficulty (Easy→Hard) over time, colour-coded per level
- **Weekly Digest** — AI-generated weekly recap of your cooking activity: highlights, encouragement, and a personal summary
- **Recipe Clone** — Clone any saved recipe (adds a "(Copy)" suffix) to create a variant without overwriting the original
- **Side-by-Side Recipe Comparison** — Select 2 history entries and compare them across all stats (time, nutrition, difficulty, ingredients) in a full modal table
- **Cuisine Passport** — Visual stamp collection showing which of 8 global cuisines you've cooked; stamps unlock as you save recipes from each cuisine
- **Cooking Journal** — Daily free-text diary attached to History; record observations, experiments, and notes over time
- **Daily Food Log** — Log every meal with name and macros; see today's totals, goal progress bars (green/amber/red vs your daily targets), macro balance score, a collapsible 7-day average, a **14-day calorie trend bar chart** (color-coded vs your goal with a dashed goal line), and a hydration reminder calibrated to your calorie intake; quick-log chip pre-fills from your last generated recipe
- **Seasonal Recipe Calendar** — Browse in-season produce month by month; tap any ingredient to add it directly to your recipe inputs
- **Random Recipe** — 🎲 Random button in History header instantly loads a random saved recipe
- **Want-to-Cook Wishlist** — 🔖 Bookmark icon on every history card adds the recipe to a dedicated Wishlist tab for recipes you plan to cook next
- **Pantry Analytics** — Toggle in the Pantry drawer: freshness distribution, expiring-soon count, and category breakdown
- **Expiry Recipe Rush** — 🚨 button in Pantry drawer adds all items expiring within 3 days to the ingredient input so you can use them before they go off
- **Weekly Grocery Budget** — Set a weekly budget in Settings; displayed in the Cooking Stats dashboard
- **Multi-Recipe Shopping Merge** — Multi-select recipes from History and merge their ingredient lists into a single deduplicated, aisle-grouped smart shopping list; send directly to **Home Assistant** or **Google Tasks** with one tap
- **Pantry Recipe Matcher** — "🧺 What Can I Make?" in the generate view cross-references your pantry against all saved recipes and shows match percentages; tap "Cook This →" to load the recipe, or "Generate New" to create a fresh recipe from pantry items
- **Meal Planner** — Tap a saved recipe to select it, then tap any meal slot to assign it (Mon–Sun weekly grid, Breakfast / Lunch / Dinner); fully works on mobile and desktop; generates a combined smart shopping list for the whole week, deduplicated and grouped by supermarket aisle; **AI Prep Guide** (shown when ≥3 meals assigned) generates a day-by-day prep schedule and make-ahead task checklist
- **Monthly Challenges** — Track four monthly goals: cook 10 recipes, try 5 cuisines, save 5 favourites, use 20 unique ingredients
- **Search & Sort** — Search history by name, tags, or notes; sort by date, name, or rating
- **Tags & Notes** — Add custom tags and personal notes to any saved recipe
- **Export** — Download your full recipe history as a JSON file
- **Activity Heatmap** — 5-week grid showing your cooking frequency
- **Streak Tracking** — Daily streak counter with personal best
- **XP Level System** — Earn XP for every recipe generated, saved, and cooked; progress through 21 levels (Apprentice → Grand Maître) with a visual progress bar and gradient level banner in the new Trophy tab
- **Trophy Case** — Dedicated 🏆 tab in History: level banner, streak stats, and a 5-column badge grid showing all 10 badges with unlock hints for locked badges and full descriptions for unlocked ones
- **Gallery / Moodboard View** — Toggle between the standard card grid and an image-first masonry gallery layout in Recipe History; hover (desktop) or always-visible strip (mobile) shows recipe name and rating
- **Post-Cooking Summary** — After finishing Cooking Mode, a modal shows your elapsed cook time, a 5-star rating prompt, a one-tap "Log to Food Log" button, and AI-generated leftover storage tips per component

### Sharing & Output
- **Share & QR** — Every recipe gets its own shareable URL (compressed, shortened via is.gd); QR code links directly to the exact recipe including its image — no re-render needed on the recipient's end
- **Shopping List** — One-click grocery list deduplicated and grouped by supermarket aisle (Produce, Meat & Fish, Dairy & Eggs, Bakery, Canned & Dry Goods, Frozen, Herbs & Spices, Oils & Condiments); checkboxes, copy to clipboard, and send to **Home Assistant** or **Google Tasks** (configure in Settings → Integrations)
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
- **Groq API** — LLM text generation and vision (`llama-3.3-70b-versatile`, `llama-4-scout-17b-16e-instruct`)
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
```

Get a free Groq API key at [console.groq.com](https://console.groq.com). Pollinations.ai (image generation) requires no API key — it works out of the box.

**Optional integrations** (configure in Settings → Integrations after launch):
- **Home Assistant**: enter your HA URL and a long-lived access token to send shopping lists to HA
- **Google Tasks**: set `VITE_GOOGLE_CLIENT_ID` in `.env.local` (requires a Google Cloud project with Tasks API enabled), or enter the client ID in Settings → Integrations

### 3. Run the dev server

```bash
npm run dev
```

## Deployment

Live at **[autochef.online](https://autochef.online)** — deploys automatically to GitHub Pages on every push to `main` via GitHub Actions.

Add `VITE_GROQ_API_KEY` as a repository secret — it is wired into the build step in `.github/workflows/deploy.yml`. Pollinations.ai needs no key.

`public/CNAME` contains `autochef.online` and is copied into the deploy artifact so GitHub Pages applies the custom domain on every deploy. Vite `base` is `/` (root) to match the custom domain; the service worker and manifest paths are all root-relative.
