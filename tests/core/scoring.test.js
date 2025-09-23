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
});

