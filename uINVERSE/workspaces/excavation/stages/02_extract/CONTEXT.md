# 02_extract — surface candidate entities and edges

## Inputs
- Working: `../01_intake/output/manifest.md` and its listed sources
- Reference: `../../../../atlas/_meta/entity-schema.md`
- Reference: `../../../../atlas/_templates/entity.md`

## Process
1. Extract durable entities without interpreting them as commitments.
2. Assign stable candidate IDs and preserve source pointers.
3. Record explicit and inferred relationships separately.

## Outputs
- Candidate Markdown records in `output/`

## Human check
Spot-check every candidate against its cited source and remove unsupported certainty.

