import { createExpiresAtMs, isExpired } from './roomLifecycle.js';
import { normalizeRoomCode } from './roomCode.js';

const ROOM_PREFIX = 'jeoparody:h2h:room:';
const ROOM_META_PREFIX = 'jeoparody:h2h:room-meta:';
const CODE_PREFIX = 'jeoparody:h2h:code:';
const COMMAND_PREFIX = 'jeoparody:h2h:command:';
const SECRET_PREFIX = 'jeoparody:h2h:secret:';
const PLAYER_KEY = 'jeoparody:h2h:session-player-id';

function makeId(prefix) {
  const suffix = globalThis.crypto?.randomUUID?.()
    || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}-${suffix}`;
}

function readJson(key, fallback) {
  try {
    const parsed = JSON.parse(globalThis.localStorage.getItem(key));
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  globalThis.localStorage.setItem(key, JSON.stringify(value));
}

function commandPrefix(roomId) {
  return `${COMMAND_PREFIX}${roomId}:`;
}

function commandKey(roomId, commandId) {
  return `${commandPrefix(roomId)}${commandId}`;
}

function readCommands(roomId) {
  const prefix = commandPrefix(roomId);
  const commands = [];

  for (let index = 0; index < globalThis.localStorage.length; index += 1) {
    const key = globalThis.localStorage.key(index);
    if (!key?.startsWith(prefix)) continue;
    const command = readJson(key, null);
    if (command) commands.push(command);
  }

  return commands.sort((left, right) => (
    Number(left.createdAt) - Number(right.createdAt)
    || String(left.id).localeCompare(String(right.id))
  ));
}

export class LocalRoomGateway {
  constructor() {
    this.kind = 'local';
  }

  async ensurePlayer(nickname) {
    const cleanNickname = String(nickname || '').trim().slice(0, 28);
    if (!cleanNickname) throw new Error('Enter a nickname.');

    let id = globalThis.sessionStorage.getItem(PLAYER_KEY);
    if (!id) {
      id = makeId('local-player');
      globalThis.sessionStorage.setItem(PLAYER_KEY, id);
    }
    return { id, nickname: cleanNickname };
  }

  async createRoom(state) {
    const code = normalizeRoomCode(state.joinCode);
    const codeKey = `${CODE_PREFIX}${code}`;
    const existing = readJson(codeKey, globalThis.localStorage.getItem(codeKey));

    if (existing) {
      const existingExpiry = typeof existing === 'object' ? existing.expiresAtMs : null;
      if (!isExpired(existingExpiry)) {
        const error = new Error('Room code collision. Try again.');
        error.code = 'ROOM_CODE_COLLISION';
        throw error;
      }
    }

    const expiresAtMs = createExpiresAtMs();
    writeJson(`${ROOM_PREFIX}${state.roomId}`, state);
    writeJson(`${ROOM_META_PREFIX}${state.roomId}`, { expiresAtMs });
    writeJson(codeKey, { roomId: state.roomId, expiresAtMs });
    this.#broadcast(state.roomId, { type: 'room', state });
  }

  async resolveRoom(joinCode) {
    const codeKey = `${CODE_PREFIX}${normalizeRoomCode(joinCode)}`;
    const raw = globalThis.localStorage.getItem(codeKey);
    if (!raw) throw new Error('That room code is not available in this browser.');

    const record = readJson(codeKey, raw);
    const roomId = typeof record === 'string' ? record : record?.roomId;
    const expiresAtMs = typeof record === 'object' ? record?.expiresAtMs : null;

    if (!roomId || isExpired(expiresAtMs)) {
      globalThis.localStorage.removeItem(codeKey);
      throw new Error('That room has expired. Create a new match.');
    }
    return roomId;
  }

  subscribeRoom(roomId, handler) {
    const key = `${ROOM_PREFIX}${roomId}`;
    const metaKey = `${ROOM_META_PREFIX}${roomId}`;
    const channel = this.#channel(roomId);
    const emitCurrent = () => {
      const meta = readJson(metaKey, null);
      handler(meta && isExpired(meta.expiresAtMs) ? null : readJson(key, null));
    };
    const onStorage = event => {
      if (event.key === key || event.key === metaKey) emitCurrent();
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
    const prefix = commandPrefix(roomId);
    const channel = this.#channel(roomId);
    const seen = new Set();
    const accept = command => {
      if (!command || command.processedAt || seen.has(command.id)) return;
      seen.add(command.id);
      handler(command);
    };
    const scan = () => readCommands(roomId).forEach(accept);
    const onStorage = event => {
      if (event.key?.startsWith(prefix)) scan();
    };
    const onMessage = event => {
      if (event.data?.type === 'command') accept(event.data.command);
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
    const id = makeId('cmd');
    const record = {
      ...command,
      id,
      createdAt: Date.now(),
      processedAt: null,
    };
    writeJson(commandKey(roomId, id), record);
    this.#broadcast(roomId, { type: 'command', command: record });
    return id;
  }

  async markCommandProcessed(roomId, commandId) {
    const key = commandKey(roomId, commandId);
    const record = readJson(key, null);
    if (!record) return;
    record.processedAt = Date.now();
    writeJson(key, record);
  }

  async publishRoom(roomId, state) {
    writeJson(`${ROOM_PREFIX}${roomId}`, state);
    this.#broadcast(roomId, { type: 'room', state });
  }

  async setHostSecret(roomId, secret) {
    const meta = readJson(`${ROOM_META_PREFIX}${roomId}`, null);
    writeJson(`${SECRET_PREFIX}${roomId}`, {
      ...secret,
      expiresAtMs: meta?.expiresAtMs || createExpiresAtMs(),
    });
  }

  async getHostSecret(roomId) {
    const secret = readJson(`${SECRET_PREFIX}${roomId}`, null);
    return secret && !isExpired(secret.expiresAtMs) ? secret : null;
  }

  #channel(roomId) {
    return typeof globalThis.BroadcastChannel === 'function'
      ? new globalThis.BroadcastChannel(`jeoparody:h2h:${roomId}`)
      : null;
  }

  #broadcast(roomId, message) {
    const channel = this.#channel(roomId);
    channel?.postMessage(message);
    channel?.close();
  }
}
