# 2026-08-15 Handoff — Trebek Audio Pipeline + Next Lead Domino

## Completed

The Trebek archival-audio work is committed on `main`.

Relevant commits:

- `d78b3a8` — define Trebek audio archive and transcription contract
- `68cdb44` — add non-destructive Trebek audio cataloger
- `9b770d3` — add local Trebek transcription worker
- `8f8c964` — add searchable Trebek archive index
- `7233a1b` — add Trebek archive readiness audit
- `13b45b2` — wire Trebek archive pipeline commands

The intended pipeline is:

```text
immutable source archive
→ inventory + hash + duplicate detection
→ local transcription
→ normalized transcript + timestamps/confidence
→ semantic classification/indexing
→ human verification
→ rights/runtime audit
→ searchable Host/VoicePack usage
```

Do not destructively rename or delete source audio. Human-readable aliases and runtime copies should be derived from preserved source records.

## Asset preservation rule

Code branches may be salvaged selectively and retired aggressively, but historical media/reference assets must be preserved and classified before branch retirement. Old Trebek audio, images, video references, question corpora, concept art, sprites, and similar source material are an asset-inventory problem, not branch clutter.

## Current verification gap

`scripts/runtime-state-check.mjs` already exists on `main` and performs a meaningful browser-level deterministic smoke pass across desktop/mobile, including splash, Full Board, Run Category, Settings, Classic mode, real question loading, asset MIME checks, host image decode, mounted-surface/state checks, navigation stability, and layout/overflow assertions.

Current `.github/workflows/ci.yml` does **not** run that checker. CI currently proves lint, tests, build, and a non-blocking Axe invocation. The Axe step uses permissive exit handling, so it is not proof of the playable production spine.

## NEXT LEAD DOMINO

**Turn `scripts/runtime-state-check.mjs` into a blocking production-browser CI gate.**

Recommended smallest cascade:

1. Start from current green `main` on a fresh focused branch.
2. Add/pin Playwright in the package/lockfile correctly.
3. Add a stable npm script for the runtime check.
4. In CI, build the app and serve `dist` on a deterministic local port.
5. Install the required Chromium browser in CI.
6. Run `runtime-state-check.mjs` as a blocking step against the built app.
7. Upload runtime screenshots/results on failure for archaeology.
8. Fix only failures exposed by that proof harness.
9. Once green, use the browser harness as protection while selectively extracting Stage/runtime goodness from `cleanup/production-readiness` and other donor branches.

Do not begin a broad Stage refactor before this gate is green. The browser proof is the safety rail that makes subsequent state normalization and branch salvage trustworthy.

## Architectural doctrine

- `jeoPARODY` remains the long-term canonical destination.
- `Jeopardish` remains a behavioral oracle/donor while parity is earned.
- Follow the Beam: smallest upstream blocker first.
- One owner per truth.
- Preserve aggressively; implement selectively.
- Asset sources are immutable specimens; metadata/search/runtime representations are derived.
- uINVERSE remains a pressure test and future projection layer, not today's rewrite target.
