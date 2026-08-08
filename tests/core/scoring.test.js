import { ScoreCalculator, ScoreTracker } from '@/core/scoring.js';
import { GAME_PHASES, GameEngine, createGameState } from '@/core/GameEngine.js';
import { eventBus, GAME_EVENTS } from '@/utils/events.js';

describe('ScoreCalculator', () => {
  test('calculates correct score with time and streak bonuses', () => {
    const score = ScoreCalculator.calculateCorrectScore({
      baseValue: 200,
      timeElapsed: 3000, // 3s => bonus = 500 - (3*10) = 470
      streak: 5,         // threshold 5 => multiplier 1.5 => +100
      difficulty: 'hard' // x1.5
    });
    // base 200 + time 470 + streak 100 = 770; x1.5 = 1155
    expect(score).toBe(1155);
  });

  test('uses clue value as the default score basis when no time is supplied', () => {
    const score = ScoreCalculator.calculateCorrectScore({
      baseValue: 400,
      streak: 0,
      difficulty: 'medium'
    });
    expect(score).toBe(400);
  });

  test('returns 0 for peekUsed on correct', () => {
    const score = ScoreCalculator.calculateCorrectScore({ baseValue: 400, peekUsed: true });
    expect(score).toBe(0);
  });

  test('incorrect score applies penalty and peek doubles it', () => {
    const normal = ScoreCalculator.calculateIncorrectScore({ baseValue: 200 });
    const peeked = ScoreCalculator.calculateIncorrectScore({ baseValue: 200, peekUsed: true });
    expect(normal).toBe(-100); // 200 * 0.5
    expect(peeked).toBe(-200); // doubled
  });

  test('time bonus never negative', () => {
    const bonus = ScoreCalculator.calculateTimeBonus(60000); // 60s => would be negative
    expect(bonus).toBe(0);
  });

  test('calculates streak bonus correctly', () => {
    expect(ScoreCalculator.calculateStreakBonus(0, 100)).toBe(0);
    expect(ScoreCalculator.calculateStreakBonus(2, 100)).toBe(0);
    expect(ScoreCalculator.calculateStreakBonus(3, 100)).toBe(25); // 100 * (1.25 - 1)
    expect(ScoreCalculator.calculateStreakBonus(4, 100)).toBe(25); // Still 100 * (1.25 - 1)
    expect(ScoreCalculator.calculateStreakBonus(5, 100)).toBe(50); // 100 * (1.5 - 1)
    expect(ScoreCalculator.calculateStreakBonus(9, 100)).toBe(50); // Still 100 * (1.5 - 1)
    expect(ScoreCalculator.calculateStreakBonus(10, 100)).toBe(100); // 100 * (2 - 1)
  });

  test('gets difficulty multiplier correctly', () => {
    expect(ScoreCalculator.getDifficultyMultiplier('easy')).toBe(0.8);
    expect(ScoreCalculator.getDifficultyMultiplier('medium')).toBe(1.0);
    expect(ScoreCalculator.getDifficultyMultiplier('hard')).toBe(1.5);
    expect(ScoreCalculator.getDifficultyMultiplier('expert')).toBe(2.0);
    expect(ScoreCalculator.getDifficultyMultiplier('unknown')).toBe(1.0); // Default to medium
  });

  describe('calculateRoundScore', () => {
    test('calculates correct round score with breakdown', () => {
      const roundData = {
        isCorrect: true,
        baseValue: 200,
        timeElapsed: 3000,
        streak: 5,
        difficulty: 'hard',
        peekUsed: false
      };
      const result = ScoreCalculator.calculateRoundScore(roundData);
      // base 200 + time 470 + streak 100 = 770; x1.5 = 1155
      expect(result.total).toBe(1155);
      expect(result.breakdown.base).toBe(200);
      expect(result.breakdown.timeBonus).toBe(470);
      expect(result.breakdown.streakBonus).toBe(100);
      expect(result.breakdown.difficultyBonus).toBe(385); // 1155 - (200 + 470 + 100)
      expect(result.breakdown.penalty).toBe(0);
    });

    test('calculates incorrect round score with breakdown', () => {
      const roundData = {
        isCorrect: false,
        baseValue: 200,
        peekUsed: false
      };
      const result = ScoreCalculator.calculateRoundScore(roundData);
      expect(result.total).toBe(-100);
      expect(result.breakdown.base).toBe(0);
      expect(result.breakdown.timeBonus).toBe(0);
      expect(result.breakdown.streakBonus).toBe(0);
      expect(result.breakdown.difficultyBonus).toBe(0);
      expect(result.breakdown.penalty).toBe(-100);
    });

    test('calculates incorrect round score with peekUsed', () => {
      const roundData = {
        isCorrect: false,
        baseValue: 200,
        peekUsed: true
      };
      const result = ScoreCalculator.calculateRoundScore(roundData);
      expect(result.total).toBe(-200);
      expect(result.breakdown.penalty).toBe(-200);
    });

    test('calculates correct round score with peekUsed (total 0)', () => {
      const roundData = {
        isCorrect: true,
        baseValue: 200,
        timeElapsed: 3000,
        streak: 5,
        difficulty: 'hard',
        peekUsed: true
      };
      const result = ScoreCalculator.calculateRoundScore(roundData);
      expect(result.total).toBe(0);
      expect(result.breakdown.base).toBe(0);
      expect(result.breakdown.timeBonus).toBe(0);
      expect(result.breakdown.streakBonus).toBe(0);
      expect(result.breakdown.difficultyBonus).toBe(0); // Should be 0 when peekUsed
      expect(result.breakdown.penalty).toBe(0);
    });
  });
});

describe('ScoreTracker', () => {
  test('updates streak, best streak, totals, and accuracy', () => {
    const tracker = new ScoreTracker();

    tracker.updateStreak(true);
    tracker.updateStreak(true);
    tracker.updateStreak(false);
    tracker.updateStreak(true);

    expect(tracker.currentStreak).toBe(1);
    expect(tracker.bestStreak).toBe(2);
    expect(tracker.totalCorrect).toBe(3);
    expect(tracker.totalQuestions).toBe(4);
    expect(tracker.getAccuracy()).toBe(75);
  });

  test('floors total score at zero when penalties exceed current score', () => {
    const tracker = new ScoreTracker();

    tracker.addScore(200);
    tracker.addScore(-500);

    expect(tracker.currentScore).toBe(0);
    expect(tracker.scoreHistory).toHaveLength(2);
    expect(tracker.scoreHistory[1].points).toBe(-500);
  });
});

describe('GameEngine scoring convergence', () => {
  function createEngineWithQuestion({ value = 400, difficulty = 'normal', streak = 0 } = {}) {
    const state = createGameState();
    state.session.difficulty = difficulty;
    state.question.data = {
      id: 'test-clue',
      question: 'A test clue',
      answer: 'test',
      value
    };
    state.score.streak = streak;
    return new GameEngine(state);
  }

  test('uses ScoreCalculator with clue value instead of hardcoded engine points', () => {
    const engine = createEngineWithQuestion({ value: 400, difficulty: 'normal', streak: 0 });

    const score = engine.calculateScore(true, null, false);

    expect(score.total).toBe(400);
    expect(score.base).toBe(400);
    expect(score.timeBonus).toBe(0);
    expect(score.streakBonus).toBe(0);
  });

  test('parses string clue values and maps normal difficulty to medium', () => {
    const engine = createEngineWithQuestion({ value: '$600', difficulty: 'normal', streak: 0 });

    const score = engine.calculateScore(true, 3000, false);

    expect(score.total).toBe(1070); // base 600 + time bonus 470
    expect(score.base).toBe(600);
    expect(score.timeBonus).toBe(470);
  });

  test('applies the 3-streak bonus on the answer that reaches the threshold', () => {
    const engine = createEngineWithQuestion({ value: 400, difficulty: 'normal', streak: 2 });

    const score = engine.calculateScore(true, null, false);

    expect(score.total).toBe(500);
    expect(score.streakBonus).toBe(100);
  });

  test('uses ScoreCalculator penalties and floors the engine running score at zero', () => {
    const engine = createEngineWithQuestion({ value: 400, difficulty: 'normal' });

    const score = engine.calculateScore(false, 1000, false);
    engine.updateScore(score);

    expect(score.total).toBe(-200);
    expect(score.penalty).toBe(-200);
    expect(engine.state.score.current).toBe(0);
    expect(engine.state.score.streak).toBe(0);
  });

  test('publishes the canonical question-loaded event when a question enters the engine', () => {
    const engine = createEngineWithQuestion();
    const observed = [];
    const unsubscribe = eventBus.on(GAME_EVENTS.QUESTION_LOADED, (event) => observed.push(event));
    const question = { id: 'next-clue', question: 'Next?', answer: 'Yes', value: 200 };

    engine.loadQuestion(question);
    unsubscribe();

    expect(observed).toHaveLength(1);
    expect(observed[0]).toEqual(expect.objectContaining({
      event: GAME_EVENTS.QUESTION_LOADED,
      question,
      difficulty: 'normal'
    }));
  });

  test('keeps the settled result phase stable without per-frame result work', () => {
    const engine = createEngineWithQuestion();
    engine.state.session.phase = GAME_PHASES.RESULT;

    expect(() => engine.update(16)).not.toThrow();
  });
});
