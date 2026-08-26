import { demoEpisode } from '../../src/modes/needle-drop/core/content.js';
import {
  createFreshSeed,
  createSessionEpisode,
  createSessionUrl,
  normalizeCrateFormat,
  normalizeSeed,
  seededShuffle,
} from '../../src/modes/needle-drop/core/session.js';
import { createInitialState } from '../../src/modes/needle-drop/core/round.js';
import { createShowEvent } from '../../src/modes/needle-drop/core/showEvents.js';
import { SessionRecorder, sessionResultText } from '../../src/modes/needle-drop/services/sessionRecorder.js';

describe('Needle Drop session layer', () => {
  test('creates bounded formats without mutating the source episode', () => {
    const quick = createSessionEpisode(demoEpisode, { formatId: 'quick', seed: 'original' });
    expect(quick.clues).toHaveLength(3);
    expect(quick.clues[0]).toBe(demoEpisode.clues[0]);
    expect(demoEpisode.clues).toHaveLength(8);
    expect(quick.session).toEqual({ formatId: 'quick', formatLabel: 'Quick Hit', seed: 'original' });
  });

  test('uses a deterministic seed and preserves original order explicitly', () => {
    const ids = demoEpisode.clues.map(clue => clue.id);
    expect(seededShuffle(ids, 'original')).toEqual(ids);
    expect(seededShuffle(ids, 'crate-42')).toEqual(seededShuffle(ids, 'crate-42'));
    expect(seededShuffle(ids, 'crate-42')).not.toEqual(seededShuffle(ids, 'crate-43'));
  });

  test('normalizes hostile query values and creates stable session links', () => {
    expect(normalizeCrateFormat('the-entire-record-store').id).toBe('quick');
    expect(normalizeSeed('  DROP TABLE<script>  ')).toBe('droptablescript');
    expect(createSessionUrl({ playerCount: 9, formatId: 'quick', seed: 'A B' })).toBe('?players=4&crate=quick&seed=ab');
    expect(createFreshSeed(0.5)).toHaveLength(7);
  });

  test('records anonymous play mechanics and produces a shareable receipt', () => {
    let time = 1000;
    const recorder = new SessionRecorder({ now: () => time });
    const episode = createSessionEpisode(demoEpisode, { formatId: 'quick', seed: 'crate-42' });
    const previous = createInitialState(episode);
    const listening = { ...previous, phase: 'listening' };
    time = 1250;
    recorder.record(createShowEvent({ type: 'PLAY_REVEAL' }, previous, listening, episode), previous, listening);
    const state = {
      ...listening,
      phase: 'complete',
      score: 1000,
      correct: 1,
      attempts: [{ clueId: episode.clues[0].id, playerId: 'player-1', accepted: true, revealIndex: 0, points: 1000 }],
      players: [{ ...listening.players[0], score: 1000, correct: 1 }],
    };
    time = 3000;
    recorder.record(createShowEvent({ type: 'NEXT_CLUE' }, listening, state, episode), listening, state);
    const summary = recorder.summarize(state, episode);
    expect(summary).toMatchObject({ completed: true, correct: 1, clueCount: 3, firstDropHits: 1, durationSeconds: 2 });
    expect(sessionResultText(state, episode, summary)).toContain('Mix crate-42');
    expect(recorder.events.some(event => Object.hasOwn(event, 'answer'))).toBe(false);
  });
});
