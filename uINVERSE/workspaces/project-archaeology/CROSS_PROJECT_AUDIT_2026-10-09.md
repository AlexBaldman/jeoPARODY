# Cross-project conversation routing and repository archaeology

Status: working audit; no extraction or canon promotion authorized.

## Rule
An idea's birthplace does not determine its project or repository ownership. Conversations are evidence, not code ownership. One conversation can reference multiple projects; one canonical decision should have one owner and multiple provenance links.

## Mixed conversation record: bellyBUTTon / jeoPARODY / project organization (2026-10-09)
Source: ChatGPT conversation discussing context compilation, bellyBUTTon website, Panda 001, Family/After Dark velvet curtain, product economics, and cross-project routing. Original conversation URL: not captured yet; add stable link when available. This record is a summary, not a verbatim transcript.

- **bellyBUTTon** (owner: AlexBaldman/bellyBUTTon): Panda 001; bellybutton-integrated temporary tattoo design; Family and optional After Dark product collections; vintage video-store velvet-curtain UI; party-pack hypothesis; demand-validation and manufacturing/safety gates. Brand and product ideas remain exploratory unless implemented or explicitly approved.
- **jeoPARODY** (owner: AlexBaldman/jeoPARODY): shared game/show runtime and host/stage choreography; repository archaeology; Needle Drop ownership review. Do not migrate bellyBUTTon product implementation into this repository.
- **uINVERSE shared knowledge system** (currently housed here, ownership subject to future architecture review): canonical graph, Context Compiler, bounded task packets, conversation routing, provenance, project classification, municipal maintenance checks and compounding ratchets. Keep shared tooling distinct from individual product features.

## Conversation routing contract (manual v0)
For each meaningful conversation, capture: source reference, timestamp, project tags, topic/insight, decision status (idea/proposed/approved/implemented/verified), canonical owner, related projects, relevant repo links, and next action. Link to the original rather than copying entire conversations across repositories. Unverified links or inferred decisions must be marked explicitly. If ownership is ambiguous, classify as NEEDS_REVIEW and do not create code in the current repo by default.

## Repository inventory snapshot
GitHub default-branch recursive tree scan on 2026-10-09: jeoPARODY main: 565 files; Jeopardish master: 393 files; neither tree truncated. This is a path inventory, not a runtime dependency audit.

| Candidate | Evidence | Classification | Next proof |
|---|---|---|---|
| Needle Drop | needle-drop.html; src/modes/needle-drop/ (core, presentation, services); tests/needle-drop/; scripts/export-needle-drop.py; scripts/needle-drop-runtime-check.mjs; docs/NEEDLE_DROP_ARCHITECTURE.md | INDEPENDENT_PRODUCT_CANDIDATE / NEEDS_REVIEW | inspect imports, assets, app entry, test and deploy contracts; compare existing repos before extraction |
| Archimedes Adventures | ICM/projects/archimedes/README.md; uINVERSE/atlas/entities/world/archimedes-adventures.md; uINVERSE/worlds/archimedes-adventures/world.json | CROSS_PROJECT_REFERENCE / NEEDS_REVIEW | distinguish legitimate world registry references from standalone product code |
| Brazillionaire | ICM/projects/brazillionaire/README.md | CROSS_PROJECT_REFERENCE / NEEDS_REVIEW | check whether documentation only or implementation exists elsewhere |
| Creative Room | Jeopardish creative-room.html, creative-room.js, creative-room.css | TOOL_OR_FEATURE / NEEDS_REVIEW | inspect ownership and integration before proposing relocation |
| PAO / Memorization | jeoPARODY src/components/pao/*; src/styles/pao.css; uINVERSE/atlas/entities/station/memorization-station.md | SHARED_CAPABILITY_CANDIDATE / NEEDS_REVIEW | inspect consumers and determine whether shared or native |

## Safe extraction protocol
1. Confirm the product's canonical owner and whether a destination repo already exists.
2. Inventory source, tests, assets, documentation, build scripts, imports, and deployment references.
3. Identify shared engine dependencies and decide whether to keep, extract, or adapt each.
4. Copy into a proposed destination without deleting source; preserve provenance and Git history where practical.
5. Run product tests and end-to-end smoke tests in destination.
6. Update source references and consumers; only propose deletion after verified parity and explicit review.

## Next automation slice
Build a non-destructive repository candidate scanner that reports suspicious standalone entrypoints and project-like subtrees with evidence, and an intake format for conversation-to-project links. It should not infer ownership from directory location or auto-promote candidates into the Atlas.
