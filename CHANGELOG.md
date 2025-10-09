## 2.1.0 (2025-09-23)
- CSS architecture finalized: tokens, layers, component styles
- Dev UX: HUD and Dev Menu; theme persistence and cycling
- Audio: gated init on interaction (no autoplay warnings)
- SW caching: static and question assets
- AI: mock provider toggle + health-check utility
- Testing: core scoring/validation; mock AI toggle
- MCP: Playwright + Chrome DevTools servers and docs
- Docs: README, CSS.md, MCP.md, CONTRIBUTING, CHANGELOG
- Fix: question loader TDZ
# Changelog

All notable changes to this project will be documented in this file.

## 2025-09-23 (MCP and follow-ups)
- MCP tooling: added Playwright and Chrome RDP MCP servers with quick-start docs; new npm scripts (`mcp:browser`, `mcp:chrome`, `chrome:rdp`, `snap`).
- Documentation: `docs/MCP.md` (workflow, client config) and `docs/CSS.md` additions; README/CONTRIBUTING/WARP updates.
- UI/Accessibility: further polish to modal focus trap and ARIA, header/index tweaks, refined scoreboard peek/hover and speech-bubble visuals; mobile and reduced-motion adjustments.
- Styles: introduced tokens/utilities and component styles (`tokens.css`, `utilities.css`, `components/scoreboard.css`, `components/speech-bubble.css`); consolidated layering and variables.
- Services: AI provider modularization; added health check and mock provider; export/loader fixes in questionService.
- Tests: initial unit tests for core scoring/validation and AI mock provider.
- Build/Lint/Dev: add Stylelint config, PurgeCSS config, lightweight dev HUD/menu helpers, and a basic service worker scaffold.

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

