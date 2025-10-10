import { ScoreCalculator } from '@/core/scoring.js';

describe('ScoreCalculator', () => {
  test('calculates correct score with time and streak bonuses', () => {
    const score = ScoreCalculator.calculateCorrectScore({
      baseValue: 200,
      timeElapsed: 3000, // 3s => bonus = 500 - (3*10) = 470
      streak: 5,         // threshold 5 => multiplier 2 => +200
      difficulty: 'hard' // x1.5
    });
    // base 200 + time 470 + streak 200 = 870; x1.5 = 1305
    expect(score).toBe(1305);
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
    expect(ScoreCalculator.calculateStreakBonus(3, 100)).toBe(50); // 100 * (1.5 - 1)
    expect(ScoreCalculator.calculateStreakBonus(4, 100)).toBe(50); // Still 100 * (1.5 - 1)
    expect(ScoreCalculator.calculateStreakBonus(5, 100)).toBe(100); // 100 * (2 - 1)
    expect(ScoreCalculator.calculateStreakBonus(9, 100)).toBe(100); // Still 100 * (2 - 1)
    expect(ScoreCalculator.calculateStreakBonus(10, 100)).toBe(200); // 100 * (3 - 1)
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
      // base 200 + time 470 + streak 200 = 870; x1.5 = 1305
      expect(result.total).toBe(1305);
      expect(result.breakdown.base).toBe(200);
      expect(result.breakdown.timeBonus).toBe(470);
      expect(result.breakdown.streakBonus).toBe(200);
      expect(result.breakdown.difficultyBonus).toBe(100); // (200 * 1.5) - 200 = 100
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

