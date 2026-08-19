# Sprite Foundry — Assets

## Canonical character targets

### Alex
- Type: human / creator avatar
- Source requirement: user-provided visual reference before likeness generation
- Initial outputs: portrait, turnaround, idle, talk, point, celebrate, host/cameo variants

### Archie / Archimedes Beckerman
- Type: small shaggy white dog; Maltese with Chihuahua and Pomeranian mix
- Canonical traits: floppy ears/hair, expressive dark eyes, black button nose, compact body, enormous curled plume tail, subtly suspicious expression
- Personality in motion: screw loose, sudden inappropriate confidence, odd ear behavior, invisible-phenomena reactions, manic victory poses
- Initial outputs: turnaround, idle, walk, run, jump, fall, land, sniff, suspicious stare, interact, celebrate

### Christopher Walken host archetype
- Type: guest-host character pack
- Initial outputs: turnaround, idle, clue-read, pause/ponder, gesture, reaction, celebrate

### Leslie Nielsen host archetype
- Type: guest-host character pack
- Initial outputs: turnaround, idle, deadpan read, confused beat, absurd reaction, gesture, celebrate

## Shared studio bird cast
Keep these modular and reusable across Jeopardish, jeoPARODY, Archimedes Adventures, and Cinematic Studio scenes:
- Gullian: seagull cameraman / autonomous camera operator
- Rickigeon: chaotic pigeon problem-solver
- Randers Pelicandy: pelican with absurd pouch inventory
- Jim LaHeron: authority/supervisor heron
- J-Rook: corvid performer / self-appointed hype-man

## Asset contract
The manifest is the stable contract between Sprite Foundry machines. Interfaces may change; asset identity and lineage should not silently change underneath them.

### Identity
- `schemaVersion`: version of the manifest schema, independent of the asset's own revision.
- `assetId`: stable logical identity for the asset family/state. Do not encode storage paths as identity.
- `version`: monotonically increasing asset revision.
- `project`: owning namespace (`shared` when intended for reuse across games).
- `character`: optional canonical character slug.
- `type`: semantic asset type such as `source`, `cutout`, `pose`, `sprite`, `animation`, `prop`, or `effect`.

### Provenance
- `sources`: immutable source references or parent asset IDs used to derive this artifact.
- `generator`: optional machine/tool identifier and version.
- `createdAt`: optional generation timestamp for auditing; never use it as identity.
- Original source material must remain preserved.
- Derived artifacts should be reproducible whenever practical.

### Geometry and compatibility
- `frameSize`: canonical pixel dimensions when raster output has a fixed frame.
- `anchors`: named pivots/baselines/sockets in canonical coordinates.
- `attachments`: compatible attachment/socket names or asset references.
- Future dimensional metadata may add units, world-space dimensions, orientation, bounding boxes, material zones, and confidence values without replacing this contract.

### Lifecycle
Use explicit lifecycle values so draft assets do not quietly become canon:
- `candidate`: generated or imported, not yet validated.
- `validated`: passes automated structural checks.
- `approved`: accepted as canonical production material.
- `deprecated`: retained for provenance but should not be selected by default.

### Example

```json
{
  "schemaVersion": 1,
  "assetId": "character.archie.idle.default",
  "project": "shared",
  "character": "archie",
  "type": "animation",
  "sources": ["character.archie.master.default@1"],
  "generator": "animation-loom@0.1.0",
  "styleGuide": "jeopardish-pixel-shared",
  "frameSize": [64, 64],
  "anchors": {
    "baseline": [32, 58],
    "center": [32, 32]
  },
  "attachments": [],
  "palette": "default",
  "version": 1,
  "status": "candidate"
}
```

## Deterministic naming
Storage names should be derived from manifest identity rather than invented independently by each machine. A future validator/registry implementation should own the canonical naming rule. Until that lands, examples in documentation are illustrative rather than a frozen filesystem API.

## Library slots

```text
assets/library/
  characters/<slug>/
    source/
    masters/
    cutouts/
    body-parts/
    expressions/
    poses/
    sprites/
    animations/
    costumes/
    accessories/
    palettes/
    manifests/
  shared/
    props/
    effects/
    cameras/
    palettes/
```

The library layout is a storage projection over the manifest model. Consumers should eventually request assets through the registry instead of constructing these paths directly.
