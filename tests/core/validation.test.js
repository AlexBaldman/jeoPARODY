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

  test('numeric answers with different formatting match', () => {
    const res = validator.validate('1.000', '1000'); // Assuming locale-aware or just stripping non-digits
    expect(res.isCorrect).toBe(true);
  });

  describe('calculateConfidence', () => {
    test('returns 1.0 for exact matches', () => {
      expect(validator.calculateConfidence('Paris', 'Paris')).toBe(1.0);
      expect(validator.calculateConfidence('  paris  ', 'Paris')).toBe(1.0);
    });

    test('returns similarity for non-exact matches', () => {
      // This depends on calculateSimilarity, so we'll test that directly too
      const similarity = validator.calculateSimilarity('Pariss', 'Paris');
      expect(validator.calculateConfidence('Pariss', 'Paris')).toBeCloseTo(similarity);
    });
  });

  describe('calculateSimilarity', () => {
    test('returns 1.0 for identical strings', () => {
      expect(validator.calculateSimilarity('apple', 'apple')).toBe(1.0);
    });

    test('returns correct similarity for partial matches', () => {
      // 'apple' vs 'aple': longer is 'apple' (5 chars). 'aple' has 4 chars. All 4 are in 'apple'. 4/5 = 0.8
      expect(validator.calculateSimilarity('apple', 'aple')).toBe(0.8);
      // 'apple' vs 'banana': longer is 'banana' (6 chars). 'apple' has 5 chars. 'a', 'p', 'l', 'e' are in 'banana'. 4/6 = 0.666...
      // The current implementation is very basic: it checks if *any* char from shorter is in longer.
      // Let's re-evaluate the expected behavior based on the current implementation.
      // 'apple' (5) vs 'banana' (6)
      // a in banana? yes
      // p in banana? no
      // p in banana? no
      // l in banana? no
      // e in banana? yes
      // Matches = 2. Longer length = 6. Similarity = 2/6 = 0.333...
      expect(validator.calculateSimilarity('apple', 'banana')).toBeCloseTo(0.333, 3);
      expect(validator.calculateSimilarity('test', 'text')).toBe(0.75); // t, e, t in text. 3/4
    });

    test('returns 0 for no common characters', () => {
      expect(validator.calculateSimilarity('abc', 'xyz')).toBe(0);
    });

    test('returns 1.0 for empty strings', () => {
      expect(validator.calculateSimilarity('', '')).toBe(1.0);
    });
  });

  describe('generateFeedback', () => {
    test('generates correct feedback for correct answer', () => {
      const feedback = validator.generateFeedback(true, 'Paris', 'Paris');
      expect(feedback.type).toBe('correct');
      expect(typeof feedback.message).toBe('string');
    });

    test('generates incorrect feedback for incorrect answer', () => {
      const feedback = validator.generateFeedback(false, 'London', 'Paris');
      expect(feedback.type).toBe('incorrect');
      expect(typeof feedback.message).toBe('string');
    });
  });

  describe('generateCorrectFeedback', () => {
    test('returns a correct feedback object', () => {
      const feedback = validator.generateCorrectFeedback();
      expect(feedback).toHaveProperty('type', 'correct');
      expect(typeof feedback.message).toBe('string');
      expect(feedback).toHaveProperty('tone');
    });
  });

  describe('generateIncorrectFeedback', () => {
    test('returns incorrect feedback for very close answer', () => {
      const feedback = validator.generateIncorrectFeedback('Pariss', 'Paris');
      expect(feedback.type).toBe('incorrect');
      expect(feedback.message).toBe('So close! You were on the right track.');
      expect(typeof feedback.hint).toBe('string');
    });

    test('returns incorrect feedback for somewhat close answer', () => {
      const feedback = validator.generateIncorrectFeedback('London', 'Londen'); // Similarity > 0.4
      expect(feedback.type).toBe('incorrect');
      expect(feedback.message).toBe('Not quite, but I see where you were going.');
      expect(feedback.hint).toBeNull();
    });

    test('returns incorrect feedback for not close answer', () => {
      const feedback = validator.generateIncorrectFeedback('Apple', 'Orange'); // Similarity < 0.4
      expect(feedback.type).toBe('incorrect');
      expect(typeof feedback.message).toBe('string');
      expect(feedback.hint).toBeNull();
    });
  });

  describe('getRandomIncorrectMessage', () => {
    test('returns a string message', () => {
      const message = validator.getRandomIncorrectMessage();
      expect(typeof message).toBe('string');
      expect(message.length).toBeGreaterThan(0);
    });
  });

  describe('generateHint', () => {
    test('returns spelling hint for likely spelling error', () => {
      expect(validator.generateHint('Pariss', 'Paris')).toBe('Check your spelling!');
    });

    test('returns plural hint for plural/singular mismatch', () => {
      expect(validator.generateHint('city', 'cities')).toBe('Think about singular vs plural.');
      expect(validator.generateHint('cities', 'city')).toBe('Think about singular vs plural.');
    });

    test('returns word count hint for missing words', () => {
      expect(validator.generateHint('United', 'United States')).toBe('The answer has 2 words.');
    });

    test('returns null for no specific hint', () => {
      expect(validator.generateHint('London', 'Paris')).toBeNull();
    });
  });

  describe('isLikelySpellingError', () => {
    test('identifies likely spelling errors', () => {
      expect(validator.isLikelySpellingError('Pariss', 'Paris')).toBe(true);
      expect(validator.isLikelySpellingError('apple', 'aple')).toBe(true);
      expect(validator.isLikelySpellingError('recieve', 'receive')).toBe(true);
    });

    test('does not identify non-spelling errors', () => {
      expect(validator.isLikelySpellingError('apple', 'banana')).toBe(false);
      expect(validator.isLikelySpellingError('longword', 'short')).toBe(false);
    });
  });

  describe('getStats', () => {
    test('returns correct statistics', () => {
      const tempValidator = new AnswerValidator();
      tempValidator.validate('Paris', 'Paris');
      tempValidator.validate('London', 'Paris');
      tempValidator.validate('New York', 'New York');

      const stats = tempValidator.getStats();
      expect(stats.totalValidations).toBe(3);
      expect(stats.correctAnswers).toBe(2);
      expect(stats.accuracy).toBe(67); // 2/3 * 100 rounded
      expect(stats.averageProcessingTime).toBeGreaterThanOrEqual(0);
    });

    test('returns 0 for empty history', () => {
      const tempValidator = new AnswerValidator();
      const stats = tempValidator.getStats();
      expect(stats.totalValidations).toBe(0);
      expect(stats.correctAnswers).toBe(0);
      expect(stats.accuracy).toBe(0);
      expect(stats.averageProcessingTime).toBe(0);
    });
  });

  describe('clearHistory', () => {
    test('clears the validation history', () => {
      const tempValidator = new AnswerValidator();
      tempValidator.validate('Paris', 'Paris');
      expect(tempValidator.validationHistory.length).toBe(1);
      tempValidator.clearHistory();
      expect(tempValidator.validationHistory.length).toBe(0);
    });
  });
});

