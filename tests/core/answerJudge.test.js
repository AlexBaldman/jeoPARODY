import {
  cleanAnswer,
  compareAnswers,
  compareAnswersDetailed,
  getAcceptedAnswers,
} from '../../src/core/answerJudge.js';

describe('canonical answer judge', () => {
  test('normalizes Jeopardy phrasing, punctuation, ampersands, and diacritics', () => {
    expect(cleanAnswer('What is The Eiffel Tower?')).toBe('eiffeltower');
    expect(cleanAnswer('Who was an Apple?')).toBe('apple');
    expect(cleanAnswer('What is Crate & Barrel?!')).toBe('crateandbarrel');
    expect(cleanAnswer('John C. Frémont')).toBe('johncfremont');
  });

  test('accepts exact answers after normalization', () => {
    expect(compareAnswers('What is Abraham Lincoln?', 'Abraham Lincoln')).toBe(true);
    expect(compareAnswers('crate and barrel', 'Crate & Barrel')).toBe(true);
    expect(compareAnswers('John C Fremont', 'John C. Frémont')).toBe(true);
  });

  test('accepts safe typos and adjacent transpositions', () => {
    expect(compareAnswers('washngton', 'Washington')).toBe(true);
    expect(compareAnswers('recieve', 'receive')).toBe(true);

    const result = compareAnswersDetailed('washngton', 'Washington');
    expect(result).toMatchObject({
      isCorrect: true,
      reason: 'fuzzy',
      distance: 1,
    });
  });

  test('accepts archive-style alternate answers and annotations', () => {
    expect(compareAnswers('The Eiffel Tower', 'The Eiffel Tower (or La Tour Eiffel)')).toBe(true);
    expect(compareAnswers('La Tour Eiffel', 'The Eiffel Tower (or La Tour Eiffel)')).toBe(true);
    expect(compareAnswers('Sri Lanka', 'Ceylon (or Sri Lanka)')).toBe(true);
    expect(compareAnswers('England', 'Great Britain/England')).toBe(true);
    expect(compareAnswers('Uranus', 'Neptune (Uranus also accepted)')).toBe(true);
  });

  test('treats ordinary parentheticals as optional detail, not a standalone answer', () => {
    expect(getAcceptedAnswers('(Lou) Gehrig')).toEqual(['gehrig', 'lougehrig']);
    expect(compareAnswers('Gehrig', '(Lou) Gehrig')).toBe(true);
    expect(compareAnswers('Lou Gehrig', '(Lou) Gehrig')).toBe(true);
    expect(compareAnswers('Lou', '(Lou) Gehrig')).toBe(false);
    expect(compareAnswers('Lewis', 'Lewis & Clark')).toBe(false);
  });

  test('accepts narrow whole-answer aliases and simple plurals', () => {
    expect(compareAnswers('cities', 'city')).toBe(true);
    expect(compareAnswers('U.S.A.', 'United States')).toBe(true);

    expect(compareAnswersDetailed('U.S.A.', 'United States')).toMatchObject({
      isCorrect: true,
      reason: 'variation',
    });
  });

  test('rejects dangerous tiny and near-miss guesses', () => {
    expect(compareAnswers('cop', 'Copernicus')).toBe(false);
    expect(compareAnswers('a', 'Australia')).toBe(false);
    expect(compareAnswers('Iran', 'Iraq')).toBe(false);
    expect(compareAnswers('Holland', 'Poland')).toBe(false);

    expect(compareAnswersDetailed('Iran', 'Iraq')).toMatchObject({
      isCorrect: false,
      reason: 'mismatch',
      threshold: 0,
    });
  });

  test('rejects blank answers', () => {
    expect(compareAnswers('', 'Saturn')).toBe(false);
    expect(compareAnswers('Saturn', '')).toBe(false);
    expect(compareAnswersDetailed('', 'Saturn')).toMatchObject({
      isCorrect: false,
      reason: 'empty',
    });
  });
});
