# Repository Guidelines

## Project Structure & Module Organization
- `src/` — application code: `core/` (engine, e.g., `src/core/GameEngine.js`), `components/` (UI), `services/` (AI, API, audio), `state/`, `utils/`, `styles/`.
- `assets/` — images, fonts, audio, question data. `public/` — static assets served as‑is.
- `tests/` — unit/integration (e.g., `tests/core/scoring.test.js`).
- `dist/` — production build output. `docs/` — design notes (`ARCHITECTURE.md`, `UI_GUIDE.md`, `Gemini.md`).
- Path aliases (Vite/Jest): `@`, `@components`, `@services`, `@state`, `@utils`.

## Build, Test, and Development Commands
- `npm run dev` — start Vite dev server (port 3000).
- `npm run build` / `npm run preview` — build to `dist/` / serve build.
- `npm test` / `npm run test:watch` / `npm run test:coverage` — Jest (jsdom) with coverage report.
- `npm run lint` — lint JS in `src/`. `npm run lint:css` / `lint:css:fix` — Stylelint for CSS.
- Optional: `npm run analyze` (bundle stats), `npm run purge:css` (PurgeCSS to `dist/assets`).

## Coding Style & Naming Conventions
- ES modules, 2‑space indent, semicolons, single quotes.
- Naming: `PascalCase` components/classes (e.g., `ScoreBoard.js`), `camelCase` functions/vars, `UPPER_SNAKE_CASE` constants.
- Imports: `import App from '@components/App.js'`.
- CSS: use tokens from `src/styles/tokens.css`; BEM‑like modifiers (e.g., `.scoreboard--compact`).

## Testing Guidelines
- Framework: Jest with `jsdom`. Place tests in `tests/**` using `*.test.js` or `*.spec.js`.
- Coverage: ≥ 60% global (see `jest.config.js`). Focus on `core/` and `state/` logic.
- Determinism: mock network/AI (`services/api`, `services/ai`) in unit tests.

## Commit & Pull Request Guidelines
- Commits: imperative and scoped (e.g., `Fix: guard question loader`, `Add: scoreboard pulse`).
- PRs: focused, include summary, test notes, and screenshots for UI changes. Ensure `lint`, `test`, and `build` pass CI (`.github/workflows/ci.yml`).

## Security & Configuration Tips
- Do not commit API keys/secrets. Gemini uses a proxy by default (`/api/gemini`); for local direct key, set `localStorage['gemini_api_key']`.
- Keep configuration centralized in `src/utils/constants.js` and `src/services/ai/config.js`.
- Review `ARCHITECTURE.md` for event vocabulary (e.g., `answer:submit`).

