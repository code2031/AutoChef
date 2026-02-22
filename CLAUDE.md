# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Dev server with HMR (Vite)
npm run build     # Production build → dist/
npm run preview   # Preview the production build locally
npm run lint      # ESLint (flat config, eslint.config.js)
```

No test suite is configured.

## Architecture

AutoChef is a **single-file React SPA** — all application logic lives in `src/App.jsx`. There are no routes, no additional components, and no state management library.

### View state machine

Navigation is handled by a single `view` state variable with three values:

```
'landing' → 'generate' → 'result'
```

The `reset()` function returns to `'generate'`. There is no router.

### API integrations

API keys are read at the top of `App.jsx` via `import.meta.env.VITE_GROQ_API_KEY` and `import.meta.env.VITE_POLLINATIONS_API_KEY`. For local dev, set them in `.env.local`. For production, they must be added as GitHub repository secrets (see Deployment section).

| Integration | Purpose | Model |
|---|---|---|
| Groq (`/openai/v1/chat/completions`) | Ingredient scanning from photos | `meta-llama/llama-4-scout-17b-16e-instruct` |
| Groq (`/openai/v1/chat/completions`) | Recipe text generation | `llama-3.3-70b-versatile` with `response_format: json_object` |
| Pollinations.ai (`gen.pollinations.ai/image/…`) | Food photo generation | `flux`, URL-based GET request, no SDK |

### LLM output parsing

The recipe endpoint uses `response_format: { type: "json_object" }`, so the response is parsed directly with `JSON.parse(data.choices[0].message.content)`.

The vision endpoint returns a plain text JSON array; the code strips potential markdown fences (```` ```json ``` ````) before parsing.

### Styling

Tailwind CSS v4 via the `@tailwindcss/vite` plugin (configured in `vite.config.js`). `src/index.css` uses the v4 `@import "tailwindcss"` syntax. `tailwind.config.js` is a v3 remnant and is ignored by Tailwind v4.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on every push to `main`.

- Build output: `dist/`
- Vite `base` is `/AutoChef/` in `vite.config.js` — must match the GitHub repo name exactly (case-sensitive on GitHub Pages)
- Both `VITE_GROQ_API_KEY` and `VITE_POLLINATIONS_API_KEY` are required and must be added as repository secrets; they are already wired into the build step via `env:` in the workflow
