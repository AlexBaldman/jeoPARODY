# Documentation Archive

This directory preserves historical plans, audits, handoffs, and superseded instructions so useful context remains recoverable without competing with current truth.

## Rule

**Archive is evidence, not authority.**

If an archived document contains an idea worth restoring, migrate that idea into a current canonical doc or ICM record and record the decision in `DEV_JOURNAL.md`. Do not simply point active work at an old plan because it happens to contain a familiar phrase.

## Categories

- `agents/` — superseded tool-specific agent instructions.
- `plans/` — historical roadmaps/refactor plans.
- `audits/` — point-in-time forensic reports.
- `handoffs/` — superseded one-off handoff notes now represented by the journal.
- `evidence/` — dated regression notes and implementation evidence that remain useful for archaeology.
- `superseded/` — older canonical-looking docs replaced by a newer owner.

## Restoration protocol

```text
FIND OLD IDEA
→ verify against current code/tests
→ decide RESTORE / REWRITE / REFERENCE / BURY
→ migrate into current owner
→ record provenance + decision
```

Git history remains the deepest archive. This directory exists to make historically useful material discoverable without letting it impersonate the present.
