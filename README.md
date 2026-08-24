# JeoPARODY

> A zany, educational game-show universe where the comedy can be ridiculous but the underlying game state has to tell the truth.

JeoPARODY is the canonical proving ground for a growing family of trivia, music, learning, Stage/presentation, and multiplayer systems. It is built in vanilla JavaScript with Vite and deliberately favors deterministic domain logic, replaceable infrastructure, blocking browser proof, and small vertical slices that earn their abstractions.

## Current playable/proven surfaces

### Main trivia game

The original JeoPARODY / Jeopardish game spine remains the behavioral core: question flow, scoring, validation, host/presentation behavior, media, achievements, keyboard interaction, and the evolving Stage boundary.

### Needle Drop

`/needle-drop.html`

A standalone progressive-audio identification mode with deterministic session/scoring logic, content validation, local profile/session behavior, show-direction events, original procedural stings, responsive presentation, and blocking browser coverage.

Canonical architecture: [`docs/NEEDLE_DROP_ARCHITECTURE.md`](docs/NEEDLE_DROP_ARCHITECTURE.md)

### Head-to-Head multiplayer foundation

`/head-to-head.html`

A two-player room-code proving slice with:

- nickname-first guest entry with no visible account ceremony;
- five-character room codes and invite links;
- two-player ready lobby;
- five shared clues;
- independent answer submission;
- private adjudication until both players lock;
- atomic reveal and shared scoring;
- host and challenger reconnect recovery;
- swappable local and Firebase room gateways;
- twelve-hour room lifecycle / TTL policy;
- Firestore Security Rules tested through the emulator;
- blocking two-tab browser proof.

**Current release boundary:** the architecture and Firebase adapter are merged and verified, but real cross-device cloud multiplayer is not considered production-certified until the production Firebase project is configured and a phone ↔ laptop session passes the reconnect proof.

Detailed architecture: [`docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md`](docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md)  
Milestone snapshot: [`docs/MULTIPLAYER_FOUNDATION_MILESTONE_2026-08-24.md`](docs/MULTIPLAYER_FOUNDATION_MILESTONE_2026-08-24.md)

## Architecture in one picture

```text
GAME / MODE DOMAIN TRUTH
        ↓
serializable commands + semantic events
        ↓
authority / directors
        ↓
public deterministic state
        ↓
UI / Stage / multiple clients / projections
```

Two rules matter more than the folder names:

1. **One owner per truth.** Presentation renders facts; networking transports intent; neither silently becomes the game model.
2. **Earn abstractions with a second consumer.** A reusable system should emerge from multiple working vertical slices, not from imagining every future requirement at once.

### Current source layout

```text
src/
  components/                  UI components
  core/                        shared pure gameplay logic
  modes/
    head-to-head/              multiplayer mode + deterministic match truth
  services/
    multiplayer/               local/Firebase room gateway implementations
    api/                       question/content services
  state/                       application state infrastructure
  styles/                      CSS architecture and tokens

tests/
  multiplayer/                 match, host, transport, session, lifecycle tests
  needle-drop/                 Needle Drop domain/presentation tests

scripts/
  firestore-rules-check.mjs    emulator-backed security proof
  head-to-head-runtime-check.mjs
  needle-drop-runtime-check.mjs
  runtime-state-check.mjs
```

## Getting started

Requires Node.js 20+.

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

The core game can run without AI or Firebase configuration using its fallback/local proving paths.

## Testing and release gates

Basic local commands:

```bash
npm test
npm run lint
npm run lint:css
npm run build
```

The blocking GitHub Actions CI goes further. At the 2026-08-24 multiplayer milestone it includes:

```text
ESLint
Stylelint
94 Jest tests
Vite production build
Firestore Security Rules emulator suite
main-game browser diagnostics + blocking runtime
Needle Drop browser runtime
Head-to-Head two-tab + reconnect browser runtime
axe accessibility audits
runtime screenshots + build artifacts
```

CI failures discovered during feature work should become durable regression tests instead of being patched around and forgotten.

## Firebase multiplayer

Firebase is now an implemented multiplayer transport seam, not merely a future placeholder.

The repository contains:

```text
.env.example
firebase.json
firestore.rules
firestore.indexes.json
```

The frontend expects these deployment values when cloud multiplayer is enabled:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
```

Authorization is enforced through Firebase Auth + Firestore Security Rules. Firebase web configuration is client configuration, not the authorization boundary.

The next cloud activation step is tracked in GitHub issue **#44**. Do not add full account/profile machinery merely to make casual rooms work; Anonymous Auth is the v1 identity seam.

## AI host

The AI host layer supports provider/fallback infrastructure and the game remains playable when an external AI provider is unavailable.

Start with [`docs/AI_PROVIDER_SETUP.md`](docs/AI_PROVIDER_SETUP.md) for current provider configuration rather than relying on older README-era setup notes.

## Canonical documentation map

This repository deliberately separates living status from detailed architecture and immutable milestone history.

| Need | Read |
|---|---|
| Current priorities and next lead domino | [`docs/MASTER_PLAN.md`](docs/MASTER_PLAN.md) |
| Engineering chronology / agent handoffs | [`DEV_JOURNAL.md`](DEV_JOURNAL.md) |
| Head-to-Head architecture / security / deployment | [`docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md`](docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md) |
| Multiplayer shipped milestone | [`docs/MULTIPLAYER_FOUNDATION_MILESTONE_2026-08-24.md`](docs/MULTIPLAYER_FOUNDATION_MILESTONE_2026-08-24.md) |
| Stage runtime | [`docs/STAGE_RUNTIME_SYSTEM.md`](docs/STAGE_RUNTIME_SYSTEM.md) |
| Canonical migration doctrine | [`docs/JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md`](docs/JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md) |
| Durable cross-project context | [`ICM/README.md`](ICM/README.md) |
| Shared vocabulary | [`docs/IMMORTAL_DEV_GLOSSARY.md`](docs/IMMORTAL_DEV_GLOSSARY.md) |

`docs/MASTER_PLAN.md` is a routing/priorities owner, not permission to duplicate every specialized architecture document inside one gigantic manifesto.

## Current lead domino

The immediate constraint is **real cloud proof**, not more multiplayer features:

```text
select/create Firebase project
        ↓
enable Anonymous Auth
        ↓
production VITE_FIREBASE_* configuration
        ↓
deploy Firestore rules + indexes / TTL
        ↓
phone ↔ laptop Head-to-Head
        ↓
host + challenger reconnect proof
        ↓
observe real disconnect/background behavior
        ↓
main-menu promotion
```

Only after a second mode needs the same multiplayer boundaries should a generalized shared multiplayer package be extracted.

## Deployment

The repository has a GitHub Pages Actions workflow at `.github/workflows/deploy-pages.yml` that builds `dist` and deploys pushes to `main`.

A user-facing slice is not considered finished merely because it merged. Post-merge deployment verification belongs in the definition of done.

## Contributing / agent work

Start substantive work by reading:

1. [`DEV_JOURNAL.md`](DEV_JOURNAL.md)
2. [`docs/MASTER_PLAN.md`](docs/MASTER_PLAN.md)
3. the specialized architecture document for the area being changed
4. [`ICM/README.md`](ICM/README.md) when cross-project context matters

Working rules:

- focused branch and PR;
- one owner per truth;
- tests for domain behavior;
- blocking runtime proof for user-facing behavior;
- security tests for authorization boundaries;
- accessibility checks;
- preserve runtime evidence when useful;
- update the canonical owner of any changed architectural truth;
- leave a concise `DEV_JOURNAL.md` handoff after substantive work;
- do not prematurely build uINVERSE or a universal engine simply because a local abstraction looks reusable.

## Legal

JeoPARODY / Jeopardish is a parody/tribute project and is not affiliated with Jeopardy Productions, Inc. Referenced trademarks and copyrights belong to their respective owners. Commercial work should continue moving toward original names, characters, art, audio, and protected-expression-safe implementations.

---

**Build the smallest upstream capability that unlocks several downstream ideas, prove it, capture it, then move to the next constraint.**
