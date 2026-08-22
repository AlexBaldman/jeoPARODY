import {
  awardPlayer,
  claimBuzz,
  createPlayers,
  playerForKey,
  rankPlayers,
  recordPlayerAttempt,
} from '../../src/modes/needle-drop/core/party.js';

describe('Needle Drop couch session', () => {
  test('creates one to four deterministic player seats', () => {
    expect(createPlayers(9)).toHaveLength(4);
    expect(createPlayers(0)).toHaveLength(1);
    expect(createPlayers(3).map(player => player.buzzKey)).toEqual(['1', '2', '3']);
  });

  test('first valid eligible buzz owns the turn', () => {
    const players = createPlayers(4);
    expect(claimBuzz(players, null, 'player-2')).toBe('player-2');
    expect(claimBuzz(players, 'player-2', 'player-1')).toBe('player-2');
    expect(claimBuzz(players, null, 'player-1', ['player-1'])).toBeNull();
  });

  test('maps keyboard input and awards immutably', () => {
    const players = createPlayers(2);
    expect(playerForKey(players, '2').id).toBe('player-2');
    const awarded = awardPlayer(players, 'player-2', 750);
    expect(awarded[1]).toMatchObject({ score: 750, streak: 1, correct: 1, attempts: 1 });
    expect(players[1].score).toBe(0);
  });

  test('resets a player streak on a miss and ranks the room deterministically', () => {
    let players = createPlayers(3);
    players = recordPlayerAttempt(players, 'player-2', { accepted: true, points: 500 });
    players = recordPlayerAttempt(players, 'player-2', { accepted: false, points: 0 });
    players = recordPlayerAttempt(players, 'player-3', { accepted: true, points: 750 });
    expect(players[1].streak).toBe(0);
    expect(rankPlayers(players).map(player => player.id)).toEqual(['player-3', 'player-2', 'player-1']);
  });
});
