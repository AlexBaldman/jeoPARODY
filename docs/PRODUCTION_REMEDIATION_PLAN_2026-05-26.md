# JeoPARODY Production Remediation Plan - 2026-05-26

Status: Active canonical stabilization roadmap  
Source audit: `../../JEOPARDISH_JEOPARODY_FULL_AUDIT_2026-05-26.md` in the parent coding folder  
Primary target: `/Users/alex/coding/jeoparody`  
Legacy source to mine deliberately: `/Users/alex/coding/jeopardish`

## Purpose

JeoPARODY remains the intended final product, but the current rebuild needs its safety barriers restored before it takes on more feature work. In the project's requested Jurassic Park metaphor, this plan brings the electric fences back online one enclosure at a time: boot, deployment content, gameplay integrity, trust boundaries, learning value, original identity, then expanded attractions.

The metaphor stops where execution starts. Each fence below is a small implementation chunk with:

- One dominant risk to eliminate.
- A tightly bounded file surface.
- Verification that must pass before the next fence begins.
- A commit/PR boundary so work stays reviewable and token-efficient.

## Rules Of Execution

1. Do not combine stabilization with broad visual rewrites or new modes.
2. Preserve both dirty repositories before rebasing, merging, cleaning, or replacing local work.
3. Treat `ARCHITECTURE.md` as the current runtime truth: static DOM, `src/main.js`, `GameEngine`, event bus, and service layer.
4. Give `GameEngine` ownership of game-state transitions; UI emits intent and renders results.
5. Keep audio and AI optional. Local play must initialize and remain usable without either.
6. Verify against a production preview, not only Vite development mode.
7. Add or tighten a test in the same chunk as each behavioral fix.
8. Do not expose unfinished modes as finished features.
9. Do not add public client-side provider secrets.
10. Do not ship uncleared third-party likeness, audio, visual, or dataset assets as a final commercial identity.

## Current Baseline

Verified on 2026-05-26:

| Area | Current result | Consequence |
| --- | --- | --- |
| JeoPARODY Jest tests | Pass: 6 suites, 58 tests | Unit foundation exists |
| JavaScript lint | Pass | Use as a gate |
| CSS lint | Pass | Prior documentation was stale |
| Vite build | Pass | Build completion alone is insufficient |
| Production asset delivery | Fail | Required question JSON is not in `dist` |
| Browser runtime on development server | Fail | Splash does not become playable |
| Browser runtime on preview server | Fail | Production path is not interactive |
| Dependency audit | 5 moderate fixable advisories | Schedule deliberate update |
| GitHub `main` state | Behind active local rebuild | Push only after P0 gates pass |

### Known Blocking Defects

| ID | Defect | Severity | Primary files |
| --- | --- | --- | --- |
| BOOT-01 | Audio initialization blocks application readiness before a user gesture | P0 | `src/main.js`, `src/init/services.js`, `src/services/soundManager.js` |
| BUILD-01 | Production artifact omits question/audio assets requested at runtime | P0 | `vite.config.js`, asset layout, `.github/workflows/pages.yml` |
| SCORE-01 | Revealed answers can earn normal score | P0 | `src/init/ui.js`, `src/core/GameEngine.js`, `src/core/scoring.js` |
| FLOW-01 | UI and engine both handle new-question requests | P1 | `src/init/ui.js`, `src/core/GameEngine.js` |
| TRUST-01 | Active rendering writes content through `innerHTML` | P1 | `src/init/ui.js`, `src/init/services.js`, AI/dialog components |
| TRUST-02 | Browser key query/local-storage path is unsafe for production | P1 | `src/init/services.js`, `SettingsModal`, provider docs |
| MODE-01 | Board/category modes are visible before data/scoring integration is complete | P1 | UI mode controls, `questionService.js` |
| LEARN-01 | Review Misses/shard recovery value remains in Jeopardish rather than core JeoPARODY | P1 product | Jeopardish experimental modules; JeoPARODY question/session work |
| ID-01 | Public identity and media carry provenance/likeness/licensing risks | P1 business | `assets`, branding, docs, release policy |

## Fence Sequence

| Fence | Restored capability | Start only after | Finish signal |
| --- | --- | --- | --- |
| 0. Preserve The Control Room | Recoverable source history and baseline evidence | Now | Preservation branches/commits and baseline record exist |
| 1. Restore Power To The Front Gate | App enters classic/board UI without optional service deadlock | Fence 0 | Browser smoke passes in dev and preview |
| 2. Feed The Grid | Production build contains runtime content it requests | Fence 1 | Preview asset assertions and gameplay load pass |
| 3. Repair Game-Control Interlocks | One clue per action and honest scoring | Fence 2 | Integration tests prevent duplicate/reveal scoring |
| 4. Seal The Observation Booth | XSS/key/dependency risks controlled | Fence 3 | Trust tests and documented provider boundary pass |
| 5. Restore The Learning Circuit | Review Misses and efficient deterministic content retrieval | Fence 4 | Full retrieval-practice loop works locally |
| 6. Illuminate The Original Park | Unified original host/world and provenance | Fence 5 | Approved original asset set and inventory |
| 7. Open New Attractions Selectively | Board, mnemonic, AI, and social modes | Fence 6 | Each mode earns its own gate |

## Fence 0: Preserve The Control Room

### Objective

Make current discoveries recoverable before any code correction changes history or loses experimental work.

### Why First

Both repositories are dirty and contain useful but divergent development lines. Jeopardish has a remote modular-engine line and a local shard/review line. JeoPARODY has major local rebuild work not represented on GitHub `main`.

### Chunk 0A: Preserve Jeopardish Lines

Work:

- Record `origin/master@8d61c1a` as the stable tested remote baseline.
- Create a local preservation branch/commit for the dirty question-shard, Review Misses, and cleanup experiments.
- Avoid merging the local line wholesale into remote modular-engine history.

Deliverables:

- Named preservation branch.
- Brief inventory of files to migrate later: review queue/session state, question bank, starter pack/index/shards, generator/validation scripts, useful documentation.

Verification:

```bash
git status --short --branch
git branch --show-current
npm run verify
```

Commit boundary:

- Preservation only; no product behavior changes.

### Chunk 0B: Preserve JeoPARODY Rebuild

Work:

- Save the current `cleanup/production-readiness` changes in coherent commits or a protected WIP branch before stabilization edits.
- Identify untracked concept art and runtime evidence as either reference material or future committed assets.
- Keep generated `dist/` and runtime screenshots out of source commits unless specifically documented as artifacts.

Verification:

```bash
git status --short --branch
npm test -- --runInBand
npm run lint
npm run lint:css
npm run build
```

Exit Gate 0:

- Both useful local states can be recovered from named commits/branches.
- The baseline failed browser check is recorded, so later fixes prove change rather than assumption.

## Fence 1: Restore Power To The Front Gate

### Objective

Make a fresh browser load reliably enter a playable interface.

### Defect Being Corrected

Current startup awaits audio activation before UI setup. Browsers restrict `AudioContext.resume()` until a user gesture, so optional sound prevents the application from becoming ready.

### Chunk 1A: Make Optional Services Non-Blocking

Scoped files:

- `src/main.js`
- `src/init/services.js`
- `src/services/soundManager.js`
- `scripts/runtime-state-check.mjs`
- Targeted tests as needed

Implementation direction:

- Initialize core question/game state and bind UI before awaiting optional audio.
- Do not call or await audio resume during initial boot.
- Add an idempotent `enableAfterUserGesture()` or equivalent sound activation path.
- Trigger activation from an existing explicit gesture such as start-mode click or first gameplay action.
- Keep failures muted/logged without failing game initialization.
- Bound any audio preload so absent media does not block interaction.

Explicit non-goals:

- No sound redesign.
- No new host audio package.
- No UI theme changes.

Acceptance tests:

```bash
npm test -- --runInBand
npm run lint
npm run build
npm run dev -- --host 127.0.0.1 --port 3000
BASE_URL=http://127.0.0.1:3000 npm run test:runtime
npm run preview -- --host 127.0.0.1 --port 4174
BASE_URL=http://127.0.0.1:4174 npm run test:runtime
```

Runtime assertions to include:

- Application exposes a ready/initialized signal within a bounded timeout.
- A start-mode click leaves the splash screen.
- Classic mode or board mode becomes visible.
- Audio permission failure does not stop interaction.

Commit boundary:

- `fix(runtime): do not block app readiness on audio activation`

Exit Gate 1:

- Development and preview browser smoke tests reach an interactive screen from a cold load.

## Fence 2: Feed The Grid

### Objective

Guarantee that the deployed artifact includes every content route required for the first playable release.

### Defect Being Corrected

`npm run build` succeeds while `dist` lacks runtime question and audio content. Preview routes intended to return JSON instead return application HTML fallback.

### Chunk 2A: Define The Deployable Content Contract

Decision required:

- Source archives can remain large and private-to-development.
- Initial deployment should include a compact starter pack, an index, only intended lazy shards, required original UI assets, and any cleared sound effects.

Deliverable:

- A short table in documentation listing source-only versus production-required assets.

Scoped areas:

- `assets/questions`
- `assets/audio`
- `public/` or Vite static-copy configuration
- `src/services/api/questionService.js`
- `src/services/soundManager.js`

### Chunk 2B: Package And Assert Runtime Assets

Implementation direction:

- Establish one supported build mechanism: move selected static content under `public/assets`, or implement a controlled copy/generation step.
- Do not copy all redundant TSV/CSV/JSON archives into production.
- Ensure runtime URLs work under GitHub Pages base-path rules.
- Extend or add an asset verification script that inspects `dist` after build.

Required assertions:

- `dist` contains starter clue content and its index/shards.
- Required asset URLs return JSON/audio/image rather than HTML fallback.
- A question can be loaded from `vite preview`.
- Service worker configuration does not cache incorrect fallback responses as data.

Suggested commands:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4174
BASE_URL=http://127.0.0.1:4174 npm run test:runtime
```

CI addition:

- Add build and preview/runtime validation before Pages deployment uploads `dist`.

Commit boundary:

- `fix(build): package and verify production gameplay assets`

Exit Gate 2:

- The built/previewed application loads real question content without source-tree access.

## Fence 3: Repair Game-Control Interlocks

### Objective

Restore deterministic gameplay and honest learning scores.

### Chunk 3A: Establish One Question-Flow Owner

Defect:

- `src/core/GameEngine.js` and `src/init/ui.js` both subscribe to `question:request-new` and load questions.

Implementation direction:

- UI controls emit user intent only.
- `GameEngine`, or a narrowly defined orchestrator called by it, obtains one question and emits the authoritative state change.
- Rendering reacts to state/event output rather than fetching additional content.

Tests:

- One click on New Clue calls question selection exactly once.
- One intent emits one loaded clue.
- Repeated actions do not overwrite in-flight question state unpredictably.

Commit boundary:

- `fix(game): centralize question selection in engine flow`

### Chunk 3B: Make Reveal State Score-Safe

Defect:

- The UI emits reveal activity, but engine scoring does not retain/use reveal state; `peekUsed` remains false.

Implementation direction:

- Add canonical engine action/event for reveal.
- Update current-question state with `showingAnswer` or `peekUsed`.
- Delegate scoring to canonical scoring logic with actual reveal state.
- Record a revealed question as study/review-worthy even if the user later types the answer.

Tests:

- Correct unrevealed answer earns expected points.
- Correct answer after reveal earns zero ordinary points or explicitly defined reduced/no-credit result.
- Reveal and miss are recorded for later review.
- Repeated reveal has no additional side effects.

Commit boundary:

- `fix(scoring): prevent normal credit after answer reveal`

### Chunk 3C: Hide Or Mark Incomplete Modes

Work:

- Until board/date/category flows use correct data and scoring, remove them from primary release navigation or mark them clearly experimental.
- Do not advertise placeholder run-category behavior as an MVP capability.

Commit boundary:

- `fix(product): gate unfinished modes from release navigation`

Exit Gate 3:

- A complete classic-mode session is deterministic, fair, and test-covered.

## Fence 4: Seal The Observation Booth

### Objective

Remove avoidable browser security risks before adding public AI or broader content.

### Chunk 4A: Replace Unsafe Rendering

Priority surfaces:

- Answer display in `src/init/ui.js` and `src/init/services.js`.
- Dialog and AI-output surfaces.
- Settings content populated from persistent storage.

Implementation direction:

- Render ordinary question, answer, prompt, and AI text with `textContent`.
- Only allow markup through a deliberately sanitized renderer if a real formatting requirement exists.
- Add tests with hostile strings such as HTML tags and event attributes.

Commit boundary:

- `fix(security): render gameplay and provider text safely`

### Chunk 4B: Remove Browser Secret Collection From Production

Implementation direction:

- Remove or disable query-string API-key capture and local-storage key persistence for the production app.
- Make proxy/local/fallback providers the only supported public paths until server-side provider integration exists.
- Document development-only provider behavior explicitly.

Tests:

- No production startup path consumes `gemini_key`, `claude_key`, or generic `key` from URL parameters.
- App remains playable when no provider is available.

Commit boundary:

- `fix(security): remove client-side provider secret paths`

### Chunk 4C: Dependency And Policy Cleanup

Work:

- Resolve the five current moderate fixable advisories deliberately.
- Add Content Security Policy appropriate for static deployment and selected network endpoints.
- Confirm service-worker/cache behavior does not obscure security or content fixes.

Commit boundary:

- `chore(security): update audited dependencies and browser policy`

Exit Gate 4:

- Core public runtime has no known active unsafe content rendering or browser secret-input path.
- Audit and security checks are recorded in CI or release checklist.

## Fence 5: Restore The Learning Circuit

### Objective

Move the highest-value educational mechanisms from Jeopardish into the stable JeoPARODY loop.

### Chunk 5A: Migrate Review Misses

Source to mine:

- Local Jeopardish `game-session.js`, `question-bank.js`, and related tests/documentation.

Product behavior:

- Record missed and revealed clue IDs locally.
- Offer a dedicated Review Misses mode after classic mode is stable.
- Keep storage local/private by default.
- Separate attempted recall from reveal/explanation.

Tests:

- Incorrect response creates one review entry.
- Revealed clue creates one review entry.
- Correct unrevealed clue is not erroneously queued.
- Review completion updates/removes/schedules according to a simple documented rule.

Commit boundary:

- `feat(learning): add local review-misses practice loop`

### Chunk 5B: Reconcile Shard Strategies

Source to mine:

- Jeopardish hash/id shard recovery for persisted clue IDs.
- JeoPARODY year/date shards for board generation.

Implementation direction:

- Use starter-pack content for instant first play.
- Use stable ID/hash lookup for Review Misses recovery.
- Use date/year/category indexes only when full-board mode is actually implemented.
- Avoid loading the full archive on app startup.

Performance assertions:

- First interactive gameplay does not wait for full archive load.
- A saved missed-clue ID can be deterministically fetched after reload.
- Production artifact includes only intended content and indexes.

Commit boundary:

- `feat(data): support deterministic lazy retrieval for practice history`

### Chunk 5C: Add Minimal Spaced Retrieval

Only after Review Misses is stable:

- Store attempt timestamps and result.
- Introduce a simple, transparent return schedule.
- Offer mnemonic/PAO assistance after attempted retrieval, not before.

Commit boundary:

- `feat(learning): schedule missed-clue retrieval practice`

Exit Gate 5:

- The app delivers a meaningful learning loop: attempt, judge, review, return, improve.

## Fence 6: Illuminate The Original Park

### Objective

Turn JeoPARODY's strongest visual concept into a coherent and defensible original product identity.

### Chunk 6A: Decide Name And Identity Contract

Work:

- Select the shipping product name and use it consistently.
- Define host name, silhouette, voice, palette, typography roles, and comedic boundaries.
- Keep the celestial theatre concept while removing recognizable real-presenter dependency.

Deliverable:

- A concise visual/voice bible and approved MVP asset list.

### Chunk 6B: Asset Provenance And License Register

Work:

- Inventory question data, fonts, sound, imagery, code licenses, names/logos, and generated assets.
- Classify each as source-only, approved production, replace, or requires counsel.
- Add an actual code license only after ownership and desired terms are deliberate.

### Chunk 6C: Build A Small Runtime Art Set

Work:

- Produce optimized original logo/title treatment, host expressions, background, controls, and sound effects for MVP.
- Replace mixed photographic/recognizable-host content in the playable release.
- Respect responsive clarity, contrast, reduced motion, and payload budgets.

Exit Gate 6:

- The playable release has a coherent original face and an auditable asset basis.

## Fence 7: Open New Attractions Selectively

The following expansions are allowed only after the prior gates pass. Each must be shipped behind its own complete loop and tests.

### Full Board

Required before exposure:

- Correct date/year/category index selection.
- Board cells enter the same engine/scoring/review lifecycle as classic clues.
- Used clues, completion, and accessibility all work.

### Category Runs And Study Mode

Required before exposure:

- Real progress behavior rather than placeholder interaction.
- Review Misses and explanation mechanics reused rather than duplicated.

### PAO And Memory Palace Tools

Required before exposure:

- Measured retrieval benefit: users attempt recall first and receive mnemonic assistance second.
- Persisted mappings and privacy policy are explicit.

### AI Host And Mnemonic Assistance

Required before exposure:

- Server-side secret boundary.
- Deterministic offline fallback.
- Factual clue/answer constraints.
- Safety/sanitization and response latency limits.

### Social And Leaderboard Work

Required before exposure:

- Stable scoring rules.
- Anti-cheat and identity/privacy assumptions documented.
- Local practice remains complete without login.

## Efficient Commit And Review Strategy

Use one narrowly themed commit or PR per fence chunk:

| Order | Change set | Why it is efficient |
| --- | --- | --- |
| 0A-0B | Preserve current lines | Prevents re-investigation and lost work |
| 1A | Non-blocking app initialization | Unblocks every browser-based verification |
| 2A-2B | Production content contract/build copy/check | Makes preview results trustworthy |
| 3A | Single clue-flow owner | Removes state ambiguity before feature work |
| 3B | Reveal/scoring integrity | Restores meaningful results and learning data |
| 3C | Mode visibility gating | Stops incomplete product claims cheaply |
| 4A-4C | Security boundaries | Prevents fixes from embedding unsafe surfaces |
| 5A-5C | Learning loop migration | Adds durable user value after platform is stable |
| 6A-6C | Original identity/provenance | Protects launchable brand and assets |
| 7+ | Expansion modes | Builds only on proven foundations |

Token-efficiency rules for implementation sessions:

- Open only the files in the current chunk plus their direct tests and contracts.
- Reuse already discovered evidence rather than repeating a full audit.
- Do not mix CSS/art cleanup into runtime or scoring changes.
- End each chunk with commands run, pass/fail status, remaining failure, and exact next fence.
- Update this plan's checkboxes/status table as gates change rather than writing new sprawling roadmap documents.

## Verification Ladder

Use the smallest adequate check while iterating, followed by the full gate at commit boundaries.

### Per Behavioral Edit

```bash
npm test -- --runInBand
npm run lint
```

### Per Styling Or Presentation Edit

```bash
npm run lint:css
npm run build
```

### Per Runtime Or Asset Fence

```bash
npm test -- --runInBand
npm run lint
npm run lint:css
npm run build
npm run preview -- --host 127.0.0.1 --port 4174
BASE_URL=http://127.0.0.1:4174 npm run test:runtime
```

### Per Release Candidate

- Run all prior checks.
- Confirm required JSON/audio/image content exists in `dist` and returns the expected type.
- Confirm no browser console errors on cold start and a short gameplay session.
- Check keyboard navigation, reduced-motion/audio independence, and small-screen layout.
- Run `npm audit` and document accepted/resolved advisories.
- Confirm asset/license/provenance register covers every production asset.

## Status Board

| Fence | Status | Owner/branch | Evidence |
| --- | --- | --- | --- |
| 0. Preserve the control room | Not started | TBD | Audit documents current divergence |
| 1. Restore power to front gate | Not started | TBD | Current runtime smoke test fails |
| 2. Feed the grid | Not started | TBD | Current preview JSON route returns HTML |
| 3. Repair game-control interlocks | Not started | TBD | Source audit identifies duplicate/reveal flows |
| 4. Seal observation booth | Not started | TBD | Source audit identifies unsafe boundaries |
| 5. Restore learning circuit | Not started | TBD | Jeopardish migration audit identifies sources |
| 6. Illuminate original park | Not started | TBD | Concept art exists; provenance pending |
| 7. Open attractions selectively | Blocked by prior fences | TBD | Modes remain staged |

## Definition Of Ready For Public MVP

JeoPARODY is ready for a public MVP release only when:

- A cold browser load becomes playable without AI or audio permission.
- The production artifact serves real content assets, not HTML fallbacks.
- One action selects one clue and the score cannot be improved by revealing an answer first.
- Missed/revealed questions support a real local review loop.
- Public runtime does not accept provider secrets in URL/local-storage UI paths or inject untrusted text as HTML.
- Incomplete modes are hidden or plainly experimental.
- The host/art/audio/content release set is coherent, original or cleared, and inventoried.
- Documentation reflects the runtime actually being shipped.

## Next Implementable Chunk

Begin with Fence 0 preservation, then execute Fence 1A only:

> Make sound activation deferred and non-blocking so a clean browser session reaches a playable screen, and lock that result into the runtime smoke check.

No mode work, art work, AI expansion, or learning migration belongs in that first repair commit.
