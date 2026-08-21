# DEV JOURNAL — Agent Cypher

> **MANDATORY AGENT ENTRYPOINT.** Every AI agent, coding agent, reviewer, or human beginning substantive work in this repository must read this file first, then follow the linked current-state documents. Before finishing substantive work, append a concise handoff entry here describing what changed, evidence/tests, unresolved issues, and the next lead domino.

This is the project's asynchronous crew room: a persistent development conversation across Devin, Codex, ChatGPT, future agents, and humans. Treat prior entries like bars in a rap cypher: understand the beat before adding yours; advance the shared idea instead of starting a competing song.

## Operating contract

1. **Read before work:** this journal, `docs/JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md`, `docs/STAGE_RUNTIME_SYSTEM.md`, `docs/vision/UINVERSE_PLATFORM_THESIS_2026-08-08.md`, and `ICM/README.md`.
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
- **Zeke Discovers:** lived childhood discovery transformed into story worlds and multiple projections.
- **Archimedes:** Maltese platformer protagonist and cross-projection character identity test.
- **ALgoRHYTHM B:** semantic-chain freestyle graph/game.
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

### 2026-08-20 — Codex — close responsive host-stage review findings
- **Read/inspected:** PR #32 head and the latest CodeRabbit review threads for host-stage timing, personality-change geometry ownership, and the stairs dispatch.
- **Changed:** moved personality-change scale timing into `HostStageActor`; made celebrate/surprise completion wait for both stage and mood work; added a reduced-motion-aware `fakeStairs()` beat and routed the stairs animation to it.
- **Evidence/tests:** verified the patch against the current PR head and preserved the existing responsive/reduced-motion ownership boundaries; GitHub CI remains the execution proof after push.
- **Decisions:** kept the fix confined to the two host owners; used composable `scale`/`translate` animation properties so personality and stairs beats do not overwrite stage movement transforms.
- **Unresolved:** none within the three reviewed findings.
- **Next lead domino:** confirm PR checks and protected desktop/iPhone runtime viewports remain green.
- **Refs:** `work/footer-stage-host-motion-live4`, PR #32.

### 2026-08-09 15:58 ET — ChatGPT — audit and integrate current repo work
- **Read/inspected:** current `main`, recent commits, GitHub Actions, open/diverged branches, production-readiness convergence work, Devin audit/refactor branches, AI-provider branch, CSS/UI branches, old Mac branches, and the Sprite Foundry ICM branch.
- **Changed:** restored the blocking CI verification path on `main` through PR #29; added ESLint flat config and actionable Stylelint annotations; repaired undefined AI fallback and host-animation sound wiring; normalized token CSS; integrated the Sprite Foundry ICM corpus onto a fresh branch and registered it as `PRESSURE_TEST` rather than blindly inheriting `ACTIVE` status.
- **Evidence/tests:** PR #29 passed JS lint, CSS lint, Jest tests, Vite build, accessibility step, and artifact upload; squash commit `0e39a9a` then passed the same full CI pipeline on `main`. GitHub Actions is the authoritative execution environment for this pass because the local sandbox could not resolve github.com for a clone.
- **Decisions:** do not wholesale-merge heavily diverged branches. `cleanup/production-readiness`, Devin refactor work, `review/css-ui-fixes`, Mac branches, and the old AI integration branch are salvage quarries/oracles until individual behaviors are re-proved against current `main`. `fix/css-audit-fixes` is already fully behind main. Sprite Foundry is valuable context, but factory implementation remains gated by the canonical runtime/deterministic-spine work.
- **Unresolved:** current CI proves lint/tests/build, not a real blocking browser playthrough; GitHub Actions also warns that checkout/setup-node v4 target deprecated Node 20 runtimes. Several historical branches contain useful features that still need capability-by-capability archaeology rather than merge-by-branch thinking.
- **Next lead domino:** add a blocking deterministic browser smoke path that boots the production build and exercises one game spine; then use that proof harness to port the smallest Stage/runtime slice and selectively mine production-readiness/Jeopardish goodness.
- **Refs:** `main@0e39a9a`, PR #29, `integrate/sprite-foundry-context`, `ICM/projects/sprite-foundry/*`.

### 2026-08-08 — ChatGPT — mine design cypher into ICM
- **Read/inspected:** full active conversation context; existing glossary/journal; current repo root/docs; Zeke concept boards and real-life playground reference supplied in conversation.
- **Changed:** established `ICM/` as the Immortal Context Map and scaffolded durable project records for uINVERSE, You in Verse, Stool Samples, ALgoRHYTHM B, Brazillionaire, Zeke Discovers, Archimedes, Excavation Station, and the self-building Asset Library.
- **Evidence/tests:** documentation-only pass; no runtime behavior changed.
- **Decisions:** preserve aggressively but implement selectively. ICM folder existence is not authorization for scope creep. Zeke and Archimedes become explicit future Stage/world-identity pressure tests. Asset generation/import should eventually auto-register provenance and semantic metadata.
- **Unresolved:** actual conversation image bytes are not yet committed into the repo asset library; manifests/validator are intentionally not implemented yet. Memory Universe deserves its own ICM record in a later archaeology pass using its fuller existing corpus rather than a shallow stub.
- **Next lead domino:** return to jeoPARODY production boot → deterministic playable spine. In parallel only when non-blocking, establish the smallest asset-manifest convention around an existing Stage asset + amber mosquito specimen.
- **Refs:** `ICM/README.md`, `ICM/projects/*`, `docs/IMMORTAL_DEV_GLOSSARY.md`.

### 2026-08-08 — ChatGPT — establish persistent async agent cypher
- **Read/inspected:** repository root/docs structure and the current migration/Stage/uINVERSE documentation locations.
- **Changed:** created this mandatory dev-journal entrypoint and consolidated the latest design/architecture cypher into an agent-readable operating context.
- **Decisions:** jeoPARODY remains the long-term canonical destination; Jeopardish remains the behavioral oracle while parity is earned. uINVERSE ideas are pressure tests, not permission for a premature universal rewrite.
- **Unresolved:** ensure every agent entrypoint/instruction surface in the repo explicitly points here so this becomes unavoidable rather than merely another document nobody reads.
- **Next lead domino:** wire this journal into root agent instructions/README/CONTRIBUTING surfaces, then continue the production-boot → deterministic-game-spine cascade.
- **Refs:** `docs/JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md`, `docs/STAGE_RUNTIME_SYSTEM.md`, `docs/vision/UINVERSE_PLATFORM_THESIS_2026-08-08.md`.
