# Contributing

Principles
- Prefer clarity over cleverness. Measure, then optimize.
- Keep rendering cheap. Avoid layout thrash, big shadows, heavy filters.
- One event vocabulary. Canonical: `answer:submit`, `answer:evaluated`.

Coding
- Use `src/utils/events.js` for cross-module events.
- Keep GameEngine state isolated (use `createGameState()`).
- Avoid absolute `/assets/...` paths. Use repo-relative `assets/...`.

Data
- Use sharded questions when possible. Generate via `node scripts/shard-questions.js`.

UI
- Mobile-first; keep touch targets ≥ 44px.
- Respect `prefers-reduced-motion`.
- Add aria roles/labels. Trap focus in modals/menus.

Validation
- Run 
ode scripts/asset-check.js to detect broken asset references.

CSS
- Single entry: src/styles/app.css with @layer ordering.
- Use tokens from src/styles/tokens.css (colors, spacing, z-index, header height).
- Naming: base + modifier (e.g., .scoreboard scoreboard--basketball, .speech-bubble speech-bubble--jeopardy).
- Prefer variables over magic numbers; avoid creating stacking contexts unless required.

