# Atlas — canonical knowledge bundle

One job: own typed identity records and their explicit relationships.

## Inputs

- Working: approved candidate records from `../workspaces/excavation/stages/04_review/output/`
- Reference: `_meta/entity-schema.md`
- Reference: `_templates/entity.md`

## Process

1. Confirm the entity has one canonical home and a stable kebab-case ID.
2. Confirm every relationship target exists or is intentionally marked unresolved.
3. Copy the entity template into `entities/<type>/` and preserve source provenance.
4. Run the graph builder.

## Outputs

- Canonical entity record in `entities/<type>/<id>.md`
- Derived graph in `../registry/graph.json`

## Human check

Verify the summary, lifecycle status, and relationship directions before accepting the record as canon.

