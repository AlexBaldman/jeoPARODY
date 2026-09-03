# Review packet 001 — project-memory architecture specimen

Status: AWAITING_HUMAN_REVIEW

Nothing in this packet has been promoted to the Atlas.

## Why this packet matters

This is the first real proving run through the merged excavation architecture. It intentionally contains concepts that are partly new, partly already canonical, and partly preserved in older ICM material. The goal is to test whether the pipeline reduces ambiguity before it increases canon.

## Proposed entity decisions

| candidate | recommendation | proposed canonical treatment |
|---|---|---|
| bus-the-table | ACCEPT_IDENTITY / LINK_EXISTING | Preserve `AGENTS.md` as doctrine authority. Add an Atlas principle only if graph navigation benefits from a pointer entity; never duplicate the rule text as a competing authority. |
| system-memory-doctrine | ACCEPT / RENAME | Canonical principle name: **Externalize Memory**. Summary: details that machines can reliably preserve should not consume human active memory. |
| compress-upward | ACCEPT | Canonical principle. Increasing internal complexity should produce simpler human-facing projections. |
| project-cockpit | ACCEPT_AS_EXPLORING | Product/projection concept, not an implementation commitment yet. |
| context-compiler | ACCEPT_AS_PROVING | System candidate and recommended next implementation proof after this packet clears Review. |
| municipal-crews | MERGE_WITH_EXISTING | Reconcile with the existing **City workers / maintenance crews** ICM concept. Preferred Atlas identity: `municipal-crews`; preserve prior name as provenance/alias in descriptive material rather than duplicate entity. |
| excavation-workflow | LINK_EXISTING | The existing workspace is already the implementation owner. Avoid a second conceptual authority unless the Atlas needs a navigational system/workflow pointer. |
| proving-before-scale | ACCEPT | Canonical principle: prove one bounded difficult specimen before bulk ingestion or abstraction expansion. |

## Proposed relationship decisions

| relationship | recommendation | reason |
|---|---|---|
| project-cockpit → depends_on → compress-upward | ACCEPT | Directly supported by the source definition. |
| context-compiler → depends_on → system-memory-doctrine | ACCEPT_INFERENCE | Strong architectural inference; keep provenance that it was inferred. |
| municipal-crews → uses → context-compiler | PARK | Plausible but premature. Crews should depend on stable graph/query contracts, not necessarily one compiler implementation. |
| excavation-workflow → related_to → proving-before-scale | ACCEPT | Directly supported by the proving sequence. |
| bus-the-table → related_to → municipal-crews | ACCEPT_INFERENCE | Useful conceptual relationship, but preserve its inferred origin. |

## Human approval boundary

Promotion requires an explicit human decision after reviewing this file. Until then:

- do not create or modify Atlas entity records from these candidates;
- do not copy candidate relationships into canonical relationship arrays;
- do not enable portfolio/showcase/reusable promotion flags;
- preserve this packet as evidence even if some candidates are rejected.

## What the proving run already taught us

1. Deduplication is not optional: 3 of 8 candidate concepts collided with existing durable truth.
2. Relationship provenance matters: several attractive edges are useful hypotheses but not source facts.
3. A human review packet can be dramatically smaller than the source conversation while retaining the decisions that actually need judgment.
4. The next highest-leverage proof, if Review approves the concept, is a minimal Context Compiler that can answer a bounded question such as **“what does an agent need to work on host choreography?”** from canonical graph/document relationships without loading the entire project corpus.
