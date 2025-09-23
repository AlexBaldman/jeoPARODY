import { AnswerValidator } from '@/core/validation.js';

describe('AnswerValidator', () => {
  const validator = new AnswerValidator();

  test('exact and normalized matches pass', () => {
    const res1 = validator.validate('Paris', 'Paris');
    const res2 = validator.validate(' the   united states ', 'United States');
    expect(res1.isCorrect).toBe(true);
    expect(res2.isCorrect).toBe(true);
  });

  test('plural variations pass', () => {
    const res = validator.validate('city', 'cities');
    expect(res.isCorrect).toBe(true);
  });

  test('abbreviation variations pass', () => {
    const res = validator.validate('US', 'United States');
    expect(res.isCorrect).toBe(true);
  });

  test('numeric answers match by value', () => {
    const res = validator.validate('1,000', '1000');
    expect(res.isCorrect).toBe(true);
  });
});

