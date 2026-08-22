# Needle Drop — second-pass product and engineering plan

**Date:** 2026-08-22  
**Release target:** proving build 1.2  
**North-star question:** Does one tiny clip create enough tension, recognition, argument, and laughter that the room demands another?

## Executive read

The first proving build established a strong visual identity, an independently deployable entry point, deterministic scoring, original procedural music, a licensed-asset seam, and one-to-four-player couch controls. The second-pass audit found that the surface looked more finished than the game loop behaved. This is a delightful problem. It means the patient has excellent shoes.

The immediate priority is not adding accounts, AI hosts, a marketplace, or an animated record executive who asks for your password. It is making the listen–guess–steal loop fair, legible, replayable, and resilient enough for blind playtests.

## Audit findings

### Critical gameplay

1. Solo answers were accepted before a clip was heard.
2. “Buy more audio” could lower the value before the current reveal was played.
3. Party instructions advertised buzzing while the reducer still rejected buzzes.
4. A wrong party answer ended the clue instead of opening a steal.
5. Buzz number keys could fire while somebody typed a numeric answer and rerender the form.
6. The finale reported a room total but did not crown a party winner.

### Experience and accessibility

1. There was no concise explanation of the reveal ladder, replays, or buzz ownership.
2. State changes relied heavily on disabled controls and color, with no host-style live status.
3. Result and finale transitions did not deliberately move focus.
4. Canvas semantics described the waveform but did not expose it as an image.
5. Player-count navigation omitted three-player rooms and did not mark the active selection.

### Reliability and retention

1. A rejected audio promise could strand the state in `listening` forever.
2. There was no safe cancellation token around asynchronous playback completion.
3. A completed solo run had no personal-best loop.
4. Four clues were enough to prove boot, but not enough to judge session rhythm.
5. The composition root owned too much view markup, making further iteration needlessly risky.

## Now — implemented in proving build 1.2

### Truth kernel

- Require a completed reveal before any answer or value reduction.
- Track `listenedRevealIndex`, active player, reveal-scoped lockouts, last attempt, and audio errors.
- Keep a wrong solo guess alive: the player can buy a longer reveal and try again.
- Keep a wrong party guess alive: that player locks out and everyone else can steal.
- Reset lockouts only when the room buys a longer reveal.
- Resolve a miss after a room concession or after everyone misses the final reveal.
- Score streak bonuses per player instead of pretending the room shares one nervous system.
- Rank players deterministically by score, correct answers, then seat order.

### Player experience

- Add compact in-page rules and an explicit host call for every phase.
- Add three-player mode and active-state semantics to player-count controls.
- Mark active and locked players with text as well as color.
- Add free replay, progressive reveal, and “reveal answer” as distinct choices.
- Add a party podium and solo personal best at the finale.
- Double the demo crate from four to eight original procedural clues.
- Add liner-note jokes to make the source-to-flip reveal feel like a payoff, not a database row wearing a tie.

### Reliability, modularity, and access

- Catch audio failure and return to a retryable ready state.
- Tokenize playback completion so stale async work cannot advance a newer round.
- Make synth cancellation resolve outstanding playback promises cleanly.
- Ignore buzz shortcuts while the user is typing or using modifier keys.
- Move all escaped markup into a dedicated presentation module.
- Add optional, failure-tolerant local profile storage.
- Add live status regions, focus management, visible focus, waveform image semantics, reduced-motion handling, and responsive party layouts.
- Expand reducer, party, storage, presentation, content, rights, and adapter tests.

## Next — validate before building

These are the next candidates, ordered by learning value rather than how impressive they sound in a pitch deck.

1. **Blind room playtest instrumentation.** Record only anonymous semantic events: reveal bought, replay used, buzz seat, answer outcome, clue completion, and session completion. Decide the retention/consent policy before emitting anything off-device.
2. **Phone buzzers on a local room code.** Keep the reducer authoritative; add an `InputGateway` that stamps monotonic receipt time and applies calibrated latency offsets. Do not put WebSockets inside `round.js`, even if they look cold.
3. **Host and sting director.** Consume existing semantic events for countdowns, lockout sounds, correct/wrong stings, and optional spoken banter. Audio cues need independent volume and captions/status equivalents.
4. **Signed episode repository.** Load bundled manifests first, then signed remote packs with schema, checksum, editorial, territory, and expiry gates before a clue enters rotation.
5. **Calibration and loudness.** Add pre-session output calibration, LUFS targets for assets, fades at excerpt boundaries, and a silent-mode accessibility path.
6. **Answer adjudication tiers.** Preserve authored exact aliases as canonical. Consider editorially authored token/fuzzy rules only after logging false-negative examples; never hand the final score to an unbounded language model with a charming explanation.

## Later — only after the loop earns it

- Curated historical sample-lineage packs with explicit interactive-game rights.
- Daily crates, seeded challenges, and shareable result cards with no copyrighted audio embedded.
- Team play, tournaments, audience voting, and DJ-hosted live events.
- Creator tooling for excerpt selection, checksum generation, alias review, and rights evidence.
- Cross-device profiles, accessibility preferences, achievements, and seasonal ladders.
- Spectator presentation, broadcast overlays, camera direction, and host performance capture.

## Measurement plan

The proving build should graduate only when blind sessions support the following:

| Signal | Definition | Proving target |
| --- | --- | --- |
| Session completion | Reaches the finale after starting clue one | ≥ 70% |
| First-clip recognition | Correct on the 0.25-second reveal | Track by clue; no universal target |
| Reveal tension | At least one guess or buzz before the 5-second reveal | ≥ 65% of clues |
| Room reaction | Observer marks spontaneous laugh, shout, argument, or sing-along | ≥ 60% of rounds |
| Replay demand | Players voluntarily start another crate | ≥ 40% of completed rooms |
| Input fairness | Disputed buzz adjudications | < 2% of buzzes |
| Technical failure | Audio, boot, or unrecoverable state error | < 0.5% of sessions |

Metrics are evidence, not a tiny spreadsheet monarch. Qualitative observation remains essential because “the room shouted at once” is often the product.

## Release gates

- Reducer actions remain serializable and deterministic.
- No answer or reveal purchase is possible before playback completes.
- Every wrong party answer permits an eligible steal.
- No blocked player can reclaim the same reveal.
- Audio failures recover without awarding a listen.
- Keyboard buzzing never mutates an answer field.
- All demo audio remains original and all future assets remain checksum- and rights-gated.
- JavaScript lint has zero errors, CSS lint passes, content validation passes, all tests pass, both Vite entries build, browser runtime check passes, and the live Pages URL is smoke-tested after merge.

## Explicit non-goals for 1.2

- No user accounts.
- No network dependency in the critical play loop.
- No copyrighted commercial recordings.
- No AI answer judge.
- No phone controllers until local couch play proves the room dynamic.

That restraint is not lack of ambition. It is ambition wearing eye protection.
