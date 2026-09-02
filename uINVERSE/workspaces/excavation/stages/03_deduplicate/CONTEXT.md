# 03_deduplicate — resolve identity and ownership collisions

## Inputs
- Working: `../02_extract/output/`
- Working: `../02_extract/output/relationships.jsonl`
- Reference: `../../../../atlas/entities/`
- Reference: `../../_meta/relationship-candidate-schema.md`

## Process
1. Compare candidate IDs, names, summaries, and relationship neighborhoods with the Atlas.
2. Classify each entity as new, update, alias, conflict, or archive evidence.
3. Redirect relationship candidate IDs when aliases collapse, while preserving edge kind, evidence, confidence, and notes.
4. Produce a disposition table without editing the Atlas.

## Outputs
- `output/disposition.md`
- revised candidate records in `output/`
- `output/relationships.jsonl` with identity redirects applied but evidence untouched

## Human check
Choose the canonical identity for every alias or conflict. Links replace duplicate facts, and deduplication is never allowed to upgrade an inferred edge into an explicit one.
