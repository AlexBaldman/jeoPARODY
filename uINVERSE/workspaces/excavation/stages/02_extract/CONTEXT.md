# 02_extract — surface candidate entities and edges

## Inputs
- Working: `../01_intake/output/manifest.md` and its listed sources
- Reference: `../../../../atlas/_meta/entity-schema.md`
- Reference: `../../../../atlas/_templates/entity.md`
- Reference: `../../_meta/relationship-candidate-schema.md`

## Process
1. Extract durable entities without interpreting them as commitments.
2. Assign stable candidate IDs and preserve precise source pointers.
3. Record relationship candidates in the sidecar contract rather than writing hypotheses directly into canonical relationship arrays.
4. Mark each edge `explicit` or `inferred`, preserving evidence and confidence.

## Outputs
- Candidate Markdown records in `output/`
- `output/relationships.jsonl` with evidence-bearing candidate edges

## Human check
Spot-check every entity and edge against its cited source. Unsupported certainty becomes an inference, a revision, or a deletion, never silent canon.
