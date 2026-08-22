import { demoEpisode } from '../../src/modes/needle-drop/core/content.js';
import { createInitialState } from '../../src/modes/needle-drop/core/round.js';
import { renderApp } from '../../src/modes/needle-drop/presentation/markup.js';

describe('Needle Drop presentation contract', () => {
  test('renders onboarding, active player count, and a locked pre-listen answer', () => {
    const state = createInitialState(demoEpisode, { playerCount: 3 });
    const markup = renderApp(state, demoEpisode, { profile: { bestScore: 0 } });
    expect(markup).toContain('How to play');
    expect(markup).toContain('href="?players=3" aria-current="page"');
    expect(markup).toContain('Listen before answering');
    expect(markup).toContain('name="answer" autocomplete="off"');
    expect(markup).toContain('disabled');
    expect(markup).toContain('TRACK 1/8');
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
