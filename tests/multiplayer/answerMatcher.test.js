import {
  calculateSimilarity,
  isAnswerAccepted,
} from '../../src/modes/head-to-head/core/answerMatcher.js';

describe('head-to-head answer matcher', () => {
  test('uses canonical Jeopardy-style normalization', () => {
    expect(isAnswerAccepted('What is Saturn?', 'Saturn')).toBe(true);
    expect(isAnswerAccepted('SATURN!', 'Saturn')).toBe(true);
  });

  test('accepts safe spelling variation while retaining similarity diagnostics', () => {
    expect(calculateSimilarity('Shakespear', 'Shakespeare')).toBeGreaterThanOrEqual(0.8);
    expect(isAnswerAccepted('Shakespear', 'Shakespeare')).toBe(true);
  });

  test('rejects dangerous near misses and blanks', () => {
    expect(isAnswerAccepted('Iran', 'Iraq')).toBe(false);
    expect(isAnswerAccepted('', 'Saturn')).toBe(false);
  });
});
