# JeoPARODY Documentation Router

This directory is a **routing layer, not a second project database**. Make current truth easy to find while preserving history without letting old documents quietly become architecture again.

## The rule

**One owner per truth. Links beat copies.**

If a fact changes, update the smallest document that owns it and link to that owner from broader documents. Do not repeat mutable status across six plans because apparently Markdown can also develop distributed-consensus problems.

## Start here

| Need | Current owner |
|---|---|
| What is JeoPARODY right now? | [`../README.md`](../README.md) |
| How should an agent work in this repo? | [`../AGENTS.md`](../AGENTS.md) |
| Runtime architecture and ownership boundaries | [`../ARCHITECTURE.md`](../ARCHITECTURE.md) |
| Current priorities / next lead domino | [`MASTER_PLAN.md`](MASTER_PLAN.md) |
| Chronological engineering handoff | [`../DEV_JOURNAL.md`](../DEV_JOURNAL.md) |
| Durable cross-project concepts | [`../ICM/README.md`](../ICM/README.md) |
| Proposed uINVERSE Atlas and workflow architecture | [`../uINVERSE/README.md`](../uINVERSE/README.md) |
| Shared vocabulary | [`IMMORTAL_DEV_GLOSSARY.md`](IMMORTAL_DEV_GLOSSARY.md) |
| Head-to-Head multiplayer | [`HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md`](HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md) |
| Needle Drop | [`NEEDLE_DROP_ARCHITECTURE.md`](NEEDLE_DROP_ARCHITECTURE.md) |
| Stage / show projection runtime | [`STAGE_RUNTIME_SYSTEM.md`](STAGE_RUNTIME_SYSTEM.md) |
| AI-provider credentials and proxy boundary | [`AI_PROVIDER_SETUP.md`](AI_PROVIDER_SETUP.md) |
| Completed Convergence 2.0 dispositions | [`CONVERGENCE_2_CAPABILITY_MATRIX_2026-08-25.md`](CONVERGENCE_2_CAPABILITY_MATRIX_2026-08-25.md) |
| Canonical-repository migration history | [`JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md`](JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md) |

The machine-readable version of this map is [`canonical-docs.json`](canonical-docs.json). `npm run docs:check` verifies registered owners/files and selected local links.

## Document roles

### CANONICAL

Owns a current mutable domain. There must be only one canonical owner for a domain.

Examples: `MASTER_PLAN.md`, `ARCHITECTURE.md`, Head-to-Head architecture.

### MILESTONE

A mostly immutable snapshot of a shipped proof or completed bounded campaign. New reality belongs in a current canonical owner or a new milestone, not by rewriting the old proof into something it was not.

Examples:

- [`MULTIPLAYER_FOUNDATION_MILESTONE_2026-08-24.md`](MULTIPLAYER_FOUNDATION_MILESTONE_2026-08-24.md)
- [`CONVERGENCE_2_CAPABILITY_MATRIX_2026-08-25.md`](CONVERGENCE_2_CAPABILITY_MATRIX_2026-08-25.md)

### REFERENCE

Useful specialized guidance, research, audits, donor behavior, or historical implementation notes. Reference material does **not** outrank a canonical owner.

### HISTORY

Preserved provenance. It may contain superseded repository names, architecture or plans. Preserve useful archaeology without routing current implementation through it.

## How to add documentation

Before creating another Markdown file:

1. Ask whether an existing canonical owner should simply change.
2. If the new document owns a durable current domain, register one unique domain in `canonical-docs.json`.
3. If it records a completed proof/decision, mark it milestone/reference explicitly.
4. Link instead of duplicating mutable status.
5. Run `npm run docs:check`.
6. For substantive work, add a dated handoff under `DEV_JOURNAL.d/`.

## Cleanup doctrine

Do **not** reorganize the whole docs tree because it looks untidy. Cleanup order is:

```text
identify current owner
        ↓
repair contradictions
        ↓
add routing / machine checks
        ↓
understand provenance + inbound links
        ↓
archive or retire deliberately
        ↓
STOP when current work is no longer blocked
```

A small number of trustworthy entrypoints is more valuable than a perfectly alphabetized graveyard.

## Current project boundary

Convergence 2.0 is complete. Its milestone records the answer/scoring convergence, GameEngine simplification, retired duplicate architecture and disposition of remaining dormant/reference files.

The product lead domino is again **Firebase activation and real cloud proof, issue #44**. Future repository hygiene belongs to issue #58 and must not preempt product work merely because an import graph contains unused candidates.

## Deployment truth

The canonical static-site publisher is `.github/workflows/deploy-pages.yml` using GitHub Pages Actions on the Node 24 workflow baseline. Do not add a second branch publisher or restore a `package.json` deploy script that writes to `gh-pages`.

GitHub Pages Actions has been proven as the active publisher through exact-live-SHA verification. Firebase activation is separate: the workflow records whether a release uses local or Firebase multiplayer transport and only runs cloud multiplayer certification when Firebase configuration is present.
