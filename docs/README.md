# JeoPARODY Documentation Router

This directory is a **routing layer, not a second project database**. The goal is to make the current truth easy to find while preserving useful history without letting old documents silently become current architecture again.

## The rule

**One owner per truth. Links beat copies.**

If a fact changes, update the smallest document that owns that fact and link to it from broader documents. Do not repeat mutable status in several plans, READMEs, handoffs, and audits.

## Start here

| Need | Current owner |
|---|---|
| What is JeoPARODY right now? | [`../README.md`](../README.md) |
| How should an agent work in this repo? | [`../AGENTS.md`](../AGENTS.md) |
| Runtime architecture and ownership boundaries | [`../ARCHITECTURE.md`](../ARCHITECTURE.md) |
| Current priorities / next lead domino | [`MASTER_PLAN.md`](MASTER_PLAN.md) |
| Chronological engineering handoff | [`../DEV_JOURNAL.md`](../DEV_JOURNAL.md) |
| Durable cross-project concepts | [`../ICM/README.md`](../ICM/README.md) |
| Shared project vocabulary | [`IMMORTAL_DEV_GLOSSARY.md`](IMMORTAL_DEV_GLOSSARY.md) |
| Head-to-Head multiplayer | [`HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md`](HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md) |
| Needle Drop | [`NEEDLE_DROP_ARCHITECTURE.md`](NEEDLE_DROP_ARCHITECTURE.md) |
| Stage / show projection runtime | [`STAGE_RUNTIME_SYSTEM.md`](STAGE_RUNTIME_SYSTEM.md) |
| AI-provider credentials and proxy boundary | [`AI_PROVIDER_SETUP.md`](AI_PROVIDER_SETUP.md) |
| Canonical-repository migration history | [`JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md`](JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md) |

The machine-readable version of this map is [`canonical-docs.json`](canonical-docs.json). `npm run docs:check` verifies that registered owners exist and that their local Markdown links resolve.

## Document roles

### CANONICAL

Owns a current domain and may change as reality changes. There must be only one canonical owner for a domain.

Examples: `MASTER_PLAN.md`, `ARCHITECTURE.md`, the Head-to-Head architecture document.

### MILESTONE

An immutable or mostly immutable snapshot of what was proven at a meaningful point in time. New reality should be recorded in a new milestone or the current canonical owner, not by rewriting history.

Example: [`MULTIPLAYER_FOUNDATION_MILESTONE_2026-08-24.md`](MULTIPLAYER_FOUNDATION_MILESTONE_2026-08-24.md).

### REFERENCE

Useful specialized guidance, research, audits, implementation notes, or historical context. A reference document does **not** outrank a canonical owner when they disagree.

### HISTORY

Preserved provenance. Historical material may contain superseded repository names, architecture, plans, or assumptions. Preserve it when useful, but do not route implementation agents through it as current truth.

## How to add documentation

Before creating another Markdown file:

1. Ask whether an existing canonical owner should simply be updated.
2. If the new document owns a durable current domain, add it to `canonical-docs.json` with a unique domain.
3. If it records a shipped proof or dated decision, make its milestone/reference status explicit.
4. Link outward instead of duplicating current status.
5. Run `npm run docs:check`.
6. For substantive work, leave a `DEV_JOURNAL.md` handoff.

## Cleanup doctrine

Do **not** reorganize the whole docs tree merely because it looks untidy. Old audits and dated implementation notes can remain useful evidence. Cleanup should happen in this order:

```text
identify current owner
        ↓
repair contradictions
        ↓
add routing / machine checks
        ↓
understand inbound links + provenance
        ↓
archive or retire obsolete documents deliberately
```

A smaller number of trustworthy entrypoints is more valuable than a perfectly categorized graveyard.

## Deployment truth

The canonical static-site publisher is `.github/workflows/deploy-pages.yml` using GitHub Pages Actions. Do not add a second branch-based publisher or restore a `package.json` deploy script that writes to `gh-pages`.

GitHub Pages Actions is now proven as the active publisher through an exact-live-SHA verification against the public site. Firebase cloud activation remains a separate concern tracked by issue #44; the deployment workflow records whether a release is using local or Firebase multiplayer transport and only runs cloud multiplayer certification when Firebase configuration is present.
