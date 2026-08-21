---
status: canonical
owner: product-architecture
updated: 2026-08-21
supersedes:
  - docs/JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md
---

# Jeopardish → jeoPARODY Migration

## Decision

**jeoPARODY is the long-term canonical product destination.**

**Jeopardish is the behavioral oracle, proving ground, and donor** while useful capabilities are deliberately ported or rebuilt behind jeoPARODY's canonical owners.

This is not a wholesale merge.

```text
Jeopardish
stable/proven behavior
      ↓ inspect + prove
PORT / REBUILD / REFERENCE / RETIRE
      ↓
jeoPARODY
canonical product runtime
```

## Dispositions

Every donor capability should receive one disposition:

- **PORT** — implementation is isolated and fits current ownership with limited adaptation.
- **REBUILD** — preserve behavior/contract, implement through canonical jeoPARODY owners.
- **REFERENCE** — preserve fixtures, UX, semantics, art direction, tests, or requirements.
- **RETIRE** — obsolete, redundant, unsafe, or no longer desired.

Historical branch archaeology uses the compatible vocabulary **PRESERVE / EXTRACT / RESTORE / BURY**.

## Current cutover status

The runtime has now proven several former cutover gates:

- production build boots;
- core gameplay and multiple mode surfaces mount;
- real question assets load with correct content types;
- host assets decode;
- audio no longer blocks boot;
- blocking Playwright runtime checks run in CI;
- desktop and iPhone-class viewport regression checks pass;
- accessibility audit runs in CI.

Remaining convergence work should focus on reducing duplicate ownership and deliberately absorbing high-value donor behavior rather than reopening foundational boot work already proven.

## Highest-value donor systems

Candidate sequence, subject to current evidence:

1. deterministic scoring/judgment fixtures and edge cases;
2. episode/content contracts and authored round behavior;
3. Study/learning return-loop behavior;
4. host-performance/avatar pack semantics;
5. media preflight/substitution and localization contracts;
6. broader Stage/director patterns once proven by current Stage slices;
7. product-event/release gates;
8. full-board/PAO capabilities;
9. Couch Party/shared-screen behavior;
10. Host Studio / Topic Shows / grounded AI workflows.

Each slice must preserve a green production spine before the next broad port begins.

## Branch doctrine

Do not merge old branches merely because they are ahead by commits. Diverged branches are quarries. Extract useful behavior onto fresh branches from current `main`, verify it, then retire or archive the donor branch after preserving valuable assets/references.

## Asset doctrine

Code can be superseded aggressively. Assets and references should be **classified before pruning**. Inventory images, audio, video, questions, source art, reference material, and provenance before retiring any branch that may contain them.

## Stage migration rule

Stage remains presentation-only:

```text
semantic game event
→ presentation/performance cue
→ responsive Stage behavior
→ deterministic browser evidence
```

No Stage effect may mutate canonical score, clue, answer, round, or progression truth.

## End state

The desired result is one obvious product repository with a documented behavioral ancestry:

```text
Jeopardish = proven ancestor / oracle / archive
jeoPARODY = active canonical product
ICM       = durable cross-project memory / pressure tests
```

Canonical status is earned by behavior and evidence, not by which repository has the louder Markdown heading.
