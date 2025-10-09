# AGENTS.md — Working Efficiently in This Repo

Scope: This file applies repo-wide. Follow these instructions when adding or modifying code, tests, styles, or docs.

## Priorities
- Ship stable, readable code. Keep changes small and reversible.
- Maintain 60fps UI and <3s initial load.
- Prefer pure functions and explicit data flow.

## Project Map
- `src/components/` — UI only; subscribe to store/selectors and emit events.
- `src/core/` — Pure game logic (GameEngine, scoring, validation, question).
- `src/state/` — Redux-like store, actions, reducer, selectors, persistence.
- `src/services/` — Side effects (AI, audio, media, API, host system, storage).
- `src/services/ai.js` — Unified AI interface (caching/rate limit; provider selection).
- `src/services/ai/` — Providers (`gemini.js`, `claude.js`, `local.js`, `fallback.js`) + `config.js`, `healthCheck.js`.
- `src/styles/` — Single entry `app.css` with `@layer` and tokens in `tokens.css`.
- `docs/` — Architecture + plans; `docs/PRD.md` is the product spec, `docs/MASTER_PLAN.md` is the engineering plan.

## Coding Conventions
- JavaScript: ES modules, 2-space indent, semicolons, single quotes.
- Naming: `PascalCase` classes/components; `camelCase` vars/functions; `UPPER_SNAKE_CASE` constants.
- Events: Use the canonical bus in `src/utils/events.js` (e.g., `answer:submit`, `question:new`).
- CSS: Import via `src/styles/app.css`. Use tokens in `tokens.css`. Keep `@layer` order: base → layout → components → utilities.
- Accessibility: Keyboard-first interactions, focus management in modals, respect `prefers-reduced-motion`.

## AI System Guidelines
- Provider order and flags live in `src/services/ai/config.js`.
- Prefer proxy-backed Gemini when available; health check via `checkAIHealth()`.
- For offline/dev: `localStorage.setItem('use_mock_ai','1')` to force mock provider.
- SettingsModal can update provider order, flags, temperature, and seed.

## Dev Workflow
- Install: `npm install`
- Dev: `npm run dev`
- Test: `npm test` (Jest); keep tests deterministic (mock network).
- Lint: `npm run lint` and `npm run lint:css`
- Build: `npm run build`; Preview: `npm run preview`

## Change Policy
- One focused change per PR. Update docs when behavior, config, or structure changes.
- If you add a provider or component, document it:
  - Providers → brief note in README (“AI Host Configuration”) + comments.
  - Components → short description in `ARCHITECTURE.md` or UI guide if impactful.

## Commit Messages
- Style: Imperative subject with a clear type prefix. Examples:
  - `feat(ui): add scoreboard edge-peek`
  - `fix(ai): open circuit on 5xx proxy errors`
  - `docs: update PRD with acceptance criteria`
  - `refactor(core): simplify answer validation`

## Where to Look First
- Product: `docs/PRD.md`
- Plan: `docs/MASTER_PLAN.md`
- Architecture: `ARCHITECTURE.md`
- CSS Architecture & Tokens: `docs/CSS.md`, `src/styles/tokens.css`
- Agent context (role-specific): `Gemini.md`, `WARP.md`

## Don’ts
- Don’t introduce frameworks or global state libraries.
- Don’t block the main thread with heavy sync work; schedule or defer.
- Don’t add hard-coded styles; prefer tokens + layered CSS.

