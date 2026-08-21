# JeoPARODY Canonical Migration Strategy

**Updated:** 2026-08-08

## Decision

This repository, **`AlexBaldman/jeoPARODY`**, is the intended **long-term canonical product destination**.

`AlexBaldman/Jeopardish` remains the **short-term stable proving ground and source of proven product behavior** while this repository's newer architecture is repaired, simplified, and brought to parity.

This explicitly supersedes older wording that treated Jeopardish as permanently canonical or this repository as merely a donor archive.

The migration is not a wholesale merge in either direction.

```text
JEOPARDISH
stable + working + heavily tested
        │
        │ prove/fix features here when safest
        │ extract contracts, fixtures, behaviors, assets
        ▼
PORT / REBUILD DELIBERATELY
        │
        ▼
JEOPARODY
newer architecture
repair boot/runtime first
then absorb proven goodness
        │
        ▼
LONG-TERM CANONICAL PRODUCT
```

## Devin's Findings

Devin's full audit of `main` found that the documented architecture and live runtime had diverged, but the underlying pieces were useful and the required work was **consolidation rather than a rewrite**.

Devin's follow-up review of `mac-fixed-pushing-changes` found substantial architectural progress:

- one composed entry point;
- `UIManager` view registry;
- `StateBridge` connecting engine events to the store;
- more intended modules actually reachable;
- ESLint installed;
- CSS moved toward token/layer structure;
- dead-code fraction significantly reduced.

The current blocker is execution quality, not the direction: that refactor cannot boot until a concrete P0 failure chain is repaired.

## Immediate Repair Order

1. Repair/remove `PlaneAnimationService.adjustBannerSize()` and avoid module-scope service construction.
2. Reconcile `ConnectedComponent` with the contract its subclasses use (`mount`, `setState`, `storeState`, `mapStateToProps`, `onMount`).
3. Fix `Modal` construction/super usage.
4. Resolve `GameEngine` vs `GameController` and keep one state owner/API.
5. Replace browser `process.env` usage.
6. Render Splash first instead of auto-skipping it.
7. Make production build ship question data/shards and correct host assets.
8. Add blocking browser smoke coverage proving initialization and visible clue rendering.

Then clear blocking lint/accessibility/security issues, remove duplicate/deprecated paths, eliminate browser API-key injection, and replace monolithic question loading with bounded packs/shards.

## Repository Roles During Migration

### jeoPARODY

Long-term canonical destination. Priorities:

- restore boot/runtime reliability;
- enforce one entrypoint, one game-state owner, one component contract, one question path, one event vocabulary;
- create parity tests;
- absorb proven Jeopardish capabilities through explicit contracts;
- eventually own Stage, authored episodes/learning, Host Studio, Topic Shows, PAO, full-board modes, Couch Party, and future product expansion.

### Jeopardish

Stable reference/proving implementation during the transition. Use it to:

- keep a working product available;
- fix bugs where the existing runtime offers the safer path;
- prove new vertical behavior such as Stage presentation;
- preserve deterministic fixtures and release evidence;
- act as a behavioral oracle for forward ports.

Do not copy Jeopardish files wholesale merely to claim parity.

## Forward-Port Dispositions

Every Jeopardish capability considered here should be labeled:

- **PORT:** implementation is isolated and fits this architecture with limited adaptation;
- **REBUILD:** preserve behavior, implement through this repo's current owners;
- **REFERENCE:** preserve fixtures, UX, semantics, art/product direction, or requirements only;
- **RETIRE:** obsolete, unsafe, redundant, or no longer desired.

## Highest-Value Jeopardish Systems To Absorb

1. deterministic scoring/round behavior and fuzzy judgment fixtures;
2. authored Episode contract and episode-controller behavior;
3. reviewed emergency fallback, finale, replay, confidence/dispute handling;
4. Study pause/resume, memory reinforcement, and learning-ledger behavior;
5. HostPack / HostAvatarPack / HostPerformanceDirector semantics;
6. modular host wardrobe/avatar selection and fallback behavior;
7. media preflight/substitution and accessibility behavior;
8. bilingual/localization contracts and authored Portuguese direction;
9. browser smoke, full-episode proof, accessibility, visual fixtures, and dist audits;
10. Stage Engine semantic presentation contracts once visually proven;
11. privacy-safe product-event vocabulary and no-client-secret rules.

## Stage Migration Strategy

The current Stage Engine work in Jeopardish is a proving ground for this future architecture.

Validate there:

```text
semantic game event
→ presentation cue
→ responsive Stage/camera/host behavior
→ deterministic fixture
```

Then PORT or REBUILD the proven contract here once this runtime foundation is stable.

Stage remains presentation-only and never becomes another owner of scoring, clue truth, episode position, or learning state.

## Canonical Cutover Gates

This repository should become the operational canonical runtime when it proves:

- clean browser boot;
- one game-state owner and one component contract;
- visible functional core gameplay;
- bounded content loading;
- correct packaged assets;
- blocking browser smoke CI;
- scoring/answer parity against approved fixtures;
- accessibility baseline;
- no browser API secrets;
- deterministic coverage for each migrated subsystem.

Canonical status is earned by behavior and evidence, not by copying files.

## Parallel Work Rule

Until cutover:

- Jeopardish may continue receiving fixes/features that improve the working product or prove a reusable contract;
- this repository should prioritize repair plus high-confidence parity ports;
- do not independently implement the same speculative subsystem in both repos;
- when Jeopardish gains a long-term feature, capture its migration contract immediately.

## Recommended Sequence

### Track 1 — repair jeoPARODY

1. complete Devin's P0 boot chain;
2. add blocking browser smoke CI;
3. remove duplicate engine/state/component/question paths;
4. fix data/assets packaging and bounded question loading;
5. establish a migration/parity harness.

### Track 2 — use Jeopardish as proving ground

1. finish visual validation of current Stage Engine work;
2. keep stable gameplay/release proof green;
3. isolate reusable behavior contracts;
4. continue original-IP/content work that directly improves product evidence.

### Track 3 — controlled forward ports

Suggested order:

1. scoring/judgment fixtures;
2. episode/content contract;
3. Study + learning return loop;
4. host-performance/avatar packs;
5. media/localization;
6. Stage presentation contract;
7. product-event/release gates;
8. full-board and PAO;
9. Couch Party/shared-screen;
10. Host Studio / Topic Shows / grounded AI.

Each vertical slice must boot, render, and test before beginning another broad slice.

## Long-Term North Star

**jeoPARODY becomes the clean extensible product architecture. Jeopardish becomes the proven behavioral ancestor/reference implementation from which its strongest ideas were deliberately absorbed.**

The goal is eventually one obvious product repository, rather than two codebases passing the word "canonical" back and forth like a cursed family heirloom.

## Agent Instruction

If you are Devin, Codex, Claude, or another coding agent:

1. treat this file as the current repository-direction decision;
2. read Devin's `docs/AUDIT_2026.md` and `docs/AUDIT_2026-07_REVIEW.md` branches/reviews;
3. inspect current Jeopardish work as proven source behavior and migration evidence;
4. do not start a wholesale merge;
5. repair the jeoPARODY boot/runtime foundation first;
6. propose the smallest next vertical forward-port with explicit parity tests;
7. update this decision record if repository roles materially change.
