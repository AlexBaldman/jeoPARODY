# Architecture

MVP runtime: `index.html` + `src/main.js` + `GameEngine` + event bus + simple DOM contract.

- Browser boot: `src/main.js` initializes services, event orchestration, and legacy DOM bindings.
- Engine: `src/core/GameEngine.js` manages phases, answer evaluation, score state, statistics, and achievements.
- Scoring: `src/core/scoring.js` is the canonical scoring math. `GameEngine` must delegate to it instead of maintaining duplicate formulas.
- Event Bus: `src/utils/events.js` decouples UI/engine.
- UI: static DOM in `index.html` is the active MVP surface. Component/store modules are useful candidates, but not the primary mounted runtime until an explicit decision promotes them.

Principles:
- Isolate engine state (do not pass app store state into engine).
- Normalize events (canonical: `answer:submit`, `answer:evaluated`).
- Keep rendering cheap (transform/opacity only).
- Load only the data needed (question shards).

Layers:
- Services: sound, host, question service.
- UI: header, scoreboard, profile, speech bubble, modes (splash, board, run-category).

Non-goal for the current MVP:
- Do not start a broad component/store rewrite while stabilizing gameplay. Promote components one flow at a time only after the active DOM path has matching tests.
