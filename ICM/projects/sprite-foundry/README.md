# Sprite Foundry

Status: ACTIVE

## Promise
Build a reusable asset-production machine shop for jeoPARODY and the shared game engine. Raw source images enter once; the system cuts out, cleans, normalizes, separates, registers, poses, pixelizes, animates, validates, catalogs, and routes production-ready assets into a shared library.

## Scope of this architecture PR
This PR establishes the Sprite Foundry architecture, asset contract, projections, and staged implementation plan. It intentionally does **not** implement the production machines yet.

The first implementation slice should stay deliberately small:

```text
MANIFEST SCHEMA
  -> VALIDATOR
  -> DETERMINISTIC NAMING
  -> REGISTRY LOOKUP
```

The first real asset-processing proof should follow as a separate vertical slice using Archie:

```text
SOURCE
  -> CUTOUT
  -> EDGE CLEANUP
  -> REGISTRATION
  -> QC
  -> CATALOG
```

Everything beyond those slices remains documented in `BACKLOG.md` as future build-out rather than disappearing from the architecture.

## Lead domino
Make asset identity, provenance, validation, naming, and lookup boringly reliable before adding higher-order production machines. Then prove the contract with one Archie asset flowing end to end.

Alex, Christopher Walken, Leslie Nielsen, the studio birds, and additional character families remain canonical future targets once the pipeline has been proven.

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

This full chain is the destination, not the required first implementation. Machines should be added only when the previous contract is stable enough to support them cleanly.

## One model, many projections
Machine Shop, Character Workbench, Mailroom, QA Lab, Cinematic Studio, and future editors are interfaces over the same canonical asset model. They must not grow separate identity, provenance, compatibility, or lifecycle semantics.

The metaphor may explain the machinery; it must not become competing machinery.

## Self-building rule
Whenever a recurring production problem is solved, prefer turning the solution into a reusable machine, function, test, validator, editor, graph operation, or factory. The engine should progressively acquire better hands and a larger MacGyver/Batman toolbelt.

## Shared-engine role
A complete game is itself a composable component assembled from reusable scenes, maps, actors, graphs, factories, cinematics, assets, systems, and tools. Sprite Foundry is one production subsystem inside that larger recursive engine.

## Do not
- create one-off character exports when a reusable machine would solve the class of problem;
- destroy original sources;
- flatten provenance;
- let UI/world metaphors invent a parallel asset model;
- let storage paths become canonical asset identity;
- bake costumes/accessories into every sprite if they can remain modular;
- silently diverge from the shared Jeopardish handcrafted pixel-art style guide.
