const SESSION_KEY = 'jeoparody:h2h:room-session';

export function saveRoomSession({ roomId, player, transport }) {
  if (!roomId || !player?.id || !player?.nickname) return;

  try {
    globalThis.sessionStorage.setItem(SESSION_KEY, JSON.stringify({
      roomId,
      player: {
        id: player.id,
        nickname: player.nickname,
      },
      transport: transport || null,
    }));
  } catch {
    // Session recovery is optional; gameplay must continue when storage is blocked.
  }
}

export function loadRoomSession() {
  try {
    const value = JSON.parse(globalThis.sessionStorage.getItem(SESSION_KEY));
    if (!value?.roomId || !value?.player?.id || !value?.player?.nickname) return null;
    return value;
  } catch {
    return null;
  }
}

export function clearRoomSession() {
  try {
    globalThis.sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing useful to do if session storage is unavailable.
  }
}
