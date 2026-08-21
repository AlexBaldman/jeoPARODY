---
status: canonical
owner: host-performance
updated: 2026-08-21
---

# Host Performance Architecture

The host should increasingly behave like a performer on a stage rather than a decorative image with occasional CSS animation.

## Ownership

```text
HostSystem
identity / personality / mood / image
        ↓
Host performance intent
        ↓
HostStageActor
position / scale / facing / occlusion / choreography geometry
        ↓
future rig + face + props + voice timing
```

Do not reintroduce parallel animation managers. New performance systems should compose through this ownership path or deliberately replace it.

## Choreography vocabulary

Named beats are reusable capabilities, not one-off event-handler tricks. Current and planned examples include:

- pace left/right;
- fake-stairs descent behind the footer rail;
- surprise pop-up after a comedic beat;
- angry walk-off left or right;
- reluctant return / repeated edge peeks;
- impossible-angle head peek;
- vaudeville hook removal;
- Apollo-style siren / shuffle-off;
- prop-driven gags;
- shoe-hands circular peek / impossible-body gag;
- chef's-kiss reaction;
- reaction families for correct, wrong, streak, timeout, awkward pause, confusion, celebration, and conspiracy detour.

The growing named-beat vocabulary lives in `CHOREOGRAPHY_CATALOG.md`.

## Performance timeline

The target representation is a sequence of timed cues rather than bespoke animation functions:

```js
{
  id: 'vaudeville-hook',
  cues: [
    { at: 0, action: 'face', value: 'confused' },
    { at: 300, action: 'sound', value: 'hook-sting' },
    { at: 500, action: 'prop.enter', value: 'vaudeville-hook' },
    { at: 850, action: 'move', x: -0.25 },
    { at: 2100, action: 'stage.hidden', value: true }
  ]
}
```

Do not extract a generalized timeline engine until several real performances prove the common contract.

## Rigging path

A sensible progression:

```text
whole image
→ layered sprite
→ rigged 2D host
→ head / torso / arms / hands / eyes / eyebrows / mouth
→ attachment points for props
→ reusable poses + transitions
```

The rig should preserve character identity while allowing different wardrobe, expression, prop, and animation packs.

## Lip sync

Convincing first-pass lip sync does not require a complex facial simulation. A small viseme set can drive mouth sprites:

```text
audio
→ transcript / alignment
→ phonemes
→ viseme groups
→ timestamped mouth poses
→ face rig playback
```

A practical early set can include neutral/closed, M-B-P, A/E, O/U, F/V, L, and wide/open shapes. Improve only when visual evidence justifies more detail.

For archival clips, transcription plus forced alignment can generate timings. For synthetic speech, an authorized voice provider may supply speech marks or phoneme timing directly.

## Voice / rights boundary

Voice selection and performance metadata must remain separate from permission to use a voice. The VoicePack/provenance layer should record source, rights status, permitted usage, attribution, consent/release information where applicable, and model provenance for synthetic voices.

A clip can be searchable and preserved while remaining ineligible for production use.

For the Trebek archive, semantic cataloging and lip-sync alignment are useful regardless of whether a particular clip or voice synthesis use is cleared for release.

## Semantic triggering

Game/domain code should emit facts such as `answer:evaluated`. Presentation logic may translate those facts into performance intent such as `celebrate`, `awkward-wrong`, or `walkoff` according to host pack, tone budget, repetition rules, and accessibility settings.

Domain code should never know that a vaudeville hook exists.

## Future extraction pressure

This system becomes especially valuable when multiple characters, hosts, or worlds use the same performance grammar. Until then, favor small explicit primitives and named choreography over a speculative universal animation engine.
