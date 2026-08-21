---
status: reference
owner: presentation
updated: 2026-08-21
---

# CSS / Responsive Presentation Reference

## Canonical entrypoint

All runtime styles should flow through `src/styles/app.css` and its ordered layers. Avoid adding independent stylesheet systems or bypassing the established cascade without an explicit migration reason.

## Core rules

- Prefer design tokens from `src/styles/tokens.css` over repeated magic values.
- Keep component styles locally understandable.
- Use bounded responsive values (`clamp()`, dynamic viewport units, safe-area insets) where screen geometry genuinely varies.
- Animate with transform/opacity where practical.
- Respect `prefers-reduced-motion`.
- Do not use CSS to create a second source of semantic/game truth.
- Browser evidence outranks visual intuition.

## Stage-responsive owner

`src/styles/responsive-stage.css` is the current final ownership layer for the protected Stage geometry. It owns the marginless viewport shell, footer Stage rail, responsive host size/position, safe-area geometry, and choreography-related Stage overrides.

Legacy rules in `app-fixes.css` may still exist underneath it. When a touched rule is clearly superseded and safely removable, apply the Bus-the-Table Rule and reduce the legacy layer instead of stacking another override.

## Important z-index intent

Use the token map rather than arbitrary escalating integers. Conceptually:

```text
ambient / plane
< footer / stage scenery
< host / local stage actors as intentionally layered
< panels / menus / scoreboard
< header
< modal / dialog
```

The footer rail may intentionally occlude the host during choreography. That relationship is part of Stage composition, not an accidental z-index conflict.

## Mobile/fullscreen requirements

Protected gameplay surfaces should:

- fit without unintended document scrolling;
- avoid horizontal overflow;
- keep controls reachable;
- keep speech bubble within viewport bounds;
- keep host clear of the control deck;
- respect iPhone safe areas and dynamic browser chrome;
- use mobile composition decisions instead of merely stacking desktop blocks.

## Verification

```bash
npm run lint:css
npm run build
npm run runtime:check
```

The runtime harness currently verifies desktop plus iPhone-class viewports. Add new protected viewports when a real production failure justifies them.

## Historical material

Old CSS audits and refactor plans are evidence, not current architecture. They belong under `docs/archive/` after unique unresolved concerns are migrated into the active roadmap.
