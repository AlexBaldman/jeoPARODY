import { normalizeRoomCode } from './roomCode.js';

const ROOM_PREFIX = 'jeoparody:h2h:room:';
const CODE_PREFIX = 'jeoparody:h2h:code:';
const COMMAND_PREFIX = 'jeoparody:h2h:commands:';
const SECRET_PREFIX = 'jeoparody:h2h:secret:';
const PLAYER_KEY = 'jeoparody:h2h:session-player-id';

function makeId(prefix) {
  const suffix = globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${suffix}`;
}

function readJson(key, fallback) {
  try {
    const parsed = JSON.parse(localStorage.getItem(key));
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export class LocalRoomGateway {
  constructor() {
    this.kind = 'local';
  }

  async ensurePlayer(nickname) {
    const cleanNickname = String(nickname || '').trim().slice(0, 28);
    if (!cleanNickname) throw new Error('Enter a nickname.');

    let id = sessionStorage.getItem(PLAYER_KEY);
    if (!id) {
      id = makeId('local-player');
      sessionStorage.setItem(PLAYER_KEY, id);
    }
    return { id, nickname: cleanNickname };
  }

  async createRoom(state) {
    const code = normalizeRoomCode(state.joinCode);
    const codeKey = `${CODE_PREFIX}${code}`;
    if (localStorage.getItem(codeKey)) {
      const error = new Error('Room code collision. Try again.');
      error.code = 'ROOM_CODE_COLLISION';
      throw error;
    }

    writeJson(`${ROOM_PREFIX}${state.roomId}`, state);
    localStorage.setItem(codeKey, state.roomId);
    this.#broadcast(state.roomId, { type: 'room', state });
  }

  async resolveRoom(joinCode) {
    const roomId = localStorage.getItem(`${CODE_PREFIX}${normalizeRoomCode(joinCode)}`);
    if (!roomId) throw new Error('That room code is not available in this browser.');
    return roomId;
  }

  subscribeRoom(roomId, handler) {
    const key = `${ROOM_PREFIX}${roomId}`;
    const channel = this.#channel(roomId);
    const emitCurrent = () => handler(readJson(key, null));
    const onStorage = event => {
      if (event.key === key) emitCurrent();
    };
    const onMessage = event => {
      if (event.data?.type === 'room') handler(event.data.state);
    };

    emitCurrent();
    window.addEventListener('storage', onStorage);
    channel?.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('storage', onStorage);
      channel?.removeEventListener('message', onMessage);
      channel?.close();
    };
  }

  subscribeCommands(roomId, handler) {
    const key = `${COMMAND_PREFIX}${roomId}`;
    const channel = this.#channel(roomId);
    const seen = new Set();
    const scan = () => {
      const commands = readJson(key, []);
      commands.forEach(command => {
        if (!command.processedAt && !seen.has(command.id)) {
          seen.add(command.id);
          handler(command);
        }
      });
    };
    const onStorage = event => {
      if (event.key === key) scan();
    };
    const onMessage = event => {
      if (event.data?.type === 'command') scan();
    };

    scan();
    window.addEventListener('storage', onStorage);
    channel?.addEventListener('message', onMessage);

    return () => {
      window.removeEventListener('storage', onStorage);
      channel?.removeEventListener('message', onMessage);
      channel?.close();
    };
  }

  async sendCommand(roomId, command) {
    const key = `${COMMAND_PREFIX}${roomId}`;
    const commands = readJson(key, []);
    const record = {
      ...command,
      id: makeId('cmd'),
      createdAt: Date.now(),
      processedAt: null,
    };
    commands.push(record);
    writeJson(key, commands.slice(-100));
    this.#broadcast(roomId, { type: 'command', id: record.id });
    return record.id;
  }

  async markCommandProcessed(roomId, commandId) {
    const key = `${COMMAND_PREFIX}${roomId}`;
    const commands = readJson(key, []);
    const record = commands.find(command => command.id === commandId);
    if (record) record.processedAt = Date.now();
    writeJson(key, commands);
  }

  async publishRoom(roomId, state) {
    writeJson(`${ROOM_PREFIX}${roomId}`, state);
    this.#broadcast(roomId, { type: 'room', state });
  }

  async setHostSecret(roomId, secret) {
    writeJson(`${SECRET_PREFIX}${roomId}`, secret);
  }

  async getHostSecret(roomId) {
    return readJson(`${SECRET_PREFIX}${roomId}`, null);
  }

  #channel(roomId) {
    return typeof BroadcastChannel === 'function'
      ? new BroadcastChannel(`jeoparody:h2h:${roomId}`)
      : null;
  }

  #broadcast(roomId, message) {
    const channel = this.#channel(roomId);
    channel?.postMessage(message);
    channel?.close();
  }
}
