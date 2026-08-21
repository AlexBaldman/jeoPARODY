# JeoPARODY: The Master Plan (Consolidated)

**Source of Truth:** This document supersedes all previous planning documents. It is the definitive guide for the next phase of development.

**Guiding Principle (The Carmack Way):** *"The code should do what it looks like it does."* We will prioritize simplicity, stability, and shippability. We will build a solid foundation before adding more features. No clever code. No half-finished features. We will make it work, make it right, and then make it fast.

---

## 1. Project Vision & Philosophy

- **Vision:** An AI-infused, Jeopardy-style trivia experience that hides a serious learning engine inside a delightful, comedic game.
- **Philosophy:**
    - **Data-first design:** Clear state shapes. Pure functions. Predictable flow.
    - **Performance through simplicity:** Vanilla JS with targeted DOM updates. 60fps is a non-negotiable constraint.
    - **Extensible by construction:** Cleanly separated components, services, and core logic.
    - **Comedy + clarity:** A witty host and joyful animations without compromising maintainability.

---

## 2. Current State Analysis (Brutal Honesty)

- **What's Working:** The core game loop is functional. The service-based architecture is sound. The vision is clear.
- **What Needs Immediate Attention:**
    1.  **Documentation Chaos:** Multiple, conflicting planning documents create confusion.
    2.  **UI/UX Bugs:** Several visual and functional bugs degrade the user experience (e.g., invisible answer text, broken submission).
    3.  **Incomplete State Management:** The state system is not fully implemented and lacks persistence.
    4.  **Monolithic AI Service:** The current AI integration is not modular enough to easily support multiple providers.

---

## 3. The Plan: From Foundation to Features

### Phase 1: Foundational Stability (Make it Work)

**Goal:** Achieve a "zero-bug bounce" state. The application must be stable, predictable, and free of console errors.

1.  **Consolidate Documentation (This phase):** Establish this document as the single source of truth.
2.  **Stabilize the Core Application:**
    -   [ ] Fix invisible answer text bug.
    -   [ ] Fix duplicate host image rendering.
    -   [ ] Fix all major CSS alignment and z-index issues.
    -   [ ] Ensure the answer submission (Enter key and button) is reliable.
3.  **Refine State Management:**
    -   [ ] Solidify the Redux-like store for all critical game state.
    -   [ ] Implement `localStorage` persistence for score, progress, and settings.

### Phase 2: AI Host Integration (Make it Right)

**Goal:** Implement a robust, multi-provider AI host system with a clear and simple configuration process.

1.  **Abstract the AI Service:**
    -   [ ] Refactor `src/services/ai.js` to be a clean interface/dispatcher.
    -   [ ] Move provider-specific logic into `src/services/ai/gemini.js`, `src/services/ai/claude.js`, etc.
2.  **Document AI Setup:**
    -   [ ] Create `docs/AI_PROVIDER_SETUP.md` with a step-by-step guide for developers.

### Phase 3: Ship and Iterate (Make it Fast)

**Goal:** Prepare the application for users and establish a cycle of continuous improvement.

1.  **Performance & Polish:**
    -   [ ] Conduct a performance audit; ensure all animations are 60fps.
    -   [ ] Polish all UI transitions and interactions.
2.  **Testing & Validation:**
    -   [ ] Write unit tests for all critical core logic and utilities.
    -   [ ] Establish an end-to-end testing plan (e.g., using Playwright or Cypress).

---

## 4. Technical Architecture (The Reality)

- **Framework:** Vanilla JavaScript. We are **not** using React. We manipulate the DOM directly for maximum performance and simplicity.
- **State Management:** A custom Redux-like implementation in `/src/state`.
- **Core Logic:** Pure, dependency-free functions in `/src/core`.
- **Services:** External concerns (AI, audio, assets) are handled in `/src/services`.
- **Build System:** Vite.

---

## 5. The Carmack Rules (How We Work)

1.  **No Clever Code:** Readability and simplicity are paramount.
2.  **Measure Everything:** If you can't measure it, you can't improve it. Profile performance continuously.
3.  **Fail Fast & Loud:** Errors should be immediately obvious, not hidden.
4.  **One Feature Per PR:** Keep changes small, focused, and reversible.
5.  **Ship It:** Perfect is the enemy of good. We will ship a stable, working product and iterate.
