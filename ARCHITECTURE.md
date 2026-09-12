# JeoPARODY Runtime Architecture

**Status:** CANONICAL  
**Repository:** `AlexBaldman/jeoPARODY`

JeoPARODY owns the trivia product. Main and Head-to-Head are trivia experiences; Needle Drop is an independent music game temporarily hosted here during extraction. PAO belongs to Memorization Station and is disconnected from the production entrypoint and stylesheet; its source remains preserved as donor material. LoadBearing is a separate Godot product on a Jeopardish branch, not a trivia subsystem.

Shared universe identity does not require shared game state, deployment, engine, or release cadence. Runtime dependencies must follow actual product needs. Current extraction order and release priorities belong to [the master plan](docs/MASTER_PLAN.md).

## North star

```text
MODE / GAME DOMAIN TRUTH
        ↓
serializable commands + semantic events
        ↓
authority / directors
        ↓
public deterministic state
        ↓
UI / Stage / multiple clients / projections
```

The critical rule is simple: **renderers and transports may move or dramatize truth; they do not own it.**

## Current playable entrypoints

| Surface | Entrypoint | Domain owner |
|---|---|---|
| Main trivia game | `index.html` | `src/core/GameEngine.js` + existing state/event spine |
| Needle Drop | `needle-drop.html` | Needle Drop mode/session logic and show events |
| Head-to-Head | `head-to-head.html` | `src/modes/head-to-head/core/match.js` + `HeadToHeadHost.js` authority |

A future shared abstraction is earned only when two or more real consumers prove the same contract. Do not force every mode through one universal engine merely because the folder diagram looks satisfyingly symmetrical.

## Runtime layers

### 1. Domain truth

Each mode owns the smallest deterministic model required to answer questions such as:

- What phase are we in?
- What is the score?
- What clue/item is active?
- What actions are legal now?
- What facts are public versus private?
- What transition follows this command?

For the original trivia spine, `src/core/GameEngine.js` remains important. It is **not** a mandate that every future game mode must store its truth there.

Main Game settles each clue once through `GameEngine`: submitted answer, timeout, or reveal. Reveal forfeits credit and ends the attempt under Main scoring. The engine cancels timers and owns answer visibility facts; UI renders `answer:evaluated`. `question:loaded` is the single loaded-clue event. `createQuestionLoader` holds only a cancellation generation so stale fetches cannot load after a newer request or reset; AI rewrites must still match the active clue before changing display text. Starting a session clears its question/statistics while retaining session high-score records; reset completion uses a different event from the reset command.

The public Main doorway offers Classic and Needle Drop. Full Board, Run Category, Practice and Daily Double remain hidden until their real answer/score/progression paths earn browser proof.

Head-to-Head is the clearest newer example: public match state lives in `src/modes/head-to-head/core/match.js`; transport and UI consume that state rather than inventing parallel score/round truth.

### 2. Commands and semantic events

Inputs should cross boundaries as explicit intent or facts rather than DOM knowledge.

Examples:

```text
SUBMIT_ANSWER
SET_READY
START
NEXT_ROUND

PLAYER_WRONG
ROUND_RESOLVED
SESSION_COMPLETE
```

Serializable commands make multiplayer authority movable. Semantic events make presentation replaceable.

### 3. Authority and directors

Authority decides whether a command is valid and how domain truth changes. Directors decide how already-known facts should be presented.

These are intentionally different responsibilities:

```text
command → authority → state transition
fact/event → director → presentation choice
```

Head-to-Head currently uses host-browser authority for casual proving play. That authority can later move server-side without forcing the UI to learn game rules.

Needle Drop's Show Director and the broader Stage direction work are presentation examples: they react to semantic facts, not raw DOM accidents.

### 4. Services and replaceable adapters

Externalities belong behind narrow seams. Current examples include:

- `src/services/multiplayer/` for room/network transport;
- Firebase versus local proving gateways;
- question/content services;
- audio/media services;
- AI provider services;
- storage/persistence;
- future input/controller adapters.

**Firebase is an implementation, not the multiplayer architecture.** The same rule applies to every vendor or device layer.

### 5. UI and Stage

UI renders current state and emits intent. Stage/director systems turn semantic facts into a coherent show.

They may own local presentation state such as:

- camera beat;
- animation lifecycle;
- selected host performance;
- temporary FX;
- modal/open-panel state.

They may not independently own:

- canonical score;
- active clue truth;
- answer correctness;
- round progression;
- multiplayer room membership.

See [`docs/STAGE_RUNTIME_SYSTEM.md`](docs/STAGE_RUNTIME_SYSTEM.md).

## Multiplayer boundary

Head-to-Head established a reusable shape without prematurely extracting a universal package:

```text
player UI
   ↓ command
RoomGateway
   ↓ durable intent
Authority
   ↓ deterministic transition
Public Match State
   ↓
all clients render
```

Current implementations:

```text
LocalRoomGateway      same-browser proving lab
FirebaseRoomGateway   cross-device cloud adapter
```

The durable concepts worth pressure-testing with a second consumer are:

```text
Identity
Room / Session
Invite / Discovery
Command
Authority
Public State
Reconnect
Transport
Lifecycle
```

Only after two independently shipping products need the same stable behavior should a narrowly scoped shared package be considered. Needle Drop extraction does not require a generalized multiplayer kernel.

Canonical multiplayer detail: [`docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md`](docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md).

## Public/private truth

Competitive modes must explicitly distinguish public state from secrets.

Head-to-Head's current rule is the model:

```text
raw submitted answer        private command data
private adjudication        host-only secret
submittedPlayerIds          public while waiting
correctness / points        public only at atomic reveal
```

Do not leak private truth through a convenient shared snapshot merely because the visible UI hides it.

## Source tree, conceptually

```text
src/
├── core/                     main trivia domain logic
├── modes/                    mode-specific vertical slices
│   └── head-to-head/
├── services/                 external systems and adapters
│   └── multiplayer/
├── state/                    app/store concerns where appropriate
├── components/               UI surfaces
├── utils/                    shared low-level utilities/events
└── styles/                   presentation styles

scripts/                      validation/runtime/build tooling
docs/                         canonical owners + preserved references/history
ICM/                          durable cross-project concept routing
.github/workflows/            CI and canonical Pages deployment
```

This is a map of ownership, not a demand to reshuffle files merely to make them match the picture.

## Architectural guardrails

1. **One domain truth per mode.** Do not create a shadow score/round model in UI, Stage, or transport.
2. **Explicit boundaries.** Prefer commands, events, selectors, and adapters over cross-layer reach-through.
3. **Transport is replaceable.** Networking never becomes the game rules.
4. **Presentation is downstream of truth.** Stage can dramatize an event, not manufacture it.
5. **Private data stays private until the domain says reveal.** CSS is not access control.
6. **Authority can move.** Keep command/state contracts serializable so browser authority can migrate server-side.
7. **Earn abstractions with multiple consumers.** One successful mode is evidence, not a universal framework mandate.
8. **Compatibility belongs at edges.** Preserve useful legacy behavior through adapters/fixtures, not a second runtime owner.
9. **Infrastructure is source-controlled.** Rules, deployment behavior, validation, and lifecycle policy belong in the repo.
10. **Docs are part of architecture.** Current ownership is registered in `docs/canonical-docs.json` and checked by `npm run docs:check`.

## Canonical routing

- Documentation map: [`docs/README.md`](docs/README.md)
- Current priorities: [`docs/MASTER_PLAN.md`](docs/MASTER_PLAN.md)
- Head-to-Head: [`docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md`](docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md)
- Needle Drop: [`docs/NEEDLE_DROP_ARCHITECTURE.md`](docs/NEEDLE_DROP_ARCHITECTURE.md)
- Stage: [`docs/STAGE_RUNTIME_SYSTEM.md`](docs/STAGE_RUNTIME_SYSTEM.md)
- Historical canonical-repository convergence: [`docs/JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md`](docs/JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md)
- Engineering handoffs: [`DEV_JOURNAL.md`](DEV_JOURNAL.md)

When these disagree, repair the canonical owner rather than adding another explanatory document to the pile.
