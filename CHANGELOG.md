# Changelog

All notable changes to this project will be documented in this file.

## 2025-09-23
- CSS architecture: single stylesheet entry with CSS `@layer` ordering.
- Design tokens: `src/styles/tokens.css` (colors, spacing, radii, shadows, timings, z-index, header height).
- Components: added `src/styles/components/scoreboard.css` and `src/styles/components/speech-bubble.css`.
- Theming: scoreboard and speech bubble use modifier classes and CSS variables; dev theme cycling zones.
- Layering: unified z-indexes; removed duplicate tokens from `enhanced-ui.css`.
- Accessibility: modal focus trap, roles/aria; header height tokenized as `--header-h`.
- AI: mock provider toggle (`use_mock_ai`) and health-check utility scaffolded; relative endpoints.
- Tests: core scoring/validation tests and mock AI toggle test added.
- Docs: `docs/CSS.md`; updated README, WARP.md, CONTRIBUTING.md; added `AGENTS.md`.

## 2025-09-21
- Phase 1 finalize: modal a11y improvements, sound mappings, scoreboard polish, reduced-motion gating, mobile widths.
- Event unification, focus trap, question sharding script, asset-check script, architecture/docs refresh.
