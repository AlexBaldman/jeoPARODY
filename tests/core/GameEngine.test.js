import {
  GameEngine,
  GAME_CONFIG,
  GAME_PHASES,
  createGameState,
} from '@/core/GameEngine.js';

function createBus() {
  const handlers = new Map();
  const events = [];
  return {
    events,
    on(type, handler) {
      const list = handlers.get(type) || [];
      list.push(handler);
      handlers.set(type, list);
    },
    emit(type, payload) {
      events.push({ type, payload });
      for (const handler of handlers.get(type) || []) handler(payload);
    },
  };
}

function createHarness() {
  const bus = createBus();
  const timers = new Map();
  let nextTimerId = 1;
  let now = 1000;

  const engine = new GameEngine(createGameState(), {
    bus,
    now: () => now,
    scheduleTimeout(handler, delay) {
      const id = nextTimerId++;
      timers.set(id, { handler, delay });
      return id;
    },
    cancelTimeout(id) {
      timers.delete(id);
    },
  });

  return {
    engine,
    bus,
    timers,
    advance(ms) {
      now += ms;
    },
    fireOnlyTimer() {
      const [[id, timer]] = timers.entries();
      timers.delete(id);
      timer.handler();
    },
  };
}

const clue = {
  id: 'chicago-1893',
  category: 'History',
  question: 'This city hosted the 1893 World Columbian Exposition.',
  answer: 'What is Chicago?',
  value: '$400',
};

describe('Main GameEngine domain contract', () => {
  test('correct answers add authored clue value and use the canonical judge', () => {
    const h = createHarness();
    h.engine.startGame();
    h.engine.loadQuestion(clue);
    h.advance(2200);

    const result = h.engine.submitAnswer('Chicago');

    expect(result).toMatchObject({
      isCorrect: true,
      timedOut: false,
      score: {
        clueValue: 400,
        previousScore: 0,
        newScore: 400,
        scoreDelta: 400,
      },
    });
    expect(h.engine.state.score.current).toBe(400);
    expect(h.engine.state.score.streak).toBe(1);
    expect(h.engine.state.session.phase).toBe(GAME_PHASES.RESULT);
    expect(h.timers.size).toBe(0);
  });

  test('incorrect answers reset score and streak to match approved donor parity', () => {
    const h = createHarness();
    h.engine.startGame();
    h.engine.loadQuestion(clue);
    h.engine.submitAnswer('Chicago');

    h.engine.loadQuestion({ ...clue, id: 'second', value: '$800' });
    const result = h.engine.submitAnswer('Boston');

    expect(result).toMatchObject({
      isCorrect: false,
      score: {
        previousScore: 400,
        newScore: 0,
        scoreDelta: -400,
      },
    });
    expect(h.engine.state.score.current).toBe(0);
    expect(h.engine.state.score.streak).toBe(0);
    expect(h.engine.state.score.high).toBe(400);
  });

  test('question timeout is event-driven rather than frame-loop driven', () => {
    const h = createHarness();
    h.engine.startGame();
    h.engine.loadQuestion(clue);

    expect(h.timers.size).toBe(1);
    expect([...h.timers.values()][0].delay).toBe(GAME_CONFIG.TIME_LIMIT);

    h.advance(GAME_CONFIG.TIME_LIMIT);
    h.fireOnlyTimer();

    expect(h.engine.state.session.phase).toBe(GAME_PHASES.RESULT);
    expect(h.engine.state.stats.questionsAnswered).toBe(1);
    expect(h.bus.events.some(({ type }) => type === 'game:time-up')).toBe(true);
  });

  test('state is serializable and no longer contains Set-based achievement truth', () => {
    const h = createHarness();
    h.engine.startGame();
    h.engine.loadQuestion(clue);
    h.engine.submitAnswer('Chicago');

    const snapshot = h.engine.getState();
    expect(Array.isArray(snapshot.stats.achievements)).toBe(true);
    expect(() => JSON.stringify(snapshot)).not.toThrow();
  });

  test('content fetching and frame-loop phase methods are not engine responsibilities', () => {
    const h = createHarness();
    expect(h.engine.handleNewQuestionRequest).toBeUndefined();
    expect(h.engine.gameLoop).toBeUndefined();
    expect(h.engine.updateAnsweringPhase).toBeUndefined();
    expect(h.engine.updateResultPhase).toBeUndefined();
  });
});
