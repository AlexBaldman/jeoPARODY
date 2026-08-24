import {
  addPlayer,
  canStartMatch,
  createMatchState,
  finishMatch,
  hasEveryOutcome,
  MATCH_PHASES,
  openRound,
  recordOutcome,
  revealRound,
  setPlayerReady,
} from '../../src/modes/head-to-head/core/match.js';

function lobby() {
  let state = createMatchState({
    roomId: 'room-1',
    joinCode: 'B7K9P',
    host: { id: 'host', nickname: 'Host' },
    totalRounds: 1,
  });
  state = addPlayer(state, { id: 'guest', nickname: 'Guest' });
  state = setPlayerReady(state, 'host', true);
  state = setPlayerReady(state, 'guest', true);
  return state;
}

describe('head-to-head match truth', () => {
  test('requires two ready players to start', () => {
    const state = lobby();
    expect(canStartMatch(state)).toBe(true);
  });

  test('keeps raw player answers out of public state', () => {
    let state = openRound(lobby(), {
      id: 'q1',
      prompt: 'Largest planet?',
      category: 'Space',
      value: 200,
    });

    state = recordOutcome(state, {
      playerId: 'host',
      isCorrect: true,
      points: 200,
    });
    state = recordOutcome(state, {
      playerId: 'guest',
      isCorrect: false,
      points: 200,
    });

    expect(hasEveryOutcome(state)).toBe(true);
    expect(JSON.stringify(state)).not.toContain('Jupiter');
    state = revealRound(state, 'Jupiter');
    expect(state.phase).toBe(MATCH_PHASES.ROUND_RESULT);
    expect(state.players.find(player => player.id === 'host').score).toBe(200);
  });

  test('declares tied winners deterministically', () => {
    const state = finishMatch(lobby());
    expect(state.phase).toBe(MATCH_PHASES.COMPLETE);
    expect(state.winnerIds).toEqual(['host', 'guest']);
  });
});
