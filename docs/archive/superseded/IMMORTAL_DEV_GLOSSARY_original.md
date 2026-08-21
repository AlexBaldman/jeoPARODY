# IMMORTAL DEV GLOSSARY

> Shared vocabulary for humans and agents working across jeoPARODY, Jeopardish, Stage, and the emerging uINVERSE architecture. Read alongside `DEV_JOURNAL.md`. These terms are compact operating instructions, not decorative lore.

## The Beam / Follow the Beam
Trace a symptom upstream through its dependency chain until reaching the earliest broken structural cause that creates the greatest downstream disorder. Fix there first.

```text
SYMPTOM → TRACE UPSTREAM → FIND THE BEAM → FIX SOURCE → VERIFY DOWNSTREAM REALIGNMENT
```

**Agent instruction:** when choosing between several plausible tasks, identify which one lies furthest upstream on the dependency path supporting the others.

## Salmon Swimming Upstream
The diagnostic motion used to find the Beam. Start at visible downstream behavior and swim against the dependency current: UI → presentation contract → semantic event → domain state → runtime/data/bootstrap source. Stop when the earliest actionable fault is found.

## Ka Is a Wheel
Recurring problems, concepts, manual operations, or architectural patterns are evidence. When the same shape returns repeatedly, do not automatically solve it from scratch. Record the recurrence and consider whether a reusable primitive, automation, convention, or tool has earned extraction.

**Guardrail:** recurrence is evidence for abstraction, not permission for premature abstraction.

## The Cypher
The persistent asynchronous collaboration protocol among humans and agents. Read the previous bars before adding yours. Advance the shared work, preserve discoveries, cite evidence, and leave the next participant a clean handoff in `DEV_JOURNAL.md`.

```text
LISTEN → UNDERSTAND THE BEAT → ADD A VERIFIED BAR → PASS THE CYPHER
```

## ThesaurusSAURUS Rex
The immortal glossary itself as a living translation layer between project mythology and precise operational meaning. When a coined phrase becomes useful to multiple agents, ThesaurusSAURUS Rex gives it one durable definition so the next worker does not have to reverse-engineer the joke, metaphor, or architectural intent from chat archaeology.

```text
NEW PHRASE → DEFINE IT ONCE → LINK IT TO BEHAVIOR → REUSE ACROSS AGENTS
```

Its job is to reduce semantic drift, naming collisions, duplicated discovery, and the peculiar human tendency to invent six terms for the same subsystem before lunch.

## The Hive
The collaborative project ecology in which many agents/humans can build separate cells that fit together around shared contracts, state, vocabulary, evidence, and goals.

A healthy Hive favors local autonomy with globally legible interfaces. Worker bees should be able to make useful cells without carrying the entire project in context.

```text
SHARED STATE + SHARED GLOSSARY + CLEAR CONTRACTS
                ↓
       INDEPENDENT CELLS
                ↓
        COHERENT HIVE
```

## Worker Bee
Any agent or human performing a bounded piece of work inside the Hive. A Worker Bee should receive enough local context and shared vocabulary to contribute safely, record what it changed, and leave the cell understandable to the next worker.

**Design implication:** architecture and documentation should minimize the amount of hidden context a new worker needs before producing useful verified work.

## The Queen
The source of high-level intent, taste, prioritization, and directional constraints in the Hive. The Queen can coexist with distributed execution and should not become a central implementation bottleneck.

The architectural goal is to let intent propagate through durable contracts, journals, glossaries, tests, and world/project state so the Hive continues to thrive even when the Queen is not synchronously supervising each cell.

## Thrive
A Hive state in which independent contributions compound instead of collide: workers can understand the current beat, make bounded changes, verify them, preserve context, and hand off cleanly. Thrive is an emergent property of good coordination primitives rather than constant central micromanagement.

## Lead Domino
The smallest upstream change that unlocks the largest amount of trustworthy downstream progress. Prefer a verified lead domino over a broad collection of downstream improvements.

## Waterfall / Don't Chase Waterfalls
The ordered cascade of dependency gates. Work downstream only after upstream conditions are proven. “Don't chase waterfalls” means do not abandon the dependency path for shiny parallel features or speculative architecture.

## Stage
The performance/projection layer. Stage receives semantic facts and renders/directs experience through actors, props, camera, lighting, audio, effects, transitions, and related presentation primitives. Stage does not own domain truth.

## World Graph
Long-range concept for semantic identity/state beneath particular projections. A world object can eventually have multiple manifestations without losing identity. This remains architectural context until real consumers justify extraction.

## Excavation Station
Project archaeology: systematic recovery of useful fossils from commits, branches, prototypes, conversations, screenshots, assets, abandoned architecture, and old notes. Agent searches can be treated as expeditions. Classifications: PRESERVE / EXTRACT / RESTORE / BURY.

## Observatory
Future-facing complement to Excavation Station: explore plausible opportunities, connections, and downstream consequences without confusing speculation with current implementation commitments.

## The Desk / Workshop
The present-tense creation layer between Observatory and Excavation Station: where verified current work is assembled.

## Asset Specimen
A creative artifact treated as durable project data rather than disposable output. Desired lifecycle: original bytes + stable ID + provenance + semantic tags + intended worlds/projections + variants + relationships + ownership/license metadata. The amber pixel mosquito for Stool Samples is an early reference specimen.

## Stool Sample
A structured comedy specimen containing more than joke text: seed, callback graph, semantic distance, delivery, emphasis, timing, audience recognition window, variants, tags, provenance, and performance evidence. `SS-0001` is “Chasing Waterfalls.”

## Build the System That Builds the System
When repeated project work reveals a stable pattern, capture the pattern so future work can become infrastructure: asset registration, excavation, migration analysis, Stage capability registration, agent handoffs, etc. Do not automate an operation merely because it happened once.

## uINVERSE
Long-range umbrella/atlas/portfolio/world architecture emerging from shared semantic and projection concepts. It is a pressure-test and north star, not authorization to interrupt jeoPARODY canonicalization with a universal-engine rewrite.

---

### Cypher rule
When a new phrase becomes useful enough that multiple agents could coordinate more efficiently by knowing it, add it here and note the addition in `DEV_JOURNAL.md`.
