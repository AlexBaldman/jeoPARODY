# JeoPARODY Documentation Map

This directory is the canonical knowledge map for the project. Documents are organized by **job**, so humans and agents can load only the context they need.

## Authority order

When sources disagree, resolve them in this order:

1. **Code + tests + production browser evidence** — what the system actually does.
2. **`AGENTS.md`** — how work must be performed.
3. **`DEV_JOURNAL.md`** — current handoff, active discoveries, next lead domino.
4. **Canonical docs in this map** — current architecture, product direction, and subsystem contracts.
5. **ICM** — durable ideas and pressure tests that may not be implementation commitments.
6. **Archive** — historical evidence only; never current authority unless explicitly restored.

If a canonical doc conflicts with verified runtime behavior, repair the doc in the same slice when practical and record the discrepancy in the journal.

## Start here by task

| You are working on… | Read |
|---|---|
| Any code change | `../AGENTS.md` → latest `../DEV_JOURNAL.md` entry |
| Runtime / ownership | `architecture/OVERVIEW.md` |
| Stage / host / responsive presentation | `architecture/STAGE.md` |
| Host choreography / performance / lip sync | `architecture/HOST_PERFORMANCE.md` |
| Product priorities | `product/ROADMAP.md` |
| Jeopardish → jeoPARODY convergence | `product/MIGRATION.md` |
| Product/platform vision | `product/VISION.md` + relevant `../ICM/` record |
| CSS / responsive styling | `reference/CSS.md` |
| Question/data loading | `reference/DATA.md` |
| AI providers / secrets boundary | `reference/AI.md` |
| Trebek audio archive | `reference/TREBEK_AUDIO_ARCHIVE.md` |
| Shared project vocabulary | `reference/GLOSSARY.md` |
| Historical plan/audit | `archive/README.md` |

## Document lifecycle

```text
DISCOVERY / IDEA
    ↓
DEV_JOURNAL or ICM
    ↓ when adopted / proven
CANONICAL DOC
    ↓ when replaced
SUPERSEDED
    ↓
ARCHIVE
```

### Status meanings

- **canonical** — describes current accepted truth or contract.
- **active** — live plan or working record expected to change frequently.
- **reference** — focused lookup material; not broad project authority.
- **pressure-test** — intentionally exploratory; useful for evaluating architecture.
- **superseded** — replaced by a newer canonical source.
- **archive** — historical evidence only.

## Writing rules

Canonical docs should be short enough to read during real work. Prefer links to duplication. State **owners, contracts, invariants, and verification** rather than narrating implementation history.

When a document becomes history, preserve it in `archive/` rather than leaving stale instructions beside current ones. The project should never require a new worker to solve a theological dispute among Markdown files before touching code.
