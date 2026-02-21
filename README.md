# AutoChef

An AI-powered recipe generator. Type in what's in your pantry, or snap a photo of your fridge — AutoChef identifies the ingredients and generates a gourmet recipe complete with a photorealistic image of the finished dish.

## Features

- **Fridge Scanner** — Upload a photo and Groq Vision (Llama 3.2) identifies the ingredients automatically
- **Recipe Generation** — Groq (Llama 3.3 70B) generates a full recipe with ingredients, instructions, a chef's tip, and a smart substitution
- **Dish Visualization** — Pollinations.ai renders a photorealistic image of the generated recipe
- **Dietary & vibe filters** — Supports vegetarian, vegan, keto, gluten-free, and cooking styles (quick, fancy, healthy, comfort)

## Tech Stack

- **React 19** + **Vite 7**
- **Tailwind CSS v4**
- **Groq API** — LLM text generation and vision
- **Pollinations.ai** — Free image generation

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up API keys

Create a `.env.local` file in the project root:

```
VITE_GROQ_API_KEY=your_groq_api_key
VITE_POLLINATIONS_API_KEY=your_pollinations_api_key
```

Get a free Groq API key at [console.groq.com](https://console.groq.com). Pollinations.ai keys are optional — image generation falls back gracefully if not provided.

### 3. Run the dev server

```bash
npm run dev
```

## Deployment (GitHub Pages)

The project deploys automatically to GitHub Pages on every push to `main` via GitHub Actions.

Add your API keys as repository secrets:
- `VITE_GROQ_API_KEY`
- `VITE_POLLINATIONS_API_KEY`

Then reference them in `.github/workflows/deploy.yml` under the build step:

```yaml
- name: Build project
  run: npm run build
  env:
    VITE_GROQ_API_KEY: ${{ secrets.VITE_GROQ_API_KEY }}
    VITE_POLLINATIONS_API_KEY: ${{ secrets.VITE_POLLINATIONS_API_KEY }}
```

The `base` in `vite.config.js` is set to `/autochef/` — update this if your repository name differs.
