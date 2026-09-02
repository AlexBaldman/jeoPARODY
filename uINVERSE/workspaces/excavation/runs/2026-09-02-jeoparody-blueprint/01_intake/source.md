# Bounded source packet

Original artifact: `JEOPARODY_CONSOLIDATED_BLUEPRINT_2026-08-08.md`  
Compiled: 2026-08-08  
Run scope: Episode runtime, learning ledger/review memory, HostPerformanceDirector, HostPack only.

This file preserves the source facts used for extraction without copying unrelated blueprint sections into the run.

## Episode and learning

The blueprint records a reviewed Season Zero authored episode with a deliberate clue arc, finale, replay/fallback behavior, Study mode, confidence/dispute capture, and memory reinforcement. It also records local learning memory and review queues as already-proven donor behavior.

The intended player loop is explicitly directional:

`directed episode → semantic host performance → optional Study detour → misses/uncertain facts enter memory reinforcement → finale → returning-player rematch/fresh broadcast`.

The editorial contract distinguishes authored/reviewed episodes from generated shows. Generated material retains source/generation metadata and does not silently become canonical editorial content.

The suggested architecture map places `EpisodeController` and the `learning ledger / SessionManager / PreferenceStore` in the game-truth layer alongside the round engine and answer pipeline.

The roadmap later calls for an Episode factory, review receipts/fact-packet tooling, transparent due-date scheduling, a daily broadcast plus short memory rematch, episode history, earned artifacts, and mastery recomputed from canonical learning/product facts rather than a second stats truth.

## Host performance

The blueprint records Host packs and HostPerformanceDirector boundaries as proven donor behavior.

It defines the reusable host split as:

- `HostPack`: personality/performance direction;
- `HostAvatarPack`: visual identity and looks;
- `VoicePack`: approved clips, synthesis settings, consent, pronunciation;
- `HostPerformanceDirector`: coordinates semantic performance beats.

The game engine remains owner of facts, score, answer judgment, and progression. The Stage and host systems are downstream presentation consumers.

The director map assigns HostPerformanceDirector host beats/character performance and states that Stage must never become another owner of score, clue truth, answer state, round state, or progression.

## Current-repository disposition reference

`docs/CONVERGENCE_2_CAPABILITY_MATRIX_2026-08-25.md` classifies all four concepts in this run as **FOCUSED FOLLOW-UP** rather than shipped current owners:

- authored Episode/content contract;
- Study pause/resume + learning ledger/review queue;
- HostPack / HostAvatarPack / HostPerformanceDirector.

The matrix also records that current host presentation remains `HostSystem` + `HostStageActor`, so any future HostPerformanceDirector implementation must extend current semantic presentation ownership rather than revive the retired host/store architecture.

## Extraction boundary

This packet does **not** assert that these concepts are implemented in current jeoPARODY. It asserts that they are durable, previously-proven behavior/contracts explicitly preserved for focused follow-up.
