# ICM — legacy Immortal Context Map

> Durable, agent-readable project memory. Read `DEV_JOURNAL.md` and `docs/IMMORTAL_DEV_GLOSSARY.md` first. ICM preserves ideas early without pretending every idea is an active implementation commitment.

**Naming clarification:** this historical folder uses ICM to mean *Immortal Context Map*. Jake Van Clief and David McDermott's ICM means *Interpretable Context Methodology* and is used for staged workflows in [`../uINVERSE/workspaces/`](../uINVERSE/workspaces/). The proposed long-term knowledge owner is the [`uINVERSE Atlas`](../uINVERSE/atlas/); no existing record has been migrated yet.

## Contract

Each project gets the same lightweight skeleton so humans/agents can recover intent without chat archaeology:

```text
ICM/projects/<slug>/
  README.md        # identity, promise, status, lead domino
  WORLD.md         # semantic world, actors, places, objects, events
  STAGE.md         # possible projections/directors; pressure test only until earned
  ASSETS.md        # asset specimens, provenance requirements, references
  BACKLOG.md       # seeds, experiments, unanswered questions
```

Statuses: `SEED`, `PRESSURE_TEST`, `PROTOTYPE`, `ACTIVE`, `CANONICAL`, `ARCHIVED`.

**Rule:** preserve aggressively; implement selectively. A folder existing here does not authorize scope creep.

For the repository's active canonical project, an ICM record may be a **routing node rather than a duplicate encyclopedia**. Detailed mutable engineering truth stays with its specialized canonical documents.

## Registry

| Project | Status | Purpose |
|---|---|---|
| `jeoparody` | CANONICAL | active proving ground for deterministic game modes, Stage boundaries, and reusable multiplayer architecture |
| `uinverse` | PRESSURE_TEST | umbrella atlas/portfolio/world architecture |
| `you-in-verse` | SEED | freestyle/rhyme notebook + semantic performance graph |
| `stool-samples` | SEED | comedy specimen laboratory and delivery algorithm |
| `algorhythm-b` | SEED | semantic-chain freestyle/game interface |
| `brazillionaire` | PRESSURE_TEST | language-learning world with actors/settings/director |
| `zeke-discovers` | SEED | child-centered discovery stories sourced from lived wonder |
| `archimedes` | SEED | Maltese protagonist/platformer and recurring cross-world character |
| `excavation-station` | PRESSURE_TEST | project archaeology and recovery workflow |
| `asset-library` | PRESSURE_TEST | first-class generated/imported asset registry and provenance pipeline |
| `sprite-foundry` | PRESSURE_TEST | reproducible manifest-backed asset production machine shop |

## Cross-project architecture hypothesis

```text
WORLD / DOMAIN GRAPH
        ↓
SEMANTIC EVENTS
        ↓
EXPERIENCE / PERFORMANCE DIRECTOR
        ↓
STAGE
        ↓
book | pixel | 2D | 3D | audio | notebook | game | portfolio
```

jeoPARODY is where Stage and shared infrastructure earn abstractions. The other projects are pressure tests, not excuses to build a universal engine prematurely.

A second architectural axis is now being earned through multiplayer work:

```text
IDENTITY
   ↓
ROOM / SESSION
   ↓
DURABLE INTENT
   ↓
AUTHORITY
   ↓
PUBLIC DETERMINISTIC STATE
   ↓
CLIENTS / PROJECTIONS
```

The 2026-08-24 Head-to-Head milestone proved these concepts in one real mode. They should not become a universal package until a second consumer proves which boundaries are genuinely shared.

## Conversation mine — 2026-08-08

Preserved concepts from the design cypher include: Stage as reusable projection/performance grammar; uINVERSE morphology; Russian-doll portfolio; Excavation Station; Observatory/Desk/Archive geography; Wardrobe/Makeup/Mall/Backlot/Casting/Director world metaphors; persistent semantic identity across projections; asset provenance; agent Cypher; Follow the Beam; Salmon Upstream; Ka Is a Wheel; ThesaurusSAURUS Rex/Hive vocabulary; Stool Samples SS-0001; ALgoRHYTHM B; Zeke Discovers; and Archimedes.

When a future conversation creates a durable project concept, add/update its ICM record and leave a DEV_JOURNAL handoff.
