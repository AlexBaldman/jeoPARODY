# Jeopardish -> JeoPARODY Salvage Register

Status: Active migration control  
Prepared: 2026-06-03  
Purpose: Track the best parts of Jeopardish and related branches so they are rebuilt cleanly inside JeoPARODY instead of forgotten or copy-pasted blindly.

## Migration Rule

Do not wholesale merge Jeopardish or old experimental branches.

Mine behavior, tests, data contracts, visual direction, and jokes. Rebuild each piece inside JeoPARODY's current architecture:

```text
core logic -> services -> event flow -> UI rendering -> tests -> docs
```

## High-Value Salvage

| Item | Source | Why It Matters | JeoPARODY Target | Status |
| --- | --- | --- | --- | --- |
| Review Misses loop | `/Users/alex/coding/jeopardish/game-session.js`, `question-bank.js`, tests | Turns trivia into learning instead of disposable scoring. | Fence 5: learning circuit; local review queue and retrieval mode. | Pending |
| Stable shard lookup by clue id | Jeopardish `QuestionBank.ensureQuestions()` | Lets missed/revealed clue ids survive reloads without full archive load. | `src/services/api/questionService.js` plus content manifest/index. | Pending |
| Starter pack first-play strategy | Jeopardish `questions/starter-pack.json`, `question-bank.js`; JeoPARODY already has starter pack | Fast first clue and graceful fallback. | Production asset packaging and preview runtime. | Partially integrated |
| Explainable answer validation | Jeopardish `game-logic.js`; JeoPARODY `src/core/validation.js` | Players need to know why a typo/alternate was accepted or rejected. | Validator result UI and tests for reasons. | Partially integrated |
| Peek/reveal scoring rule | Jeopardish `game-session.js` | Revealed answers should teach, not award normal points. | `GameEngine` reveal state + `src/core/scoring.js`. | Pending / verify |
| Local host ticker/quips | Jeopardish `view.js` ticker messages | Personality without AI dependency. | `src/services/comedyTicker.js`, host system, local fallback. | Pending |
| Static MVP DOM contract tests | Jeopardish `tests/static-mvp-contract.test.mjs` | Prevents accidental runtime hook breakage. | JeoPARODY runtime smoke + DOM contract tests. | Pending |
| Question validation pipeline | Jeopardish `scripts/validate-questions.mjs` | Keeps huge archive from becoming a mystery pile. | Build/content verification scripts. | Partially integrated |
| Arcade cabinet visual identity | Jeopardish screenshots, Codex vision work, `ui-revamp-jeoparody` | Differentiates product from a generic quiz page. | Original JeoPARODY identity pass after stabilization. | Pending |
| Media clue handling | Jeopardish current renderer experiments, JeoPARODY `MediaHandler.js` docs | 10k+ archive clues contain linked media. | Safe media extraction, thumbnails, modal, dead-link handling. | Partially integrated |

## Pending Decisions

| Decision | Recommendation |
| --- | --- |
| Product name | Keep JeoPARODY as repo/product candidate for now; define shipping name in identity bible after legal/provenance pass. |
| Host identity | Use a fictional original host. Real-host assets stay source/reference only unless cleared for a non-commercial prototype. |
| Question values | Normalize value semantics before scoring/display: normal clue, Daily Double wager, Final, tiebreaker, missing. |
| Full board | Gate until classic mode, asset packaging, scoring, and review state are stable. |
| AI host | Local/fallback first. Remote AI behind server/proxy only. Truth kernel never delegates correctness to AI. |

## Explicitly Do Not Salvage

- Runtime loading of the full monolithic archive as the only path.
- Tracked `node_modules`, `.DS_Store`, duplicate question dumps, or generated clutter.
- Direct browser API-key collection for public production.
- Broad component/store rewrites before the active MVP runtime is stable.
- Real-person likeness/audio as a required public product dependency.
- Any answer-matching looseness that accepts tiny substring guesses or ambiguous near misses as correct.

## Next Salvage Sequence

1. Preserve current JeoPARODY and Jeopardish dirty states on named branches or commits.
2. Fix JeoPARODY preview/runtime and production asset packaging gates.
3. Verify reveal scoring cannot award normal points.
4. Migrate Review Misses and stable clue-id shard lookup.
5. Add visible answer-match reasons.
6. Rebuild local host ticker/quips.
7. Proceed to original identity/art pass.

