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
    expect(store.recordCompletedScore(2200)).toEqual({ bestScore: 2200, completedRuns: 1 });
    expect(store.recordCompletedScore(1800)).toEqual({ bestScore: 2200, completedRuns: 2 });
  });

  test('recovers from malformed storage', () => {
    const store = new ProfileStore(createStorage('{definitely not json'));
    expect(store.read()).toEqual({ bestScore: 0, completedRuns: 0 });
  });
});
