# DEV JOURNAL — Agent Cypher

> **MANDATORY HANDOFF LOG.** Read the newest entries before substantive work. Use `docs/README.md` to find current canonical owners. Before finishing meaningful work, add a concise newest-first entry describing what changed, what was proven, what remains unresolved, and the next lead domino.

This file is the project's asynchronous crew room across humans and agents. It owns **chronological engineering handoffs**, not architecture, product strategy, or the cross-project idea universe.

Durable concept/world material belongs in `ICM/`. Current priorities belong in `docs/MASTER_PLAN.md`. Runtime ownership belongs in `ARCHITECTURE.md` and the relevant canonical system document.

The long 2026-08-08 platform-thesis preamble that previously lived here is preserved at `docs/history/DEV_JOURNAL_PLATFORM_THESIS_2026-08-08.md` and in ICM where appropriate.

## Operating contract

1. Read `AGENTS.md`, then the newest journal entries.
2. Use `docs/README.md` to locate the one current owner for the domain being changed.
3. Trust verified code/tests over stale prose, but repair the canonical owner when reality changes.
4. Follow the highest-upstream real blocker before polishing downstream symptoms.
5. Preserve useful history/provenance without routing current implementation through superseded docs.
6. Keep Stage/presentation downstream of game/domain truth.
7. Run the proof appropriate to the risk. `npm run project:check` is the fast doctrine/deployment contract.
8. Leave a handoff.

## Current north star

```text
small trusted project control plane
        ↓
clear domain truth + explicit boundaries
        ↓
working vertical slices
        ↓
blocking evidence
        ↓
earned reusable abstractions
```

Current lead-domino ownership lives in `docs/MASTER_PLAN.md`. Do not duplicate the changing roadmap here.

## Handoff format

```md
### YYYY-MM-DD HH:MM ET — <agent/name> — <mission>
- **Read/inspected:**
- **Changed:**
- **Evidence/tests:**
- **Decisions:**
- **Unresolved:**
- **Next lead domino:**
- **Refs:** branch / PR / commit / docs
```

---

### 2026-08-24 12:46 ET — ChatGPT — make project documentation and deployment doctrine self-checking
- **Read/inspected:** current `main` after multiplayer/docs/Pages milestones; root README, `AGENTS.md`, `ARCHITECTURE.md`, `MASTER_PLAN.md`, Stage docs, ICM routing, package scripts, CI, Pages deployment workflow, historical migration docs, and open deployment/Firebase gates #46/#44.
- **Changed:** created `docs/README.md` as the human documentation router and `docs/canonical-docs.json` as the machine owner registry; added docs/deployment/project contract scripts and made `project:check` an early blocking CI gate; removed the executable legacy `npm run deploy → gh-pages -d dist` publishing path; rewrote stale mandatory `ARCHITECTURE.md` around the actual multi-mode domain/command/authority/adapter/Stage shape; repaired Stage so this repo is correctly canonical while old donor/convergence claims remain history; refreshed `AGENTS.md`, root README, and `MASTER_PLAN.md`; moved the old journal platform-thesis preamble into dated history so this journal can stay a chronological crew handoff.
- **Evidence/tests:** PR #49's first CI attempt passed the new project-doctrine gate on its first real run, then JS/CSS lint, all Jest tests, production build, and Firestore Security Rules emulator gate before continuing through the browser stack. Final exact-head CI evidence must be recorded before merge because later documentation commits retrigger the workflow.
- **Decisions:** use a **small trusted control plane over a large preserved archive**; do not mass-reorganize historical docs merely for tidiness; canonical docs own mutable truth, milestones preserve shipped proof, references/history preserve provenance; GitHub Pages Actions is the only source-controlled publisher; the package-level branch publisher is retired; do not delete the historical `gh-pages` branch until the Actions publisher is proven live through #46.
- **Unresolved:** final CI on PR #49 must pass after this handoff commit; the dead `gh-pages` development dependency remains in the lock/package dependency graph even though no executable publisher references it and can be pruned in a future lockfile-normalization pass; repository Settings → Pages → Source still needs owner verification as GitHub Actions (#46); Firebase project activation and phone↔laptop proof remain #44.
- **Next lead domino:** finish/merge this project-metabolism slice; prove Pages Source = GitHub Actions and exact live SHA via the self-verifying deploy; then activate real Firebase and run the two-device reconnect proof. Only after that should Head-to-Head enter the main menu.
- **Refs:** `chore/project-metabolism-docs`, PR #49, issue #47, `docs/README.md`, `docs/canonical-docs.json`, `scripts/check-docs-contract.mjs`, `scripts/check-deployment-contract.mjs`, #46, #44.

### 2026-08-24 10:18 ET — ChatGPT — harden Head-to-Head multiplayer transport, reconnect, and cloud authorization
- **Read/inspected:** PR #42 and current multiplayer source; the failed two-tab CI trace and runtime evidence; local command persistence, host authority, room/session recovery, Firebase gateway/rules/config; current Firebase Anonymous Auth, Security Rules, Emulator Suite, and TTL guidance; and the existing repository CI/runtime doctrine.
- **Changed:** replaced the race-prone shared local command array with independent durable command records and replay of unprocessed intent; added tab-scoped active-room recovery plus distinct invite-vs-resume URLs; proved host refresh after its own submission and guest refresh after reveal; added twelve-hour room/code/command/secret lifecycle metadata and source-controlled Firestore TTL field overrides; moved private adjudication into `hostSecrets/current`; added member IDs and stricter host/member command authorization; bounded and typed command payloads in Firestore Rules; added emulator-backed hostile-client rule tests; and updated the multiplayer architecture/deployment document.
- **Evidence/tests:** CI run #106 proved the repaired transport with JS/CSS lint, 94/94 Jest tests, Vite production build, main runtime, Needle Drop runtime, Head-to-Head create/join/shared-clue/reveal plus host+guest reconnect, axe audits, screenshots, and build artifacts. CI run #109 additionally passed the Firestore emulator rules suite before repeating the full browser regression stack successfully. Visual runtime evidence shows converged host/guest result screens after reconnect.
- **Decisions:** simultaneous independent answers remain the v1 multiplayer mechanic; raw answer/adjudication data stays private until atomic reveal; durable commands are append-only intent records; active-room recovery is tab-scoped; invite links carry only human room codes; room cleanup uses TTL but authorization rejects expired records immediately; host authority remains acceptable only for casual proving play; presence/heartbeat work is deferred until a real cross-device session proves it necessary; Firebase project binding/credentials remain outside source control.
- **Unresolved:** select/create the real Firebase project, enable Anonymous Auth, provide the Vite Firebase environment values, deploy rules + TTL/index configuration, and run a real phone↔laptop cloud session including host and guest reconnect. The repository-level legacy GitHub Pages publisher warning from earlier passes also remains an owner/settings concern.
- **Next lead domino:** configure the real Firebase project and run the two-device cloud proof. Only after that passes should Head-to-Head be promoted into the main menu; use observed disconnect behavior to decide whether presence infrastructure is actually warranted.
- **Refs:** `feat/head-to-head-room-codes`, PR #42, `docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md`, CI #106/#109.

### 2026-08-23 — Codex — prove the Needle Drop Show Director boundary
- **Read/inspected:** the 1.3 deterministic session loop; canonical Stage, host choreography, architecture, ICM, and platform doctrine; profile, recorder, renderer, audio, and browser contracts; and desktop/mobile/finale capture evidence.
- **Changed:** introduced a sanitized semantic show-event map after accepted reducer transitions; added a deterministic `ShowDirector` that emits restrained captioned host calls and semantic scene requests; added short original procedural stings behind an independent persistent show-sound preference; moved the local session recorder onto the same privacy-safe event spine; and taught the renderer/runtime checks to prove wrong, steal, finale, mute, and reload behavior.
- **Evidence/tests:** 78/78 repository tests; focused Director/event/audio/profile/markup coverage; zero Needle Drop lint errors; zero CSS lint findings; eight-clue rights validation; production Vite build; and blocking browser runs for desktop four-player steal, 390px mobile, show-sound persistence, and complete Quick Hit finale.
- **Decisions:** `core/round.js` remains the only gameplay-truth owner. Events contain bounded facts, never typed answers or mutable state. Comedy spends only the host channel in this slice. Every sound cue has visible caption parity, and Web Audio failure cannot block play.
- **Unresolved:** GitHub Pages still has a repository-level legacy branch publisher enabled; after merge the canonical Actions deploy must finish last until an owner selects **Settings → Pages → Source: GitHub Actions**.
- **Next lead domino:** attach one small visual Stage consumer—podium reaction or camera emphasis—to the proven semantic scene request, then blind-test room comprehension before considering phone `InputGateway` calibration.
- **Refs:** `feat/needle-drop-show-director`, `docs/NEEDLE_DROP_SHOW_DIRECTOR_2026-08-23.md`.

### 2026-08-23 — Codex — make Needle Drop replayable and measurable
- **Read/inspected:** the deployed 1.2 Needle Drop loop, reducer/presentation/audio/profile boundaries, browser runtime contract, second-pass roadmap, canonical migration doctrine, and mobile/desktop visual evidence.
- **Changed:** added deterministic Quick Hit / Side A / Full Crate session projections; safe seed/query normalization; same-crate and fresh-crate flows; format-aware personal-best migration; a local-only semantic `SessionRecorder`; finale receipts and copyable result text; expanded responsive presentation; and a complete three-record browser run.
- **Evidence/tests:** 70/70 repository tests; 30/30 Needle Drop tests; zero Needle Drop lint errors; zero CSS lint findings; eight-clue rights validation; production Vite build; desktop 4P steal, 390px mobile, and complete Quick Hit browser flows.
- **Decisions:** `core/round.js` remains the only gameplay-truth owner. A session is a deterministic projection of a cleared immutable package. The recorder observes accepted transitions, stores no typed answers, and sends nothing off-device.
- **Unresolved:** GitHub Pages still has a repository-level legacy branch publisher enabled; after merge the canonical Actions deploy must finish last until an owner selects **Settings → Pages → Source: GitHub Actions**.
- **Next lead domino:** run blind Quick Hit and Side A sessions, then use observed dispute/room-reaction evidence to choose between a host/sting director and the phone `InputGateway` calibration slice.
- **Refs:** `feat/needle-drop-third-pass`, `docs/NEEDLE_DROP_THIRD_PASS_2026-08-23.md`.

### 2026-08-20 — Codex — close responsive host-stage review findings
- **Read/inspected:** PR #32 head and the latest CodeRabbit review threads for host-stage timing, personality-change geometry ownership, and the stairs dispatch.
- **Changed:** moved personality-change scale timing into `HostStageActor`; made celebrate/surprise completion wait for both stage and mood work; added a reduced-motion-aware `fakeStairs()` beat and routed the stairs animation to it.
- **Evidence/tests:** verified the patch against the current PR head and preserved the existing responsive/reduced-motion ownership boundaries; GitHub CI remains the execution proof after push.
- **Decisions:** kept the fix confined to the two host owners; used composable `scale`/`translate` animation properties so personality and stairs beats do not overwrite stage movement transforms.
- **Unresolved:** none within the three reviewed findings.
- **Next lead domino:** confirm PR checks and protected desktop/iPhone runtime viewports remain green.
- **Refs:** `work/footer-stage-host-motion-live4`, PR #32.

### 2026-08-09 15:58 ET — ChatGPT — audit and integrate current repo work
- **Read/inspected:** current `main`, recent commits, GitHub Actions, open/diverged branches, production-readiness convergence work, Devin audit/refactor branches, AI-provider branch, CSS/UI branches, old Mac branches, and the Sprite Foundry ICM branch.
- **Changed:** restored the blocking CI verification path on `main` through PR #29; added ESLint flat config and actionable Stylelint annotations; repaired undefined AI fallback and host-animation sound wiring; normalized token CSS; integrated the Sprite Foundry ICM corpus onto a fresh branch and registered it as `PRESSURE_TEST` rather than blindly inheriting `ACTIVE` status.
- **Evidence/tests:** PR #29 passed JS lint, CSS lint, Jest tests, Vite build, accessibility step, and artifact upload; squash commit `0e39a9a` then passed the same full CI pipeline on `main`. GitHub Actions is the authoritative execution environment for this pass because the local sandbox could not resolve github.com for a clone.
- **Decisions:** do not wholesale-merge heavily diverged branches. `cleanup/production-readiness`, Devin refactor work, `review/css-ui-fixes`, Mac branches, and the old AI integration branch are salvage quarries/oracles until individual behaviors are re-proved against current `main`. `fix/css-audit-fixes` is already fully behind main. Sprite Foundry is valuable context, but factory implementation remains gated by the canonical runtime/deterministic-spine work.
- **Unresolved:** current CI proves lint/tests/build, not a real blocking browser playthrough; GitHub Actions also warns that checkout/setup-node v4 target deprecated Node 20 runtimes. Several historical branches contain useful features that still need capability-by-capability archaeology rather than merge-by-branch thinking.
- **Next lead domino:** add a blocking deterministic browser smoke path that boots the production build and exercises one game spine; then use that proof harness to port the smallest Stage/runtime slice and selectively mine production-readiness/Jeopardish goodness.
- **Refs:** `main@0e39a9a`, PR #29, `integrate/sprite-foundry-context`, `ICM/projects/sprite-foundry/*`.

### 2026-08-08 — ChatGPT — mine design cypher into ICM
- **Read/inspected:** full active conversation context; existing glossary/journal; current repo root/docs; Zeke concept boards and real-life playground reference supplied in conversation.
- **Changed:** established `ICM/` as the Immortal Context Map and scaffolded durable project records for uINVERSE, You in Verse, Stool Samples, ALgoRHYTHM B, Brazillionaire, Zeke Discovers, Archimedes, Excavation Station, and the self-building Asset Library.
- **Evidence/tests:** documentation-only pass; no runtime behavior changed.
- **Decisions:** preserve aggressively but implement selectively. ICM folder existence is not authorization for scope creep. Zeke and Archimedes become explicit future Stage/world-identity pressure tests. Asset generation/import should eventually auto-register provenance and semantic metadata.
- **Unresolved:** actual conversation image bytes are not yet committed into the repo asset library; manifests/validator are intentionally not implemented yet. Memory Universe deserves its own ICM record in a later archaeology pass using its fuller existing corpus rather than a shallow stub.
- **Next lead domino:** use JeoPARODY's proven runtime and Stage boundaries to decide which cross-project concepts deserve the next concrete pressure test rather than implementing the whole universe at once.
- **Refs:** `ICM/README.md`, `ICM/projects/*`, `docs/history/DEV_JOURNAL_PLATFORM_THESIS_2026-08-08.md`.
