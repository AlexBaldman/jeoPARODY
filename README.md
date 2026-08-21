# JeoPARODY

A comedic, AI-enhanced trivia and learning game built as a programmable game-show world.

JeoPARODY is the **long-term canonical product runtime**. The older Jeopardish repository remains a behavioral oracle/donor while proven capabilities are deliberately absorbed.

## Run it

```bash
npm install
npm run dev
```

Production verification:

```bash
npm run lint
npm run lint:css
npm test -- --ci
npm run build
npm run runtime:check
```

The CI pipeline builds the production app, boots it in Chromium, exercises the protected gameplay spine across desktop and iPhone-class viewports, and runs an accessibility audit.

## Current shape

```text
input / UI
    ↓
GameEngine + domain truth
    ↓ semantic events
services / performance logic
    ↓
Stage / host / audio / media / UI
    ↓
production browser
```

The current Stage work treats the host as an actor rather than a fixed decoration: responsive positioning, footer-rail occlusion, choreography, and speech-bubble attribution are owned by `HostStageActor` while `HostSystem` owns host identity/personality/mood/image.

## Project map

- **`AGENTS.md`** — first read for any human or AI contributor; engineering doctrine and workflow.
- **`DEV_JOURNAL.md`** — current asynchronous handoff / lead domino.
- **`docs/README.md`** — canonical documentation map.
- **`docs/architecture/`** — current runtime contracts and ownership.
- **`docs/product/`** — vision, roadmap, migration direction.
- **`docs/reference/`** — focused subsystem references.
- **`docs/archive/`** — historical evidence, never current authority.
- **`ICM/`** — durable ideas and cross-project pressure tests that may not be implementation commitments.

## Useful commands

```bash
npm run dev              # Vite dev server
npm run build            # production build
npm run preview          # preview dist
npm test                 # Jest
npm run lint             # JavaScript lint
npm run lint:css         # CSS lint
npm run runtime:check    # blocking production browser spine
```

Trebek archival-audio tooling:

```bash
npm run trebek:inventory
npm run trebek:transcribe
npm run trebek:index
npm run trebek:audit
```

See `docs/reference/TREBEK_AUDIO_ARCHIVE.md` for preservation, transcript, rights, and runtime-eligibility rules.

## Working philosophy

The memorable shorthand is intentional:

- **Follow the Beam** — solve the highest-upstream verified blocker.
- **One Owner per Truth** — avoid parallel authoritative systems.
- **Bus the Table** — capture cheap, safe cleanup while already passing through a subsystem.
- **Preserve the Fossil** — recover unique context/assets before cleanup.
- **Main Stays Boring** — keep canonical history green and deployable.
- **Build the System That Builds the System** — extract reusable machinery after recurrence proves the pattern.

Definitions live in `docs/reference/GLOSSARY.md`.

## AI and secrets

Core gameplay must remain playable without an AI provider. Browser-stored or URL-injected provider secrets are legacy patterns, not the desired production architecture. See `docs/reference/AI.md`.

## Broader vision

JeoPARODY is also the proving ground for a reusable semantic-performance grammar that may later support other worlds and projections. Those ideas live in ICM so they can survive without hijacking current implementation scope.

See `docs/product/VISION.md` and `ICM/README.md`.

## Legal / rights

This project contains parody/tribute concepts and historical reference material. Names, likenesses, recordings, trademarks, and other third-party material may require separate rights review before commercial/runtime use. Asset existence does not imply permission. Preserve provenance and eligibility metadata.
