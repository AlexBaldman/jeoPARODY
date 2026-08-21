# Host Stage Choreography

The host performance system should evolve from whole-image movement into composable stage choreography with increasingly capable rigs, expressions, props, audio, and lip sync.

## Current primitive ownership
- `HostSystem`: identity, personality, mood, image selection, semantic host reactions.
- `HostStageActor`: responsive position, scale, movement, footer-rail occlusion, choreography, speech-bubble tail tracking.
- Footer: foreground Stage rail / occluder.

## Comedy beat registry
Treat these as named performance beats that can later be driven by richer rigs rather than one-off CSS hacks.

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

### Future rig-aware beats
Once the host has movable body parts, face controls, and layered sprite/mesh representations:
- independent head/torso/arm motion
- eye aim and blink timing
- eyebrow and mouth expressions
- prop attachment points
- hand gestures and pointing
- squash/stretch and anticipation poses
- walk cycles with foot planting
- partial occlusion by scenery
- procedural reactions assembled from pose fragments

## Audio + mouth synchronization
Target pipeline:

`semantic host line -> approved VoicePack clip or generated authorized voice -> phoneme/viseme timing -> mouth pose timeline -> StageActor performance -> rendered host`

For archival clips, transcription timestamps can seed word timing; a dedicated phoneme/viseme aligner should create mouth events. For generated speech, prefer providers that return speech marks/phoneme timing when available. Keep voice provenance/rights gates separate from animation eligibility.

Start with 2D mouth sprites or a small set of visemes (rest, A/E, O/U, M/B/P, F/V, L, wide, closed). This produces convincing sync without requiring a full facial rig. Later implementations can swap to skeletal 2D or 3D blendshapes behind the same performance contract.

## Performance clip contract
A future choreography definition should be data-driven:

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

Game logic should request semantic performance beats; rendering implementations remain swappable.

## Design rule
Comedy timing matters as much as geometry. Preserve beats, pauses, anticipations, reversals, callbacks, and foreground/background layering as explicit choreography data rather than burying them inside arbitrary timeouts.
