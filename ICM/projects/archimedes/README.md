# Archimedes

**Status:** SEED  
**Role:** character IP + platformer + cross-projection identity pressure test

## Identity

Archimedes is Alex's Maltese dog and the intended main character of a platformer. Preserve the character independently of any one renderer/game so future manifestations remain recognizably the same semantic entity.

```text
ARCHIMEDES
  ├─ identity: Maltese / protagonist / companion
  ├─ manifestations
  │   ├─ pixel platformer sprite
  │   ├─ illustrated story character
  │   ├─ 2D adventure avatar
  │   ├─ 3D character
  │   └─ cross-world cameo / NPC
  └─ assets
      ├─ sprite sheets
      ├─ portraits/concept art
      ├─ animations
      ├─ sounds
      └─ behavior/personality references
```

## Architectural pressure test

`CAST(archimedes)` should eventually resolve the correct manifestation for the current projection without changing the underlying character identity. A pixel platformer and an illustrated Zeke scene may use different representations of Archimedes while referencing the same semantic character.

This is a useful test for Stage/World separation: Stage owns manifestation/performance; the world graph owns identity and semantic state.

## Cross-world seed

A Zeke adventure may cast Archimedes as companion/troublemaker, including a playful seed where Archimedes becomes stranded higher in a transformed playground/tree level. Treat this as an optional story seed, not established canon.

## Next lead domino

Create a minimal character manifest and register the first real/concept references as Asset Specimens before implementing gameplay.
