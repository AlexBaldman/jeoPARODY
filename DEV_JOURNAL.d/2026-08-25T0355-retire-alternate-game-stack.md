# 2026-08-25 03:55 ET — ChatGPT — retire alternate game stack

- **Read/inspected:** post-#62 source reachability, old `GameController`, `game.js`, `question.js`, `validation.js`, validator utilities, remaining state/presentation import relationships.
- **Changed:** removed the production-unreachable alternate `controller → game/session → question bank → validator` architecture; removed its obsolete validation test and validator helper utilities.
- **Evidence/tests:** search found no production consumer of `GameController`/`GameSession`/`AnswerValidator`; canonical Main Game truth is now `GameEngine.js` + `answerJudge.js` + `scoring.js`. Full PR CI/browser/security evidence required before merge.
- **Decisions:** do not delete `src/state/*` yet even though production-unreachable; dormant `DialogManager` / host-animation integration still reference it, so that island gets a separate salvage-or-retire decision rather than leaving broken source files.
- **Unresolved:** classify dormant presentation/state island; remove dev performance polling compatibility; upgrade deprecated GitHub Action runtimes; update canonical master-plan priority after convergence code stabilizes.
- **Next lead domino:** green this deletion slice, then rerun reachability and make one coherent dormant-island decision.
- **Refs:** `chore/retire-alternate-game-stack`, issue #60, issue #58.
