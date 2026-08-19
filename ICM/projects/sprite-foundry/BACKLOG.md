# Sprite Foundry — Backlog

This file is the explicit parking lot for architecture that is intentionally **not** part of the first implementation slices. Deferred ideas stay visible here until they are implemented, superseded, or deliberately removed.

## Implementation sequence

### Chunk 1 — Asset kernel
Build the smallest reusable backbone first:
1. Versioned manifest schema.
2. Manifest validator.
3. Deterministic asset naming owned by the registry contract.
4. `assets.get(query)` registry lookup instead of hard-coded consumer paths.
5. Basic provenance/parent linkage and lifecycle validation.

### Chunk 2 — Archie vertical slice
Prove the contract with one real character pipeline:
1. Archie reference-photo/source ingestion.
2. Transparent-background cutout with mask preservation.
3. Alpha/edge cleanup with halo detection.
4. Scale and registration normalization for baseline, pivot, sockets, and canonical canvas.
5. Structural QC.
6. Catalog/registry insertion and retrieval.

These two chunks are the next implementation targets. Everything below is future build-out.

## Future source intake and reference processing
- Multi-image source sets with explicit provenance per image.
- Reference ranking, duplicate detection, and source-quality scoring.
- Background-removal masks retained separately from rendered cutouts.
- Manual correction hooks for masks, contours, anchors, and registration.
- Orthographic/turnaround reference assembly.
- Reference-board/contact-sheet generation.
- OCR/metadata extraction where source material contains labels or notes.
- Human approval checkpoints before generated likeness assets become canonical.
- Rights/license/provenance metadata for externally sourced material.

## Future production machines
- Body-part separator for modular head/body/limb/tail/prop layers.
- Pose generator / Pose Mill for named canonical poses.
- Pixel Rasterizer that enforces the handcrafted Jeopardish pixel-art grammar.
- Contact-sheet / sprite-sheet compositor for 48/64/96px and future targets.
- Animation Loom / animation-strip builder with per-frame timing, events, transitions, and continuity checks.
- Accessory Press for wearable, held, and effect modules.
- Variant Combiner for compatible costume/accessory/palette/effect combinations.
- Stronger QC for palette rules, clipping, silhouette readability, continuity, anchor validity, and style-guide conformance.
- Manifest Stamper automation for identity, lineage, compatibility, lifecycle, and machine-version metadata.
- Batch processing and replayable machine chains.
- Caching of deterministic machine outputs.
- Selective regeneration based on changed sources or machine versions.

## Future art-direction capabilities
- Shared style-guide profiles with explicit palette, silhouette, pixel-cluster, outline, exaggeration, and readability rules.
- Character-specific style overrides that remain subordinate to the shared visual language.
- Palette generation, reduction, swapping, and validation.
- Expression libraries and reusable facial-state vocabularies.
- Pose libraries and reusable motion archetypes.
- Costume/accessory inheritance and compatibility rules.
- Effect layers that remain separable from character masters.
- Controlled 2D/2.5D/3D representation adapters using the same canonical identity.
- Alternate-resolution and alternate-renderer outputs from one approved canonical asset family.

## Future asset graph and orchestration
- Asset dependency graph answering: what made me, what do I depend on, where am I used, and what should regenerate if my source changes?
- Semantic asset events such as `source.registered`, `cutout.created`, `anchor.assigned`, `part.extracted`, `pose.created`, `sprite.rasterized`, `animation.built`, `qc.failed`, `qc.passed`, `asset.cataloged`, `asset.requested`, and `asset.served`.
- Scene-level dependency declarations through manifests.
- Provenance traversal and lineage visualization.
- Machine/version-aware invalidation.
- Queueing/orchestration only when real pipeline pressure justifies it; do not invent distributed infrastructure merely because The Mailroom has a charming union problem.

## Future character batches
- Alex likeness pack after user visual reference is supplied.
- Christopher Walken guest-host sheet.
- Leslie Nielsen guest-host sheet.
- Gullian studio/camera-operator sheet.
- Rickigeon studio-crew sheet.
- Randers Pelicandy studio-crew sheet.
- Jim LaHeron studio-crew sheet.
- J-Rook studio-crew sheet.
- Additional Jeopardish / jeoPARODY / Archimedes Adventures characters using the same canonical contract.

Named celebrity-inspired character work should remain layered above generic reusable host/character asset families so the core Sprite Foundry architecture never depends on a specific likeness or publicity-rights assumption.

## Future dimensional and fabrication-aware metadata
Extend canonical assets without replacing the base manifest contract:
- real-world/world-space width, height, depth, and units;
- origin/pivot and canonical orientation;
- bounding boxes;
- front/side/top semantics;
- surface/face labels;
- attachment points and sockets;
- material zones;
- openings and controls;
- collision proxies;
- inferred-measurement confidence/uncertainty;
- orthographic reference views;
- parametric construction descriptors;
- adapters toward 3D blockouts, physics bodies, UV/material maps, and fabrication-safe models.

Pixel art remains a representation of the canonical object, not dimensional truth.

## Future engine integration
- Cache/prefetch service-worker layer visualized through The Mailroom.
- Mailroom request visualization for cache hits, misses, failures, and routing.
- Cinematic Studio requests for character pose/expression/camera assets through the same registry.
- Gullian-backed diegetic camera controls for follow/lead/chase/orbit/reveal behaviors.
- Shared factories consumed by multiple games instead of copied implementations.
- Asset preloading/prefetch declarations at scene boundaries.
- Compatibility-aware accessory/costume resolution.
- Cross-project shared-library namespaces and package/version strategy.

## Future developer projections
All of these remain interfaces over the same semantic asset model:

### Machine Shop
- visual factory-floor view of machine chains;
- pipeline state, dependencies, failures, provenance, and replay controls;
- branch/recombine views for derived assets.

### Character Workbench
- side-by-side source references, masters, cutouts, body parts, sockets, expressions, poses, sprites, animations, accessories, palettes, and variants;
- approval/lifecycle controls;
- provenance inspection and comparison.

### Mailroom
- diegetic visualization of registry requests, cache hits/misses, prefetching, routing, failures, and retries;
- debugging projection only, never a second source of asset semantics.

### QA Lab / Responsive Torture Rack
- viewport/device matrix capture;
- pixel-ratio, orientation, and input-mode variation;
- network/timing/stress scenarios;
- visual-regression bundles;
- automatic routing of failures into reusable fixes/tests;
- preservation of useful accidental discoveries for the idea backlog.

## Future quality and testing
- Manifest/schema unit tests.
- Golden-file tests for deterministic naming and transforms.
- Alpha/halo regression fixtures.
- Registration/baseline/pivot assertions.
- Sprite-sheet layout checks.
- Animation continuity checks.
- Visual regression across viewport/device matrices.
- Round-trip provenance tests.
- Registry fallback/version-selection tests.
- Cross-project compatibility tests.

## Future performance and operational concerns
Only build these after the simple registry/pipeline demonstrates a need:
- worker pools and bounded concurrency;
- content-addressed caching;
- incremental rebuilds;
- remote/object storage adapters;
- background processing;
- resumable jobs;
- machine telemetry and timing;
- failure retry/dead-letter handling;
- artifact retention policies;
- build/publish packaging for shared asset libraries.

## Dev-debt rule
Every repeated manual correction should be evaluated for conversion into a validator, transform, reusable primitive, test, or machine. Bugs should leave behind stronger infrastructure whenever practical.

## Architecture guardrail
There is one canonical asset model. Machine Shop, Character Workbench, Mailroom, QA Lab, Cinematic Studio, games, and future editors are projections/consumers of it. Any feature that requires a second identity, provenance, lifecycle, or compatibility model should be redesigned before implementation.
