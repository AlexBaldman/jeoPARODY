# Convergence 2.0 Capability Matrix

**Status:** ACTIVE RECONCILIATION REGISTER  
**Date:** 2026-08-25  
**Owner:** issue #60

This register exists to prevent cleanup from deleting proven behavior or forgotten product intent. It is not permission to wholesale-merge `AlexBaldman/Jeopardish`, abandoned refactors, or speculative stacked systems.

The rule is:

```text
prove behavior → port onto current ownership → add fixtures → retire donor/duplicate implementation
```

## Dispositions

- **PORT NOW** — duplicate truth or near-term architectural prerequisite; reconcile before Firebase work continues.
- **FOCUSED FOLLOW-UP** — proven and valuable, but does not belong in the current truth-convergence slice.
- **REFERENCE** — preserve design/behavior as donor material; do not port until a real consumer pulls it forward.
- **RETIRE** — superseded or misleading implementation; preserve history only when provenance is useful.

## Current matrix

| Capability | Donor / evidence | Current jeoPARODY state | Disposition | Why |
|---|---|---|---|---|
| Answer judgment | `Jeopardish/game-logic.js` + donor tests | Main, H2H and old validators diverged | **PORT NOW** | Correctness is domain truth. Multiple judges can produce different winners. |
| Scoring / clue-value / reveal semantics | donor game logic + current `GameEngine` + current `core/scoring.js` tests | Competing production and test-only doctrines | **PORT NOW** | Score is domain truth; dead tests must not guard a second ruleset. |
| GameEngine responsibility boundaries | current `src/core/GameEngine.js` | Domain transitions mixed with fetching, persistence, achievements and FPS instrumentation | **PORT NOW** | Simplifies the path every future gameplay feature must understand. |
| Authored Episode/content contract | August migration blueprint / Jeopardish episode work | Not yet a current canonical runtime owner | **FOCUSED FOLLOW-UP** | Strong next product/content primitive after truth convergence; should not block judge/scoring cleanup. |
| Study pause/resume + learning ledger / review queue | proven Jeopardish Study behavior | Not represented as one current subsystem | **FOCUSED FOLLOW-UP** | Core educational promise; depends on stable clue identity + judgment/scoring events. |
| HostPack / HostAvatarPack / HostPerformanceDirector | August blueprint / donor host work | Stage/show pieces exist, full contract not current | **FOCUSED FOLLOW-UP** | High product leverage, but presentation must stay downstream of stable truth. |
| Media preflight / substitution / accessibility | donor media work + current runtime assets | Partial/current behavior distributed | **FOCUSED FOLLOW-UP** | Important release quality; reconcile after core rules and content contract. |
| Bilingual / localization behavior | donor bilingual work | Not a current canonical runtime boundary | **FOCUSED FOLLOW-UP** | Valuable content-system requirement; should pressure-test Episode/content contract. |
| Stage semantic presentation contracts | `docs/STAGE_RUNTIME_SYSTEM.md` + donor behavior | Current canonical Stage exists | **REFERENCE** | Preserve and extend through semantic events; do not re-import donor DOM architecture. |
| Product-event / release proof | donor release gates + current CI/browser evidence | Current repo has stronger CI/runtime proof | **REFERENCE** | Mine missing assertions only; current pipeline owns release truth. |
| Full Board | August blueprint / donor work | Not current lead path | **REFERENCE** | Later mode once domain/content contracts are stable. |
| PAO / Memorization integration | current PAO surfaces + broader memory plan | Partial/experimental | **REFERENCE** | Preserve as later learning consumer; do not let it distort current trivia truth kernel. |
| Couch Party | August blueprint | Not current lead path | **REFERENCE** | Valuable social mode after cloud multiplayer substrate is proven. |
| Topic Shows / Host Studio / creator tooling | August blueprint | Not current runtime | **REFERENCE** | Product expansion after content + host contracts have stable owners. |
| Stacked CharacterGenome / Stadium-style speculative systems | donor/speculative branches | Not current canonical requirement | **RETIRE / REFERENCE ONLY** | Do not drag speculative architecture into convergence merely because code exists. |
| Legacy validator/comedy matcher helpers | current unreachable utility fossils | No production consumers found | **RETIRE AFTER JUDGE PORT** | Presentation/comedy does not belong in correctness truth; salvage copy only if independently valuable. |

## Current convergence sequence

```text
1 canonical answer judge
        ↓
1 explicit scoring contract
        ↓
slim GameEngine boundaries
        ↓
retire displaced validators / matchers / dead owners
        ↓
re-run source reachability
        ↓
reconcile Episode + Study as focused follow-ups
        ↓
resume Firebase #44
```

## Stop condition

Convergence 2.0 is not an excuse to remodel the universe.

Stop the current bite when:

1. Main Game and Head-to-Head share one answer-judgment kernel with donor parity fixtures.
2. Scoring has one explicit current owner or intentionally mode-specific owners with no accidental duplicate doctrine.
3. `GameEngine` responsibilities are reduced to understandable game-domain orchestration, with externalities behind seams.
4. The source-reachability inventory is rerun and displaced implementations are retired conservatively.
5. Every major forgotten capability above has an explicit disposition.
6. Exact-head CI/browser/security evidence is green.

Then Firebase #44 resumes as the product lead domino.
