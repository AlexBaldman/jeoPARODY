import { SHOW_EVENTS } from '../core/showEvents.js';

const roundTo = (value, precision = 1) => Number(value.toFixed(precision));

function safeEvent(event) {
  return {
    type: event.type,
    clueId: event.clueId,
    clueIndex: event.clueIndex,
    revealIndex: event.revealIndex,
    playerId: event.playerId || null,
    isSteal: Boolean(event.isSteal),
  };
}

export class SessionRecorder {
  constructor({ now = () => Date.now() } = {}) {
    this.now = now;
    this.reset();
  }

  reset() {
    this.startedAt = this.now();
    this.endedAt = null;
    this.events = [];
  }

  record(event, previous, next) {
    if (!event) return;
    if (event.type === SHOW_EVENTS.SESSION_RESTARTED) {
      this.reset();
      return;
    }

    this.events.push({
      ...safeEvent(event),
      elapsedMs: Math.max(0, this.now() - this.startedAt),
    });

    if (next.phase === 'complete' && previous.phase !== 'complete') this.endedAt = this.now();
  }

  summarize(state, episode) {
    const guesses = state.attempts.filter(attempt => !attempt.gaveUp && !attempt.passed);
    const accepted = guesses.filter(attempt => attempt.accepted);
    const resolvedAttempts = episode.clues.map(clue => (
      state.attempts.filter(attempt => attempt.clueId === clue.id).at(-1)
    )).filter(Boolean);
    const steals = accepted.filter(attempt => state.attempts.some(candidate => (
      candidate.clueId === attempt.clueId
      && candidate.playerId !== attempt.playerId
      && !candidate.accepted
      && !candidate.gaveUp
    ))).length;
    const revealDepth = resolvedAttempts.length
      ? resolvedAttempts.reduce((total, attempt) => total + attempt.revealIndex + 1, 0) / resolvedAttempts.length
      : 0;
    const finishedAt = this.endedAt || this.now();

    return {
      completed: state.phase === 'complete',
      correct: state.correct,
      clueCount: episode.clues.length,
      firstDropHits: accepted.filter(attempt => attempt.revealIndex === 0).length,
      guesses: guesses.length,
      replays: this.events.filter(event => event.type === SHOW_EVENTS.REVEAL_REPLAYED).length,
      revealsBought: this.events.filter(event => event.type === SHOW_EVENTS.REVEAL_PURCHASED).length,
      buzzes: this.events.filter(event => event.type === SHOW_EVENTS.BUZZ).length,
      steals,
      averageReveal: roundTo(revealDepth),
      durationSeconds: Math.max(0, Math.round((finishedAt - this.startedAt) / 1000)),
    };
  }
}

export function sessionResultText(state, episode, summary) {
  const session = episode.session || {};
  const score = state.players.length === 1
    ? state.score
    : Math.max(...state.players.map(player => player.score));
  const lines = [
    `NEEDLE DROP — ${session.formatLabel || 'Crate'}`,
    `${summary.correct}/${summary.clueCount} songs · ${score.toLocaleString()} pts`,
    `${summary.firstDropHits} first-drop hits · ${summary.replays} replays · ${summary.revealsBought} reveals bought`,
  ];
  if (state.players.length > 1) lines.push(`${summary.steals} steals · ${summary.buzzes} buzzes`);
  lines.push(`Mix ${session.seed || 'original'} · Project Crate Expectations`);
  return lines.join('\n');
}
