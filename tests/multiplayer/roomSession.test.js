import {
  clearRoomSession,
  loadRoomSession,
  saveRoomSession,
} from '../../src/services/multiplayer/roomSession.js';

describe('multiplayer room session', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  test('round-trips the active tab identity and room', () => {
    saveRoomSession({
      roomId: 'room-1',
      player: { id: 'player-1', nickname: 'Alex' },
      transport: 'local',
    });

    expect(loadRoomSession()).toEqual({
      roomId: 'room-1',
      player: { id: 'player-1', nickname: 'Alex' },
      transport: 'local',
    });
  });

  test('clears stale recovery state', () => {
    saveRoomSession({
      roomId: 'room-1',
      player: { id: 'player-1', nickname: 'Alex' },
      transport: 'local',
    });
    clearRoomSession();
    expect(loadRoomSession()).toBeNull();
  });
});
