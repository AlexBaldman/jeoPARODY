# CSS Architecture

This project uses a single CSS entry (`src/styles/app.css`) with layers:

- base: tokens, low-level variables
- layout: global layout and structure
- components: feature styles (scoreboard, bubbles, modals, PAO, board)
- utilities: helpers and temporary overrides

Key files
- `src/styles/tokens.css` — design tokens (colors, z-index, spacing, radii, shadows, timings, header height)
- `src/styles/components/scoreboard.css` — base + themes via CSS variables
- `src/styles/components/speech-bubble.css` — base + arrow via variables; theme aliases
- `src/styles/utilities.css` — `.visually-hidden`, `.focus-ring`
- `src/styles/app-fixes.css` — temporary overrides (to be reduced over time)

Z-index map
- `--z-plane` (1) ambient plane/ticker
- `--z-footer` (90) sticky footer/low overlays
- `--z-host` (100) host avatar
- `--z-scoreboard` (900) scoreboard
- `--z-panel-backdrop` (950) side-menu backdrop
- `--z-panel` (980) side-menu panel
- `--z-header` (1000) sticky header
- `--z-modal` (2000) dialogs/overlays

Naming
- Components use base + modifier: `.scoreboard scoreboard--basketball`, `.speech-bubble speech-bubble--jeopardy`
- Legacy classes remain compatible temporarily (`.speechBubble`, `.basketball-scoreboard`)

Scoreboard
- Canonical implementation is the right-edge peek scoreboard (`components/scoreboard.css`).
- The old centered "basketball-style" scoreboard has been removed to avoid conflicts.

Guidelines
- Prefer tokens over magic values; avoid creating stacking contexts unless required.
- Gate motion under `prefers-reduced-motion: reduce`.
- Keep all imports routed through `app.css` to preserve layering.
 - Ticker uses `pointer-events: none` to avoid intercepting clicks and stays at `--z-plane`.
 - Modals should use `.btn-modal-close` for consistent close buttons; backdrops/content at `--z-modal`.

Linting & Purge
- Stylelint: `npm run lint:css` (requires `stylelint` + `stylelint-config-standard`).
- PurgeCSS (post-build optional): `npm run purge:css` (requires `purgecss`).
- Safelist dynamic classes (`visible`, `expanded`, `scoreboard--*`, `speech-bubble-*`).
