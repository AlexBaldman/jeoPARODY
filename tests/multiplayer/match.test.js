import {
  addPlayer,
  canStartMatch,
  createMatchState,
  finishMatch,
  hasEverySubmission,
  MATCH_PHASES,
  openRound,
  recordSubmission,
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

  test('keeps answer text and adjudication private until reveal', () => {
    let state = openRound(lobby(), {
      id: 'q1',
      prompt: 'Largest planet?',
      category: 'Space',
      value: 200,
    });

    state = recordSubmission(state, 'host');
    expect(state.round.submittedPlayerIds).toEqual(['host']);
    expect(state.round.outcomes).toEqual({});
    expect(state.players.find(player => player.id === 'host').score).toBe(0);

    state = recordSubmission(state, 'guest');
    expect(hasEverySubmission(state)).toBe(true);
    expect(JSON.stringify(state)).not.toContain('Jupiter');
    expect(state.round.outcomes).toEqual({});

    state = revealRound(state, 'Jupiter', {
      host: { isCorrect: true, points: 200 },
      guest: { isCorrect: false, points: 0 },
    });

    expect(state.phase).toBe(MATCH_PHASES.ROUND_RESULT);
    expect(state.round.answerReveal).toBe('Jupiter');
    expect(state.round.outcomes.host.isCorrect).toBe(true);
    expect(state.players.find(player => player.id === 'host').score).toBe(200);
  });

  test('declares tied winners deterministically', () => {
    const state = finishMatch(lobby());
    expect(state.phase).toBe(MATCH_PHASES.COMPLETE);
    expect(state.winnerIds).toEqual(['host', 'guest']);
  });
});
