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
- **Ingredient Roulette** — 🎰 Spin an 8-slot wheel that randomly picks ingredients from the full suggestion library; "Use These!" adds them all to your list
- **Cuisine Deep-Dive** — 🌍 Explorer modal: pick a cuisine and get an AI-generated deep-dive covering key ingredients, techniques, home-cook tips, and a fun fact
- **Difficulty Recommender** — Inline nudge (shown after 3+ recipes saved) suggesting whether to try an easier or harder difficulty based on your recent cook history
- **Mood Food Finder** — ❤️ "How are you feeling?" picks a dish to match your mood or craving (cozy, fresh, indulgent, celebrating…)
- **Voice Ingredient Entry** — 🎙️ Speak a sentence ("I've got chicken, garlic and some rice") and AI extracts the individual ingredients into your list

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
- **High-Protein Mode** — 💪 Maximises protein per serving (aim 30g+) with lean proteins and legumes
- **Budget Mode** — 💰 Sticks to cheap, widely-available pantry staples and keeps cost per serving low
- **One-Pan Mode** — 🍳 Restricts the recipe to a single pan, pot, or sheet tray to minimise washing up
- **Skill Level** — Set Any / New / Pro in Settings to tune technique complexity and recipe language
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
- **Voice Input** — Dictate ingredients using the browser's Web Speech API; complex natural-language sentences (e.g. "I have some chicken, a few tomatoes, and leftover rice") are parsed by AI into individual ingredients automatically
- **Paste to Split** — Paste a comma- or newline-separated ingredient list and it auto-splits into tags
- **Ingredient Autocomplete** — Inline suggestions as you type, with emoji per ingredient; drag to reorder tags
- **Recent Ingredients** — Quick-add chips from your last 20 used ingredients
- **Ingredient of the Week** — A rotating featured ingredient chip to inspire new dishes
- **Surprise Cuisine** — Randomly picks a cuisine style for you
- **Meal Type Presets** — Quick Breakfast / Lunch / Dinner / Snack chips set the mood in one tap
- **Speed Mode** — ⚡ `<20 min` toggle forces short recipes (sets a 20-minute time cap)
- **Pantry Expiry Alert** — Red banner at the top of the generate view lists pantry items expiring within 3 days; tap to open the Pantry drawer
- **Clear All Ingredients** — ✕ Clear button removes all ingredient tags in one tap when ingredients are present

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
- **Save as Markdown** — Export any recipe as a `.md` file with full metadata, ingredients, steps, and chef's tip
- **Copy All Ingredients** — One-click copy of all recipe ingredients to clipboard (also available from More panel)
- **Recipe Card Theme** — Choose from 5 colour themes (orange, blue, green, purple, red) before exporting the recipe card PNG
- **Macro Pie Chart** — SVG donut chart showing protein / carbs / fat / fiber ratios for each recipe
- **Nutrition Density Badge** — Scores a recipe's nutrient density (protein + fiber) per calorie (Very Dense / Nutrient-Rich / Moderate / Low)
- **Vegan & Vegetarian Badges** — Auto-detected from ingredients (no meat keywords → vegetarian; no meat + no dairy → vegan)
- **High-Protein Badge** — Shown when protein provides >25% of total calories
- **Allergen Warning** — Red banner if any ingredient in the recipe matches your banned-ingredients list
- **Quick Badges** — One-Pot 🫕, Freezer-Friendly ❄️, Meal Prep 📦, Quick Meal ⚡ — auto-detected from the recipe text
- **Substitution Matrix** — Full-screen modal listing 2 alternatives for every ingredient; dietary filter tabs (Vegan, Gluten-Free, Dairy-Free, Nut-Free) re-fetch with that constraint; "Copy All" clipboard export
- **Leftover Transformer** — Shown after saving a recipe; generates 3 creative next-day dishes using the leftover ingredients
- **Cook-Along Timeline** — SVG Gantt-style view of the cooking flow, with parallel tasks on a second lane; click "View Cooking Timeline" in the recipe view
- **Allergy Cross-Check** — Inline warning banner below the recipe description when any ingredient matches your allergy settings; detects gluten, dairy, nuts, eggs, soy, shellfish, and fish
- **Step-by-Step Photos** — 📸 "See step" button on every instruction step lazy-loads a Pollinations.ai photo illustrating that cooking action
- **Drink Pairings** — 🍷 AI suggests wine, beer, cocktail, and non-alcoholic pairings for any recipe
- **Recipe Debugger** — 🔧 "What Went Wrong?" panel: describe your problem and AI diagnoses the likely cause, explains why it happened, and gives a fix + pro tip
- **Dietitian's Review** — 🩺 Collapsible AI card scoring the recipe out of 10 with a verdict, nutritional strengths, and specific suggestions to make it healthier
- **The Science Behind It** — 🧪 Collapsible AI card explaining the food science (Maillard, emulsification, gluten development…) behind the recipe's key steps, with a practical tip for each
- **Dinner-Party Menu Builder** — 🍽️ AI designs a cohesive 5-course menu (starter, side, main, dessert, drink) around the current recipe
- **Sommelier's Pairing Note** — 🍷 A detailed AI pairing note with a specific style, the logic behind it, a budget pick, and a non-alcoholic alternative
- **Level Up a Skill** — 🎓 AI picks one technique from the recipe worth mastering and gives a simple drill to practice it
- **Add to Pantry** — ➕ One-tap button adds all of a recipe's ingredients straight into your pantry store
- **Water Footprint** — 💧 Estimated freshwater footprint badge (in shower-equivalents) alongside the carbon score
- **Satiety Index** — 🍽️ How filling the dish is per calorie (from protein + fibre): Light → Very Filling
- **Protein-per-Dollar** — 💪 Grams of protein per estimated dollar — handy for budget-conscious gains

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
- **Meal Planner** — Tap a saved recipe to select it, then tap any meal slot to assign it (Mon–Sun weekly grid, Breakfast / Lunch / Dinner); fully works on mobile and desktop; **drag-and-drop** on desktop and mobile (150ms press-and-hold to drag on touch screens, ghost element follows your finger); **AI Fill Plan** generates a full week of suggestions from your pantry and nutrition goals with a preview overlay before applying; generates a combined smart shopping list for the whole week, deduplicated and grouped by supermarket aisle; **AI Prep Guide** (shown when ≥3 meals assigned) generates a day-by-day prep schedule and make-ahead task checklist
- **Monthly Challenges** — Track four monthly goals: cook 10 recipes, try 5 cuisines, save 5 favourites, use 20 unique ingredients
- **Search & Sort** — Search history by name, tags, notes, or ingredients; sort by date, name, rating, cook count, or difficulty
- **Tags & Notes** — Add custom tags and personal notes to any saved recipe; filter to "has notes" quickly
- **Export** — Download your full recipe history as a JSON file; Backup & Restore via the Kitchen Tools menu
- **Activity Heatmap** — 5-week grid showing your cooking frequency
- **Streak Tracking** — Daily streak counter with personal best
- **Trophy Case** — Dedicated 🏆 tab in History: streak stats and a 5-column badge grid showing all 12 badges with unlock hints for locked badges and full descriptions for unlocked ones
- **Gallery / Moodboard View** — Toggle between the standard card grid and an image-first masonry gallery layout in Recipe History
- **Post-Cooking Summary** — After finishing Cooking Mode, a modal shows your elapsed cook time, a 5-star rating prompt, a one-tap "Log to Food Log" button, AI-generated leftover storage tips per component, and **Pantry Depletion** — matching pantry items are shown as checkboxes so you can remove used ingredients from your pantry in one tap
- **Recipe Mastery Badge** — Tracks how many times each recipe was cooked; shows Tried / Familiar / Mastered / Expert / Master badge on history cards
- **Pin to Top** — 📌 Pin any recipe to the top of your history list
- **Rating Filter** — Filter history to Liked / Disliked / Unrated recipes
- **Cuisine Filter** — Quick-tap cuisine chips (Italian/Asian/Mexican/Indian/French/Japanese) filter the history list instantly
- **Bulk Delete** — Multi-select recipes and delete them all in one tap
- **Recipe of the Day** — Deterministic daily suggestion from your saved recipes shown at the top of History
- **Cooking Tip Widget** — Daily rotating chef tip shown in Recipe History; tap ↻ to see the next tip
- **Weekly Challenge Card** — Shows this week's cooking progress: recipes cooked, cuisines tried, and favourites saved
- **Meal Plan Nutrition Dashboard** — Visual weekly calorie and macro overview for your meal plan; per-day bar chart, goal comparison, and empty state when fewer than 3 meals are assigned
- **Daily Challenge** — 🔥 A new mystery ingredient challenge each day shown at the top of the generate view; maintaining a streak updates your gamification stats
- **Average Calorie & Cook Time Stats** — CookingStats dashboard now shows avg calories/serving, total cook time, recipes cooked this month, and recipes ever cooked (not just saved)
- **Streak Calendar** — 🔥 GitHub-style 365-day heatmap in the Stats tab showing your daily cooking frequency; darker orange = more dishes cooked
- **Difficulty HeatMap** — 📅 Monthly calendar colored by the difficulty of dishes cooked each day (Easy=green / Medium=amber / Hard=red)
- **Shopping Staples** — Top-10 most-used ingredients across all your saved recipes, shown in the Stats tab as a ranked staples list
- **Cook-Again Reminder** — Widget in Recipe History surfaces favourite recipes you haven't cooked in 14+ days as gentle nudges
- **AI Collection Suggestions** — "✨ AI Suggest" button in the Collections tab generates smart cookbook groupings from your full recipe history and assigns recipes automatically
- **Tag Auto-Cleanup** — "🧹 Clean Tags" button proposes tag merges (e.g. "pasta" + "Pasta" → "pasta") to deduplicate your tag vocabulary
- **Monthly Nutrition Report** — 📊 Modal in the Food Log tab showing 30-day calorie + macro averages, a day-by-day bar chart, and best/worst days
- **Pantry Ingredient Nutrition** — ℹ️ button per pantry item fetches AI nutrition facts (calories, protein, carbs, fat, fiber per 100 g) in a popover
- **Recipe Mini-Player** — Floating bottom-right card that follows you across all views when a recipe is loaded; one tap returns to the recipe view
- **Cookbook Export** — 📖 Export all your saved recipes as a single self-contained, printable HTML cookbook with a table of contents
- **Ingredient Word Cloud** — Visual cloud of your most-used ingredients across all recipes, sized by frequency, in the Stats tab
- **Meal Planner Quick Actions** — 🎲 Shuffle (random-fill the whole week from saved recipes), 📋 Copy the plan as text, and 🗑️ Clear the week

### Sharing & Output
- **Share & QR** — Every recipe gets its own shareable URL (compressed, shortened via is.gd); QR code links directly to the exact recipe including its image — no re-render needed on the recipient's end
- **Shopping List** — One-click grocery list deduplicated and grouped by supermarket aisle (Produce, Meat & Fish, Dairy & Eggs, Bakery, Canned & Dry Goods, Frozen, Herbs & Spices, Oils & Condiments); checkboxes, copy to clipboard, and send to **Home Assistant** or **Google Tasks** — both services can be configured directly from the shopping list panel (inline setup form) without going to Settings
- **Print** — Print-optimised stylesheet renders the recipe with the AI-generated image, clean layout, and no UI chrome
- **Download as Text** — Save any recipe as a plain `.txt` file
- **Copy Ingredients** — One-click copy of the full ingredient list
- **Social Caption** — Auto-generated caption ready to paste into Instagram, X, etc.
- **Embed Code** — `<iframe>` snippet to embed any recipe on a website
- **Cook Tonight Notification** — Request a browser notification reminder to cook the current recipe
- **Quick Share Bar** — Compact action row below the recipe: Web Share API / clipboard, WhatsApp, email, print, copy recipe name; shows reading time estimate
- **Unit Converter** — Kitchen Tools modal (from Navbar Settings) converts cups/tbsp/tsp/oz/lb/g/ml/l and °C/°F; bi-directional inputs
- **Kitchen Reference Card** — Kitchen Tools modal with measurement equivalents, cooking temperature guide, doneness chart, and substitution table
- **Cups → Grams Converter** — Kitchen Tools modal converting a volume of a common ingredient into a scale weight using ingredient densities (more accurate baking)
- **Food Storage & Shelf-Life Guide** — Searchable, category-filtered reference of how long foods keep in the pantry, fridge, and freezer
- **Wine & Beer Pairing Chart** — Searchable chart matching dishes and proteins to wine and beer styles with a short "why"
- **Herb & Spice Pairing Guide** — Tap a herb or spice to see what it pairs with and how to use it
- **Pantry Staples Checklist** — Interactive, persisted checklist of well-stocked-kitchen staples with a progress bar
- **Backup & Restore** — Kitchen Tools modal to export and import recipe history as JSON

### Accessibility & Appearance
- **Installable PWA** — Install AutoChef to your home screen; works offline with cached assets
- **Responsive Design** — Fully mobile-friendly layout that adapts for phone, tablet, and desktop
- **System Dark Mode** — Automatically follows your OS preference on first visit
- **Dark / Light theme** — Override and persist via settings
- **Font Size** — SM / MD / LG scale, persisted
- **High-Contrast Mode** — Stronger borders and white text for readability
- **Reduce Motion** — Toggle in Settings disables animations and transitions for a calmer, motion-sensitive experience
- **Temperature Unit** — Toggle between °C and °F
- **Keyboard Shortcuts** — Cmd/Ctrl+Enter to generate; H (history), P (planner), G (generate), S (save on result view); panel lists all shortcuts
- **Scroll to Top** — Floating button appears after scrolling down

## Tech Stack

- **React 19** + **Vite 7**
- **Tailwind CSS v4** (via `@tailwindcss/vite` plugin)
- **Groq API** — LLM text generation and vision (`llama-3.3-70b-versatile`, `llama-4-scout-17b-16e-instruct`)
- **Pollinations.ai** — AI image generation (`flux` model; free publishable API key required from [enter.pollinations.ai](https://enter.pollinations.ai))
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
VITE_POLLINATIONS_API_KEY=your_pollinations_key
```

- Get a free Groq API key at [console.groq.com](https://console.groq.com)
- Get a free Pollinations publishable key (pk_…) at [enter.pollinations.ai](https://enter.pollinations.ai) — required since Pollinations moved to authenticated-only access in early 2026

**Optional integrations** — configure directly in the shopping list or via Settings → Integrations after launch:
- **Home Assistant**: enter your HA URL and a long-lived access token. If you see a CORS error, add the AutoChef origin to your HA `configuration.yaml`:
  ```yaml
  http:
    cors_allowed_origins:
      - https://code2031.github.io
      - http://localhost:5173
  ```
- **Google Tasks**: set `VITE_GOOGLE_CLIENT_ID` in `.env.local` (requires a Google Cloud project with Tasks API enabled), or enter the client ID in the shopping list setup panel

### 3. Run the dev server

```bash
npm run dev
```

## Deployment

Deployed to **[code2031.github.io/AutoChef/](https://code2031.github.io/AutoChef/)** — automatically via GitHub Actions on every push to `main`.

Add `VITE_GROQ_API_KEY` and `VITE_POLLINATIONS_API_KEY` as repository secrets — both are wired into the build step in `.github/workflows/deploy.yml`.

Vite `base` is `/AutoChef/` and `public/CNAME` is empty (no custom domain active). To switch to a custom domain: set `base: '/'` in `vite.config.js`, update `public/sw.js` and `src/main.jsx` paths to root-relative, and write the domain to `public/CNAME`.
