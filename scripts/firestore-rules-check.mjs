import fs from 'node:fs';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

const PROJECT_ID = 'demo-jeoparody-rules';
const rules = fs.readFileSync('firestore.rules', 'utf8');
const now = Date.now();
const activeExpiry = Timestamp.fromMillis(now + 60 * 60 * 1000);
const expiredAt = Timestamp.fromMillis(now - 60 * 1000);
const createdAt = Timestamp.fromMillis(now);

function roomState(players) {
  return {
    schemaVersion: 1,
    roomId: 'room-active',
    joinCode: 'B7K9P',
    hostId: 'host',
    phase: 'lobby',
    revision: 0,
    totalRounds: 5,
    roundIndex: -1,
    players,
    round: null,
    winnerIds: [],
  };
}

function command(actorId, type, payload) {
  return {
    actorId,
    type,
    payload,
    createdAt,
    processedAt: null,
    expiresAt: activeExpiry,
  };
}

const testEnv = await initializeTestEnvironment({
  projectId: PROJECT_ID,
  firestore: { rules },
});

try {
  await testEnv.withSecurityRulesDisabled(async context => {
    const db = context.firestore();

    await setDoc(doc(db, 'multiplayerRooms', 'room-active'), {
      hostId: 'host',
      memberIds: ['host', 'guest'],
      joinCode: 'B7K9P',
      state: roomState([
        { id: 'host', nickname: 'Host', ready: true, score: 0 },
        { id: 'guest', nickname: 'Guest', ready: true, score: 0 },
      ]),
      createdAt,
      updatedAt: createdAt,
      expiresAt: activeExpiry,
    });

    await setDoc(doc(db, 'multiplayerRooms', 'room-open'), {
      hostId: 'host',
      memberIds: ['host'],
      joinCode: 'OPEN1',
      state: {
        ...roomState([{ id: 'host', nickname: 'Host', ready: false, score: 0 }]),
        roomId: 'room-open',
        joinCode: 'OPEN1',
      },
      createdAt,
      updatedAt: createdAt,
      expiresAt: activeExpiry,
    });

    await setDoc(doc(db, 'multiplayerRooms', 'room-expired'), {
      hostId: 'host',
      memberIds: ['host'],
      joinCode: 'OLD99',
      state: {
        ...roomState([{ id: 'host', nickname: 'Host', ready: false, score: 0 }]),
        roomId: 'room-expired',
        joinCode: 'OLD99',
      },
      createdAt,
      updatedAt: createdAt,
      expiresAt: expiredAt,
    });

    await setDoc(doc(db, 'multiplayerRoomCodes', 'B7K9P'), {
      roomId: 'room-active',
      hostId: 'host',
      createdAt,
      expiresAt: activeExpiry,
    });

    await setDoc(doc(db, 'multiplayerRoomCodes', 'OLD99'), {
      roomId: 'room-expired',
      hostId: 'host',
      createdAt,
      expiresAt: expiredAt,
    });

    await setDoc(doc(db, 'multiplayerRooms', 'room-active', 'hostSecrets', 'current'), {
      roundIndex: 0,
      questionId: 'q1',
      answer: 'Jupiter',
      outcomes: {},
      updatedAt: createdAt,
      expiresAt: activeExpiry,
    });
  });

  const hostDb = testEnv.authenticatedContext('host').firestore();
  const guestDb = testEnv.authenticatedContext('guest').firestore();
  const outsiderDb = testEnv.authenticatedContext('outsider').firestore();
  const anonDb = testEnv.unauthenticatedContext().firestore();

  await assertSucceeds(getDoc(doc(hostDb, 'multiplayerRooms', 'room-active')));
  await assertSucceeds(getDoc(doc(guestDb, 'multiplayerRooms', 'room-active')));
  await assertFails(getDoc(doc(anonDb, 'multiplayerRooms', 'room-active')));
  await assertFails(getDocs(collection(guestDb, 'multiplayerRooms')));
  await assertFails(getDoc(doc(guestDb, 'multiplayerRooms', 'room-expired')));

  await assertSucceeds(getDoc(doc(guestDb, 'multiplayerRoomCodes', 'B7K9P')));
  await assertFails(getDoc(doc(guestDb, 'multiplayerRoomCodes', 'OLD99')));
  await assertFails(getDocs(collection(guestDb, 'multiplayerRoomCodes')));

  await assertSucceeds(setDoc(
    doc(guestDb, 'multiplayerRooms', 'room-active', 'commands', 'guest-answer'),
    command('guest', 'SUBMIT_ANSWER', { answer: 'Jupiter' }),
  ));

  await assertSucceeds(setDoc(
    doc(guestDb, 'multiplayerRooms', 'room-active', 'commands', 'guest-ready'),
    command('guest', 'SET_READY', { ready: true }),
  ));

  await assertFails(setDoc(
    doc(outsiderDb, 'multiplayerRooms', 'room-active', 'commands', 'outsider-answer'),
    command('outsider', 'SUBMIT_ANSWER', { answer: 'Jupiter' }),
  ));

  await assertFails(setDoc(
    doc(guestDb, 'multiplayerRooms', 'room-active', 'commands', 'guest-start'),
    command('guest', 'START', {}),
  ));

  await assertSucceeds(setDoc(
    doc(hostDb, 'multiplayerRooms', 'room-active', 'commands', 'host-start'),
    command('host', 'START', {}),
  ));

  await assertFails(setDoc(
    doc(guestDb, 'multiplayerRooms', 'room-active', 'commands', 'oversized-answer'),
    command('guest', 'SUBMIT_ANSWER', { answer: 'x'.repeat(201) }),
  ));

  await assertFails(setDoc(
    doc(guestDb, 'multiplayerRooms', 'room-active', 'commands', 'extra-field'),
    {
      ...command('guest', 'SET_READY', { ready: true }),
      surprise: 'absolutely not',
    },
  ));

  await assertSucceeds(setDoc(
    doc(outsiderDb, 'multiplayerRooms', 'room-open', 'commands', 'join-open'),
    command('outsider', 'JOIN', {
      player: { id: 'outsider', nickname: 'Challenger' },
    }),
  ));

  await assertFails(setDoc(
    doc(outsiderDb, 'multiplayerRooms', 'room-active', 'commands', 'join-full'),
    command('outsider', 'JOIN', {
      player: { id: 'outsider', nickname: 'Third Wheel' },
    }),
  ));

  await assertFails(setDoc(
    doc(outsiderDb, 'multiplayerRooms', 'room-open', 'commands', 'spoofed-join'),
    command('outsider', 'JOIN', {
      player: { id: 'somebody-else', nickname: 'Identity Thief' },
    }),
  ));

  await assertSucceeds(getDoc(doc(hostDb, 'multiplayerRooms', 'room-active', 'hostSecrets', 'current')));
  await assertFails(getDoc(doc(guestDb, 'multiplayerRooms', 'room-active', 'hostSecrets', 'current')));

  await assertSucceeds(updateDoc(doc(hostDb, 'multiplayerRooms', 'room-active'), {
    updatedAt: Timestamp.fromMillis(now + 1),
  }));
  await assertFails(updateDoc(doc(guestDb, 'multiplayerRooms', 'room-active'), {
    updatedAt: Timestamp.fromMillis(now + 2),
  }));

  await assertFails(updateDoc(
    doc(guestDb, 'multiplayerRooms', 'room-active', 'commands', 'guest-ready'),
    { processedAt: Timestamp.fromMillis(now + 3), processedBy: 'guest' },
  ));
  await assertSucceeds(updateDoc(
    doc(hostDb, 'multiplayerRooms', 'room-active', 'commands', 'guest-ready'),
    { processedAt: Timestamp.fromMillis(now + 3), processedBy: 'host' },
  ));

  console.log('Firestore multiplayer rules check passed.');
} finally {
  await testEnv.cleanup();
}
