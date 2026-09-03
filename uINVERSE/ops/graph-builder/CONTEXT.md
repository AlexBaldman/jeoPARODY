# Graph builder — compile the Atlas

One job: validate canonical records and rebuild the derived graph.

## Inputs
- Working: `../../atlas/entities/**/*.md`
- Reference: `../../atlas/_meta/entity-schema.md`

## Process
1. Parse the schema's deterministic YAML subset, including inline arrays and block sequences.
2. Validate required fields, IDs, types, statuses, relationship arrays/targets, promotion keys, and Boolean promotion values.
3. Reject duplicate identities before graph construction.
4. Resolve valid relationship targets; unresolved valid IDs remain visible warnings rather than invented nodes.
5. Write deterministic nodes and edges sorted by ID.

## Commands
- `node build.mjs` rebuilds `../../registry/graph.json`.
- `node build.mjs --check` recompiles in memory and fails if the committed registry is stale.
- `node check.mjs` runs adversarial parser/validation contract fixtures.

`npm run uinverse:check` runs the contract fixtures and freshness check and is part of `npm run project:check`.

## Outputs
- `../../registry/graph.json`

## Human check
Read all warnings and confirm unresolved edges represent real planned entities before accepting the generated graph. Machine validity is necessary; it is not permission to promote unsupported facts.
