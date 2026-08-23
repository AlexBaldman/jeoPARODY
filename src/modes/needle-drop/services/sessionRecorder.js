const roundTo = (value, precision = 1) => Number(value.toFixed(precision));

function safeAction(action, next) {
  return {
    type: action.type,
    clueIndex: next.clueIndex,
    revealIndex: next.revealIndex,
    playerId: action.playerId || next.lastAttempt?.playerId || null,
    accepted: action.type === 'SUBMIT_ANSWER' ? Boolean(next.lastAttempt?.accepted) : undefined,
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

  record(action, previous, next) {
    if (action.type === 'RESTART') {
      this.reset();
      return;
    }

    this.events.push({
      ...safeAction(action, next),
      elapsedMs: Math.max(0, this.now() - this.startedAt),
      replay: action.type === 'PLAY_REVEAL'
        && previous.listenedRevealIndex >= previous.revealIndex,
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
      replays: this.events.filter(event => event.replay).length,
      revealsBought: this.events.filter(event => event.type === 'MORE_AUDIO').length,
      buzzes: this.events.filter(event => event.type === 'BUZZ').length,
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
    `${summary.correct}/${summary.clueCount} records · ${score.toLocaleString()} pts`,
    `${summary.firstDropHits} first-drop hits · ${summary.replays} replays · ${summary.revealsBought} reveals bought`,
  ];
  if (state.players.length > 1) lines.push(`${summary.steals} steals · ${summary.buzzes} buzzes`);
  lines.push(`Crate ${session.seed || 'original'} · Project Crate Expectations`);
  return lines.join('\n');
}
