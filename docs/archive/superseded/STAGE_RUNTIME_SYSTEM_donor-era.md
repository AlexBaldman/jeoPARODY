# JeoPARODY Stage Runtime System — Donor / R&D Handoff

**Canonical implementation target:** `AlexBaldman/Jeopardish`
**This repository:** `AlexBaldman/jeoPARODY` — donor/R&D/reference material

> Implementation agents: do not treat this repository as a second canonical runtime. Mine it for behavior, fixtures, assets, visual ideas and product requirements, then implement through the current canonical owners in `AlexBaldman/Jeopardish`.

## North star

**JeoPARODY is a programmable game-show studio.** The game engine produces semantic facts/events. Director systems interpret those facts dramatically. The Stage renders the shared television show. Player devices can provide private/control surfaces.

```text
                    ┌─────────────────────┐
                    │     ROOM STATE      │
                    │ players / scores    │
                    │ round / clue / mode │
                    └──────────┬──────────┘
                               │
                    ┌──────────▼──────────┐
                    │   GAME DIRECTOR     │
                    │ decides presentation│
                    └──────┬────────┬─────┘
                           │        │
             ┌─────────────▼─┐    ┌─▼──────────────┐
             │     STAGE     │    │ PLAYER DEVICES │
             │ TV / projector│    │ phones/browser │
             └───────────────┘    └────────────────┘
```

Canonical conceptual direction:

```text
GameController
    ↓
GameEngine / EventBus
    ↓
semantic game events
    ↓
GameDirector
    ├── HostPerformanceDirector
    ├── StageDirector
    ├── CameraDirector
    ├── AudioDirector
    └── FXDirector
```

The presentation layer must never become a second owner of scoring, clue truth, answer state, progression or canonical room state.

## Stage scene vocabulary

Potential reusable scenes:

```js
const stageScenes = {
  INTRO: {},
  CATEGORY_REVEAL: {},
  BOARD: {},
  CLUE: {},
  BUZZ: {},
  PLAYER_ANSWER: {},
  CORRECT: {},
  WRONG: {},
  CHAOS_WAGER: {},
  ROUND_TRANSITION: {},
  FINAL_JEOPARODY: {},
  WINNER: {},
  CREDITS: {},
};
```

Conceptual Stage layers:

```text
SET
├── Environment
├── Game Board
├── Host
├── Contestants
├── Podiums
├── Audience
├── Screens
├── Props
├── Camera
├── Lighting
├── FX
└── Comedy Layer
```

Example semantic reaction:

```text
PLAYER_WRONG
    ↓
StageDirector
    ├─ contestant reaction
    ├─ host reaction
    ├─ camera punch-in
    ├─ podium animation
    ├─ audience response
    ├─ optional comedy ticker
    └─ optional environmental gag
```

## Host performance

The canonical runtime already has/targets HostPacks, HostAvatarPack, `HostPerformanceDirector`, and semantic motion primitives. Host concepts include Xander Trefleck, Vera Static and Professor O.O.

Useful donor semantic vocabulary includes thinking, excited, disappointed, celebrating, talking, waving, confused, pointing, nodding and shaking. Preserve useful beats as fixtures/tests; do not revive global DOM lookup, unmanaged timers, random animation ownership or legacy event glue.

## Player avatars and identity

Player identity should inhabit the show via podiums, scoreboards, reaction cutaways, winner screens and stage cameos. The broader desired pipeline is `player photo/input → standardized illustrated/pixel avatar → reusable stage asset`, subject to privacy, rights and asset policies.

## Couch Party / shared display

The Stage should support a TV/projector as the public game-show surface while phones/browser devices act as controllers.

Phones may handle buzzing, answer entry, wagers, voting, power-ups/sabotage where allowed, private information, drawing/alternate input and confidence controls. Room/game state remains canonical.

## Studio as comedy character

Historical stage ideas included a fax machine, skeleton, raccoon, backward-facing camera, sleeping boom operator, audience signs, dangling studio light, wrong-channel monitor, mis-aimed confetti cannon, 404-glitching wheel, blinking chicken, repo truck and fishbowl bubbles.

Treat these as optional event-driven environmental assets/gags rather than permanent noise.

Keep conceptual humor budgets separated across clue/content, host performance, camera, physical/environmental and lore/background comedy. Do not fire every comedy channel at once.

The donor `comedyTicker` is behavioral reference material. The canonical replacement should be localized, cancellable, deterministic/seedable where useful, reduced-motion safe, disposable and unable to obscure gameplay.

## Visual direction

The historical target is a wide 16:9 game-show composition with retro pixel/VHS vocabulary: limited-color/pixel treatment, dithering, neon/VHS glow, scanlines, RGB separation, podiums, studio hardware, host/contestants, audience infrastructure and animated environmental details.

These are theme/art-direction ingredients, not immutable runtime requirements. Alternate Stage sets/themes should be possible without changing game truth.

## Donor mining rules

When inspecting this repository, classify findings as:

- **KEEP:** canonical implementation already wins; donor supplies behavior/tests/ideas.
- **PORT:** isolated donor behavior can safely adapt behind a canonical boundary.
- **REBUILD:** preserve requirement/behavior but implement through current canonical owners.
- **ARCHIVE:** historical/research value only.

Hard constraints:

1. no wholesale merge of this repo's runtime/store/component architecture;
2. no browser-stored AI secrets;
3. no parallel global game state owner;
4. no compatibility bridge that perpetuates legacy event/state ownership;
5. no presentation effect may mutate canonical score/clue/round truth;
6. subscriptions, timers, animations and media effects require teardown/cancellation;
7. accessibility, reduced motion, localization, privacy and asset provenance remain release gates.

## Suggested canonical implementation sequence

1. Stage shell + scene lifecycle.
2. Semantic event → director adapter.
3. Intro/clue/correct/wrong/round-transition/winner vertical slice.
4. `HostPerformanceDirector` integration.
5. Camera + contestant/podium reactions.
6. Audience/screens/props/environmental life and bounded comedy.
7. Shared-screen Couch Party integration.

## Instructions for another AI agent

Before changing code:

1. switch to/read `AlexBaldman/Jeopardish` as the canonical implementation repository;
2. read `docs/architecture/STAGE_RUNTIME_SYSTEM.md` there;
3. read its convergence README, registry and donor deep-mine documentation;
4. inspect canonical event bus, HostPerformanceDirector/HostPacks, audio, input, episode/round, media, localization and visual fixtures;
5. search this donor repo for stage/studio/camera/audience/podium/host/comedy code/assets and extract only useful behaviors/fixtures;
6. propose the smallest vertical slice proving semantic event → director → Stage;
7. implement against existing canonical contracts rather than forcing an imagined API;
8. add deterministic tests/visual fixtures as the system expands.

A stable Stage Runtime can later support alternate sets, hosts, podiums, audience packs, camera packages, FX packs, seasonal studios, props, cosmetics and future show formats without rewriting the trivia engine.