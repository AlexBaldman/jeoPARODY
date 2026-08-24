import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { getFirebaseMultiplayerServices } from './firebaseClient.js';
import { normalizeRoomCode } from './roomCode.js';

const ROOMS = 'multiplayerRooms';
const ROOM_CODES = 'multiplayerRoomCodes';

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

    await runTransaction(this.db, async transaction => {
      const existingCode = await transaction.get(codeRef);
      if (existingCode.exists()) {
        const error = new Error('Room code collision. Try again.');
        error.code = 'ROOM_CODE_COLLISION';
        throw error;
      }

      transaction.set(roomRef, {
        hostId: state.hostId,
        joinCode: code,
        state,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      transaction.set(codeRef, {
        roomId: state.roomId,
        hostId: state.hostId,
        createdAt: serverTimestamp(),
      });
    });
  }

  async resolveRoom(joinCode) {
    const code = normalizeRoomCode(joinCode);
    const snapshot = await getDoc(doc(this.db, ROOM_CODES, code));
    if (!snapshot.exists()) throw new Error('That room code does not exist.');
    return snapshot.data().roomId;
  }

  subscribeRoom(roomId, handler) {
    return onSnapshot(doc(this.db, ROOMS, roomId), snapshot => {
      handler(snapshot.exists() ? snapshot.data().state : null);
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
      updatedAt: serverTimestamp(),
    });
  }

  async setHostSecret(roomId, secret) {
    await setDoc(doc(this.db, ROOMS, roomId, 'private', 'host'), {
      ...secret,
      updatedAt: serverTimestamp(),
    });
  }

  async getHostSecret(roomId) {
    const snapshot = await getDoc(doc(this.db, ROOMS, roomId, 'private', 'host'));
    return snapshot.exists() ? snapshot.data() : null;
  }
}
