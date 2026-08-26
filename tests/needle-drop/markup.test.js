import { demoEpisode } from '../../src/modes/needle-drop/core/content.js';
import { createInitialState } from '../../src/modes/needle-drop/core/round.js';
import { createSessionEpisode } from '../../src/modes/needle-drop/core/session.js';
import { renderApp } from '../../src/modes/needle-drop/presentation/markup.js';

describe('Needle Drop presentation contract', () => {
  test('renders a plain-language doorway, hidden setup, and locked pre-listen choices', () => {
    const episode = createSessionEpisode(demoEpisode, { formatId: 'quick', seed: 'original' });
    const state = createInitialState(episode, { playerCount: 3 });
    const markup = renderApp(state, episode, { profile: { bestScore: 0 } });
    expect(markup).toContain('Hear a tiny clip. Name the song.');
    expect(markup).toContain('Play clip <b>→</b> choose title');
    expect(markup).toContain('Change game');
    expect(markup).toContain('href="?players=3&amp;crate=quick&amp;seed=original" aria-current="page"');
    expect(markup).toContain('Crate length');
    expect(markup).toContain('Full Crate');
    expect(markup).toContain('aria-label="Show sound on"');
    expect(markup).toContain('▶ Play 1-second clip');
    expect(markup).toContain('Choices unlock after the clip');
    expect(markup).toContain('data-answer="Ode to Joy"');
    expect(markup).toContain('disabled');
    expect(markup).toContain('SONG 1 OF 3');
  });

  test('renders a captioned result performance and sound preference', () => {
    const episode = createSessionEpisode(demoEpisode, { formatId: 'quick', seed: 'original' });
    const state = {
      ...createInitialState(episode),
      phase: 'resolved',
      result: { accepted: false, playerId: null, points: 0 },
    };
    const markup = renderApp(state, episode, {
      profile: { bestScores: {}, settings: { showSound: false } },
      showSoundEnabled: false,
      performance: { scene: 'WRONG', call: '<the booth objects>', cue: 'wrong' },
    });
    expect(markup).toContain('data-scene="WRONG"');
    expect(markup).toContain('aria-label="Show sound off"');
    expect(markup).toContain('&lt;the booth objects&gt;');
    expect(markup).toContain('ORIGINAL COMPOSITION');
    expect(markup).toContain('HOUSE-BAND FLIP');
  });

  test('renders a quick-format finale receipt and rematch controls', () => {
    const episode = createSessionEpisode(demoEpisode, { formatId: 'quick', seed: 'crate-42' });
    const state = {
      ...createInitialState(episode),
      phase: 'complete',
      score: 1000,
      correct: 1,
      players: [{ ...createInitialState(episode).players[0], score: 1000, correct: 1 }],
    };
    const markup = renderApp(state, episode, {
      profile: { bestScores: { quick: 1000 } },
      session: episode.session,
      sessionSummary: {
        firstDropHits: 1,
        guesses: 2,
        replays: 0,
        revealsBought: 1,
        buzzes: 0,
        steals: 0,
        averageReveal: 1.3,
        durationSeconds: 44,
      },
      freshCrateUrl: '?players=1&crate=quick&seed=fresh',
    });
    expect(markup).toContain('SESSION RECEIPT');
    expect(markup).toContain('Play again');
    expect(markup).toContain('New mix');
    expect(markup).toContain('FORMAT BEST');
  });

  test('escapes authored content at the presentation boundary', () => {
    const episode = {
      ...demoEpisode,
      clues: [{ ...demoEpisode.clues[0], prompt: '<script>bad()</script>' }],
    };
    const state = createInitialState(episode);
    expect(renderApp(state, episode, { profile: { bestScore: 0 } })).toContain('&lt;script&gt;');
  });
});
