# The Carmack Report: Consolidation & Optimization Plan

> "Focus is a matter of deciding what things you're not going to do." – John Carmack

## 1. Documentation Consolidation ("Grand Unification")

The current documentation is fragmented. Information is duplicated across `README.md`, `ARCHITECTURE.md`, `UI_GUIDE.md`, and `docs/*.md`. We will flatten this into a single, authoritative `docs/` hierarchy and a lightweight root `README.md`.

### Proposed Structure
- **`README.md`**: High-level vision, quick start, feature summary. Link to `docs/`.
- **`docs/`**:
  - **`01_SETUP.md`**: Installation, AI Config (`AI_PROVIDER_SETUP.md`), Build env.
  - **`02_ARCHITECTURE.md`**: The System (GameEngine, EventBus), State Management, Directory Map.
  - **`03_DESIGN_SYSTEM.md`**: CSS Layers (`clean-css`), Tokens, Themes, Z-Index. (Merges `CSS.md`, `UI_GUIDE.md`, `MEDIA_RENDERING...`).
  - **`04_CONTRIBUTING.md`**: Coding standards, Git flow, Testing (Merges `CONTRIBUTING.md`, `AGENTS.md`).
  - **`05_ROADMAP.md`**: Future plans (`MASTER_PLAN.md`).
- **`docs/archive/`**: Move all legacy/timestamped plans here.

## 2. Technical Analysis ("The Machine")

### A. State Management (Critical)
**Current State**: Split Brain. `src/state/` (Redux-lite) vs `src/core/GameEngine.js` (Internal State).
- `GameEngine` runs the loop and logic.
- `store.js` is updated via dispatch actions but serves mostly as a passive view data holder.
**Recommendation**: 
1. Deprecate `src/state/`.
2. Move `session`, `user`, `settings` into `GameEngine`'s state tree.
3. UI components should prefer `GameEngine.getState()` or listen to `eventBus` updates directly.
4. *Benefit*: Single source of truth. Lower GC overhead.

### B. Audio System
**Current State**: `SoundManager` uses `new Audio()` (HTML5 Audio).
- **Pros**: Simple, works for streaming music.
- **Cons**: High latency for SFX (clicks, buzzers) on some browsers.
**Recommendation**:
1. Implement `AudioContext.decodeAudioData` for short SFX (buzzers, correct/incorrect).
2. Keep `new Audio()` for long tracks (BGM).
3. *Benefit*: Zero-latency feedback.

### C. Asset Pipeline
**Current State**: Lazy loading. `hostAnimationManager` expects assets to be there.
**Recommendation**:
1. Implement a `Preloader` scene.
2. Load Host sprites and basic SFX before showing the "Start Game" button.
3. *Benefit*: No pop-in. Smooth initial animations.

### D. Render Loop
**Current State**: `GameEngine` runs a `gameLoop` but strictly for logic/timers.
**Recommendation**:
1. Keep the decoupling. It is good.
2. Ensure `Update` (Logic) and `Draw` (UI) remain separated via the Event Bus.

## 3. Action Plan

### Phase 1: Documentation (Immediate)
1. Initialize `docs/archive/`.
2. Move legacy files.
3. Create the 5 core documents defined above.
4. Update `README.md` to point to them.

### Phase 2: Engine Polish (Next)
1. **Preloader**: Add asset manifest to `AppConfig`.
2. **Audio**: Upgrade `SoundManager` to WebAudio for SFX.
