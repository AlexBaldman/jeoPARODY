Here’s the Carmack-style consolidation plan to get us clean, fast, and fun to build on. I’ll keep it crisp, tie it to the files in your repo, and sequence work so we ship improvements immediately while setting up the elegant end state.

North star
•  Single source of truth for game state and events (engine + eventBus).
•  One service per responsibility, kebab-case names, zero overlap.
•  DOM bindings live in components/UI layer; services stay UI-agnostic.
•  No console noise in production; structured logging only.
•  60fps/low-latency as a hard constraint, not a goal.

What we have now (key observations)
•  main.js already follows the intended architecture and uses eventBus, theme, language, soundManager, host systems, performanceMonitor, and dialogManager.
•  compatibility-bridge.js duplicates UI bindings and game flow with lots of console.log noise and legacy DOM wiring. It emits events we already handle elsewhere (e.g., answer:correct/incorrect, sound:play).
•  services are largely consolidated: dialog-manager.js and media-handler.js are the canonical implementations. index.js is a clean barrel.
•  HostSystem and HostAnimationManager are separate; both manipulate host image/mood/animations. This is okay if responsibilities are clear, but they overlap in “animation triggers” and “image transitions.”

Phase 1: Critical cleanup and functional fixes (today–tomorrow)
1) Logging cleanup
•  Replace console.* with logger.* in src/compatibility-bridge.js and src/main.js where applicable.
•  Keep console in dev-only paths if truly needed; otherwise prefer logger.
•  Outcome: zero console errors/warnings; structured logs only.

2) Interactive repairs
•  Theme toggle: main.js has toggleTheme, load/save preference. Ensure the UI switch and label are bound once via theme.bindUI(). Confirm the toggle control exists and isn’t double-bound by legacy code.
•  Language toggle: main.js has toggleLanguage + load/save. Ensure it’s wired once and is emitting language:changed events.
•  Navigation/hamburger: ensure Navigation component owns the handlers; remove any legacy menu wiring from bridge (it currently binds question/answer/check/input; not menu, but still reduce collisions).

3) Bridge de-escalation (thin shim step)
•  In compatibility-bridge.js:
•  Import logger and replace all console.* with logger.*.
•  Remove or guard DOM bindings that duplicate main.js (questionButton, answerButton, checkButton, inputBox handlers).
•  Keep only the minimum legacy-to-eventBus forwarding you still need for tests (if the HTML includes it). Annotate with a deprecation banner and a kill switch via an env flag (e.g., if (window.JEOPARODY_DISABLE_COMPAT_BRIDGE) return;).
•  Outcome: no duplicated bindings, only event forwarding if needed.

4) Font loading polish (CSS)
•  Ensure @font-face blocks in assets/fonts/stylesheet.css or src/styles/master.css specify formats and font-display: swap.
•  Outcome: no OTS decode warnings; less render-blocking.

Phase 2: Architecture optimization (this week)
5) Service boundaries (Host system)
•  Keep HostSystem as “state/mood/personality/DOM host image element integration” (already in src/services/host-system.js).
•  Keep HostAnimationManager for event-driven animation effects, preloading, and transitions. Remove any animation logic duplicated in HostSystem (or vice versa). Pick one module to own transitions to prevent conflicting fades.
•  Agree on a single contract:
•  HostSystem: getResponse(context), updateMood(stats), changePersonality(), nextImage()/previousImage(), updateHostImage(), triggerAnimation(type) delegates to HostAnimationManager under the hood.
•  HostAnimationManager: never makes personality/mood decisions; it executes transitions/animations.
•  Outcome: one brain (HostSystem), one animator (HostAnimationManager).

6) State persistence
•  src/services/storage.js is solid; wire persistence middleware into the store (state/store.js) to save score/user/settings/statistics with throttling.
•  Add Redux DevTools integration if missing.

7) Component/DOM ownership
•  DOM bindings for game actions (question, show answer, submit answer, Enter key) should be owned by components (e.g., GameControls, QuestionDisplay) or a dedicated UI wiring module invoked by main.js. Remove all equivalent bindings from the bridge.

8) Media rendering
•  media-handler.js is the canonical implementation. Replace any ad-hoc link parsing in components with a call to mediaHandler.processMediaContent(text) so text with <a href> becomes interactive media widgets consistently.

Phase 3: Advanced features (next sprint)
9) AI fallback harness
•  Keep host-system.js personality logic; add ai multi-provider wrapper in src/services/ai/ with a clean interface and provider.isAvailable().
•  DialogManager gets context via getConversationContext() and calls the AI harness. Cache responses if needed.

10) Performance dashboard
•  performance-monitor.js already collects metrics; expose a small dev-only overlay (toggle with ?perf=1) and emit performance:issue events to the logger.

Planned code changes (scoped, safe)
•  Task A: Logging cleanup
•  Add import logger to src/compatibility-bridge.js and replace console.* with logger.*. Keep semantics; no logic changes.
•  Convert console.group/console.table if present to logger.group/etc. or collapse to logger.info with context object.
•  Task B: De-escalate compatibility-bridge
•  Remove duplicate DOM bindings (question/answer/check/input) that are already wired in main.js.
•  Keep event forwarding only if tests require it; add an env gate to fully disable the bridge.
•  Ensure question flow uses eventBus: game:new-question, game:show-answer, answer:submit; migrate any direct DOM mutations to emit events the engine/components already handle.
•  Task C: Host boundary cleanups
•  Pick transition owner: proposal is HostAnimationManager; in HostSystem, call manager for transitions. Remove duplicate transition styling in HostSystem.transitionToImage.
•  Task D: Wire persistence middleware
•  Update src/state/store.js to include createPersistenceMiddleware(persistence, …), using the keys from storage.js.
•  Task E: Font-face improvements
•  Update fonts CSS with font-display: swap and proper format descriptors.

Risks and mitigations
•  Double bindings: We’ll delete them in the bridge and rely on main/component wiring.
•  Tests/HTML directly invoking bridge: Retain window.compatibilityBridge export for a deprecation window. Gate with a disable flag.
•  Host animation race conditions: Single owner for transitions eliminates flicker.

Execution order (fast to slow)
•  A: Logging cleanup (bridge + main) and add deprecation banner to bridge.
•  B: Remove duplicate UI bindings from bridge; ensure main/component wiring is sole source.
•  D: Persistence middleware in store.
•  E: Fonts CSS tweak.
•  C: Host boundary consolidation (slightly more careful).

Validation checklist
•  No console errors/warnings on load and interaction.
•  Theme toggle actually changes body class and persists; language toggle flips flag and emits event.
•  One and only one handler per UI control.
•  Answer flow works: Enter submits or advances exactly as described; engine events fire; sound and host animations trigger.
•  Performance monitor is active and silent unless an issue is detected.

Would you like me to:
•  Implement Task A+B now (logging cleanup in compatibility-bridge.js and main.js, and remove duplicate DOM bindings from the bridge, keeping a thin, gated shim)? 
•  Or start with just Task A (zero-risk logging cleanup) and you can verify before we de-escalate the bridge?

Say “Proceed with A+B” or “Proceed with A only,” and I’ll apply the changes.