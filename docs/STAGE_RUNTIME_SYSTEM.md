# JeoPARODY Stage Runtime System

**Status:** CANONICAL ARCHITECTURE  
**Repository:** `AlexBaldman/jeoPARODY`

> Historical note: JeoPARODY previously went through a donor/canonical-repository convergence period. [`JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md`](JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md) preserves that history. Current implementation work belongs in this repository unless a newer canonical routing document explicitly says otherwise.

## North star

**JeoPARODY is a programmable game-show studio.** Game/mode domains produce semantic truth. Director systems interpret that truth dramatically. Stage renders the shared show.

```text
MODE / GAME STATE
      ↓
semantic facts + events
      ↓
SHOW / PERFORMANCE DIRECTORS
      ↓
STAGE PROJECTION
      ├── shared browser / TV / projector
      ├── host + contestants + board
      ├── camera / audio / FX
      └── bounded comedy / environmental life
```

Stage is **presentation infrastructure**, not a second gameplay engine.

It may decide *how* `PLAYER_WRONG` looks. It may not decide whether the player was wrong.

## Ownership boundary

Stage and its directors may own local presentation state such as:

- active scene or shot;
- camera framing;
- host performance selection;
- animation/FX lifecycle;
- audience reaction;
- temporary set dressing;
- presentation timing and cancellation.

They may not independently own:

- scores;
- active clue/content truth;
- answer correctness;
- canonical round progression;
- multiplayer membership;
- private competitive answers.

The authoritative domain publishes facts. Stage consumes them.

## Conceptual flow

```text
Game / Mode Domain
      ↓
semantic event
      ↓
Game / Show Director
      ├── HostPerformanceDirector
      ├── StageDirector
      ├── CameraDirector
      ├── AudioDirector
      └── FXDirector
      ↓
Stage
```

Not every named director must become a class or subsystem. These are responsibility boundaries first. Extract code only when repeated behavior earns it.

## Scene vocabulary

Useful reusable scene concepts include:

```text
INTRO
CATEGORY_REVEAL
BOARD
CLUE
PLAYER_INPUT
PLAYER_ANSWER
CORRECT
WRONG
ROUND_TRANSITION
WINNER
CREDITS
```

Individual modes can add their own semantic scenes rather than forcing every game through trivia vocabulary.

For example, Needle Drop has listening/reveal/session beats that can still project through the same general Stage grammar without pretending an audio-identification round is a Jeopardy clue.

## Stage layers

A Stage projection can be thought of as:

```text
SET
├── Environment
├── Game Surface / Board
├── Host
├── Contestants
├── Podiums / Player Identity
├── Audience
├── Screens
├── Props
├── Camera
├── Lighting
├── Audio
├── FX
└── Comedy Layer
```

These are composable presentation layers, not mandatory DOM containers.

## Semantic reaction example

```text
PLAYER_WRONG
     ↓
StageDirector
     ├─ contestant reaction
     ├─ host response
     ├─ camera beat
     ├─ podium animation
     ├─ audience response
     └─ optional bounded environmental gag
```

The key word is **reaction**. The semantic fact already exists before Stage sees it.

## Current consumers and pressure tests

### Main trivia game

The original game spine remains the richest Stage consumer: host behavior, board/clue presentation, scoreboards, reactions, media, and show transitions.

### Needle Drop

Needle Drop has already pressure-tested a related direction through semantic show events, Show Director behavior, host-booth performances, and procedural stings. That work is valuable because it proves Stage concepts can survive outside the original trivia loop.

Canonical Needle Drop detail: [`NEEDLE_DROP_ARCHITECTURE.md`](NEEDLE_DROP_ARCHITECTURE.md).

### Head-to-Head

Head-to-Head currently prioritizes deterministic multiplayer truth over theatrical projection. Its public match state is a future candidate for:

- shared-screen score/clue projection;
- spectator mode;
- remote controllers;
- contestant reaction staging;
- multiplayer winner/rematch presentation.

Do not couple Stage directly to Firebase or room transport. Stage should consume public game facts regardless of whether they came from a local gateway, Firebase, or a later authoritative server.

Canonical multiplayer detail: [`HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md`](HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md).

## Host performance

Host performance is one Stage concern, not Stage itself.

The useful abstraction is semantic motion/performance vocabulary such as:

```text
thinking
excited
disappointed
celebrating
talking
waving
confused
pointing
nodding
shaking
```

Specific hosts and HostPacks can map these intentions into their own animation/voice/presentation assets.

Rules:

- semantic intent first, implementation-specific animation second;
- cancellable/teardown-safe performance lifecycles;
- reduced-motion support;
- no unmanaged timers or global DOM ownership;
- no host effect may mutate game truth.

## Player identity and shared display

Stage should eventually support the public game-show surface while player devices act as private/control surfaces.

```text
PUBLIC STAGE                PLAYER DEVICE
TV / projector              phone / browser
scores                       private input
host + board                 buzz / answer
public reveal                wager / choice
shared reactions             private information
```

This is especially relevant to Couch Party and future phone-controller play.

Any future input abstraction should remain separate from game rules. A controller reports intent; the domain/authority determines whether that intent is legal.

## Studio comedy as a bounded system

The studio itself can be a recurring comedy character through environmental assets and event-driven gags: broken hardware, background crew, absurd props, wrong-channel monitors, signs, confetti failures, animals, glitches, and callbacks.

Do not turn this into permanent visual noise.

A useful humor budget separates:

```text
content / clue humor
host performance
camera/editing humor
physical/environmental humor
lore/background callbacks
```

One beat can use several layers when escalation earns it, but the default should preserve clarity and gameplay readability.

## Visual direction

The established Stage vocabulary favors a wide game-show composition with retro/pixel/VHS ingredients: controlled palettes, pixel treatment, scanlines/glow where useful, podiums, studio hardware, host/contestants, audience infrastructure, screens, and animated environmental details.

These are art-direction ingredients rather than runtime invariants. Alternate sets/themes should be able to change without changing domain truth.

## Implementation sequence

Continue to earn Stage through vertical slices rather than building the entire television industry in one folder:

1. semantic event → presentation reaction;
2. clear scene lifecycle + teardown;
3. host / camera / audio reactions for a few high-value events;
4. pressure-test across Main Game and Needle Drop;
5. add Head-to-Head/shared-display projection after real cloud multiplayer is proven;
6. extract only repeated director/projection primitives;
7. add richer audience/props/environmental comedy once readability remains stable.

## Hard constraints

1. No presentation layer becomes a parallel score/clue/round owner.
2. No Stage module reaches into Firebase/network implementation details.
3. No effect depends on browser-stored privileged secrets.
4. Timers, subscriptions, media, and animations require cancellation/teardown.
5. Accessibility, reduced motion, localization, privacy, and asset provenance remain release concerns.
6. Multi-client projections consume public truth only.
7. Historical donor material may be mined for behavior and assets, but current implementation follows this repo's canonical owners.
8. Shared abstractions are earned through multiple real consumers, not architecture enthusiasm.

## Canonical routing

- Runtime architecture: [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
- Documentation router: [`README.md`](README.md)
- Current priorities: [`MASTER_PLAN.md`](MASTER_PLAN.md)
- Needle Drop: [`NEEDLE_DROP_ARCHITECTURE.md`](NEEDLE_DROP_ARCHITECTURE.md)
- Head-to-Head: [`HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md`](HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md)
- Historical repository convergence: [`JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md`](JEOPARODY_CANONICAL_MIGRATION_STRATEGY_2026-08-08.md)

A stable Stage Runtime should let JeoPARODY swap sets, hosts, podiums, camera packages, audio/FX packages, seasonal studios, and future show formats without rewriting the underlying game domains. That is the leverage worth preserving.
