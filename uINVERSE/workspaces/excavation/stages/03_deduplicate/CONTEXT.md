# 03_deduplicate — resolve identity and ownership collisions

## Inputs
- Working: `../02_extract/output/`
- Reference: `../../../../atlas/entities/`

## Process
1. Compare candidate IDs, names, summaries, and relationship neighborhoods with the Atlas.
2. Classify each as new, update, alias, conflict, or archive evidence.
3. Produce a disposition table without editing the Atlas.

## Outputs
- `disposition.md` and revised candidates in `output/`

## Human check
Choose the canonical identity for every alias or conflict; links replace duplicate facts.

