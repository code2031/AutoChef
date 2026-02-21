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

Both API keys must be available at runtime. The code currently reads them via `process.env.REACT_APP_*`, which is a Create React App convention. **Vite does not expose `process.env`** — the correct pattern is `import.meta.env.VITE_*`. This means keys injected as `VITE_GROQ_API_KEY` won't be picked up until the variable names in `App.jsx` (lines 9–10) are updated to match.

| Integration | Purpose | Model |
|---|---|---|
| Groq (`/openai/v1/chat/completions`) | Ingredient scanning from photos | `llama-3.2-11b-vision-preview` |
| Groq (`/openai/v1/chat/completions`) | Recipe text generation | `llama-3.3-70b-versatile` with `response_format: json_object` |
| Pollinations.ai (`image.pollinations.ai/prompt/…`) | Food photo generation | URL-based, no SDK |

### LLM output parsing

The recipe endpoint uses `response_format: { type: "json_object" }`, so the response is parsed directly with `JSON.parse(data.choices[0].message.content)`.

The vision endpoint returns a plain text JSON array; the code strips potential markdown fences (```` ```json ``` ````) before parsing.

### Styling

- **Tailwind CSS v4** is installed, but `src/index.css` still uses the **v3 `@tailwind` directive syntax** (`@tailwind base/components/utilities`). There is no `postcss.config.js` and no `@tailwindcss/vite` plugin in `vite.config.js`, so Tailwind classes are not processed through a plugin — Vite passes them through esbuild/Rollup as-is. If Tailwind processing breaks, the fix is either to add `@tailwindcss/vite` to `vite.config.js` or add a `postcss.config.js` with `@tailwindcss/postcss`.
- `tailwind.config.js` uses the v3 object export format, which is ignored by Tailwind v4.

## Deployment

GitHub Actions (`.github/workflows/deploy.yml`) builds and deploys to GitHub Pages on every push to `main`.

- Build output: `dist/`
- Vite `base` is hardcoded to `/autochef/` in `vite.config.js` — change this if the repo is renamed
- API keys must be added as **repository secrets** and forwarded to the build step via `env:` in the workflow; the workflow currently does **not** do this, so production builds have no API keys
