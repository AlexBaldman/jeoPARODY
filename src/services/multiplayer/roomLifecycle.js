export const ROOM_TTL_MS = 12 * 60 * 60 * 1000;

export function createExpiresAtMs(now = Date.now()) {
  return Number(now) + ROOM_TTL_MS;
}

export function isExpired(expiresAtMs, now = Date.now()) {
  if (expiresAtMs === null || expiresAtMs === undefined || expiresAtMs === '') {
    return false;
  }

  const value = Number(expiresAtMs);
  return Number.isFinite(value) && value <= Number(now);
}
