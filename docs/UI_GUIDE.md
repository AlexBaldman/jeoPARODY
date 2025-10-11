# UI Guide

Mobile-first. High contrast. Minimal motion by default.

Components:
- Header: language toggle, theme switch, host animation (💃), hamburger (menu). Sticky at `--z-header`.
- Side menu: positioned under header (`top: var(--header-h)`), capped height, backdrop at `--z-panel-backdrop`, panel at `--z-panel`, focus trap, Esc to close.
- Scoreboard: canonical right-edge peek panel (`components/scoreboard.css`). Reveals on hover or `:focus-within`; peek tab gets a focus ring. Light/dark via tokens.
- Profile: bottom-right slide-out with peek tab; matches scoreboard styling; stays under header.
- Host: bottom-left above footer; `--z-host`; animations via event `host:animate`.
- Ticker/plane: runs behind content at `--z-plane`; `pointer-events: none`; reduced-motion aware.

Events:
- Submit: `answer:submit` (canonical). Eval result: `answer:evaluated`.

Modals:
- Use shared `.btn-modal-close` for consistent close buttons.
- Backdrops and content sit at `--z-modal`; trap focus; Esc to close.

