# 2026-05-01 - Codex Hybrid Scoring Review

## Scope

Reviewed the scoring migration risk after the parallel Codex/Gemini work and implemented only the approved Hybrid Arcade scoring slice.

## Coordination Findings

- The ROOMS protocol and `active-work.md` are useful, but broad claims like `coordination/*` and `docs/*` still create avoidable overlap.
- Gemini had active coordination claims while this slice began, so Codex limited runtime edits to scoring files and used coordination files only for the required claim/review/log path.
- The previous "always run lint" gate was not actionable because `eslint` is missing and CSS lint has baseline debt. The active-work note now treats lint as recorded debt until a dedicated cleanup slice fixes it.

## Scoring Decision

Use the Hybrid Arcade policy:

- Clue value remains the score basis.
- Correct answers after peeking score `0`.
- Streak bonuses use Jeopardish-style thresholds: 3+ and 5+, while preserving the canonical 10-streak hook.
- Existing time and difficulty hooks remain available, but no time bonus is awarded when elapsed time is not supplied.
- Incorrect-answer penalties remain canonical for now and the `ScoreTracker` floor prevents negative total score.

## Validation

- `npm test -- --runInBand tests/core/scoring.test.js`: passed, 13 tests.
- `npm test -- --runInBand`: passed, 48 tests.
- `npm run build`: passed.
- `node scripts/asset-check.js`: passed.
- `npm run lint`: known baseline failure, `eslint: command not found`.
- `npm run lint:css`: known baseline failure, 151 stylelint errors.

## Follow-ups

- Do not start session persistence until this scoring slice has been reviewed in the dirty tree.
- Split future work into separate slices: lint baseline, review-misses persistence, host quips, and UI juice.
- Prefer narrower claims such as `coordination/reviews/*` instead of broad `coordination/*` when possible.
