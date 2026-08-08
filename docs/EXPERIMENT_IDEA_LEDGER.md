# Jeopardish Experiment Idea Ledger

This ledger feeds the canonical roadmap in [PRODUCTION_REMEDIATION_PLAN_2026-05-26.md](PRODUCTION_REMEDIATION_PLAN_2026-05-26.md). The ideas here are candidates, not commitments.

This ledger preserves useful ideas from messy, unfinished, or oversized branches so cleanup does not erase creative direction. Items here are not release commitments; they are candidates to rebuild cleanly when the core MVP can support them.

## High-value ideas to rebuild for MVP

### Arcade cabinet / funky game-show frame

- Source: `origin/ui-revamp-jeoparody`, `origin/implementing-some-newness`, screenshots.
- Why it matters: this is the strongest identity signal. Jeopardish should not feel like a generic quiz form.
- Rebuild condition: keep clue readability and mobile responsiveness as hard constraints.
- MVP shape: neon arcade shell, crisp clue card, tactile buttons, score panel, responsive layout.

### Comedy ticker / host quips

- Source: `origin/carmack-refactor-v3:src/services/ComedyTicker.js`, `ticker-messages.json`.
- Why it matters: adds personality between clues without blocking play.
- Rebuild condition: local curated messages first; no network or AI dependency for core play.
- MVP shape: compact ticker with welcome, correct, incorrect, streak, and idle messages.

### Host reactions and image cycling

- Source: `origin/carmack-refactor-v3`, `origin/implementing-some-newness`, existing Trebek assets.
- Why it matters: makes correct/incorrect outcomes feel alive.
- Rebuild condition: small optimized asset set only; respect reduced motion.
- MVP shape: switch host pose or apply a short CSS reaction on answer results.

### Explainable answer validation

- Source: `origin/carmack-refactor-v3:src/utils/answerValidator.js`, current `game-logic.js`.
- Why it matters: fuzzy matching is useful, but players need to know why an answer was accepted or rejected.
- Rebuild condition: preserve strict rejection of tiny substring guesses.
- MVP shape: validator returns `{ isCorrect, reason, normalizedUserAnswer, normalizedCorrectAnswer }`.

### Smarter scoring

- Source: `origin/carmack-refactor-v3:src/core/scoring.js`, current clue value scoring.
- Why it matters: score should create momentum without being opaque.
- Rebuild condition: keep math obvious and testable.
- MVP shape: clue value + streak bonus; no time pressure until the input loop feels excellent.

### Daily board

- Source: product audit and older branch design direction.
- Why it matters: a board turns flashcards into a game session.
- Rebuild condition: question bank can produce category/value groups reliably.
- MVP shape: 6 categories x 5 values, with used clues marked off.

### Review misses

- Source: product audit and learning goal.
- Why it matters: turns trivia into learning.
- Rebuild condition: local persistence is stable and privacy-neutral.
- MVP shape: save missed clue IDs locally and offer a review mode.

## Later-stage ideas

### AI host personality

- Source: `origin/carmack-refactor-v3`, `AI-trebek/*`, `__DEV/AI/*`.
- Why it matters: could make the game feel surprising and bespoke.
- Why it waits: network/credential complexity is wrong for the first final MVP.
- Future shape: generated quips/explanations cached behind a local fallback.

### Firebase auth, profile, leaderboard

- Source: `origin/implementing-some-newness`.
- Why it matters: competitive/social layer.
- Why it waits: scoring and anti-cheat rules need to stabilize first.
- Future shape: optional sign-in after local play is excellent.

### Audio package

- Source: `origin/carmack-refactor-v3` audio work.
- Why it matters: arcade feel improves dramatically with tasteful sound.
- Why it waits: asset licensing, payload size, and user controls need care.
- Future shape: tiny original/local SFX pack with mute and reduced-motion-friendly behavior.

### Full `src/` rewrite

- Source: `origin/carmack-refactor-v3`.
- Why it matters: some module boundaries are directionally good.
- Why it waits: the branch is too large, noisy, and mixed with unrelated churn.
- Future shape: incremental extraction from current working app, one tested module at a time.

## Branch disposition notes

- Merge directly: only small, reviewed branches with clean scope.
- Cherry-pick manually: `ui-revamp-jeoparody` UI ideas, PR tooling scripts if still useful.
- Mine only: `carmack-refactor-v3`, `implementing-some-newness`, `github-pages`.
- Delete after confirmation: merged or unrelated branches once ideas above are preserved and no open PR depends on them.
