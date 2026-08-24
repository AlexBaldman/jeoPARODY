# Multiplayer Foundation Milestone — 2026-08-24

**Milestone:** Head-to-Head room-code multiplayer foundation  
**Merged PR:** #42  
**Main commit:** `46d8f78b367db3557fc60102e35676db27ea39be`  
**Detailed architecture owner:** `docs/HEAD_TO_HEAD_MULTIPLAYER_2026-08-24.md`

This document is an immutable milestone snapshot: what JeoPARODY proved on 2026-08-24, why the architecture matters beyond one trivia mode, what failed during implementation, and what must be true before the next layer is considered earned.

## What shipped

JeoPARODY gained a complete casual two-player Head-to-Head vertical slice:

```text
HOST
  ↓ create room
five-character human join code / invite link
  ↓
CHALLENGER joins with nickname
  ↓
two-player ready lobby
  ↓
five shared clues
  ↓
one independent answer per player
  ↓
private adjudication until both lock
  ↓
atomic reveal + scoring
  ↓
winner / tie finale
```

Visible account creation is not required. Cloud mode uses Firebase Anonymous Auth as the identity seam; local proving mode gives each browser tab a separate temporary identity.

## Architecture that was earned

The feature proved useful reusable boundaries instead of embedding networking directly into trivia UI.

### Public deterministic match truth

`src/modes/head-to-head/core/match.js` owns public gameplay state: players, readiness, phase, shared question, submission state, revealed outcomes, scores, and winner.

Networking transports player **intent** into that domain; networking does not own the rules.

### Durable command vocabulary

The mode uses serializable commands such as:

```text
JOIN
SET_READY
START
SUBMIT_ANSWER
NEXT_ROUND
```

Commands are durable intent records. Authority consumes them, validates them against current state, and publishes deterministic public truth.

### Replaceable room gateway

The UI depends on a room-gateway contract rather than Firebase directly.

Proven implementations:

- `LocalRoomGateway`: same-browser proving transport using localStorage + BroadcastChannel + sessionStorage;
- `FirebaseRoomGateway`: anonymous identity + Firestore cross-device implementation seam.

This is the key reuse point for future modes. Firebase is an adapter, not the architecture.

### Explicit authority seam

`HeadToHeadHost` is the v1 authority. The host browser adjudicates commands and publishes public state.

That is acceptable for casual proving play because there are no rankings, prizes, or meaningful competitive stakes. The serializable command boundary deliberately allows authority to move to a trusted server later without requiring the UI or match model to be redesigned first.

## Privacy / reveal contract

A major implementation rule emerged from the first multiplayer pass:

**Submitting first must not reveal whether the first player was correct.**

Before both submissions, public state exposes only submission completion:

```js
{
  submittedPlayerIds: ['player-1'],
  outcomes: {},
  answerReveal: null
}
```

Private host state may contain the correct response and adjudicated outcomes. Correctness, awarded points, answer reveal, and resulting scores become public together only after both players have locked answers.

Raw typed answers never belong in public room state.

## The race that changed the design

The first local proving transport stored all room commands in one shared localStorage array.

Two near-simultaneous answer submissions could perform overlapping read-modify-write cycles:

```text
TAB A reads [old commands]
TAB B reads [old commands]
TAB A writes [...old, answer-A]
TAB B writes [...old, answer-B]
                      ↑
                answer-A disappears
```

CI reproduced the failure as a browser timeout after both clients appeared to submit.

The fix was architectural rather than a timing hack: **one immutable durable record per command**.

```text
room
 ├─ command/cmd-A
 ├─ command/cmd-B
 └─ command/cmd-C
```

This removed the overwrite race and simultaneously created the correct recovery model: unprocessed intent can be replayed after host reconnect.

This failure is worth preserving because it is the clearest proof that multiplayer command persistence should be append-oriented rather than a shared mutable queue.

## Reconnect contract that was proved

The blocking browser test includes the scenario most likely to expose authority/recovery flaws:

```text
host answers first
      ↓
host refreshes before challenger answers
      ↓
host restores identity + room + same clue + waiting state
      ↓
challenger answers
      ↓
restored host authority completes adjudication
      ↓
both clients converge on reveal + scores
      ↓
challenger refreshes
      ↓
resolved round restores correctly
```

Active-session recovery is tab-scoped through `sessionStorage`. This lets two local proving tabs remain two distinct contestants while either tab may safely refresh.

Invite and resume URLs are deliberately different concepts:

```text
invite: ?join=<human-room-code>
resume: ?room=<unguessable-room-id>
```

A shared invite does not confer an existing player's session identity.

## Room lifecycle

Rooms are ephemeral by design.

Rooms, human codes, command records, and host-private state carry a twelve-hour expiration. Firestore TTL field policies are version-controlled in `firestore.indexes.json`.

TTL is cleanup, not authorization. Firestore Security Rules separately reject expired state immediately rather than waiting for eventual deletion.

## Security boundary proved in the emulator

The repository's blocking CI launches the Firestore emulator and runs explicit allow/deny tests.

Rules prove, among other cases:

- room/room-code collections cannot be listed;
- expired rooms cannot be used as active sessions;
- command identity must match authenticated Firebase identity;
- JOIN is limited by seat availability and payload identity;
- ready/answer commands require membership;
- start/advance commands require host identity;
- raw command payloads are visible only to their author and host;
- host answer/adjudication secrets are host-only;
- only processing metadata may be appended to an existing command by the host;
- malformed or oversized command payloads are rejected.

These rules protect the casual proving build from ordinary hostile clients. They do **not** convert host-browser authority into anti-cheat-grade competitive infrastructure.

## Evidence at merge

PR #42's final head passed the blocking repository suite before merge:

```text
ESLint
Stylelint
94 Jest tests
Vite production build
Firestore emulator Security Rules suite
main-game browser diagnostics
main-game blocking runtime
Needle Drop runtime
Head-to-Head two-tab runtime
host mid-round reconnect
challenger post-reveal reconnect
shared clue + shared reveal convergence
scoreboard convergence
axe accessibility checks
runtime screenshots + build artifacts
```

The merge into `main` was intentionally squashed to one durable milestone commit while the PR preserves the detailed implementation/debug history.

## What this milestone does NOT claim

The following were deliberately not declared complete by this milestone:

- a configured production Firebase project;
- Anonymous Auth enabled in that real project;
- production `VITE_FIREBASE_*` configuration;
- deployed Firestore rules/indexes against the real project;
- phone ↔ laptop cloud proof;
- presence/heartbeat infrastructure;
- ranked matchmaking;
- friends/profiles/persistent records;
- latency-compensated buzzing;
- trusted server authority;
- tournaments/spectators/teams.

Those are follow-on capabilities, not hidden footnotes to the word “multiplayer.”

## Reusable primitives discovered

The durable architectural discovery is broader than Head-to-Head:

```text
Identity
Room / Session
Human Invite / Discovery
Durable Command
Authority
Public Deterministic State
Private Authority State
Reconnect
Transport Adapter
Lifecycle / Expiry
Security Policy
```

Do not immediately package these into a universal framework. Let a second real consumer pressure-test the boundaries first. Needle Drop remote/multiplayer participation is a strong candidate.

## Next earned step

The next lead domino after this milestone is **real cloud proof**, not more features:

```text
real Firebase project
    ↓
Anonymous Auth
    ↓
production web config
    ↓
deploy rules + indexes / TTL
    ↓
phone ↔ laptop match
    ↓
host + challenger reconnect proof
    ↓
observe real disconnect behavior
    ↓
main-menu promotion
```

Only after a second mode needs the same concepts should a shared multiplayer kernel be extracted.

## Historical lesson

The most valuable outcome was not “two players can answer trivia.” It was the emergence of a transport-independent command/authority/recovery boundary that can later support other JeoPARODY modes without making each game invent its own fragile little Internet.
