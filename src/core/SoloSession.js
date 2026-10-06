export const SOLO_SESSION_PHASES = Object.freeze({
  IDLE: 'idle',
  PLAYING: 'playing',
  COMPLETE: 'complete',
});

function validateEpisode(episode) {
  if (!episode || typeof episode !== 'object') {
    throw new Error('SoloSession requires an episode.');
  }
  if (!Array.isArray(episode.clues) || episode.clues.length === 0) {
    throw new Error('SoloSession requires at least one clue.');
  }
  if (episode.episodeLength && episode.episodeLength !== episode.clues.length) {
    throw new Error('SoloSession episodeLength must match the playable clue count.');
  }
  for (const clue of episode.clues) {
    if (!clue?.question || !clue?.answer) {
      throw new Error('Every solo-session clue needs question and answer text.');
    }
  }
}

export class SoloSession {
  constructor(episode) {
    validateEpisode(episode);
    this.episode = episode;
    this.phase = SOLO_SESSION_PHASES.IDLE;
    this.index = -1;
  }

  start() {
    this.phase = SOLO_SESSION_PHASES.PLAYING;
    this.index = 0;
    return this.current();
  }

  current() {
    if (this.phase !== SOLO_SESSION_PHASES.PLAYING) return null;
    return this.episode.clues[this.index] || null;
  }

  advance() {
    if (this.phase !== SOLO_SESSION_PHASES.PLAYING) return null;

    if (this.index >= this.episode.clues.length - 1) {
      this.phase = SOLO_SESSION_PHASES.COMPLETE;
      this.index = this.episode.clues.length;
      return null;
    }

    this.index += 1;
    return this.current();
  }

  restart() {
    return this.start();
  }

  getProgress() {
    const total = this.episode.clues.length;
    const complete = this.phase === SOLO_SESSION_PHASES.COMPLETE;
    const current = this.phase === SOLO_SESSION_PHASES.IDLE
      ? 0
      : complete
        ? total
        : this.index + 1;

    return {
      episodeId: this.episode.id,
      title: this.episode.title,
      phase: this.phase,
      current,
      total,
      remaining: Math.max(0, total - current),
      complete,
      isLastClue: this.phase === SOLO_SESSION_PHASES.PLAYING && this.index === total - 1,
    };
  }
}

export function createSoloSession(episode) {
  return new SoloSession(episode);
}
