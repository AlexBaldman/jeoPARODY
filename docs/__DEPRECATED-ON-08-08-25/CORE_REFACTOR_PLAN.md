---
layout: default
title: "JeoPARODY – Core Refactor Plan"
description: "Single source-of-truth roadmap for continued modernization"
---

# JeoPARODY – Core Refactor Plan
*Last updated: 2025-08-06*

> “Focus on the *data* and the rest follows.” – J. Carmack

This document aggregates all previous planning Markdown files (`PROJECT_PLANNING.md`, `css-refactor-plan.md`, `CARMACK_REFACTOR.md`, `CSS_AUDIT_REPORT.md`, etc.) into a single, navigable roadmap. All granular reports remain in place for detail; this file surfaces only decisive next steps.

---
## Table of Contents
1. Architecture
2. Front-End Design & UX
3. AI & Audio Features
4. Data & State
5. Dev-Ops / Build
6. Testing & QA
7. Urgent Bug Queue
8. Appendices (links to deep-dive docs)

---
## 1. Architecture
### 1.1 Component Hierarchy (✅ Implemented)
* Modular React-style structure under `src/components/*`
* Centralised `services/` layer (AI, audio, firebase, storage)

### 1.2 Upcoming Work
| Priority | Item | Owner |
|---|---|---|
| P-1 | Finish migrating legacy util functions into service layer | — |
| P-2 | Introduce lazy-loaded code-splitting (Vite + dynamic `import()` ) | — |
| P-2 | Document component contracts (TypeScript types or JSDoc) | — |

---
## 2. Front-End Design & UX
### 2.1 Styles
* `enhanced-ui.css` now houses variables (`--fs-*`, `--z-*`).
* **Scoreboard, Host, Modal, Header** all reference new z-index scale.
* Fluid typography via `clamp()`.

### 2.2 Outstanding (see also Urgent Bug Queue)
1. Plane ticker overhaul (visual & triggers).
2. Speech bubble arrow/spacing, extra `$`, escape-char cleanup.
3. Light/Dark mode, Translate toggle, Hamburger menu.
4. Responsive breakpoints 480/768/1024/1440 + touch target audit.

---
## 3. AI & Audio Features
| Status | Feature |
|---|---|
| 🟢 | Built-in browser TTS fallback (baseline) |
| 🟡 | Free-tier AI text API for Host personality prompt |
| 🔜 | AI voice synthesis (Alex Trebek-like) – evaluate ElevenLabs / Bark |

Next Steps:
1. Draft personality prompt and config for chosen free API.
2. Polyfill hooks so Host dialog goes through whichever voice pipeline is available.

---
## 4. Data & State
* Redux-like pattern adopted (`game`, `ui`, `host`, etc.).
* Need persistence of streak/topScore to `localStorage` (pending).
* Plan to store achievements & user profile in Firebase.

---
## 5. Dev-Ops / Build
* **Blocking:** Vite/esbuild EOF error at `src/main.js:440` – first fix.
* Font decode (OTS) – re-encode or drop offending font.
* Add `npm run analyze` bundle visualizer.

---
## 6. Testing & QA
* Cypress E2E skeleton present (`cypress/`).
* TODO: Visual Regression harness (Percy or Chromatic).
* Add jest/unit tests for service layer.

---
## 7. Urgent Bug Queue
See [URGENT_TODO_2025-08-06.md](./URGENT_TODO_2025-08-06.md). Items are tagged P-1/P-2.

---
## 8. Appendices
* [Full CSS Audit](./CSS_AUDIT_REPORT.md)
* [Detailed Carmack-style refactor log](./CARMACK_REFACTOR.md)
* [Old plans archive](`docs/_OLD_DOCS/`)
* Media embedding implementation notes – [MEDIA_RENDERING_IMPLEMENTATION.md](./MEDIA_RENDERING_IMPLEMENTATION.md)

---
### Editing Guidance
* Update **this** file whenever a task is completed or added – keep sections concise.
* Detailed rationale goes into the sub-docs. Keep this as an at-a-glance tracker.
