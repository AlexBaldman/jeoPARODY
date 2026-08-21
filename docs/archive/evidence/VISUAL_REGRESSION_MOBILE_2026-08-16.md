# Mobile visual regression baseline — 2026-08-16

## Source evidence

Two production screenshots supplied from the deployed GitHub Pages build show the current responsive failures on desktop and iPhone-class Safari.

The original screenshots were supplied in the project conversation and should be copied into the durable asset/reference library when binary import is available. Until then, this document preserves the observed acceptance criteria and the runtime checker produces fresh CI screenshots under `screenshots/runtime-check/`.

## Observed failures

### iPhone-class portrait

- browser chrome consumes a meaningful fraction of the usable vertical viewport;
- scoreboard expands into an oversized standalone band;
- clue/speech card dominates the stage vertically;
- control deck stacks into a tall page-like layout instead of behaving like a compact game surface;
- host/background staging is squeezed into remaining space;
- composition feels like desktop modules stacked vertically rather than a designed mobile Stage;
- fullscreen/PWA presentation would materially improve usable space.

### Desktop

- clue/speech card can become too wide/low and visibly clip content;
- score presentation floats awkwardly relative to the stage;
- layout needs stronger invariant ownership between Stage, clue card, host, scoreboard, and control deck.

## Blocking acceptance criteria

The deterministic runtime check must cover at least desktop `1440x900` and mobile `390x844` and fail when:

- the document requires horizontal scrolling;
- the document requires vertical scrolling during the tested gameplay spine;
- the host overlaps the control deck;
- the speech bubble is missing or materially displaced from the playfield;
- required Stage/control surfaces disappear during mode transitions;
- a real question or host asset fails to load correctly.

CI screenshots are evidence, not merely decoration. They should be uploaded on every runtime-check run, especially failures.

## Mobile Stage direction

Prefer a viewport-aware game composition using dynamic viewport units and safe-area insets rather than stacking the desktop document flow.

Target principles:

- game shell occupies the usable viewport (`100dvh` where supported);
- account for `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`;
- compact/collapse HUD and scoreboard before sacrificing clue readability;
- constrain clue card to the Stage allocation rather than allowing it to dictate page height;
- keep response input and primary actions reachable without page scrolling;
- decorative/background content yields before gameplay controls;
- fullscreen/PWA mode is progressive enhancement, not a requirement for basic playability.

## Next implementation slice

1. Land blocking production browser CI.
2. Let the checker expose current mobile failures.
3. Repair the smallest responsive Stage/CSS ownership issue first.
4. Add fullscreen/PWA behavior once the normal browser layout is deterministic.
5. Preserve before/after screenshots as regression specimens.
