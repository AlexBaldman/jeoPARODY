---
status: canonical
owner: architecture
updated: 2026-08-21
---

# Architecture Overview

JeoPARODY is the long-term canonical product runtime. Jeopardish remains a behavioral oracle and donor while proven behavior is deliberately absorbed.

## Product spine

```text
INPUT / UI
    ↓ semantic intent
BOUNDED DOMAIN TRUTH
    ↓ semantic events
services / directors
    ↓ presentation cues
Stage / DOM / audio / media
    ↓
production browser
```

The presentation layer may dramatize domain facts. It must not become a second owner of score, clue truth, answer truth, progression, or canonical mode state.

## One owner per bounded truth

“One owner per truth” does **not** require every game mode to share one giant state machine. It means each bounded domain has one authoritative kernel and clear boundaries.

Current examples:

- **Main trivia runtime:** `src/core/GameEngine.js` and supporting core modules own trivia phases, scoring, and evaluation.
- **Needle Drop proving mode:** `src/modes/needle-drop/core/round.js` owns Needle Drop phase/scoring/answer transitions independently.

Shared Stage, host, audio, analytics, or input systems should consume semantic contracts rather than reaching into a mode's private state representation.

## Current owners

| Concern | Canonical owner |
|---|---|
| Main trivia phases, scoring, evaluation | `src/core/GameEngine.js` + core modules |
| Needle Drop mode truth | `src/modes/needle-drop/core/round.js` |
| Cross-module semantic messaging | `src/utils/events.js` plus bounded mode events |
| Main question acquisition | `src/services/api/questionService.js` |
| Host identity, personality, mood, image | `src/services/HostSystem.js` |
| Host Stage position, scale, occlusion, choreography geometry | `src/services/HostStageActor.js` |
| Main sound playback | `src/services/soundManager.js` |
| Main application boot / DOM orchestration | `src/main.js` + `index.html` |
| Responsive main Stage shell | `src/styles/responsive-stage.css` |
| Needle Drop content validation | `src/modes/needle-drop/core/content.js` + validation script |

Some legacy or overlapping systems still exist. Their presence does not grant them equal authority. Retire or absorb them only after verifying imports and behavior.

## Core invariants

1. **One owner per bounded truth.** Never create competing authoritative state inside the same domain.
2. **Semantic boundaries.** UI emits intent; domain code decides facts; presentation reacts.
3. **Shared systems consume contracts.** A reusable Stage or host should not need to understand every mode's internal reducer/state shape.
4. **Boot must stay non-blocking.** Optional audio, AI, and media work must not prevent basic gameplay initialization.
5. **Production is the contract.** `npm run runtime:check` verifies the main built application across desktop and iPhone-class viewports.
6. **Assets are data.** Preserve source/provenance separately from runtime delivery paths.
7. **Accessibility and reduced motion are release concerns, not cleanup chores.**

## Verification spine

A normal runtime-facing slice should survive:

```text
npm run lint
npm run lint:css
npm run docs:check
npm test -- --ci
npm run build
npm run runtime:check
```

Mode-specific validators such as `npm run needle-drop:validate` should run when their content contracts are affected and can graduate into shared CI gates when cheap and deterministic.

## Known architectural cleanup seams

These are candidates for deliberate convergence, not invitations to refactor everything at once:

- overlapping legacy main-game/controller/state paths;
- stale host-animation managers now that `HostStageActor` owns Stage geometry;
- `compatibility-bridge.js` and other transitional glue;
- older CSS override layers that should shrink as ownership becomes explicit;
- historical AI-provider paths that must converge on one secret-safe provider boundary;
- deciding which contracts proven by Needle Drop genuinely deserve shared adapters/directors.

Apply the **Bus-the-Table Rule** while touching these areas: remove small, safe, verified friction without widening the mission into an unrelated rewrite.

## Related docs

- `STAGE.md` — Stage contract and responsive composition.
- `HOST_PERFORMANCE.md` — choreography, rigging, voice, lip-sync direction.
- `NEEDLE_DROP.md` — isolated proving-mode architecture.
- `../product/MIGRATION.md` — Jeopardish → jeoPARODY convergence.
- `../../AGENTS.md` — engineering doctrine.
