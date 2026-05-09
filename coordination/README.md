# Multi-Agent Coordination

This folder is the shared coordination surface for Codex, Gemini CLI, subagents, browser tools, shell sessions, and humans working on Jeopardish.

## Read First

Every agent should read these files before making changes:

1. `coordination/README.md`
2. `coordination/active-work.md`
3. `coordination/ROOMS.md`
4. Latest file in `coordination/handoffs/`
5. Latest log file under `coordination/logs/`
6. Relevant docs in `docs/`, especially:
   - `docs/MVP_SYSTEMS_AUDIT_2026-04-30.md`
   - `docs/EXPERIMENT_IDEA_LEDGER.md`

## Required Convention

Before editing:

- **Claim before mutate:** Add or update your row in `coordination/active-work.md` with `Status: In Progress` BEFORE modifying any files.
- **Claim file groups:** List the specific files you intend to modify in the `Files Claimed` column.
- **Check for conflicts:** Avoid editing files claimed by another active agent. If a file you need is claimed, wait or ask for a handoff.
- Avoid editing files claimed by another active agent unless the user explicitly coordinates it.

After editing:

- Add a timestamped log with `npm run agent:log -- --agent "<name>" --task "<task>" --status "<status>" --files "<paths>"`.
- Update `coordination/active-work.md`.
- If you made a major architectural change, add or update a handoff in `coordination/handoffs/`.

For live observation:

- Share terminal transcripts or use a tool that captures session logs.
- Ask an observer agent to review the latest log in `coordination/logs/`.
- Keep final summaries in `coordination/logs/`.

## Log Quality Bar

Each log should make it possible for another agent to answer:

- Who changed this?
- When?
- Why?
- What files were touched?
- What checks were run?
- What should the next agent avoid duplicating or undoing?
- What risks or follow-ups remain?

## Generated vs Human Files

- `logs/` entries are append-only records.
- `live/` entries are terminal/session transcripts for observation.
- `handoffs/` are curated summaries for major coordination points.
- `decisions/`, `reviews/`, and `huddles/` are room-specific artifacts.
- `active-work.md` is a small live board and should be updated by every agent.
- `templates/` defines the preferred log format.
