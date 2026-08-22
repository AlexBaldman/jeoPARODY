const STORAGE_KEY = 'jeoparody.needle-drop.profile.v1';

const EMPTY_PROFILE = Object.freeze({
  bestScore: 0,
  completedRuns: 0,
});

export class ProfileStore {
  constructor(storage) {
    try {
      this.storage = storage || window.localStorage;
    } catch {
      this.storage = null;
    }
  }

  read() {
    try {
      const value = JSON.parse(this.storage?.getItem(STORAGE_KEY) || 'null');
      if (!value || typeof value !== 'object') return { ...EMPTY_PROFILE };

      return {
        bestScore: Math.max(0, Number(value.bestScore) || 0),
        completedRuns: Math.max(0, Number(value.completedRuns) || 0),
      };
    } catch {
      return { ...EMPTY_PROFILE };
    }
  }

  recordCompletedScore(score) {
    const current = this.read();
    const next = {
      bestScore: Math.max(current.bestScore, Math.max(0, Number(score) || 0)),
      completedRuns: current.completedRuns + 1,
    };

    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage can be unavailable in private or embedded contexts. The game remains playable.
    }

    return next;
  }
}
