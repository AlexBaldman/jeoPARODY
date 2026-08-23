# Needle Drop — third-pass proving plan

**Date:** 2026-08-23  
**Release target:** proving build 1.3  
**Lead domino:** make every session replayable, measurable, and easy to fit into a real room.

## Product decision

The 1.2 loop is playable. The next uncertainty is whether people finish it, replay it, and create recognizable room moments. Eight fixed clues cannot answer that reliably. The third pass adds three session formats, deterministic crate seeds, a local-only semantic recorder, and a finale receipt. No event leaves the device.

| Format | Clues | Intended use |
| --- | ---: | --- |
| Quick Hit | 3 | onboarding, demos, impatient relatives |
| Side A | 5 | ordinary couch session |
| Full Crate | 8 | complete proving run |

## Architecture contract

1. `core/session.js` owns format normalization, seed normalization, deterministic ordering, and session URLs.
2. `core/round.js` remains the sole owner of scoring, attempts, phase, locks, and progression.
3. `SessionRecorder` observes accepted reducer transitions. It never changes game truth and never records answer text.
4. Presentation receives a computed summary and safe URLs. It does not inspect storage, clocks, randomness, or browser APIs.
5. The original episode manifest remains immutable. A session episode is a shallow, deterministic projection over the cleared source package.

```text
cleared episode + format + seed
              ↓
      session projection
              ↓
      deterministic reducer
              ↓
 semantic transition observer
              ↓
 local finale receipt / copy text
```

## Release slice

- Quick Hit, Side A, and Full Crate selectors that preserve player count and seed.
- Original-order compatibility plus deterministic fresh-crate seeds.
- Format-aware personal bests with migration from the 1.2 profile.
- Local session metrics: guesses, first-drop hits, replays, reveals purchased, buzzes, steals, average reveal depth, and elapsed time.
- Finale receipt, copyable summary, same-crate rematch, and fresh-crate link.
- Unit tests for determinism, query safety, privacy, summaries, and profile migration.
- Browser coverage for a complete Quick Hit session plus existing desktop party and mobile checks.

## Deliberate exclusions

- No remote analytics endpoint or invisible fingerprinting.
- No phone controllers yet; the recorder first establishes the event vocabulary they will consume.
- No licensed catalog audio.
- No AI adjudicator.
- No second game-state owner disguised as a “session manager,” because we have suffered enough.

## Graduation evidence

- Identical seed + package version produces identical clue order.
- Changing format never mutates or bypasses the rights-validated manifest.
- Recorder output contains mechanics and identifiers, never typed answers.
- The full browser suite completes a three-clue run and verifies the finale receipt.
- Production serves compiled assets and the public Quick Hit URL completes without horizontal overflow or runtime errors.
