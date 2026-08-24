# JeoPARODY Master Plan

**Status:** CANONICAL ROUTING DOCUMENT  
**Updated:** 2026-08-24  
**Rule:** this file owns priorities and routing. Specialized architecture documents own their detailed domains.

JeoPARODY is the canonical proving ground for a larger family of playful learning, game-show, Stage, multiplayer, and eventually cross-world systems. The project should earn abstractions through working vertical slices rather than designing a universal engine in advance.

## 1. Current proven baseline

Head-to-Head multiplayer reached milestone commit `46d8f78` through PR #42. Documentation was re-routed and immortalized through PR #43 (`a3b4c18`), and the GitHub Pages workflow became Firebase-ready plus exact-live-SHA self-verifying through PR #45 (`32b702c`).

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

## 2. Project metabolism: keep the control plane small and trustworthy

Before accelerating feature work, JeoPARODY needs a reliable operating layer so future work does not depend on archaeology.

The intended shape is:

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

The goal is **not** to reorganize every historical Markdown file. Historical material is useful evidence. The goal is to make it obvious which documents own current truth and to make accidental drift fail CI.

Canonical documentation routing lives in `docs/README.md`; machine ownership is registered in `docs/canonical-docs.json`.

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
| Historical canonical-repository convergence | `docs/JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md` |
| Durable cross-project concept routing | `ICM/README.md` + `ICM/projects/*` |
| Shared vocabulary | `docs/IMMORTAL_DEV_GLOSSARY.md` |

When reality changes, update the smallest owner of that truth and leave a `DEV_JOURNAL.md` handoff. Do not spray the same mutable status across six documents.

## 4. Lead-domino queue

### Domino 0 — finish the project-metabolism contract

This is the immediate upstream cleanup slice tracked by issue #47.

The target is deliberately modest:

- a concise documentation router;
- a machine-readable owner registry;
- blocking `docs:check` / `deployment:check` / `project:check` contracts;
- repaired mandatory architecture and Stage docs;
- removal of the executable legacy `gh-pages` publishing path;
- current agent doctrine that routes through canonical owners;
- no mass historical-document reshuffle.

This matters because every downstream feature becomes cheaper when future humans/agents can answer “what owns this?” in seconds.

### Domino 1 — prove the canonical Pages publisher

The source-controlled publisher is `.github/workflows/deploy-pages.yml`, which now stamps the build SHA and verifies the exact public commit after deployment.

One repository-level setting remains owner-controlled: **Settings → Pages → Source must be GitHub Actions**. Issue #46 tracks this gate.

Once that source is correct, the workflow itself should prove:

```text
root page live
+ Needle Drop live
+ Head-to-Head live
+ build-meta.gitSha === triggering github.sha
```

Do not restore a branch-based deployment script or second publisher.

### Domino 2 — activate real Firebase multiplayer

Issue #44 owns this product proof. Do it before adding more multiplayer features.

1. Select or create the real Firebase project.
2. Enable Firebase Anonymous Auth.
3. Supply production `VITE_FIREBASE_*` web configuration as repository Actions variables.
4. Deploy `firestore.rules` and `firestore.indexes.json`.
5. Confirm TTL configuration is accepted.
6. Run a real phone ↔ laptop Head-to-Head match.
7. Refresh the host after its first answer and prove recovery.
8. Refresh the challenger after reveal and prove recovery.
9. Observe actual backgrounding, sleep, Wi-Fi switching, and disconnect behavior.

Do **not** add presence/heartbeat infrastructure until real-device evidence says it solves a user-visible problem.

### Domino 3 — promote Head-to-Head into the main experience

Only after Domino 2 passes:

- add the mode to the main menu / mode-select surface;
- make room creation and invite sharing discoverable;
- add explicit retry/recovery copy for network failures;
- preserve guest-first entry with no account ceremony;
- keep ranked/profile systems out of the critical path.

### Domino 4 — earn the reusable multiplayer kernel with a second consumer

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

### Domino 5 — trusted authority before competitive stakes

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
10. **One owner per truth.** Prefer links to duplication.
11. **Docs are executable doctrine.** Canonical ownership and deployment assumptions should fail CI when they drift.
12. **Preserve history without routing through it.** A dated migration/audit document may remain accurate history without being current instructions.

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

**Right now the upstream constraint is project metabolism: make current truth cheap to find and hard to accidentally contradict.** Once that contract is green, the next product constraint is the real Firebase/two-device proof, not another multiplayer feature.
