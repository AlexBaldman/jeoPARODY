# 2026-08-25 03:31 ET — ChatGPT — canonical answer judgment convergence

- **Read/inspected:** current `GameEngine`, Head-to-Head matcher/host, unreachable validation/scoring kernels, August canonical migration strategy, current Jeopardish donor `game-logic.js` and its parity tests, current master plan and architecture.
- **Changed:** added `src/core/answerJudge.js`; routed Main Game and Head-to-Head correctness through it; retained H2H similarity as diagnostics only; added donor-parity fixtures; added `docs/CONVERGENCE_2_CAPABILITY_MATRIX_2026-08-25.md`.
- **Evidence/tests:** PR #61 CI run 32821958262 started on exact branch head. New fixtures cover phrasing, diacritics, archive alternates/parentheticals, aliases, plurals, transpositions, safe typos, dangerous near-misses and blanks. Full CI/browser/security proof must be green before merge.
- **Decisions:** correctness has one shared deterministic owner; presentation/comedy stays downstream; scoring was intentionally not changed in this slice because current production and test-only scoring doctrines conflict and require an explicit product decision.
- **Unresolved:** converge scoring/clue-value/reveal semantics; slim `GameEngine` external responsibilities; retire displaced validator/matcher fossils after consumers are accounted for; reconcile Episode/Study/host/media/localization dispositions from the capability matrix.
- **Next lead domino:** finish PR #61, then scoring convergence under #60. Resume Firebase #44 after the bounded convergence stop condition is met.
- **Refs:** `refactor/canonical-answer-judgment`, PR #61, issue #60, capability matrix above.
