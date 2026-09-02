# Graph builder — compile the Atlas

One job: validate canonical records and rebuild the derived graph.

## Inputs
- Working: `../../atlas/entities/**/*.md`
- Reference: `../../atlas/_meta/entity-schema.md`

## Process
1. Parse YAML-frontmatter fields used by the schema.
2. Validate IDs, types, statuses, uniqueness, and relationship targets.
3. Write deterministic nodes and edges sorted by ID.

## Outputs
- `../../registry/graph.json`

## Human check
Read all warnings and confirm unresolved edges represent real planned entities before accepting the generated graph.

