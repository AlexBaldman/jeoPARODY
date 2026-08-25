import {
  cleanAnswer,
  compareAnswers,
  getLevenshteinDistance,
} from '../../../core/answerJudge.js';

// Retained as an informational helper for diagnostics/tests. Correctness itself
// is owned by the shared answer judge below, not a mode-specific threshold.
export function calculateSimilarity(left = '', right = '') {
  const a = cleanAnswer(left);
  const b = cleanAnswer(right);
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;

  const distance = getLevenshteinDistance(a, b);
  return 1 - (distance / Math.max(a.length, b.length));
}

export function isAnswerAccepted(userAnswer, correctAnswer) {
  return compareAnswers(userAnswer, correctAnswer);
}
