# Worlds — thin experience manifests

One job: describe which canonical entities compose a buildable/queryable world surface.

World manifests reference Atlas IDs. They do not own lifecycle status, names, summaries, provenance, promotion state, character identity, shared-system contracts, or factory instructions. Those facts remain single-sourced in the Atlas.

`uses` and `characters` are manifest-level selections from relationships already declared by the canonical world record; manifests may narrow composition for a surface, but may not invent new dependencies.

`npm run uinverse:worlds:check` verifies that manifests remain thin, IDs resolve, and selections are backed by the canonical Atlas world record.

Add a world directory only when it is useful enough to query or build.
