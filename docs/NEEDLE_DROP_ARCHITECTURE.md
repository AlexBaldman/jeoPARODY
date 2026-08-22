# Needle Drop — proving architecture

**Lifecycle:** Proving  
**Concept ID:** `game-mode.needle-drop`  
**Working codename:** Project Crate Expectations

Needle Drop is a composable JeoPARODY music-game mode. The proving build asks whether progressively revealing a tiny piece of musical DNA is fun enough that people immediately demand another record.

## Decisions

1. **One truth kernel.** `core/round.js` owns phases, scoring, authored answer acceptance, and transitions. It has no DOM, audio, timer, or storage dependency.
2. **Content is executable data.** `core/content.js` provides a versioned, immutable, rights-gated episode manifest and validator. Original Web Audio sequences stand in for future cleared assets.
3. **Audio is an adapter.** `AudioRuntime` dispatches to the procedural synth or a decoded-buffer implementation that verifies SHA-256 integrity before decoding and schedules exact offset/duration windows.
4. **Presentation consumes state.** `presentation/markup.js` turns serializable truth into escaped HTML. `main.js` stays the composition root, dispatches actions, manages focus/audio, and emits `needle-drop:*` semantic events for future host, camera, analytics, haptics, and multiplayer directors.
5. **The build stays independently playable.** `needle-drop.html` is a separate Vite entry point while the mode proves itself.
6. **A miss is gameplay, not a funeral.** Wrong solo answers unlock the next reveal; wrong party answers lock only that player for the current clip and open a steal. The reducer adjudicates every lockout.
7. **Persistence is optional.** `ProfileStore` keeps a solo personal best, but storage failure never blocks a round. Scores are not national secrets, despite what the scoreboard implies.

```text
needle-drop.html
  └─ main.js                    composition root + semantic events
      ├─ core/round.js          deterministic truth kernel
      ├─ core/content.js        episode schema, validator, demo
      ├─ services/audioRuntime.js implementation router
      ├─ services/synthAudio.js procedural demo adapter
      ├─ services/decodedBufferAudio.js integrity-checked asset adapter
      ├─ presentation/markup.js  escaped state-to-view boundary
      ├─ presentation/Waveform.js
      ├─ services/profileStore.js optional local personal best
      └─ styles.css
```

## Serializable state and replay

```js
{
  phase, episodeId, clueIndex, revealIndex, listenedRevealIndex,
  score, streak, correct,
  players: [{ id, score, streak, correct, attempts }],
  activePlayerId, blockedPlayerIds,
  attempts: [{ clueId, playerId, answer, accepted, revealIndex, points }],
  lastAttempt, audioError,
  result
}
```

Actions are serializable: `PLAY_REVEAL`, `REVEAL_FINISHED`, `AUDIO_FAILED`, `BUZZ`, `MORE_AUDIO`, `SUBMIT_ANSWER`, `PASS`, `GIVE_UP`, `NEXT_CLUE`, and `RESTART`. Episode version plus action log provides deterministic truth replay.

The important invariant is that `SUBMIT_ANSWER` and `MORE_AUDIO` are rejected until the current reveal has completed. In party mode, `blockedPlayerIds` resets when the room purchases a longer reveal. This gives every reveal its own fair buzz window without requiring timers or network clocks in the truth kernel.

## Production content extension

Production clues should add immutable asset/checksum, exact sample windows, loudness/fades, rights scope and expiry, evidence/provenance, editorial status, and accessibility alternatives. Generated facts remain noncanonical until editorial review. A language model may propose a crate; it does not get the keys to the record store.

## Next adapters, in order

1. `EpisodeRepository` for bundled manifests, then signed remote packs.
2. `SessionRecorder` for seed, content version, actions, calibration, and events.
3. `InputGateway` adapter for networked phone controllers; local four-player keyboard buzzing now proves the session contract.
4. Director consumers for host performance, camera, stings, FX, accessibility, and analytics.

## Vertical-slice gate

- twenty cleared relationships across four rounds and a finale;
- solo plus two-to-four-player couch mode;
- calibrated buzz adjudication;
- immutable episode packaging and automated rights/content validation;
- sample-lineage reveal with provenance;
- at least 70% completion and 60% of rounds producing a room reaction in blind tests;
- no network or AI dependency in the critical play loop.

## Commands

```bash
npm run dev
# open /needle-drop.html
npm run needle-drop:validate
npm test -- --runInBand
npm run build
```

The demo music is synthesized and original. Real catalog recordings require explicit interactive-game rights; a streaming subscription is not a permission slip wearing headphones.
