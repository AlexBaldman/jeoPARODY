import { demoEpisode } from '../../src/modes/needle-drop/core/content.js';
import { createInitialState, reduceRound } from '../../src/modes/needle-drop/core/round.js';
import { createSessionEpisode } from '../../src/modes/needle-drop/core/session.js';
import { createShowEvent, SHOW_EVENTS } from '../../src/modes/needle-drop/core/showEvents.js';
import {
  performanceForEvent,
  ShowDirector,
  SHOW_SCENES,
} from '../../src/modes/needle-drop/presentation/showDirector.js';

const transition = (state, action, episode) => {
  const next = reduceRound(state, action, episode);
  return { next, event: createShowEvent(action, state, next, episode) };
};

describe('Needle Drop semantic show direction', () => {
  test('maps a typed answer to a sanitized correct event', () => {
    const episode = createSessionEpisode(demoEpisode, { formatId: 'quick', seed: 'crate-42' });
    let state = createInitialState(episode);
    state = transition(state, { type: 'PLAY_REVEAL' }, episode).next;
    state = transition(state, { type: 'REVEAL_FINISHED' }, episode).next;
    const { next, event } = transition(state, { type: 'SUBMIT_ANSWER', answer: episode.clues[0].title }, episode);
    expect(event).toMatchObject({ type: SHOW_EVENTS.CORRECT, points: 1000, isSteal: false });
    expect(JSON.stringify(event)).not.toContain(episode.clues[0].title);
    expect(performanceForEvent(event, next, episode)).toMatchObject({
      scene: SHOW_SCENES.CORRECT,
      cue: 'correct',
    });
  });

  test('recognizes and performs a multiplayer steal deterministically', () => {
    const episode = createSessionEpisode(demoEpisode, { formatId: 'quick', seed: 'original' });
    let state = createInitialState(episode, { playerCount: 2 });
    state = transition(state, { type: 'PLAY_REVEAL' }, episode).next;
    state = transition(state, { type: 'REVEAL_FINISHED' }, episode).next;
    state = transition(state, { type: 'BUZZ', playerId: 'player-1' }, episode).next;
    state = transition(state, { type: 'SUBMIT_ANSWER', answer: 'wrong' }, episode).next;
    state = transition(state, { type: 'BUZZ', playerId: 'player-2' }, episode).next;
    const { next, event } = transition(state, { type: 'SUBMIT_ANSWER', answer: 'Ode to Joy' }, episode);
    const first = performanceForEvent(event, next, episode);
    const second = performanceForEvent(event, next, episode);
    expect(event).toMatchObject({ type: SHOW_EVENTS.CORRECT, playerId: 'player-2', isSteal: true });
    expect(first).toEqual(second);
    expect(first).toMatchObject({ scene: SHOW_SCENES.CORRECT, cue: 'steal' });
    expect(first.call).toContain('Player 2');
  });

  test('routes one semantic event to caption and audio adapters and disposes cleanly', () => {
    const audio = { play: jest.fn(() => Promise.resolve(true)), stop: jest.fn() };
    const onPerformance = jest.fn();
    const director = new ShowDirector({ audio, onPerformance });
    const state = createInitialState(demoEpisode, { playerCount: 2 });
    const event = { type: SHOW_EVENTS.BUZZ, clueId: demoEpisode.clues[0].id, playerId: 'player-1' };
    const performance = director.perform(event, state, demoEpisode);
    expect(performance).toMatchObject({ scene: SHOW_SCENES.PLAYER_ANSWER, cue: 'buzz' });
    expect(onPerformance).toHaveBeenCalledWith(performance);
    expect(audio.play).toHaveBeenCalledWith('buzz');
    director.dispose();
    expect(audio.stop).toHaveBeenCalled();
  });

  test('directs a tied finale without inventing a winner', () => {
    const state = { ...createInitialState(demoEpisode, { playerCount: 2 }), phase: 'complete' };
    const event = { type: SHOW_EVENTS.WINNER, clueId: demoEpisode.clues[0].id };
    const performance = performanceForEvent(event, state, demoEpisode);
    expect(performance).toMatchObject({ scene: SHOW_SCENES.WINNER, cue: 'winner' });
    expect(performance.call.toLowerCase()).toContain('tie');
  });
});
