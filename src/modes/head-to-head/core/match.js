export const MATCH_PHASES = Object.freeze({
  LOBBY: 'lobby',
  PLAYING: 'playing',
  ROUND_RESULT: 'round-result',
  COMPLETE: 'complete',
});

export const DEFAULT_ROUND_COUNT = 5;
export const MAX_PLAYERS = 2;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function requirePlayer(state, playerId) {
  if (!state.players.some(player => player.id === playerId)) {
    throw new Error('Player is not in this match.');
  }
}

export function createMatchState({
  roomId,
  joinCode,
  host,
  totalRounds = DEFAULT_ROUND_COUNT,
}) {
  if (!roomId || !joinCode || !host?.id) {
    throw new Error('roomId, joinCode, and host are required.');
  }

  return {
    schemaVersion: 1,
    roomId,
    joinCode,
    hostId: host.id,
    phase: MATCH_PHASES.LOBBY,
    revision: 0,
    totalRounds,
    roundIndex: -1,
    players: [{
      id: host.id,
      nickname: host.nickname,
      ready: false,
      score: 0,
    }],
    round: null,
    winnerIds: [],
  };
}

export function addPlayer(state, player) {
  if (state.phase !== MATCH_PHASES.LOBBY) return state;
  if (!player?.id || !player?.nickname) return state;
  if (state.players.some(existing => existing.id === player.id)) return state;
  if (state.players.length >= MAX_PLAYERS) {
    throw new Error('This head-to-head room is full.');
  }

  const next = clone(state);
  next.players.push({
    id: player.id,
    nickname: player.nickname,
    ready: false,
    score: 0,
  });
  next.revision += 1;
  return next;
}

export function setPlayerReady(state, playerId, ready) {
  if (state.phase !== MATCH_PHASES.LOBBY) return state;
  requirePlayer(state, playerId);

  const next = clone(state);
  const player = next.players.find(item => item.id === playerId);
  player.ready = Boolean(ready);
  next.revision += 1;
  return next;
}

export function canStartMatch(state) {
  return state.phase === MATCH_PHASES.LOBBY
    && state.players.length === MAX_PLAYERS
    && state.players.every(player => player.ready);
}

export function openRound(state, question) {
  const allowed = state.phase === MATCH_PHASES.LOBBY
    ? canStartMatch(state)
    : state.phase === MATCH_PHASES.ROUND_RESULT;

  if (!allowed) {
    throw new Error('Match cannot open a new round from the current phase.');
  }

  const nextIndex = state.roundIndex + 1;
  if (nextIndex >= state.totalRounds) {
    return finishMatch(state);
  }

  const next = clone(state);
  next.phase = MATCH_PHASES.PLAYING;
  next.roundIndex = nextIndex;
  next.round = {
    index: nextIndex,
    question: {
      id: question.id,
      prompt: question.prompt,
      category: question.category || 'General Knowledge',
      value: question.value,
    },
    outcomes: {},
    answerReveal: null,
  };
  next.revision += 1;
  return next;
}

export function recordOutcome(state, {
  playerId,
  isCorrect,
  points,
}) {
  if (state.phase !== MATCH_PHASES.PLAYING || !state.round) return state;
  requirePlayer(state, playerId);
  if (state.round.outcomes[playerId]) return state;

  const next = clone(state);
  const awarded = isCorrect ? Math.max(0, Number(points) || 0) : 0;
  next.round.outcomes[playerId] = {
    isCorrect: Boolean(isCorrect),
    points: awarded,
  };

  if (awarded > 0) {
    const player = next.players.find(item => item.id === playerId);
    player.score += awarded;
  }

  next.revision += 1;
  return next;
}

export function hasEveryOutcome(state) {
  if (!state.round) return false;
  return state.players.length === MAX_PLAYERS
    && state.players.every(player => Boolean(state.round.outcomes[player.id]));
}

export function revealRound(state, answerReveal) {
  if (state.phase !== MATCH_PHASES.PLAYING || !hasEveryOutcome(state)) {
    throw new Error('Round cannot be revealed until both players have answered.');
  }

  const next = clone(state);
  next.phase = MATCH_PHASES.ROUND_RESULT;
  next.round.answerReveal = String(answerReveal || '');
  next.revision += 1;
  return next;
}

export function finishMatch(state) {
  const next = clone(state);
  const highScore = Math.max(...next.players.map(player => player.score), 0);
  next.phase = MATCH_PHASES.COMPLETE;
  next.winnerIds = next.players
    .filter(player => player.score === highScore)
    .map(player => player.id);
  next.revision += 1;
  return next;
}
