export const SHOW_EVENTS = Object.freeze({
  REVEAL_STARTED: 'REVEAL_STARTED',
  REVEAL_REPLAYED: 'REVEAL_REPLAYED',
  REVEAL_READY: 'REVEAL_READY',
  BUZZ: 'BUZZ',
  CORRECT: 'CORRECT',
  WRONG: 'WRONG',
  PASS: 'PASS',
  REVEAL_PURCHASED: 'REVEAL_PURCHASED',
  CLUE_REVEALED: 'CLUE_REVEALED',
  ROUND_TRANSITION: 'ROUND_TRANSITION',
  WINNER: 'WINNER',
  AUDIO_ERROR: 'AUDIO_ERROR',
  SESSION_RESTARTED: 'SESSION_RESTARTED',
});

function baseEvent(type, next, episode) {
  const clue = episode.clues[next.clueIndex];
  return {
    type,
    episodeId: episode.id,
    packageVersion: episode.packageVersion,
    clueId: clue?.id || null,
    clueIndex: next.clueIndex,
    revealIndex: next.revealIndex,
  };
}

export function createShowEvent(action, previous, next, episode) {
  let type;
  switch (action.type) {
    case 'PLAY_REVEAL':
      type = previous.listenedRevealIndex >= previous.revealIndex
        ? SHOW_EVENTS.REVEAL_REPLAYED
        : SHOW_EVENTS.REVEAL_STARTED;
      break;
    case 'REVEAL_FINISHED':
      type = SHOW_EVENTS.REVEAL_READY;
      break;
    case 'BUZZ':
      type = SHOW_EVENTS.BUZZ;
      break;
    case 'SUBMIT_ANSWER':
      type = next.lastAttempt?.accepted ? SHOW_EVENTS.CORRECT : SHOW_EVENTS.WRONG;
      break;
    case 'PASS':
      type = SHOW_EVENTS.PASS;
      break;
    case 'MORE_AUDIO':
      type = SHOW_EVENTS.REVEAL_PURCHASED;
      break;
    case 'GIVE_UP':
      type = SHOW_EVENTS.CLUE_REVEALED;
      break;
    case 'NEXT_CLUE':
      type = next.phase === 'complete' ? SHOW_EVENTS.WINNER : SHOW_EVENTS.ROUND_TRANSITION;
      break;
    case 'AUDIO_FAILED':
      type = SHOW_EVENTS.AUDIO_ERROR;
      break;
    case 'RESTART':
      type = SHOW_EVENTS.SESSION_RESTARTED;
      break;
    default:
      return null;
  }

  const event = baseEvent(type, next, episode);
  const playerId = action.playerId || next.lastAttempt?.playerId || previous.activePlayerId || null;
  if (playerId) event.playerId = playerId;
  if (next.lastAttempt?.points) event.points = next.lastAttempt.points;
  if (type === SHOW_EVENTS.CORRECT) {
    event.isSteal = previous.attempts.some(attempt => (
      attempt.clueId === event.clueId
      && attempt.playerId !== event.playerId
      && !attempt.accepted
    ));
  }
  if (type === SHOW_EVENTS.AUDIO_ERROR) event.message = next.audioError;
  return Object.freeze(event);
}
