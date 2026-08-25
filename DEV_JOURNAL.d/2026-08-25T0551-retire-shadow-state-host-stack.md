# 2026-08-25 05:51 ET — ChatGPT — retire shadow state + obsolete host stack

- **Read/inspected:** post-#63 source-reachability fallout; `src/state/*`; dormant `DialogManager`, `HostImageCycler`, `hostAnimationIntegration`, `hostAnimationManager`, and `hostAnimations`; live `HostSystem` + `HostStageActor` semantic-event path.
- **Changed:** removed the complete six-file shadow state/store/persistence/reducer/selectors/actions stack and five obsolete store-coupled host/dialog implementations. Total source deletion before this handoff: 3,639 lines. Preserved live `HostSystem` and `HostStageActor` as the current host/Stage implementation path.
- **Evidence/tests:** repository search showed `../state/store.js` consumers were the now-removed `DialogManager` and `hostAnimationIntegration`; old host manager/cycler symbols resolved only inside the removed legacy family. Full CI/browser wall is intentionally required before merge.
- **Decisions:** one game/domain owner means no parallel generic store with independent persistence; host presentation should consume semantic game facts through the live HostSystem/Stage path rather than shadow-store mutations or obsolete DOM compatibility events.
- **Unresolved:** CI proof for this deletion slice; then modernize deprecated GitHub Actions/Node runtime warnings and rerun reachability to identify any final dead-island fallout.
- **Next lead domino:** prove/merge this deletion, then update GitHub Actions to current Node-24-capable generations before closing the bounded Convergence 2.0 cleanup campaign and returning to Firebase #44.
- **Refs:** branch `chore/retire-shadow-state-host-stack`; base `main@ac7b3ab`; follows PRs #61, #62, #63.
