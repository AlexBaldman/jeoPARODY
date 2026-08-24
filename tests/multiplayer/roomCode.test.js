import {
  generateRoomCode,
  normalizeRoomCode,
} from '../../src/services/multiplayer/roomCode.js';

describe('room codes', () => {
  test('normalizes human input', () => {
    expect(normalizeRoomCode(' b7-k9p ')).toBe('B7K9P');
  });

  test('generates deterministic codes with an injected random source', () => {
    expect(generateRoomCode(5, () => 0)).toBe('AAAAA');
  });

  test('rejects unreasonable lengths', () => {
    expect(() => generateRoomCode(3)).toThrow();
  });
});
