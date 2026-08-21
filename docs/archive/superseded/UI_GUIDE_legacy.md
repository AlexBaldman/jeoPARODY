# UI Guide

Mobile-first. High contrast. Minimal motion by default.

Components:
- Header: language toggle, theme switch, host animation (💃), hamburger (menu).
- Side menu: vertical dropdown (top-right), backdrop, focus trap, keyboard-close (Esc).
- Scoreboard: peeks behind header, slides on update, neon pulse for changes, light/dark.
- Profile: bottom-right slide-out with peek tab; matches scoreboard styling.
- Host: bottom-left above footer; animations via event `host:animate`.
- Ticker/plane: behind speech bubble; reduced-motion aware.

Events:
- Submit: `answer:submit` (canonical). Eval result: `answer:evaluated`.

