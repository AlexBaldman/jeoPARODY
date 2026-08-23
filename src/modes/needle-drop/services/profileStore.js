const STORAGE_KEY = 'jeoparody.needle-drop.profile.v1';

const EMPTY_PROFILE = Object.freeze({
  bestScore: 0,
  completedRuns: 0,
  bestScores: Object.freeze({}),
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

      const bestScore = Math.max(0, Number(value.bestScore) || 0);
      const bestScores = Object.fromEntries(
        Object.entries(value.bestScores || {})
          .filter(([key]) => ['quick', 'side-a', 'full'].includes(key))
          .map(([key, score]) => [key, Math.max(0, Number(score) || 0)]),
      );
      if (!Object.keys(bestScores).length && bestScore) bestScores.full = bestScore;

      return { bestScore, completedRuns: Math.max(0, Number(value.completedRuns) || 0), bestScores };
    } catch {
      return { ...EMPTY_PROFILE };
    }
  }

  recordCompletedScore(score, formatId = 'full') {
    const current = this.read();
    const safeScore = Math.max(0, Number(score) || 0);
    const safeFormat = ['quick', 'side-a', 'full'].includes(formatId) ? formatId : 'full';
    const next = {
      bestScore: Math.max(current.bestScore, safeScore),
      completedRuns: current.completedRuns + 1,
      bestScores: {
        ...current.bestScores,
        [safeFormat]: Math.max(current.bestScores[safeFormat] || 0, safeScore),
      },
    };

    try {
      this.storage?.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage can be unavailable in private or embedded contexts. The game remains playable.
    }

    return next;
  }
}
