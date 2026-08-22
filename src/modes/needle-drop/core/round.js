import { claimBuzz, createPlayers, recordPlayerAttempt } from './party.js';

export const ROUND_PHASES = Object.freeze({
  READY: 'ready',
  LISTENING: 'listening',
  ANSWERING: 'answering',
  RESOLVED: 'resolved',
  COMPLETE: 'complete',
});

export function normalizeAnswer(value = '') {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/^(the|a|an)\s+/, '')
    .replace(/\s+/g, ' ');
}

export function isAcceptedAnswer(answer, acceptedAnswers) {
  const normalized = normalizeAnswer(answer);
  return normalized.length > 0
    && acceptedAnswers.some(candidate => normalizeAnswer(candidate) === normalized);
}

export function scoreForReveal(reveal, streak = 0) {
  return Math.max(0, reveal.points + Math.min(streak, 4) * 50);
}

export function currentClueAttempts(state, clueId) {
  return state.attempts.filter(attempt => attempt.clueId === clueId);
}

export function createInitialState(episode, options = {}) {
  const players = createPlayers(options.playerCount);

  return {
    phase: ROUND_PHASES.READY,
    episodeId: episode.id,
    clueIndex: 0,
    revealIndex: 0,
    listenedRevealIndex: -1,
    score: 0,
    streak: 0,
    correct: 0,
    players,
    activePlayerId: null,
    blockedPlayerIds: [],
    attempts: [],
    lastAttempt: null,
    result: null,
    audioError: null,
  };
}

function resolveMiss(state, attempt) {
  return {
    ...state,
    phase: ROUND_PHASES.RESOLVED,
    activePlayerId: null,
    result: { ...attempt, exhausted: true },
    lastAttempt: attempt,
  };
}

export function reduceRound(state, action, episode) {
  const clue = episode.clues[state.clueIndex];

  switch (action.type) {
    case 'PLAY_REVEAL': {
      const canPlay = [ROUND_PHASES.READY, ROUND_PHASES.ANSWERING].includes(state.phase)
        && !state.activePlayerId;
      if (!canPlay) return state;
      return { ...state, phase: ROUND_PHASES.LISTENING, audioError: null };
    }

    case 'REVEAL_FINISHED': {
      if (state.phase !== ROUND_PHASES.LISTENING) return state;
      const soloPlayer = state.players.length === 1 ? state.players[0] : null;
      const soloCanAnswer = soloPlayer && !state.blockedPlayerIds.includes(soloPlayer.id);

      return {
        ...state,
        phase: ROUND_PHASES.ANSWERING,
        listenedRevealIndex: Math.max(state.listenedRevealIndex, state.revealIndex),
        activePlayerId: soloCanAnswer ? soloPlayer.id : null,
      };
    }

    case 'AUDIO_FAILED':
      if (state.phase !== ROUND_PHASES.LISTENING) return state;
      return {
        ...state,
        phase: ROUND_PHASES.READY,
        audioError: action.message || 'Audio could not be played. Try again.',
      };

    case 'BUZZ': {
      if (state.phase !== ROUND_PHASES.ANSWERING) return state;
      const activePlayerId = claimBuzz(
        state.players,
        state.activePlayerId,
        action.playerId,
        state.blockedPlayerIds,
      );
      if (activePlayerId === state.activePlayerId) return state;
      return { ...state, activePlayerId, lastAttempt: null };
    }

    case 'MORE_AUDIO': {
      const heardCurrentReveal = state.listenedRevealIndex >= state.revealIndex;
      const canBuy = state.phase === ROUND_PHASES.ANSWERING
        && heardCurrentReveal
        && !state.activePlayerId
        && state.revealIndex < clue.reveals.length - 1;
      if (!canBuy) return state;

      return {
        ...state,
        revealIndex: state.revealIndex + 1,
        phase: ROUND_PHASES.READY,
        activePlayerId: null,
        blockedPlayerIds: [],
        lastAttempt: null,
        audioError: null,
      };
    }

    case 'PASS':
    case 'SUBMIT_ANSWER': {
      if (state.phase !== ROUND_PHASES.ANSWERING || !state.activePlayerId) return state;

      const player = state.players.find(item => item.id === state.activePlayerId);
      if (!player || state.blockedPlayerIds.includes(player.id)) return state;

      const passed = action.type === 'PASS';
      const accepted = !passed && isAcceptedAnswer(action.answer, clue.acceptedAnswers);
      const points = accepted ? scoreForReveal(clue.reveals[state.revealIndex], player.streak) : 0;
      const attempt = {
        clueId: clue.id,
        playerId: player.id,
        answer: passed ? '' : String(action.answer).trim(),
        accepted,
        passed,
        revealIndex: state.revealIndex,
        points,
      };
      const players = recordPlayerAttempt(state.players, player.id, attempt);
      const attempts = [...state.attempts, attempt];

      if (accepted) {
        return {
          ...state,
          phase: ROUND_PHASES.RESOLVED,
          score: state.score + points,
          streak: state.players.length === 1 ? player.streak + 1 : state.streak,
          correct: state.correct + 1,
          players,
          activePlayerId: null,
          attempts,
          lastAttempt: attempt,
          result: attempt,
        };
      }

      const blockedPlayerIds = [...state.blockedPlayerIds, player.id];
      const everyoneMissed = blockedPlayerIds.length === state.players.length;
      const isLastReveal = state.revealIndex === clue.reveals.length - 1;
      const nextState = {
        ...state,
        streak: state.players.length === 1 ? 0 : state.streak,
        players,
        activePlayerId: null,
        blockedPlayerIds,
        attempts,
        lastAttempt: attempt,
      };

      return everyoneMissed && isLastReveal ? resolveMiss(nextState, attempt) : nextState;
    }

    case 'GIVE_UP': {
      const hasHeardAudio = state.listenedRevealIndex >= 0;
      const canGiveUp = state.phase === ROUND_PHASES.ANSWERING
        && hasHeardAudio
        && !state.activePlayerId;
      if (!canGiveUp) return state;

      const attempt = {
        clueId: clue.id,
        playerId: null,
        answer: '',
        accepted: false,
        revealIndex: state.revealIndex,
        points: 0,
        gaveUp: true,
      };

      return resolveMiss({
        ...state,
        streak: state.players.length === 1 ? 0 : state.streak,
        attempts: [...state.attempts, attempt],
      }, attempt);
    }

    case 'NEXT_CLUE': {
      if (state.phase !== ROUND_PHASES.RESOLVED) return state;
      const clueIndex = state.clueIndex + 1;
      if (clueIndex >= episode.clues.length) return { ...state, phase: ROUND_PHASES.COMPLETE };

      return {
        ...state,
        phase: ROUND_PHASES.READY,
        clueIndex,
        revealIndex: 0,
        listenedRevealIndex: -1,
        activePlayerId: null,
        blockedPlayerIds: [],
        lastAttempt: null,
        result: null,
        audioError: null,
      };
    }

    case 'RESTART':
      return createInitialState(episode, { playerCount: state.players.length });

    default:
      return state;
  }
}
