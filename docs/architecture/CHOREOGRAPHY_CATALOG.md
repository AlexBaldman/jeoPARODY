---
status: active
owner: host-performance
updated: 2026-08-21
---

# Host Choreography Catalog

The host performance system should evolve from whole-image movement into composable stage choreography with increasingly capable rigs, expressions, props, audio, and lip sync.

This catalog preserves named comedy/performance beats. `HOST_PERFORMANCE.md` owns the architecture; this file is the growing vocabulary.

## Current primitive ownership

- `HostSystem`: identity, personality, mood, image selection, semantic host reactions.
- `HostStageActor`: responsive position, scale, movement, footer-rail occlusion, choreography, speech-bubble tail tracking.
- Footer: foreground Stage rail / occluder.

## Comedy beat registry

### Locomotion

- `pace`: patrol left/right with pauses and facing changes.
- `stormOffLeft` / `stormOffRight`: angry exit with optional muttering/audio sting.
- `reluctantReturn`: slow suspicious re-entry after an exit.
- `fakeStairs`: descend behind the footer rail in repeated vertical steps.
- `moonwalkExit`: comic glide to an edge.

### Forced exits

- `apolloSiren`: talent-show siren, lights/audio cue, host gets shuffled offstage.
- `vaudevilleHook`: cane/hook enters from wing and drags host away.
- `stageSweep`: unseen crew or prop physically pushes host off.

### Peek-ins

- `peekEdgeLow`: eyes/head from lower edge.
- `peekEdgeHigh`: head appears at an intentionally impossible height/angle.
- `peekCorner`: diagonal corner intrusion.
- `peekRepeated`: escalating left/right false starts.
- `shoeHandsWheel`: head plus shoes worn on hands rotate around an implied circular wheel before disappearing.

### Surprise / hiding

- `duckAndScare`: duck behind footer, hold beat, pop from new horizontal position.
- `falseExitPop`: walk fully offscreen, pause, instantly reappear elsewhere.
- `periscope`: only a small part rises above the footer before the full host appears.

### Gesture / reaction

- `chefsKiss`: pinched-fingers gesture after an especially ridiculous clue or performance beat.
- Future reaction families should cover correct, wrong, streak, timeout, confusion, awkward silence, triumph, suspicious scrutiny, and host-specific recurring behavior.

## Future rig-aware beats

Once the host has movable body parts, face controls, and layered sprite/mesh representations:

- independent head/torso/arm motion;
- eye aim and blink timing;
- eyebrow and mouth expressions;
- prop attachment points;
- hand gestures and pointing;
- squash/stretch and anticipation poses;
- walk cycles with foot planting;
- partial occlusion by scenery;
- procedural reactions assembled from pose fragments.

## Audio + mouth synchronization

Target pipeline:

```text
semantic host line
→ approved VoicePack clip or authorized generated voice
→ phoneme / viseme timing
→ mouth-pose timeline
→ StageActor performance
→ rendered host
```

Start with a compact 2D viseme set such as rest/closed, A/E, O/U, M/B/P, F/V, L, and wide/open. Later renderers can swap to skeletal 2D or 3D facial controls behind the same timing contract.

## Performance clip shape

A future choreography definition may become data-driven after enough real beats prove a common contract:

```js
{
  id: 'vaudevilleHook',
  durationMs: 2400,
  interruptible: false,
  cues: [
    { at: 0, action: 'face', value: 'confused' },
    { at: 300, action: 'sound', value: 'hook-sting' },
    { at: 500, action: 'prop.enter', value: 'vaudeville-hook' },
    { at: 850, action: 'move', x: -0.25, easing: 'snap-pull' },
    { at: 2100, action: 'stage.hidden', value: true }
  ]
}
```

Game/domain code should request semantic performance intent; rendering details remain downstream.

## Design rule

Comedy timing matters as much as geometry. Preserve beats, pauses, anticipation, reversals, callbacks, and foreground/background layering explicitly rather than burying them in unrelated event handlers and arbitrary timeouts.
