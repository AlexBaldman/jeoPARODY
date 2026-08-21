---
status: reference
owner: project-language
updated: 2026-08-21
---

# Immortal Dev Glossary

Shared vocabulary for humans and agents. These phrases are compact operating instructions, not decorative lore.

## The Beam / Follow the Beam
Trace visible disorder upstream until reaching the earliest actionable cause that unlocks the most downstream progress.

```text
SYMPTOM → SWIM UPSTREAM → FIND SOURCE → FIX → VERIFY DOWNSTREAM
```

## Lead Domino
The smallest upstream change that unlocks the largest amount of trustworthy downstream progress.

## Salmon Swimming Upstream
The diagnostic motion used to find the Beam. Follow dependency flow backward: presentation → semantic event → domain state → data/bootstrap/source.

## Waterfall / Don't Chase Waterfalls
The dependency cascade. Proceed downstream after upstream gates are proven; do not abandon the path for shiny parallel work.

## The Bus-the-Table Rule
Capture otherwise-wasted motion. When already touching a subsystem, remove one nearby piece of friction when it is small, safe, understood, and verifiable without widening the mission.

```text
ALREADY HERE + CHEAP SAFE FRICTION
            ↓
         REMOVE IT
            ↓
      COMPOUNDING HYGIENE
```

## Leave the Campsite Cleaner
A completed change should reduce ambiguity in the area it touches: fewer duplicate owners, clearer names/contracts, better evidence, less dead clutter.

## One Owner per Truth
Every important fact or responsibility gets one canonical owner. Competing authoritative systems eventually create ambiguity rather than redundancy.

## Preserve the Fossil Before Moving the Rock
Before deleting, consolidating, or retiring old branches/docs/assets, preserve unique information, provenance, behavior, or references. Cleanup should remain reversible through Git/archive evidence.

## Main Stays Boring
Experiments belong on focused branches. Canonical `main` should remain green, deployable, and unsurprising.

## Ka Is a Wheel
Recurrence is evidence. When a manual operation or problem shape returns repeatedly, consider extracting a reusable primitive or tool.

**Guardrail:** recurrence permits investigation of abstraction; it does not automatically justify one.

## Build the System That Builds the System
When repeated work reveals a stable pattern, turn the proven pattern into reusable infrastructure: asset registration, transcription, migration analysis, Stage choreography, agent handoffs, maintenance scripts, etc.

## The Cypher
Persistent asynchronous collaboration. Read previous work, understand the current beat, add a verified contribution, and leave a clear handoff in `DEV_JOURNAL.md`.

## The Hive / Worker Bee
The project ecology and its bounded contributors. Architecture and docs should let a worker perform useful local work without loading the entire creative universe into context.

## Thrive
A state where independent contributions compound rather than collide because shared contracts, evidence, vocabulary, and ownership make local work globally legible.

## ThesaurusSAURUS Rex
The glossary as a translation layer between memorable project mythology and precise operational meaning. Define useful coined terms once so later workers do not reverse-engineer jokes from chat archaeology.

## Excavation Station
Project archaeology: systematic recovery of useful fossils from commits, branches, prototypes, conversations, screenshots, assets, abandoned architecture, and notes.

Typical dispositions: **PRESERVE / EXTRACT / RESTORE / BURY**.

## Observatory
Future-facing complement to Excavation Station. Explore possibilities without confusing them with current commitments.

## The Desk / Workshop
Present-tense creation layer where verified current work is assembled.

## Stage
The performance/projection layer. Stage receives semantic truth and renders experience through actors, scenery, camera, audio, FX, transitions, and UI. Stage does not own domain truth.

## Asset Specimen
A creative artifact treated as durable data: immutable source + stable identity + provenance + semantic metadata + variants + rights/licensing + relationships + runtime projections.

## ICM / Immortal Context Map
Durable memory for ideas and pressure tests. ICM preserves important concepts before they earn implementation status.

## uINVERSE
Long-range umbrella/atlas/portfolio/world architecture. It is a pressure test and north star, not permission to interrupt JeoPARODY with a universal-engine rewrite.

## Cypher rule
When a coined phrase becomes useful enough that multiple workers would coordinate better by knowing it, define it here and record the addition in the journal.
