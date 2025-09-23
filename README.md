# JeoPARODY (aka Jeopardish)

> “The code should do what it looks like it does.” – John Carmack

An AI-infused, Jeopardy-style trivia experience that hides a serious learning engine inside a delightful, comedic game. Built with a clean, modular architecture designed to evolve into a platform for playful education: single-player mastery, study mode with AI explanations, social competition, and eventually, classrooms and cohorts playing together.

---

### Why this project exists
Learning should feel like play. JeoPARODY turns knowledge into a game loop that’s fast, funny, and sticky—then uses AI to deepen understanding on demand. It’s a foundation for an expandable, creator-friendly ecosystem of game modes, hosts, and content packs.


## Table of Contents
- Vision & Philosophy
- Current Capabilities (MVP)
- Architecture Overview
- Getting Started
- AI Host Configuration (Gemini)
- Optional: Firebase & Cloud Sync
- Content & Media Pipeline
- Testing
- Roadmap
- Contributing
 - Styles
- Legal
- License


## Vision & Philosophy
- Data-first design: Clear state shapes. Pure functions. Predictable flow.
- Performance through simplicity: Vanilla JS + targeted DOM updates; 60fps as a default constraint.
- Extensible by construction: Components, services, and core logic are cleanly separated, enabling easy feature injection (new hosts, modes, data sources, AI providers).
- Comedy + clarity: A witty host and joyful animations without compromising readability, maintainability, or performance.

What it grows into:
- Multi-host AI personalities with distinct voices and prompts
- Study Mode with AI explanations and note-saving
- Multiplayer challenges and social play
- UGC content authoring with AI assistance, sharing, and a deck marketplace
- Classroom/enterprise deployments with analytics and progress tracking


## Current Capabilities (MVP)
- Jeopardy-style Q/A loop with clean scoring and validation
- Modular architecture: `components`, `core`, `state`, `services`, `utils`, `styles`
- AI host scaffolding with Gemini integration via proxy and graceful fallback lines
- Media system with image/video/audio modal support
- Achievements framework and animated scoreboard
- Keyboard-friendly input with “smart Enter” behavior
- Organized assets (images, fonts, questions, audio) under `assets/`
- Vite-based dev/build pipeline

See `docs/MASTER_PLAN.md` for the deeper architecture and planning details.


## Architecture Overview
- Components: UI only; subscribe to store/selectors and emit events
- Core: Pure gameplay logic (`game`, `scoring`, `validation`, `question`)
- State: Redux-like store, actions, reducer, selectors, and `persistence`
- Services: Externalities (AI, audio, media, API, host system, storage)
- Utilities: Constants, events, helpers
- Styles: Consolidated CSS with an ongoing refactor plan

Directory map:
```
jeoPARODY/
├── index.html
├── src/
│   ├── components/          # App, ScoreBoard, GameControls, MediaModal, etc.
│   ├── core/                # Pure game logic (GameEngine, scoring, validation)
│   ├── state/               # store, actions, reducer, selectors, persistence
│   ├── services/            # ai, api, audio, host system, media handler
│   ├── utils/               # events, constants, helpers
│   └── styles/              # app-fixes.css, enhanced-ui.css, media-rendering.css
├── assets/                  # images, fonts, questions, audio, css, scripts, data
├── docs/                    # architecture & plans (see MASTER_PLAN.md)
├── tests/                   # integration and future unit tests
├── vite.config.js           # build config
└── jest.config.js           # test config
```

Representative state shape:
```js
{
  game: {
    phase, score, streak, currentQuestion, showingAnswer, session
  },
  ui: {
    loading, modal, notifications
  },
  user: {
    name, preferences
  },
  settings: {
    soundEnabled, difficulty, autoAdvance, animationsEnabled
  },
  statistics: {
    totalGames, totalQuestions, correctAnswers, totalPlayTime,
    achievements, categoryStats
  }
}
```

Core principles in practice:
- Functions over classes for logic; no hidden state
- Single-responsibility modules and explicit data flow
- Event bus for decoupled UI interactions


## Getting Started
Prerequisites:
- Node.js 20+

Install and run:
```bash
npm install
npm run dev
```
Build and preview:
```bash
npm run build
npm run preview
```

Note: The AI host and Firebase integrations are optional. The game runs without them using graceful fallbacks.


## AI Host Configuration (Gemini)
The AI host uses a Gemini proxy by default for browser safety with fallbacks if unavailable.

- Primary service: `src/services/ai.js` (unified interface + caching)
- Providers: `src/services/ai-providers.js` (Gemini via proxy, Claude placeholder, fallback)

Options:
1) Use the proxy (recommended for development)
- Expected endpoints (default):
  - `http://localhost:3002/api/gemini/health`
  - `http://localhost:3002/api/gemini/generate`
- The app will auto-detect the proxy and enable AI replies when healthy.

2) Direct API key (NOT YET IMPLEMENTED IN-CODE)
- The provider detects `localStorage.getItem('gemini_api_key')`, but direct API calls are not implemented in the current code path. Use the proxy.

If neither is available, the host will use witty canned lines so the game remains fully playable.

Developer tip:
- To force a mock AI (no network), open DevTools and run: `localStorage.setItem('use_mock_ai','1')`. Remove with `localStorage.removeItem('use_mock_ai')`.


## Optional: Firebase & Cloud Sync
The HTML references Firebase compat scripts and `dist/js/firebase-config.js`. This is a stub for future features (auth, leaderboard, cloud saves). You can:
- Provide your Firebase config at `public/dist/js/firebase-config.js` (match the expected global config)
- Or remove the script tag in `index.html` if not using Firebase yet

Planned Firebase uses:
- Auth: anonymous + OAuth providers
- Firestore/RTDB: user profiles, stats, leaderboards


## Content & Media Pipeline
- Questions live in `assets/questions/` (TSV/CSV/JSON supported). Import flows are simple to adjust in `src/services/api/`.
- The media system renders thumbnails and opens a modal for images, video, and audio with accessible controls. See `src/services/MediaHandler.js` and `src/styles/media-rendering.css`.


## Testing
- Unit/Integration tests via Jest
```bash
npm test
npm run test:watch
npm run test:coverage
```
- E2E (planned): Cypress/Playwright to be added; see `docs/MASTER_PLAN.md`


## Roadmap
Short version; see `docs/MASTER_PLAN.md` for full context.

- Phase 1: Host Personality System
  - Multi-host architecture, gallery UI, distinct prompts, personality fx
- Phase 2: Advanced Modes
  - Category runs, time challenges, Study Mode with AI explanations
- Phase 3: Social + Multiplayer
  - Real-time 1v1, friend system, leaderboards, mobile polish
- Continuous: Performance, accessibility, testing, bundle hygiene

Open technical items are tracked in `docs/MASTER_PLAN.md`.


## Contributing
- One feature per PR; keep edits focused and reversible
- Add tests for core logic
- Favor pure functions, immutable state, explicit data flow
- Follow naming conventions and keep modules small and readable
- Document architectural decisions

Start here:
- Read `docs/MASTER_PLAN.md` for the current source of truth, priorities, and success metrics

Contributor resources:
- Repository Guidelines: `AGENTS.md`
- Architecture Overview: `ARCHITECTURE.md`
- UI Guide: `UI_GUIDE.md`
- Data Reference: `DATA.md`
- AI Provider Setup: `docs/AI_PROVIDER_SETUP.md`
- CSS Refactor Plan: `docs/css-refactor-plan.md`
- Media Rendering Implementation: `docs/MEDIA_RENDERING_IMPLEMENTATION.md`
- Dev Workflow & Agent Usage: `WARP.md`

## Styles
- Single entrypoint: `src/styles/app.css` (uses CSS `@layer` for base/layout/components/utilities).
- Tokens: `src/styles/tokens.css` defines colors, spacing, radii, shadows, z-index, and header height.
- Components: themed scoreboard and speech bubble live under `src/styles/components/`.
- Guide: see `docs/CSS.md` for the z-index map, naming, and layering rules.

## Changelog
- 2025-09-23
  - CSS architecture: single entrypoint with `@layer` (base/layout/components/utilities)
  - Tokens: added `src/styles/tokens.css` (colors, spacing, radii, shadows, timings, z-index, header height)
  - Components: new `src/styles/components/scoreboard.css` and `src/styles/components/speech-bubble.css`
  - Theming: scoreboard and speech bubble now use modifier classes and CSS variables; dev theme cycling enabled
  - Layering: standardized z-index usage across app; removed duplicate tokens from `enhanced-ui.css`
  - A11y: modal focus trap and role/aria; header height tokenized
  - AI: mock provider toggle (`localStorage.setItem('use_mock_ai','1')`); health-check utility scaffolded
  - Tests: added unit tests for scoring/validation and a mock AI toggle test
- Docs: added `docs/CSS.md`; updated README, WARP.md, CONTRIBUTING.md, and added `AGENTS.md`

## Screenshots (optional)
- Quick local screenshots via Playwright (requires Playwright):
  - Start dev: `npm run dev`
  - Capture: `npm run snap` (uses `scripts/playwright-sample.mjs`)
  - Set `BASE_URL=http://localhost:3000` to target a different URL
- Or use MCP servers (see `docs/MCP.md`) to let an agent navigate, screenshot, and inspect console/DOM.

## Dev HUD (optional)
- Toggle a small overlay (FPS, event counts, score) in dev:
  - In the browser console: `localStorage.setItem('dev_hud','1'); location.reload();`
  - Disable: `localStorage.removeItem('dev_hud'); location.reload();`


## Legal
JeoPARODY/Jeopardish is a parody/tribute project not affiliated with Jeopardy Productions, Inc. The AI host is designed to be respectful and original; questions may be transformed/reworded by AI to preserve originality. All referenced trademarks and copyrights belong to their respective owners.


## License
MIT. See LICENSE when provided, or treat this repository as MIT-licensed by default per the project’s historical documentation.

---

Built with focus, maintained with discipline, and designed to make learning feel like play.
