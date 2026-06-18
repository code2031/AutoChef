# Changelog

All notable changes to AutoChef are documented here. Versions follow [semver](https://semver.org/).

## [0.1.0] - 2026-06-18

### Added — Round 10 (35 features)

**Generation modes**
- High-Protein mode — maximises protein per serving (aim 30g+)
- Budget mode — cheap pantry staples, low cost per serving
- One-Pan mode — single pan/pot/tray only
- Skill Level (Settings) — Any / New / Pro tunes technique complexity and language
- Reduce Motion toggle (Settings) — disables animations/transitions (`.reduce-motion`)

**AI features** (`lib/groq.js`)
- `generateNutritionistReview` — Dietitian's Review card (score, verdict, strengths, fixes)
- `generateCookingScience` — "The Science Behind It" card (Maillard, emulsification, etc.)
- `generateThemedMenu` — Dinner-Party Menu builder (5 cohesive courses)
- `generateMoodFood` — Mood Food Finder ("how are you feeling?" → a dish)
- `generateSkillTip` — "Level Up a Skill" card
- `generateWinePairingNote` — Sommelier's pairing note (budget + non-alcoholic options)

**Input**
- Mood Food Finder (GenerateView)
- Voice ingredient entry — speak a sentence, AI extracts ingredient names

**Recipe view**
- StatsBar badges: Water footprint, Satiety index, Protein-per-dollar
- "➕ To Pantry" — add all recipe ingredients into the pantry store

**Kitchen Tools** (Navbar → Settings)
- Cups → Grams converter (ingredient density based)
- Food Storage & Shelf-Life guide (searchable, category-filtered)
- Wine & Beer pairing chart
- Herb & Spice pairing guide
- Pantry Staples checklist (persisted, with progress bar)

**History & planning**
- Cookbook export — printable HTML cookbook of all saved recipes
- Ingredient Word Cloud (Stats tab)
- Meal Planner quick actions — Shuffle / Copy / Clear week

**Libraries**
- `lib/units.js` — measurement conversions + ingredient densities
- `lib/water.js` — freshwater-footprint estimate
- `lib/cookbook.js` — printable-cookbook HTML builder

### Fixed
- Removed stray `.bak`/`.rej`/scratch files from the tree
- Resolved the production build chunk-size warning (vendor splitting + threshold)
- Made the Settings dropdown scrollable (was unreachable on short screens)
- `.gitignore` now covers `test-results/`, `*.bak`, `*.rej`

### Tests & docs
- Extended the universal Groq mock; added 19 Round 10 Playwright tests (126/126 pass)
- CLAUDE.md and README.md document every new feature
