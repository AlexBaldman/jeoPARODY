# AGENTS.md — The JeoPARODY Dojo

This is the first file every human or AI agent should read before changing this repository.

## Mandatory reading order

1. `AGENTS.md`
2. `DEV_JOURNAL.md` for the latest handoff and unfinished edges
3. `docs/README.md` for canonical documentation routing
4. `docs/MASTER_PLAN.md` for the current lead domino
5. `ARCHITECTURE.md` for runtime ownership boundaries
6. `ICM/README.md` when the work touches durable/cross-project concepts
7. Relevant canonical system docs for the slice being touched
8. Asset manifests/provenance docs only when the slice touches those assets

Do not treat a dated audit, donor note, migration report, or historical plan as current architecture merely because it is detailed and written with confidence. Humans have been confidently wrong in Markdown since approximately five minutes after Markdown was invented.

## The Beam

Follow the highest-upstream verified dependency. Fix the first real blocker before polishing downstream symptoms.

## One owner per truth

Every important concern gets one canonical owner. Do not create parallel managers, state stores, asset truths, animation systems, CSS hierarchies, plans, or deployment authorities because the existing one is inconvenient. Refactor ownership explicitly.

Documentation ownership is registered in `docs/canonical-docs.json`. Before adding another current-status document, check `docs/README.md` and update the existing owner when possible.

## Documentation contract

- **Canonical docs** own current mutable truth.
- **Milestones** preserve what was proven at a point in time.
- **References/history** preserve research, provenance, audits, migration context, and superseded decisions.
- Links are preferred to copying mutable status.
- A historical document may contradict current reality; a canonical owner may not.
- Run `npm run docs:check` after documentation changes.
- Run `npm run project:check` before considering doctrine/deployment cleanup complete.

Do not “clean up” history by rewriting old evidence to match the present. Repair current routing and ownership first; archive or retire historical material only when provenance and inbound links are understood.

## Preserve aggressively; implement selectively

Ideas, references, assets, donor behavior, and provenance are cheap to preserve and expensive to rediscover. Preserve them before branch retirement or cleanup. Runtime code should earn its way into the canonical path through tests and clear ownership.

## The Bus-the-Table Rule

When you are already passing through a subsystem, remove one nearby piece of obvious friction if it is:

- small;
- safe;
- directly understood;
- verifiable with existing tests/checks;
- and does not widen the task into a refactor expedition.

Examples: remove a dead import while editing the file; normalize a misleading name while touching its only owner; preserve an endangered asset before retiring its branch; replace a stale selector exposed by the current test.

Do not turn this into opportunistic architecture astronautics. The point is to capture otherwise-wasted motion, like carrying dishes back to a busy kitchen because you were walking there anyway.

## Leave the campsite cleaner

A change should reduce ambiguity in the area it touches. Prefer fewer owners, clearer contracts, smaller surfaces, and better evidence.

## Browser reality outranks assumptions

For user-facing behavior, production browser checks are part of the contract. Keep `npm run runtime:check` green across the protected desktop and iPhone-class viewports. Screenshots and runtime evidence outrank intuition about CSS.

## Main stays boring

Work on focused branches. Keep `main` green and deployable. Do not merge divergent historical branches wholesale when their useful parts can be ported cleanly.

The only source-controlled static-site publisher is `.github/workflows/deploy-pages.yml`. Do not restore a branch-writing `gh-pages` deploy script or introduce a second Pages publisher. Repository Settings → Pages → Source should be **GitHub Actions**.

## Assets are not branch clutter

Before retiring a branch, inventory potentially valuable images, audio, video, questions, reference material, source art, or generated artifacts. Preserve provenance. Classify before deleting.

## Stage doctrine

The host is an actor, not decoration. Game/mode domains own gameplay truth. Stage/directors own how semantic facts are projected: host performance, position, scale, occlusion, camera, motion, audio, FX, and bounded environmental comedy.

Stage must never become a parallel owner of score, clue, correctness, round progression, room membership, or private competitive data. See `docs/STAGE_RUNTIME_SYSTEM.md`.

## Verify before victory

A completed substantive slice should normally pass:

```text
project doctrine checks
+ lint
+ unit/integration tests
+ production build
+ relevant security/emulator checks
+ production browser runtime checks
+ visual/accessibility evidence
+ canonical owner update when reality changed
+ DEV_JOURNAL handoff
```

If something cannot be verified, say exactly what remains unverified.

## The Cypher handoff

Before leaving meaningful work, update `DEV_JOURNAL.md` with what changed, what was verified, unresolved risks, and the next lead domino. The journal is the asynchronous crew chat, not a ceremonial changelog.
