# Gemini Agent Entry Point

This file is intentionally a **thin router**, not a second agent manual.

Before substantive work in JeoPARODY:

1. Read [`AGENTS.md`](AGENTS.md) for the repository operating contract.
2. Read the newest entries in [`DEV_JOURNAL.md`](DEV_JOURNAL.md).
3. Use [`docs/README.md`](docs/README.md) to locate the canonical owner for the domain being changed.
4. Read [`docs/MASTER_PLAN.md`](docs/MASTER_PLAN.md) for the current lead domino.
5. Run the proof appropriate to the change; `npm run project:check` is the fast doctrine/deployment gate.
6. Leave a newest-first `DEV_JOURNAL.md` handoff for substantive work.

## AI credential rule

Do **not** put Gemini, Claude, or other provider service credentials in source, URL parameters, Vite client variables, or browser storage.

JeoPARODY's current Gemini browser provider talks only to the trusted `/api/gemini/*` proxy contract. Remote AI is optional; local/fallback behavior must keep gameplay functional when no proxy is configured.

The canonical owner for provider configuration and credential policy is [`docs/AI_PROVIDER_SETUP.md`](docs/AI_PROVIDER_SETUP.md).

Firebase `VITE_FIREBASE_*` web configuration is intentionally client-visible and follows a different security model. Do not generalize that model to AI provider secrets.

## Do not duplicate current architecture here

Runtime architecture belongs in [`ARCHITECTURE.md`](ARCHITECTURE.md). Current priorities belong in `docs/MASTER_PLAN.md`. Multiplayer, Stage, Needle Drop, and other domains each have their own registered owners.

Links beat copies. If reality changes, update the canonical owner rather than expanding this file into another alternate timeline.
