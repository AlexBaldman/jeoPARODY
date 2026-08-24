# JeoPARODY

> A zany educational game-show universe where the comedy can be ridiculous but the underlying game state has to tell the truth.

JeoPARODY is the canonical proving ground for a growing family of trivia, music, learning, Stage/presentation, and multiplayer systems. It is built in vanilla JavaScript with Vite and deliberately favors deterministic domain logic, replaceable infrastructure, blocking browser proof, and small vertical slices that earn their abstractions.

## Current playable surfaces

### Main trivia game

`/`

The original JeoPARODY / Jeopardish spine: question flow, scoring, validation, host/presentation behavior, media, achievements, keyboard interaction, and the evolving Stage boundary.

### Needle Drop

`/needle-drop.html`

A standalone progressive-audio identification mode with deterministic session/scoring logic, content validation, local profile/session behavior, semantic show events, original procedural stings, responsive presentation, and blocking browser coverage.

Canonical owner: [`docs/NEEDLE_DROP_ARCHITECTURE.md`](docs/NEEDLE_DROP_ARCHITECTURE.md)

### Head-to-Head

`/head-to-head.html`

A two-player room-code proving slice with guest-first entry, a ready lobby, five shared clues, independent answers, private-until-reveal adjudication, deterministic scoring, reconnect recovery, replaceable local/Firebase gateways, Firestore security rules, TTL lifecycle policy, and blocking two-tab browser proof.

**Release boundary:** the multiplayer architecture and Firebase adapter are implemented and verified, but cross-device cloud play is not production-certified until the real Firebase project and phone ↔ laptop reconnect proof pass.

Canonical owner: [`docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md`](docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md)  
Shipped milestone: [`docs/MULTIPLAYER_FOUNDATION_MILESTONE_2026-08-24.md`](docs/MULTIPLAYER_FOUNDATION_MILESTONE_2026-08-24.md)

## Architecture in one picture

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

Two rules matter more than folder names:

1. **One owner per truth.** Presentation renders facts and networking transports intent; neither silently becomes the game model.
2. **Earn abstractions with multiple consumers.** A shared system should emerge from working vertical slices, not imagined future requirements.

Canonical runtime map: [`ARCHITECTURE.md`](ARCHITECTURE.md)

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

The core game can run without external AI or Firebase configuration using fallback/local proving paths.

## Project checks

Fast local contract:

```bash
npm run project:check
```

That checks current documentation ownership/routing and verifies GitHub Pages Actions remains the only source-controlled publisher.

Core development checks:

```bash
npm run lint
npm run lint:css
npm test
npm run build
```

Blocking CI goes further with Firestore Security Rules through the emulator, production browser diagnostics, Main Game runtime proof, Needle Drop runtime proof, Head-to-Head two-tab/reconnect proof, accessibility audits, screenshots, and build artifacts.

Failures discovered by CI are product knowledge. Turn them into durable regression checks instead of patching around them and forgetting why they happened.

## Firebase multiplayer

Firebase is an implemented multiplayer adapter, not the game architecture.

The frontend consumes these deployment values when cloud multiplayer is enabled:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
```

Authorization lives in Firebase Auth + Firestore Security Rules. Firebase web configuration is client-visible configuration, not a privileged credential.

The production Pages workflow automatically passes configured repository Actions variables into Vite. Without the required values, Head-to-Head intentionally stays in local proving mode.

Real cloud activation and the two-device acceptance proof are tracked by issue **#44**.

## Deployment

The only source-controlled static-site publisher is:

```text
.github/workflows/deploy-pages.yml
```

On `main`, it:

```text
builds dist
→ stamps build-meta.json with the exact Git SHA
→ deploys through GitHub Pages Actions
→ fetches the live site
→ proves root + Needle Drop + Head-to-Head
→ proves live SHA === triggering SHA
```

Repository **Settings → Pages → Source** must be **GitHub Actions**. Issue **#46** tracks that owner-side setting.

Do not restore a branch-writing `gh-pages` deploy script or create a second publisher because software already has enough ways to publish yesterday over today.

## AI host

The AI host layer supports provider/fallback infrastructure and the game remains playable when an external AI provider is unavailable.

Current setup: [`docs/AI_PROVIDER_SETUP.md`](docs/AI_PROVIDER_SETUP.md)

## Documentation

Start with the router rather than spelunking the entire docs tree:

**[`docs/README.md`](docs/README.md)**

It defines canonical, milestone, reference, and historical roles and routes each current domain to one owner. The machine-readable registry is [`docs/canonical-docs.json`](docs/canonical-docs.json).

High-value entrypoints:

| Need | Owner |
|---|---|
| Agent operating rules | [`AGENTS.md`](AGENTS.md) |
| Runtime architecture | [`ARCHITECTURE.md`](ARCHITECTURE.md) |
| Current priorities / next lead domino | [`docs/MASTER_PLAN.md`](docs/MASTER_PLAN.md) |
| Engineering chronology / handoffs | [`DEV_JOURNAL.md`](DEV_JOURNAL.md) |
| Stage projection architecture | [`docs/STAGE_RUNTIME_SYSTEM.md`](docs/STAGE_RUNTIME_SYSTEM.md) |
| Durable cross-project context | [`ICM/README.md`](ICM/README.md) |

Historical migration/audit documents remain preserved as evidence. Detail alone does not make an old document current truth.

## Current priority

This README deliberately does **not** duplicate the changing lead-domino queue.

Current priority owner: [`docs/MASTER_PLAN.md`](docs/MASTER_PLAN.md)

That keeps one mutable plan instead of forcing future agents to reconcile six almost-identical roadmaps with different Tuesdays embedded in them.

## Contributing / agent work

Read in this order:

1. [`AGENTS.md`](AGENTS.md)
2. [`DEV_JOURNAL.md`](DEV_JOURNAL.md)
3. [`docs/README.md`](docs/README.md)
4. [`docs/MASTER_PLAN.md`](docs/MASTER_PLAN.md)
5. [`ARCHITECTURE.md`](ARCHITECTURE.md)
6. the canonical owner for the system being changed

For substantive changes: use a focused branch/PR, keep domain ownership explicit, add proof appropriate to the risk, update the smallest canonical owner when reality changes, and leave a concise handoff.

## Legal

JeoPARODY / Jeopardish is a parody/tribute project and is not affiliated with Jeopardy Productions, Inc. Referenced trademarks and copyrights belong to their respective owners. Commercial work should continue moving toward original names, characters, art, audio, and protected-expression-safe implementations.

---

**Build the smallest upstream capability that unlocks several downstream ideas, prove it, capture it, then move to the next constraint.**
