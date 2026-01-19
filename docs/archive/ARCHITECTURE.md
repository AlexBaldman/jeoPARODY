# Architecture

One state machine (GameEngine) + one event bus + simple DOM contract.

- Engine: `src/core/GameEngine.js` manages phases, scoring, evaluation.
- Event Bus: `src/utils/events.js` decouples UI/engine.
- UI: `index.html` + `src/main.js` wiring. Mobile-first components.

Principles:
- Isolate engine state (do not pass app store state into engine).
- Normalize events (canonical: `answer:submit`, `answer:evaluated`).
- Keep rendering cheap (transform/opacity only).
- Load only the data needed (question shards).

Layers:
- Services: sound, host, question service.
- UI: header, scoreboard, profile, speech bubble, modes (splash, board, run-category).

