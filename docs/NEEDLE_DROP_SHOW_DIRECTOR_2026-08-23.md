# Needle Drop — Host & Sting Director vertical slice

**Date:** 2026-08-23
**Release target:** proving build 1.4
**Question:** Can one semantic game event produce a deterministic, accessible show performance without contaminating game truth?

## Contract

```text
accepted reducer transition
          ↓
sanitized semantic event
          ↓
      ShowDirector
       ↙       ↘
captioned call  optional cue command
                    ↓
                StingAudio
```

`core/round.js` remains the sole owner of phase, score, answer acceptance, locks, and progression. The Director receives facts after the reducer accepts an action. It returns a scene, host call, and optional sound cue. Presentation renders the call; a disposable audio adapter realizes the cue.

## Semantic slice

- `REVEAL_STARTED` / `REVEAL_REPLAYED`
- `REVEAL_READY`
- `BUZZ`
- `CORRECT`, including steal context
- `WRONG` and `PASS`
- `REVEAL_PURCHASED` / `CLUE_REVEALED`
- `ROUND_TRANSITION`
- `WINNER`
- `AUDIO_ERROR`
- `SESSION_RESTARTED`

Events contain identifiers and bounded mechanics. They do not contain typed answers or mutable state objects.

## Presentation rules

1. Host lines are selected deterministically from event identity, package, and crate seed.
2. Comedy occupies the host-performance budget; clue, camera, environment, and lore channels remain quiet in this slice.
3. Every cue has an equivalent visible caption. Muting cues never removes information.
4. Show sound persists independently from music playback and scores.
5. Cues are original procedural tones, short, cancellable, and failure-tolerant.
6. Scene requests are semantic (`CLUE`, `PLAYER_ANSWER`, `CORRECT`, `WRONG`, `ROUND_TRANSITION`, `WINNER`) so a later host rig, camera, lighting, or set can consume them without touching the reducer.

## Verification gates

- Event serialization never includes submitted answer text.
- Identical event + state + seed yields an identical performance.
- A multiplayer steal produces `CORRECT`, a steal cue, and a caption naming the scorer.
- Audio failure or missing Web Audio never blocks gameplay.
- Muting stops active cues and survives reload.
- Desktop, mobile, Quick Hit finale, lint, rights validation, tests, build, and accessibility remain green.

## Next pressure test

Add one deliberately small visual Stage consumer—podium reaction or camera emphasis—for the same semantic events. If it can consume the event without new game-state ownership, the Director boundary has earned another limb. No giant Stage framework will be constructed merely because rectangles can be named.
