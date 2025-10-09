# Product Requirements Document (PRD) — JeoPARODY (Jeopardish)

## Summary
JeoPARODY is a fast, funny, Jeopardy-style trivia game with an AI host. The MVP focuses on a polished single-player loop with clean scoring, witty AI persona responses, and a maintainable architecture that supports future modes (Study Mode, PAO Trainer, Multiplayer).

## Goals
- Make learning feel like play with a tight Q/A loop and delightful feedback.
- Keep performance high (60fps, <3s initial load) and the codebase easy to evolve.
- Provide a modular AI system that works offline (fallback/mocks) and with real providers when available.

## Non-Goals (for MVP)
- Real-time multiplayer.
- Cloud sync/leaderboards beyond stubbed Firebase config.
- Content authoring tools or UGC marketplace.

## Users & Personas
- Casual learners who enjoy trivia and short sessions.
- Power learners who want explanations and repeatable drills (future Study Mode).
- Instructors interested in classroom/coach-led play (post-MVP).

## Core Use Cases (MVP)
- Start a game quickly from the main menu.
- See a question, type an answer, and submit with Enter or button.
- Receive immediate, funny, context-aware host feedback (AI or fallback lines).
- Track score, streaks, and light achievements; view a compact scoreboard.
- Navigate and play smoothly on mobile and desktop.

## Functional Requirements
- Game Flow
  - Display a question, accept an answer, evaluate correctness, show result, and move on.
  - Support a “new question” action when desired.
  - Manage phases: MENU → LOADING → QUESTION → ANSWERING → RESULT.
- Scoring & Validation
  - Deterministic validation for answers with feedback categories (correct, close, wrong).
  - Maintain score, streaks, basic achievements.
- AI Host
  - Provider abstraction with Gemini first, graceful fallback.
  - Health check and provider readiness detection.
  - Optional mock mode (`use_mock_ai`) for deterministic, offline dev.
  - Settings to control provider order, feature flags, temperature, and seed.
- Media
  - Render images/video/audio via a modal; accessible controls.
- Accessibility
  - Keyboard-friendly input and navigation; respect `prefers-reduced-motion`.
- Performance
  - 60fps animations; minimal layout thrash; small/fast builds via Vite.

## Non-Functional Requirements
- Reliability: No uncaught exceptions in common flows; circuit-breaker behavior for flaky AI.
- Maintainability: Small, single-purpose modules; clear state shapes; event-driven UI.
- Testability: Jest tests for core scoring/validation and AI mock paths.

## Architecture Overview
- Vanilla JS, modular structure:
  - `core/` (pure gameplay logic), `state/` (Redux-like), `services/` (AI/audio/media), `components/` (UI), `styles/` (layered CSS), `utils/` (events/constants/helpers).
- AI system: `src/services/ai.js` (interface, caching, rate-limit) + `src/services/ai/*` providers + `ai-providers.js` registry + `ai/config.js` for flags and settings.
- CSS: `src/styles/app.css` single entrypoint with `@layer` and tokens in `tokens.css`.

## Success Metrics (MVP)
- Technical: 0 console errors on happy path; CI green; ≥60% test coverage on core logic.
- UX: Time-to-first-question < 3s on mid-tier laptop; responsive UI on mobile.
- DevEx: New provider integration < 1 day; new component wiring < 1 hour.

## Out of Scope (MVP)
- Multiplayer networking; real-time sync; accounts/leaderboards (beyond Firebase stub).
- AI-generated questions without human curation.

## Risks & Mitigations
- AI dependency flakiness → health check + fallback provider + mock mode.
- CSS regressions → layered architecture, tokens, and stylelint; visual checks.
- Content/data inconsistencies → typed-ish data helpers and tests for core logic.

## Acceptance Criteria
- Start game, answer flow works end-to-end with correct scoring.
- AI host yields either real provider text (if healthy) or witty fallback.
- Settings modal updates provider order, flags, temperature, and seed.
- Media modal opens and is keyboard accessible.
- Tests pass; build succeeds; no critical a11y violations (labels, roles, focus).

## Future Roadmap (Post-MVP)
- Study Mode with AI explanations and saved notes.
- Category runs and timed challenges.
- Multiplayer modes and leaderboards.
- Authoring tools and content sharing.

