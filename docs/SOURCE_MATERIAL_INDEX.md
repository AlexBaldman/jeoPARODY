# JeoPARODY Source Material Index

Status: Active orientation document  
Prepared: 2026-06-03  
Purpose: Prevent the project from forgetting that JeoPARODY is the canonical runtime while Jeopardish remains the prototype and idea mine.

## Core Relationship

JeoPARODY is the intended final product and canonical implementation target.

Jeopardish is not obsolete trash. It is the prototype archive: a working static MVP, tested learning mechanics, question sharding experiments, Review Misses behavior, answer validation refinements, host/ticker tone, art references, and historical branch ideas.

The correct development posture is convergence:

```text
Jeopardish validated experiments + JeoPARODY architecture + newer vision docs
  -> stable, original, hilarious, educational trivia game platform
```

## Current Canonical Docs

| Document | Role | Use |
| --- | --- | --- |
| `docs/PRODUCTION_REMEDIATION_PLAN_2026-05-26.md` | Active stabilization roadmap | Use as the current fence sequence for runtime, assets, scoring, security, learning, and identity. |
| `ARCHITECTURE.md` | Active runtime truth | Use when deciding where code belongs. Current MVP path is static DOM -> `src/main.js` -> `GameEngine` -> event bus -> active DOM. |
| `docs/README.md` | Docs index | Keep it updated whenever a new planning or implementation-control doc becomes important. |
| `coordination/active-work.md` | Live work board | Check before editing; this repo has active dirty work and local-only commits. |
| `docs/EXPERIMENT_IDEA_LEDGER.md` | Idea backlog | Keep experimental ideas here until they are cleanly rebuilt. |

## Historical But Important Docs

| Document | Why It Still Matters |
| --- | --- |
| `docs/JEOPARDISH_MIGRATION_AUDIT_2026-05-01.md` | Records which Jeopardish features were already migrated and which remain worth mining. |
| `docs/MVP_SYSTEMS_AUDIT_2026-04-30.md` | Defines the product system: fast clue loop, learning memory, arcade identity, review misses, data performance. |
| `docs/REPO_REVIEW_2026-05-04.md` | Historical verification and risk snapshot; some findings are stale, but the review pattern is useful. |
| `../jeoparody.old/docs/MASTER_PLAN.md` | Superseded source-of-truth, but still captures the foundational "make it work, make it right, make it fast" philosophy. |
| `/Users/alex/.gemini/antigravity/brain/.../jeopardish_jeoparody_review.md` | Prior comprehensive cross-repo comparison; useful for repository history and branch status. |

## Legacy Source Repo: Jeopardish

Path: `/Users/alex/coding/jeopardish`

Read these before mining code:

| Document | Use |
| --- | --- |
| `README.md` | Current Jeopardish MVP shape and runtime command. |
| `docs/DEVELOPER_GUIDE.md` | Module boundaries: `app.js`, `view.js`, `question-bank.js`, `game-session.js`, `game-logic.js`. |
| `docs/EXPERIMENT_IDEA_LEDGER.md` | What Jeopardish believes should move into JeoPARODY. |
| `coordination/handoffs/2026-05-01T030326Z-codex-to-gemini.md` | Exact "do not regress" list for shards, Review Misses, and static MVP behavior. |
| `docs/MVP_SYSTEMS_AUDIT_2026-04-30.md` | Product, engineering, content, and experience audit. |

Important verified state from the latest review:

- `npm run verify` passes in Jeopardish.
- Jeopardish validates 216,930 canonical questions, 10 starter questions, and 128 shards.
- Jeopardish includes tested `game-session.js`, `question-bank.js`, `view.js`, Review Misses, stable shard lookup, and explainable answer logic.

## Reading Order For A New Agent

1. `docs/README.md`
2. `docs/PRODUCTION_REMEDIATION_PLAN_2026-05-26.md`
3. `ARCHITECTURE.md`
4. `docs/SOURCE_MATERIAL_INDEX.md`
5. `docs/SALVAGE_REGISTER.md`
6. `docs/CARMACK_CONVERGENCE_REVIEW.md`
7. `coordination/active-work.md`
8. Jeopardish docs only for the specific feature being mined

## Date And Supersession Rules

- Newer docs generally supersede older docs for runtime status.
- Older docs remain authoritative for ideas that were never migrated.
- A passing command result beats an old failure note.
- A runtime smoke failure beats a successful build.
- Never treat generated enthusiasm as evidence. Verify with tests, build, runtime preview, and direct source inspection.

