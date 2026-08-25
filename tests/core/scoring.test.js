import {
  SCORE_RULES,
  calculateScoreTransition,
  parseClueValue,
} from '@/core/scoring.js';

describe('canonical Main Game scoring', () => {
  test('parses authored numeric and display clue values', () => {
    expect(parseClueValue(400)).toBe(400);
    expect(parseClueValue('$800')).toBe(800);
    expect(parseClueValue('1,200')).toBe(1200);
    expect(parseClueValue('')).toBe(SCORE_RULES.defaultClueValue);
    expect(parseClueValue(null, 200)).toBe(200);
  });

  test('correct answers add exactly the authored clue value', () => {
    expect(calculateScoreTransition({
      isCorrect: true,
      currentScore: 600,
      clueValue: '$400',
    })).toEqual({
      isCorrect: true,
      clueValue: 400,
      previousScore: 600,
      newScore: 1000,
      scoreDelta: 400,
    });
  });

  test('incorrect answers reset score to zero to match approved donor behavior', () => {
    expect(calculateScoreTransition({
      isCorrect: false,
      currentScore: 1200,
      clueValue: '$800',
    })).toEqual({
      isCorrect: false,
      clueValue: 800,
      previousScore: 1200,
      newScore: 0,
      scoreDelta: -1200,
    });
  });

  test('timeouts are incorrect even when correctness input is true', () => {
    expect(calculateScoreTransition({
      isCorrect: true,
      timedOut: true,
      currentScore: 400,
      clueValue: 200,
    })).toMatchObject({
      isCorrect: false,
      newScore: 0,
      scoreDelta: -400,
    });
  });

  test('score never becomes negative under the default contract', () => {
    expect(calculateScoreTransition({
      isCorrect: false,
      currentScore: 0,
      clueValue: 1000,
    }).newScore).toBe(0);
  });

  test('supports a bounded subtract policy without changing the canonical default', () => {
    expect(calculateScoreTransition({
      isCorrect: false,
      currentScore: 300,
      clueValue: 400,
      rules: {
        ...SCORE_RULES,
        incorrectScoreMode: 'subtract',
      },
    }).newScore).toBe(0);
  });
});
