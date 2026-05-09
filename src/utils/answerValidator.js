/**
 * Compatibility wrapper for older imports.
 *
 * Canonical answer matching lives in `src/utils/validators.js`.
 */

import {
  checkAnswer,
  cleanAnswer as cleanCanonicalAnswer,
  compareAnswersDetailed
} from './validators.js';

/**
 * Compare user answer with correct answer.
 * @param {string} userAnswer - The user's answer
 * @param {string} correctAnswer - The correct answer
 * @returns {boolean} Whether the answer is correct
 */
export function compareAnswers(userAnswer, correctAnswer) {
  return checkAnswer(userAnswer, correctAnswer);
}

/**
 * Clean answer using the canonical compact normalizer.
 * @param {string} answer - Answer to clean
 * @returns {string} Cleaned answer
 */
export function cleanAnswer(answer) {
  return cleanCanonicalAnswer(answer);
}

export { compareAnswersDetailed };

/**
 * Get a cheeky label for answer-peeking attempts.
 * @returns {string} Label
 */
export function getRandomInsult() {
  const labels = [
    'scallywag',
    'rascal',
    'rule-bender',
    'answer-peeker',
    'shortcut artist',
    'question dodger',
    'trivia bandit',
    'scoreboard schemer'
  ];

  return labels[Math.floor(Math.random() * labels.length)];
}

/**
 * Get a cheeky comment for peeking at answers.
 * @returns {string} Comment
 */
export function getCheekyComment() {
  const comments = [
    'Nice try. Peeking at answers does not count.',
    'Already saw the answer? That is a zero-point special.',
    'Suddenly you know it? Suspicious timing.',
    'No credit after the reveal.',
    'The scoreboard saw that.',
    'Next clue is your redemption arc.'
  ];

  return comments[Math.floor(Math.random() * comments.length)];
}
