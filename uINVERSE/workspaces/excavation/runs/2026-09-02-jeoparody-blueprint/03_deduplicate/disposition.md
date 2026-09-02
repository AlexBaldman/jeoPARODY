# 03 Deduplicate disposition

Run: `2026-09-02-jeoparody-blueprint`

References checked:

- current Atlas / generated registry from PR #68;
- `docs/CONVERGENCE_2_CAPABILITY_MATRIX_2026-08-25.md`;
- current repository search for Episode/learning/HostPerformanceDirector/HostPack owners.

The current Atlas has no IDs matching the four extracted candidates. The Convergence register explicitly classifies the underlying capabilities as **FOCUSED FOLLOW-UP**, not shipped owners.

| Candidate | Identity disposition | Collision analysis | Suggested lifecycle |
|---|---|---|---|
| `episode-runtime` | **NEW** | Not an alias for `trivia-engine`. Trivia Engine owns clue/answer/scoring/round truth; the candidate would own authored show sequencing/editorial contract downstream of those facts. | `planned` |
| `learning-ledger` | **NEW** | Not an alias for `memorization-station`. The Station is a portal/view across memory systems; the ledger would own learning facts/review state. It must not become a second score/stats store. | `planned` |
| `host-performance-director` | **NEW WITH IMPLEMENTATION CONSTRAINT** | Not an alias for `stage-runtime` and must not replace gameplay truth. Current presentation remains `HostSystem` + `HostStageActor`; a future director must extend that semantic path or earn a replacement migration. | `planned` |
| `host-pack` | **NEW CAPABILITY** | Not an alias for `character-factory` or `stage-runtime`. It is a validated personality/performance data contract; visual avatar and voice packs remain outside this run. | `planned` |

## Relationship disposition

No IDs require alias redirection, so the Stage 02 relationship candidate IDs remain unchanged.

- Explicit edges retain `kind: explicit`, evidence, and confidence `1`.
- Inferred `jeoparody uses …` edges remain inferred because current implementation is not proof of use.
- No inferred relationship is upgraded during deduplication.

See `relationships.jsonl` for the pass-through evidence-bearing edge set.

## Outcome

All four identities advance to Review as **new planned candidates**. This is not Atlas approval. Promotions remain false and no current runtime ownership is changed.
