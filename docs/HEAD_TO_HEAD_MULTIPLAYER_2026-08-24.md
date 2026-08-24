# JeoPARODY Head-to-Head Multiplayer

**Date:** 2026-08-24  
**Concept ID:** `game-mode.head-to-head`  
**Release target:** room-code proving slice

## Product promise

A player creates a room, shares a short code, and a second player joins without creating a visible account. Both receive the same five clues, submit one answer per clue, see the reveal after both have answered, and finish with deterministic shared scores.

The first release deliberately avoids latency-sensitive buzzing. Network clocks are a fine way to turn a trivia game into an amateur distributed-systems conference.

## Decisions

1. **Anonymous identity before account UI.** Firebase Anonymous Auth supplies a stable UID when cloud mode is configured. A future Google/email account can link to the anonymous user without changing match ownership.
2. **Room code is discovery, room ID is identity.** Human codes resolve to unguessable room IDs.
3. **One public match truth.** `core/match.js` owns players, readiness, phases, public questions, outcomes, score, and winners.
4. **Raw answers stay private.** Player answer text travels only inside command records readable by that player and the room host. Public room state receives only adjudicated outcome facts. The correct answer becomes public only at reveal.
5. **Host-authoritative v1.** Guests submit intent. The host client validates and publishes state. This is sufficient for a casual proving build and intentionally not anti-cheat grade.
6. **Host secret is reconnectable.** The current correct answer is stored in a host-only private document so a host refresh can resume adjudication.
7. **Transport is replaceable.** The UI depends on a room gateway. Firebase/Firestore is the cross-device implementation; a local BroadcastChannel/localStorage gateway provides an immediate two-tab lab when Firebase is not configured.
8. **Question source stays canonical.** The host draws from the existing `questionService`; clients never independently choose a clue.

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
          └─ roomCode.js
```

Cloud data:

```text
multiplayerRoomCodes/{CODE}
  roomId
  hostId

multiplayerRooms/{roomId}
  hostId
  joinCode
  state
  createdAt
  updatedAt

multiplayerRooms/{roomId}/commands/{commandId}
  actorId
  type
  payload
  createdAt
  processedAt

multiplayerRooms/{roomId}/private/host
  roundIndex
  questionId
  answer
```

## Command flow

```text
player UI
  ↓ intent
JOIN | SET_READY | START | SUBMIT_ANSWER | NEXT_ROUND
  ↓
RoomGateway
  ↓
host authority
  ↓ validates identity + phase
HeadToHead match truth
  ↓
public room snapshot
  ↓
both clients render
```

Every command is idempotent against the current phase/state. This matters when a host reconnects and sees an unprocessed command again.

## Security boundary

The supplied Firestore rules enforce:

- authenticated users only;
- only the room host can mutate public room state;
- command authors must match `request.auth.uid`;
- only the command author and host can read raw command payloads;
- only the host can read/write the private answer document;
- the host may only add processing metadata to an existing command.

Firebase web configuration belongs in Vite environment variables. Authorization lives in Firebase Auth + Firestore Rules, not in pretending the web app's Firebase config is a secret.

## Local proving mode

Without Firebase environment variables, `head-to-head.html` uses a local transport:

- same-origin `localStorage` persists room state;
- `BroadcastChannel` wakes the other tab;
- `sessionStorage` gives each tab a distinct player ID.

This mode proves UI/domain behavior only. It is explicitly labeled **same browser only** so nobody texts a local room code to Nebraska and spends the evening blaming DNS.

## Delivery cascade

### Slice 1: implemented here

- guest nickname identity;
- room creation and short join code;
- two-player lobby and readiness;
- same-clue five-round match;
- one answer per player per round;
- host adjudication and shared score;
- correct-answer reveal;
- winner/tie finale;
- local proving transport;
- Firebase Anonymous Auth + Firestore adapter;
- host-private answer storage;
- Firestore security rules;
- reducer/gateway-domain tests.

### Slice 2: productionize cloud

- create/configure the Firebase project;
- enable Anonymous Auth;
- deploy `firestore.rules`;
- add GitHub Actions/Pages environment variables;
- run two-device browser proof;
- add reconnect/disconnect presence and stale-room expiry;
- add emulator-backed security-rule tests.

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

- two tabs can create/join/ready/play all five clues without reload;
- public room snapshots never contain submitted raw answers before reveal;
- a duplicate answer command cannot score twice;
- a room cannot exceed two players;
- only host commands can start/advance;
- build includes `head-to-head.html`;
- unit tests cover room codes, answer acceptance, match truth, and host adjudication;
- cloud release is blocked until Firestore rules and anonymous auth are deployed and tested on two distinct devices.
