# JeoPARODY Master Plan

**Status:** CANONICAL ROUTING DOCUMENT  
**Updated:** 2026-10-31
**Rule:** this file owns current priorities and routing. Specialized documents own their domains.

JeoPARODY is the canonical trivia product. The wider learning/game universe is a portfolio of independent products. Earn abstractions through working vertical slices. Do not design the universal engine in advance because software already has enough monuments to optimism.

## 1. Current proven baseline

The important upstream sequence is now:

| Slice | Proof |
|---|---|
| Head-to-Head reconnect-safe foundation | PR #42 / `46d8f78` |
| Documentation milestone + routing | PR #43 / `a3b4c18` |
| Firebase-ready, exact-live-SHA Pages deployment | PR #45 / `32b702c` |
| Self-checking docs/deployment doctrine | PR #49 / `6443a8c` |
| Shared canonical answer judge | PR #61 / `c3f8a24` |
| Explicit Main scoring + slim GameEngine | PR #62 / `31e9a27` |
| Alternate game stack retired | PR #63 / `ac7b3ab` |
| Shadow state + obsolete host stack retired | PR #64 / `e3617a0` |
| Node 24 CI/Pages modernization | PR #65 / `adc8834` |

The source-controlled proof wall covers project doctrine/security, source reachability, JS/CSS lint, unit/integration tests, production build, Firestore Security Rules, browser boot, Main Game runtime, Needle Drop runtime, Head-to-Head host/guest reconnect, blocking accessibility audits (including Main reveal state), and captured runtime evidence. The September solo repair changes axe from reporting-only to a failing check on violations.

The September second-opinion review disproved the earlier operational cutover claim: a GitHub-managed branch/Jekyll publication could finish after the custom publisher, leaving raw `src/` entrypoints and no `build-meta.json`. A successful short live check did not establish one publisher. Historical milestone rows above record earlier evidence, not present certification.

The release repair makes `deploy-pages.yml` call the full reusable CI workflow, which builds, stamps, exercises and uploads one artifact. Deployment requires that gate and `build_type=workflow`; live checks verify bundled JavaScript plus Main/Needle Drop gameplay. These source changes do not change repository settings or certify an unmerged release.

Before declaring cutover complete, the repository owner must set **Settings → Pages → Source → GitHub Actions**, require the PR **CI / build-test** check on `main`, then obtain a successful main release and live browser proof. A non-Actions Pages setting now fails deployment with an actionable error.

**Current cloud boundary:** the production `VITE_FIREBASE_*` repository variables were last proven absent, so the deployed Head-to-Head path remains intentionally in local proving mode until issue #44 activates Firebase.

**Current security baseline:** the blocking audits reject critical advisories. October 31 CI reported five high-severity production dependency advisories and no critical advisories; dependency remediation remains follow-up work. Earlier zero-advisory evidence is historical. Provider service credentials stay server-side. Firebase web configuration is intentionally client-visible configuration, not a secret.

### Bounded user-directed product correction — Needle Drop doorway

The 2026-08-26 first-time-player audit found that Needle Drop's technically proven loop asked players to identify invented titles, buried the primary action below setup, and described the premise indirectly. A focused product correction replaces the default crate with recognizable public-domain compositions in original performances, four authored choices, a plain-language promise, compact setup disclosure, and an above-the-fold listen action. This is a bounded repair to an already-public proving mode; after production browser proof, priority follows the release sequence below.

### October 31 release and mobile review

The October 31 review began at `f931ce6` (PR #73). Release/solo repairs #71 and
#72 and the product-boundary work #73 have landed. The remaining release
failure is measurable: [CI run 37890450546](https://github.com/AlexBaldman/jeoPARODY/actions/runs/37890450546)
passes build, security/rules, Main, Needle Drop and local Head-to-Head, then
fails axe's `label-content-name-mismatch` rule on the Classic start, Options
and Show Answer controls. Remove redundant names that contradict visible text;
keep the blocking audit enabled.

The existing public cabinet at
https://alexbaldman.github.io/Jeopardish/ is a separate preserved deployment.
Its October 11 `920943c` release passed validation and deployment; the later
WebKit canary timed out clicking Ask Host. A red overall run therefore does not
mean the mobile repair was never published. Fresh October 31 phone-size
observations show the larger host. The October 31 failed-job rerun reproduced the Ask Host timeout. Its root cause
remains unresolved; repeated retries are not a repair.

Ship bounded mobile/readability and accessibility repairs now. Preserve the
existing cabinet URL during canonical release certification; its live role
is not permission to revive a second canonical game architecture. Port its
host-size, mouth-anchor and fullscreen acceptance fixtures against current
owners before choosing an old-URL transition.

The canonical phone input also has a 14px override and unconditional
new-clue focus. Keep phone answer text at least 16px and let touch players
open the software keyboard themselves. The menu also registered two anonymous
hamburger handlers, so a single tap opened and immediately closed it. Keep one
menu owner with explicit close/Escape/focus behavior and test real clicks.
Define the missing panel/backdrop tokens in the existing token owner so the
backdrop cannot intercept the drawer's close button.
Wire the existing Settings modal to those controls and keep unimplemented menu
candidates hidden. The newly covered 375×667 viewport exposed host/control
intersection; reserve a separate horizontal lane for controls on short phones. Production runtime proof must exercise
touch capabilities and a short 375×667 phone as well as tall phones.

Only #75's small sound-button accessible-name repair is reused for this release;
its broader behavior remains separate. PR #75 remains a draft finite-session candidate; do not wholesale-merge its
controller or treat its presence as released behavior. Context/compiler #70,
companion #74, provenance #76 and image-edit #34 remain independent work.
Older audit PRs #26/#27 preserve historical evidence rather than blocking a
mobile release. No branch, asset or stored player data is retired by this pass.

## 2. Convergence 2.0 is complete

Issue #60 was a bounded interruption before Firebase, not a new eternal phase of civilization.

It delivered:

```text
ONE shared correctness kernel
        ↓
explicit mode scoring ownership
        ↓
smaller Main Game domain owner
        ↓
retired alternate game + validator architecture
        ↓
retired shadow state + obsolete host architecture
        ↓
classified remaining dormant/reference source
        ↓
Node 24 proof wall
```

PRs #63 and #64 alone removed roughly **5,764 lines** of duplicate architecture while the full proof wall remained green.

The completed capability/disposition record is [`CONVERGENCE_2_CAPABILITY_MATRIX_2026-08-25.md`](CONVERGENCE_2_CAPABILITY_MATRIX_2026-08-25.md). Episode, Study/learning ledger, HostPack/HostPerformanceDirector, media preflight and localization remain valuable **focused follow-ups**, not blockers to the current product proof.

Do not start another cleanup campaign merely because source reachability still reports intentionally dormant tooling/reference files. Issue #58 owns later repository archaeology.

## 3. One owner per truth

| Domain | Owner |
|---|---|
| Repository entrypoint / playable surfaces | `README.md` |
| Agent operating rules | `AGENTS.md` |
| Documentation routing / roles | `docs/README.md` |
| Current priorities / next lead domino | `docs/MASTER_PLAN.md` |
| Runtime architecture / ownership boundaries | `ARCHITECTURE.md` |
| Chronological engineering handoffs | `DEV_JOURNAL.md` |
| Head-to-Head multiplayer | `docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md` |
| Needle Drop | `docs/NEEDLE_DROP_ARCHITECTURE.md` |
| Stage / presentation boundary | `docs/STAGE_RUNTIME_SYSTEM.md` |
| AI provider credential boundary | `docs/AI_PROVIDER_SETUP.md` |
| Completed Convergence 2.0 record | `docs/CONVERGENCE_2_CAPABILITY_MATRIX_2026-08-25.md` |
| Cross-project concepts | `ICM/README.md` + `ICM/projects/*` |
| Shared vocabulary | `docs/IMMORTAL_DEV_GLOSSARY.md` |

Links beat copies. When reality changes, update the smallest owner and leave a journal handoff.

## 4. Current lead domino: one verified release and a correct solo loop

1. Complete the remaining accessibility/mobile repair on top of merged #71/#72/#73; verify Pages/check settings and the exact tested public artifact. A successful merge or build alone does not certify publication.
2. Establish the product boundary: disconnect dormant PAO from trivia, prepare Needle Drop's standalone export with its tests, and preserve existing public URLs until a replacement passes proof. PAO belongs to Memorization Station; LoadBearing remains an independent Godot project outside this runtime.
3. Finish one finite, authored trivia session: reviewed clues and aliases, explicit progress and ending, restart, deterministic offline fallback, coherent desktop/phone art direction, and a complete-playthrough browser test. Port Episode data and acceptance fixtures only as needed; do not transplant its controller.
4. Make Head-to-Head commands round-bound, replay-safe and atomic across public state, private answers and acknowledgment. Prove all five rounds and failure recovery before Firebase #44 activation and physical phone ↔ laptop proof. This is a separate multiplayer shipping gate, not a dependency of a clearly labeled solo release.
5. Add a compact missed-clue replay only after the solo product ships. Keep durable learning/PAO ownership in Memorization Station; define an explicit result export only when that product can consume it.

Repository archaeology (#58), context compiler (#70), Atlas expansion, new generalized kernels and broader host/voice/localization work remain deferred. Read donors only for a named acceptance behavior. Stop after its source, reachable caller, fixture and dependencies are understood; no parity campaign.

### Product boundaries and retirement gates

- **JeoPARODY:** canonical trivia source. Jeopardish is a frozen donor/reference recommendation; no archive setting or branch deletion has been performed.
- **Needle Drop:** independent music game; [its architecture owner](NEEDLE_DROP_ARCHITECTURE.md#standalone-extraction) owns the export procedure. Keep the current route as a temporary compatibility surface. Remove its source/build/test entries only after the destination owns equivalent proof and an intentional old-URL transition.
- **PAO:** preserved in `src/components/pao/` and `src/styles/pao.css` as dormant Memorization Station donor material. The Main import, overlay and CSS inclusion are removed. Do not erase `pao_decks` storage. A future trivia learning feature must earn its own acceptance case.
- **LoadBearing:** preserved at `AlexBaldman/Jeopardish@931790c942a37ba01e7e4ef97942289b2fa2094c`, subtree `apps/loadbearing`. Extract that project and adapt its Godot workflow; never merge the surrounding branch into trivia for this purpose.
- **uINVERSE/Stations:** preserve the creative vocabulary and provenance. A Station is a domain/navigation concept, not automatically a repository or service. A Factory is a bounded asset/content workflow with a reviewed output, not a universal runtime prerequisite. Existing Atlas/ICM material remains reference/context; it does not set a second product roadmap. Do not expand these systems on the trivia shipping path.

No cleanup deletes the only verified copy. Preserve the source SHA, content/asset provenance, tests, storage behavior and inbound URLs; prove the destination; switch ownership; retire the old production surface last.

### Firebase activation after command integrity

**Activate and automatically certify real Firebase Head-to-Head multiplayer.** No new multiplayer features before this proof.

Required production web configuration:

```text
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
```

Execution order:

1. Select/create the production Firebase project.
2. Enable Firebase Anonymous Authentication.
3. Add the web configuration as repository Actions variables.
4. Deploy `firestore.rules` and `firestore.indexes.json`; confirm TTL policy acceptance.
5. Trigger the canonical Pages deployment.
6. Require the deployment to report `multiplayerTransport = firebase` and pass independent-user cloud runtime certification.

The automated cloud proof uses isolated browser contexts so a silent fallback to `LocalRoomGateway` cannot counterfeit success.

## 5. After automated Firebase proof

### Domino 1 — physical phone ↔ laptop proof

Complete a five-clue match on two real devices. Refresh host after first submission, refresh challenger after reveal, background/foreground the phone, and interrupt networking briefly if practical. Measure actual reconnect pain before inventing presence/heartbeat infrastructure.

### Domino 2 — promote Head-to-Head

Add discoverable Main Menu entry/invite flow and explicit network recovery copy. Preserve guest-first entry. No mandatory account ceremony.

### Domino 3 — earn the multiplayer kernel

This is optional future work, not a shipping milestone. Consider a small shared package only when two independently shipped products need the same behavior and can upgrade independently. Do not make Needle Drop wait for trivia multiplayer.

### Domino 4 — trusted authority before stakes

Move adjudication server-side before rankings, prizes, wagers or meaningful competitive ladders. Add latency-aware buzzer/input mechanics only when that product actually exists.

## 6. Guardrails

1. **Domain truth is deterministic.** UI and Stage render facts; they do not create them.
2. **Correctness has one kernel.** Main Game and Head-to-Head share `answerJudge` behavior.
3. **Scoring is explicitly mode-owned.** Shared correctness does not require one universal scoring system.
4. **Transport is replaceable.** Firebase is an adapter, not the architecture.
5. **Guest identity is enough until persistence creates user value.**
6. **No premature presence system.** Observe real failures first.
7. **No premature universal engine.** A second consumer earns extraction.
8. **Private competitive answers remain private until reveal.**
9. **Server authority precedes meaningful stakes.**
10. **Infrastructure and doctrine stay source-controlled and CI-checked.**
11. **Provider service credentials stay server-side.**
12. **Production claims require production proof.** Build-time configuration alone does not count.
13. **Preserve history without routing through it.**
14. **Repository gardening has a stop condition.** A dormant file is not automatically product debt.

## 7. Definition of done for a substantive slice

```text
implementation
+ doctrine/security checks
+ deterministic tests
+ browser proof where relevant
+ rules/security proof where relevant
+ accessibility evidence
+ canonical owner update
+ DEV_JOURNAL handoff
+ focused branch / PR / commit history
+ post-merge deployment proof for user-facing changes
```

Failures discovered by CI are product knowledge. Convert them into durable evidence rather than merely fixing the symptom.

## 8. Strategic shape

```text
Main / mode domain truth
        ↓
semantic commands + events
        ↓
Host / Show Director / Stage
        ↓
presentation

and, orthogonally:

identity
  ↓
room/session
  ↓
durable intent
  ↓
authority
  ↓
public deterministic state
  ↓
multiple clients / projections
```

These axes meet through explicit semantic boundaries, not a giant manager object that knows everything and eventually applies for municipal status.

## 9. Operating principle

Build the smallest upstream capability that makes several downstream ideas easier, prove it in a real vertical slice, capture the lesson, then move to the next actual constraint.

**The immediate constraint is one verified release and the solo product proof. Convergence 2.0 is closed; Firebase #44 follows multiplayer command integrity.**
