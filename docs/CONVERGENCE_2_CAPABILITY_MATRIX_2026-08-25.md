# Convergence 2.0 Capability Matrix

**Status:** COMPLETED MILESTONE / REFERENCE REGISTER  
**Date:** 2026-08-25  
**Owner:** completed issue #60

This register records what the bounded Convergence 2.0 campaign learned and deliberately does **not** authorize another broad cleanup pass. The campaign existed to recover proven Jeopardish behavior, remove duplicate domain truth, and preserve useful future capabilities without wholesale-merging `AlexBaldman/Jeopardish` or abandoned jeoPARODY architectures.

The rule that survived the work is:

```text
prove behavior → port onto current ownership → add fixtures → retire donor/duplicate implementation
```

## Shipped convergence

| Capability | Final disposition | Evidence / current owner |
|---|---|---|
| Answer judgment | **PORTED** | PR #61 / `c3f8a24`; `src/core/answerJudge.js` is shared by Main Game and Head-to-Head. |
| Scoring / clue-value semantics | **PORTED** | PR #62 / `31e9a27`; `src/core/scoring.js` owns Main Game score transitions. Correct adds authored clue value; incorrect/timeout resets the current score. |
| Main Game domain boundaries | **CONVERGED** | PR #62 removed the 60 FPS trivia timer, duplicate question fetching, shadow-store writes and performance state from `GameEngine`. |
| Alternate game/controller/question/validator stack | **RETIRED** | PR #63 / `ac7b3ab`; 2,125 dead lines removed after useful behavior was reconciled. |
| Shadow state + obsolete store-coupled host stack | **RETIRED** | PR #64 / `e3617a0`; 3,639 additional dead lines removed. Live host presentation remains `HostSystem` + `HostStageActor`. |
| CI / deployment runtime | **MODERNIZED** | PR #65 / `adc8834`; blocking CI and Pages workflows run on Node 24/current GitHub Action generations. |

The two retirement PRs alone removed roughly **5,764 lines** of duplicate architecture while the full browser/security/runtime wall stayed green.

## Proven capabilities deliberately left for focused follow-up

These remain valuable. They did not need implementation to finish Convergence 2.0.

| Capability | Disposition | Why it waits |
|---|---|---|
| Authored Episode/content contract | **FOCUSED FOLLOW-UP** | Strong content primitive after the current Firebase proof; should be rebuilt through current ownership rather than imported wholesale. |
| Study pause/resume + learning ledger / review queue | **FOCUSED FOLLOW-UP** | Core educational promise; now has cleaner clue/judgment/scoring facts to build on. |
| HostPack / HostAvatarPack / HostPerformanceDirector | **FOCUSED FOLLOW-UP** | High leverage, but presentation stays downstream of semantic game truth and the current `HostSystem`/Stage path. |
| Media preflight / substitution / accessibility | **FOCUSED FOLLOW-UP** | Important release-quality capability; preserve donor behavior and current `MediaHandler` as reference until this becomes active work. |
| Bilingual / localization behavior | **FOCUSED FOLLOW-UP** | Best used to pressure-test the future Episode/content contract. |
| Stage semantic presentation contracts | **REFERENCE / EXTEND CURRENT OWNER** | `docs/STAGE_RUNTIME_SYSTEM.md` remains canonical; do not re-import donor DOM/state architecture. |
| Product-event / release proof | **REFERENCE** | Current repo already has stronger blocking CI/runtime proof; mine donor assertions only when they add a missing guarantee. |
| Full Board | **REFERENCE** | The current DOM surface is runtime-tested; the old `FullboardGameService` is not production truth. Revisit only when Full Board becomes active product work. |
| PAO / Memorization integration | **REFERENCE** | Preserve as a later learning consumer without distorting current trivia-domain contracts. |
| Couch Party | **REFERENCE** | Valuable after the cloud multiplayer substrate is proven. |
| Topic Shows / Host Studio / creator tooling | **REFERENCE** | Product expansion after content + host contracts have stable owners. |
| Stacked CharacterGenome / Stadium-style speculative systems | **RETIRE / REFERENCE ONLY** | Not a current requirement and not allowed to hitchhike into core architecture. |

## Final source-reachability inventory

The exact PR #65 Node 24 CI run (`32834765144`) reported **50/62 source files reachable from production entrypoints** and surfaced 14 candidates. Reachability is evidence, not a death sentence.

### Intentional dormant / reference / tooling

- `src/components/pao/CardPreview.js` — PAO/reference surface.
- `src/dev/hud.js` and `src/dev/menu.js` — development tooling, intentionally outside production entrypoints.
- `src/services/MediaHandler.js` — reference material for the focused media-preflight follow-up.
- `src/services/ai.js`, `src/services/ai/PromptBuilder.js`, `src/services/ai/healthCheck.js`, `src/services/ai/localModelStub.js`, `src/services/ai/mockProvider.js` — legacy/tested AI experimentation family; not production authority and not a convergence blocker.

### Later hygiene candidates, not current product blockers

- `src/services/FullboardGameService.js` — old service beside the currently tested inline Full Board surface.
- `src/services/api.js` — older generic API path beside the production question-service path.
- `src/services/comedyTicker.js` — dormant presentation helper.
- `src/services/storage.js` and `src/utils/helpers.js` — inspect together with any remaining dormant consumers before deleting.

Issue #58 owns future repository archaeology. These files must not be treated as generic dead code merely because the import graph cannot reach them from a production entrypoint.

## What Convergence 2.0 proved

```text
Main Game
    ↓
GameEngine
    ├── answerJudge  ← shared correctness kernel → Head-to-Head
    └── scoring      ← Main Game score transition
    ↓
semantic events
    ↓
HostSystem / Stage / UI
```

Head-to-Head keeps its own match/authority/scoring state while sharing correctness behavior. This is deliberate mode ownership, not duplication.

## Stop condition: satisfied

1. Main Game and Head-to-Head share one answer-judgment kernel with donor-parity fixtures. **Done in #61.**
2. Scoring has explicit ownership and no accidental test-only competing doctrine. **Done in #62.**
3. `GameEngine` responsibilities are materially smaller and understandable. **Done in #62.**
4. Displaced validators, alternate game owners, shadow state and obsolete host integrations were retired conservatively. **Done in #63–#64.**
5. The source-reachability inventory was rerun and remaining candidates were classified rather than blindly deleted. **Done in #65 evidence.**
6. Forgotten donor capabilities have explicit dispositions. **Recorded above.**
7. Exact-head CI/browser/security evidence stayed green, including under Node 24. **Done through #65.**

## Next product lead domino

**Resume Firebase activation and real cloud proof in issue #44.**

Do not start another convergence or repository-gardening campaign before that proof unless a concrete failure demonstrates that one of the remaining dormant files is actually blocking the product. The codebase has been sufficiently excavated. Humanity may return to building things.
