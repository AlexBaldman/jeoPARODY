---
status: canonical
owner: architecture
updated: 2026-08-21
---

# Architecture Overview

JeoPARODY is the long-term canonical product runtime. Jeopardish remains a behavioral oracle and donor while proven behavior is deliberately absorbed.

## Runtime spine

```text
INPUT / UI
    ↓ semantic intent
GameEngine + canonical domain state
    ↓ semantic events
services / directors
    ↓ presentation cues
Stage / DOM / audio / media
    ↓
production browser
```

The presentation layer may dramatize domain facts. It must not become a second owner of score, clue truth, answer truth, progression, or canonical game state.

## Current owners

| Concern | Canonical owner |
|---|---|
| Gameplay phases, scoring, evaluation | `src/core/GameEngine.js` and core modules |
| Cross-module semantic messaging | `src/utils/events.js` |
| Question acquisition | `src/services/api/questionService.js` |
| Host identity, personality, mood, image | `src/services/HostSystem.js` |
| Host stage position, scale, occlusion, choreography geometry | `src/services/HostStageActor.js` |
| Sound playback | `src/services/soundManager.js` |
| Application boot and current DOM orchestration | `src/main.js` + `index.html` |
| Responsive Stage shell | `src/styles/responsive-stage.css` |

Some legacy or overlapping systems still exist. Their presence does not grant them equal authority. Retire or absorb them only after verifying imports and behavior.

## Core invariants

1. **One owner per truth.** Never create a second authoritative state manager or presentation-side copy of domain truth.
2. **Semantic boundaries.** UI emits intent; domain code decides facts; presentation reacts.
3. **Boot must stay non-blocking.** Optional audio, AI, and media work must not prevent basic gameplay initialization.
4. **Production is the contract.** `npm run runtime:check` verifies the built application across desktop and iPhone-class viewports.
5. **Assets are data.** Preserve source/provenance separately from runtime delivery paths.
6. **Accessibility and reduced motion are release concerns, not cleanup chores.**

## Verification spine

A normal runtime-facing slice should survive:

```text
npm run lint
npm run lint:css
npm test -- --ci
npm run build
npm run runtime:check
```

CI also runs browser boot diagnostics and an accessibility audit.

## Known architectural cleanup seams

These are candidates for deliberate convergence, not invitations to refactor everything at once:

- overlapping legacy game/controller/state paths;
- stale host-animation managers now that `HostStageActor` owns Stage geometry;
- `compatibility-bridge.js` and other transitional glue;
- older CSS override layers that should shrink as ownership becomes explicit;
- historical AI-provider paths that must converge on one secret-safe provider boundary.

Apply the **Bus-the-Table Rule** while touching these areas: remove small, safe, verified friction without widening the mission into an unrelated rewrite.

## Related docs

- `STAGE.md` — Stage contract and responsive composition.
- `HOST_PERFORMANCE.md` — choreography, rigging, voice, lip-sync direction.
- `../product/MIGRATION.md` — Jeopardish → jeoPARODY convergence.
- `../../AGENTS.md` — engineering doctrine.
