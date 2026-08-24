# JeoPARODY Head-to-Head Multiplayer

**Date:** 2026-08-24  
**Concept ID:** `game-mode.head-to-head`  
**Release target:** room-code proving slice

## Product promise

A player creates a room, shares a short code or invite link, and a second player joins without creating a visible account. Both receive the same five clues, submit one answer per clue, see the reveal after both have answered, and finish with deterministic shared scores. Refreshing either active tab restores the same room and phase rather than throwing the contestant back into the parking lot.

The first release deliberately avoids latency-sensitive buzzing. Network clocks are a fine way to turn a trivia game into an amateur distributed-systems conference.

## Decisions

1. **Anonymous identity before account UI.** Firebase Anonymous Auth supplies a stable UID when cloud mode is configured. A future Google/email account can link to the anonymous user without changing match ownership.
2. **Room code is discovery, room ID is identity.** Human codes resolve to unguessable room IDs. Invite URLs expose the join code; active-session URLs carry the internal room ID only for the tab that already owns that session.
3. **One public match truth.** `core/match.js` owns players, readiness, phases, public questions, submission state, revealed outcomes, score, and winners.
4. **Adjudication stays private until reveal.** Raw player answers live only in command records. The host privately computes each outcome, but public room state records only which players have submitted until both are locked. Correctness, points, and the correct response publish atomically at reveal.
5. **Host-authoritative v1.** Guests submit intent. The host client validates and publishes state. This is sufficient for a casual proving build and intentionally not anti-cheat grade.
6. **Durable intent, replayable authority.** Commands are independent append-only records rather than one shared mutable queue. An unprocessed command survives host refresh and can be replayed without requiring the player to submit again.
7. **Host secret is reconnectable.** The current answer and private per-player adjudication live in a host-only `hostSecrets/current` document. A host can refresh after accepting one answer and still complete the round when the second answer arrives.
8. **Tab identity is the reconnect unit.** Active room recovery uses `sessionStorage`, keeping two local proving tabs distinct while allowing a reload of either tab to resume the same player identity.
9. **Transport is replaceable.** The UI depends on a room gateway. Firebase/Firestore is the cross-device implementation; a local BroadcastChannel/localStorage gateway provides an immediate two-tab lab when Firebase is not configured.
10. **Rooms are ephemeral by default.** Proving rooms, codes, commands, and host secrets carry a twelve-hour expiry. Firestore TTL policy files are source-controlled so stale multiplayer data is eventually removed without a bespoke janitor service.
11. **Security rules are executable policy.** Cloud authorization is verified in CI against the Firestore emulator, including outsider, malformed-payload, expired-room, private-secret, host-only, and member-only cases.
12. **Question source stays canonical.** The host draws from the existing `questionService`; clients never independently choose a clue.

## Runtime shape

```text
head-to-head.html
  └─ modes/head-to-head/main.js
      ├─ core/match.js                  public deterministic truth
      ├─ core/answerMatcher.js          mode answer acceptance
      ├─ HeadToHeadHost.js              v1 authority / command adjudication
      ├─ questionService                canonical clue source
      └─ services/multiplayer/
          ├─ createRoomGateway.js
          ├─ FirebaseRoomGateway.js
          ├─ LocalRoomGateway.js
          ├─ firebaseClient.js
          ├─ roomCode.js
          ├─ roomLifecycle.js
          └─ roomSession.js
```

Cloud data:

```text
multiplayerRoomCodes/{CODE}
  roomId
  hostId
  createdAt
  expiresAt

multiplayerRooms/{roomId}
  hostId
  memberIds[]
  joinCode
  state
  createdAt
  updatedAt
  expiresAt

multiplayerRooms/{roomId}/commands/{commandId}
  actorId
  type
  payload
  createdAt
  processedAt
  processedBy?
  expiresAt

multiplayerRooms/{roomId}/hostSecrets/current
  roundIndex
  questionId
  answer
  outcomes
  updatedAt
  expiresAt
```

Firestore TTL policy is declared for `expiresAt` on rooms, room codes, commands, and host secrets. TTL deletion is cleanup, not authorization: reads and command creation are independently blocked when a document is already expired.

## Command flow

```text
player UI
  ↓ durable intent
JOIN | SET_READY | START | SUBMIT_ANSWER | NEXT_ROUND
  ↓
RoomGateway
  ↓ append command record
host authority
  ↓ validates identity + phase
HeadToHead match truth
  ↓
public room snapshot
  ↓
both clients render
```

Commands are idempotent against current state. Processed commands are acknowledged rather than deleted, and an unprocessed record is replayable after host reconnect.

### Round privacy flow

```text
Player 1 submits
      ↓
private host outcome updated
      ↓
public state: submittedPlayerIds += P1
      ↓
NO correctness / score / answer reveal yet
      ↓
Player 2 submits
      ↓
private host outcome updated
      ↓
both submissions present
      ↓
public reveal publishes outcomes + correct response + scores atomically
```

## Reconnect contract

An active tab stores only enough session context to prove its own identity on refresh:

```text
sessionStorage
  roomId
  player.id
  player.nickname
  transport
```

The browser URL carries `?room=<unguessable-id>` for an already-active tab. A shareable invitation instead carries `?join=<human-code>`. A new tab with only the invite code must still join normally and receive its own identity.

Browser CI explicitly exercises:

1. create and join;
2. ready both players;
3. start one shared clue;
4. host submits first;
5. host refreshes before the guest answers;
6. host restores the same clue and waiting state;
7. guest submits;
8. both clients receive the same reveal and converged scores;
9. guest refreshes after reveal and restores the resolved round.

## Security boundary

The supplied Firestore rules enforce:

- authenticated users only;
- expired rooms and codes cannot be fetched or used for new commands;
- room and room-code collections cannot be listed;
- only the room host can mutate public room state;
- a room begins with exactly the authenticated host in `memberIds`;
- command documents have an explicit field allowlist and typed payload schemas;
- nicknames are bounded to 28 characters and submitted answers to 200 characters at the rules layer;
- command authors must match `request.auth.uid`;
- `JOIN` is accepted only while a seat is available and the payload identity matches auth;
- `SET_READY` and `SUBMIT_ANSWER` require existing room membership;
- `START` and `NEXT_ROUND` require the host identity;
- raw command payloads are readable only by their author and the host;
- only the host can read/write current answer/adjudication secrets;
- the host may only add processing metadata to an existing command.

The CI emulator suite proves representative allow/deny cases rather than relying on rule inspection alone.

Firebase web configuration belongs in Vite environment variables. Authorization lives in Firebase Auth + Firestore Rules, not in pretending the web app's Firebase config is a secret.

This remains **casual-game security** because the host browser is authoritative. Before ranked matchmaking, prizes, public competitive ladders, or anything else that inspires creative dishonesty, command adjudication should move to a trusted server or Cloud Function behind the same serializable command contract.

## Local proving mode

Without Firebase environment variables, `head-to-head.html` uses a local transport:

- same-origin `localStorage` persists public room state;
- each command is stored under its own durable localStorage key;
- `BroadcastChannel` wakes the other tab quickly;
- scanning unprocessed command records provides replay after host reload;
- `sessionStorage` gives each tab a distinct player identity and active-room recovery context;
- room codes and private host state carry the same twelve-hour lifecycle semantics used by cloud mode.

This mode proves UI/domain/reconnect behavior only. It is explicitly labeled **same browser only** so nobody texts a local room code to Nebraska and spends the evening blaming DNS.

## Firebase deployment artifacts

The repository now contains:

```text
.env.example
firebase.json
firestore.rules
firestore.indexes.json
scripts/firestore-rules-check.mjs
```

`firebase.json` wires both rules and indexes. `firestore.indexes.json` declares TTL field overrides for all ephemeral multiplayer collections. What is intentionally not committed is a Firebase project binding or credentials. The owner must select/create the real Firebase project, enable Anonymous Auth, and supply the Vite web configuration for the deployment environment.

Once a project exists, rules + TTL/index configuration can be deployed without committing a project binding:

```bash
npx --yes firebase-tools@15.28.1 deploy \
  --only firestore:rules,firestore:indexes \
  --project <firebase-project-id>
```

The production frontend then needs the values from `.env.example` supplied through the deployment environment. Anonymous Auth must be enabled for the selected Firebase project before a cross-device room can authenticate.

## Verified CI contract

The proving slice currently blocks on all of the following in GitHub Actions:

```text
ESLint
Stylelint
94 Jest tests
Vite production build
Firestore Security Rules emulator suite
main-game browser diagnostics + blocking runtime
Needle Drop browser runtime
Head-to-Head two-tab + reconnect browser runtime
axe accessibility audits
runtime screenshots + build artifacts
```

## Delivery cascade

### Slice 1: proving architecture — implemented and verified

- guest nickname identity;
- room creation and short join code;
- invite-link code prefilling;
- two-player lobby and readiness;
- same-clue five-round match;
- one answer per player per round;
- host adjudication and shared score;
- hidden adjudication until both submit;
- correct-answer reveal;
- winner/tie finale;
- local proving transport;
- Firebase Anonymous Auth + Firestore adapter;
- host-private answer/adjudication storage;
- Firestore security rules and payload validation;
- reducer/gateway-domain tests;
- durable per-command local intent log;
- host and guest refresh recovery;
- twelve-hour room lifecycle + Firestore TTL policy;
- emulator-backed Firestore Security Rules tests;
- blocking two-tab browser runtime proof.

### Slice 2: productionize cloud — next

- create/select the Firebase project;
- enable Anonymous Auth;
- deploy `firestore.rules` and `firestore.indexes.json`;
- add production Vite Firebase environment variables;
- run a real phone ↔ laptop cloud match;
- prove host and guest reconnect across distinct devices;
- decide whether a lightweight presence heartbeat is actually needed after observing real play;
- optionally add explicit room close/rematch lifecycle rather than relying only on TTL cleanup.

### Slice 3: account upgrade

- optional “save my record” flow after a completed match;
- link anonymous UID to Google/email;
- persistent profile, match receipts, friend/rematch links;
- never require account creation to enter a casual room.

### Slice 4: competitive mechanics

- calibrated buzz windows through the planned `InputGateway`;
- server timestamp / latency compensation;
- authoritative server or Cloud Function match reducer;
- reconnect grace periods;
- spectator/audience channel;
- teams, tournaments, private invites.

## Anti-cheat migration path

Host authority is a deployment seam, not a permanent religion. `HeadToHeadHost` receives serializable commands and produces public state. A later Cloud Function/server can consume the same command vocabulary and own the same transition contract while the client UI and room gateway remain largely unchanged.

Move authority server-side before adding rankings, prizes, public matchmaking, wagers, or anything else that makes people suddenly discover their passion for cheating.

## Acceptance gates

- two tabs can create/join/ready and resolve a shared clue;
- both tabs receive exactly the same clue and reveal;
- host refresh after its submission preserves private adjudication and public waiting state;
- guest refresh after reveal restores the resolved round;
- public room snapshots never contain submitted raw answers;
- public state exposes neither correctness nor score changes before both players submit;
- a duplicate answer command cannot score twice;
- independent local commands cannot overwrite one another;
- processed commands do not replay after host reconnect;
- a room cannot exceed two players;
- outsider answer commands are ignored by host authority and denied by Firestore rules;
- guest host-only commands are denied by Firestore rules;
- malformed and oversized command payloads are denied by Firestore rules;
- room and room-code collection listing is denied;
- host-private answer documents are denied to guests;
- expired room documents cannot be used as active multiplayer state;
- build includes `head-to-head.html`;
- unit tests cover room codes, answer acceptance, match truth, host adjudication, command durability, session recovery, and room lifecycle;
- cloud release is blocked until rules/TTL policies and Anonymous Auth are deployed and tested on two distinct devices.
