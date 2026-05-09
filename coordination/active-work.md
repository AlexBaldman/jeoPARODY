# Active Work

| Area | Owner | Started UTC | Status | Files Claimed | Notes |
|---|---|---:|---|---|---|
| Production Readiness Cleanup | Codex | 2026-05-09T03:17:26Z | In Progress | `coordination/active-work.md`, `coordination/logs/*`, `src/main.js`, `src/init/*`, `src/services/HostSystem.js`, `scripts/runtime-state-check.mjs`, `package.json`, `package-lock.json`, selected CSS/stylelint files after review | Implementing the JeoPARODY production cleanup plan from the previous agent: stabilize current work, remove conflict artifacts, mine runtime checks/UI fixes selectively, reduce lint/audit debt, and verify the static Vite app. |
| Telegram Bridge MVP | Codex | 2026-05-02T20:17:41Z | Done | `scripts/telegram-bridge.mjs`, `package.json`, `coordination/prompts/TELEGRAM_BRIDGE.md`, `coordination/active-work.md`, `coordination/logs/*` | Implemented a local allowlisted Telegram bridge for safe repo status, logs, verification, and notes. Log: `coordination/logs/2026-05-02/20260502T201939Z-codex-telegram-bridge-mvp.md`. |
| Shipyard Prototype | Gemini | 2026-05-01T06:40:00Z | Done | `scripts/build-cockpit.mjs`, `coordination/*`, `site/*`, `package.json` | Built the truth visualization cockpit and drift engine. |
| Validation Convergence + JS Lint Baseline | Codex | 2026-05-02T19:40:56Z | Done | `src/utils/validators.js`, `src/core/validation.js`, `src/utils/answerValidator.js`, `tests/core/validation.test.js`, `package.json`, `package-lock.json`, `eslint.config.js`, `coordination/active-work.md`, `coordination/logs/*` | Converged old answer validation utilities onto the canonical validators path and made JS lint runnable. Log: `coordination/logs/2026-05-02/20260502T201554Z-codex-validation-convergence-and-js-lint-baseline.md`. |
| Canonical Runtime + Scoring Convergence | Codex | 2026-05-02T19:21:08Z | Done | `src/core/GameEngine.js`, `tests/core/scoring.test.js`, `coordination/active-work.md`, `coordination/decisions/*`, `coordination/logs/*`, `ARCHITECTURE.md` | Documented the MVP runtime path and converged GameEngine scoring onto ScoreCalculator without touching UI, validation, question loading, or CSS. Log: `coordination/logs/2026-05-02/20260502T192322Z-codex-canonical-runtime-and-scoring-convergence.md`. |
| Review & Protocol Upgrade | Gemini | 2026-04-30T22:30:00Z | Done | `coordination/*`, `src/main.js.*`, `package.json`, `docs/*`, `scripts/agent-log.mjs` | Integrated ROOMS, cleaned artifacts. |
| Baseline Verification | Gemini | 2026-05-01T05:33:53Z | Done | `package.json`, `tests/*`, `src/*` | Verified env, tests, and build. |
| Scoring Huddle | Gemini | 2026-04-30T23:10:00Z | Done | `coordination/huddles/*` | Decided on scoring semantics. |
| Hybrid Arcade Scoring Slice | Codex | 2026-05-01T06:35:46Z | Done | `src/core/scoring.js`, `src/utils/constants.js`, `tests/core/scoring.test.js`, `coordination/*`, `src/utils/validators.js`, `src/core/validation.js`, `src/core/GameEngine.js`, `src/services/api/questionService.js`, `src/state/actions.js`, `scripts/shard-questions.js`, `scripts/asset-check.js`, `assets/questions/*`, `tests/*`, `docs/*`, `DATA.md`, `src/services/soundManager.js` | Implemented hybrid scoring and core migration. |
| Coordination Initialization | Gemini | 2026-05-01T05:00:00Z | Done | `coordination/*`, `scripts/agent-log.mjs`, `package.json` | Established initial system. |
| Core Migration Pass | Codex | 2026-05-01T05:16:53Z | Done | `src/utils/validators.js`, `src/core/validation.js`, `src/core/GameEngine.js`, `src/services/api/questionService.js`, `src/state/actions.js`, `scripts/shard-questions.js`, `scripts/asset-check.js`, `assets/questions/*`, `tests/*`, `docs/JEOPARDISH_MIGRATION_AUDIT_2026-05-01.md` | Ported answer validation, starter pack, shard generation, data normalization, and fixed missing action constants in canonical JeoPARODY. |


## Open Coordination Notes

- This is now the candidate canonical repository for JeoPARODY development.
- **Project Relationship:** Jeopardish is the prototype/source for validated experiments; jeoPARODY is the target runtime.
- **Migration Policy:** Do not copy-paste files directly. Map features to the existing architecture (State/Core/Components).
- **Checks:** Always run `npm test`, `npm run build`, and relevant asset/script checks before any migration or logic change. `npm run lint` and `npm run lint:css` are known baseline failures until a dedicated lint cleanup slice resolves them; run and record them when relevant, but do not treat them as blocking for unrelated migration slices.
