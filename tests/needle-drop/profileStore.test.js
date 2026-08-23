import { ProfileStore } from '../../src/modes/needle-drop/services/profileStore.js';

function createStorage(initialValue) {
  const values = new Map();
  if (initialValue) values.set('jeoparody.needle-drop.profile.v1', initialValue);
  return {
    getItem: key => values.get(key) || null,
    setItem: (key, value) => values.set(key, value),
  };
}

describe('Needle Drop local profile', () => {
  test('keeps the highest completed solo score', () => {
    const store = new ProfileStore(createStorage());
    expect(store.recordCompletedScore(2200, 'quick')).toEqual({
      bestScore: 2200,
      completedRuns: 1,
      bestScores: { quick: 2200 },
      settings: { showSound: true },
    });
    expect(store.recordCompletedScore(1800, 'quick')).toEqual({
      bestScore: 2200,
      completedRuns: 2,
      bestScores: { quick: 2200 },
      settings: { showSound: true },
    });
  });

  test('recovers from malformed storage', () => {
    const store = new ProfileStore(createStorage('{definitely not json'));
    expect(store.read()).toEqual({
      bestScore: 0,
      completedRuns: 0,
      bestScores: {},
      settings: { showSound: true },
    });
  });

  test('migrates the 1.2 best score into the full-crate format', () => {
    const store = new ProfileStore(createStorage(JSON.stringify({ bestScore: 4200, completedRuns: 3 })));
    expect(store.read()).toEqual({
      bestScore: 4200,
      completedRuns: 3,
      bestScores: { full: 4200 },
      settings: { showSound: true },
    });
  });

  test('persists show sound independently from scores', () => {
    const store = new ProfileStore(createStorage());
    expect(store.setShowSound(false).settings.showSound).toBe(false);
    expect(store.recordCompletedScore(900, 'quick')).toMatchObject({
      bestScores: { quick: 900 },
      settings: { showSound: false },
    });
  });
});
