---
status: canonical
owner: stage
updated: 2026-08-21
supersedes:
  - docs/STAGE_RUNTIME_SYSTEM.md
---

# Stage Architecture

Stage is JeoPARODY's responsive performance layer. It turns semantic game facts into a coherent show without owning those facts.

## Boundary

```text
GAME / DOMAIN TRUTH
        ↓ semantic events
PRESENTATION / PERFORMANCE LOGIC
        ↓ cues
STAGE
        ↓
set + host + bubble + camera + audio + FX + UI scenery
```

Stage may choose **how** a correct answer feels. It may not decide whether the answer was correct.

## Current Stage slice

The first proven Stage actor is the host.

- `HostSystem` owns identity, personality, mood, and image selection.
- `HostStageActor` owns position, scale, facing, footer occlusion, motion geometry, and speech-bubble tail tracking.
- The sticky footer doubles as a foreground **Stage rail**.
- Responsive sizing uses viewport-aware `clamp()` values.
- Safe-area geometry and `100dvh` support fullscreen/mobile composition.
- Browser CI verifies desktop plus iPhone-class viewports.

The Stage actor can currently pace, descend/duck behind the footer rail, and surprise-pop from a new position. These are deliberately small primitives proving the ownership model.

## Stage composition

The long-range Stage vocabulary can include:

```text
Stage
├── Set / environment
├── Game surface / board
├── Host
├── Contestants / podiums
├── Audience
├── Screens / tickers
├── Props
├── Camera
├── Lighting
├── Audio
├── FX
└── Comedy layer
```

Each layer should be independently suppressible and composable. Comedy should not obscure gameplay, and multiple joke channels should not fire merely because they exist.

## Responsive doctrine

Mobile is a composition target, not a shrunken desktop page.

- Prefer dynamic viewport units (`dvh`) where browser chrome changes usable height.
- Respect safe-area insets.
- Scale host and scenery with bounded responsive tokens.
- Keep gameplay controls reachable and unobscured.
- Avoid document scrolling during the protected gameplay spine unless a specific mode explicitly requires it.
- Use transform/opacity for animated motion where practical.
- Respect `prefers-reduced-motion`.

## Speech-bubble attribution

The bubble tail is presentation geometry. It follows the live host anchor rather than assuming a fixed left-side host.

That contract should survive future host embodiments: whole-image sprites today, rigged/layered 2D later, and potentially 3D or alternate projections without changing dialogue semantics.

## Stage scene direction

Future directors may compose semantic scenes such as intro, clue, correct, wrong, wager, round transition, winner, and credits. Extract a director abstraction only after multiple real scenes require shared orchestration.

Do not build a universal Stage engine merely because the vocabulary is imaginable. **JeoPARODY earns the abstraction one verified vertical slice at a time.**

## Testing

A Stage change is not complete because it looks correct in one browser window. Protect:

- production boot;
- clue rendering and semantic-state agreement;
- no unintended horizontal/vertical overflow;
- host/control non-overlap;
- bubble alignment;
- required asset decoding and MIME types;
- desktop + protected iPhone viewports;
- reduced-motion/accessibility behavior when relevant.

The blocking production harness is `scripts/runtime-state-check.mjs` via `npm run runtime:check`.

## Related docs

- `OVERVIEW.md`
- `HOST_PERFORMANCE.md`
- `../reference/CSS.md`
- `../product/MIGRATION.md`
