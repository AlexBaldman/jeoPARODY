# Docs Index

This folder is split into a few kinds of documents:

- Canonical plans
- Historical audits
- Implementation guides
- Operational lore
- Lightly ridiculous metaphor fuel

If you only read one thing, read [MASTER_PLAN.md](MASTER_PLAN.md).

## Current Health Snapshot

Last local review: [REPO_REVIEW_2026-05-04.md](REPO_REVIEW_2026-05-04.md).

Current verification status:

- `npm test`: passing.
- `npm run build`: passing.
- `npm run lint`: passing with 41 warnings; `no-undef` is enforced as an error.
- `npm run lint:css`: failing; tracked as CSS refactor debt.
- `npm ci`: requires network access for ChromeDriver download.
- `npm audit --audit-level=high`: failing with 18 advisories; handle deliberately rather than applying automatic fixes blindly.

## At a Glance

| Doc | Purpose | Status |
|---|---|---|
| [MASTER_PLAN.md](MASTER_PLAN.md) | Canonical roadmap and source of truth | Active |
| [REPO_REVIEW_2026-05-04.md](REPO_REVIEW_2026-05-04.md) | Latest local repo review and verification notes | Active |
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

1. [MASTER_PLAN.md](MASTER_PLAN.md)
2. [REPO_REVIEW_2026-05-04.md](REPO_REVIEW_2026-05-04.md)
3. [brainstorming.md](brainstorming.md)
4. [EXPERIMENT_IDEA_LEDGER.md](EXPERIMENT_IDEA_LEDGER.md)
5. [MVP_SYSTEMS_AUDIT_2026-04-30.md](MVP_SYSTEMS_AUDIT_2026-04-30.md)
6. [JEOPARDISH_MIGRATION_AUDIT_2026-05-01.md](JEOPARDISH_MIGRATION_AUDIT_2026-05-01.md)
7. The implementation guides relevant to the subsystem you are touching

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
