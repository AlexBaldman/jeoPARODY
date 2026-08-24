function normalizeAnswer(value = '') {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ');
}

export function calculateSimilarity(left = '', right = '') {
  const a = normalizeAnswer(left);
  const b = normalizeAnswer(right);
  if (a === b) return 1;
  if (!a.length || !b.length) return 0;

  const matrix = Array.from({ length: b.length + 1 }, (_, row) => [row]);
  for (let column = 0; column <= a.length; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= b.length; row += 1) {
    for (let column = 1; column <= a.length; column += 1) {
      const cost = b[row - 1] === a[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(
        matrix[row - 1][column - 1] + cost,
        matrix[row][column - 1] + 1,
        matrix[row - 1][column] + 1,
      );
    }
  }

  const distance = matrix[b.length][a.length];
  return 1 - (distance / Math.max(a.length, b.length));
}

export function isAnswerAccepted(userAnswer, correctAnswer, threshold = 0.8) {
  if (!String(userAnswer || '').trim() || !String(correctAnswer || '').trim()) {
    return false;
  }
  return calculateSimilarity(userAnswer, correctAnswer) >= threshold;
}
