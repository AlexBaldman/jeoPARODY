# 2026-08-25 03:44 ET — ChatGPT — scoring convergence + GameEngine simplification

- **Read/inspected:** approved Jeopardish `GameEngine` and `ScoreRules` fixtures, current production `GameEngine`, dead/tested `core/scoring.js`, `main.js` orchestration, store persistence, current migration strategy.
- **Changed:** replaced the unreachable bonus/penalty scoring stack with one pure clue-value score transition; rewired Main Game to authored clue values and approved reset-to-zero incorrect behavior; replaced the 60 FPS trivia timer loop with one question timeout; removed duplicate in-engine content fetching and shadow-store persistence; made achievement state serializable; added deterministic GameEngine timing/scoring/boundary tests.
- **Evidence/tests:** branch `refactor/canonical-scoring`; full PR CI/browser/security proof required before merge.
- **Decisions:** Main Game scoring parity is now deliberately simple: correct adds clue value, incorrect/timeout resets current score to zero, no hidden time/difficulty/streak point multipliers. Streak remains a separate state fact. H2H keeps its own mode scoring authority. Content fetching belongs to `main.js`/question services, not domain truth.
- **Unresolved:** remove transitional dev performance compatibility once `main.js` stops polling the engine; rerun reachability and retire old controller/validator/constants families only if no real consumers remain; continue capability reconciliation under #60.
- **Next lead domino:** exact-head CI, then dead duplicate authority cleanup + one more GameEngine boundary pass if evidence warrants it.
- **Refs:** `refactor/canonical-scoring`, issue #60, donor `Jeopardish/tests/engine.test.mjs`.
