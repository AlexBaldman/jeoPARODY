# DEV JOURNAL — Agent Cypher

This is the rolling crew room for current work. Read `AGENTS.md` first, then the newest relevant entry here, then use `docs/README.md` to load only the canonical context needed for your slice.

Deep journal history through 2026-08-20 is preserved at `docs/archive/handoffs/DEV_JOURNAL_through_2026-08-20.md`.

## Current north star

```text
Jeopardish — behavioral oracle / donor
        ↓ prove / compare / extract
jeoPARODY — canonical product runtime
        ↓
semantic domain events
        ↓
presentation / performance intent
        ↓
Stage
        ↓
responsive projection / performance
```

## Current cascade

```text
GREEN CANONICAL RUNTIME
→ ERGONOMIC KNOWLEDGE + AGENT SYSTEM
→ FOOTER STAGE / HOST ACTOR
→ RETIRE DUPLICATE HOST-ANIMATION OWNERS
→ EXPAND FULLSCREEN + RESPONSIVE STAGE
→ PROVE NAMED CHOREOGRAPHY / PERFORMANCE TIMELINE
→ MINE JEOPARDISH DONOR BEHAVIOR IN VERTICAL SLICES
→ NORMALIZE REMAINING STATE / EVENT / CSS OWNERSHIP
```

Durable priorities live in `docs/product/ROADMAP.md`. This journal should contain the newest execution state, discoveries, evidence, and handoff rather than duplicating the roadmap.

## Handoff format

```md
### YYYY-MM-DD HH:MM — <agent/name> — <mission>
- **Read/inspected:**
- **Changed:**
- **Evidence/tests:**
- **Decisions:**
- **Unresolved:**
- **Next lead domino:**
- **Refs:** branch / PR / commit / docs
```

---

### 2026-08-21 05:05 ET — ChatGPT — rebuild project knowledge architecture
- **Read/inspected:** root Markdown surfaces; `Gemini.md`, `WARP.md`, `ARCHITECTURE.md`, `CONTRIBUTING.md`, README, data/UI guides; Stage/migration/master-plan material; CSS audit/refactor docs; AI setup; Trebek audio docs; ICM; uINVERSE thesis; current CI and package scripts.
- **Changed:** created a canonical documentation map organized by architecture/product/reference/archive; distilled current runtime, Stage, host-performance, migration, roadmap, vision, CSS, data, AI, Trebek-audio, and glossary contracts; rewrote root README and agent/contributor entrypoints; reduced Gemini/Warp/root legacy docs to compatibility pointers; moved long-form uINVERSE thesis into ICM; preserved superseded material under archive before removing it from the active shelf; added `npm run docs:check` and a blocking CI documentation-integrity step.
- **Evidence/tests:** all documentation moves preserve source blobs through Git/archive history. CI proof is pending on the documentation PR; the new checker is intentionally expected to expose any remaining stale active references.
- **Decisions:** authority order is code/tests/browser evidence → `AGENTS.md` → this journal → canonical docs → ICM → archive. Documents have a lifecycle: discovery/idea → journal/ICM → canonical when proven → superseded → archive. Tool-specific instruction files may point inward but cannot define separate project law.
- **Unresolved:** run the new documentation check in CI, repair any broken/stale active references it exposes, finish archive/pointer cleanup, then merge only with the full production spine green.
- **Next lead domino:** make the knowledge architecture self-consistent under `docs:check`; once merged, audit and retire duplicate host-animation owners behind `HostSystem` + `HostStageActor` without changing behavior.
- **Refs:** `docs/knowledge-architecture`, `docs/README.md`, `AGENTS.md`, `docs/product/ROADMAP.md`.

### 2026-08-21 04:45 ET — ChatGPT — merge responsive footer Stage actor
- **Read/inspected:** PR #32, Stage/host ownership, responsive browser evidence, footer geometry, current host animation pathways.
- **Changed:** promoted footer into responsive Stage rail; integrated `HostStageActor` through `HostSystem`; added live bubble-tail tracking, responsive host sizing, safe-area/`100dvh` geometry, pacing/duck/surprise choreography, reduced-motion behavior, root `AGENTS.md`, and the host choreography catalog. Fixed the 16px viewport regression caused by default body margins.
- **Evidence/tests:** PR #32 passed JS lint, CSS lint, 40/40 Jest tests, Vite build, browser boot diagnostics, blocking runtime checks on desktop plus both protected iPhone viewports, Axe audit, and artifact upload.
- **Decisions:** `HostSystem` owns identity/personality/mood/image; `HostStageActor` owns Stage position/scale/facing/occlusion/choreography geometry. Footer is foreground scenery.
- **Unresolved:** older host-animation managers/integration paths remain and should be retired only after import/behavior audit.
- **Next lead domino:** documentation/agent-system convergence, then duplicate host-animation ownership cleanup.
- **Refs:** PR #32, `main@67bdce7`, `src/services/HostStageActor.js`.

### 2026-08-16 — ChatGPT — establish blocking production browser spine
- **Changed:** extracted and hardened the runtime browser checker, restored the gameplay shell and production question/assets path, removed audio preload from critical boot, repaired Stage centering/mobile overflow, and made browser proof blocking in CI.
- **Evidence/tests:** production app boots, multiple modes mount, real questions load, host images decode, MIME types are correct, clue state/render agree, desktop and iPhone layouts avoid protected overflow/overlap.
- **Decision:** browser reality is part of the contract. Presentation changes should be judged against the built app, not stylesheet intuition.
- **Refs:** PR #31 and subsequent `main` runtime CI.

### 2026-08-15 — ChatGPT — establish Trebek archival audio pipeline
- **Changed:** added immutable audio inventory, local whisper.cpp transcription worker, searchable index generation, and rights/runtime audit commands; documented semantic-event mapping and VoicePack eligibility boundaries.
- **Decision:** preserve source audio; classify virtually through metadata; searchable does not mean shippable; rights/provenance remain explicit gates.
- **Next lead domino at the time:** blocking browser proof, now completed.
- **Refs:** `docs/reference/TREBEK_AUDIO_ARCHIVE.md`, `scripts/*trebek-audio*.mjs`.
