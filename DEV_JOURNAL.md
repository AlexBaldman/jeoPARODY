# DEV JOURNAL — Agent Cypher

> **MANDATORY AGENT ENTRYPOINT.** Every AI agent, coding agent, reviewer, or human beginning substantive work in this repository must read this file first, then follow the linked current-state documents. Before finishing substantive work, append a concise handoff entry here describing what changed, evidence/tests, unresolved issues, and the next lead domino.

This is the project's asynchronous crew room: a persistent development conversation across Devin, Codex, ChatGPT, future agents, and humans. Treat prior entries like bars in a rap cypher: understand the beat before adding yours; advance the shared idea instead of starting a competing song.

## Operating contract

1. **Read before work:** this journal, `docs/JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md`, `docs/STAGE_RUNTIME_SYSTEM.md`, and `docs/vision/UINVERSE_PLATFORM_THESIS_2026-08-08.md`.
2. **Trust current code/tests over stale prose.** If documentation conflicts with newer verified implementation, record the conflict here and repair the docs.
3. **jeoPARODY is the long-term canonical destination.** Jeopardish is the short-term stable behavioral oracle/proving ground while goodness is deliberately ported.
4. **Lead-domino discipline:** fix the smallest upstream blocker that makes downstream work useful. Do not chase waterfalls.
5. **One owner per truth.** Stage/presentation receives semantic facts; it does not own game/domain truth.
6. **Do not prematurely build uINVERSE.** Let JeoPARODY prove Stage; later use You in Verse as the second-world pressure test and Brazillionaire as a multi-projection pressure test.
7. **Leave a handoff.** Record decisions, discoveries, regressions, tests, branches/PRs/commits, and what the next agent should do.

## Current north star

```text
Jeopardish (working behavioral oracle)
        ↓ prove / compare / extract
jeoPARODY (repair + canonicalize)
        ↓
semantic domain events
        ↓
Experience / Presentation Director
        ↓
Stage
        ↓
projection / performance
```

Immediate cascade:

```text
UNDERSTAND CURRENT REALITY
→ BOOT production build
→ PLAY one deterministic game spine
→ PROVE it in blocking browser CI
→ NORMALIZE state ownership
→ MAP Jeopardish goodness
→ PORT smallest Stage vertical slice
→ EXTRACT semantic boundary
→ PRESSURE-TEST portability on paper
→ STOP + REPORT next lead domino
```

## Platform thesis preserved from the 2026-08-08 design cypher

The Stage work may be revealing a reusable **semantic experience/projection grammar**, but Stage must remain a renderer/orchestrator rather than becoming the world model.

Long-range conceptual layers:

```text
WORLD / DOMAIN GRAPH
→ SEMANTIC EVENTS
→ EXPERIENCE DIRECTOR
→ STAGE / PROJECTION
→ verse | illustrated | 2D | 3D | audio | other lenses
```

A semantic place or object should eventually be capable of multiple manifestations without changing its identity. Example worlds/pressure tests:

- **JeoPARODY:** broadcast/game-show world; Game/Presentation Director.
- **You in Verse:** freestyle/rhyme notebook using handwriting-derived visual language; Performance/Cypher Director.
- **Brazillionaire:** language-learning scenes with settings, actors, props, adaptive Language Director, and mnemonic geography.
- **Memory Universe:** memory nodes/spaces and mnemonic manifestations.
- **Stool Samples:** comedy lab/stage for joke specimens, callbacks, delivery timing, emphasis, audience recognition, and performance analytics.
- **uINVERSE:** eventual umbrella/atlas/portfolio and living creative cosmology, not today's implementation target.

### World-metaphor capabilities

Prefer meaningful places/rituals over sterile settings panels where appropriate:

- Wardrobe → cosmetic asset selection
- Makeup chair → lightweight avatar edits
- Makeover studio → full avatar overhaul/regeneration
- Mall → asset discovery/acquisition/creator economy
- Workshop/prop room → creation/import/reusable objects
- Backlot → environments/settings
- Casting office → actors/characters
- Director booth → behavior/direction
- Archive → saved artifacts/history
- Gallery → publishing/portfolio

These capabilities may render as prose/choose-your-own-adventure, illustrated notebook/comic, 2D RPG, 3D open world, audio, etc. **Same semantic world; different projection.**

### Mythology / visual language notes

- Opening motif: Shakespeare's **“All the world's a stage”** as animated manuscript/script that gradually reveals Stage as both metaphor and architecture.
- `uINVERSE` can morph/read as Universe / U inverse / You in Verse / you inside the universe.
- Recurring `YOU ARE HERE` cartographic marker.
- In-world retro ad: **ALL YOUR BASE ARE BELONG TO U™**, with riffs on codebase/knowledge base/bass.
- Dark-Tower-like structural echoes: recurring entities/objects across worlds with persistent semantic identity but different manifestations. Inspiration is structural only; create original mythology and art.
- Git branches can be visualized as alternate histories/world-lines; archives remain visitable.
- Portfolio concept: drafting table × composition book × sketchpad × artifact binder × interactive thesis/graphic novel/choose-your-own-adventure. Different paper/material types can encode different information classes.

### Excavation Station

**Excavation Station** is the project-archaeology place/system: search old commits, branches, prototypes, conversations, assets, screenshots, abandoned architecture, and notes for valuable fossils. Agent searches become expeditions. Git history becomes geological strata/tunnels. Recovered items can be classified PRESERVE / EXTRACT / RESTORE / BURY (engineering equivalents of KEEP / PORT / REBUILD / ARCHIVE).

Potential temporal geography:

```text
OBSERVATORY — possible futures
      ↓
THE DESK / WORKSHOP — active creation
      ↓
EXCAVATION STATION — project archaeology
      ↓
DEEP ARCHIVE — preserved history
```

## Stool Samples seed

Preserve **SS-0001: “Chasing Waterfalls”** as the first conceptual regression specimen for a future joke/delivery algorithm. The point is not merely text generation. Model comedy as a temporal semantic graph including seed salience, callback distance, concealment, audience pattern completion, recognition window, performer realization, pronunciation/emphasis, pause/cadence, laugh recovery, and optional tags. The fictional comic premise must remain distinct from factual claims about a real person's death.

The associated mascot concept: a **pixel-art mosquito preserved in amber**, evoking a mined/fossilized comedy sample and project archaeology. Use original visual treatment rather than copying protected franchise branding.

## Agent handoff format

Append entries newest-first immediately below this heading when practical:

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

### 2026-08-08 — ChatGPT — establish persistent async agent cypher
- **Read/inspected:** repository root/docs structure and the current migration/Stage/uINVERSE documentation locations.
- **Changed:** created this mandatory dev-journal entrypoint and consolidated the latest design/architecture cypher into an agent-readable operating context.
- **Decisions:** jeoPARODY remains the long-term canonical destination; Jeopardish remains the behavioral oracle while parity is earned. uINVERSE ideas are pressure tests, not permission for a premature universal rewrite.
- **Unresolved:** ensure every agent entrypoint/instruction surface in the repo explicitly points here so this becomes unavoidable rather than merely another document nobody reads.
- **Next lead domino:** wire this journal into root agent instructions/README/CONTRIBUTING surfaces, then continue the production-boot → deterministic-game-spine cascade.
- **Refs:** `docs/JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md`, `docs/STAGE_RUNTIME_SYSTEM.md`, `docs/vision/UINVERSE_PLATFORM_THESIS_2026-08-08.md`.
