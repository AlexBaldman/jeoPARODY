import { demoEpisode, validateEpisode } from '../../src/modes/needle-drop/core/content.js';
import {
  createInitialState,
  isAcceptedAnswer,
  normalizeAnswer,
  reduceRound,
  scoreForReveal,
  ROUND_PHASES,
} from '../../src/modes/needle-drop/core/round.js';

const hearReveal = state => reduceRound(
  reduceRound(state, { type: 'PLAY_REVEAL' }, demoEpisode),
  { type: 'REVEAL_FINISHED' },
  demoEpisode,
);

describe('Needle Drop truth kernel', () => {
  test('normalizes punctuation, articles, accents, and ampersands', () => {
    expect(normalizeAnswer('  The Rhýthm & Blues!  ')).toBe('rhythm and blues');
  });

  test('accepts only authored aliases', () => {
    expect(isAcceptedAnswer('The Ode to Joy!', demoEpisode.clues[0].acceptedAnswers)).toBe(true);
    expect(isAcceptedAnswer('something vaguely funky', demoEpisode.clues[0].acceptedAnswers)).toBe(false);
  });

  test('reveal value decreases while streak bonus is capped', () => {
    expect(scoreForReveal({ points: 1000 }, 9)).toBe(1200);
    expect(scoreForReveal({ points: 250 }, 0)).toBe(250);
  });

  test('requires the current reveal to be heard before answering or buying audio', () => {
    const state = createInitialState(demoEpisode);
    expect(reduceRound(state, { type: 'SUBMIT_ANSWER', answer: 'Ode to Joy' }, demoEpisode)).toBe(state);
    expect(reduceRound(state, { type: 'MORE_AUDIO' }, demoEpisode)).toBe(state);
  });

  test('runs a deterministic correct-answer transition', () => {
    let state = hearReveal(createInitialState(demoEpisode));
    state = reduceRound(state, { type: 'SUBMIT_ANSWER', answer: 'Ode to Joy' }, demoEpisode);
    expect(state).toMatchObject({
      phase: ROUND_PHASES.RESOLVED,
      score: 1000,
      streak: 1,
      correct: 1,
    });
    expect(state.players[0]).toMatchObject({ score: 1000, streak: 1, correct: 1 });
    expect(state.attempts).toHaveLength(1);
  });

  test('turns a solo miss into a lower-value retry instead of ending the clue', () => {
    let state = hearReveal(createInitialState(demoEpisode));
    state = reduceRound(state, { type: 'SUBMIT_ANSWER', answer: 'Definitely Prince' }, demoEpisode);
    expect(state).toMatchObject({ phase: ROUND_PHASES.ANSWERING, activePlayerId: null });
    expect(state.blockedPlayerIds).toEqual(['player-1']);

    state = reduceRound(state, { type: 'MORE_AUDIO' }, demoEpisode);
    expect(state).toMatchObject({ phase: ROUND_PHASES.READY, revealIndex: 1 });
    expect(state.blockedPlayerIds).toEqual([]);

    state = hearReveal(state);
    state = reduceRound(state, { type: 'SUBMIT_ANSWER', answer: 'Ode to Joy' }, demoEpisode);
    expect(state.result.points).toBe(750);
  });

  test('keeps replay, longer audio, and surrender available during a solo answer turn', () => {
    const heard = hearReveal(createInitialState(demoEpisode));
    expect(heard.activePlayerId).toBe('player-1');
    expect(reduceRound(heard, { type: 'PLAY_REVEAL' }, demoEpisode).phase).toBe(ROUND_PHASES.LISTENING);
    expect(reduceRound(heard, { type: 'MORE_AUDIO' }, demoEpisode)).toMatchObject({
      phase: ROUND_PHASES.READY,
      revealIndex: 1,
      activePlayerId: null,
    });
    expect(reduceRound(heard, { type: 'GIVE_UP' }, demoEpisode).phase).toBe(ROUND_PHASES.RESOLVED);
  });

  test('opens a steal after a wrong multiplayer answer', () => {
    let state = hearReveal(createInitialState(demoEpisode, { playerCount: 4 }));
    state = reduceRound(state, { type: 'BUZZ', playerId: 'player-1' }, demoEpisode);
    state = reduceRound(state, { type: 'SUBMIT_ANSWER', answer: 'Wrong groove' }, demoEpisode);
    expect(state.phase).toBe(ROUND_PHASES.ANSWERING);
    expect(state.blockedPlayerIds).toContain('player-1');

    state = reduceRound(state, { type: 'BUZZ', playerId: 'player-2' }, demoEpisode);
    state = reduceRound(state, { type: 'SUBMIT_ANSWER', answer: 'Ode to Joy' }, demoEpisode);
    expect(state.phase).toBe(ROUND_PHASES.RESOLVED);
    expect(state.players[1]).toMatchObject({ score: 1000, correct: 1 });
    expect(state.players[0]).toMatchObject({ score: 0, streak: 0, attempts: 1 });
  });

  test('lets a buzz winner pass the mic without inventing an answer', () => {
    let state = hearReveal(createInitialState(demoEpisode, { playerCount: 2 }));
    state = reduceRound(state, { type: 'BUZZ', playerId: 'player-1' }, demoEpisode);
    state = reduceRound(state, { type: 'PASS' }, demoEpisode);
    expect(state.phase).toBe(ROUND_PHASES.ANSWERING);
    expect(state.activePlayerId).toBeNull();
    expect(state.blockedPlayerIds).toEqual(['player-1']);
    expect(state.lastAttempt).toMatchObject({ passed: true, answer: '' });
  });

  test('rejects buzzes before playback and from locked-out players', () => {
    let state = createInitialState(demoEpisode, { playerCount: 2 });
    expect(reduceRound(state, { type: 'BUZZ', playerId: 'player-1' }, demoEpisode)).toBe(state);
    state = hearReveal(state);
    state = reduceRound(state, { type: 'BUZZ', playerId: 'player-1' }, demoEpisode);
    state = reduceRound(state, { type: 'SUBMIT_ANSWER', answer: 'wrong' }, demoEpisode);
    expect(reduceRound(state, { type: 'BUZZ', playerId: 'player-1' }, demoEpisode)).toBe(state);
  });

  test('allows the room to reveal the answer after hearing audio', () => {
    let state = hearReveal(createInitialState(demoEpisode, { playerCount: 2 }));
    state = reduceRound(state, { type: 'GIVE_UP' }, demoEpisode);
    expect(state).toMatchObject({ phase: ROUND_PHASES.RESOLVED, correct: 0 });
    expect(state.result).toMatchObject({ gaveUp: true, accepted: false });
  });

  test('recovers from an audio failure without pretending the reveal was heard', () => {
    let state = createInitialState(demoEpisode);
    state = reduceRound(state, { type: 'PLAY_REVEAL' }, demoEpisode);
    state = reduceRound(state, { type: 'AUDIO_FAILED', message: 'speaker on vacation' }, demoEpisode);
    expect(state).toMatchObject({
      phase: ROUND_PHASES.READY,
      listenedRevealIndex: -1,
      audioError: 'speaker on vacation',
    });
  });

  test('does not permit buying audio after resolution', () => {
    let state = hearReveal(createInitialState(demoEpisode));
    state = reduceRound(state, { type: 'GIVE_UP' }, demoEpisode);
    expect(reduceRound(state, { type: 'MORE_AUDIO' }, demoEpisode)).toBe(state);
  });

  test('ships a larger valid demo crate', () => {
    expect(validateEpisode(demoEpisode)).toEqual([]);
    expect(demoEpisode.clues).toHaveLength(8);
    expect(demoEpisode.clues.every(clue => clue.choices.length === 4)).toBe(true);
    expect(demoEpisode.clues.every(clue => clue.rights.basis.includes('public-domain'))).toBe(true);
  });

  test('blocks an expired rights package', () => {
    const expired = {
      ...demoEpisode,
      clues: [{
        ...demoEpisode.clues[0],
        rights: { ...demoEpisode.clues[0].rights, expiresOn: '2025-01-01' },
      }],
    };
    expect(validateEpisode(expired, '2026-08-22')).toContain('clues[0].rights are expired');
  });
});
