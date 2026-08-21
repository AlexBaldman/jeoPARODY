# Contributing to JeoPARODY

JeoPARODY welcomes focused contributions from humans and AI agents. The project values small, understandable changes that preserve a green production spine.

## Before changing anything

Read, in order:

1. `AGENTS.md`
2. the newest relevant entry in `DEV_JOURNAL.md`
3. `docs/README.md`
4. only the canonical docs relevant to your slice

`AGENTS.md` is the universal operating contract. Tool-specific instruction files are compatibility pointers, not separate constitutions.

## Working rules

- **Follow the Beam.** Fix the highest-upstream verified blocker first.
- **One owner per truth.** Do not introduce parallel state, animation, asset, or style authorities.
- **Keep changes focused.** Prefer a small reversible PR with clear evidence.
- **Bus the table.** Remove nearby trivial friction when safe and verifiable, without widening the mission.
- **Preserve before pruning.** Inventory valuable assets, references, behavior, and provenance before retiring old branches/files.
- **Respect accessibility.** Keyboard behavior, reduced motion, responsive layout, and readable presentation are release concerns.
- **Never commit or expose provider secrets in browser storage, URLs, or source files.**

## Development commands

```bash
npm install
npm run dev
npm run lint
npm run lint:css
npm test -- --ci
npm run build
npm run runtime:check
```

Use the checks relevant to your change. Runtime-facing work should normally survive the full production spine. Documentation-only changes should pass `npm run docs:check` once that check is available, plus CI.

## Code organization

- `src/core/` — gameplay/domain logic.
- `src/state/` — state infrastructure where still used.
- `src/services/` — side effects and external concerns such as questions, host, audio, AI, media.
- `src/components/` — UI components.
- `src/styles/` — canonical CSS entrypoint/layers and responsive Stage styles.
- `src/utils/` — shared utilities and semantic event bus.
- `public/assets/` — production-delivered static assets/data.
- `assets/` — source/reference assets where applicable; do not assume every asset here is runtime-delivered.
- `docs/` — current knowledge map plus archive.
- `ICM/` — durable ideas and pressure tests, not an implementation queue.

See `docs/architecture/OVERVIEW.md` for current ownership.

## Style

- Modern ES modules.
- Prefer readable, explicit code over clever compression.
- Follow the existing formatter/style in the file you touch.
- Use CSS tokens and the canonical style entrypoint rather than inventing another parallel hierarchy.
- Use semantic events for decoupled communication where that is the established contract.

## Tests and evidence

Tests should be deterministic and should not require external AI/network services. For user-facing changes, production browser evidence matters: the runtime harness protects desktop and iPhone-class viewports and validates real packaged assets.

If a change cannot be fully verified, state exactly what remains unverified in the PR and `DEV_JOURNAL.md` handoff.

## Commits and pull requests

Use clear imperative commit subjects and focused branches from current `main`. Explain:

- what changed;
- why this is the right owner/layer;
- what evidence was run;
- any intentionally deferred cleanup;
- the next lead domino when relevant.

Do not wholesale-merge heavily diverged historical branches when their useful behavior can be extracted cleanly.

## Documentation

Current documentation is organized by job in `docs/README.md`. When a decision changes, update the canonical owner and move stale material to archive rather than leaving competing sources of truth.

Before finishing substantive work, leave a concise Cypher handoff in `DEV_JOURNAL.md`.
