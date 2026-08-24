import {
  calculateSimilarity,
  isAnswerAccepted,
} from '../../src/modes/head-to-head/core/answerMatcher.js';

describe('head-to-head answer matcher', () => {
  test('normalizes case and punctuation', () => {
    expect(isAnswerAccepted('What is Saturn?', 'Saturn')).toBe(false);
    expect(isAnswerAccepted('SATURN!', 'Saturn')).toBe(true);
  });

  test('accepts close spelling at the existing 0.8 threshold', () => {
    expect(calculateSimilarity('Shakespear', 'Shakespeare')).toBeGreaterThanOrEqual(0.8);
    expect(isAnswerAccepted('Shakespear', 'Shakespeare')).toBe(true);
  });

  test('rejects blank answers', () => {
    expect(isAnswerAccepted('', 'Saturn')).toBe(false);
  });
});
