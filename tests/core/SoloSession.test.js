import { createSoloSession, SOLO_SESSION_PHASES } from '@/core/SoloSession.js';
import { SEASON_ZERO_EPISODE } from '@/content/seasonZeroEpisode.js';

describe('finite authored solo session', () => {
  test('Season Zero is exactly ten reviewed playable clues with aliases preserved', () => {
    expect(SEASON_ZERO_EPISODE.clues).toHaveLength(10);
    expect(SEASON_ZERO_EPISODE.episodeLength).toBe(10);
    expect(SEASON_ZERO_EPISODE.clues.every(clue => clue.question && clue.answer)).toBe(true);
    expect(SEASON_ZERO_EPISODE.clues.some(clue => clue.acceptedAnswers.length > 0)).toBe(true);

    const initials = SEASON_ZERO_EPISODE.clues
      .map(clue => clue.answer.trim().charAt(0).toUpperCase())
      .join('');
    expect(initials).toBe('BROADCASTO');
  });

  test('progress advances deterministically and completes only after the last clue', () => {
    const session = createSoloSession(SEASON_ZERO_EPISODE);

    expect(session.getProgress()).toMatchObject({
      phase: SOLO_SESSION_PHASES.IDLE,
      current: 0,
      total: 10,
      complete: false,
    });

    expect(session.start().id).toBe(SEASON_ZERO_EPISODE.clues[0].id);
    expect(session.getProgress()).toMatchObject({
      phase: SOLO_SESSION_PHASES.PLAYING,
      current: 1,
      remaining: 9,
      isLastClue: false,
    });

    for (let i = 1; i < 10; i += 1) {
      expect(session.advance().id).toBe(SEASON_ZERO_EPISODE.clues[i].id);
    }

    expect(session.getProgress()).toMatchObject({
      current: 10,
      remaining: 0,
      isLastClue: true,
      complete: false,
    });

    expect(session.advance()).toBeNull();
    expect(session.getProgress()).toMatchObject({
      phase: SOLO_SESSION_PHASES.COMPLETE,
      current: 10,
      remaining: 0,
      complete: true,
      isLastClue: false,
    });
  });

  test('restart returns to clue one without inventing a second session state tree', () => {
    const session = createSoloSession(SEASON_ZERO_EPISODE);
    session.start();
    session.advance();
    session.advance();

    expect(session.restart().id).toBe(SEASON_ZERO_EPISODE.clues[0].id);
    expect(session.getProgress().current).toBe(1);
  });

  test('invalid episode contracts fail before presentation receives them', () => {
    expect(() => createSoloSession(null)).toThrow(/requires an episode/i);
    expect(() => createSoloSession({ episodeLength: 0, clues: [] })).toThrow(/at least one clue/i);
    expect(() => createSoloSession({
      episodeLength: 2,
      clues: [{ question: 'q', answer: 'a' }],
    })).toThrow(/episodeLength/i);
  });
});
