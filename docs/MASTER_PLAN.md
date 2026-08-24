# JeoPARODY Master Plan

**Status:** CANONICAL ROUTING DOCUMENT  
**Updated:** 2026-08-24  
**Rule:** this file owns priorities and routing. Specialized architecture documents own their detailed domains.

JeoPARODY is the canonical proving ground for a larger family of playful learning, game-show, Stage, multiplayer, and eventually cross-world systems. The project should earn abstractions through working vertical slices rather than designing a universal engine in advance.

## 1. Current proven baseline

`main` reached multiplayer milestone commit `46d8f78` on 2026-08-24 through PR #42.

The repository now has blocking automated proof for:

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

Head-to-Head also established reusable seams for guest identity, room discovery, invitations, durable commands, authority, private/public state, reconnect, lifecycle expiry, transport adapters, and security policy.

**Important distinction:** the multiplayer architecture is merged and locally/cloud-adapter proven, but real cross-device Firebase multiplayer is not production-certified until the Firebase project is activated and a phone ↔ laptop session passes the same reconnect expectations.

## 2. One owner per truth

This file must not become another encyclopedia. Route detailed questions to the document that owns them.

| Domain | Canonical owner |
|---|---|
| Current priorities / next lead domino | `docs/MASTER_PLAN.md` |
| Chronological engineering handoffs and evidence | `DEV_JOURNAL.md` |
| Head-to-Head multiplayer architecture / security / deployment | `docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md` |
| Head-to-Head shipped milestone snapshot | `docs/MULTIPLAYER_FOUNDATION_MILESTONE_2026-08-24.md` |
| Needle Drop gameplay architecture | `docs/NEEDLE_DROP_ARCHITECTURE.md` and dated follow-on docs |
| Stage runtime and projection boundary | `docs/STAGE_RUNTIME_SYSTEM.md` |
| Canonical migration doctrine | `docs/JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md` |
| Durable cross-project concept routing | `ICM/README.md` + `ICM/projects/*` |
| Shared vocabulary | `docs/IMMORTAL_DEV_GLOSSARY.md` |

When reality changes, update the smallest owner of that truth and leave a `DEV_JOURNAL.md` handoff. Do not spray the same mutable status across six documents.

## 3. Lead-domino queue

### Domino 0 — verify the post-merge production deploy

The GitHub Pages Actions workflow is triggered by pushes to `main`. Confirm the canonical Actions publisher completes after the multiplayer merge and that the live build contains the new Head-to-Head entrypoint.

If the repository still has the historical branch-based Pages publisher enabled, switch the repository Pages source to **GitHub Actions** so there is one deployment owner.

### Domino 1 — activate real Firebase multiplayer

Do this before adding more multiplayer features.

1. Select or create the real Firebase project.
2. Enable Firebase Anonymous Auth.
3. Supply production `VITE_FIREBASE_*` web configuration.
4. Deploy `firestore.rules` and `firestore.indexes.json`.
5. Confirm TTL configuration is accepted.
6. Run a real phone ↔ laptop Head-to-Head match.
7. Refresh the host after its first answer and prove recovery.
8. Refresh the challenger after reveal and prove recovery.
9. Observe actual backgrounding, sleep, Wi-Fi switching, and disconnect behavior.

Do **not** add presence/heartbeat infrastructure until real-device evidence says it solves a user-visible problem.

### Domino 2 — promote Head-to-Head into the main experience

Only after Domino 1 passes:

- add the mode to the main menu / mode-select surface;
- make room creation and invite sharing discoverable;
- add explicit retry/recovery copy for network failures;
- preserve guest-first entry with no account ceremony;
- keep ranked/profile systems out of the critical path.

### Domino 3 — earn the reusable multiplayer kernel with a second consumer

Do not extract a grand universal multiplayer framework merely because one mode exists.

Use a second concrete consumer, likely a remote/controller or multiplayer slice for Needle Drop, to pressure-test the existing seams. Extract only the concepts that survive both modes, such as:

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
- calibrate phone/controller input through the planned `InputGateway` rather than coupling networking directly to game rules.

## 4. Architectural guardrails

1. **Game/domain truth stays deterministic.** UI and Stage render facts; they do not invent them.
2. **Transport is replaceable.** Firebase is an implementation, not the game architecture.
3. **Guest identity is enough until persistence creates value.** Do not build full login/password flows ahead of need.
4. **Accounts are an upgrade path.** A completed guest session should later be claimable/linkable to a persistent profile.
5. **No premature presence system.** Measure real disconnect pain first.
6. **No premature universal engine.** A second consumer earns extraction.
7. **Raw answers/private adjudication stay private until reveal.** Preserve the security boundary across transports.
8. **Server authority precedes meaningful stakes.** Host authority is a proving seam, not a permanent anti-cheat strategy.
9. **Source-controlled infrastructure.** Rules, indexes, lifecycle policy, tests, and deployment behavior belong in the repository.
10. **One owner per truth.** Prefer links to duplication.

## 5. Definition of done for a substantive slice

A feature is not finished because it works once on a developer machine.

A substantive slice should normally leave behind:

```text
IMPLEMENTATION
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

## 6. Current strategic shape

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

## 7. Later, after the current dominos

Candidates remain intentionally unordered until evidence promotes them:

- optional “save my record” account-linking flow after meaningful play;
- rematches, friends, match receipts, and persistent stats;
- calibrated buzzer / phone `InputGateway`;
- spectators and audience participation;
- team play and tournaments;
- richer Stage reactions driven by semantic match events;
- cross-mode reusable multiplayer package;
- broader uINVERSE pressure tests only after JeoPARODY earns the underlying contracts.

## 8. Operating principle

Build the smallest upstream capability that makes several downstream ideas easier, prove it in a real vertical slice, capture the lesson, then move to the next constraint.

The current constraint is not “more multiplayer features.” It is **proving the merged multiplayer substrate on real cloud infrastructure and two real devices**.
