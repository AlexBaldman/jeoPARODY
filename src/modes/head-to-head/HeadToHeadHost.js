import {
  addPlayer,
  canStartMatch,
  finishMatch,
  hasEverySubmission,
  MATCH_PHASES,
  openRound,
  recordSubmission,
  revealRound,
  setPlayerReady,
} from './core/match.js';
import { isAnswerAccepted } from './core/answerMatcher.js';

function sanitizeQuestion(question, roundIndex) {
  const rawValue = Number(question?.value);
  const value = Number.isFinite(rawValue) && rawValue > 0
    ? Math.min(2000, Math.max(100, Math.round(rawValue / 100) * 100))
    : 100;

  return {
    id: String(question?.id || `round-${roundIndex + 1}`),
    prompt: String(question?.question || question?.clue || question?.prompt || 'Mystery clue'),
    category: String(question?.category?.title || question?.category || 'General Knowledge'),
    value,
  };
}

export class HeadToHeadHost {
  constructor({
    roomId,
    hostId,
    gateway,
    questionProvider,
    initialState,
    onError = console.error,
  }) {
    this.roomId = roomId;
    this.hostId = hostId;
    this.gateway = gateway;
    this.questionProvider = questionProvider;
    this.state = initialState;
    this.onError = onError;
    this.queue = Promise.resolve();
    this.unsubscribeCommands = null;
  }

  start() {
    if (this.unsubscribeCommands) return;
    this.unsubscribeCommands = this.gateway.subscribeCommands(
      this.roomId,
      command => this.enqueue(command),
    );
  }

  stop() {
    this.unsubscribeCommands?.();
    this.unsubscribeCommands = null;
  }

  setState(state) {
    if (state) this.state = state;
  }

  enqueue(command) {
    this.queue = this.queue
      .then(() => this.handleCommand(command))
      .catch(error => this.onError(error));
    return this.queue;
  }

  async handleCommand(command) {
    try {
      const { actorId, type, payload = {} } = command;
      let next = this.state;

      switch (type) {
        case 'JOIN':
          if (actorId !== payload.player?.id) break;
          next = addPlayer(next, payload.player);
          break;

        case 'SET_READY':
          next = setPlayerReady(next, actorId, payload.ready);
          break;

        case 'START':
          if (actorId !== this.hostId || !canStartMatch(next)) break;
          next = await this.#loadRound(next);
          break;

        case 'SUBMIT_ANSWER':
          next = await this.#submitAnswer(next, actorId, payload.answer);
          break;

        case 'NEXT_ROUND':
          if (actorId !== this.hostId || next.phase !== MATCH_PHASES.ROUND_RESULT) break;
          if (next.roundIndex + 1 >= next.totalRounds) {
            next = finishMatch(next);
          } else {
            next = await this.#loadRound(next);
          }
          break;

        default:
          break;
      }

      if (next !== this.state) {
        this.state = next;
        await this.gateway.publishRoom(this.roomId, next);
      }
    } finally {
      await this.gateway.markCommandProcessed(this.roomId, command.id);
    }
  }

  async #loadRound(state) {
    const question = await this.questionProvider();
    if (!question?.answer) throw new Error('Question provider returned no answer.');

    const publicQuestion = sanitizeQuestion(question, state.roundIndex + 1);
    await this.gateway.setHostSecret(this.roomId, {
      roundIndex: state.roundIndex + 1,
      questionId: publicQuestion.id,
      answer: String(question.answer),
      outcomes: {},
    });

    return openRound(state, publicQuestion);
  }

  async #submitAnswer(state, playerId, answer) {
    if (state.phase !== MATCH_PHASES.PLAYING || !state.round) return state;
    if (!state.players.some(player => player.id === playerId)) return state;
    if (state.round.submittedPlayerIds.includes(playerId)) return state;

    const secret = await this.gateway.getHostSecret(this.roomId);
    if (!secret || secret.roundIndex !== state.roundIndex) {
      throw new Error('Host answer secret is unavailable for this round.');
    }

    const outcomes = { ...(secret.outcomes || {}) };
    if (!outcomes[playerId]) {
      const isCorrect = isAnswerAccepted(answer, secret.answer);
      outcomes[playerId] = {
        isCorrect,
        points: isCorrect ? state.round.question.value : 0,
      };
      await this.gateway.setHostSecret(this.roomId, {
        ...secret,
        outcomes,
      });
    }

    let next = recordSubmission(state, playerId);
    if (hasEverySubmission(next)) {
      next = revealRound(next, secret.answer, outcomes);
    }

    return next;
  }
}
