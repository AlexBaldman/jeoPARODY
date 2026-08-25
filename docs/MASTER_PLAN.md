# JeoPARODY Master Plan

**Status:** CANONICAL ROUTING DOCUMENT  
**Updated:** 2026-08-25  
**Rule:** this file owns priorities and routing. Specialized architecture documents own their detailed domains.

JeoPARODY is the canonical proving ground for a larger family of playful learning, game-show, Stage, multiplayer, and eventually cross-world systems. The project should earn abstractions through working vertical slices rather than designing a universal engine in advance.

## 1. Current proven baseline

Head-to-Head multiplayer reached milestone commit `46d8f78` through PR #42. Documentation was re-routed through PR #43 (`a3b4c18`), the Pages workflow became Firebase-ready and exact-live-SHA self-verifying through PR #45 (`32b702c`), and the project-metabolism contract merged through PR #49 as `6443a8c`.

The repository now has blocking automated proof for:

- documentation/deployment doctrine via `npm run project:check`;
- production Vite build;
- unit/integration tests;
- browser boot and deterministic main-game runtime;
- Needle Drop runtime;
- Head-to-Head two-tab create/join/ready/play/reveal flow;
- host refresh after submitting and continued adjudication after reconnect;
- challenger refresh after reveal;
- converged clues, reveals, and scores across both clients;
- Firestore Security Rules through the local emulator, including hostile-client cases;
- accessibility audits and captured runtime evidence.

The canonical GitHub Pages publisher is now proven. `Deploy GitHub Pages` run `32754954244` deployed merge commit `6443a8cb9ef4c6db89aa02cf3b07badc00d0295e`; its live verification fetched the root, Needle Drop, Head-to-Head and `build-meta.json`, then proved the public `gitSha` exactly matched that commit. Issue #46 is complete.

**Current cloud boundary:** the same deployment run also proved that the production `VITE_FIREBASE_*` Actions variables are currently absent, so the live Head-to-Head build is intentionally using local proving mode. Real Firebase multiplayer is therefore the sole current lead domino.

**Current security baseline:** dependency/security triage reduced the installed graph from roughly 742 packages / 32 advisories / 3 critical to 630 packages / 16 advisories / **0 critical** on the verified PR head. CI now blocks both production-only and full-graph critical advisories. AI provider service credentials are server-side-only doctrine, guarded by `npm run security:check`; Firebase web configuration remains intentionally client-visible.

## 2. Project metabolism: completed upstream contract

JeoPARODY now uses a small trusted control plane rather than asking every future human/agent to infer current truth from a large archive.

```text
SMALL TRUSTED CONTROL PLANE
README / AGENTS / docs router / master plan / architecture / journal
        ↓
machine-readable canonical owner registry
        ↓
blocking docs + deployment doctrine checks
        ↓
LARGE PRESERVED ARCHIVE
milestones / audits / migration history / experiments / research
```

Canonical documentation routing lives in `docs/README.md`; machine ownership is registered in `docs/canonical-docs.json`. Historical material remains searchable evidence but does not outrank registered current owners.

## 3. One owner per truth

This file must not become another encyclopedia. Route detailed questions to the document that owns them.

| Domain | Canonical owner |
|---|---|
| Repository entrypoint / current playable surfaces | `README.md` |
| Agent operating rules | `AGENTS.md` |
| Documentation routing / roles | `docs/README.md` |
| Current priorities / next lead domino | `docs/MASTER_PLAN.md` |
| Runtime architecture / ownership boundaries | `ARCHITECTURE.md` |
| Chronological engineering handoffs and evidence | `DEV_JOURNAL.md` |
| Head-to-Head multiplayer architecture / security / deployment | `docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md` |
| Head-to-Head shipped milestone snapshot | `docs/MULTIPLAYER_FOUNDATION_MILESTONE_2026-08-24.md` |
| Needle Drop gameplay architecture | `docs/NEEDLE_DROP_ARCHITECTURE.md` |
| Stage runtime and projection boundary | `docs/STAGE_RUNTIME_SYSTEM.md` |
| AI provider credentials / proxy boundary | `docs/AI_PROVIDER_SETUP.md` |
| Historical canonical-repository convergence | `docs/JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md` |
| Durable cross-project concept routing | `ICM/README.md` + `ICM/projects/*` |
| Shared vocabulary | `docs/IMMORTAL_DEV_GLOSSARY.md` |

When reality changes, update the smallest owner of that truth and leave a `DEV_JOURNAL.md` handoff. Do not spray the same mutable status across six documents.

## 4. Lead-domino queue

### Domino 0 — activate and automatically certify real Firebase multiplayer

Issue #44 owns the current product proof. Do this before adding more multiplayer features.

Current evidence is explicit: the latest production Pages build reported these required repository Actions variables as missing:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
```

`VITE_FIREBASE_STORAGE_BUCKET` and `VITE_FIREBASE_MESSAGING_SENDER_ID` are also supported when supplied by the selected Firebase web app.

Activation sequence:

1. Select or create the production Firebase project.
2. Enable Firebase Anonymous Auth.
3. Add the Firebase web configuration as repository Actions variables.
4. Deploy `firestore.rules` and `firestore.indexes.json`; confirm TTL field policies are accepted.
5. Trigger the canonical Pages deployment.

The Pages workflow should not merely notice configuration. Once Firebase configuration is present, production deployment is expected to certify the cloud path automatically:

```text
Firebase variables present
        ↓
Pages build stamps multiplayerTransport = firebase
        ↓
exact live SHA + transport metadata proof
        ↓
two isolated browser contexts
        ↓
independent Anonymous Auth users
        ↓
create / join / ready / same clue
        ↓
host submits + refreshes
        ↓
guest submits + reveal converges
        ↓
guest refreshes resolved round
        ↓
cloud evidence artifact
```

Using isolated contexts is deliberate. A silent fallback to `LocalRoomGateway` cannot pass because the two contexts do not share local browser storage.

### Domino 1 — physical phone ↔ laptop proof

Automated production cloud certification removes most deployment uncertainty, but it does not simulate mobile OS backgrounding, network changes, sleep, or actual device/browser behavior.

After Domino 0 passes:

- host from one physical device;
- challenger from another;
- complete at least one five-clue match;
- refresh the host after its first submission;
- refresh the challenger after reveal;
- background/foreground the phone;
- briefly interrupt or switch networking if practical;
- record any user-visible reconnect failure before inventing a heartbeat/presence subsystem.

### Domino 2 — promote Head-to-Head into the main experience

Only after real cloud + physical-device proof:

- add the mode to the main menu / mode-select surface;
- make room creation and invite sharing discoverable;
- add explicit retry/recovery copy for network failures;
- preserve guest-first entry with no account ceremony;
- keep ranked/profile systems out of the critical path.

### Domino 3 — earn the reusable multiplayer kernel with a second consumer

Do not extract a grand universal multiplayer framework merely because one mode exists.

Use a second concrete consumer, likely a remote/controller or multiplayer slice for Needle Drop, to pressure-test the existing seams. Extract only the concepts that survive both modes:

```text
Identity
Room / Session
Invite / Discovery
Command
Event / Public State
Authority
Reconnect
Transport
Lifecycle
```

The resulting abstraction should preserve swappable transports and allow authority to move server-side without rewriting game-domain logic.

### Domino 4 — trusted authority before competitive stakes

The current host-authoritative model is appropriate for casual proving play. Before public rankings, prizes, wagers, or meaningful competitive ladders:

- move adjudication to a trusted server / Cloud Function / authoritative service;
- retain the serializable command vocabulary where possible;
- add latency-aware timing only when a real buzzer mechanic requires it;
- calibrate phone/controller input through an earned input abstraction rather than coupling networking directly to game rules.

## 5. Architectural guardrails

1. **Game/domain truth stays deterministic.** UI and Stage render facts; they do not invent them.
2. **Transport is replaceable.** Firebase is an implementation, not the game architecture.
3. **Guest identity is enough until persistence creates value.** Do not build full login/password flows ahead of need.
4. **Accounts are an upgrade path.** A completed guest session should later be claimable/linkable to a persistent profile.
5. **No premature presence system.** Measure real disconnect pain first.
6. **No premature universal engine.** A second consumer earns extraction.
7. **Raw answers/private adjudication stay private until reveal.** Preserve the security boundary across transports.
8. **Server authority precedes meaningful stakes.** Host authority is a proving seam, not a permanent anti-cheat strategy.
9. **Source-controlled infrastructure.** Rules, indexes, lifecycle policy, tests, and deployment behavior belong in the repository.
10. **Provider service credentials stay server-side.** Browser code may consume public Firebase web configuration, but Gemini/Claude-style bearer credentials never belong in source, URL parameters, client-visible Vite variables, or browser storage.
11. **One owner per truth.** Prefer links to duplication.
12. **Docs are executable doctrine.** Canonical ownership and deployment assumptions should fail CI when they drift.
13. **Preserve history without routing through it.** A dated migration/audit document may remain accurate history without being current instructions.
14. **Production claims require production proof.** Build-time Firebase configuration is not enough; a live cloud room must pass independent-user runtime certification.

## 6. Definition of done for a substantive slice

A feature is not finished because it works once on a developer machine.

A substantive slice should normally leave behind:

```text
IMPLEMENTATION
+ project doctrine checks
+ deterministic/unit proof
+ blocking browser proof where relevant
+ security/rules proof where relevant
+ accessibility check
+ runtime evidence
+ canonical architecture/status update
+ DEV_JOURNAL handoff
+ focused branch / PR / commit history
+ post-merge deployment verification when user-facing
```

Failures discovered by CI are product knowledge. Convert them into durable tests rather than merely fixing the symptom.

## 7. Current strategic shape

```text
JeoPARODY domain/game modes
        ↓
semantic commands + events
        ↓
Experience / Show Director
        ↓
Stage / projection

and, orthogonally:

player identity
        ↓
room/session
        ↓
durable intent
        ↓
authority
        ↓
public deterministic truth
        ↓
multiple clients / projections
```

These two axes should meet through explicit semantic boundaries, not through a giant manager object that knows everything and eventually demands its own parking space.

## 8. Later, after the current dominos

Candidates remain intentionally unordered until evidence promotes them:

- optional “save my record” account-linking flow after meaningful play;
- rematches, friends, match receipts, and persistent stats;
- calibrated buzzer / phone input abstraction;
- spectators and audience participation;
- team play and tournaments;
- richer Stage reactions driven by semantic match events;
- cross-mode reusable multiplayer package;
- broader uINVERSE pressure tests only after JeoPARODY earns the underlying contracts.

## 9. Operating principle

Build the smallest upstream capability that makes several downstream ideas easier, prove it in a real vertical slice, capture the lesson, then move to the next constraint.

**Right now the only upstream product constraint is real Firebase activation and cloud proof.** Pages publishing and project metabolism are proven. Do not add another multiplayer feature until Firebase room creation, independent-user reconnect, and physical-device behavior have earned the next move.
