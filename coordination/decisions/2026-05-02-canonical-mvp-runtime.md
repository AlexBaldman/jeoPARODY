# 2026-05-02 - Canonical MVP Runtime

Status: accepted
Owner: Codex
Context:

The repository contains several partially valid app paths: static DOM wiring in `index.html` and `src/main.js`, `GameEngine`, a Redux-like store, component classes, controller/session modules, and a disabled compatibility bridge. The app currently boots through `index.html` and `src/main.js`, while the component/store architecture is not the clearly mounted primary runtime.

## Decision

For the MVP, the canonical runtime is:

`index.html` -> `src/main.js` -> `src/core/GameEngine.js` -> `src/utils/events.js` -> active DOM.

`src/core/scoring.js` is the canonical scoring module. `GameEngine` delegates score calculations to `ScoreCalculator`.

The component/store architecture remains a candidate migration path, not the active MVP runtime, until a future decision promotes it flow by flow.

## Why

- This matches the path the browser actually loads today.
- It preserves momentum by stabilizing the working game instead of starting a broad framework migration.
- It reduces duplicate gameplay rules by making scoring live in one module.
- It gives agents a concrete target when deciding where to make MVP changes.

## Consequences

- MVP gameplay fixes should target `src/main.js`, `GameEngine`, `questionService`, canonical validators, and canonical scoring.
- Component/store work should be avoided unless it is part of an explicit promotion slice with tests.
- Duplicate modules should be retired gradually after their behavior is mapped to the canonical runtime.

## Follow-ups

- Converge answer validation onto one canonical path.
- Converge question loading onto one canonical service.
- Add browser smoke tests for the active runtime path.
- Decide whether component/store modules should be promoted after the MVP loop is stable.
