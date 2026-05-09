# Jeopardish Migration Audit - 2026-05-01

## Repos audited

- Canonical target: `/Users/alex/coding/Jeopardish/canonical-jeoparody` on `main`, tracking `origin/main`.
- Legacy source: `/Users/alex/coding/Jeopardish` on `master`, dirty with intentional uncommitted MVP work.
- Legacy experimental branches inspected locally: `origin/ui-revamp-jeoparody`, `origin/carmack-refactor-v3`, `origin/implementing-some-newness`, `origin/mobile-ui-improvements`.

## Integrated in this pass

- Ported Jeopardish answer-matching behavior into JeoPARODY:
  - strips `what is`, `who was`, and similar prompt prefixes;
  - supports parenthetical alternates like `The Eiffel Tower (or La Tour Eiffel)`;
  - rejects tiny substring guesses such as `cop` for `Copernicus`;
  - returns explainable match metadata through `AnswerValidator`.
- Hardened question normalization:
  - accepts raw archive fields including `air_date` and `show_number`;
  - creates stable local clue ids when the archive has none;
  - preserves the starter-pack loading idea from the Jeopardish MVP refactor.
- Fixed the shard generation script for this ES module repo and made year shards use `air_date` correctly.

## Jeopardish nuggets still worth mining

- Review misses loop:
  - Legacy work has a focused local `missedClueIds` queue and a review mode.
  - JeoPARODY has persistence and mode scaffolding, but no clean review-miss product loop yet.
- Runtime question bank:
  - Legacy `question-bank.js` has exact shard lookup by stable hash for persisted review ids.
  - JeoPARODY currently favors year shards for board/date play. A future pass should reconcile both: year/date shards for boards, id-hash lookup for review recovery.
- Multi-agent coordination:
  - Legacy `coordination/` is a useful operating convention for Codex/Gemini parallel work.
  - Gemini initialized a canonical `coordination/` board during this pass; keep it as the live handoff surface.
- UI identity:
  - `origin/ui-revamp-jeoparody` and JeoPARODY main already carry the stronger retro arcade/game-show direction.
  - Mine only specific responsive fixes or host/ticker language from old branches; do not wholesale merge them.
- Firebase/leaderboard:
  - `origin/implementing-some-newness` has auth/profile/leaderboard experiments.
  - Keep deferred until score rules, anti-cheat assumptions, and local session stats stabilize.

## Avoid

- Do not restore runtime loading of the full monolithic question archive as the only path.
- Do not merge `origin/carmack-refactor-v3` wholesale; it mixes useful architecture with broad churn.
- Do not reintroduce tracked `node_modules`, `.DS_Store`, or unresolved `.orig` / `.rej` artifacts.
