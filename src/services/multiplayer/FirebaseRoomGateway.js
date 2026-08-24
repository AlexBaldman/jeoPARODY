import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import { getFirebaseMultiplayerServices } from './firebaseClient.js';
import { createExpiresAtMs, isExpired } from './roomLifecycle.js';
import { normalizeRoomCode } from './roomCode.js';

const ROOMS = 'multiplayerRooms';
const ROOM_CODES = 'multiplayerRoomCodes';
const HOST_SECRETS = 'hostSecrets';

function expiresAtTimestamp() {
  return Timestamp.fromMillis(createExpiresAtMs());
}

function timestampExpired(value) {
  return Boolean(value?.toMillis) && isExpired(value.toMillis());
}

export class FirebaseRoomGateway {
  constructor(services) {
    this.db = services.db;
    this.user = services.user;
    this.kind = 'firebase';
  }

  static async create() {
    return new FirebaseRoomGateway(await getFirebaseMultiplayerServices());
  }

  async ensurePlayer(nickname) {
    const cleanNickname = String(nickname || '').trim().slice(0, 28);
    if (!cleanNickname) throw new Error('Enter a nickname.');
    return { id: this.user.uid, nickname: cleanNickname };
  }

  async createRoom(state) {
    const code = normalizeRoomCode(state.joinCode);
    const roomRef = doc(this.db, ROOMS, state.roomId);
    const codeRef = doc(this.db, ROOM_CODES, code);
    const expiresAt = expiresAtTimestamp();

    await runTransaction(this.db, async transaction => {
      const existingCode = await transaction.get(codeRef);
      if (existingCode.exists() && !timestampExpired(existingCode.data().expiresAt)) {
        const error = new Error('Room code collision. Try again.');
        error.code = 'ROOM_CODE_COLLISION';
        throw error;
      }

      transaction.set(roomRef, {
        hostId: state.hostId,
        memberIds: state.players.map(player => player.id),
        joinCode: code,
        state,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        expiresAt,
      });
      transaction.set(codeRef, {
        roomId: state.roomId,
        hostId: state.hostId,
        createdAt: serverTimestamp(),
        expiresAt,
      });
    });
  }

  async resolveRoom(joinCode) {
    const code = normalizeRoomCode(joinCode);
    const snapshot = await getDoc(doc(this.db, ROOM_CODES, code));
    if (!snapshot.exists() || timestampExpired(snapshot.data().expiresAt)) {
      throw new Error('That room code does not exist or has expired.');
    }
    return snapshot.data().roomId;
  }

  subscribeRoom(roomId, handler) {
    return onSnapshot(doc(this.db, ROOMS, roomId), snapshot => {
      const data = snapshot.exists() ? snapshot.data() : null;
      handler(data && !timestampExpired(data.expiresAt) ? data.state : null);
    }, error => handler(null, error));
  }

  subscribeCommands(roomId, handler) {
    const seen = new Set();
    return onSnapshot(collection(this.db, ROOMS, roomId, 'commands'), snapshot => {
      snapshot.docChanges().forEach(change => {
        if (change.type === 'removed') return;
        const data = change.doc.data();
        if (data.processedAt || seen.has(change.doc.id)) return;
        seen.add(change.doc.id);
        handler({ id: change.doc.id, ...data });
      });
    });
  }

  async sendCommand(roomId, command) {
    const commandRef = doc(collection(this.db, ROOMS, roomId, 'commands'));
    await setDoc(commandRef, {
      ...command,
      actorId: this.user.uid,
      createdAt: serverTimestamp(),
      processedAt: null,
      expiresAt: expiresAtTimestamp(),
    });
    return commandRef.id;
  }

  async markCommandProcessed(roomId, commandId) {
    await updateDoc(doc(this.db, ROOMS, roomId, 'commands', commandId), {
      processedAt: serverTimestamp(),
      processedBy: this.user.uid,
    });
  }

  async publishRoom(roomId, state) {
    await updateDoc(doc(this.db, ROOMS, roomId), {
      state,
      memberIds: state.players.map(player => player.id),
      updatedAt: serverTimestamp(),
    });
  }

  async setHostSecret(roomId, secret) {
    await setDoc(doc(this.db, ROOMS, roomId, HOST_SECRETS, 'current'), {
      ...secret,
      updatedAt: serverTimestamp(),
      expiresAt: expiresAtTimestamp(),
    });
  }

  async getHostSecret(roomId) {
    const snapshot = await getDoc(doc(this.db, ROOMS, roomId, HOST_SECRETS, 'current'));
    if (!snapshot.exists() || timestampExpired(snapshot.data().expiresAt)) return null;
    return snapshot.data();
  }
}
