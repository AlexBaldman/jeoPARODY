export const ROUND_PHASES = Object.freeze({ READY:'ready', LISTENING:'listening', ANSWERING:'answering', RESOLVED:'resolved', COMPLETE:'complete' });

export function normalizeAnswer(value = '') {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, ' ').trim().replace(/^(the|a|an)\s+/, '').replace(/\s+/g, ' ');
}

export function isAcceptedAnswer(answer, acceptedAnswers) {
  const normalized = normalizeAnswer(answer);
  return normalized.length > 0 && acceptedAnswers.some(candidate => normalizeAnswer(candidate) === normalized);
}

export function scoreForReveal(reveal, streak = 0) { return Math.max(0, reveal.points + Math.min(streak, 4) * 50); }

export function createInitialState(episode) {
  return { phase:ROUND_PHASES.READY, episodeId:episode.id, clueIndex:0, revealIndex:0, score:0, streak:0, correct:0, attempts:[], result:null };
}

export function reduceRound(state, action, episode) {
  const clue = episode.clues[state.clueIndex];
  switch (action.type) {
    case 'PLAY_REVEAL':
      if ([ROUND_PHASES.RESOLVED, ROUND_PHASES.COMPLETE].includes(state.phase)) return state;
      return { ...state, phase:ROUND_PHASES.LISTENING };
    case 'REVEAL_FINISHED': return state.phase === ROUND_PHASES.LISTENING ? { ...state, phase:ROUND_PHASES.ANSWERING } : state;
    case 'MORE_AUDIO':
      if (state.phase === ROUND_PHASES.RESOLVED || state.revealIndex >= clue.reveals.length - 1) return state;
      return { ...state, revealIndex:state.revealIndex + 1, phase:ROUND_PHASES.READY };
    case 'SUBMIT_ANSWER': {
      if ([ROUND_PHASES.RESOLVED, ROUND_PHASES.COMPLETE].includes(state.phase)) return state;
      const accepted = isAcceptedAnswer(action.answer, clue.acceptedAnswers);
      const points = accepted ? scoreForReveal(clue.reveals[state.revealIndex], state.streak) : 0;
      const attempt = { clueId:clue.id, answer:action.answer, accepted, revealIndex:state.revealIndex, points };
      return { ...state, phase:ROUND_PHASES.RESOLVED, score:state.score + points, streak:accepted ? state.streak + 1 : 0, correct:state.correct + (accepted ? 1 : 0), attempts:[...state.attempts, attempt], result:attempt };
    }
    case 'NEXT_CLUE': {
      if (state.phase !== ROUND_PHASES.RESOLVED) return state;
      const clueIndex = state.clueIndex + 1;
      return clueIndex >= episode.clues.length ? { ...state, phase:ROUND_PHASES.COMPLETE } : { ...state, phase:ROUND_PHASES.READY, clueIndex, revealIndex:0, result:null };
    }
    case 'RESTART': return createInitialState(episode);
    default: return state;
  }
}
