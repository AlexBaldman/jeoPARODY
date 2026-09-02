# 04_review — approve promotion into the Atlas

## Inputs
- Working: `../03_deduplicate/output/disposition.md`
- Working: revised candidates in `../03_deduplicate/output/`
- Working: `../03_deduplicate/output/relationships.jsonl`
- Reference: `../../../../atlas/CONTEXT.md`
- Reference: `../../_meta/relationship-candidate-schema.md`

## Process
1. Present candidate summaries, lifecycle status, provenance, and changed edges.
2. Record approve, revise, park, or reject for each entity candidate.
3. Record approve, revise, park, or reject independently for each relationship candidate, with inferred edges visibly labeled.
4. Copy only approved entity records and approved edge decisions into this stage's output for a separate Atlas update.
5. Promotion flags remain false unless the review explicitly approves the relevant promotion surface.

## Outputs
- `approval.md` containing entity, relationship, and promotion decisions
- approved candidate records in `output/`
- `output/relationships.jsonl` containing only approved edge decisions

## Human check
Alex explicitly approves the disposition list before any candidate or relationship is copied into `atlas/entities/`. Review approval is the boundary between excavation evidence and canon.
