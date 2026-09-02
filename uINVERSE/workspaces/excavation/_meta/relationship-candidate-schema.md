# Relationship candidate schema

Relationship extraction is evidence-bearing work. An inferred edge must never become indistinguishable from a relationship explicitly stated by a source.

Stage 02 writes `relationships.jsonl`, one JSON object per candidate edge:

```json
{"source_id":"archie","relation":"uses","target_id":"character-factory","kind":"explicit","evidence":"source-id#line-or-anchor","confidence":1,"note":"optional"}
```

Required fields:

- `source_id`: candidate or canonical kebab-case entity ID.
- `relation`: one relationship name allowed by the Atlas entity schema.
- `target_id`: candidate or canonical kebab-case entity ID.
- `kind`: `explicit` or `inferred`.
- `evidence`: precise source pointer sufficient for a reviewer to recover the claim.
- `confidence`: number from `0` through `1`.

Rules:

1. `explicit` means the source directly supports the relationship; use confidence `1`.
2. `inferred` means the relationship is a hypothesis derived from context; confidence must be below `1` and the note should explain the inference.
3. Deduplication may redirect IDs but must preserve `kind`, `evidence`, and `confidence`.
4. Review approves relationships independently from entity identity.
5. Only approved relationships are copied into Atlas relationship arrays.
6. Rejected or parked inferred edges remain excavation evidence, never canonical graph edges.
