import { demoEpisode } from '../../src/modes/needle-drop/core/content.js';
import { createInitialState } from '../../src/modes/needle-drop/core/round.js';
import { createSessionEpisode } from '../../src/modes/needle-drop/core/session.js';
import { renderApp } from '../../src/modes/needle-drop/presentation/markup.js';

describe('Needle Drop presentation contract', () => {
  test('renders onboarding, active player count, and a locked pre-listen answer', () => {
    const state = createInitialState(demoEpisode, { playerCount: 3 });
    const markup = renderApp(state, demoEpisode, { profile: { bestScore: 0 } });
    expect(markup).toContain('How to play');
    expect(markup).toContain('href="?players=3&amp;crate=full&amp;seed=original" aria-current="page"');
    expect(markup).toContain('Crate length');
    expect(markup).toContain('Full Crate');
    expect(markup).toContain('Listen before answering');
    expect(markup).toContain('name="answer" autocomplete="off"');
    expect(markup).toContain('disabled');
    expect(markup).toContain('TRACK 1/8');
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
    expect(markup).toContain('Rematch same crate');
    expect(markup).toContain('Fresh crate');
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
