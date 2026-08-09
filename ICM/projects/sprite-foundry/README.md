# Sprite Foundry

Status: PRESSURE_TEST

## Promise
Build a reusable asset-production machine shop for jeoPARODY and the shared game engine. Raw source images enter once; the system cuts out, cleans, normalizes, separates, registers, poses, pixelizes, animates, validates, catalogs, and routes production-ready assets into a shared library.

## Lead domino
Prove one deterministic, reproducible vertical slice from source reference to validated manifest-backed game asset before expanding the factory surface. Candidate character targets are Alex, Archie / Archimedes Beckerman, Christopher Walken, and Leslie Nielsen, but the first proof should use the smallest legally and technically clean specimen available.

## Machine contract
Every machine accepts a typed asset manifest and emits files plus updated metadata. Machines should be composable, branchable, replayable, cacheable, and provenance-aware.

```text
SOURCE INTAKE
  -> CUTOUT
  -> ALPHA / EDGE CLEANUP
  -> SCALE + REGISTRATION
  -> BODY-PART SEPARATION
  -> POSE GENERATION
  -> PIXEL RASTERIZATION
  -> ANIMATION LOOM
  -> ACCESSORY / VARIANT COMBINER
  -> QC
  -> MANIFEST STAMPER
  -> MAILROOM / ASSET LIBRARY
```

## Self-building rule
Whenever a recurring production problem is solved, prefer turning the solution into a reusable machine, function, test, validator, editor, graph operation, or factory. The engine should progressively acquire better hands and a larger MacGyver/Batman toolbelt.

## Shared-engine role
A complete game is itself a composable component assembled from reusable scenes, maps, actors, graphs, factories, cinematics, assets, systems, and tools. Sprite Foundry is one production subsystem inside that larger recursive engine.

## Scope guardrail
This ICM record preserves the factory architecture. It does not authorize a universal asset platform before the current jeoPARODY runtime and deterministic game spine are healthy. Promote this project beyond `PRESSURE_TEST` only after the first end-to-end asset specimen is reproducible and consumed by the canonical runtime.

## Do not
- create one-off character exports when a reusable machine would solve the class of problem;
- destroy original sources;
- flatten provenance;
- bake costumes/accessories into every sprite if they can remain modular;
- silently diverge from the shared Jeopardish handcrafted pixel-art style guide.
