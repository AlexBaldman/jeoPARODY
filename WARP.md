# WARP Agent Entry Point

This file exists only to route WARP into JeoPARODY's **current canonical operating system**. It must not duplicate changing architecture, deployment, AI-provider, or roadmap instructions.

## Start here

1. [`AGENTS.md`](AGENTS.md) — repository operating contract.
2. [`DEV_JOURNAL.md`](DEV_JOURNAL.md) — newest engineering handoffs and evidence.
3. [`docs/README.md`](docs/README.md) — documentation router and one-owner-per-truth map.
4. [`docs/MASTER_PLAN.md`](docs/MASTER_PLAN.md) — current priorities and next lead domino.
5. [`ARCHITECTURE.md`](ARCHITECTURE.md) — runtime ownership boundaries.

Use `npm run project:check` as the fast doctrine/deployment gate before spending time on the full test/runtime wall.

## Durable rules

- GitHub Pages Actions is the sole source-controlled static publisher. There is no `npm run deploy` branch publisher.
- Head-to-Head Firebase support is implemented, but production cloud activation remains gated by the real Firebase project and its automated live certification.
- AI provider service credentials never belong in browser storage, URL parameters, committed source, or client-visible Vite configuration. See [`docs/AI_PROVIDER_SETUP.md`](docs/AI_PROVIDER_SETUP.md).
- Firebase web configuration is client-visible by design; authorization lives in Auth + Firestore Security Rules.
- Core/domain truth stays deterministic; UI, transport, and Stage remain downstream adapters/projections.
- Prefer working vertical slices and earned abstractions over speculative framework construction.
- Preserve useful history, but never let historical documents outrank registered canonical owners.

If a detailed instruction here would need frequent updating, it belongs somewhere else. Humans already invented link rot; we do not need to invent truth rot too.
