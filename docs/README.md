# Docs Index

This folder is split into a few kinds of documents:

- Canonical plans
- Historical audits
- Implementation guides
- Operational lore
- Lightly ridiculous metaphor fuel

If you only read one thing for implementation gates, read [PRODUCTION_REMEDIATION_PLAN_2026-05-26.md](PRODUCTION_REMEDIATION_PLAN_2026-05-26.md).

If you are trying to understand the whole Jeopardish -> JeoPARODY convergence, read [SOURCE_MATERIAL_INDEX.md](SOURCE_MATERIAL_INDEX.md), [SALVAGE_REGISTER.md](SALVAGE_REGISTER.md), and [CARMACK_CONVERGENCE_REVIEW.md](CARMACK_CONVERGENCE_REVIEW.md).

## Current Health Snapshot

Last full audit and local verification: 2026-05-26, consolidated into [PRODUCTION_REMEDIATION_PLAN_2026-05-26.md](PRODUCTION_REMEDIATION_PLAN_2026-05-26.md). [REPO_REVIEW_2026-05-04.md](REPO_REVIEW_2026-05-04.md) remains historical context.

Current verification status:

- `npm test -- --runInBand`: passing, 6 suites / 58 tests.
- `npm run build`: passing.
- `npm run lint`: passing.
- `npm run lint:css`: passing.
- `npm run test:runtime`: failing in both development and production preview paths because the application does not complete interactive startup.
- Production preview asset delivery: failing because required question data is not currently packaged into `dist`.
- `npm audit --json`: five moderate fixable transitive advisories remain; handle deliberately rather than applying automatic fixes blindly.

## At a Glance

| Doc | Purpose | Status |
|---|---|---|
| [PRODUCTION_REMEDIATION_PLAN_2026-05-26.md](PRODUCTION_REMEDIATION_PLAN_2026-05-26.md) | Canonical remediation roadmap and release gates | Active |
| [SOURCE_MATERIAL_INDEX.md](SOURCE_MATERIAL_INDEX.md) | Dated map of JeoPARODY, Jeopardish, old docs, and supersession rules | Active |
| [SALVAGE_REGISTER.md](SALVAGE_REGISTER.md) | Tracks what to mine from Jeopardish and how to rebuild it in JeoPARODY | Active |
| [CARMACK_CONVERGENCE_REVIEW.md](CARMACK_CONVERGENCE_REVIEW.md) | Cofounder-style critique layer for tuning the game into a fast, funny learning machine | Active |
| [REPO_REVIEW_2026-05-04.md](REPO_REVIEW_2026-05-04.md) | Earlier local repo review and verification notes | Historical |
| [brainstorming.md](brainstorming.md) | Nautical naming map and metaphor rules | Active |
| [EXPERIMENT_IDEA_LEDGER.md](EXPERIMENT_IDEA_LEDGER.md) | Good ideas mined from old branches | Active |
| [MVP_SYSTEMS_AUDIT_2026-04-30.md](MVP_SYSTEMS_AUDIT_2026-04-30.md) | Systems audit and product direction | Historical |
| [JEOPARDISH_MIGRATION_AUDIT_2026-05-01.md](JEOPARDISH_MIGRATION_AUDIT_2026-05-01.md) | Migration audit from Jeopardish into JeoPARODY | Historical |
| [AI_PROVIDER_SETUP.md](AI_PROVIDER_SETUP.md) | Host/provider setup notes | Active |
| [CSS.md](CSS.md) | CSS architecture and layering | Active |
| [css-refactor-plan.md](css-refactor-plan.md) | CSS overhaul plan | Active |
| [CSS_AUDIT_REPORT.md](CSS_AUDIT_REPORT.md) | Detailed CSS findings | Historical |
| [MEDIA_RENDERING_IMPLEMENTATION.md](MEDIA_RENDERING_IMPLEMENTATION.md) | Media styling implementation notes | Active |
| [MCP.md](MCP.md) | Browser automation and MCP setup | Active |
| [SHIPYARD_COMMAND_MANUAL.md](SHIPYARD_COMMAND_MANUAL.md) | Cockpit / Shipyard operational manual | Operational |
| [FLEET_REGISTRY.md](FLEET_REGISTRY.md) | Agent registry and role map | Operational |

## Reading Order

1. [PRODUCTION_REMEDIATION_PLAN_2026-05-26.md](PRODUCTION_REMEDIATION_PLAN_2026-05-26.md)
2. [SOURCE_MATERIAL_INDEX.md](SOURCE_MATERIAL_INDEX.md)
3. [SALVAGE_REGISTER.md](SALVAGE_REGISTER.md)
4. [CARMACK_CONVERGENCE_REVIEW.md](CARMACK_CONVERGENCE_REVIEW.md)
5. [REPO_REVIEW_2026-05-04.md](REPO_REVIEW_2026-05-04.md) for historical context
6. [brainstorming.md](brainstorming.md)
7. [EXPERIMENT_IDEA_LEDGER.md](EXPERIMENT_IDEA_LEDGER.md)
8. [MVP_SYSTEMS_AUDIT_2026-04-30.md](MVP_SYSTEMS_AUDIT_2026-04-30.md)
9. [JEOPARDISH_MIGRATION_AUDIT_2026-05-01.md](JEOPARDISH_MIGRATION_AUDIT_2026-05-01.md)
10. The implementation guides relevant to the subsystem you are touching

## Tone Guide

Use a little wit.
Use a few puns.
Use emoji like buoy markers, not confetti cannons. ⚓

The docs should be pleasant to read, but the repo still has to do real work.

## Meme Shelf

- `This is fine` = the build is red but the plan is still coherent.
- `Two buttons` = scope tradeoff time.
- `Expanding brain` = clue board, review queue, learning loop, cockpit.

If a joke competes with clarity, the joke loses.
