# AGENTS.md — The JeoPARODY Dojo

This is the first file every human or AI agent should read before changing this repository.

## Mandatory reading order
1. `AGENTS.md`
2. `DEV_JOURNAL.md`
3. `ARCHITECTURE.md`
4. `ICM/README.md`
5. Relevant project/system docs for the slice being touched

## The Beam
Follow the highest-upstream verified dependency. Fix the first real blocker before polishing downstream symptoms.

## One owner per truth
Every important concern gets one canonical owner. Do not create parallel managers, state stores, asset truths, animation systems, or CSS hierarchies because the existing one is inconvenient. Refactor ownership explicitly.

## Preserve aggressively; implement selectively
Ideas, references, assets, donor behavior, and provenance are cheap to preserve and expensive to rediscover. Preserve them before branch retirement or cleanup. Runtime code should earn its way into the canonical path through tests and clear ownership.

## The Bus-the-Table Rule
When you are already passing through a subsystem, remove one nearby piece of obvious friction if it is:
- small,
- safe,
- directly understood,
- verifiable with existing tests/checks,
- and does not widen the task into a refactor expedition.

Examples: remove a dead import while editing the file; normalize a misleading name while touching its only owner; preserve an endangered asset before retiring its branch; replace a stale selector exposed by the current test.

Do not turn this into opportunistic architecture astronautics. The point is to capture otherwise-wasted motion, like carrying dishes back to a busy kitchen because you were walking there anyway.

## Leave the campsite cleaner
A change should reduce ambiguity in the area it touches. Prefer fewer owners, clearer contracts, smaller surfaces, and better evidence.

## Browser reality outranks assumptions
For user-facing behavior, production browser checks are part of the contract. Keep `npm run runtime:check` green across the protected desktop and iPhone-class viewports. Screenshots and runtime evidence outrank intuition about CSS.

## Main stays boring
Work on focused branches. Keep `main` green and deployable. Do not merge divergent historical branches wholesale when their useful parts can be ported cleanly.

## Assets are not branch clutter
Before retiring a branch, inventory potentially valuable images, audio, video, questions, reference material, source art, or generated artifacts. Preserve provenance. Classify before deleting.

## Stage doctrine
The host is an actor, not decoration. `HostSystem` owns identity/personality/mood/image. Stage/choreography owns position, scale, occlusion, motion, and performance geometry. UI surfaces such as the footer can participate as scenery.

## Verify before victory
A completed slice should normally pass lint, tests, build, production browser runtime checks, and relevant visual/accessibility checks. If something cannot be verified, say exactly what remains unverified.

## The Cypher handoff
Before leaving meaningful work, update `DEV_JOURNAL.md` with what changed, what was verified, unresolved risks, and the next lead domino. The journal is the asynchronous crew chat, not a ceremonial changelog.
