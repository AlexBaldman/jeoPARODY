---
status: proving
owner: needle-drop
updated: 2026-08-21
concept: game-mode.needle-drop
---

# Needle Drop Architecture

Needle Drop is a separately playable proving mode for progressive music recognition. It tests whether JeoPARODY's semantic-event, rights/provenance, audio-adapter, and couch-play ideas remain clean outside the main trivia loop.

## Bounded truth kernel

“One owner per truth” applies per bounded domain. The main trivia runtime owns its game truth through `GameEngine`; Needle Drop owns its isolated mode truth through `src/modes/needle-drop/core/round.js`.

That kernel owns phases, scoring, authored answer acceptance, and transitions. It has no DOM, audio, timer, or storage dependency.

```text
needle-drop.html
  └─ main.js                    composition root + semantic events
      ├─ core/round.js          deterministic mode truth
      ├─ core/content.js        episode schema + validator
      ├─ services/audioRuntime.js
      ├─ services/synthAudio.js
      ├─ services/decodedBufferAudio.js
      ├─ presentation/Waveform.js
      └─ styles.css
```

## Architectural decisions

1. **One local truth kernel.** Presentation and audio consume state/actions; they do not own scoring or progression.
2. **Content is executable data.** Episodes are versioned, immutable, validated, and rights-gated.
3. **Audio is an adapter.** The demo uses original procedural synthesis; asset playback can verify SHA-256 integrity and schedule exact windows.
4. **Presentation emits semantic events.** `needle-drop:*` events can later feed host, camera, analytics, accessibility, haptics, and multiplayer directors.
5. **Independent proving surface.** `/needle-drop.html` stays separately playable while the mode proves its product value and architecture.

## Serializable replay state

```js
{
  phase,
  episodeId,
  clueIndex,
  revealIndex,
  score,
  streak,
  correct,
  attempts,
  result
}
```

Episode version + serializable action log creates a path toward deterministic replay/session recording.

## Rights boundary

Production music content needs explicit interactive-game rights, immutable asset identity/checksums, precise sample windows, rights scope/expiry, provenance/evidence, editorial status, and accessibility alternatives.

A streaming subscription is not an interactive-game license. The demo therefore uses synthesized original material.

## Current command

```bash
npm run needle-drop:validate
```

The validator checks content shape and rights-window constraints before shipping.

## What this mode should pressure-test

- isolated domain kernels behind a shared product shell;
- reusable semantic-event / director boundaries;
- exact audio scheduling;
- rights-aware content packages;
- couch input/buzzing and future phone-controller adapters;
- deterministic session recording;
- whether Stage/host systems can consume a new game mode without learning its internal state model.

## Extraction rule

Do not generalize Needle Drop internals into the main runtime merely because both are games. Extract a shared primitive only when both modes demonstrate the same stable contract and the abstraction makes each implementation simpler.
