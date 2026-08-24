import { HeadToHeadHost } from '../../src/modes/head-to-head/HeadToHeadHost.js';
import {
  addPlayer,
  createMatchState,
  setPlayerReady,
} from '../../src/modes/head-to-head/core/match.js';

class FakeGateway {
  constructor(secret) {
    this.secret = secret;
    this.published = [];
    this.processed = [];
  }

  subscribeCommands() {
    return () => {};
  }

  async publishRoom(_roomId, state) {
    this.published.push(state);
  }

  async setHostSecret(_roomId, secret) {
    this.secret = secret;
  }

  async getHostSecret() {
    return this.secret;
  }

  async markCommandProcessed(_roomId, commandId) {
    this.processed.push(commandId);
  }
}

function readyLobby() {
  let state = createMatchState({
    roomId: 'room-1',
    joinCode: 'B7K9P',
    host: { id: 'host', nickname: 'Host' },
    totalRounds: 1,
  });
  state = addPlayer(state, { id: 'guest', nickname: 'Guest' });
  state = setPlayerReady(state, 'host', true);
  return setPlayerReady(state, 'guest', true);
}

describe('HeadToHeadHost authority', () => {
  test('keeps adjudication private until both players submit', async () => {
    const gateway = new FakeGateway();
    const host = new HeadToHeadHost({
      roomId: 'room-1',
      hostId: 'host',
      gateway,
      initialState: readyLobby(),
      questionProvider: async () => ({
        id: 'q1',
        question: 'Largest planet?',
        answer: 'Jupiter',
        category: 'Space',
        value: 400,
      }),
    });

    await host.handleCommand({ id: 'c1', actorId: 'host', type: 'START' });
    await host.handleCommand({
      id: 'c2',
      actorId: 'host',
      type: 'SUBMIT_ANSWER',
      payload: { answer: 'Jupiter' },
    });

    const firstSubmission = gateway.published.at(-1);
    expect(firstSubmission.round.submittedPlayerIds).toEqual(['host']);
    expect(firstSubmission.round.outcomes).toEqual({});
    expect(firstSubmission.players.find(player => player.id === 'host').score).toBe(0);
    expect(JSON.stringify(firstSubmission)).not.toContain('Jupiter');

    await host.handleCommand({
      id: 'c3',
      actorId: 'guest',
      type: 'SUBMIT_ANSWER',
      payload: { answer: 'Mars' },
    });

    const final = gateway.published.at(-1);
    expect(final.round.question.prompt).toBe('Largest planet?');
    expect(final.round.answerReveal).toBe('Jupiter');
    expect(final.round.outcomes.host.isCorrect).toBe(true);
    expect(final.round.outcomes.guest.isCorrect).toBe(false);
    expect(final.players.find(player => player.id === 'host').score).toBe(400);
    expect(JSON.stringify(final)).not.toContain('"answer":"Jupiter"');
    expect(gateway.processed).toEqual(['c1', 'c2', 'c3']);
  });
});
