# Contributing to jeoPARODY

This document provides guidelines for all contributors, human or AI, to ensure code quality, consistency, and alignment with the project's vision.

## Core Principles
- **Clarity over Cleverness:** Write simple, readable code.
- **Measure, Then Optimize:** Profile performance before refactoring for speed.
- **One Event Vocabulary:** Use the canonical events defined in `src/utils/events.js` (e.g., `answer:submit`).
- **Respect Accessibility:** Design for mobile-first, support keyboard navigation, respect `prefers-reduced-motion`, and use ARIA attributes.

## Project Structure & Module Organization
- `src/` — app code
  - `components/` (UI only), `core/` (game/engine logic; prefer pure functions), `state/`, `services/` (AI, audio, API), `utils/`, `styles/`.
- `assets/` — images, fonts, audio, question data.
- `tests/` — unit/integration roots; Jest looks in `**/__tests__` and `**/*.(spec|test).js`.
- `docs/` — design notes (`ARCHITECTURE.md`, `UI_GUIDE.md`, `DATA.md`).
- **Path Aliases:** Use Vite/Jest path aliases for clean imports (e.g., `import App from '@components/App.js'`).

## Build, Test, and Development Commands
- `npm run dev` — start Vite dev server on port 3000.
- `npm run build` — production build to `dist/`.
- `npm run preview` — serve built assets locally.
- `npm test` — run all Jest tests.
- `npm run lint` — lint all JS files in `src/`.
- `npm run lint:css` — lint all CSS files in `src/`.
- `node scripts/asset-check.js` — **run before committing** to verify asset references.

## Coding Style & Naming Conventions
- **Language:** Modern ES modules; 2‑space indent; semicolons on; single quotes.
- **Naming:** `PascalCase` for classes/components, `camelCase` for variables/functions, `UPPER_SNAKE_CASE` for constants.
- **CSS:** Use tokens from `src/styles/tokens.css`. Follow BEM-like naming (`.scoreboard`, `.scoreboard--basketball`).
- **Structure:** Keep modules small and single-purpose.

## Testing Guidelines
- **Framework:** Jest with `jsdom`.
- **Behavior:** Mock all network calls and API services to keep tests fast and deterministic.
- **Coverage:** Aim for ≥ 60% global coverage, with a focus on `core/` and `state/` logic.

## Commit & Pull Request Guidelines
- **Commits:** Use an imperative subject line (e.g., `Fix: ...`, `Add: ...`).
- **PRs:** Keep them focused on a single feature or bug. Provide a clear description and testing notes. All checks (`lint`, `test`) must pass.

## Security & Configuration
- **Secrets:** Never commit API keys or other secrets.
- **Configuration:** Use environment variables for local configuration. The AI host uses a dev proxy by default.

## AI Agent Instructions
- AI agents should refer to **`Gemini.md`** for detailed, role-specific instructions and project context.