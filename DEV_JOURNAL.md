# DEV JOURNAL — Agent Cypher

> **MANDATORY HANDOFF ROUTER.** Read this file before substantive work, then read the newest entries in `DEV_JOURNAL.d/` (filenames sort chronologically). Before finishing meaningful work, create one concise dated entry there.

This is the project's asynchronous crew room across humans and agents. It owns **chronological engineering handoffs**, not architecture, product strategy, or the cross-project idea universe.

Durable concept/world material belongs in `ICM/`. Current priorities belong in `docs/MASTER_PLAN.md`. Runtime ownership belongs in `ARCHITECTURE.md` and the relevant canonical system document. Documentation ownership/routing lives in `docs/README.md`.

## Why entries are split

The journal used to be one ever-growing Markdown file. That made append-only history easy for humans but unnecessarily risky for tools because adding one handoff required replacing a large mutable document. The complete monolithic journal through 2026-08-25 is preserved verbatim at:

`docs/history/DEV_JOURNAL_MONOLITH_THROUGH_2026-08-25.md`

New handoffs use one immutable-ish file per entry under `DEV_JOURNAL.d/`. This keeps the current control plane small while preserving history aggressively.

## Operating contract

1. Read `AGENTS.md` and this router.
2. Read the newest relevant files in `DEV_JOURNAL.d/`.
3. Use `docs/README.md` to locate the one current owner for the domain being changed.
4. Trust verified code/tests over stale prose, but repair the canonical owner when reality changes.
5. Follow the highest-upstream real blocker before polishing downstream symptoms.
6. Preserve useful history/provenance without routing current implementation through superseded docs.
7. Keep Stage/presentation downstream of game/domain truth.
8. Run the proof appropriate to the risk. `npm run project:check` is the fast doctrine/deployment/security contract.
9. Leave a dated handoff entry in `DEV_JOURNAL.d/`.

## Filename convention

Use UTC-offset-safe, lexicographically sortable names:

```text
YYYY-MM-DDTHHMM-short-mission.md
```

Example:

```text
2026-08-25T0047-tech-debt-branch-triage.md
```

## Handoff format

```md
# YYYY-MM-DD HH:MM ET — <agent/name> — <mission>

- **Read/inspected:**
- **Changed:**
- **Evidence/tests:**
- **Decisions:**
- **Unresolved:**
- **Next lead domino:**
- **Refs:** branch / PR / commit / docs
```

## Current north star

```text
small trusted project control plane
        ↓
clear domain truth + explicit boundaries
        ↓
working vertical slices
        ↓
blocking evidence
        ↓
earned reusable abstractions
```

Current lead-domino ownership lives in `docs/MASTER_PLAN.md`. Do not duplicate the changing roadmap here.
