import {
  createExpiresAtMs,
  isExpired,
  ROOM_TTL_MS,
} from '../../src/services/multiplayer/roomLifecycle.js';

describe('multiplayer room lifecycle', () => {
  test('uses a fixed 12-hour proving-room lifetime', () => {
    const now = 1_000;
    expect(createExpiresAtMs(now)).toBe(now + ROOM_TTL_MS);
    expect(ROOM_TTL_MS).toBe(12 * 60 * 60 * 1000);
  });

  test('treats only finite elapsed timestamps as expired', () => {
    expect(isExpired(999, 1_000)).toBe(true);
    expect(isExpired(1_001, 1_000)).toBe(false);
    expect(isExpired(null, 1_000)).toBe(false);
  });
});
