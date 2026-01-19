# Gemini Agent Guide for jeoPARODY

This document provides essential guidelines for the Gemini agent to effectively understand, navigate, and contribute to the `jeoPARODY` project. Adherence to these principles is critical for maintaining code quality and architectural integrity.

## 1. Project Vision & Philosophy

- **Core Mission:** Create an AI-infused, Jeopardy-style trivia game that is both a delightful, comedic experience and a serious learning engine.
- **Guiding Principle:** "The code should do what it looks like it does." Prioritize simplicity, clarity, and performance over cleverness.
- **Key Pillars:**
    1.  **Data-First Design:** Use clear state shapes, pure functions, and predictable data flow.
    2.  **Performance through Simplicity:** Target 60fps using vanilla JavaScript and direct, efficient DOM manipulation. **This project does NOT use React or Vue.**
    3.  **Extensible by Construction:** Maintain clean separation between `components`, `services`, and `core` logic to enable easy feature injection.
    4.  **Comedy + Clarity:** The UI and host personality should be witty and joyful without compromising maintainability or performance.

## 2. Core Development Workflow

All commands are run from the project root.

| Command                 | Description                                                                  |
| ----------------------- | ---------------------------------------------------------------------------- |
| `npm run dev`           | Starts the Vite development server, typically on `http://localhost:3000`.      |
| `npm run build`         | Creates a production-ready build in the `dist/` directory.                   |
| `npm test`              | Runs the entire Jest test suite.                                             |
| `npm run lint`          | Lints all JavaScript files in `src/` with ESLint.                            |
| `npm run lint:css`      | Lints all CSS files in `src/` with Stylelint.                                |

## 3. Architecture & Code Conventions

### Directory Structure
- **`src/`**: Application source code.
    - **`components/`**: UI-only components. They subscribe to state and emit events.
    - **`core/`**: Pure, dependency-free game logic (e.g., `GameEngine.js`, `scoring.js`). **This is the heart of the game.**
    - **`state/`**: Redux-like state management (`store`, `actions`, `reducer`, `selectors`).
    - **`services/`**: Side effects and external concerns (e.g., `ai.js`, `soundManager.js`, `api.js`).
    - **`styles/`**: Layered CSS architecture. See the CSS section below.
    - **`utils/`**: Shared utilities, constants, and the global event bus.
- **`assets/`**: All static assets (audio, images, fonts, question data).
- **`docs/`**: Project documentation. **`MASTER_PLAN.md` is the primary source of truth.**

### Key Conventions
- **Language:** Modern JavaScript (ES Modules). Use 2-space indentation and single quotes.
- **Naming:**
    - `PascalCase` for classes and components (`ScoreBoard`, `GameEngine`).
    - `camelCase` for variables and functions (`currentScore`, `calculateScore`).
    - `UPPER_SNAKE_CASE` for constants (`src/utils/constants.js`).
- **Imports:** Use path aliases for clean imports (e.g., `import GameControls from '@components/GameControls.js';`).
- **Event-Driven:** Use the global event bus (`src/utils/events.js`) for communication between decoupled modules.

## 4. CSS Style Guide

- **Entry Point:** `src/styles/app.css`
- **Layers (`@layer`):** `base` -> `layout` -> `components` -> `utilities`. All new styles must respect this order.
- **Tokens:** All colors, spacing, fonts, radii, shadows, and z-indexes are defined as CSS Custom Properties in `src/styles/tokens.css`. **Always use a token instead of a magic value.**
- **Naming:** Use BEM-like naming with a base and modifier (e.g., `.scoreboard`, `.scoreboard--basketball`).
- **Z-Index:** Use the z-index map defined in `tokens.css` (e.g., `var(--z-header)`, `var(--z-modal)`).

## 5. Testing Guidelines

- **Framework:** Jest with `jsdom`.
- **Location:** Place tests under `tests/` or in `__tests__/` with `*.test.js` or `*.spec.js` naming.
- **Behavior:** **Mock all network and API services.** Tests must be deterministic and not rely on external services.
- **Coverage:** The project target is **≥ 60%** global coverage. Focus on testing `core/` and `state/` logic.

## 6. AI Integration

The AI is a core feature, providing the host's personality.

- **Primary Service:** `src/services/ai.js` provides a unified interface.
- **Providers:** Provider-specific logic is in `src/services/ai-providers.js`. The system is designed to be multi-provider with graceful fallbacks.
- **Configuration:** For development, the AI can be configured via `localStorage`.
    - **To use a mock AI (no network calls):** `localStorage.setItem('use_mock_ai', '1')`
    - **To use a Gemini API key directly:** `localStorage.setItem('gemini_api_key', 'YOUR_API_KEY')`
- **Contribution:** When working on AI features, ensure changes are made in a modular way that respects the provider abstraction. Test with both the real API and the mock provider.

## 7. Committing and Contributing

- **Pre-Commit Checklist:**
    1.  `npm run lint` passes.
    2.  `npm run lint:css` passes.
    3.  `npm test` passes.
    4.  `node scripts/asset-check.js` runs without errors.
    5.  The application builds and runs correctly via `npm run dev`.
- **Commit Messages:** Use a clear, imperative subject line (≤72 chars) with a prefix (e.g., `Fix:`, `Refactor:`, `Feat:`).
- **Pull Requests:** Keep PRs small and focused on a single feature or fix. Provide a clear description of the changes.