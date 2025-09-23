# Repository Guidelines

## Project Structure & Module Organization
- `src/` — app code
  - `components/` (UI only), `core/` (game/engine logic; prefer pure functions), `state/`, `services/` (AI, audio, API), `utils/`, `styles/`.
- `assets/` — images, fonts, audio, question data.
- `tests/` — unit/integration roots; Jest looks in `**/__tests__` and `**/*.(spec|test).js`.
- `docs/` — design notes (`ARCHITECTURE.md`, `UI_GUIDE.md`, `DATA.md`).
- Path aliases (Vite/Jest): `@ -> src`, `@components -> src/components`, etc.
  - Example: `import App from '@components/App.js'`.

## Build, Test, and Development Commands
- `npm run dev` — start Vite dev server on port 3000 (opens browser).
- `npm run build` — production build to `dist/`.
- `npm run preview` — serve built assets locally.
- `npm test` / `npm run test:watch` / `npm run test:coverage` — run Jest (jsdom); coverage target ≥ 60% global.
- `npm run lint` — ESLint over `src/`.
- `node scripts/asset-check.js` — verify asset references.
- `npm run analyze` — bundle analysis mode.

## Coding Style & Naming Conventions
- Language: modern ES modules; 2‑space indent; semicolons on; single quotes.
- Naming: camelCase (vars/functions), PascalCase (classes/components, e.g., `GameEngine.js`), UPPER_SNAKE_CASE for constants (see `src/utils/constants.js`).
- Imports: prefer aliases (`@utils/...`) over deep relative paths.
- Structure: small, single‑purpose modules; UI in `components/` orchestrates DOM/events only.

## Testing Guidelines
- Framework: Jest with `jsdom`; setup via `jest.setup.js` (`@testing-library/jest-dom`).
- Location/names: place tests under `tests/` or in `__tests__/`; name `*.test.js` or `*.spec.js`.
- Behavior: avoid real network calls; mock AI/API services. File `tests/integration/test-gemini-integration.js` is excluded from Jest.
- Coverage: maintain ≥ 60% global; focus on `core/` and `state/` logic and critical UI.

## Commit & Pull Request Guidelines
- Commits: imperative subject (≤72 chars). Optional context prefix (`Fix:`, `Refactor:`, `Phase 1:`). Include rationale and link issues.
- PRs: focused scope; clear description; screenshots/GIFs for UI; note testing strategy and risks. Require green `lint`, `test`, and a local `build` before review.

## Security & Configuration Tips
- Do not commit secrets. AI host uses a dev proxy; see README for Gemini config.
- Keep asset paths stable; run `node scripts/asset-check.js` before pushing.
- Prefer environment variables and sample files for local config.

## Architecture Notes
- See `docs/ARCHITECTURE.md` for high‑level design and `docs/UI_GUIDE.md` for UI patterns. Keep new modules aligned with these documents.

